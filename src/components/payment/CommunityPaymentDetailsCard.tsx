import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../theme';
import { PaymentConfig, paymentConfigService, DEFAULT_PAYMENT_CONFIG } from '../../services';

interface CommunityPaymentDetailsCardProps {
  config?: PaymentConfig;
  showAdminEdit?: boolean;
  onEditPress?: () => void;
  compact?: boolean;
  displayMode?: 'all' | 'upi_only' | 'bank_only';
}

export const CommunityPaymentDetailsCard: React.FC<CommunityPaymentDetailsCardProps> = ({
  config: propConfig,
  showAdminEdit = false,
  onEditPress,
  compact = false,
  displayMode = 'all',
}) => {
  const { colors, spacing, borderRadius, fontSize, fontWeight, isDark } = useTheme();
  const [config, setConfig] = useState<PaymentConfig>(propConfig || DEFAULT_PAYMENT_CONFIG);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (propConfig) {
      setConfig(propConfig);
    } else {
      paymentConfigService.getConfig().then(setConfig);
    }
  }, [propConfig]);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await Clipboard.setStringAsync(text);
      if (Platform.OS === 'web' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      Alert.alert('Copied', `${fieldName}: ${text}`);
    }
  };

  const copyAllBankDetails = async () => {
    const fullText = [
      '--- Srivari Community Bank Account Details ---',
      `Account Name: ${config.accountHolder}`,
      `Account Number: ${config.accountNumber}`,
      `IFSC Code: ${config.ifscCode}`,
      `Bank: ${config.bankName}${config.branch ? ' (' + config.branch + ')' : ''}`,
      `UPI ID: ${config.upiId}`,
      config.notes ? `Purpose: ${config.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await Clipboard.setStringAsync(fullText);
    if (Platform.OS === 'web' && navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullText);
    }
    Alert.alert('Copied!', 'Complete Bank account details copied to clipboard');
  };

  const showUpi = displayMode === 'all' || displayMode === 'upi_only';
  const showBank = displayMode === 'all' || displayMode === 'bank_only';

  const headerTitle =
    displayMode === 'upi_only'
      ? 'OFFICIAL COMMUNITY UPI (ஸ்கேனர் & UPI)'
      : displayMode === 'bank_only'
      ? 'OFFICIAL COMMUNITY BANK A/C (வங்கி கணக்கு)'
      : 'OFFICIAL COMMUNITY ACCOUNT (வங்கி & UPI)';

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderRadius: borderRadius.lg,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      {/* Header ribbon */}
      <View
        style={{
          backgroundColor: '#B45309', // Divine gold / bronze
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1, marginRight: 8 }}>
          <Ionicons
            name={displayMode === 'upi_only' ? 'qr-code-outline' : displayMode === 'bank_only' ? 'business-outline' : 'shield-checkmark'}
            size={16}
            color="#FEF3C7"
          />
          <Text
            style={{ color: '#FFFFFF', fontWeight: fontWeight.bold, fontSize: 11, letterSpacing: 0.5 }}
            numberOfLines={1}
          >
            {headerTitle}
          </Text>
        </View>

        {showAdminEdit && onEditPress && (
          <TouchableOpacity
            onPress={onEditPress}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: spacing.sm,
              paddingVertical: 3,
              borderRadius: borderRadius.sm,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ionicons name="create-outline" size={12} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: fontWeight.semibold }}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ padding: spacing.md, gap: spacing.md }}>
        {/* UPI QR Code Scanner Presentation (Shown only if showUpi is true) */}
        {showUpi && (
          <View
            style={{
              flexDirection: compact ? 'column' : 'row',
              alignItems: 'center',
              gap: spacing.md,
              backgroundColor: isDark ? '#0F172A' : '#FFFBEB',
              padding: spacing.md,
              borderRadius: borderRadius.md,
              borderWidth: 1,
              borderColor: '#FDE68A',
            }}
          >
            {/* QR Image or Divine Placeholder */}
            <TouchableOpacity
              onPress={() => setQrModalVisible(true)}
              activeOpacity={0.8}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                padding: 6,
                borderRadius: borderRadius.md,
                borderWidth: 2,
                borderColor: '#D97706',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
              }}
            >
              {config.upiQrUri ? (
                <Image
                  source={{ uri: config.upiQrUri }}
                  style={{ width: 110, height: 110, borderRadius: 6 }}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={{
                    width: 110,
                    height: 110,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFFBEB',
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: '#F59E0B',
                    borderStyle: 'dashed',
                    padding: 6,
                  }}
                >
                  <Ionicons name="qr-code" size={44} color="#D97706" />
                  <Text style={{ fontSize: 9, fontWeight: fontWeight.bold, color: '#B45309', textAlign: 'center', marginTop: 4 }}>
                    SCAN ANY UPI
                  </Text>
                  <Text style={{ fontSize: 8, color: '#78350F', textAlign: 'center' }}>
                    GPay • PhonePe • BHIM
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 }}>
                <Ionicons name="expand-outline" size={10} color="#D97706" />
                <Text style={{ fontSize: 10, color: '#D97706', fontWeight: fontWeight.medium }}>Tap to expand</Text>
              </View>
            </TouchableOpacity>

            {/* UPI ID Info & Copy */}
            <View style={{ flex: 1, width: '100%', gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="flash" size={14} color="#D97706" />
                <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: '#B45309', textTransform: 'uppercase' }}>
                  Instant UPI Payment
                </Text>
              </View>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                Scan the QR or transfer directly to the official UPI ID:
              </Text>

              <TouchableOpacity
                onPress={() => copyToClipboard(config.upiId, 'UPI ID')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 6,
                  borderRadius: borderRadius.sm,
                  borderWidth: 1,
                  borderColor: copiedField === 'UPI ID' ? '#10B981' : '#E2E8F0',
                  marginTop: 4,
                }}
              >
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary, flex: 1 }} numberOfLines={1}>
                  {config.upiId}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons
                    name={copiedField === 'UPI ID' ? 'checkmark-circle' : 'copy-outline'}
                    size={14}
                    color={copiedField === 'UPI ID' ? '#10B981' : '#D97706'}
                  />
                  <Text style={{ fontSize: 11, fontWeight: fontWeight.semibold, color: copiedField === 'UPI ID' ? '#10B981' : '#D97706' }}>
                    {copiedField === 'UPI ID' ? 'Copied' : 'Copy'}
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={{ fontSize: 10, color: colors.textTertiary, marginTop: 2 }}>
                Supported on Google Pay, PhonePe, Paytm, BHIM, and all mobile UPI apps.
              </Text>
            </View>
          </View>
        )}

        {/* Bank Account Details Table (Shown only if showBank is true) */}
        {showBank && (
          <View
            style={{
              backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
              borderRadius: borderRadius.md,
              padding: spacing.md,
              borderWidth: 1,
              borderColor: colors.border,
              gap: spacing.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Ionicons name="business" size={16} color={colors.primary} />
                <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary, textTransform: 'uppercase' }}>
                  Bank Transfer Details (NEFT / IMPS / RTGS)
                </Text>
              </View>
              <TouchableOpacity onPress={copyAllBankDetails}>
                <Text style={{ fontSize: 11, color: colors.primary, fontWeight: fontWeight.semibold }}>
                  Copy All
                </Text>
              </TouchableOpacity>
            </View>

            {/* Account Holder */}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                Account Holder
              </Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold }]}>
                {config.accountHolder}
              </Text>
            </View>

            {/* Account Number */}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                Account Number
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Text
                  selectable
                  style={[
                    styles.detailValue,
                    {
                      color: colors.textPrimary,
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.bold,
                      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                    },
                  ]}
                >
                  {config.accountNumber}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(config.accountNumber, 'Account Number')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={copiedField === 'Account Number' ? 'checkmark-circle' : 'copy-outline'}
                    size={14}
                    color={copiedField === 'Account Number' ? '#10B981' : colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* IFSC Code */}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                IFSC Code
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Text
                  selectable
                  style={[
                    styles.detailValue,
                    {
                      color: colors.textPrimary,
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.bold,
                      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                    },
                  ]}
                >
                  {config.ifscCode}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(config.ifscCode, 'IFSC Code')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={copiedField === 'IFSC Code' ? 'checkmark-circle' : 'copy-outline'}
                    size={14}
                    color={copiedField === 'IFSC Code' ? '#10B981' : colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bank & Branch */}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                Bank & Branch
              </Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }]}>
                {config.bankName}{config.branch ? ` • ${config.branch}` : ''}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Modal for full size QR */}
      <Modal visible={qrModalVisible} transparent animationType="fade" onRequestClose={() => setQrModalVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
              alignItems: 'center',
              width: '100%',
              maxWidth: 360,
              gap: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                Community UPI QR Scanner
              </Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {config.upiQrUri ? (
              <Image
                source={{ uri: config.upiQrUri }}
                style={{ width: 240, height: 240, borderRadius: 12 }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: 220,
                  height: 220,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFFBEB',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#D97706',
                  gap: 8,
                }}
              >
                <Ionicons name="qr-code" size={90} color="#D97706" />
                <Text style={{ fontSize: 13, fontWeight: fontWeight.bold, color: '#B45309' }}>
                  {config.upiId}
                </Text>
              </View>
            )}

            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                {config.accountHolder}
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                UPI ID: {config.upiId}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => copyToClipboard(config.upiId, 'UPI ID')}
              style={{
                backgroundColor: '#D97706',
                paddingVertical: 10,
                paddingHorizontal: spacing.lg,
                borderRadius: borderRadius.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: fontWeight.bold, fontSize: fontSize.sm }}>
                Copy UPI ID ({config.upiId})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  detailLabel: {
    flex: 1,
  },
  detailValue: {
    textAlign: 'right',
  },
});
