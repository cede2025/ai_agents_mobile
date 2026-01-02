import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { WorkflowCanvas } from "@/components/workflow-canvas";
import { workflowsService } from "@/lib/api";
import type { Workflow } from "@/lib/api/types";

export default function WorkflowScreen() {
  const colors = useColors();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(false);

  // Landscape orientation would be ideal for workflow editor
  // but removed to simplify build

  const handleSave = async () => {
    if (!selectedWorkflow) return;
    
    setLoading(true);
    try {
      if (selectedWorkflow.id) {
        await workflowsService.updateWorkflow(selectedWorkflow.id, selectedWorkflow);
      } else {
        await workflowsService.createWorkflow(selectedWorkflow);
      }
      setSelectedWorkflow(null);
    } catch (error) {
      console.error("Failed to save workflow:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedWorkflow?.id) return;

    try {
      await workflowsService.executeWorkflow(selectedWorkflow.id);
      console.log("Workflow execution started");
    } catch (error) {
      console.error("Failed to execute workflow:", error);
    }
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Top Bar */}
      <View className="px-4 py-3 border-b border-border bg-background flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            className="w-8 h-8 items-center justify-center active:opacity-80"
            onPress={() => setSelectedWorkflow(null)}
          >
            <IconSymbol name="chevron.right" size={20} color={colors.primary} style={{ transform: [{ rotate: "180deg" }] }} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-foreground">
            {selectedWorkflow?.name || "Workflow Editor"}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          {selectedWorkflow && (
            <>
              <TouchableOpacity 
                className="bg-success px-4 py-2 rounded-lg active:opacity-80"
                onPress={handleExecute}
              >
                <Text className="text-background font-semibold text-sm">Execute</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-primary px-4 py-2 rounded-lg active:opacity-80"
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold text-sm">Save</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Canvas */}
      <View className="flex-1 bg-background">
        <WorkflowCanvas />
      </View>

      {/* Bottom Toolbar */}
      <View className="px-4 py-2 border-t border-border bg-surface flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="bg-background px-3 py-2 rounded-lg active:opacity-80">
            <Text className="text-foreground text-xs font-semibold">+ Agent</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-background px-3 py-2 rounded-lg active:opacity-80">
            <Text className="text-foreground text-xs font-semibold">+ Condition</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-background px-3 py-2 rounded-lg active:opacity-80">
            <Text className="text-foreground text-xs font-semibold">+ Action</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="w-8 h-8 items-center justify-center active:opacity-80">
            <IconSymbol name="arrow.uturn.backward" size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity className="w-8 h-8 items-center justify-center active:opacity-80">
            <IconSymbol name="arrow.uturn.forward" size={18} color={colors.muted} />
          </TouchableOpacity>
          <View className="w-px h-6 bg-border mx-1" />
          <TouchableOpacity className="w-8 h-8 items-center justify-center active:opacity-80">
            <IconSymbol name="plus.magnifyingglass" size={18} color={colors.muted} />
          </TouchableOpacity>
          <TouchableOpacity className="w-8 h-8 items-center justify-center active:opacity-80">
            <IconSymbol name="minus.magnifyingglass" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
