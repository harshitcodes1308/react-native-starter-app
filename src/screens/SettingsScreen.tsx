import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppColors } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { LocalStorageService } from '../services/LocalStorageService';
import { AppSettings, NegotiationMode } from '../types/session';
import { getModeConfig } from '../ai/patternLibrary';

type SettingsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Settings'>;
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [storageInfo, setStorageInfo] = useState<{ keys: number; estimatedSize: string } | null>(
    null
  );

  useEffect(() => {
    loadSettings();
    loadStorageInfo();
  }, []);

  const loadSettings = async () => {
    const loadedSettings = await LocalStorageService.getSettings();
    setSettings(loadedSettings);
  };

  const loadStorageInfo = async () => {
    const info = await LocalStorageService.getStorageInfo();
    setStorageInfo(info);
  };

  const saveSettings = async (newSettings: AppSettings) => {
    await LocalStorageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all sessions? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await LocalStorageService.clearAllData();
            await loadStorageInfo();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  if (!settings) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  const modeConfig = getModeConfig(settings.defaultMode);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your Latent experience</Text>
        </View>

        {/* Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Mode</Text>
          <TouchableOpacity
            style={styles.modeButton}
            onPress={() => {
              Alert.alert(
                'Select Default Mode',
                'Choose your default negotiation mode',
                [
                  NegotiationMode.JOB_INTERVIEW,
                  NegotiationMode.SALES,
                  NegotiationMode.STARTUP_PITCH,
                  NegotiationMode.SALARY_RAISE,
                ].map((mode) => ({
                  text: getModeConfig(mode).displayName,
                  onPress: () => saveSettings({ ...settings, defaultMode: mode }),
                }))
              );
            }}
          >
            <Text style={styles.modeIcon}>{modeConfig.icon}</Text>
            <View style={styles.modeInfo}>
              <Text style={styles.modeName}>{modeConfig.displayName}</Text>
              <Text style={styles.modeDescription}>{modeConfig.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Pattern Detection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pattern Detection</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sensitivity</Text>
              <Text style={styles.settingDescription}>
                {settings.patternSensitivity < 0.8
                  ? 'Low - Fewer false positives'
                  : settings.patternSensitivity <= 1.2
                    ? 'Normal - Balanced detection'
                    : 'High - More patterns detected'}
              </Text>
            </View>
            <View style={styles.sensitivityButtons}>
              <TouchableOpacity
                style={[
                  styles.sensitivityButton,
                  settings.patternSensitivity <= 0.7 && styles.sensitivityButtonActive,
                ]}
                onPress={() => saveSettings({ ...settings, patternSensitivity: 0.7 })}
              >
                <Text
                  style={[
                    styles.sensitivityButtonText,
                    settings.patternSensitivity <= 0.7 && styles.sensitivityButtonTextActive,
                  ]}
                >
                  Low
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sensitivityButton,
                  settings.patternSensitivity === 1.0 && styles.sensitivityButtonActive,
                ]}
                onPress={() => saveSettings({ ...settings, patternSensitivity: 1.0 })}
              >
                <Text
                  style={[
                    styles.sensitivityButtonText,
                    settings.patternSensitivity === 1.0 && styles.sensitivityButtonTextActive,
                  ]}
                >
                  Normal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sensitivityButton,
                  settings.patternSensitivity >= 1.3 && styles.sensitivityButtonActive,
                ]}
                onPress={() => saveSettings({ ...settings, patternSensitivity: 1.3 })}
              >
                <Text
                  style={[
                    styles.sensitivityButtonText,
                    settings.patternSensitivity >= 1.3 && styles.sensitivityButtonTextActive,
                  ]}
                >
                  High
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Session Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Save</Text>
              <Text style={styles.settingDescription}>Saves session every 45 seconds</Text>
            </View>
            <Switch
              value={settings.enableAutoSave}
              onValueChange={(value) => saveSettings({ ...settings, enableAutoSave: value })}
              trackColor={{ false: AppColors.textMuted, true: AppColors.accentCyan }}
              thumbColor={AppColors.textPrimary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>Vibrate on pattern detection</Text>
            </View>
            <Switch
              value={settings.enableHapticFeedback}
              onValueChange={(value) => saveSettings({ ...settings, enableHapticFeedback: value })}
              trackColor={{ false: AppColors.textMuted, true: AppColors.accentCyan }}
              thumbColor={AppColors.textPrimary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Suggestion Notifications</Text>
              <Text style={styles.settingDescription}>Show notifications for suggestions</Text>
            </View>
            <Switch
              value={settings.enableSuggestionNotifications}
              onValueChange={(value) =>
                saveSettings({ ...settings, enableSuggestionNotifications: value })
              }
              trackColor={{ false: AppColors.textMuted, true: AppColors.accentCyan }}
              thumbColor={AppColors.textPrimary}
            />
          </View>
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>

          {storageInfo && (
            <View style={styles.storageInfo}>
              <View style={styles.storageRow}>
                <Text style={styles.storageLabel}>Total Sessions</Text>
                <Text style={styles.storageValue}>{storageInfo.keys}</Text>
              </View>
              <View style={styles.storageRow}>
                <Text style={styles.storageLabel}>Storage Used</Text>
                <Text style={styles.storageValue}>{storageInfo.estimatedSize}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>100% Private & Offline</Text>
            <Text style={styles.privacyDescription}>
              All data is stored locally on your device. No cloud sync. No external servers. No data
              ever leaves your device.
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Latent</Text>
          <Text style={styles.aboutSubtitle}>Offline Meeting Intelligence</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primaryDark,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceCard,
    padding: 16,
    borderRadius: 12,
  },
  modeIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 24,
    color: AppColors.textMuted,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 16,
  },
  sensitivityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sensitivityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: AppColors.primaryMid,
    borderWidth: 1,
    borderColor: AppColors.textMuted + '40',
  },
  sensitivityButtonActive: {
    backgroundColor: AppColors.accentCyan,
    borderColor: AppColors.accentCyan,
  },
  sensitivityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  sensitivityButtonTextActive: {
    color: AppColors.textPrimary,
  },
  storageInfo: {
    backgroundColor: AppColors.surfaceCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  storageLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  dangerButton: {
    backgroundColor: AppColors.error + '20',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.error + '40',
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.error,
  },
  privacyNotice: {
    flexDirection: 'row',
    backgroundColor: AppColors.surfaceCard + '80',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.accentCyan + '30',
    marginBottom: 32,
  },
  privacyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  aboutSection: {
    alignItems: 'center',
    paddingTop: 16,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  aboutSubtitle: {
    fontSize: 14,
    color: AppColors.accentCyan,
    marginBottom: 12,
  },
  aboutVersion: {
    fontSize: 12,
    color: AppColors.textMuted,
  },
});
