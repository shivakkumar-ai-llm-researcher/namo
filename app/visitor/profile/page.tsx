'use client';
import { useRouter } from 'next/navigation';
import { LogOut, User, Shield, Phone, Mail } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/formatters';

export default function ProfilePage() {
  const { profile, user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/visitor');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Devotee Account Details • சுயவிவரம்</p>
      </div>

      <Card className="text-center py-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 shadow-md"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {getInitials(profile?.full_name)}
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {profile?.full_name || 'Srivari Devotee'}
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {user?.email || 'devotee@community.org'}
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
          <Shield size={12} />
          {profile?.role === 'admin' ? 'Community Administrator' : 'Community Devotee'}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Account Information</h3>
        <div className="space-y-3 divide-y" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 pt-2">
            <User size={16} style={{ color: 'var(--text-tertiary)' }} />
            <div className="flex-1">
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Full Name</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{profile?.full_name || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Mail size={16} style={{ color: 'var(--text-tertiary)' }} />
            <div className="flex-1">
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Email</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.email || '—'}</p>
            </div>
          </div>
        </div>
      </Card>

      {user ? (
        <Button
          variant="danger"
          fullWidth
          onClick={handleSignOut}
          leftIcon={<LogOut size={16} />}
        >
          Sign Out • வெளியேறு
        </Button>
      ) : (
        <Button
          variant="primary"
          fullWidth
          onClick={() => router.push('/login')}
          leftIcon={<Shield size={16} />}
        >
          Admin Login • நிர்வாகி உள்நுழைவு
        </Button>
      )}
    </div>
  );
}
