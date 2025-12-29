import { useState, useEffect, useRef } from "react";
import { 
  ScrollView, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Modal,
  ActivityIndicator 
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { chatService } from "@/lib/api";
import type { Message, ChatMode } from "@/lib/api/types";
import { wsEvents } from "@/lib/websocket/client";

export default function ChatScreen() {
  const colors = useColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<ChatMode>("quick");
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const modeConfig = {
    quick: {
      label: "⚡ Quick Mode",
      description: "Fast responses for simple queries (Groq/Gemini)",
      color: colors.success,
      features: ["Max 500 tokens", "5s timeout", "Streaming response"],
    },
    optimized: {
      label: "🎯 Optimized Mode",
      description: "Balanced quality and speed (DeepSeek/OpenRouter)",
      color: colors.primary,
      features: ["Max 2000 tokens", "15s timeout", "Chain of thought"],
    },
    longterm: {
      label: "🔄 Long-term Mode",
      description: "7-day continuous assistance (DeepSeek/OpenRouter)",
      color: colors.warning,
      features: ["Max 8000 tokens", "5min timeout", "7-day context", "Scheduled tasks"],
    },
  };

  useEffect(() => {
    loadChatHistory();

    // Listen for incoming messages via WebSocket
    const handleChatMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setIsTyping(false);
      scrollToBottom();
    };

    const handleChatTyping = (event: any) => {
      setIsTyping(event.isTyping);
    };

    wsEvents.onChatMessage(handleChatMessage);
    wsEvents.onChatTyping(handleChatTyping);

    return () => {
      wsEvents.offChatMessage(handleChatMessage);
      wsEvents.offChatTyping(handleChatTyping);
    };
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await chatService.getChatHistory(50);
      setMessages(history);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date().toISOString(),
      mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setSending(true);
    setIsTyping(true);
    scrollToBottom();

    try {
      const response = await chatService.sendMessage(message, mode);
      // Response will come via WebSocket
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsTyping(false);
    } finally {
      setSending(false);
    }
  };

  const handleModeChange = async (newMode: ChatMode) => {
    setMode(newMode);
    setShowModeSelector(false);
    try {
      await chatService.setChatMode(newMode);
    } catch (error) {
      console.error("Failed to set chat mode:", error);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Loading chat...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="flex-1">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-border">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">AI Chat</Text>
            <TouchableOpacity 
              className="bg-surface px-3 py-2 rounded-full active:opacity-80"
              onPress={() => setShowModeSelector(true)}
            >
              <Text className="text-sm text-foreground">{modeConfig[mode].label}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-6 py-4" 
          contentContainerStyle={{ gap: 16 }}
          onContentSizeChange={scrollToBottom}
        >
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-muted text-center">
                Start a conversation with AI in {modeConfig[mode].label}
              </Text>
            </View>
          ) : (
            messages.map((msg) => (
              <View key={msg.id} className={`flex-row gap-3 ${msg.sender === "user" ? "justify-end" : ""}`}>
                {msg.sender === "ai" && (
                  <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                    <Text className="text-background font-bold text-xs">AI</Text>
                  </View>
                )}
                <View 
                  className={`rounded-2xl p-4 ${
                    msg.sender === "user" 
                      ? "bg-primary rounded-tr-sm max-w-[80%]" 
                      : "flex-1 bg-surface rounded-tl-sm"
                  }`}
                >
                  <Text className={msg.sender === "user" ? "text-background" : "text-foreground"}>
                    {msg.text}
                  </Text>
                  <Text className={`text-xs mt-2 ${msg.sender === "user" ? "text-background/70" : "text-muted"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <View className="flex-row gap-3">
              <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                <Text className="text-background font-bold text-xs">AI</Text>
              </View>
              <View className="bg-surface rounded-2xl rounded-tl-sm p-4">
                <View className="flex-row gap-1">
                  <View className="w-2 h-2 bg-muted rounded-full animate-pulse" />
                  <View className="w-2 h-2 bg-muted rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <View className="w-2 h-2 bg-muted rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="px-6 py-4 border-t border-border bg-background">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-surface rounded-full px-4 py-3 flex-row items-center">
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor={colors.muted}
                className="flex-1 text-foreground"
                returnKeyType="send"
                onSubmitEditing={handleSend}
                editable={!sending}
              />
            </View>
            <TouchableOpacity 
              className="w-12 h-12 bg-primary rounded-full items-center justify-center active:opacity-80"
              onPress={handleSend}
              disabled={sending || !message.trim()}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <IconSymbol name="paperplane.fill" size={20} color={colors.background} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Selector Modal */}
        <Modal
          visible={showModeSelector}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModeSelector(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-background rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold text-foreground">Select Mode</Text>
                <TouchableOpacity onPress={() => setShowModeSelector(false)}>
                  <Text className="text-primary font-semibold">Done</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-3">
                {(Object.keys(modeConfig) as ChatMode[]).map((modeKey) => (
                  <TouchableOpacity
                    key={modeKey}
                    className={`bg-surface rounded-2xl p-4 border-2 active:opacity-80 ${
                      mode === modeKey ? "border-primary" : "border-transparent"
                    }`}
                    onPress={() => handleModeChange(modeKey)}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-lg font-semibold text-foreground">
                        {modeConfig[modeKey].label}
                      </Text>
                      {mode === modeKey && (
                        <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                          <Text className="text-background font-bold text-xs">✓</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-muted mb-2">{modeConfig[modeKey].description}</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {modeConfig[modeKey].features.map((feature, idx) => (
                        <View key={idx} className="bg-background px-2 py-1 rounded">
                          <Text className="text-xs text-muted">{feature}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
