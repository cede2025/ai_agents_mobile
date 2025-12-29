import { ScrollView, Text, View, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function SettingsScreen() {
  const colors = useColors();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      className="flex-row items-center py-4 px-4 active:opacity-80"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="w-10 h-10 bg-surface rounded-full items-center justify-center mr-4">
        <IconSymbol name={icon as any} size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        {subtitle && <Text className="text-sm text-muted mt-1">{subtitle}</Text>}
      </View>
      {rightElement || <IconSymbol name="chevron.right" size={20} color={colors.muted} />}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="flex-1">
      <ScrollView>
        {/* Header */}
        <View className="px-6 py-6">
          <Text className="text-3xl font-bold text-foreground">Settings</Text>
        </View>

        {/* Account Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted uppercase px-6 mb-2">Account</Text>
          <View className="bg-surface mx-4 rounded-2xl overflow-hidden">
            <SettingRow
              icon="house.fill"
              title="Profile"
              subtitle="Manage your account"
              onPress={() => {}}
            />
            <View className="h-[1px] bg-border ml-14" />
            <SettingRow
              icon="bell.fill"
              title="Notifications"
              subtitle="Push notifications"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              }
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted uppercase px-6 mb-2">Appearance</Text>
          <View className="bg-surface mx-4 rounded-2xl overflow-hidden">
            <SettingRow
              icon="gearshape.fill"
              title="Dark Mode"
              subtitle="Use dark theme"
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              }
            />
          </View>
        </View>

        {/* API Configuration Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted uppercase px-6 mb-2">API</Text>
          <View className="bg-surface mx-4 rounded-2xl overflow-hidden">
            <SettingRow
              icon="chevron.left.forwardslash.chevron.right"
              title="API Keys"
              subtitle="Manage API credentials"
              onPress={() => {}}
            />
            <View className="h-[1px] bg-border ml-14" />
            <SettingRow
              icon="gearshape.fill"
              title="Endpoints"
              subtitle="Configure API endpoints"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* About Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted uppercase px-6 mb-2">About</Text>
          <View className="bg-surface mx-4 rounded-2xl overflow-hidden">
            <SettingRow
              icon="house.fill"
              title="Version"
              subtitle="1.0.0"
              rightElement={<View />}
            />
            <View className="h-[1px] bg-border ml-14" />
            <SettingRow
              icon="house.fill"
              title="Help & Support"
              onPress={() => {}}
            />
            <View className="h-[1px] bg-border ml-14" />
            <SettingRow
              icon="house.fill"
              title="Privacy Policy"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
