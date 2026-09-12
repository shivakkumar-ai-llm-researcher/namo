import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { useAuthStore, useFunctionStore } from '../../../src/store';
import { expenseService, storageService } from '../../../src/services';
import { Input, Button, Card } from '../../../src/components/ui';
import { VoiceFormModal } from '../../../src/components/voice';
import { ExpenseCategory } from '../../../src/types/expense';
import { PaymentMethod } from '../../../src/types/contribution';
import { formatDateInput, formatExpenseCategory, getCategoryIcon } from '../../../src/utils/formatters';
import { getErrorMessage } from '../../../src/utils';

const CATEGORIES: ExpenseCategory[] = [
  'food',
  'hall',
  'decoration',
  'transportation',
  'cultural_religious',
  'printing',
  'sound_system',
  'gifts',
  'utilities',
  'miscellaneous',
];

export default function AddExpenseScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();
  const { user } = useAuthStore();
  const { functions, activeFunction } = useFunctionStore();
  const params = useLocalSearchParams<{
    amount?: string;
    category?: string;
    description?: string;
    paymentMethod?: string;
  }>();

  const [selectedFunctionId, setSelectedFunctionId] = useState<string>(activeFunction?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [expenseDate, setExpenseDate] = useState<string>(formatDateInput(new Date()));
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Pre-fill from query params if directed from AI Assistant
  useEffect(() => {
    if (params.amount) setAmount(String(params.amount));
    if (params.category && CATEGORIES.includes(params.category as ExpenseCategory)) {
      setCategory(params.category as ExpenseCategory);
    }
    if (params.description) setDescription(String(params.description));
    if (params.paymentMethod && ['upi', 'cash', 'bank_transfer', 'cheque', 'other'].includes(params.paymentMethod)) {
      setPaymentMethod(params.paymentMethod as PaymentMethod);
    }
  }, [params.amount, params.category, params.description, params.paymentMethod]);

  const pickReceipt = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Image Selection Failed', getErrorMessage(e));
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to capture receipts');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Camera Failed', getErrorMessage(e));
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!selectedFunctionId) {
      Alert.alert('Validation Error', 'Please select a function');
      setIsSubmitting(false);
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter an expense description');
      setIsSubmitting(false);
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive amount');
      setIsSubmitting(false);
      return;
    }
    if (!expenseDate) {
      Alert.alert('Validation Error', 'Please enter a valid expense date');
      setIsSubmitting(false);
      return;
    }

    const userId = user?.id;
    if (!userId) {
      Alert.alert('Session Expired', 'Your session has expired. Please log in again.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
      setIsSubmitting(false);
      return;
    }

    setLoading(true);
    try {
      let receiptUrl: string | undefined = undefined;

      if (receiptUri) {
        try {
          receiptUrl = await storageService.uploadReceipt(receiptUri, `exp_${Date.now()}`, userId);
        } catch (uploadErr) {
          console.warn('Receipt upload failed, saving expense without receipt:', uploadErr);
        }
      }

      await expenseService.create(
        {
          function_id: selectedFunctionId,
          category,
          description: description.trim(),
          amount: numAmount,
          payment_method: paymentMethod,
          expense_date: expenseDate,
          reference_number: referenceNumber.trim() || undefined,
          notes: notes.trim() || undefined,
          receipt_url: receiptUrl,
        },
        userId
      );

      Alert.alert('Success', 'Expense recorded successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
            {t('expenses.addExpense', 'Record Expense')}
          </Text>
          <TouchableOpacity
            onPress={() => setIsVoiceModalOpen(true)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: borderRadius.full,
              ...shadow.sm,
            }}
          >
            <Ionicons name="mic" size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: fontWeight.bold }}>
              Voice Fill
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 100 }}>
        {/* Voice Dictation Quick Banner */}
        <TouchableOpacity
          onPress={() => setIsVoiceModalOpen(true)}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FEF3C7',
            borderColor: '#F59E0B',
            borderWidth: 1,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#D97706',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="mic" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#92400E', fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                Fill with Voice / AI Assistant
              </Text>
              <Text style={{ color: '#B45309', fontSize: 11 }}>
                e.g. "Spent ₹1,500 for flowers and decoration cash"
              </Text>
            </View>
          </View>
          <Ionicons name="sparkles" size={18} color="#D97706" />
        </TouchableOpacity>

        {/* Function Selector */}
        <View>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Community Function *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
            {functions.map((fn) => {
              const isSelected = selectedFunctionId === fn.id;
              return (
                <TouchableOpacity
                  key={fn.id}
                  onPress={() => setSelectedFunctionId(fn.id)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: borderRadius.md,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                    marginRight: spacing.sm,
                  }}
                >
                  <Text style={{ color: isSelected ? colors.textInverse : colors.textPrimary, fontWeight: fontWeight.semibold, fontSize: fontSize.sm }}>
                    {fn.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Category Selector */}
        <View>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Expense Category *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: borderRadius.md,
                    backgroundColor: isSelected ? colors.expense : colors.surface,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.expense : colors.border,
                    marginRight: spacing.sm,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name={getCategoryIcon(cat) as any} size={20} color={isSelected ? 'white' : colors.expense} />
                  <Text style={{ color: isSelected ? 'white' : colors.textPrimary, fontWeight: fontWeight.semibold, fontSize: fontSize.xs, marginTop: 2 }}>
                    {formatExpenseCategory(cat)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Description */}
        <Input
          label="Expense Description *"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Stage floral decoration"
          leftIcon={<Ionicons name="document-text-outline" size={18} color={colors.textTertiary} />}
        />

        {/* Amount */}
        <Input
          label="Amount (INR ₹) *"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="e.g. 15000"
          leftIcon={<Text style={{ color: colors.expense, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>₹</Text>}
        />

        {/* Payment Method */}
        <View>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Payment Method *
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            {paymentMethods.map((pm) => {
              const isSelected = paymentMethod === pm.value;
              return (
                <TouchableOpacity
                  key={pm.value}
                  onPress={() => setPaymentMethod(pm.value)}
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    paddingVertical: spacing.sm + 2,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.md,
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderWidth: 1.5,
                    borderColor: isSelected ? colors.primary : colors.border,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: isSelected ? colors.primary : colors.textPrimary, fontWeight: fontWeight.semibold, fontSize: fontSize.sm }}>
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Expense Date */}
        <Input
          label="Expense Date (YYYY-MM-DD) *"
          value={expenseDate}
          onChangeText={setExpenseDate}
          placeholder="2026-03-15"
          leftIcon={<Ionicons name="calendar-outline" size={18} color={colors.textTertiary} />}
        />

        {/* Reference Number */}
        <Input
          label="Receipt / Bill / Invoice Number"
          value={referenceNumber}
          onChangeText={setReferenceNumber}
          placeholder="e.g. INV-98765"
          leftIcon={<Ionicons name="receipt-outline" size={18} color={colors.textTertiary} />}
        />

        {/* Receipt Upload Section */}
        <View>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Receipt Attachment
          </Text>
          {receiptUri ? (
            <View style={{ borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
              <Image source={{ uri: receiptUri }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: spacing.sm, backgroundColor: colors.surface }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Receipt attached</Text>
                <TouchableOpacity onPress={() => setReceiptUri(null)}>
                  <Text style={{ color: colors.error, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity
                onPress={pickReceipt}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.md,
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  borderStyle: 'dashed',
                  padding: spacing.md,
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Ionicons name="image-outline" size={24} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  Photo Library
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePhoto}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.md,
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  borderStyle: 'dashed',
                  padding: spacing.md,
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <Ionicons name="camera-outline" size={24} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  Take Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Notes */}
        <Input
          label="Notes / Remarks"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any notes..."
          multiline
          numberOfLines={2}
        />

        <Button
          title="Save Expense"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || isSubmitting}
          variant="danger"
          size="lg"
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>

      {/* Voice Assistant Modal */}
      <VoiceFormModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        type="expense"
        onApply={(parsed) => {
          if ('amount' in parsed && parsed.amount) setAmount(parsed.amount);
          if ('category' in parsed && parsed.category) setCategory(parsed.category);
          if ('description' in parsed && parsed.description) setDescription(parsed.description);
          if ('paymentMethod' in parsed && parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
          if ('notes' in parsed && parsed.notes) {
            setNotes((prev) => (prev ? `${prev} | ${parsed.notes}` : parsed.notes || ''));
          }
          if ('expenseDate' in parsed && parsed.expenseDate) setExpenseDate(parsed.expenseDate);
        }}
      />
    </KeyboardAvoidingView>
  );
}
