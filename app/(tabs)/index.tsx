import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function DashboardScreen() {
  const colors = useColors();

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

  const AgentCard = ({
    name,
    type,
    status,
    lastActivity,
  }: {
    name: string;
    type: string;
    status: "active" | "idle" | "offline";
    lastActivity: string;
  }) => {
    const statusColors = {
      active: colors.success,
      idle: colors.warning,
      offline: colors.error,
    };

    const statusLabels = {
      active: "Active",
      idle: "Idle",
      offline: "Offline",
    };

    return (
      <TouchableOpacity className="bg-surface rounded-2xl p-4 border border-border active:opacity-80">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center">
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{name}</Text>
            <Text className="text-sm text-muted">{type}</Text>
            <Text className="text-xs text-muted mt-1">{lastActivity}</Text>
          </View>
          <View className="items-end gap-1">
            <View 
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: `${statusColors[status]}20` }}
            >
              <Text className="text-xs font-medium" style={{ color: statusColors[status] }}>
                {statusLabels[status]}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView className="flex-1">
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
              value="12"
              icon="house.fill"
              color={colors.primary}
            />
            <StatusCard
              title="Active Tasks"
              value="8"
              icon="chart.bar.fill"
              color={colors.success}
            />
          </View>
          <View className="flex-row gap-3">
            <StatusCard
              title="System Health"
              value="98%"
              icon="gearshape.fill"
              color={colors.success}
            />
            <StatusCard
              title="API Usage"
              value="67%"
              icon="chart.bar.fill"
              color={colors.warning}
            />
          </View>
        </View>

        {/* Agents Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">Agents</Text>
            <TouchableOpacity className="active:opacity-80">
              <Text className="text-sm text-primary font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            <AgentCard
              name="Logical Reasoning Agent"
              type="Analysis & Planning"
              status="active"
              lastActivity="Active now"
            />
            <AgentCard
              name="Workflow Orchestrator"
              type="Orchestration"
              status="active"
              lastActivity="2 minutes ago"
            />
            <AgentCard
              name="Business Intelligence"
              type="Data Analysis"
              status="idle"
              lastActivity="1 hour ago"
            />
            <AgentCard
              name="Natural Language Gen"
              type="Content Generation"
              status="active"
              lastActivity="Active now"
            />
            <AgentCard
              name="Code Implementation"
              type="Development"
              status="idle"
              lastActivity="3 hours ago"
            />
            <AgentCard
              name="Safety Validator"
              type="Security"
              status="offline"
              lastActivity="1 day ago"
            />
          </View>
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
