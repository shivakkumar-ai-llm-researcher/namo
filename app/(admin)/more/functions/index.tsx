import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../src/theme';
import { useFunctionStore } from '../../../../src/store';
import { functionService } from '../../../../src/services';
import { Card, Badge, EmptyState } from '../../../../src/components/ui';
import { formatFunctionType, formatFunctionStatus } from '../../../../src/utils/formatters';
import { CommunityFunction } from '../../../../src/types';

export default function FunctionsListScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();
  const { functions, setFunctions } = useFunctionStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFunctions = async () => {
    try {
      const data = await functionService.getAll();
      setFunctions(data);
    } catch (e) {
      console.warn('Error loading functions:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFunctions();
    }, [])
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'planning': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
            Community Functions
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/more/functions/add')}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs + 2,
            borderRadius: borderRadius.md,
          }}
        >
          <Text style={{ color: 'white', fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>
            + Create
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={functions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFunctions(); }} />}
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="No Functions Found"
              description="Create a community function (Annual or Four-Year) to start tracking financial records."
              actionLabel="Create Function"
              onAction={() => router.push('/(admin)/more/functions/add')}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(admin)/more/functions/${item.id}`)}
              activeOpacity={0.7}
            >
              <Card variant="default" padding="md">
                <View style={{ gap: spacing.xs }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge
                      label={formatFunctionType(item.type)}
                      variant={item.type === 'ANNUAL' ? 'info' : 'primary'}
                      size="sm"
                    />
                    <Badge
                      label={formatFunctionStatus(item.status)}
                      variant={getStatusBadgeVariant(item.status) as any}
                      size="sm"
                    />
                  </View>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                    Period: {item.start_year}{item.end_year ? ` – ${item.end_year}` : ''}
                  </Text>
                  {item.description && (
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
