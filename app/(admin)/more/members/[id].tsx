import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../src/theme';
import { useAuthStore } from '../../../../src/store';
import { memberService, contributionService } from '../../../../src/services';
import { Card, Button, Badge, Input } from '../../../../src/components/ui';
import { formatCurrency, formatDate, formatPaymentMethod } from '../../../../src/utils/formatters';
import { Member, MemberStatus } from '../../../../src/types/member';
import { Contribution } from '../../../../src/types/contribution';
import { getErrorMessage } from '../../../../src/utils';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();
  const { user } = useAuthStore();

  const [member, setMember] = useState<Member | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<MemberStatus>('active');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      memberService.getById(id),
      contributionService.getMemberContributions(id),
    ])
      .then(([m, c]) => {
        setMember(m);
        setContributions(c);
        setFullName(m.full_name);
        setPhone(m.phone || '');
        setEmail(m.email || '');
        setStatus(m.status);
        setLoading(false);
      })
      .catch((e) => {
        Alert.alert('Error', getErrorMessage(e));
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = async () => {
    if (!id || !member) return;
    const userId = user?.id;
    if (!userId) {
      Alert.alert('Session Expired', 'Please log in again.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
      return;
    }
    setSaving(true);
    try {
      const updated = await memberService.update(
        id,
        {
          full_name: fullName.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          status,
        },
        userId
      );
      setMember(updated);
      setEditing(false);
      Alert.alert('Success', 'Member updated successfully');
    } catch (e) {
      Alert.alert('Update Failed', getErrorMessage(e));
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

  if (!member) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary }}>Member not found</Text>
      </View>
    );
  }

  const totalContributed = contributions.reduce((sum, c) => sum + Number(c.amount), 0);

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
          Member Profile
        </Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={{ color: colors.primary, fontWeight: fontWeight.semibold, fontSize: fontSize.sm }}>
            {editing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 100 }}>
        {/* Profile Card */}
        <Card variant="default" style={{ alignItems: 'center', padding: spacing.xl }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ color: colors.primary, fontSize: 28, fontWeight: fontWeight.bold }}>
              {member.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
            {member.full_name}
          </Text>
          <Badge label={member.member_id} variant="primary" style={{ marginTop: spacing.xs }} />
          <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: spacing.xs }}>
            Joined {formatDate(member.join_date)} • Status: {member.status.toUpperCase()}
          </Text>
        </Card>

        {/* Total Contributed Card */}
        <Card variant="default" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
              Lifetime Contributions
            </Text>
            <Text style={{ color: colors.income, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginTop: 2 }}>
              {formatCurrency(totalContributed)}
            </Text>
          </View>
          <Badge label={`${contributions.length} donations`} variant="success" />
        </Card>

        {/* Edit Form */}
        {editing ? (
          <Card variant="default">
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.md }}>
              Edit Member Information
            </Text>
            <Input label="Full Name" value={fullName} onChangeText={setFullName} />
            <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <View style={{ flexDirection: 'row', gap: spacing.md, marginVertical: spacing.sm }}>
              <TouchableOpacity
                onPress={() => setStatus('active')}
                style={{
                  flex: 1,
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                  backgroundColor: status === 'active' ? colors.successLight : colors.surface,
                  borderWidth: 1,
                  borderColor: status === 'active' ? colors.success : colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: status === 'active' ? colors.success : colors.textPrimary, fontWeight: fontWeight.semibold }}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatus('inactive')}
                style={{
                  flex: 1,
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                  backgroundColor: status === 'inactive' ? colors.surfaceVariant : colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: status === 'inactive' ? colors.textSecondary : colors.textPrimary, fontWeight: fontWeight.semibold }}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
            <Button title="Save Changes" onPress={handleUpdate} loading={saving} style={{ marginTop: spacing.sm }} />
          </Card>
        ) : (
          /* Contact Details */
          <Card variant="default">
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.md }}>
              Contact Details
            </Text>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary }}>Phone Number</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>{member.phone || 'None'}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary }}>Email Address</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>{member.email || 'None'}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Contribution History */}
        <View>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.sm }}>
            Contribution History ({contributions.length})
          </Text>
          {contributions.length === 0 ? (
            <Card variant="outlined" style={{ alignItems: 'center', padding: spacing.lg }}>
              <Text style={{ color: colors.textSecondary }}>No contributions recorded yet</Text>
            </Card>
          ) : (
            <Card padding="none">
              {contributions.map((c, idx) => (
                <View
                  key={c.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: spacing.md,
                    borderBottomWidth: idx < contributions.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                      {c.function?.name || 'Function'}
                    </Text>
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                      {formatDate(c.payment_date)} • {formatPaymentMethod(c.payment_method)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.income, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                    +{formatCurrency(c.amount)}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
