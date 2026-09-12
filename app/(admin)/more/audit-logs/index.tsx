import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../src/theme';
import { auditService } from '../../../../src/services';
import { Card, Badge, EmptyState } from '../../../../src/components/ui';
import { formatDateTime } from '../../../../src/utils/formatters';
import { AuditLog, AuditAction } from '../../../../src/types/audit';

export default function AuditLogsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('all');

  const loadLogs = async () => {
    try {
      const res = await auditService.getAll(1, 50);
      setLogs(res.data);
    } catch (e) {
      console.warn('Error loading audit logs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [])
  );

  const getActionBadgeVariant = (action: AuditAction) => {
    switch (action) {
      case 'created': return 'success';
      case 'updated': return 'warning';
      case 'deleted': return 'error';
      default: return 'default';
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (filterAction === 'all') return true;
    return l.action === filterAction;
  });

  const actions = ['all', 'created', 'updated', 'deleted'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 54,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
              Financial Audit Logs
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>
              Immutable record of all modifications
            </Text>
          </View>
        </View>

        {/* Filter chips */}
        <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
          {actions.map((act) => {
            const isSelected = filterAction === act;
            return (
              <TouchableOpacity
                key={act}
                onPress={() => setFilterAction(act)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.full,
                  backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? 'white' : colors.textSecondary,
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.medium,
                    textTransform: 'capitalize',
                  }}
                >
                  {act}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: 90 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadLogs(); }} />}
          ListEmptyComponent={
            <EmptyState
              icon="shield-checkmark-outline"
              title="No Audit Entries"
              description="Financial changes such as creating, modifying, or deleting contributions and expenses will be recorded here."
            />
          }
          renderItem={({ item }) => (
            <Card variant="default" padding="md">
              <View style={{ gap: spacing.xs }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Badge label={item.action.toUpperCase()} variant={getActionBadgeVariant(item.action)} size="sm" />
                    <Badge label={item.entity.toUpperCase()} variant="default" size="sm" />
                  </View>
                  <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>
                    {formatDateTime(item.created_at)}
                  </Text>
                </View>

                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginTop: 2 }}>
                  {item.action.toUpperCase()} {item.entity} (ID: {item.entity_id.slice(0, 8)}...)
                </Text>

                {item.profile?.full_name && (
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    Performed by: <Text style={{ fontWeight: fontWeight.bold }}>{item.profile.full_name}</Text>
                  </Text>
                )}

                {/* Values summary if available */}
                {item.new_value && (
                  <View style={{ backgroundColor: colors.surfaceVariant, padding: spacing.sm, borderRadius: borderRadius.sm, marginTop: 4 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                      {JSON.stringify(item.new_value, null, 1).replace(/[\{\}\"]/g, '').trim()}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
