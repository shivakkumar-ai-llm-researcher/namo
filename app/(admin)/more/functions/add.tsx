import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../src/theme';
import { useAuthStore } from '../../../../src/store';
import { functionService } from '../../../../src/services';
import { Input, Button } from '../../../../src/components/ui';
import { FunctionType, FunctionStatus } from '../../../../src/types/function';
import { getErrorMessage } from '../../../../src/utils';

export default function CreateFunctionScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<FunctionType>('ANNUAL');
  const [startYear, setStartYear] = useState(String(new Date().getFullYear()));
  const [endYear, setEndYear] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<FunctionStatus>('active');
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (newType: FunctionType) => {
    setType(newType);
    if (newType === 'FOUR_YEAR') {
      const start = parseInt(startYear, 10) || new Date().getFullYear();
      setEndYear(String(start + 3));
      if (!name) setName(`${start}–${start + 3} Gokulaashdami`);
    } else {
      setEndYear('');
      if (!name) setName(`${startYear} Purattasi Sani Kiyamai`);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a function name');
      return;
    }
    const startY = parseInt(startYear, 10);
    if (isNaN(startY) || startY < 2000 || startY > 2100) {
      Alert.alert('Validation Error', 'Please enter a valid start year (2000-2100)');
      return;
    }
    let endY: number | undefined = undefined;
    if (type === 'FOUR_YEAR') {
      endY = parseInt(endYear, 10);
      if (isNaN(endY) || endY <= startY) {
        Alert.alert('Validation Error', 'End year must be greater than start year');
        return;
      }
    }

    const userId = user?.id;
    if (!userId) {
      Alert.alert('Session Expired', 'Please log in again.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
      return;
    }

    setLoading(true);
    try {
      await functionService.create(
        {
          name: name.trim(),
          type,
          start_year: startY,
          end_year: endY,
          description: description.trim() || undefined,
          status,
        },
        userId
      );

      Alert.alert('Success', 'Function created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const statuses: { value: FunctionStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'planning', label: 'Planning' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={{
          paddingTop: 54,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
          Create Function
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 100 }}>
        {/* Function Type Selector */}
        <View>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Function Type *
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TouchableOpacity
              onPress={() => handleTypeChange('ANNUAL')}
              style={{
                flex: 1,
                padding: spacing.md,
                borderRadius: borderRadius.md,
                backgroundColor: type === 'ANNUAL' ? colors.primaryLight : colors.surface,
                borderWidth: 1.5,
                borderColor: type === 'ANNUAL' ? colors.primary : colors.border,
                alignItems: 'center',
              }}
            >
              <Ionicons name="calendar" size={24} color={type === 'ANNUAL' ? colors.primary : colors.textSecondary} />
              <Text style={{ color: type === 'ANNUAL' ? colors.primary : colors.textPrimary, fontWeight: fontWeight.bold, fontSize: fontSize.sm, marginTop: spacing.xs }}>
                Purattasi Sani Kiyamai
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                Yearly Function
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTypeChange('FOUR_YEAR')}
              style={{
                flex: 1,
                padding: spacing.md,
                borderRadius: borderRadius.md,
                backgroundColor: type === 'FOUR_YEAR' ? colors.primaryLight : colors.surface,
                borderWidth: 1.5,
                borderColor: type === 'FOUR_YEAR' ? colors.primary : colors.border,
                alignItems: 'center',
              }}
            >
              <Ionicons name="infinite" size={24} color={type === 'FOUR_YEAR' ? colors.primary : colors.textSecondary} />
              <Text style={{ color: type === 'FOUR_YEAR' ? colors.primary : colors.textPrimary, fontWeight: fontWeight.bold, fontSize: fontSize.sm, marginTop: spacing.xs }}>
                Gokulaashdami
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                4-Year Once Function
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Function Name */}
        <Input
          label="Function Name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g. 2026 Purattasi Sani Kiyamai"
          leftIcon={<Ionicons name="bookmark-outline" size={18} color={colors.textTertiary} />}
        />

        {/* Year Inputs */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Start Year *"
              value={startYear}
              onChangeText={setStartYear}
              keyboardType="number-pad"
              placeholder="2026"
            />
          </View>
          {type === 'FOUR_YEAR' && (
            <View style={{ flex: 1 }}>
              <Input
                label="End Year *"
                value={endYear}
                onChangeText={setEndYear}
                keyboardType="number-pad"
                placeholder="2029"
              />
            </View>
          )}
        </View>

        {/* Status Selector */}
        <View>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Initial Status *
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {statuses.map((s) => {
              const isSelected = status === s.value;
              return (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => setStatus(s.value)}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.sm,
                    borderRadius: borderRadius.md,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: isSelected ? 'white' : colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <Input
          label="Description / Objective"
          value={description}
          onChangeText={setDescription}
          placeholder="Purpose and goals of this function..."
          multiline
          numberOfLines={3}
        />

        <Button
          title="Create Function"
          onPress={handleSubmit}
          loading={loading}
          size="lg"
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
