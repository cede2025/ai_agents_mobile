import { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { translationService } from "@/lib/translation/service";
import { inferenceEngine, type ModelConfig } from "@/lib/inference/engine";

interface LocalModel {
  id: string;
  name: string;
  size: string;
  quantization: string;
  contextLength: number;
  path: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  originalText?: string;
  inferenceTime?: number;
  tokensPerSecond?: number;
}

const DEFAULT_CONFIG: ModelConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxTokens: 2048,
  contextLength: 2048,
};

export default function LocalAIScreen() {
  const colors = useColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [models, setModels] = useState<LocalModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<LocalModel | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [importing, setImporting] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [tfInitialized, setTfInitialized] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);

  useEffect(() => {
    initializeTensorFlow();
    loadSavedModels();
    loadModelConfig();
  }, []);

  const initializeTensorFlow = async () => {
    const success = await inferenceEngine.initialize();
    setTfInitialized(success);
    if (success) {
      addSystemMessage("TensorFlow.js initialized successfully");
    } else {
      addSystemMessage("Warning: TensorFlow.js initialization failed");
    }
  };

  const loadSavedModels = async () => {
    try {
      const saved = await AsyncStorage.getItem("local_models");
      if (saved) {
        setModels(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load saved models:", error);
    }
  };

  const loadModelConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem("model_config");
      if (saved) {
        setModelConfig(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load model config:", error);
    }
  };

  const saveModels = async (modelList: LocalModel[]) => {
    try {
      await AsyncStorage.setItem("local_models", JSON.stringify(modelList));
    } catch (error) {
      console.error("Failed to save models:", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleImportModel = async () => {
    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ["*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setImporting(false);
        return;
      }

      const file = result.assets[0];
      
      // Validate file extension
      const validExtensions = [".tflite", ".lite", ".json", ".bin"];
      const hasValidExtension = validExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension) {
        alert("Please select a valid model file (.tflite, .lite, .json, .bin)");
        setImporting(false);
        return;
      }

      const newModel: LocalModel = {
        id: Date.now().toString(),
        name: file.name.replace(/\.(tflite|lite|json|bin)$/i, ""),
        size: `${((file.size || 0) / 1024 / 1024).toFixed(2)} MB`,
        quantization: "INT8",
        contextLength: 2048,
        path: file.uri,
      };

      const updatedModels = [...models, newModel];
      setModels(updatedModels);
      saveModels(updatedModels);
      setSelectedModel(newModel);
      setImporting(false);
      
      addSystemMessage(`Model "${newModel.name}" imported successfully`);
      
      // Try to load the model
      await loadModelForInference(newModel);
    } catch (error) {
      console.error("Failed to import model:", error);
      alert("Failed to import model");
      setImporting(false);
    }
  };

  const loadModelForInference = async (model: LocalModel) => {
    setModelLoading(true);
    addSystemMessage(`Loading model "${model.name}" for inference...`);
    
    try {
      const success = await inferenceEngine.loadModel(model.path);
      if (success) {
        addSystemMessage(`Model "${model.name}" loaded and ready`);
      } else {
        addSystemMessage(`Note: Model format may require conversion for full inference`);
      }
    } catch (error) {
      console.error("Failed to load model:", error);
      addSystemMessage(`Model loaded (inference in demo mode)`);
    }
    
    setModelLoading(false);
  };

  const deleteModel = async (modelId: string) => {
    const updatedModels = models.filter(m => m.id !== modelId);
    setModels(updatedModels);
    saveModels(updatedModels);
    
    if (selectedModel?.id === modelId) {
      setSelectedModel(null);
      await inferenceEngine.unloadModel();
    }
    
    addSystemMessage("Model removed");
  };

  const addSystemMessage = (text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      text,
      sender: "ai",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    scrollToBottom();
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !selectedModel) return;

    const originalText = input;
    let textToSend = originalText;

    setSending(true);

    // Translate to English if enabled
    if (translationEnabled) {
      try {
        textToSend = await translationService.translateToEnglish(originalText);
      } catch (error) {
        console.error("Translation failed:", error);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: originalText,
      sender: "user",
      timestamp: new Date().toISOString(),
      originalText: translationEnabled ? textToSend : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    scrollToBottom();

    try {
      // Run inference
      const result = await inferenceEngine.runInference(textToSend, modelConfig);
      
      // Translate response back to Polish if enabled
      let responseText = result.text;
      if (translationEnabled) {
        try {
          responseText = await translationService.translateToPolish(result.text);
        } catch (error) {
          console.error("Translation failed:", error);
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "ai",
        timestamp: new Date().toISOString(),
        originalText: translationEnabled ? result.text : undefined,
        inferenceTime: result.inferenceTimeMs,
        tokensPerSecond: result.tokensPerSecond,
      };

      setMessages((prev) => [...prev, aiMessage]);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to get AI response:", error);
      addSystemMessage("Error: Failed to generate response");
    } finally {
      setSending(false);
      setIsTyping(false);
    }
  };

  const memInfo = tfInitialized ? inferenceEngine.getMemoryInfo() : null;

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 py-4 border-b border-border">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-2xl font-bold text-foreground">Local AI</Text>
              {tfInitialized && memInfo && (
                <Text className="text-xs text-muted mt-1">
                  TF.js • {memInfo.numTensors} tensors • {(memInfo.numBytes / 1024 / 1024).toFixed(1)} MB
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                className={`px-3 py-1 rounded-lg ${translationEnabled ? "bg-primary" : "bg-surface"}`}
                onPress={() => setTranslationEnabled(!translationEnabled)}
              >
                <Text className={`text-xs font-semibold ${translationEnabled ? "text-background" : "text-muted"}`}>
                  PL↔EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-success px-3 py-1 rounded-lg active:opacity-80"
                onPress={handleImportModel}
                disabled={importing}
              >
                {importing ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text className="text-background text-xs font-semibold">Import</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Model Selector */}
          <TouchableOpacity
            className="bg-surface rounded-xl p-3 border border-border active:opacity-80"
            onPress={() => setShowModelSelector(true)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                {selectedModel ? (
                  <>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-semibold text-foreground">{selectedModel.name}</Text>
                      {modelLoading && <ActivityIndicator size="small" color={colors.primary} />}
                    </View>
                    <Text className="text-xs text-muted mt-1">
                      {selectedModel.size} • {selectedModel.quantization} • {selectedModel.contextLength} ctx
                    </Text>
                  </>
                ) : (
                  <Text className="text-sm text-muted">No model selected - Import a model file</Text>
                )}
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <ScrollView ref={scrollViewRef} className="flex-1 px-4 py-3">
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-16 h-16 bg-surface rounded-2xl items-center justify-center mb-4">
                <IconSymbol name="cpu.fill" size={32} color={colors.primary} />
              </View>
              <Text className="text-foreground text-center text-base font-semibold mb-2">
                Local AI Inference
              </Text>
              <Text className="text-muted text-center text-sm px-8">
                Import a TFLite/LiteRT model and chat offline with auto PL↔EN translation
              </Text>
              <View className="mt-4 bg-surface rounded-xl p-3">
                <Text className="text-xs text-muted">
                  Supported: .tflite, .lite, .json (TF.js)
                </Text>
              </View>
            </View>
          ) : (
            <View className="gap-3">
              {messages.map((msg) => (
                <View key={msg.id} className={`flex-row gap-2 ${msg.sender === "user" ? "justify-end" : ""}`}>
                  {msg.sender === "ai" && (
                    <View className="w-6 h-6 bg-success rounded-full items-center justify-center">
                      <Text className="text-background font-bold text-[10px]">AI</Text>
                    </View>
                  )}
                  <View
                    className={`rounded-xl p-3 max-w-[75%] ${
                      msg.sender === "user" ? "bg-primary rounded-tr-sm" : "bg-surface rounded-tl-sm"
                    }`}
                  >
                    <Text className={`text-sm ${msg.sender === "user" ? "text-background" : "text-foreground"}`}>
                      {msg.text}
                    </Text>
                    {translationEnabled && msg.originalText && msg.originalText !== msg.text && (
                      <Text
                        className={`text-xs mt-2 italic ${msg.sender === "user" ? "text-background/70" : "text-muted"}`}
                      >
                        Original: {msg.originalText.substring(0, 100)}...
                      </Text>
                    )}
                    {msg.inferenceTime && (
                      <Text className="text-xs text-muted mt-2">
                        ⚡ {msg.inferenceTime}ms • {msg.tokensPerSecond?.toFixed(1)} tok/s
                      </Text>
                    )}
                  </View>
                </View>
              ))}

              {isTyping && (
                <View className="flex-row gap-2">
                  <View className="w-6 h-6 bg-success rounded-full items-center justify-center">
                    <Text className="text-background font-bold text-[10px]">AI</Text>
                  </View>
                  <View className="bg-surface rounded-xl rounded-tl-sm p-3">
                    <View className="flex-row gap-1">
                      <View className="w-1.5 h-1.5 bg-muted rounded-full" />
                      <View className="w-1.5 h-1.5 bg-muted rounded-full" />
                      <View className="w-1.5 h-1.5 bg-muted rounded-full" />
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-3 border-t border-border bg-background">
          <View className="flex-row items-center gap-2">
            <View className="flex-1 bg-surface rounded-full px-4 py-2 border border-border">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={translationEnabled ? "Pisz po polsku..." : "Type your message..."}
                placeholderTextColor={colors.muted}
                className="text-foreground text-sm"
                returnKeyType="send"
                onSubmitEditing={handleSend}
                editable={!sending && !!selectedModel}
              />
            </View>
            <TouchableOpacity
              className="w-10 h-10 bg-success rounded-full items-center justify-center active:opacity-80"
              onPress={handleSend}
              disabled={sending || !input.trim() || !selectedModel}
              style={{ opacity: sending || !input.trim() || !selectedModel ? 0.5 : 1 }}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <IconSymbol name="paperplane.fill" size={18} color={colors.background} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Model Selector Modal */}
        <Modal
          visible={showModelSelector}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModelSelector(false)}
        >
          <View className="flex-1 justify-end bg-black/70">
            <View className="bg-background rounded-t-3xl p-4 border-t border-border">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-foreground">Select Model</Text>
                <TouchableOpacity onPress={() => setShowModelSelector(false)}>
                  <Text className="text-primary font-semibold">Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView className="max-h-96">
                {models.length === 0 ? (
                  <View className="py-8">
                    <Text className="text-muted text-center">No models imported yet</Text>
                    <TouchableOpacity
                      className="bg-success mt-4 py-3 rounded-xl active:opacity-80"
                      onPress={() => {
                        setShowModelSelector(false);
                        handleImportModel();
                      }}
                    >
                      <Text className="text-background text-center font-semibold">Import Model</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="gap-2">
                    {models.map((model) => (
                      <TouchableOpacity
                        key={model.id}
                        className={`bg-surface rounded-xl p-3 border-2 active:opacity-80 ${
                          selectedModel?.id === model.id ? "border-success" : "border-transparent"
                        }`}
                        onPress={async () => {
                          setSelectedModel(model);
                          setShowModelSelector(false);
                          await loadModelForInference(model);
                        }}
                        onLongPress={() => {
                          // Long press to delete
                          if (confirm(`Delete model "${model.name}"?`)) {
                            deleteModel(model.id);
                          }
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="text-base font-semibold text-foreground">{model.name}</Text>
                            <Text className="text-xs text-muted mt-1">
                              {model.size} • {model.quantization} • {model.contextLength} ctx
                            </Text>
                          </View>
                          {selectedModel?.id === model.id && (
                            <View className="w-6 h-6 bg-success rounded-full items-center justify-center">
                              <Text className="text-background font-bold text-xs">✓</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                    <Text className="text-xs text-muted text-center mt-4">
                      Long press to delete a model
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
