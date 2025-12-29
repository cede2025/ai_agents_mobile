import { useState, useEffect, useRef } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { metricsService } from "@/lib/api";
import { wsClient } from "@/lib/websocket/client";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  source?: string;
}

export default function LogsScreen() {
  const colors = useColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>("all");

  useEffect(() => {
    fetchLogs();

    // Listen for real-time log updates via WebSocket
    const handleSystemLog = (log: any) => {
      setLogs((prev) => [...prev, log]);
      if (autoScroll) {
        scrollToBottom();
      }
    };

    wsClient.on("system:log", handleSystemLog);

    return () => {
      wsClient.off("system:log", handleSystemLog);
    };
  }, [autoScroll]);

  const fetchLogs = async () => {
    try {
      const data = await metricsService.getLogs(100);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return colors.error;
      case "warning":
        return colors.warning;
      case "info":
        return colors.success;
      case "debug":
        return colors.muted;
      default:
        return colors.foreground;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      case "debug":
        return "🔍";
      default:
        return "•";
    }
  };

  const filteredLogs = filterLevel === "all" 
    ? logs 
    : logs.filter(log => log.level === filterLevel);

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Loading logs...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-4 py-4 border-b border-border">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-foreground">System Logs</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity 
              className={`px-3 py-1 rounded-lg ${autoScroll ? "bg-primary" : "bg-surface"}`}
              onPress={() => setAutoScroll(!autoScroll)}
            >
              <Text className={`text-xs font-semibold ${autoScroll ? "text-background" : "text-muted"}`}>
                Auto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-surface px-3 py-1 rounded-lg active:opacity-80"
              onPress={clearLogs}
            >
              <Text className="text-xs font-semibold text-foreground">Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Buttons */}
        <View className="flex-row gap-2">
          {["all", "info", "warning", "error", "debug"].map((level) => (
            <TouchableOpacity
              key={level}
              className={`px-3 py-1 rounded-lg ${
                filterLevel === level ? "bg-primary" : "bg-surface"
              }`}
              onPress={() => setFilterLevel(level)}
            >
              <Text 
                className={`text-xs font-semibold ${
                  filterLevel === level ? "text-background" : "text-muted"
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logs List */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {filteredLogs.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-muted text-center">No logs to display</Text>
          </View>
        ) : (
          filteredLogs.map((log) => (
            <View 
              key={log.id} 
              className="bg-surface rounded-lg p-3 border border-border"
            >
              <View className="flex-row items-start gap-2">
                <Text style={{ color: getLevelColor(log.level) }}>
                  {getLevelIcon(log.level)}
                </Text>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text 
                      className="text-xs font-semibold uppercase"
                      style={{ color: getLevelColor(log.level) }}
                    >
                      {log.level}
                    </Text>
                    <Text className="text-xs text-muted">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text className="text-sm text-foreground font-mono">
                    {log.message}
                  </Text>
                  {log.source && (
                    <Text className="text-xs text-muted mt-1">
                      Source: {log.source}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Stats Footer */}
      <View className="px-4 py-3 border-t border-border bg-surface">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-muted">
            Total: {logs.length} logs
          </Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-xs text-success">
              Info: {logs.filter(l => l.level === "info").length}
            </Text>
            <Text className="text-xs text-warning">
              Warn: {logs.filter(l => l.level === "warning").length}
            </Text>
            <Text className="text-xs text-error">
              Error: {logs.filter(l => l.level === "error").length}
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
