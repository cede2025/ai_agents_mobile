import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import Svg, { Line, Circle } from "react-native-svg";

interface Node {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

export function WorkflowCanvas() {
  const colors = useColors();

  const nodes: Node[] = [
    { id: "1", name: "Input", type: "Data Source", x: 50, y: 100 },
    { id: "2", name: "Analyzer", type: "Processing", x: 200, y: 100 },
    { id: "3", name: "Filter", type: "Logic", x: 200, y: 250 },
    { id: "4", name: "Output", type: "Result", x: 350, y: 175 },
  ];

  const connections: Connection[] = [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "2", to: "4" },
    { from: "3", to: "4" },
  ];

  const getNodePosition = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    return node ? { x: node.x + 40, y: node.y + 40 } : { x: 0, y: 0 };
  };

  return (
    <View className="flex-1 bg-background">
      {/* Canvas Area */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ minHeight: 600, minWidth: 500 }}
      >
        <View className="relative" style={{ height: 600, width: 500 }}>
          {/* Connection Lines */}
          <Svg style={{ position: "absolute", top: 0, left: 0, width: 500, height: 600 }}>
            {connections.map((conn, idx) => {
              const from = getNodePosition(conn.from);
              const to = getNodePosition(conn.to);
              return (
                <Line
                  key={idx}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={colors.primary}
                  strokeWidth="2"
                />
              );
            })}
          </Svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <TouchableOpacity
              key={node.id}
              className="absolute bg-surface border-2 rounded-2xl p-4 active:opacity-80"
              style={{
                left: node.x,
                top: node.y,
                width: 80,
                height: 80,
                borderColor: colors.primary,
              }}
            >
              <View className="items-center justify-center flex-1">
                <IconSymbol
                  name="chevron.left.forwardslash.chevron.right"
                  size={24}
                  color={colors.primary}
                />
                <Text className="text-xs text-foreground font-semibold mt-1 text-center">
                  {node.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Node Palette */}
      <View className="bg-surface border-t border-border p-4">
        <Text className="text-sm font-semibold text-muted mb-3">Add Nodes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            <TouchableOpacity className="bg-background border border-border rounded-xl p-3 items-center active:opacity-80" style={{ width: 80 }}>
              <IconSymbol name="house.fill" size={24} color={colors.primary} />
              <Text className="text-xs text-foreground mt-1">Input</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-background border border-border rounded-xl p-3 items-center active:opacity-80" style={{ width: 80 }}>
              <IconSymbol name="gearshape.fill" size={24} color={colors.primary} />
              <Text className="text-xs text-foreground mt-1">Process</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-background border border-border rounded-xl p-3 items-center active:opacity-80" style={{ width: 80 }}>
              <IconSymbol name="chart.bar.fill" size={24} color={colors.success} />
              <Text className="text-xs text-foreground mt-1">Analyze</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-background border border-border rounded-xl p-3 items-center active:opacity-80" style={{ width: 80 }}>
              <IconSymbol name="arrow.triangle.branch" size={24} color={colors.warning} />
              <Text className="text-xs text-foreground mt-1">Branch</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-background border border-border rounded-xl p-3 items-center active:opacity-80" style={{ width: 80 }}>
              <IconSymbol name="paperplane.fill" size={24} color={colors.error} />
              <Text className="text-xs text-foreground mt-1">Output</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
