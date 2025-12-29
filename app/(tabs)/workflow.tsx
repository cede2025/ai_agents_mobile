import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { WorkflowCanvas } from "@/components/workflow-canvas";

export default function WorkflowScreen() {
  const colors = useColors();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  if (selectedWorkflow) {
    return (
      <ScreenContainer className="flex-1">
        {/* Editor Header */}
        <View className="px-6 py-4 border-b border-border">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity 
              className="flex-row items-center gap-2 active:opacity-80"
              onPress={() => setSelectedWorkflow(null)}
            >
              <IconSymbol name="chevron.right" size={20} color={colors.primary} style={{ transform: [{ rotate: "180deg" }] }} />
              <Text className="text-lg font-semibold text-foreground">Data Processing</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary px-4 py-2 rounded-full active:opacity-80">
              <Text className="text-background font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Canvas */}
        <WorkflowCanvas />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-foreground">Workflows</Text>
            <TouchableOpacity className="bg-primary px-4 py-2 rounded-full active:opacity-80">
              <Text className="text-background font-semibold">New</Text>
            </TouchableOpacity>
          </View>

          {/* Workflow Cards */}
          <View className="gap-4">
            <TouchableOpacity 
              className="bg-surface rounded-2xl p-4 border border-border active:opacity-80"
              onPress={() => setSelectedWorkflow("1")}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-semibold text-foreground">Data Processing Pipeline</Text>
                <IconSymbol name="arrow.triangle.branch" size={24} color={colors.primary} />
              </View>
              <Text className="text-sm text-muted mb-2">5 agents • Last modified 2 hours ago</Text>
              <View className="flex-row gap-2">
                <View className="bg-success/20 px-2 py-1 rounded">
                  <Text className="text-xs text-success">Active</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-surface rounded-2xl p-4 border border-border active:opacity-80">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-semibold text-foreground">Content Analysis</Text>
                <IconSymbol name="arrow.triangle.branch" size={24} color={colors.primary} />
              </View>
              <Text className="text-sm text-muted mb-2">3 agents • Last modified 1 day ago</Text>
              <View className="flex-row gap-2">
                <View className="bg-muted/20 px-2 py-1 rounded">
                  <Text className="text-xs text-muted">Idle</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-surface rounded-2xl p-4 border border-border active:opacity-80">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-semibold text-foreground">Research Assistant</Text>
                <IconSymbol name="arrow.triangle.branch" size={24} color={colors.primary} />
              </View>
              <Text className="text-sm text-muted mb-2">7 agents • Last modified 3 days ago</Text>
              <View className="flex-row gap-2">
                <View className="bg-warning/20 px-2 py-1 rounded">
                  <Text className="text-xs text-warning">Processing</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Empty State Hint */}
          <View className="flex-1 items-center justify-center mt-8">
            <IconSymbol name="arrow.triangle.branch" size={64} color={colors.muted} />
            <Text className="text-muted text-center mt-4">
              Tap a workflow to edit or create a new one
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
