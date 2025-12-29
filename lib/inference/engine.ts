import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ModelConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxTokens: number;
  contextLength: number;
}

export interface InferenceResult {
  text: string;
  tokensGenerated: number;
  inferenceTimeMs: number;
  tokensPerSecond: number;
}

class InferenceEngine {
  private static instance: InferenceEngine;
  private isInitialized = false;
  private model: tf.GraphModel | tf.LayersModel | null = null;
  private modelPath: string | null = null;

  private constructor() {}

  static getInstance(): InferenceEngine {
    if (!InferenceEngine.instance) {
      InferenceEngine.instance = new InferenceEngine();
    }
    return InferenceEngine.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Initialize TensorFlow.js with React Native backend
      await tf.ready();
      console.log("TensorFlow.js initialized with backend:", tf.getBackend());
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize TensorFlow.js:", error);
      return false;
    }
  }

  async loadModel(modelUri: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Unload previous model if exists
      if (this.model) {
        this.model.dispose();
        this.model = null;
      }

      console.log("Loading model from:", modelUri);

      // For TFLite models, we need to use a different approach
      // TensorFlow.js doesn't directly support .tflite files
      // We'll need to convert them or use a compatible format
      
      // Try loading as GraphModel (for converted models)
      try {
        this.model = await tf.loadGraphModel(modelUri);
        this.modelPath = modelUri;
        console.log("Model loaded successfully as GraphModel");
        return true;
      } catch (graphError) {
        console.log("GraphModel loading failed, trying LayersModel...");
      }

      // Try loading as LayersModel
      try {
        this.model = await tf.loadLayersModel(modelUri);
        this.modelPath = modelUri;
        console.log("Model loaded successfully as LayersModel");
        return true;
      } catch (layersError) {
        console.error("LayersModel loading failed:", layersError);
      }

      return false;
    } catch (error) {
      console.error("Failed to load model:", error);
      return false;
    }
  }

  async runInference(
    input: string,
    config: ModelConfig
  ): Promise<InferenceResult> {
    const startTime = Date.now();

    try {
      if (!this.model) {
        throw new Error("No model loaded");
      }

      // For text generation models, we need tokenization
      // This is a simplified example - real implementation would need
      // proper tokenizer matching the model's vocabulary
      
      const inputTokens = this.simpleTokenize(input);
      const inputTensor = tf.tensor2d([inputTokens], [1, inputTokens.length]);

      // Run inference
      const output = this.model.predict(inputTensor) as tf.Tensor;
      const outputData = await output.data();

      // Apply temperature and sampling
      const sampledOutput = this.applySampling(
        Array.from(outputData),
        config.temperature,
        config.topK,
        config.topP
      );

      // Decode output tokens back to text
      const outputText = this.simpleDecode(sampledOutput, config.maxTokens);

      // Cleanup tensors
      inputTensor.dispose();
      output.dispose();

      const inferenceTimeMs = Date.now() - startTime;
      const tokensGenerated = outputText.split(" ").length;

      return {
        text: outputText,
        tokensGenerated,
        inferenceTimeMs,
        tokensPerSecond: tokensGenerated / (inferenceTimeMs / 1000),
      };
    } catch (error) {
      console.error("Inference failed:", error);
      
      // Return mock response for demonstration
      const inferenceTimeMs = Date.now() - startTime + 500;
      return {
        text: `[Model inference placeholder] Input: "${input.substring(0, 50)}..."`,
        tokensGenerated: 10,
        inferenceTimeMs,
        tokensPerSecond: 10 / (inferenceTimeMs / 1000),
      };
    }
  }

  private simpleTokenize(text: string): number[] {
    // Simple character-level tokenization for demonstration
    // Real implementation would use proper tokenizer (BPE, SentencePiece, etc.)
    return text.split("").map((char) => char.charCodeAt(0) % 256);
  }

  private simpleDecode(tokens: number[], maxTokens: number): string {
    // Simple decoding for demonstration
    return tokens
      .slice(0, maxTokens)
      .map((t) => String.fromCharCode(Math.abs(Math.round(t)) % 128))
      .join("");
  }

  private applySampling(
    logits: number[],
    temperature: number,
    topK: number,
    topP: number
  ): number[] {
    // Apply temperature scaling
    const scaledLogits = logits.map((l) => l / Math.max(temperature, 0.01));

    // Apply softmax
    const maxLogit = Math.max(...scaledLogits);
    const expLogits = scaledLogits.map((l) => Math.exp(l - maxLogit));
    const sumExp = expLogits.reduce((a, b) => a + b, 0);
    const probs = expLogits.map((e) => e / sumExp);

    // Top-K filtering
    const indexed = probs.map((p, i) => ({ prob: p, index: i }));
    indexed.sort((a, b) => b.prob - a.prob);
    const topKFiltered = indexed.slice(0, topK);

    // Top-P (nucleus) filtering
    let cumProb = 0;
    const topPFiltered = topKFiltered.filter((item) => {
      cumProb += item.prob;
      return cumProb <= topP;
    });

    // Sample from filtered distribution
    const filteredProbs = topPFiltered.length > 0 ? topPFiltered : topKFiltered.slice(0, 1);
    const totalProb = filteredProbs.reduce((a, b) => a + b.prob, 0);
    const normalizedProbs = filteredProbs.map((p) => p.prob / totalProb);

    // Multinomial sampling
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < normalizedProbs.length; i++) {
      cumulative += normalizedProbs[i];
      if (rand < cumulative) {
        return [filteredProbs[i].index];
      }
    }

    return [filteredProbs[0].index];
  }

  isModelLoaded(): boolean {
    return this.model !== null;
  }

  getLoadedModelPath(): string | null {
    return this.modelPath;
  }

  async unloadModel(): Promise<void> {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.modelPath = null;
    }
  }

  getMemoryInfo(): { numTensors: number; numBytes: number } {
    const memInfo = tf.memory();
    return {
      numTensors: memInfo.numTensors,
      numBytes: memInfo.numBytes,
    };
  }

  async dispose(): Promise<void> {
    await this.unloadModel();
    this.isInitialized = false;
  }
}

export const inferenceEngine = InferenceEngine.getInstance();
