import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { WorkflowCanvas } from "@/components/workflow-canvas";
import { workflowsService } from "@/lib/api";
import type { Workflow } from "@/lib/api/types";
import { wsEvents } from "@/lib/websocket/client";

export default function WorkflowScreen() {
  const colors = useColors();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();

    // Listen for workflow completion events
    const handleWorkflowCompleted = (event: any) => {
      console.log("Workflow completed:", event);
      fetchWorkflows(); // Refresh list
    };

    wsEvents.onWorkflowCompleted(handleWorkflowCompleted);

    return () => {
      wsEvents.offWorkflowCompleted(handleWorkflowCompleted);
    };
  }, []);

  const fetchWorkflows = async () => {
    try {
      const data = await workflowsService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      if (selectedWorkflow.id) {
        await workflowsService.updateWorkflow(selectedWorkflow.id, selectedWorkflow);
      } else {
        await workflowsService.createWorkflow(selectedWorkflow);
      }
      setSelectedWorkflow(null);
      fetchWorkflows();
    } catch (error) {
      console.error("Failed to save workflow:", error);
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await workflowsService.executeWorkflow(workflowId);
      console.log("Workflow execution started");
    } catch (error) {
      console.error("Failed to execute workflow:", error);
    }
  };

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
              <Text className="text-lg font-semibold text-foreground">{selectedWorkflow.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-primary px-4 py-2 rounded-full active:opacity-80"
              onPress={handleSaveWorkflow}
            >
              <Text className="text-background font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Canvas */}
        <WorkflowCanvas />
      </ScreenContainer>
    );
  }

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Loading workflows...</Text>
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
            <TouchableOpacity 
              className="bg-primary px-4 py-2 rounded-full active:opacity-80"
              onPress={() => setSelectedWorkflow({
                id: "",
                name: "New Workflow",
                description: "",
                nodes: [],
                connections: [],
                metadata: {
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  status: "idle",
                  agentCount: 0,
                },
              })}
            >
              <Text className="text-background font-semibold">New</Text>
            </TouchableOpacity>
          </View>

          {/* Workflow Cards */}
          {workflows.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <IconSymbol name="arrow.triangle.branch" size={64} color={colors.muted} />
              <Text className="text-muted text-center mt-4">
                No workflows yet. Create your first workflow to get started.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {workflows.map((workflow) => {
                const statusColors = {
                  active: colors.success,
                  idle: colors.muted,
                  processing: colors.warning,
                };

                return (
                  <TouchableOpacity 
                    key={workflow.id}
                    className="bg-surface rounded-2xl p-4 border border-border active:opacity-80"
                    onPress={() => setSelectedWorkflow(workflow)}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-lg font-semibold text-foreground">{workflow.name}</Text>
                      <IconSymbol name="arrow.triangle.branch" size={24} color={colors.primary} />
                    </View>
                    <Text className="text-sm text-muted mb-2">
                      {workflow.metadata.agentCount} agents • Last modified{" "}
                      {new Date(workflow.metadata.updatedAt).toLocaleDateString()}
                    </Text>
                    <View className="flex-row gap-2">
                      <View 
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: `${statusColors[workflow.metadata.status]}20` }}
                      >
                        <Text 
                          className="text-xs"
                          style={{ color: statusColors[workflow.metadata.status] }}
                        >
                          {workflow.metadata.status.charAt(0).toUpperCase() + workflow.metadata.status.slice(1)}
                        </Text>
                      </View>
                      {workflow.metadata.status === "idle" && (
                        <TouchableOpacity
                          className="bg-primary/20 px-2 py-1 rounded active:opacity-80"
                          onPress={(e) => {
                            e.stopPropagation();
                            handleExecuteWorkflow(workflow.id);
                          }}
                        >
                          <Text className="text-xs text-primary">Execute</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
