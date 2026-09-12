import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store';
import { authService } from '../../services';
import { Badge, ConfirmDialog } from '../ui';

interface ProfileDropdownMenuProps {
  variant?: 'admin' | 'visitor';
}

export const ProfileDropdownMenu: React.FC<ProfileDropdownMenuProps> = ({
  variant = 'admin',
}) => {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, isDark, shadow } = useTheme();
  const { profile, user, reset } = useAuthStore();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileDetailsModalVisible, setProfileDetailsModalVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fullName = profile?.full_name || (variant === 'admin' ? 'Murugan Rajan' : 'Srivari Devotee');
  const userRole = profile?.role || variant;
  const userEmail = user?.email || (variant === 'admin' ? 'admin@srivari.org' : 'devotee@srivari.org');

  // Compute initials for avatar
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'MR';

  const handleLogoutPress = () => {
    setDropdownVisible(false);
    setShowLogoutConfirm(true);
  };

  const executeLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      reset();
      setShowLogoutConfirm(false);
      setLoggingOut(false);
      router.replace('/(auth)/login');
      if (Platform.OS === 'web') {
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/(auth)/login') {
            window.location.href = '/';
          }
        }, 200);
      }
    }
  };

  const handleOpenSettings = () => {
    setDropdownVisible(false);
    if (variant === 'admin') {
      router.push('/(admin)/more/settings');
    } else {
      router.push('/(visitor)/profile');
    }
  };

  const handleOpenProfileDetails = () => {
    setDropdownVisible(false);
    setProfileDetailsModalVisible(true);
  };

  const handleOpenPaymentSettings = () => {
    setDropdownVisible(false);
    if (variant === 'admin') {
      router.push('/(admin)/more/payment-settings');
    } else {
      router.push('/(visitor)/contributions');
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      {/* Header Profile Trigger Button */}
      <TouchableOpacity
        onPress={() => setDropdownVisible(!dropdownVisible)}
        activeOpacity={0.75}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: isDark ? '#1E293B' : '#FFFBEB',
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: borderRadius.full,
          borderWidth: 1.5,
          borderColor: userRole === 'admin' ? '#F59E0B' : '#10B981',
        }}
      >
        {/* Avatar Circle */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: userRole === 'admin' ? '#B45309' : '#059669',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#FFFFFF',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>
            {initials}
          </Text>
        </View>

        {/* Role Pill */}
        <View style={{ alignItems: 'flex-start' }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: fontWeight.bold,
              color: userRole === 'admin' ? '#B45309' : '#047857',
              textTransform: 'capitalize',
            }}
          >
            {userRole === 'admin' ? 'Admin' : 'Devotee'}
          </Text>
        </View>

        {/* Chevron */}
        <Ionicons
          name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={userRole === 'admin' ? '#B45309' : '#047857'}
        />
      </TouchableOpacity>

      {/* Floating Dropdown Menu Modal */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}
              >
                {/* User Info Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    padding: spacing.md,
                    backgroundColor: isDark ? '#0F172A' : '#FFFBEB',
                    borderTopLeftRadius: borderRadius.lg - 1,
                    borderTopRightRadius: borderRadius.lg - 1,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#334155' : '#FDE68A',
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: userRole === 'admin' ? '#B45309' : '#059669',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 3,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
                      {initials}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={{
                          fontSize: fontSize.sm,
                          fontWeight: fontWeight.bold,
                          color: colors.textPrimary,
                        }}
                        numberOfLines={1}
                      >
                        {fullName}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.textSecondary,
                        marginTop: 1,
                      }}
                      numberOfLines={1}
                    >
                      {userEmail}
                    </Text>
                    <View style={{ marginTop: 4, flexDirection: 'row' }}>
                      <View
                        style={{
                          backgroundColor: userRole === 'admin' ? '#FEF3C7' : '#D1FAE5',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: borderRadius.sm,
                        }}
                      >
                        <Text
                          style={{
                            color: userRole === 'admin' ? '#92400E' : '#065F46',
                            fontSize: 10,
                            fontWeight: '700',
                          }}
                        >
                          {userRole === 'admin' ? '★ Administrator' : '✓ Community Devotee'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Menu Items */}
                <View style={{ paddingVertical: spacing.xs }}>
                  {/* Core 4 Sections: Members, Income, Expenses, Savings */}
                  <TouchableOpacity
                    onPress={() => {
                      setDropdownVisible(false);
                      router.push(variant === 'admin' ? '/(admin)/members' : '/(visitor)/members');
                    }}
                    activeOpacity={0.7}
                    style={styles.menuItem}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="people-outline" size={17} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                        Members (உறுப்பினர்கள்)
                      </Text>
                      <Text style={styles.menuSubtitle}>Community Directory • பட்டியல்</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setDropdownVisible(false);
                      router.push(variant === 'admin' ? '/(admin)/contributions' : '/(visitor)/contributions');
                    }}
                    activeOpacity={0.7}
                    style={styles.menuItem}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                      <Ionicons name="trending-up-outline" size={17} color="#16A34A" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                        Income (வருமானம்)
                      </Text>
                      <Text style={styles.menuSubtitle}>Contributions & Seva • நிதி</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setDropdownVisible(false);
                      router.push(variant === 'admin' ? '/(admin)/expenses' : '/(visitor)/expenses');
                    }}
                    activeOpacity={0.7}
                    style={styles.menuItem}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
                      <Ionicons name="trending-down-outline" size={17} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                        Expenses (செலவுகள்)
                      </Text>
                      <Text style={styles.menuSubtitle}>Function Vouchers • பற்று</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setDropdownVisible(false);
                      router.push(variant === 'admin' ? '/(admin)/savings' : '/(visitor)/savings');
                    }}
                    activeOpacity={0.7}
                    style={styles.menuItem}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#F5F3FF' }]}>
                      <Ionicons name="wallet-outline" size={17} color="#7C3AED" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                        Savings (சேமிப்பு)
                      </Text>
                      <Text style={styles.menuSubtitle}>Srivari Fund Growth • இருப்பு</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>

                  {/* Section Divider */}
                  <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />

                  {/* Account & Profile Details */}
                  <TouchableOpacity
                    onPress={handleOpenProfileDetails}
                    activeOpacity={0.7}
                    style={styles.menuItem}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#F8FAFC' }]}>
                      <Ionicons name="person-circle-outline" size={18} color="#64748B" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                        Profile Details
                      </Text>
                      <Text style={styles.menuSubtitle}>சுயவிவர தகவல்கள்</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>

                  {/* Bank & UPI QR Accounts */}
                  <TouchableOpacity
                    onPress={handleOpenPaymentSettings}
                    activeOpacity={0.7}
                    style={styles.menuItem}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="qr-code-outline" size={17} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                        Bank & UPI QR
                      </Text>
                      <Text style={styles.menuSubtitle}>வங்கி & QR கணக்குகள்</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>

                  {/* Settings */}
                  <TouchableOpacity
                    onPress={handleOpenSettings}
                    activeOpacity={0.7}
                    style={styles.menuItem}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name="settings-outline" size={17} color="#9333EA" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>
                        Settings
                      </Text>
                      <Text style={styles.menuSubtitle}>Language, Theme & Alerts</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} />

                  {/* Logout */}
                  <TouchableOpacity
                    onPress={handleLogoutPress}
                    activeOpacity={0.7}
                    style={styles.menuItem}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
                      <Ionicons name="log-out-outline" size={17} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuTitle, { color: '#DC2626', fontWeight: '700' }]}>
                        Logout
                      </Text>
                      <Text style={styles.menuSubtitle}>வெளியேறு</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Full Profile Details Dialog Modal */}
      <Modal
        visible={profileDetailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileDetailsModalVisible(false)}
      >
        <View style={styles.detailsModalOverlay}>
          <View
            style={[
              styles.detailsCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              },
            ]}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <View>
                <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                  Profile Details
                </Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                  கணக்கு சுயவிவரம்
                </Text>
              </View>
              <TouchableOpacity onPress={() => setProfileDetailsModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Profile Avatar & Info Card */}
            <View
              style={{
                alignItems: 'center',
                padding: spacing.md,
                backgroundColor: isDark ? '#0F172A' : '#FFFBEB',
                borderRadius: borderRadius.md,
                borderWidth: 1,
                borderColor: '#FDE68A',
                marginBottom: spacing.md,
                gap: 6,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: userRole === 'admin' ? '#B45309' : '#059669',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 22 }}>
                  {initials}
                </Text>
              </View>
              <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                {fullName}
              </Text>
              <Badge
                label={userRole === 'admin' ? 'Administrator' : 'Community Member'}
                variant={userRole === 'admin' ? 'primary' : 'success'}
                size="sm"
              />
            </View>

            {/* Account Details Table */}
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
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Full Name</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary, fontWeight: fontWeight.semibold }]}>
                  {fullName}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email Address</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary, fontWeight: fontWeight.semibold }]}>
                  {userEmail}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Role</Text>
                <Text style={[styles.detailValue, { color: userRole === 'admin' ? '#B45309' : '#059669', fontWeight: fontWeight.bold }]}>
                  {userRole.toUpperCase()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Community</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  Srivari Devotees Seva Trust
                </Text>
              </View>

              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
                  <Text style={[styles.detailValue, { color: '#10B981', fontWeight: fontWeight.bold }]}>
                    Active & Verified
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <TouchableOpacity
                onPress={() => {
                  setProfileDetailsModalVisible(false);
                  setShowLogoutConfirm(true);
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: borderRadius.md,
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1,
                  borderColor: '#FECACA',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 4,
                }}
              >
                <Ionicons name="log-out-outline" size={16} color="#DC2626" />
                <Text style={{ color: '#DC2626', fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>
                  Logout
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setProfileDetailsModalVisible(false);
                  handleOpenSettings();
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 6,
                }}
              >
                <Ionicons name="settings-outline" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>
                  Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setProfileDetailsModalVisible(false)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Dialog for Logout (Works 100% on Web, iOS, Android) */}
      <ConfirmDialog
        visible={showLogoutConfirm}
        title={t('auth.logout', 'Sign Out')}
        message="Are you sure you want to log out of your account? (உங்கள் கணக்கிலிருந்து வெளியேற விரும்புகிறீர்களா?)"
        confirmLabel={t('auth.logout', 'Log Out')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="danger"
        loading={loggingOut}
        onConfirm={executeLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 95 : 90,
    paddingRight: 16,
  },
  dropdownCard: {
    width: 270,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 12,
  },
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    textAlign: 'right',
  },
});
