import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch for LibreTranslate API
global.fetch = vi.fn();

describe("TranslationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should translate Polish to English", async () => {
    const mockResponse = {
      translatedText: "Hello world",
    };
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    // Import after mocking
    const { translationService } = await import("../translation/service");
    
    const result = await translationService.translateToEnglish("Cześć świat");
    
    expect(result).toBe("Hello world");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/translate"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("should translate English to Polish", async () => {
    const mockResponse = {
      translatedText: "Cześć świat",
    };
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { translationService } = await import("../translation/service");
    
    const result = await translationService.translateToPolish("Hello world");
    
    expect(result).toBe("Cześć świat");
  });

  it("should return original text on translation failure", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const { translationService } = await import("../translation/service");
    
    const result = await translationService.translateToEnglish("Test text");
    
    expect(result).toBe("Test text");
  });

  it("should detect language", async () => {
    const mockResponse = [{ language: "pl", confidence: 0.95 }];
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { translationService } = await import("../translation/service");
    
    const result = await translationService.detectLanguage("Cześć");
    
    expect(result).toBe("pl");
  });

  it("should return empty string for empty input", async () => {
    const { translationService } = await import("../translation/service");
    
    const result = await translationService.translateToEnglish("");
    
    expect(result).toBe("");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
