import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useApp } from '../context/AppContext';
import { getPlans, PlanDoc, addSubscription, addTransaction } from '../lib/db';
import { setUser } from '../lib/db';

export default function VipModal() {
  const { vipModalOpen, closeVip, isLoggedIn, openLogin, user, refreshUser } = useApp();
  const [plans, setPlans] = useState<PlanDoc[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (vipModalOpen) getPlans().then(setPlans);
  }, [vipModalOpen]);

  if (!vipModalOpen) return null;

  const calcEnd = (plan: PlanDoc): Date => {
    const end = new Date();
    if (plan.durationUnit === 'day') end.setDate(end.getDate() + plan.duration);
    else if (plan.durationUnit === 'week') end.setDate(end.getDate() + plan.duration * 7);
    else if (plan.durationUnit === 'month') end.setMonth(end.getMonth() + plan.duration);
    else end.setFullYear(end.getFullYear() + plan.duration);
    return end;
  };

  const handleSubscribe = async (plan: PlanDoc) => {
    if (!isLoggedIn || !user) { closeVip(); openLogin('login'); return; }
    setLoading(plan.id!);
    try {
      const start = new Date();
      const end = calcEnd(plan);

      await setUser(user.uid, {
        isVip: true,
        vipExpiry: Timestamp.fromDate(end) as any,
      });

      await addSubscription({
        userId: user.uid,
        userEmail: user.email,
        userName: user.name,
        plan: plan.name,
        amount: plan.price,
        startDate: Timestamp.fromDate(start),
        endDate: Timestamp.fromDate(end),
        status: 'active',
      });

      await addTransaction({
        type: 'subscription',
        desc: `${plan.name} VIP — ${user.email}`,
        amount: plan.price,
        date: Timestamp.fromDate(start),
        status: 'completed',
      });

      await refreshUser();
      setSuccess(plan.name);
      setTimeout(() => { setSuccess(null); closeVip(); }, 2200);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  if (success) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
      <div style={{ position: 'relative', background: '#1a1a1a', borderRadius: 20, padding: '48px 40px', textAlign: 'center', border: '1px solid rgba(34,197,94,0.3)' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" style={{ marginBottom: 16 }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
        </svg>
        <div style={{ color: '#22c55e', fontSize: 18, fontWeight: 700, letterSpacing: 1, fontFamily: 'Arial, sans-serif' }}>VIP ACTIVATED!</div>
        <div style={{ color: '#666', fontSize: 12, marginTop: 8, fontFamily: 'Arial, sans-serif' }}>{success} PLAN IS NOW ACTIVE</div>
      </div>
    </div>
  );

  const defaultPlans: PlanDoc[] = plans.length ? plans : [
    { id: 'daily', name: 'DAILY', price: 2000, duration: 1, durationUnit: 'day', features: 'HD STREAMING, NO ADS, 1 DEVICE', isActive: true, color: '#22c55e' },
    { id: 'weekly', name: 'WEEKLY', price: 4000, duration: 1, durationUnit: 'week', features: 'HD STREAMING, NO ADS, 1 DEVICE', isActive: true, color: '#4a9eff' },
    { id: 'monthly', name: 'MONTHLY', price: 12000, duration: 1, durationUnit: 'month', features: 'HD STREAMING, NO ADS, EXCLUSIVE CONTENT, 1 DEVICE', isActive: true, color: '#e50914' },
    { id: 'yearly', name: 'YEARLY', price: 90000, duration: 1, durationUnit: 'year', features: '4K ULTRA HD, NO ADS, ALL CONTENT, 4 DEVICES, DOWNLOAD OFFLINE, EARLY ACCESS', isActive: true, color: '#f5a623' },
  ];

  const activePlans = defaultPlans.filter(p => p.isActive);

  const durationLabel = (plan: PlanDoc) => {
    const unit = plan.durationUnit;
    const s = plan.duration > 1 ? 'S' : '';
    return `${plan.duration} ${unit.toUpperCase()}${s}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={closeVip} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }} />
      <div style={{ position: 'relative', background: 'linear-gradient(145deg,#1a1a1a,#111)', borderRadius: 20, width: Math.min(900, activePlans.length * 220 + 96), maxWidth: '97vw', padding: '36px 32px 32px', boxShadow: '0 32px 100px rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '95vh', overflowY: 'auto' }}>
        <button onClick={closeVip} style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round"><path d="M2 19h20M3 9l4 5 5-8 5 8 4-5v10H3z"/></svg>
            <span style={{ color: '#f5a623', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 2 }}>VIP MEMBERSHIP</span>
          </div>
          <h2 style={{ color: '#fff', fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 24, fontWeight: 900, margin: '0 0 8px', letterSpacing: 1 }}>UNLOCK PREMIUM EXPERIENCE</h2>
          <p style={{ color: '#666', fontFamily: 'Arial, sans-serif', fontSize: 12, letterSpacing: 1, margin: 0 }}>4K STREAMING · NO ADS · EXCLUSIVE CONTENT</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(activePlans.length, 4)}, 1fr)`, gap: 14 }}>
          {activePlans.map((plan, i) => {
            const isPopular = activePlans.length >= 3 && i === Math.floor(activePlans.length / 2);
            const isBest = activePlans.length > 2 && i === activePlans.length - 1;
            const badge = isPopular ? 'POPULAR' : isBest ? 'BEST VALUE' : null;
            return (
              <div key={plan.id} style={{ position: 'relative', background: isPopular ? 'linear-gradient(145deg,#2a0a0a,#1a0505)' : '#1e1e1e', border: `1px solid ${isPopular ? '#e50914' : 'rgba(255,255,255,0.08)'}`, borderRadius: 16, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                {badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: badge === 'POPULAR' ? '#e50914' : 'linear-gradient(90deg,#f5a623,#e08a00)', borderRadius: 20, padding: '4px 14px', fontSize: 10, fontFamily: 'Arial, sans-serif', fontWeight: 700, letterSpacing: 1.5, color: '#fff', whiteSpace: 'nowrap' }}>
                    {badge}
                  </div>
                )}
                <div>
                  <div style={{ color: plan.color, fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ color: '#aaa', fontSize: 12, fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>UGX</span>
                    <span style={{ color: '#fff', fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 28, fontWeight: 900 }}>{plan.price.toLocaleString()}</span>
                    <span style={{ color: '#555', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 1 }}>/ {durationLabel(plan)}</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {plan.features.split(',').map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ccc', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.8 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      {f.trim()}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleSubscribe(plan)} disabled={!!loading} style={{ width: '100%', padding: '12px', background: isPopular ? 'linear-gradient(135deg,#e50914,#c0000a)' : isBest ? 'linear-gradient(135deg,#f5a623,#e08a00)' : `rgba(${plan.color === '#4a9eff' ? '74,158,255' : plan.color === '#22c55e' ? '34,197,94' : '255,255,255'},0.1)`, border: isPopular || isBest ? 'none' : `1px solid ${plan.color}44`, borderRadius: 10, color: '#fff', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading === plan.id ? 'PROCESSING...' : 'SUBSCRIBE NOW'}
                </button>
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#333', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: 0.8 }}>
          CANCEL ANYTIME · AUTO-RENEWAL · SECURE PAYMENT · ALL PRICES IN UGX
        </p>
      </div>
    </div>
  );
}
