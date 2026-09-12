import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { memberService, contributionService } from '../../../src/services';
import { Card, Badge, Button, ConfirmDialog } from '../../../src/components/ui';
import { formatCurrency, formatDate, formatPaymentMethod } from '../../../src/utils/formatters';
import { Member, Contribution } from '../../../src/types';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();

  const [member, setMember] = useState<Member | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [totalContributed, setTotalContributed] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!id) return;
    try {
      const [m, cRes] = await Promise.all([
        memberService.getById(id),
        contributionService.getAll({ member_id: id, limit: 100 }),
      ]);
      setMember(m);
      setContributions(cRes.data);
      setTotalContributed(cRes.data.reduce((sum, item) => sum + Number(item.amount), 0));
    } catch (e) {
      console.warn('Error loading member details:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  if (loading || !member) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
          gap: spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
          Member Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 60 }}>
        {/* Profile Card */}
        <Card variant="default">
          <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Text style={{ color: colors.primary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
                {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'M'}
              </Text>
            </View>

            <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
              {member.full_name}
            </Text>

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Badge label={member.member_id} variant="primary" size="md" />
              <Badge
                label={member.role === 'admin' ? 'Admin' : 'Visitor'}
                variant={member.role === 'admin' ? 'primary' : 'default'}
                size="md"
              />
              <Badge
                label={member.status.toUpperCase()}
                variant={member.status === 'active' ? 'success' : 'default'}
                size="md"
              />
            </View>
          </View>

          {/* Contact Details */}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.sm }}>
            {member.phone && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Ionicons name="call-outline" size={18} color={colors.textTertiary} />
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{member.phone}</Text>
              </View>
            )}
            {member.email && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Ionicons name="mail-outline" size={18} color={colors.textTertiary} />
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{member.email}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="calendar-outline" size={18} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                Member since {formatDate(member.join_date)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Total Lifetime Contribution Card */}
        <View
          style={{
            backgroundColor: colors.income,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            alignItems: 'center',
            ...shadow.sm,
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase' }}>
            Lifetime Contribution Total
          </Text>
          <Text style={{ color: 'white', fontSize: 32, fontWeight: fontWeight.bold, marginVertical: 4 }}>
            {formatCurrency(totalContributed)}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: fontSize.xs }}>
            Across {contributions.length} recorded payments
          </Text>
        </View>

        {/* Payment History */}
        <View style={{ marginTop: spacing.sm }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.sm }}>
            Contribution History ({contributions.length})
          </Text>

          {contributions.length === 0 ? (
            <Text style={{ color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg }}>
              No contributions recorded for this member.
            </Text>
          ) : (
            contributions.map((c) => (
              <Card key={c.id} variant="default" padding="sm" style={{ marginBottom: spacing.xs }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                      {formatCurrency(c.amount)}
                    </Text>
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>
                      {formatDate(c.payment_date)} • {formatPaymentMethod(c.payment_method)}
                    </Text>
                  </View>
                  {c.function && (
                    <Badge label={c.function.name} variant="default" size="sm" />
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
