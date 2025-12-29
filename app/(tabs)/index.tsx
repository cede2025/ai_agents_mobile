import { useEffect, useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useWebSocket } from "@/hooks/use-websocket";
import { agentsService, metricsService } from "@/lib/api";
import type { Agent, SystemMetrics, AgentStatusEvent } from "@/lib/api/types";
import { wsEvents } from "@/lib/websocket/client";

export default function DashboardScreen() {
  const colors = useColors();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time agent status updates
    const handleAgentStatus = (event: AgentStatusEvent) => {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === event.agentId ? { ...agent, status: event.status } : agent
        )
      );
    };

    wsEvents.onAgentStatus(handleAgentStatus);

    return () => {
      wsEvents.offAgentStatus(handleAgentStatus);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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
    <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm text-muted">{title}</Text>
        <IconSymbol name={icon as any} size={20} color={color} />
      </View>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
    </View>
  );

  const AgentCard = ({ agent }: { agent: Agent }) => {
    const statusColors = {
      active: colors.success,
      idle: colors.warning,
      error: colors.error,
    };

    const statusLabels = {
      active: "Active",
      idle: "Idle",
      error: "Error",
    };

    return (
      <TouchableOpacity className="bg-surface rounded-2xl p-4 border border-border active:opacity-80">
        <View className="flex-row items-center gap-3">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: `${agent.color || colors.primary}20` }}
          >
            <IconSymbol 
              name="chevron.left.forwardslash.chevron.right" 
              size={24} 
              color={agent.color || colors.primary} 
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{agent.name}</Text>
            <Text className="text-sm text-muted">{agent.provider} • {agent.type}</Text>
            <Text className="text-xs text-muted mt-1">
              {new Date(agent.lastUsed).toLocaleString() || "Recently used"}
            </Text>
          </View>
          <View className="items-end gap-1">
            <View 
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: `${statusColors[agent.status]}20` }}
            >
              <Text className="text-xs font-medium" style={{ color: statusColors[agent.status] }}>
                {statusLabels[agent.status]}
              </Text>
            </View>
            <Text className="text-xs text-muted">{agent.performance}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Loading dashboard...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View className="px-6 py-6 flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-foreground">Dashboard</Text>
          <TouchableOpacity className="w-10 h-10 items-center justify-center active:opacity-80">
            <IconSymbol name="bell.fill" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Status Cards Grid */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3 mb-3">
            <StatusCard
              title="Total Agents"
              value={metrics?.totalAgents.toString() || "0"}
              icon="house.fill"
              color={colors.primary}
            />
            <StatusCard
              title="Active Tasks"
              value={metrics?.activeTasks.toString() || "0"}
              icon="chart.bar.fill"
              color={colors.success}
            />
          </View>
          <View className="flex-row gap-3">
            <StatusCard
              title="System Health"
              value={metrics?.systemHealth === "healthy" ? "98%" : "N/A"}
              icon="gearshape.fill"
              color={colors.success}
            />
            <StatusCard
              title="API Usage"
              value={`${metrics?.apiUsage.requests || 0}`}
              icon="chart.bar.fill"
              color={colors.warning}
            />
          </View>
        </View>

        {/* Agents Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">Agents ({agents.length})</Text>
            <TouchableOpacity className="active:opacity-80">
              <Text className="text-sm text-primary font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          {agents.length === 0 ? (
            <View className="bg-surface rounded-2xl p-8 items-center">
              <Text className="text-muted text-center">No agents found. Create your first agent to get started.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </View>
          )}
        </View>

        {/* Floating Action Button */}
        <View className="absolute bottom-6 right-6">
          <TouchableOpacity 
            className="w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg active:opacity-80"
            style={{
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <IconSymbol name="plus.circle.fill" size={32} color={colors.background} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
