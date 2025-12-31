import { Pressable, PressableProps } from "react-native";
import Animated, { useSharedValue, withSpring, useAnimatedStyle, WithSpringConfig } from "react-native-reanimated";

export function PressableAnimated({ children, ...props }: PressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const springConfig: WithSpringConfig = {
    mass: 0.3,
    stiffness: 300,
    damping: 20,
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        {...props}
        onPressIn={(e) => {
          scale.value = withSpring(0.96, springConfig);
          props.onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, springConfig);
          props.onPressOut?.(e);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
