import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/theme';
import { useAuthStore } from '../../../src/store';
import { expenseService } from '../../../src/services';
import { Card, Button, Badge, ConfirmDialog } from '../../../src/components/ui';
import { formatCurrency, formatDate, formatExpenseCategory, getCategoryIcon } from '../../../src/utils/formatters';
import { Expense } from '../../../src/types';
import { getErrorMessage } from '../../../src/utils';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();
  const { user } = useAuthStore();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    expenseService
      .getById(id)
      .then((res) => {
        setExpense(res);
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
      await expenseService.delete(id, user.id);
      setShowConfirm(false);
      Alert.alert('Deleted', 'Expense deleted successfully', [
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

  if (!expense) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg }}>Expense not found</Text>
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
          Expense Details
        </Text>
        <TouchableOpacity onPress={() => setShowConfirm(true)}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {/* Main Amount Card */}
        <Card variant="default" style={{ alignItems: 'center', padding: spacing.xl }}>
          <View style={{ backgroundColor: colors.expenseLight, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
            <Ionicons name={getCategoryIcon(expense.category) as any} size={28} color={colors.expense} />
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
            {expense.description}
          </Text>
          <Text style={{ color: colors.expense, fontSize: 36, fontWeight: fontWeight.bold, marginVertical: spacing.xs }}>
            -{formatCurrency(expense.amount)}
          </Text>
          <Badge label={formatExpenseCategory(expense.category)} variant="error" />
        </Card>

        {/* Transaction Details */}
        <Card variant="default">
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.md }}>
            Expense Details
          </Text>
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Function</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>
                {expense.function?.name || '—'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Expense Date</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>
                {formatDate(expense.expense_date)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Payment Method</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold, textTransform: 'capitalize' }}>
                {expense.payment_method?.replace('_', ' ') || '—'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary }}>Invoice / Ref #</Text>
              <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold }}>
                {expense.reference_number || 'None'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Receipt Attachment Card */}
        {expense.receipt_url && (
          <Card variant="default">
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.sm }}>
              Receipt Attachment
            </Text>
            <TouchableOpacity onPress={() => setPreviewModal(true)} activeOpacity={0.85}>
              <Image
                source={{ uri: expense.receipt_url }}
                style={{ width: '100%', height: 200, borderRadius: borderRadius.md }}
                resizeMode="cover"
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
                <Ionicons name="expand" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  Tap to preview full receipt
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        )}

        {/* Notes */}
        {expense.notes && (
          <Card variant="default">
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.xs }}>
              Notes
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, lineHeight: 20 }}>
              {expense.notes}
            </Text>
          </Card>
        )}

        {/* Delete Button */}
        <Button
          title="Delete Expense"
          onPress={() => setShowConfirm(true)}
          variant="danger"
          size="lg"
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>

      {/* Full receipt preview modal */}
      {expense.receipt_url && (
        <Modal visible={previewModal} transparent animationType="fade" onRequestClose={() => setPreviewModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: spacing.md }}>
            <TouchableOpacity
              onPress={() => setPreviewModal(false)}
              style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: spacing.sm }}
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
            <Image
              source={{ uri: expense.receipt_url }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}

      <ConfirmDialog
        visible={showConfirm}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense and its receipt? The balance will be automatically recalculated."
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
