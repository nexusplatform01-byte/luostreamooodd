import { useState, useEffect, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useApp } from '../context/AppContext';
import { getPlans, PlanDoc, addSubscription, addTransaction } from '../lib/db';
import { setUser } from '../lib/db';
import {
  apiDeposit, apiPollStatus, apiValidatePhone,
  formatUgPhone, isPaymentSuccess, isPaymentFailed,
  StatusResult,
} from '../lib/payment';

type Step = 'plans' | 'pay' | 'awaiting' | 'success' | 'failed';

const PROVIDERS = [
  { id: 'mtn', name: 'MTN Mobile Money', color: '#f5a623', emoji: '📱', hint: '077, 078' },
  { id: 'airtel', name: 'Airtel Money', color: '#e50914', emoji: '📲', hint: '070, 075' },
];

const POLL_INTERVAL = 4000;
const POLL_MAX = 45;

export default function VipModal() {
  const { vipModalOpen, closeVip, isLoggedIn, openLogin, user, refreshUser } = useApp();
  const [plans, setPlans] = useState<PlanDoc[]>([]);
  const [step, setStep] = useState<Step>('plans');
  const [selectedPlan, setSelectedPlan] = useState<PlanDoc | null>(null);
  const [provider, setProvider] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [validating, setValidating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [failMsg, setFailMsg] = useState('');
  const [internalRef, setInternalRef] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  useEffect(() => {
    if (vipModalOpen) {
      getPlans().then(setPlans);
      setStep('plans');
      setSelectedPlan(null);
      setPhone('');
      setPhoneError('');
      setStatusMsg('');
      setFailMsg('');
    }
    return () => stopPolling();
  }, [vipModalOpen]);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  if (!vipModalOpen) return null;

  const calcEnd = (plan: PlanDoc): Date => {
    const end = new Date();
    if (plan.durationUnit === 'day') end.setDate(end.getDate() + plan.duration);
    else if (plan.durationUnit === 'week') end.setDate(end.getDate() + plan.duration * 7);
    else if (plan.durationUnit === 'month') end.setMonth(end.getMonth() + plan.duration);
    else end.setFullYear(end.getFullYear() + plan.duration);
    return end;
  };

  const activateVip = async (plan: PlanDoc, ref: string, phone: string, providerStr: string) => {
    if (!user) return;
    const start = new Date();
    const end = calcEnd(plan);
    await setUser(user.uid, { isVip: true, vipExpiry: Timestamp.fromDate(end) as any });
    await addSubscription({
      userId: user.uid, userEmail: user.email, userName: user.name,
      plan: plan.name, amount: plan.price,
      startDate: Timestamp.fromDate(start), endDate: Timestamp.fromDate(end), status: 'active',
    });
    await addTransaction({
      type: 'subscription',
      desc: `${plan.name} VIP — ${providerStr.toUpperCase()} Mobile Money — ${phone}`,
      amount: plan.price, date: Timestamp.fromDate(start), status: 'completed',
      internalRef: ref, phone, provider: providerStr,
    });
    await refreshUser();
  };

  const startPolling = (ref: string, plan: PlanDoc, formattedPhone: string, provStr: string) => {
    pollCount.current = 0;
    pollRef.current = setInterval(async () => {
      pollCount.current++;
      try {
        const st: StatusResult = await apiPollStatus(ref);
        if (isPaymentSuccess(st)) {
          stopPolling();
          await activateVip(plan, ref, formattedPhone, provStr);
          setStep('success');
        } else if (isPaymentFailed(st)) {
          stopPolling();
          setFailMsg(st.message || 'Payment was declined or failed. Please try again.');
          setStep('failed');
        } else if (pollCount.current >= POLL_MAX) {
          stopPolling();
          setFailMsg('Payment timed out. If money was deducted, please contact support.');
          setStep('failed');
        } else {
          setStatusMsg(`Waiting for confirmation on ${formattedPhone}… (${pollCount.current}/${POLL_MAX})`);
        }
      } catch {
        // network hiccup — keep polling
      }
    }, POLL_INTERVAL);
  };

  const handlePay = async () => {
    if (!selectedPlan || !user) return;
    const err = phone.replace(/\D/g, '').length < 9 ? 'Enter a valid phone number (at least 9 digits)' : '';
    if (err) { setPhoneError(err); return; }
    setPhoneError('');
    setValidating(true);

    const formatted = formatUgPhone(phone);

    try {
      // Validate phone first
      const validation = await apiValidatePhone(formatted);
      if (!validation.success) {
        setPhoneError(validation.message || 'Phone number is invalid or not registered for mobile money.');
        setValidating(false);
        return;
      }
    } catch {
      // Proceed anyway if validation call fails (network issue)
    }

    try {
      const result = await apiDeposit(
        formatted,
        selectedPlan.price,
        `FILM ILEB LUO — ${selectedPlan.name} VIP`,
      );

      if (!result.success && !result.internal_reference) {
        setPhoneError(result.message || 'Could not initiate payment. Please try again.');
        setValidating(false);
        return;
      }

      const ref = result.internal_reference || result.reference;
      setInternalRef(ref);
      setStatusMsg(`A payment prompt has been sent to ${formatted}. Please confirm on your phone.`);
      setStep('awaiting');
      startPolling(ref, selectedPlan, formatted, provider);
    } catch (e: any) {
      setPhoneError('Network error. Please check your connection and try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleSelectPlan = (plan: PlanDoc) => {
    if (!isLoggedIn || !user) { closeVip(); openLogin('login'); return; }
    setSelectedPlan(plan);
    setStep('pay');
  };

  const handleClose = () => {
    stopPolling();
    closeVip();
  };

  const defaultPlans: PlanDoc[] = plans.length ? plans : [
    { id: 'daily', name: 'DAILY', price: 2000, duration: 1, durationUnit: 'day', features: 'HD STREAMING, NO ADS, 1 DEVICE', isActive: true, color: '#22c55e' },
    { id: 'weekly', name: 'WEEKLY', price: 4000, duration: 1, durationUnit: 'week', features: 'HD STREAMING, NO ADS, 1 DEVICE', isActive: true, color: '#4a9eff' },
    { id: 'monthly', name: 'MONTHLY', price: 12000, duration: 1, durationUnit: 'month', features: 'HD STREAMING, NO ADS, EXCLUSIVE CONTENT, 1 DEVICE', isActive: true, color: '#e50914' },
    { id: 'yearly', name: 'YEARLY', price: 90000, duration: 1, durationUnit: 'year', features: '4K ULTRA HD, NO ADS, ALL CONTENT, 4 DEVICES, DOWNLOAD OFFLINE, EARLY ACCESS', isActive: true, color: '#f5a623' },
  ];

  const activePlans = defaultPlans.filter(p => p.isActive);

  const durationLabel = (plan: PlanDoc) => {
    const s = plan.duration > 1 ? 'S' : '';
    return `${plan.duration} ${plan.durationUnit.toUpperCase()}${s}`;
  };

  const overlay = (
    <div
      onClick={step === 'awaiting' ? undefined : handleClose}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
    />
  );

  /* ── SUCCESS ── */
  if (step === 'success') return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {overlay}
      <div style={{ position: 'relative', background: '#1a1a1a', borderRadius: 20, padding: '48px 40px', textAlign: 'center', border: '1px solid rgba(34,197,94,0.3)', minWidth: 280 }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" style={{ marginBottom: 16 }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
        </svg>
        <div style={{ color: '#22c55e', fontSize: 18, fontWeight: 700, letterSpacing: 1, fontFamily: 'Arial, sans-serif' }}>VIP ACTIVATED!</div>
        <div style={{ color: '#666', fontSize: 12, marginTop: 8, fontFamily: 'Arial, sans-serif' }}>{selectedPlan?.name} PLAN IS NOW ACTIVE</div>
        <button onClick={handleClose} style={{ marginTop: 20, padding: '8px 24px', background: '#22c55e', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>CONTINUE WATCHING</button>
      </div>
    </div>
  );

  /* ── FAILED ── */
  if (step === 'failed') return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {overlay}
      <div style={{ position: 'relative', background: '#1a1a1a', borderRadius: 20, padding: '40px 36px', textAlign: 'center', border: '1px solid rgba(229,9,20,0.3)', minWidth: 300, maxWidth: 380 }}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#e50914" strokeWidth="2" strokeLinecap="round" style={{ marginBottom: 14 }}>
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <div style={{ color: '#e50914', fontSize: 16, fontWeight: 700, letterSpacing: 1, fontFamily: 'Arial, sans-serif', marginBottom: 10 }}>PAYMENT FAILED</div>
        <div style={{ color: '#666', fontSize: 11, lineHeight: 1.6, fontFamily: 'Arial, sans-serif', marginBottom: 20 }}>{failMsg}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => setStep('pay')} style={{ padding: '9px 20px', background: '#e50914', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>TRY AGAIN</button>
          <button onClick={handleClose} style={{ padding: '9px 20px', background: '#2a2a2a', border: 'none', borderRadius: 8, color: '#888', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>CANCEL</button>
        </div>
      </div>
    </div>
  );

  /* ── AWAITING PAYMENT ── */
  if (step === 'awaiting') return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {overlay}
      <div style={{ position: 'relative', background: '#1a1a1a', borderRadius: 20, padding: '48px 40px', textAlign: 'center', border: `1px solid ${PROVIDERS.find(p => p.id === provider)?.color || '#f5a623'}44`, minWidth: 300, maxWidth: 380 }}>
        {/* Pulsing ring */}
        <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 24px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${PROVIDERS.find(p => p.id === provider)?.color || '#f5a623'}33`, animation: 'pulse-ring 1.6s ease-out infinite' }} />
          <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: `3px solid #2a2a2a`, borderTop: `3px solid ${PROVIDERS.find(p => p.id === provider)?.color || '#f5a623'}`, animation: 'spin 1s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {PROVIDERS.find(p => p.id === provider)?.emoji || '📱'}
          </div>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
        `}</style>
        <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: 1, fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>
          AWAITING PAYMENT
        </div>
        <div style={{ color: '#888', fontSize: 11, lineHeight: 1.7, fontFamily: 'Arial, sans-serif', marginBottom: 6 }}>
          {statusMsg}
        </div>
        <div style={{ color: '#555', fontSize: 10, fontFamily: 'Arial, sans-serif', marginBottom: 24 }}>
          Do not close this window until payment is confirmed
        </div>
        <div style={{ background: '#111', borderRadius: 10, padding: '12px 16px', marginBottom: 0, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#555', fontSize: 10, fontFamily: 'Arial, sans-serif' }}>PLAN</span>
            <span style={{ color: '#aaa', fontSize: 10, fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>{selectedPlan?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#555', fontSize: 10, fontFamily: 'Arial, sans-serif' }}>AMOUNT</span>
            <span style={{ color: '#f5a623', fontSize: 11, fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>UGX {selectedPlan?.price?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── PAYMENT FORM ── */
  if (step === 'pay' && selectedPlan) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {overlay}
      <div style={{ position: 'relative', background: 'linear-gradient(145deg,#1a1a1a,#111)', borderRadius: 20, width: 420, maxWidth: '95vw', padding: '32px 28px', boxShadow: '0 32px 100px rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '95vh', overflowY: 'auto' }}>
        <button onClick={() => setStep('plans')} style={{ position: 'absolute', top: 14, left: 16, background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'Arial, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          BACK
        </button>
        <button onClick={handleClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24, marginTop: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 20, padding: '5px 14px', marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>📲</span>
            <span style={{ color: '#f5a623', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 2 }}>MOBILE MONEY PAYMENT</span>
          </div>
          <div style={{ color: '#fff', fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 20, fontWeight: 900 }}>
            UGX {selectedPlan.price.toLocaleString()}
            <span style={{ fontSize: 12, color: '#555', fontWeight: 400, marginLeft: 6 }}>/ {durationLabel(selectedPlan)}</span>
          </div>
          <div style={{ color: '#555', fontSize: 11, marginTop: 4, fontFamily: 'Arial, sans-serif' }}>{selectedPlan.name} PLAN</div>
        </div>

        {/* Provider */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1.5, fontFamily: 'Arial, sans-serif', marginBottom: 10 }}>SELECT PROVIDER</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {PROVIDERS.map(p => (
              <button key={p.id} onClick={() => setProvider(p.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: provider === p.id ? `${p.color}18` : '#1e1e1e', border: `1.5px solid ${provider === p.id ? p.color : '#2a2a2a'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 22 }}>{p.emoji}</span>
                <div>
                  <div style={{ color: provider === p.id ? p.color : '#aaa', fontSize: 11, fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>{p.name}</div>
                  <div style={{ color: '#444', fontSize: 9, fontFamily: 'Arial, sans-serif', marginTop: 1 }}>{p.hint}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1.5, fontFamily: 'Arial, sans-serif', marginBottom: 8 }}>PHONE NUMBER</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: 13, fontFamily: 'Arial, sans-serif', pointerEvents: 'none' }}>+256</span>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
              placeholder="701 000 000"
              maxLength={12}
              style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${phoneError ? '#e50914' : '#2a2a2a'}`, borderRadius: 8, padding: '11px 14px 11px 54px', color: '#fff', fontSize: 14, fontFamily: 'Arial, sans-serif', outline: 'none', boxSizing: 'border-box', letterSpacing: 1 }}
            />
          </div>
          {phoneError && <div style={{ color: '#e50914', fontSize: 10, marginTop: 5, fontFamily: 'Arial, sans-serif' }}>{phoneError}</div>}
          <div style={{ color: '#444', fontSize: 10, marginTop: 5, fontFamily: 'Arial, sans-serif' }}>A payment prompt will be pushed to this number</div>
        </div>

        <button onClick={handlePay} disabled={validating}
          style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg,${PROVIDERS.find(p => p.id === provider)?.color || '#f5a623'},${provider === 'mtn' ? '#e08a00' : '#c0000a'})`, border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, cursor: validating ? 'not-allowed' : 'pointer', opacity: validating ? 0.7 : 1, marginBottom: 12 }}>
          {validating ? 'VALIDATING...' : `PAY UGX ${selectedPlan.price.toLocaleString()}`}
        </button>
        <p style={{ textAlign: 'center', color: '#333', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: 0.8, margin: 0 }}>
          SECURE MOBILE MONEY · MTN & AIRTEL SUPPORTED · ALL PRICES IN UGX
        </p>
      </div>
    </div>
  );

  /* ── PLAN SELECTION ── */
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {overlay}
      <div style={{ position: 'relative', background: 'linear-gradient(145deg,#1a1a1a,#111)', borderRadius: 20, width: Math.min(900, activePlans.length * 220 + 96), maxWidth: '97vw', padding: '36px 32px 32px', boxShadow: '0 32px 100px rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '95vh', overflowY: 'auto' }}>
        <button onClick={handleClose} style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round"><path d="M2 19h20M3 9l4 5 5-8 5 8 4-5v10H3z"/></svg>
            <span style={{ color: '#f5a623', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 2 }}>VIP MEMBERSHIP</span>
          </div>
          <h2 style={{ color: '#fff', fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 24, fontWeight: 900, margin: '0 0 8px', letterSpacing: 1 }}>UNLOCK PREMIUM EXPERIENCE</h2>
          <p style={{ color: '#666', fontFamily: 'Arial, sans-serif', fontSize: 12, letterSpacing: 1, margin: '0 0 6px' }}>4K STREAMING · NO ADS · EXCLUSIVE CONTENT · DOWNLOADS</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 15 }}>📱</span>
            <span style={{ color: '#777', fontSize: 11, fontFamily: 'Arial, sans-serif' }}>Pay via MTN Mobile Money or Airtel Money</span>
            <span style={{ fontSize: 15 }}>📲</span>
          </div>
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
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: badge === 'POPULAR' ? '#e50914' : 'linear-gradient(90deg,#f5a623,#e08a00)', borderRadius: 20, padding: '4px 14px', fontSize: 10, fontFamily: 'Arial, sans-serif', fontWeight: 700, letterSpacing: 1.5, color: '#fff', whiteSpace: 'nowrap' }}>{badge}</div>
                )}
                <div>
                  <div style={{ color: plan.color, fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ color: '#aaa', fontSize: 12, fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>UGX</span>
                    <span style={{ color: '#fff', fontFamily: 'Arial Black, Arial, sans-serif', fontSize: 28, fontWeight: 900 }}>{plan.price.toLocaleString()}</span>
                    <span style={{ color: '#555', fontFamily: 'Arial, sans-serif', fontSize: 11 }}>/ {durationLabel(plan)}</span>
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
                <button onClick={() => handleSelectPlan(plan)}
                  style={{ width: '100%', padding: '12px', background: isPopular ? 'linear-gradient(135deg,#e50914,#c0000a)' : isBest ? 'linear-gradient(135deg,#f5a623,#e08a00)' : `rgba(${plan.color === '#4a9eff' ? '74,158,255' : plan.color === '#22c55e' ? '34,197,94' : '255,255,255'},0.1)`, border: isPopular || isBest ? 'none' : `1px solid ${plan.color}44`, borderRadius: 10, color: '#fff', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, cursor: 'pointer' }}>
                  PAY WITH MOBILE MONEY
                </button>
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#333', fontFamily: 'Arial, sans-serif', fontSize: 10, letterSpacing: 0.8 }}>
          MTN MOBILE MONEY · AIRTEL MONEY · CANCEL ANYTIME · ALL PRICES IN UGX
        </p>
      </div>
    </div>
  );
}
