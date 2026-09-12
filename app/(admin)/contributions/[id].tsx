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
import { useTheme } from '../../../src/theme';
import { useAuthStore } from '../../../src/store';
import { contributionService } from '../../../src/services';
import { Card, Button, Badge, ConfirmDialog } from '../../../src/components/ui';
import { formatCurrency, formatDate, formatPaymentMethod } from '../../../src/utils/formatters';
import { Contribution } from '../../../src/types';
import { getErrorMessage } from '../../../src/utils';

export default function ContributionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();
  const { user } = useAuthStore();

  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    contributionService
      .getById(id)
      .then((res) => {
        setContribution(res);
        setLoading(false);
      })
      .catch((e) => {
        Alert.alert('Error', getErrorMessage(e));
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      if (!user?.id) {
        Alert.alert('Session Expired', 'Please log in again.');
        return;
      }
      await contributionService.delete(id, user.id);
      setShowConfirm(false);
      Alert.alert('Deleted', 'Contribution removed successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Delete Failed', getErrorMessage(e));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!contribution) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg }}>Contribution not found</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
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
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
          Contribution Details
        </Text>
        <TouchableOpacity onPress={() => setShowConfirm(true)}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {/* Main Amount Card */}
        <Card variant="default" style={{ alignItems: 'center', padding: spacing.xl }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
            Total Contribution Amount
          </Text>
          <Text style={{ color: colors.income, fontSize: 36, fontWeight: fontWeight.bold, marginVertical: spacing.xs }}>
            +{formatCurrency(contribution.amount)}
          </Text>
          <Badge label={formatPaymentMethod(contribution.payment_method)} variant="success" />
        </Card>

        {/* Member Info Card */}
        <Card variant="default">
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.md }}>
            Contributor Information
          </Text>
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Member Name</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>
                {contribution.member?.full_name || '—'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Member ID</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>
                {contribution.member?.member_id || '—'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Transaction Details Card */}
        <Card variant="default">
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.md }}>
            Transaction Information
          </Text>
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Function</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>
                {contribution.function?.name || '—'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Payment Date</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>
                {formatDate(contribution.payment_date)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Reference / Txn ID</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>
                {contribution.reference_number || 'None'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Created At</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>
                {formatDate(contribution.created_at)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Notes */}
        {contribution.notes && (
          <Card variant="default">
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.xs }}>
              Notes
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, lineHeight: 20 }}>
              {contribution.notes}
            </Text>
          </Card>
        )}

        {/* Delete Button */}
        <Button
          title="Delete Contribution"
          onPress={() => setShowConfirm(true)}
          variant="danger"
          size="lg"
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>

      <ConfirmDialog
        visible={showConfirm}
        title="Delete Contribution?"
        message="Are you sure you want to delete this contribution? This action cannot be undone and will update the financial balance automatically."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </View>
  );
}
