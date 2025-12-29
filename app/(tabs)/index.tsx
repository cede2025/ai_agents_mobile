import { useEffect, useState, useRef } from "react";
import { 
  ScrollView, 
  Text, 
  View, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useWebSocket } from "@/hooks/use-websocket";
import { agentsService, metricsService, chatService } from "@/lib/api";
import type { Agent, SystemMetrics, Message } from "@/lib/api/types";
import { wsEvents } from "@/lib/websocket/client";

type TaskMode = "regular" | "continuous";

export default function DashboardScreen() {
  const colors = useColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Chat state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [taskMode, setTaskMode] = useState<TaskMode>("regular");
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize WebSocket
  useWebSocket();

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [agentsData, metricsData] = await Promise.all([
        agentsService.getAgents(),
        metricsService.getMetrics(),
      ]);
      setAgents(agentsData);
      setMetrics(metricsData);
      if (agentsData.length > 0 && !selectedAgent) {
        setSelectedAgent(agentsData[0]);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time updates
    const handleAgentStatus = (event: any) => {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === event.agentId ? { ...agent, status: event.status } : agent
        )
      );
    };

    const handleChatMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setIsTyping(false);
      scrollToBottom();
    };

    wsEvents.onAgentStatus(handleAgentStatus);
    wsEvents.onChatMessage(handleChatMessage);

    return () => {
      wsEvents.offAgentStatus(handleAgentStatus);
      wsEvents.offChatMessage(handleChatMessage);
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSend = async () => {
    if (!message.trim() || sending || !selectedAgent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setSending(true);
    setIsTyping(true);
    scrollToBottom();

    try {
      // Send with selected agent context
      await chatService.sendMessage(
        `[Agent: ${selectedAgent.name}] ${message}`,
        taskMode === "regular" ? "quick" : "longterm"
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsTyping(false);
    } finally {
      setSending(false);
    }
  };

  const StatusCard = ({ 
    title, 
    value, 
    icon, 
    color 
  }: { 
    title: string; 
    value: string; 
    icon: string; 
    color: string;
  }) => (
    <View className="flex-1 bg-surface rounded-xl p-3 border border-border">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-xs text-muted">{title}</Text>
        <IconSymbol name={icon as any} size={16} color={color} />
      </View>
      <Text className="text-xl font-bold text-foreground">{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="flex-1">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Header */}
          <View className="px-4 py-4 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">AI Command Center</Text>
            <TouchableOpacity className="w-10 h-10 items-center justify-center active:opacity-80">
              <IconSymbol name="bell.fill" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Status Cards Grid */}
          <View className="px-4 mb-4">
            <View className="flex-row gap-2 mb-2">
              <StatusCard
                title="Agents"
                value={metrics?.totalAgents.toString() || "0"}
                icon="house.fill"
                color={colors.primary}
              />
              <StatusCard
                title="Tasks"
                value={metrics?.activeTasks.toString() || "0"}
                icon="chart.bar.fill"
                color={colors.success}
              />
            </View>
            <View className="flex-row gap-2">
              <StatusCard
                title="Health"
                value={metrics?.systemHealth === "healthy" ? "OK" : "N/A"}
                icon="gearshape.fill"
                color={colors.success}
              />
              <StatusCard
                title="API"
                value={`${metrics?.apiUsage.requests || 0}`}
                icon="chart.bar.fill"
                color={colors.warning}
              />
            </View>
          </View>

          {/* Agent Selector & Task Mode */}
          <View className="px-4 mb-3">
            <View className="flex-row gap-2">
              <TouchableOpacity 
                className="flex-1 bg-surface rounded-xl p-3 border border-border active:opacity-80"
                onPress={() => setShowAgentSelector(true)}
              >
                <Text className="text-xs text-muted mb-1">Active Agent</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">
                    {selectedAgent?.name || "Select Agent"}
                  </Text>
                  <IconSymbol name="chevron.right" size={16} color={colors.muted} />
                </View>
                {selectedAgent && (
                  <Text className="text-xs text-muted mt-1">{selectedAgent.provider}</Text>
                )}
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-2 border border-border">
                <Text className="text-xs text-muted mb-1 px-1">Mode</Text>
                <View className="flex-row gap-1">
                  <TouchableOpacity
                    className={`px-3 py-1 rounded-lg ${taskMode === "regular" ? "bg-primary" : "bg-background"}`}
                    onPress={() => setTaskMode("regular")}
                  >
                    <Text className={`text-xs font-semibold ${taskMode === "regular" ? "text-background" : "text-muted"}`}>
                      Regular
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`px-3 py-1 rounded-lg ${taskMode === "continuous" ? "bg-warning" : "bg-background"}`}
                    onPress={() => setTaskMode("continuous")}
                  >
                    <Text className={`text-xs font-semibold ${taskMode === "continuous" ? "text-background" : "text-muted"}`}>
                      24/7
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Chat Messages */}
          <View className="px-4 mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Chat</Text>
            <View className="bg-surface rounded-xl border border-border p-3 min-h-[300px]">
              {messages.length === 0 ? (
                <View className="flex-1 items-center justify-center py-8">
                  <Text className="text-muted text-center text-sm">
                    Start conversation with {selectedAgent?.name || "an agent"}
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {messages.map((msg) => (
                    <View key={msg.id} className={`flex-row gap-2 ${msg.sender === "user" ? "justify-end" : ""}`}>
                      {msg.sender === "ai" && (
                        <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                          <Text className="text-background font-bold text-[10px]">AI</Text>
                        </View>
                      )}
                      <View 
                        className={`rounded-xl p-2 max-w-[75%] ${
                          msg.sender === "user" 
                            ? "bg-primary rounded-tr-sm" 
                            : "bg-background rounded-tl-sm"
                        }`}
                      >
                        <Text className={`text-sm ${msg.sender === "user" ? "text-background" : "text-foreground"}`}>
                          {msg.text}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {isTyping && (
                    <View className="flex-row gap-2">
                      <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                        <Text className="text-background font-bold text-[10px]">AI</Text>
                      </View>
                      <View className="bg-background rounded-xl rounded-tl-sm p-2">
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
            </View>
          </View>
        </ScrollView>

        {/* Chat Input */}
        <View className="px-4 py-3 border-t border-border bg-background">
          <View className="flex-row items-center gap-2">
            <View className="flex-1 bg-surface rounded-full px-4 py-2 flex-row items-center border border-border">
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor={colors.muted}
                className="flex-1 text-foreground text-sm"
                returnKeyType="send"
                onSubmitEditing={handleSend}
                editable={!sending}
              />
            </View>
            <TouchableOpacity 
              className="w-10 h-10 bg-primary rounded-full items-center justify-center active:opacity-80"
              onPress={handleSend}
              disabled={sending || !message.trim()}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <IconSymbol name="paperplane.fill" size={18} color={colors.background} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Agent Selector Modal */}
        <Modal
          visible={showAgentSelector}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAgentSelector(false)}
        >
          <View className="flex-1 justify-end bg-black/70">
            <View className="bg-background rounded-t-3xl p-4 border-t border-border">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-foreground">Select Agent</Text>
                <TouchableOpacity onPress={() => setShowAgentSelector(false)}>
                  <Text className="text-primary font-semibold">Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView className="max-h-96">
                <View className="gap-2">
                  {agents.map((agent) => (
                    <TouchableOpacity
                      key={agent.id}
                      className={`bg-surface rounded-xl p-3 border-2 active:opacity-80 ${
                        selectedAgent?.id === agent.id ? "border-primary" : "border-transparent"
                      }`}
                      onPress={() => {
                        setSelectedAgent(agent);
                        setShowAgentSelector(false);
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-foreground">{agent.name}</Text>
                          <Text className="text-xs text-muted">{agent.provider} • {agent.type}</Text>
                        </View>
                        {selectedAgent?.id === agent.id && (
                          <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                            <Text className="text-background font-bold text-xs">✓</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
