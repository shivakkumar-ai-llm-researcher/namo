import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../src/theme';
import { useFunctionStore } from '../../../../src/store';
import { functionService } from '../../../../src/services';
import { Card, Button, Badge, Input } from '../../../../src/components/ui';
import { formatCurrency, formatFunctionType, formatFunctionStatus } from '../../../../src/utils/formatters';
import { CommunityFunction, FunctionStatus } from '../../../../src/types/function';
import { getErrorMessage } from '../../../../src/utils';

export default function FunctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();
  const { setActiveFunction } = useFunctionStore();

  const [func, setFunc] = useState<CommunityFunction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<FunctionStatus>('active');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!id) return;
    functionService
      .getById(id)
      .then((res) => {
        setFunc(res);
        setStatus(res.status);
        setName(res.name);
        setDescription(res.description || '');
        setLoading(false);
      })
      .catch((e) => {
        Alert.alert('Error', getErrorMessage(e));
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    if (!id || !func) return;
    setSaving(true);
    try {
      const updated = await functionService.update(id, {
        name: name.trim(),
        status,
        description: description.trim() || undefined,
      });
      setFunc(updated);
      if (status === 'active') {
        setActiveFunction(updated);
      }
      Alert.alert('Success', 'Function updated successfully');
    } catch (e) {
      Alert.alert('Update Failed', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleMakeActive = async () => {
    if (!id || !func) return;
    setSaving(true);
    try {
      const updated = await functionService.update(id, { status: 'active' });
      setFunc(updated);
      setStatus('active');
      setActiveFunction(updated);
      Alert.alert('Activated', `"${updated.name}" is now set as the active function.`);
    } catch (e) {
      Alert.alert('Activation Failed', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!func) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Function not found</Text>
      </View>
    );
  }

  const statuses: { value: FunctionStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'planning', label: 'Planning' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
          Function Details
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 100 }}>
        {/* Info Card */}
        <Card variant="default">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Badge label={formatFunctionType(func.type)} variant="primary" />
            <Badge label={formatFunctionStatus(status)} variant={status === 'active' ? 'success' : 'default'} />
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
            {func.name}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
            Duration: {func.start_year}{func.end_year ? ` – ${func.end_year}` : ''}
          </Text>
        </Card>

        {/* Set as Active Function Button */}
        {func.status !== 'active' && (
          <Button
            title="Set as Current Active Function"
            onPress={handleMakeActive}
            loading={saving}
            variant="outline"
          />
        )}

        {/* Edit fields */}
        <Card variant="default">
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.md }}>
            Edit Information
          </Text>

          <Input
            label="Function Name"
            value={name}
            onChangeText={setName}
          />

          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
              Status
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

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: spacing.sm }}
          />
        </Card>
      </ScrollView>
    </View>
  );
}
