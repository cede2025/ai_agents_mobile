import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { PressableAnimated } from "./pressable-animated";

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PressableAnimated
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.selectionAsync();
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
