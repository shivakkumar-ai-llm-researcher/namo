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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../src/theme';
import { Input, Button, Card } from '../../../../src/components/ui';
import { paymentConfigService, PaymentConfig, DEFAULT_PAYMENT_CONFIG } from '../../../../src/services';
import { CommunityPaymentDetailsCard } from '../../../../src/components/payment/CommunityPaymentDetailsCard';
import { getErrorMessage } from '../../../../src/utils';

export default function AdminPaymentSettingsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, isDark } = useTheme();

  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiQrUri, setUpiQrUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    paymentConfigService.getConfig().then((config) => {
      setAccountHolder(config.accountHolder);
      setAccountNumber(config.accountNumber);
      setIfscCode(config.ifscCode);
      setBankName(config.bankName);
      setBranch(config.branch || '');
      setUpiId(config.upiId);
      setUpiQrUri(config.upiQrUri || null);
      setNotes(config.notes || '');
      setLoading(false);
    });
  }, []);

  const handlePickQrImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setUpiQrUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Image Selection Failed', getErrorMessage(e));
    }
  };

  const handleRemoveQrImage = () => {
    setUpiQrUri(null);
  };

  const handleSave = async () => {
    if (!accountHolder.trim()) {
      Alert.alert('Validation Error', 'Please enter Account Holder Name');
      return;
    }
    if (!accountNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter Bank Account Number');
      return;
    }
    if (!ifscCode.trim()) {
      Alert.alert('Validation Error', 'Please enter IFSC Code');
      return;
    }
    if (!bankName.trim()) {
      Alert.alert('Validation Error', 'Please enter Bank Name');
      return;
    }
    if (!upiId.trim()) {
      Alert.alert('Validation Error', 'Please enter UPI ID (VPA)');
      return;
    }

    setSaving(true);
    try {
      const config: PaymentConfig = {
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        bankName: bankName.trim(),
        branch: branch.trim() || undefined,
        upiId: upiId.trim().toLowerCase(),
        upiQrUri: upiQrUri || null,
        notes: notes.trim() || undefined,
      };

      await paymentConfigService.saveConfig(config);
      Alert.alert(
        'Payment Settings Saved',
        'Official Community Bank & UPI details have been updated successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert('Save Failed', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Defaults',
      'Reset all payment and bank info back to default community configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await paymentConfigService.resetToDefault();
            setAccountHolder(DEFAULT_PAYMENT_CONFIG.accountHolder);
            setAccountNumber(DEFAULT_PAYMENT_CONFIG.accountNumber);
            setIfscCode(DEFAULT_PAYMENT_CONFIG.ifscCode);
            setBankName(DEFAULT_PAYMENT_CONFIG.bankName);
            setBranch(DEFAULT_PAYMENT_CONFIG.branch || '');
            setUpiId(DEFAULT_PAYMENT_CONFIG.upiId);
            setUpiQrUri(DEFAULT_PAYMENT_CONFIG.upiQrUri || null);
            setNotes(DEFAULT_PAYMENT_CONFIG.notes || '');
            Alert.alert('Reset', 'Default details restored');
          },
        },
      ]
    );
  };

  const liveConfigPreview: PaymentConfig = {
    accountHolder: accountHolder || 'Account Holder Name',
    accountNumber: accountNumber || '000000000000',
    ifscCode: ifscCode ? ifscCode.toUpperCase() : 'IFSC0000000',
    bankName: bankName || 'Bank Name',
    branch: branch || undefined,
    upiId: upiId || 'sample@upi',
    upiQrUri: upiQrUri,
    notes: notes,
  };

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
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
              Bank & UPI Settings
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
              வங்கி & UPI கணக்கு விவரங்கள்
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleReset}>
          <Text style={{ color: colors.error, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 100 }}>
        {/* Live Preview section */}
        <View>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: fontSize.xs,
              fontWeight: fontWeight.bold,
              textTransform: 'uppercase',
              marginBottom: spacing.xs,
              letterSpacing: 0.5,
            }}
          >
            Live Devotee Preview / மாதிரிக் காட்சி
          </Text>
          <CommunityPaymentDetailsCard config={liveConfigPreview} />
        </View>

        {/* UPI QR Code Scanner Upload Section */}
        <Card variant="default" padding="md">
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="qr-code-outline" size={20} color="#D97706" />
              <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                UPI Scanner QR Code
              </Text>
            </View>
            <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
              Upload your official community GPay / PhonePe / Paytm scanner QR code image. Devotees can scan this QR to pay.
            </Text>

            {upiQrUri ? (
              <View style={{ alignItems: 'center', gap: spacing.sm, marginVertical: spacing.sm }}>
                <Image
                  source={{ uri: upiQrUri }}
                  style={{ width: 160, height: 160, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border }}
                  resizeMode="contain"
                />
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <TouchableOpacity
                    onPress={handlePickQrImage}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingVertical: 6,
                      paddingHorizontal: spacing.md,
                      borderRadius: borderRadius.sm,
                      backgroundColor: colors.primaryLight,
                    }}
                  >
                    <Ionicons name="image-outline" size={14} color={colors.primary} />
                    <Text style={{ fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.semibold }}>
                      Change QR Image
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleRemoveQrImage}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingVertical: 6,
                      paddingHorizontal: spacing.md,
                      borderRadius: borderRadius.sm,
                      backgroundColor: '#FEF2F2',
                    }}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.error} />
                    <Text style={{ fontSize: fontSize.xs, color: colors.error, fontWeight: fontWeight.semibold }}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickQrImage}
                style={{
                  borderWidth: 2,
                  borderColor: '#D97706',
                  borderStyle: 'dashed',
                  borderRadius: borderRadius.md,
                  padding: spacing.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#1E293B' : '#FFFBEB',
                  marginVertical: spacing.xs,
                  gap: spacing.xs,
                }}
              >
                <Ionicons name="cloud-upload-outline" size={36} color="#D97706" />
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: '#B45309' }}>
                  Upload UPI Scanner QR Code
                </Text>
                <Text style={{ fontSize: fontSize.xs, color: '#92400E', textAlign: 'center' }}>
                  Choose image from gallery / photos (JPG, PNG)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Bank Account Details Form */}
        <Card variant="default" padding="md">
          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="card-outline" size={20} color={colors.primary} />
              <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                Bank Account & UPI Details
              </Text>
            </View>

            {/* Account Holder Name */}
            <Input
              label="Account Holder Name (கணக்கு வைத்திருப்பவர்) *"
              value={accountHolder}
              onChangeText={setAccountHolder}
              placeholder="e.g. Sri Venkateswara Swamy Seva Trust"
              leftIcon={<Ionicons name="person-outline" size={18} color={colors.textTertiary} />}
            />

            {/* Account Number */}
            <Input
              label="Bank Account Number (கணக்கு எண்) *"
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="e.g. 39284719283"
              keyboardType="number-pad"
              leftIcon={<Ionicons name="keypad-outline" size={18} color={colors.textTertiary} />}
            />

            {/* IFSC Code */}
            <Input
              label="IFSC Code (IFSC குறியீடு) *"
              value={ifscCode}
              onChangeText={(text) => setIfscCode(text.toUpperCase())}
              placeholder="e.g. SBIN0001234"
              autoCapitalize="characters"
              leftIcon={<Ionicons name="barcode-outline" size={18} color={colors.textTertiary} />}
            />

            {/* Bank Name */}
            <Input
              label="Bank Name (வங்கியின் பெயர்) *"
              value={bankName}
              onChangeText={setBankName}
              placeholder="e.g. State Bank of India"
              leftIcon={<Ionicons name="business-outline" size={18} color={colors.textTertiary} />}
            />

            {/* Branch Name */}
            <Input
              label="Branch Name (கிளை) - Optional"
              value={branch}
              onChangeText={setBranch}
              placeholder="e.g. Main Road Branch"
              leftIcon={<Ionicons name="location-outline" size={18} color={colors.textTertiary} />}
            />

            {/* UPI ID */}
            <Input
              label="UPI ID / VPA (UPI ஐடி) *"
              value={upiId}
              onChangeText={(text) => setUpiId(text.toLowerCase())}
              placeholder="e.g. srivaritrust@sbi or 9876543210@upi"
              autoCapitalize="none"
              leftIcon={<Ionicons name="flash-outline" size={18} color={colors.textTertiary} />}
            />

            {/* Notes / Purpose */}
            <Input
              label="Purpose / Notes (குறிப்பு) - Optional"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. For Purattasi & Gokulaashdami temple funds"
              multiline
              numberOfLines={2}
            />
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          title="Save Community Bank & UPI Details"
          onPress={handleSave}
          loading={saving}
          size="lg"
          leftIcon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
