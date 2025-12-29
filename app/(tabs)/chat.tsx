import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

type ChatMode = "quick" | "optimized" | "longterm";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
}

export default function ChatScreen() {
  const colors = useColors();
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<ChatMode>("quick");
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: "Just now",
    },
    {
      id: "2",
      text: "Can you analyze the performance of my agents?",
      sender: "user",
      timestamp: "2 min ago",
    },
    {
      id: "3",
      text: "I'll analyze your agents' performance. Here's what I found:\n\n• 5 agents are currently active\n• Average response time: 1.2s\n• Success rate: 98.5%\n\nWould you like more details on any specific agent?",
      sender: "ai",
      timestamp: "1 min ago",
    },
  ]);

  const modeConfig = {
    quick: {
      label: "⚡ Quick Mode",
      description: "Fast responses, minimal processing",
      color: colors.success,
    },
    optimized: {
      label: "🎯 Optimized Mode",
      description: "Balanced speed and quality",
      color: colors.primary,
    },
    longterm: {
      label: "🔄 Long-term Mode",
      description: "Can run 7 days/24h, background processing",
      color: colors.warning,
    },
  };

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: "user",
        timestamp: "Just now",
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

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
        <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ gap: 16 }}>
          {messages.map((msg) => (
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
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          ))}
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
              />
            </View>
            <TouchableOpacity 
              className="w-12 h-12 bg-primary rounded-full items-center justify-center active:opacity-80"
              onPress={handleSend}
            >
              <IconSymbol name="paperplane.fill" size={20} color={colors.background} />
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
                    onPress={() => {
                      setMode(modeKey);
                      setShowModeSelector(false);
                    }}
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
                    <Text className="text-sm text-muted">{modeConfig[modeKey].description}</Text>
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
