import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { useMemberStore } from '../../../src/store';
import { memberService } from '../../../src/services';
import { Card, Badge, SearchBar, EmptyState } from '../../../src/components/ui';
import { Member } from '../../../src/types';

export default function VisitorMembersScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();
  const { members, totalCount, setMembers } = useMemberStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadMembers = async () => {
    try {
      const res = await memberService.getAll(search.trim() || undefined, 1, 100);
      setMembers(res.data, res.count);
    } catch (e) {
      console.warn('Error loading members:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [search])
  );

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
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
          Community Directory
        </Text>
        <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
          {totalCount} registered community members
        </Text>

        <View style={{ marginTop: spacing.sm }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, ID, or phone..."
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMembers(); }} colors={[colors.primary]} />}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No Members Found"
              description={search ? `No members match "${search}"` : 'No community members registered yet.'}
            />
          }
          renderItem={({ item }: { item: Member }) => (
            <Card variant="default" padding="md">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.primaryLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.primary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                    {item.full_name ? item.full_name.charAt(0).toUpperCase() : 'M'}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                      {item.full_name}
                    </Text>
                    <Badge
                      label={item.member_id}
                      variant="primary"
                      size="sm"
                    />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 }}>
                    {item.phone && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Ionicons name="call-outline" size={12} color={colors.textTertiary} />
                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>{item.phone}</Text>
                      </View>
                    )}
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>•</Text>
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>
                      Joined {new Date(item.join_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
