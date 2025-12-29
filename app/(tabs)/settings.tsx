import { ScrollView, Text, View, TouchableOpacity, Switch, Modal, TextInput } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ModelConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxTokens: number;
  contextLength: number;
}

export default function SettingsScreen() {
  const colors = useColors();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [showModelConfig, setShowModelConfig] = useState(false);
  
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxTokens: 2048,
    contextLength: 2048,
  });

  const saveModelConfig = async (config: ModelConfig) => {
    try {
      await AsyncStorage.setItem("model_config", JSON.stringify(config));
      setModelConfig(config);
    } catch (error) {
      console.error("Failed to save model config:", error);
    }
  };

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

  const Slider = ({ 
    label, 
    value, 
    min, 
    max, 
    step, 
    onChange 
  }: { 
    label: string; 
    value: number; 
    min: number; 
    max: number; 
    step: number; 
    onChange: (value: number) => void;
  }) => (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-sm text-primary font-mono">{value}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          className="w-8 h-8 bg-surface rounded-lg items-center justify-center active:opacity-80"
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text className="text-foreground font-bold">−</Text>
        </TouchableOpacity>
        <View className="flex-1 h-2 bg-surface rounded-full">
          <View 
            className="h-full bg-primary rounded-full"
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          />
        </View>
        <TouchableOpacity
          className="w-8 h-8 bg-surface rounded-lg items-center justify-center active:opacity-80"
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text className="text-foreground font-bold">+</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-xs text-muted">{min}</Text>
        <Text className="text-xs text-muted">{max}</Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      <ScrollView>
        {/* Header */}
        <View className="px-6 py-6">
          <Text className="text-3xl font-bold text-foreground">Settings</Text>
        </View>

        {/* Model Configuration Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted px-6 mb-2">MODEL CONFIGURATION</Text>
          <View className="bg-surface">
            <SettingRow
              icon="cpu.fill"
              title="Model Parameters"
              subtitle={`Temp: ${modelConfig.temperature} • Top-K: ${modelConfig.topK} • Max: ${modelConfig.maxTokens}`}
              onPress={() => setShowModelConfig(true)}
            />
          </View>
        </View>

        {/* Translation Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted px-6 mb-2">TRANSLATION</Text>
          <View className="bg-surface">
            <SettingRow
              icon="globe"
              title="Auto-translate"
              subtitle="Translate PL↔EN for local models"
              rightElement={
                <Switch
                  value={translationEnabled}
                  onValueChange={setTranslationEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              }
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted px-6 mb-2">APPEARANCE</Text>
          <View className="bg-surface">
            <SettingRow
              icon="moon.fill"
              title="Dark Mode"
              subtitle="OLED black theme"
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

        {/* Notifications Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted px-6 mb-2">NOTIFICATIONS</Text>
          <View className="bg-surface">
            <SettingRow
              icon="bell.fill"
              title="Push Notifications"
              subtitle="Agent task completion alerts"
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

        {/* API Configuration Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted px-6 mb-2">API</Text>
          <View className="bg-surface">
            <SettingRow
              icon="server.rack"
              title="Backend URL"
              subtitle="http://localhost:8000"
              onPress={() => {}}
            />
            <View className="h-px bg-border mx-4" />
            <SettingRow
              icon="key.fill"
              title="API Keys"
              subtitle="Manage external API keys"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* About Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted px-6 mb-2">ABOUT</Text>
          <View className="bg-surface">
            <SettingRow
              icon="info.circle.fill"
              title="Version"
              subtitle="1.0.0"
              rightElement={<View />}
            />
            <View className="h-px bg-border mx-4" />
            <SettingRow
              icon="doc.text.fill"
              title="Documentation"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>

      {/* Model Configuration Modal */}
      <Modal
        visible={showModelConfig}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModelConfig(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-background rounded-t-3xl p-6 border-t border-border max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Model Parameters</Text>
              <TouchableOpacity onPress={() => setShowModelConfig(false)}>
                <Text className="text-primary font-semibold">Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Slider
                label="Temperature"
                value={modelConfig.temperature}
                min={0}
                max={2}
                step={0.1}
                onChange={(value) => saveModelConfig({ ...modelConfig, temperature: value })}
              />

              <Slider
                label="Top-K"
                value={modelConfig.topK}
                min={1}
                max={100}
                step={1}
                onChange={(value) => saveModelConfig({ ...modelConfig, topK: value })}
              />

              <Slider
                label="Top-P (Nucleus Sampling)"
                value={modelConfig.topP}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => saveModelConfig({ ...modelConfig, topP: value })}
              />

              <Slider
                label="Max Tokens"
                value={modelConfig.maxTokens}
                min={128}
                max={8192}
                step={128}
                onChange={(value) => saveModelConfig({ ...modelConfig, maxTokens: value })}
              />

              <Slider
                label="Context Length"
                value={modelConfig.contextLength}
                min={512}
                max={8192}
                step={512}
                onChange={(value) => saveModelConfig({ ...modelConfig, contextLength: value })}
              />

              <View className="bg-surface rounded-xl p-4 mt-4">
                <Text className="text-xs text-muted leading-relaxed">
                  <Text className="font-semibold">Temperature:</Text> Controls randomness (0=deterministic, 2=very creative){"\n\n"}
                  <Text className="font-semibold">Top-K:</Text> Limits vocabulary to K most likely tokens{"\n\n"}
                  <Text className="font-semibold">Top-P:</Text> Cumulative probability threshold{"\n\n"}
                  <Text className="font-semibold">Max Tokens:</Text> Maximum response length{"\n\n"}
                  <Text className="font-semibold">Context:</Text> Maximum conversation history
                </Text>
              </View>

              <TouchableOpacity
                className="bg-error mt-6 py-4 rounded-xl active:opacity-80"
                onPress={() => {
                  const defaults: ModelConfig = {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxTokens: 2048,
                    contextLength: 2048,
                  };
                  saveModelConfig(defaults);
                }}
              >
                <Text className="text-background text-center font-semibold">Reset to Defaults</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
