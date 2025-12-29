import { useState, useRef, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { wsClient } from "@/lib/websocket/client";

interface TerminalLine {
  id: string;
  text: string;
  type: "input" | "output" | "error";
}

export default function TerminalScreen() {
  const colors = useColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: "welcome", text: "AI Agents Terminal v1.0", type: "output" },
    { id: "info", text: "Type 'help' for available commands", type: "output" },
    { id: "prompt", text: "", type: "output" },
  ]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [sshConfig, setSshConfig] = useState({
    host: "",
    port: "22",
    username: "",
  });
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    // Listen for terminal output from WebSocket
    const handleTerminalOutput = (data: any) => {
      addLine(data.text, data.error ? "error" : "output");
    };

    wsClient.on("terminal:output", handleTerminalOutput);

    return () => {
      wsClient.off("terminal:output", handleTerminalOutput);
    };
  }, []);

  const addLine = (text: string, type: TerminalLine["type"]) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      text,
      type,
    };
    setLines((prev) => [...prev, newLine]);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleConnect = () => {
    if (!sshConfig.host || !sshConfig.username) {
      addLine("Error: Host and username are required", "error");
      return;
    }

    addLine(`Connecting to ${sshConfig.username}@${sshConfig.host}:${sshConfig.port}...`, "output");
    
    // Send SSH connection request via WebSocket
    wsClient.send("terminal:connect", sshConfig);
    
    setIsConnected(true);
    setShowConfig(false);
    addLine("Connected successfully", "output");
  };

  const handleDisconnect = () => {
    wsClient.send("terminal:disconnect", {});
    setIsConnected(false);
    addLine("Disconnected from server", "output");
  };

  const handleCommand = () => {
    if (!input.trim()) return;

    // Add input to terminal
    addLine(`$ ${input}`, "input");

    // Handle local commands
    if (input === "clear") {
      setLines([]);
      setInput("");
      return;
    }

    if (input === "help") {
      addLine("Available commands:", "output");
      addLine("  help     - Show this help message", "output");
      addLine("  clear    - Clear terminal", "output");
      addLine("  connect  - Configure SSH connection", "output");
      addLine("  exit     - Disconnect from SSH", "output");
      addLine("", "output");
      addLine("When connected, all commands are sent to remote server", "output");
      setInput("");
      return;
    }

    if (input === "connect") {
      setShowConfig(true);
      setInput("");
      return;
    }

    if (input === "exit") {
      handleDisconnect();
      setInput("");
      return;
    }

    // Send command to remote server if connected
    if (isConnected) {
      wsClient.send("terminal:command", { command: input });
    } else {
      addLine(`Command not found: ${input}`, "error");
      addLine("Type 'connect' to establish SSH connection", "output");
    }

    setInput("");
  };

  const clearTerminal = () => {
    setLines([]);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="flex-1">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 py-4 border-b border-border">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-foreground">Terminal</Text>
              <Text className="text-xs text-muted mt-1">
                {isConnected ? `Connected to ${sshConfig.host}` : "Not connected"}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {isConnected ? (
                <TouchableOpacity 
                  className="bg-error px-3 py-1 rounded-lg active:opacity-80"
                  onPress={handleDisconnect}
                >
                  <Text className="text-background text-xs font-semibold">Disconnect</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  className="bg-primary px-3 py-1 rounded-lg active:opacity-80"
                  onPress={() => setShowConfig(true)}
                >
                  <Text className="text-background text-xs font-semibold">Connect</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                className="bg-surface px-3 py-1 rounded-lg active:opacity-80"
                onPress={clearTerminal}
              >
                <Text className="text-foreground text-xs font-semibold">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Terminal Output */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 bg-black px-4 py-3"
          contentContainerStyle={{ gap: 4 }}
        >
          {lines.map((line) => (
            <Text 
              key={line.id}
              className="font-mono text-sm"
              style={{
                color: line.type === "input" 
                  ? colors.success 
                  : line.type === "error" 
                  ? colors.error 
                  : colors.foreground
              }}
            >
              {line.text}
            </Text>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View className="px-4 py-3 border-t border-border bg-background">
          <View className="flex-row items-center gap-2">
            <Text className="text-success font-mono text-sm">$</Text>
            <View className="flex-1 bg-surface rounded-lg px-3 py-2 border border-border">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Enter command..."
                placeholderTextColor={colors.muted}
                className="text-foreground font-mono text-sm"
                returnKeyType="send"
                onSubmitEditing={handleCommand}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity 
              className="bg-primary w-10 h-10 rounded-lg items-center justify-center active:opacity-80"
              onPress={handleCommand}
            >
              <IconSymbol name="paperplane.fill" size={16} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SSH Config Modal */}
        {showConfig && (
          <View className="absolute inset-0 bg-black/80 items-center justify-center px-6">
            <View className="bg-surface rounded-2xl p-6 w-full max-w-md border border-border">
              <Text className="text-xl font-bold text-foreground mb-4">SSH Connection</Text>
              
              <View className="gap-3">
                <View>
                  <Text className="text-sm text-muted mb-1">Host</Text>
                  <TextInput
                    value={sshConfig.host}
                    onChangeText={(text) => setSshConfig({ ...sshConfig, host: text })}
                    placeholder="example.com or 192.168.1.1"
                    placeholderTextColor={colors.muted}
                    className="bg-background rounded-lg px-3 py-2 text-foreground border border-border"
                    autoCapitalize="none"
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-1">Port</Text>
                  <TextInput
                    value={sshConfig.port}
                    onChangeText={(text) => setSshConfig({ ...sshConfig, port: text })}
                    placeholder="22"
                    placeholderTextColor={colors.muted}
                    className="bg-background rounded-lg px-3 py-2 text-foreground border border-border"
                    keyboardType="number-pad"
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-1">Username</Text>
                  <TextInput
                    value={sshConfig.username}
                    onChangeText={(text) => setSshConfig({ ...sshConfig, username: text })}
                    placeholder="root"
                    placeholderTextColor={colors.muted}
                    className="bg-background rounded-lg px-3 py-2 text-foreground border border-border"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View className="flex-row gap-2 mt-6">
                <TouchableOpacity 
                  className="flex-1 bg-surface rounded-lg py-3 active:opacity-80"
                  onPress={() => setShowConfig(false)}
                >
                  <Text className="text-foreground text-center font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 bg-primary rounded-lg py-3 active:opacity-80"
                  onPress={handleConnect}
                >
                  <Text className="text-background text-center font-semibold">Connect</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
