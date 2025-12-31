import { View, Text, TouchableOpacity } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-16 h-16 bg-surface/10 rounded-3xl items-center justify-center mb-4">
        <IconSymbol name={icon as any} size={32} color="#8B5CF6" />
      </View>
      <Text className="text-[17px] font-medium text-foreground mb-2">{title}</Text>
      <Text className="text-muted text-[15px] px-8 text-center">{subtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity className="mt-4 bg-surface/50 rounded-2xl px-6 py-3" onPress={onAction}>
          <Text className="text-primary text-[15px] font-medium">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
