import Link from 'next/link';
import { BalajiNamam } from '@/components/ui';
import { TirupatiHeaderBanner } from '@/components/layout/TirupatiHeaderBanner';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Majestic Tirupati Devasthanams Sacred Header Banner */}
      <div className="w-full flex-shrink-0" style={{ backgroundColor: 'var(--surface)' }}>
        <TirupatiHeaderBanner showMenuButton={false} />
      </div>

      {/* Sub-bar Quick Access */}
      <div className="border-b" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex justify-between items-center text-xs">
          <div className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="text-amber-500">★</span>
            <span>Srivari Community Fund • ஸ்ரீவாரி சமுதாய நிதி போர்ட்டல்</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/visitor"
              className="px-4 py-1.5 rounded-full text-white font-bold text-xs transition-opacity hover:opacity-90 shadow-sm"
              style={{ backgroundColor: '#064E3B', border: '1px solid #10B981' }}
            >
              Direct Open Dashboard →
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full font-bold text-xs transition-opacity hover:opacity-90 border"
              style={{ backgroundColor: 'var(--surface-variant)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            >
              Admin Login • நிர்வாகி
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6"
          style={{ backgroundColor: 'var(--primary-light)', color: 'var(--savings)', border: '1px solid var(--gold)' }}
        >
          ★ || ஓம் நமோ வெங்கடேஸ்வராய || ★
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
          Srivari Community Fund
        </h1>
        <p className="text-2xl mb-2 font-bold" style={{ color: 'var(--primary)' }}>
          || ஓம் நமோ வெங்கடேஸ்வராய ||
        </p>
        <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
          Tirupati Balaji Devotees Financial Seva & Accounting • திருப்பதி பாலாஜி பக்தர்கள் ஆன்மீக நிதி சேவை
        </p>
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center">
          <Link
            href="/visitor"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg transition-all hover:opacity-90 shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--primary)', border: '2px solid #F59E0B' }}
          >
            <span>Directly Open Dashboard • நேரடி டாஷ்போர்ட்</span>
            <span>→</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-base transition-all hover:bg-black/5 dark:hover:bg-white/5 border flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
          >
            <span>👑 Admin Login • நிர்வாகி உள்நுழைவு</span>
          </Link>
        </div>
      </section>

      {/* Festival Cards */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
          Community Festivals • சமுதாய பெருவிழாக்கள்
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Purattasi Sani Card */}
          <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ backgroundColor: '#851D1D', border: '2px solid #F59E0B' }}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#F59E0B' }} />
            <div className="inline-block px-3 py-1 rounded-md text-xs font-bold mb-3" style={{ backgroundColor: '#F59E0B', color: '#451A03' }}>
              YEARLY FESTIVAL • வருடாந்திர விழா
            </div>
            <h3 className="text-xl font-bold mb-1">Purattasi Sani Kiyamai</h3>
            <p className="text-sm mb-3" style={{ color: '#FDE68A' }}>
              புரட்டாசி சனிக்கிழமை • Annual Festival
            </p>
            <div className="bg-black/30 rounded-lg p-3 border-l-4" style={{ borderLeftColor: '#F59E0B' }}>
              <p className="text-sm font-bold">⭐ 2nd Saturday of Purattasi (Annual Function)</p>
              <p className="text-xs mt-1" style={{ color: '#FDE68A' }}>
                Balaji Thirumanjanam • Maavilakku Deepam • Annadhanam (திருமஞ்சனம் • மாவிளக்கு • அன்னதானம்)
              </p>
            </div>
          </div>

          {/* Gokulaashdami Card */}
          <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ backgroundColor: '#064E3B', border: '2px solid #10B981' }}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: '#10B981' }} />
            <div className="inline-block px-3 py-1 rounded-md text-xs font-bold mb-3" style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}>
              4-YEAR FESTIVAL • 4 வருட பெருவிழா
            </div>
            <h3 className="text-xl font-bold mb-1">Gokulaashdami Festival</h3>
            <p className="text-sm mb-3" style={{ color: '#A7F3D0' }}>
              கோகுலாஷ்டமி 4 வருட பெருவிழா • Every 4 Years
            </p>
            <div className="bg-black/30 rounded-lg p-3 border-l-4" style={{ borderLeftColor: '#10B981' }}>
              <p className="text-sm font-bold">🎁 Celebrated 2025 ✓ • Next in 2029 🌟</p>
              <p className="text-xs mt-1" style={{ color: '#A7F3D0' }}>
                Sri Krishna Janmashtami • Uriyadi • Maha Prasad (உறியடி உற்சவம் • மகா பிரசாதம்)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
          Everything You Need • அனைத்து வசதிகளும்
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: '👥', title: 'Members', tamil: 'உறுப்பினர்கள்', desc: 'Track devotee profiles and contributions' },
            { icon: '📈', title: 'Contributions', tamil: 'வருமானம்', desc: 'Record and track all seva donations' },
            { icon: '💸', title: 'Expenses', tamil: 'செலவுகள்', desc: 'Log and categorize all festival expenses' },
            { icon: '📊', title: 'Analytics', tamil: 'பகுப்பாய்வு', desc: 'Visual charts and financial trend analysis' },
            { icon: '📋', title: 'Reports', tamil: 'அறிக்கைகள்', desc: 'Export detailed CSV reports & ledgers' },
            { icon: '📅', title: 'Tamil Calendar', tamil: 'நாட்காட்டி', desc: 'Devotional Purattasi & festival dates' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{f.title}</div>
              <div className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>{f.tamil}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
        <p className="font-bold mb-1" style={{ color: 'var(--gold)' }}>
          || கோவிந்தா கோவிந்தா • Govinda Govinda ||
        </p>
        <p className="text-sm">Srivari Community Fund — Tirupati Balaji Devotees Seva</p>
        <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--primary)' }}>
          || ஓம் நமோ வெங்கடேஸ்வராய • ஸ்ரீ வெங்கடேஸ்வர சுவாமி துணை ||
        </p>
      </footer>
    </div>
  );
}
