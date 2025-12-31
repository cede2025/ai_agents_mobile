import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  edges?: Edge[];
  className?: string;
  containerClassName?: string;
  safeAreaClassName?: string;
  blur?: boolean;
}

/**
 * A container component that properly handles SafeArea and background colors.
 *
 * The outer View extends to full screen (including status bar area) with the background color,
 * while the inner SafeAreaView ensures content is within safe bounds.
 *
 * Usage:
 * ```tsx
 * <ScreenContainer className="p-4">
 *   <Text className="text-2xl font-bold text-foreground">
 *     Welcome
 *   </Text>
 * </ScreenContainer>
 * ```
 */
export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  blur = false,
  style,
  ...props
}: ScreenContainerProps) {
  return (
    <View className={cn("flex-1 bg-background", containerClassName)} {...props}>
      <SafeAreaView edges={edges} className={cn("flex-1", safeAreaClassName)} style={style}>
        {blur ? (
          <BlurView intensity={80} className="flex-1">
            <View className={cn("flex-1", className)}>{children}</View>
          </BlurView>
        ) : (
          <View className={cn("flex-1", className)}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}
