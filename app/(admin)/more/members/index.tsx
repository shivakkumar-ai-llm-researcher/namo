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
import { useMemberStore } from '../../../../src/store';
import { memberService } from '../../../../src/services';
import { Card, Badge, SearchBar, EmptyState } from '../../../../src/components/ui';
import { Member } from '../../../../src/types';

export default function MembersListScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();
  const { members, totalCount, setMembers, searchQuery, setSearchQuery } = useMemberStore();

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
              Community Members
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/more/members/add')}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs + 2,
              borderRadius: borderRadius.md,
            }}
          >
            <Text style={{ color: 'white', fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>
              + Add Member
            </Text>
          </TouchableOpacity>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, ID, or phone..."
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: 90 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMembers(); }} />}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No Members Found"
              description="Add community members to track individual contributions."
              actionLabel="Add Member"
              onAction={() => router.push('/(admin)/more/members/add')}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(admin)/more/members/${item.id}`)}
              activeOpacity={0.7}
            >
              <Card variant="default" padding="md">
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
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
                      <Text style={{ color: colors.primary, fontWeight: fontWeight.bold, fontSize: fontSize.md }}>
                        {item.full_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                        <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                          {item.full_name}
                        </Text>
                        <Badge label={item.member_id} variant="default" size="sm" />
                      </View>
                      <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                        {item.phone || 'No phone'} {item.email ? `• ${item.email}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Badge
                    label={item.status}
                    variant={item.status === 'active' ? 'success' : 'default'}
                    size="sm"
                  />
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
