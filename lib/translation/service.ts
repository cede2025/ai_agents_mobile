import AsyncStorage from "@react-native-async-storage/async-storage";

interface TranslationCache {
  [key: string]: string;
}

export class TranslationService {
  private static instance: TranslationService;
  private cache: TranslationCache = {};
  private apiUrl: string;

  private constructor() {
    // Can be configured to use local or public LibreTranslate instance
    this.apiUrl = process.env.EXPO_PUBLIC_LIBRETRANSLATE_URL || "https://libretranslate.com";
    this.loadCache();
  }

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  private async loadCache() {
    try {
      const cached = await AsyncStorage.getItem("translation_cache");
      if (cached) {
        this.cache = JSON.parse(cached);
      }
    } catch (error) {
      console.error("Failed to load translation cache:", error);
    }
  }

  private async saveCache() {
    try {
      await AsyncStorage.setItem("translation_cache", JSON.stringify(this.cache));
    } catch (error) {
      console.error("Failed to save translation cache:", error);
    }
  }

  private getCacheKey(text: string, source: string, target: string): string {
    return `${source}-${target}:${text}`;
  }

  async translate(text: string, source: string, target: string): Promise<string> {
    if (!text.trim()) return text;

    // Check cache first
    const cacheKey = this.getCacheKey(text, source, target);
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const response = await fetch(`${this.apiUrl}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source,
          target,
          format: "text",
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const translated = data.translatedText || text;

      // Cache the result
      this.cache[cacheKey] = translated;
      this.saveCache();

      return translated;
    } catch (error) {
      console.error(`Translation ${source}→${target} failed:`, error);
      return text; // Return original text if translation fails
    }
  }

  async translateToEnglish(text: string): Promise<string> {
    return this.translate(text, "pl", "en");
  }

  async translateToPolish(text: string): Promise<string> {
    return this.translate(text, "en", "pl");
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/detect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Language detection failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data[0]?.language || "en";
    } catch (error) {
      console.error("Language detection failed:", error);
      return "en"; // Default to English
    }
  }

  async clearCache() {
    this.cache = {};
    await AsyncStorage.removeItem("translation_cache");
  }

  getCacheSize(): number {
    return Object.keys(this.cache).length;
  }

  setApiUrl(url: string) {
    this.apiUrl = url;
  }
}

export const translationService = TranslationService.getInstance();
