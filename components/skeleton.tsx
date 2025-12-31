import { View } from "react-native";
import Animated, { useSharedValue, withRepeat, withSequence, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { useEffect } from "react";

export function Skeleton({ width, height, className }: { width: number; height: number; className?: string }) {
  const opacity = useSharedValue(0.3);
  
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      className="rounded-2xl bg-surface/50"
      style={[{ width, height }, animatedStyle]}
    />
  );
}
