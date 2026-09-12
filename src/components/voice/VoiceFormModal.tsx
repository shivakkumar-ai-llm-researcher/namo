import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { voiceService } from '../../services/voiceService';
import {
  aiService,
  ExpenseParsedData,
  IncomeParsedData,
  MemberParsedData,
} from '../../services/aiService';
import { Member } from '../../types';

export type VoiceFormType = 'expense' | 'income' | 'member';

interface VoiceFormModalProps {
  visible: boolean;
  onClose: () => void;
  type: VoiceFormType;
  title?: string;
  members?: Member[];
  onApply: (data: ExpenseParsedData | IncomeParsedData | MemberParsedData) => void;
}

export function VoiceFormModal({
  visible,
  onClose,
  type,
  title,
  members = [],
  onApply,
}: VoiceFormModalProps) {
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parsed preview
  const [parsedExpense, setParsedExpense] = useState<ExpenseParsedData | null>(null);
  const [parsedIncome, setParsedIncome] = useState<IncomeParsedData | null>(null);
  const [parsedMember, setParsedMember] = useState<MemberParsedData | null>(null);

  // Pulse animation for mic
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  useEffect(() => {
    if (visible) {
      setTranscript('');
      setErrorMsg(null);
      setParsedExpense(null);
      setParsedIncome(null);
      setParsedMember(null);

      // Auto-start listening on Web if supported
      if (voiceService.isSpeechRecognitionSupported()) {
        startRecording();
      }
    } else {
      stopRecording();
    }
  }, [visible]);

  // Update parsed data whenever transcript changes
  useEffect(() => {
    if (!transcript.trim()) {
      setParsedExpense(null);
      setParsedIncome(null);
      setParsedMember(null);
      return;
    }

    if (type === 'expense') {
      const parsed = aiService.parseExpenseVoice(transcript);
      setParsedExpense(parsed);
    } else if (type === 'income') {
      const parsed = aiService.parseIncomeVoice(transcript, members);
      setParsedIncome(parsed);
    } else if (type === 'member') {
      const parsed = aiService.parseMemberVoice(transcript);
      setParsedMember(parsed);
    }
  }, [transcript, type, members]);

  const startRecording = () => {
    setErrorMsg(null);
    const started = voiceService.startListening({
      onStart: () => setIsListening(true),
      onResult: (text) => {
        setTranscript(text);
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMsg(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleApply = () => {
    stopRecording();
    if (type === 'expense' && parsedExpense) {
      onApply(parsedExpense);
    } else if (type === 'income' && parsedIncome) {
      onApply(parsedIncome);
    } else if (type === 'member' && parsedMember) {
      onApply(parsedMember);
    }
    onClose();
  };

  const handleQuickPrompt = (prompt: string) => {
    setTranscript(prompt);
  };

  const getExamples = () => {
    if (type === 'expense') {
      return [
        'Spent ₹1500 for flowers and decoration paid cash',
        'Hall advance 10000 paid via UPI',
        'Catering food 4500 bank transfer',
        'Sound system mic rent 2000 upi',
      ];
    } else if (type === 'income') {
      return [
        'Received ₹5,000 contribution via UPI',
        'Cash donation 2000 for temple function',
        '10000 bank transfer contribution',
      ];
    } else {
      return [
        'Add member Ramesh Kumar phone 9845012345 email ramesh@gmail.com',
        'Member Priya Sundaram phone 9940123456 role admin',
        'Add member Suresh 9123456789 visitor',
      ];
    }
  };

  const hasParsedData =
    (type === 'expense' && (parsedExpense?.amount || parsedExpense?.description)) ||
    (type === 'income' && (parsedIncome?.amount || parsedIncome?.memberName)) ||
    (type === 'member' && (parsedMember?.fullName || parsedMember?.phone));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={[
                  styles.headerIcon,
                  {
                    backgroundColor: colors.primary + '18',
                  },
                ]}
              >
                <Ionicons name="mic" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }]}>
                  {title || (type === 'expense' ? 'Voice Fill Expense' : type === 'income' ? 'Voice Fill Income' : 'Voice Add Member')}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                  Speak or type to auto-fill form fields
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
            {/* Microphone Pulsing Section */}
            <View style={styles.micSection}>
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <TouchableOpacity
                  onPress={handleToggleListening}
                  activeOpacity={0.8}
                  style={[
                    styles.micButton,
                    {
                      backgroundColor: isListening ? '#EF4444' : colors.primary,
                    },
                    shadow.md,
                  ]}
                >
                  <Ionicons name={isListening ? 'stop' : 'mic'} size={36} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>

              <Text
                style={{
                  color: isListening ? '#EF4444' : colors.textPrimary,
                  fontSize: fontSize.md,
                  fontWeight: fontWeight.bold,
                  marginTop: spacing.xs,
                }}
              >
                {isListening ? 'Listening... Speak now' : 'Tap Mic to Speak'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, textAlign: 'center' }}>
                {isListening
                  ? 'Say amount, purpose, category, and payment method'
                  : 'Or type your instruction below'}
              </Text>
            </View>

            {errorMsg && (
              <View style={[styles.errorBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                <Text style={{ color: '#DC2626', fontSize: fontSize.xs, flex: 1 }}>{errorMsg}</Text>
              </View>
            )}

            {/* Transcript & Editable Input */}
            <View style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  Recognized Speech / Command:
                </Text>
                {transcript.length > 0 && (
                  <TouchableOpacity onPress={() => setTranscript('')}>
                    <Text style={{ color: colors.primary, fontSize: fontSize.xs }}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                value={transcript}
                onChangeText={setTranscript}
                placeholder={
                  type === 'expense'
                    ? 'e.g. Spent 1200 for temple flowers cash'
                    : type === 'income'
                    ? 'e.g. Received 5000 donation via UPI'
                    : 'e.g. Add member Suresh phone 9845012345'
                }
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    borderRadius: borderRadius.md,
                    fontSize: fontSize.sm,
                  },
                ]}
              />
            </View>

            {/* Parsed Extracted Values Preview Card */}
            {hasParsedData && (
              <View
                style={[
                  styles.previewCard,
                  {
                    backgroundColor: colors.surfaceVariant || '#F8FAFC',
                    borderColor: colors.primary + '40',
                    borderRadius: borderRadius.lg,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs }}>
                  <Ionicons name="sparkles" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase' }}>
                    Extracted Form Fields
                  </Text>
                </View>

                {type === 'expense' && parsedExpense && (
                  <View style={{ gap: 4 }}>
                    {parsedExpense.amount && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Amount:</Text>
                        <Text style={[styles.previewValue, { color: colors.textPrimary, fontWeight: fontWeight.bold }]}>
                          ₹{Number(parsedExpense.amount).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    )}
                    {parsedExpense.category && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Category:</Text>
                        <Text style={[styles.previewValue, { color: colors.primary, fontWeight: fontWeight.semibold }]}>
                          {parsedExpense.category.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    )}
                    {parsedExpense.paymentMethod && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Payment Method:</Text>
                        <Text style={[styles.previewValue, { color: colors.textPrimary }]}>
                          {parsedExpense.paymentMethod.toUpperCase()}
                        </Text>
                      </View>
                    )}
                    {parsedExpense.description && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Description:</Text>
                        <Text style={[styles.previewValue, { color: colors.textPrimary }]} numberOfLines={1}>
                          {parsedExpense.description}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {type === 'income' && parsedIncome && (
                  <View style={{ gap: 4 }}>
                    {parsedIncome.amount && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Amount:</Text>
                        <Text style={[styles.previewValue, { color: colors.income || '#16A34A', fontWeight: fontWeight.bold }]}>
                          ₹{Number(parsedIncome.amount).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    )}
                    {parsedIncome.memberName && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Member:</Text>
                        <Text style={[styles.previewValue, { color: colors.primary, fontWeight: fontWeight.semibold }]}>
                          {parsedIncome.memberName}
                        </Text>
                      </View>
                    )}
                    {parsedIncome.paymentMethod && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Payment Method:</Text>
                        <Text style={[styles.previewValue, { color: colors.textPrimary }]}>
                          {parsedIncome.paymentMethod.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {type === 'member' && parsedMember && (
                  <View style={{ gap: 4 }}>
                    {parsedMember.fullName && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Name:</Text>
                        <Text style={[styles.previewValue, { color: colors.textPrimary, fontWeight: fontWeight.bold }]}>
                          {parsedMember.fullName}
                        </Text>
                      </View>
                    )}
                    {parsedMember.phone && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Phone:</Text>
                        <Text style={[styles.previewValue, { color: colors.textPrimary }]}>
                          {parsedMember.phone}
                        </Text>
                      </View>
                    )}
                    {parsedMember.email && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Email:</Text>
                        <Text style={[styles.previewValue, { color: colors.textPrimary }]}>
                          {parsedMember.email}
                        </Text>
                      </View>
                    )}
                    {parsedMember.role && (
                      <View style={styles.previewRow}>
                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Role:</Text>
                        <Text style={[styles.previewValue, { color: colors.primary, fontWeight: fontWeight.semibold }]}>
                          {parsedMember.role.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Quick Example Chips */}
            <View style={{ gap: spacing.xs }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: fontWeight.semibold }}>
                Examples to try:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {getExamples().map((ex, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleQuickPrompt(ex)}
                    style={[
                      styles.exampleChip,
                      {
                        backgroundColor: colors.surfaceVariant || '#F1F5F9',
                        borderColor: colors.border,
                        borderRadius: borderRadius.full,
                      },
                    ]}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{ex}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Action Buttons */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.cancelBtn,
                {
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: fontWeight.medium, fontSize: fontSize.sm }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              disabled={!hasParsedData}
              style={[
                styles.applyBtn,
                {
                  backgroundColor: hasParsedData ? colors.primary : colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: fontWeight.bold, fontSize: fontSize.sm }}>
                Apply to Form
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    letterSpacing: 0.2,
  },
  micSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  inputBox: {
    borderWidth: 1,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  previewCard: {
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  previewLabel: {
    fontSize: 12,
  },
  previewValue: {
    fontSize: 13,
  },
  exampleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
});
