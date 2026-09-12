import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { useAuthStore } from '../../../src/store';
import { memberService } from '../../../src/services';
import { Input, Button } from '../../../src/components/ui';
import { VoiceFormModal } from '../../../src/components/voice';
import { MemberStatus } from '../../../src/types/member';
import { formatDateInput } from '../../../src/utils/formatters';
import { getErrorMessage } from '../../../src/utils';

export default function AddMemberScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();
  const { user } = useAuthStore();
  const params = useLocalSearchParams<{
    fullName?: string;
    phone?: string;
    email?: string;
    role?: string;
  }>();

  const [memberId, setMemberId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<MemberStatus>('active');
  const [role, setRole] = useState<'admin' | 'visitor'>('visitor');
  const [joinDate, setJoinDate] = useState(formatDateInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Pre-fill from query params if directed from AI Assistant
  useEffect(() => {
    if (params.fullName) setFullName(String(params.fullName));
    if (params.phone) setPhone(String(params.phone));
    if (params.email) setEmail(String(params.email));
    if (params.role && ['admin', 'visitor'].includes(params.role)) {
      setRole(params.role as 'admin' | 'visitor');
    }
  }, [params.fullName, params.phone, params.email, params.role]);
  useEffect(() => {
    generateId();
  }, []);

  const generateId = async () => {
    try {
      const nextId = await memberService.generateMemberId();
      setMemberId(nextId);
    } catch (e) {
      console.warn('Could not auto-generate member ID:', e);
      setMemberId('MBR001');
    }
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full name is required.');
      return;
    }
    if (!memberId.trim()) {
      Alert.alert('Validation Error', 'Member ID is required.');
      return;
    }

    setLoading(true);
    const userId = user?.id;
    if (!userId) {
      Alert.alert('Session Expired', 'Please log in again.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
      setLoading(false);
      return;
    }
    try {
      await memberService.create(
        {
          member_id: memberId.trim().toUpperCase(),
          full_name: fullName.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          role,
          status,
          join_date: joinDate,
        },
        userId
      );

      Alert.alert('Success', 'Member added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            Add Community Member
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

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 60 }}>
        {/* Voice Dictation Quick Banner */}
        <TouchableOpacity
          onPress={() => setIsVoiceModalOpen(true)}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#EFF6FF',
            borderColor: '#3B82F6',
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
                backgroundColor: '#2563EB',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="mic" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#1E40AF', fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>
                Fill with Voice / AI Assistant
              </Text>
              <Text style={{ color: '#1D4ED8', fontSize: 11 }}>
                e.g. "Add member Ramesh phone 9845012345 email ramesh@gmail.com"
              </Text>
            </View>
          </View>
          <Ionicons name="sparkles" size={18} color="#2563EB" />
        </TouchableOpacity>
        {/* Auto Generated Member ID */}
        <Input
          label="Member ID *"
          value={memberId}
          onChangeText={setMemberId}
          placeholder="e.g. MBR001"
          autoCapitalize="characters"
        />

        {/* Full Name */}
        <Input
          label="Full Name *"
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Selvam Krishnan"
        />

        {/* Phone */}
        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="e.g. +91 98765 43210"
          keyboardType="phone-pad"
        />

        {/* Email */}
        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="e.g. member@community.org"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Join Date */}
        <Input
          label="Join Date (YYYY-MM-DD) *"
          value={joinDate}
          onChangeText={setJoinDate}
          placeholder="YYYY-MM-DD"
        />

        {/* Role Access */}
        <View style={{ marginBottom: spacing.xs }}>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Role Access *
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TouchableOpacity
              onPress={() => setRole('admin')}
              style={{
                flex: 1,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.sm,
                borderRadius: borderRadius.md,
                backgroundColor: role === 'admin' ? colors.primaryLight : colors.surface,
                borderWidth: 1.5,
                borderColor: role === 'admin' ? colors.primary : colors.border,
                alignItems: 'center',
                gap: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="shield-checkmark" size={18} color={role === 'admin' ? colors.primary : colors.textTertiary} />
                <Text style={{ color: role === 'admin' ? colors.primary : colors.textPrimary, fontWeight: fontWeight.bold, fontSize: fontSize.sm }}>
                  Admin
                </Text>
              </View>
              <Text style={{ color: colors.textTertiary, fontSize: 10, textAlign: 'center' }}>
                Full Management Access
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRole('visitor')}
              style={{
                flex: 1,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.sm,
                borderRadius: borderRadius.md,
                backgroundColor: role === 'visitor' ? colors.primaryLight : colors.surface,
                borderWidth: 1.5,
                borderColor: role === 'visitor' ? colors.primary : colors.border,
                alignItems: 'center',
                gap: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="person-outline" size={18} color={role === 'visitor' ? colors.primary : colors.textTertiary} />
                <Text style={{ color: role === 'visitor' ? colors.primary : colors.textPrimary, fontWeight: fontWeight.bold, fontSize: fontSize.sm }}>
                  Visitor / Devotee
                </Text>
              </View>
              <Text style={{ color: colors.textTertiary, fontSize: 10, textAlign: 'center' }}>
                Read-Only Portal Access
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status */}
        <View>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            Member Status
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {(['active', 'inactive'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.md,
                  backgroundColor: status === s ? colors.primaryLight : colors.surface,
                  borderWidth: 1.5,
                  borderColor: status === s ? colors.primary : colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: status === s ? colors.primary : colors.textPrimary, fontWeight: fontWeight.bold, textTransform: 'capitalize' }}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit */}
        <View style={{ marginTop: spacing.lg }}>
          <Button
            title="Save Member"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Voice Assistant Modal */}
      <VoiceFormModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        type="member"
        onApply={(parsed) => {
          if ('fullName' in parsed && parsed.fullName) setFullName(parsed.fullName);
          if ('phone' in parsed && parsed.phone) setPhone(parsed.phone);
          if ('email' in parsed && parsed.email) setEmail(parsed.email);
          if ('role' in parsed && parsed.role) setRole(parsed.role);
          if ('status' in parsed && parsed.status) setStatus(parsed.status);
        }}
      />
    </KeyboardAvoidingView>
  );
}
