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
import { contributionService, memberService } from '../../../src/services';
import { Input, Button, Card } from '../../../src/components/ui';
import { VoiceFormModal } from '../../../src/components/voice';
import { Member, PaymentMethod } from '../../../src/types';
import { formatDateInput } from '../../../src/utils/formatters';
import { getErrorMessage } from '../../../src/utils';
import { CommunityPaymentDetailsCard } from '../../../src/components/payment/CommunityPaymentDetailsCard';

export default function AddContributionScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, isDark, shadow } = useTheme();
  const { user } = useAuthStore();
  const { functions, activeFunction } = useFunctionStore();
  const params = useLocalSearchParams<{
    amount?: string;
    memberId?: string;
    paymentMethod?: string;
    notes?: string;
  }>();

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>(activeFunction?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentDate, setPaymentDate] = useState<string>(formatDateInput(new Date()));
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Payer / Transaction details
  const [payerAccountHolder, setPayerAccountHolder] = useState<string>('');
  const [payerIfsc, setPayerIfsc] = useState<string>('');
  const [payerAccountNumber, setPayerAccountNumber] = useState<string>('');
  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Pre-fill from query params if directed from AI Assistant
  useEffect(() => {
    if (params.amount) setAmount(String(params.amount));
    if (params.memberId) setSelectedMemberId(String(params.memberId));
    if (params.paymentMethod && ['upi', 'cash', 'bank_transfer', 'cheque'].includes(params.paymentMethod)) {
      setPaymentMethod(params.paymentMethod as PaymentMethod);
    }
    if (params.notes) setNotes(String(params.notes));
  }, [params.amount, params.memberId, params.paymentMethod, params.notes]);

  useEffect(() => {
    memberService
      .getAll('', 1, 100)
      .then((res) => {
        setMembers(res.data);
        if (res.data.length > 0) {
          setSelectedMemberId(res.data[0].id);
          if (!payerAccountHolder) {
            setPayerAccountHolder(res.data[0].full_name);
          }
        }
        setLoadingMembers(false);
      })
      .catch((e) => {
        console.warn('Failed to load members:', e);
        setLoadingMembers(false);
      });
  }, []);

  const handleMemberSelect = (member: Member) => {
    setSelectedMemberId(member.id);
    if (!payerAccountHolder) {
      setPayerAccountHolder(member.full_name);
    }
  };

  const pickPaymentProof = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPaymentProofUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Selection Error', getErrorMessage(e));
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!selectedFunctionId) {
      Alert.alert('Validation Error', 'Please select a community function');
      setIsSubmitting(false);
      return;
    }
    if (!selectedMemberId) {
      Alert.alert('Validation Error', 'Please select a community member');
      setIsSubmitting(false);
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive amount');
      setIsSubmitting(false);
      return;
    }
    if (!paymentDate) {
      Alert.alert('Validation Error', 'Please enter a valid payment date');
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
      // Build structured notes with payer info
      const noteDetails: string[] = [];
      if (notes.trim()) noteDetails.push(notes.trim());
      if (payerAccountHolder.trim()) noteDetails.push(`Payer Name: ${payerAccountHolder.trim()}`);
      if (payerAccountNumber.trim()) {
        noteDetails.push(
          paymentMethod === 'upi'
            ? `Payer UPI: ${payerAccountNumber.trim()}`
            : `Payer A/C: ${payerAccountNumber.trim()}`
        );
      }
      if (payerIfsc.trim() && paymentMethod === 'bank_transfer') {
        noteDetails.push(`Payer IFSC: ${payerIfsc.trim().toUpperCase()}`);
      }
      if (paymentProofUri) noteDetails.push(`Proof: Attached (${paymentProofUri.slice(-25)})`);

      const compiledNotes = noteDetails.join(' | ');

      await contributionService.create(
        {
          function_id: selectedFunctionId,
          member_id: selectedMemberId,
          amount: numAmount,
          payment_method: paymentMethod,
          payment_date: paymentDate,
          reference_number: referenceNumber.trim() || undefined,
          notes: compiledNotes || undefined,
        },
        userId
      );

      Alert.alert('Success', 'Contribution recorded successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Only UPI, Bank Transfer, and Cash options (Removed 'Other')
  const paymentMethods: { value: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'upi', label: 'UPI / QR', icon: 'qr-code-outline' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: 'business-outline' },
    { value: 'cash', label: 'Cash', icon: 'cash-outline' },
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
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
              {t('contributions.addContribution', 'Record Contribution')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
              பங்களிப்பு பதிவு செய்தல்
            </Text>
          </View>
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
            backgroundColor: '#DCFCE7',
            borderColor: '#22C55E',
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
                backgroundColor: '#16A34A',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="mic" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#166534', fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                Fill with Voice / AI Assistant
              </Text>
              <Text style={{ color: '#15803D', fontSize: 11 }}>
                e.g. "Received ₹5,000 contribution from Suresh via UPI"
              </Text>
            </View>
          </View>
          <Ionicons name="sparkles" size={18} color="#16A34A" />
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

        {/* Member Selector */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
              Contributor (Member) *
            </Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/more/members/add')}>
              <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                + Add New Member
              </Text>
            </TouchableOpacity>
          </View>
          {loadingMembers ? (
            <Text style={{ color: colors.textTertiary }}>Loading members...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {members.map((m) => {
                const isSelected = selectedMemberId === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => handleMemberSelect(m)}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.md,
                      backgroundColor: isSelected ? colors.income : colors.surface,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.income : colors.border,
                      marginRight: spacing.sm,
                    }}
                  >
                    <Text style={{ color: isSelected ? 'white' : colors.textPrimary, fontWeight: fontWeight.semibold, fontSize: fontSize.sm }}>
                      {m.full_name}
                    </Text>
                    <Text style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textTertiary, fontSize: fontSize.xs }}>
                      {m.member_id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Amount Input */}
        <Input
          label="Amount (INR ₹) *"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="e.g. 5000"
          leftIcon={<Text style={{ color: colors.income, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>₹</Text>}
        />

        {/* Payment Method Selector (Only UPI, Bank Transfer, Cash) */}
        <View>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Payment Method *
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {paymentMethods.map((pm) => {
              const isSelected = paymentMethod === pm.value;
              return (
                <TouchableOpacity
                  key={pm.value}
                  onPress={() => setPaymentMethod(pm.value)}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.sm + 2,
                    paddingHorizontal: spacing.sm,
                    borderRadius: borderRadius.md,
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderWidth: 1.5,
                    borderColor: isSelected ? colors.primary : colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <Ionicons name={pm.icon} size={18} color={isSelected ? colors.primary : colors.textSecondary} />
                  <Text
                    style={{
                      color: isSelected ? colors.primary : colors.textPrimary,
                      fontWeight: fontWeight.semibold,
                      fontSize: fontSize.xs,
                      textAlign: 'center',
                    }}
                  >
                    {pm.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 1. UPI: SHOW QR DETAILS ONLY */}
        {paymentMethod === 'upi' && (
          <View style={{ marginVertical: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase' }}>
                Community UPI QR Scanner (அதிகாரப்பூர்வ UPI)
              </Text>
              <TouchableOpacity onPress={() => router.push('/(admin)/more/payment-settings')}>
                <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  Manage QR
                </Text>
              </TouchableOpacity>
            </View>
            <CommunityPaymentDetailsCard displayMode="upi_only" compact={false} />
          </View>
        )}

        {/* 2. BANK TRANSFER: SHOW BANK DETAILS ONLY */}
        {paymentMethod === 'bank_transfer' && (
          <View style={{ marginVertical: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase' }}>
                Community Bank Account (வங்கி விவரங்கள்)
              </Text>
              <TouchableOpacity onPress={() => router.push('/(admin)/more/payment-settings')}>
                <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  Manage Account
                </Text>
              </TouchableOpacity>
            </View>
            <CommunityPaymentDetailsCard displayMode="bank_only" compact={false} />
          </View>
        )}

        {/* Transaction Verification Details for UPI */}
        {paymentMethod === 'upi' && (
          <Card variant="default" padding="md">
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Ionicons name="flash-outline" size={18} color="#D97706" />
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                  UPI Payment Verification (பரிவர்த்தனை விவரங்கள்)
                </Text>
              </View>

              {/* Contributor / Payer Name */}
              <Input
                label="Payer Name on UPI App (செலுத்துபவர் பெயர்)"
                value={payerAccountHolder}
                onChangeText={setPayerAccountHolder}
                placeholder="e.g. Murugan R"
                leftIcon={<Ionicons name="person-outline" size={18} color={colors.textTertiary} />}
              />

              {/* Payer UPI ID or Phone */}
              <Input
                label="Payer's UPI ID or Mobile Number"
                value={payerAccountNumber}
                onChangeText={setPayerAccountNumber}
                placeholder="e.g. devotee@okaxis or 9876543210"
                leftIcon={<Ionicons name="phone-portrait-outline" size={18} color={colors.textTertiary} />}
              />

              {/* UPI UTR / Ref Number */}
              <Input
                label="UPI Reference / UTR Number *"
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                placeholder="e.g. 412398765432 (12-digit UTR)"
                leftIcon={<Ionicons name="receipt-outline" size={18} color={colors.textTertiary} />}
              />

              {/* Screenshot / Proof Upload */}
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
                  UPI Payment Screenshot (பரிவர்த்தனை ஸ்கிரீன்ஷாட்)
                </Text>
                {paymentProofUri ? (
                  <View style={{ alignItems: 'center', gap: spacing.xs, marginVertical: spacing.xs }}>
                    <Image
                      source={{ uri: paymentProofUri }}
                      style={{ width: '100%', height: 180, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => setPaymentProofUri(null)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingVertical: 4,
                        paddingHorizontal: spacing.sm,
                        backgroundColor: '#FEF2F2',
                        borderRadius: borderRadius.sm,
                      }}
                    >
                      <Ionicons name="trash-outline" size={14} color={colors.error} />
                      <Text style={{ fontSize: fontSize.xs, color: colors.error, fontWeight: fontWeight.semibold }}>
                        Remove Screenshot
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={pickPaymentProof}
                    style={{
                      borderWidth: 1.5,
                      borderColor: '#D97706',
                      borderStyle: 'dashed',
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FFFBEB',
                      gap: 4,
                    }}
                  >
                    <Ionicons name="camera-outline" size={24} color="#D97706" />
                    <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: '#B45309' }}>
                      Upload UPI Payment Screenshot
                    </Text>
                    <Text style={{ fontSize: 11, color: '#92400E' }}>
                      Select screenshot proof from photos
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Transaction Verification Details for Bank Transfer */}
        {paymentMethod === 'bank_transfer' && (
          <Card variant="default" padding="md">
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Ionicons name="business-outline" size={18} color={colors.primary} />
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                  Bank Transfer Verification (வங்கி பரிவர்த்தனை விவரங்கள்)
                </Text>
              </View>

              {/* Contributor / Account Holder Name */}
              <Input
                label="Payer Account Holder Name (கணக்கு வைத்திருப்பவர்)"
                value={payerAccountHolder}
                onChangeText={setPayerAccountHolder}
                placeholder="Name as in bank account"
                leftIcon={<Ionicons name="person-outline" size={18} color={colors.textTertiary} />}
              />

              {/* Account Number */}
              <Input
                label="Payer's Bank Account Number (கணக்கு எண்)"
                value={payerAccountNumber}
                onChangeText={setPayerAccountNumber}
                placeholder="e.g. 123456789012"
                keyboardType="number-pad"
                leftIcon={<Ionicons name="keypad-outline" size={18} color={colors.textTertiary} />}
              />

              {/* IFSC Code */}
              <Input
                label="Payer IFSC Code (IFSC குறியீடு)"
                value={payerIfsc}
                onChangeText={(val) => setPayerIfsc(val.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                autoCapitalize="characters"
                leftIcon={<Ionicons name="barcode-outline" size={18} color={colors.textTertiary} />}
              />

              {/* Reference Number */}
              <Input
                label="Bank Reference / IMPS / NEFT Number"
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                placeholder="e.g. IMPS-123456 or Cheque #"
                leftIcon={<Ionicons name="receipt-outline" size={18} color={colors.textTertiary} />}
              />

              {/* Screenshot / Proof Upload */}
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
                  Bank Deposit Slip / Screenshot (பரிவர்த்தனை ரசீது)
                </Text>
                {paymentProofUri ? (
                  <View style={{ alignItems: 'center', gap: spacing.xs, marginVertical: spacing.xs }}>
                    <Image
                      source={{ uri: paymentProofUri }}
                      style={{ width: '100%', height: 180, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => setPaymentProofUri(null)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingVertical: 4,
                        paddingHorizontal: spacing.sm,
                        backgroundColor: '#FEF2F2',
                        borderRadius: borderRadius.sm,
                      }}
                    >
                      <Ionicons name="trash-outline" size={14} color={colors.error} />
                      <Text style={{ fontSize: fontSize.xs, color: colors.error, fontWeight: fontWeight.semibold }}>
                        Remove Slip
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={pickPaymentProof}
                    style={{
                      borderWidth: 1.5,
                      borderColor: colors.primary,
                      borderStyle: 'dashed',
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primaryLight,
                      gap: 4,
                    }}
                  >
                    <Ionicons name="camera-outline" size={24} color={colors.primary} />
                    <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary }}>
                      Upload Bank Deposit Slip / Receipt
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Select receipt slip from photo gallery
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Payment Date */}
        <Input
          label="Payment Date (YYYY-MM-DD) *"
          value={paymentDate}
          onChangeText={setPaymentDate}
          placeholder="2026-03-15"
          leftIcon={<Ionicons name="calendar-outline" size={18} color={colors.textTertiary} />}
        />

        {/* Reference Number for Cash */}
        {paymentMethod === 'cash' && (
          <Input
            label="Cash Receipt Number (optional)"
            value={referenceNumber}
            onChangeText={setReferenceNumber}
            placeholder="e.g. CASH-001"
            leftIcon={<Ionicons name="receipt-outline" size={18} color={colors.textTertiary} />}
          />
        )}

        {/* Notes */}
        <Input
          label="Notes / Remarks"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional remarks..."
          multiline
          numberOfLines={2}
        />

        <Button
          title="Save Contribution"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || isSubmitting}
          size="lg"
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>

      {/* Voice Assistant Modal */}
      <VoiceFormModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        type="income"
        members={members}
        onApply={(parsed) => {
          if ('amount' in parsed && parsed.amount) setAmount(parsed.amount);
          if ('memberId' in parsed && parsed.memberId) setSelectedMemberId(parsed.memberId);
          if ('paymentMethod' in parsed && parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
          if ('paymentDate' in parsed && parsed.paymentDate) setPaymentDate(parsed.paymentDate);
          if ('notes' in parsed && parsed.notes) {
            setNotes((prev) => (prev ? `${prev} | ${parsed.notes}` : parsed.notes || ''));
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}
