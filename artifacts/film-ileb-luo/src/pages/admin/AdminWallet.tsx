import { useState, useEffect, useRef } from 'react';
import { getTransactions, addTransaction, deleteTransaction, clearTransactionsByType, TransactionDoc } from '../../lib/db';
import { Timestamp } from 'firebase/firestore';
import {
  apiWithdraw, apiPollStatus, apiGetTransactions,
  formatUgPhone, isPaymentSuccess, isPaymentFailed, WITHDRAW_FEE,
} from '../../lib/payment';
import { DollarIcon, ArrowUpIcon, CheckIcon, AlertIcon, RefreshIcon, TrashIcon } from '../../components/Icons';

type WStep = 'idle' | 'form' | 'processing' | 'done' | 'error';

const POLL_INTERVAL = 4000;
const POLL_MAX = 45;

export default function AdminWallet() {
  const [txs, setTxs] = useState<TransactionDoc[]>([]);
  const [gatewayTxs, setGatewayTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [txTab, setTxTab] = useState<'local' | 'gateway'>('local');
  const [filter, setFilter] = useState<'all' | 'subscription' | 'withdrawal'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [clearing, setClearing] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState<string | null>(null);

  const [wStep, setWStep] = useState<WStep>('idle');
  const [wAmount, setWAmount] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wNote, setWNote] = useState('');
  const [wError, setWError] = useState('');
  const [wStatusMsg, setWStatusMsg] = useState('');
  const [wResultMsg, setWResultMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  useEffect(() => { loadTxs(); }, []);

  const loadTxs = async () => {
    setLoading(true);
    const data = await getTransactions();
    setTxs(data);
    setLoading(false);
  };

  const loadGateway = async () => {
    setGatewayLoading(true);
    try {
      const data = await apiGetTransactions();
      setGatewayTxs(data);
    } catch { setGatewayTxs([]); } finally { setGatewayLoading(false); }
  };

  useEffect(() => {
    if (txTab === 'gateway' && gatewayTxs.length === 0) loadGateway();
  }, [txTab]);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const totalRevenue = txs.filter(t => t.type === 'subscription').reduce((a, t) => a + (t.amount || 0), 0);
  const totalWithdrawn = txs.filter(t => t.type === 'withdrawal' || t.type === 'withdrawal_fee').reduce((a, t) => a + (t.amount || 0), 0);
  const balance = totalRevenue - totalWithdrawn;

  const doWithdraw = async () => {
    const amt = parseFloat(wAmount);
    if (!amt || amt <= 0) { setWError('Enter a valid amount.'); return; }
    const total = amt + WITHDRAW_FEE;
    if (total > balance) {
      setWError(`Insufficient balance. Need UGX ${total.toLocaleString()} (amount + UGX ${WITHDRAW_FEE.toLocaleString()} fee) but have UGX ${balance.toLocaleString()}.`);
      return;
    }
    const digits = wPhone.replace(/\D/g, '');
    if (digits.length < 9) { setWError('Enter a valid phone number.'); return; }
    setWError('');
    const formatted = formatUgPhone(wPhone);
    setWStatusMsg(`Initiating withdrawal of UGX ${amt.toLocaleString()} to ${formatted}…`);
    setWStep('processing');
    try {
      const result = await apiWithdraw(formatted, amt, wNote ? `luostream — ${wNote}` : 'luostream — Admin Withdrawal');
      if (!result.success && !result.internal_reference) {
        setWResultMsg(result.message || 'Withdrawal rejected by payment gateway.');
        setWStep('error');
        return;
      }
      const ref = result.internal_reference || result.reference;
      setWStatusMsg(`Withdrawal sent. Confirming transfer to ${formatted}…`);
      pollCount.current = 0;
      pollRef.current = setInterval(async () => {
        pollCount.current++;
        try {
          const st = await apiPollStatus(ref);
          if (isPaymentSuccess(st)) {
            stopPolling();
            const now = Timestamp.fromDate(new Date());
            const wTx: Omit<TransactionDoc, 'id'> = { type: 'withdrawal', desc: `WITHDRAWAL — ${formatted}${wNote ? ' — ' + wNote.toUpperCase() : ''}`, amount: amt, date: now, status: 'completed', internalRef: ref, phone: formatted };
            const feeTx: Omit<TransactionDoc, 'id'> = { type: 'withdrawal_fee', desc: `WITHDRAWAL FEE — ref: ${ref.slice(-8)}`, amount: WITHDRAW_FEE, date: now, status: 'completed', internalRef: ref };
            const [wId, fId] = await Promise.all([addTransaction(wTx), addTransaction(feeTx)]);
            setTxs(prev => [{ ...feeTx, id: fId }, { ...wTx, id: wId }, ...prev]);
            setWResultMsg(`UGX ${amt.toLocaleString()} successfully sent to ${formatted}. UGX ${WITHDRAW_FEE.toLocaleString()} fee deducted.`);
            setWStep('done');
            setWAmount(''); setWPhone(''); setWNote('');
          } else if (isPaymentFailed(st)) {
            stopPolling();
            setWResultMsg(st.message || 'Withdrawal failed. No money was deducted.');
            setWStep('error');
          } else if (pollCount.current >= POLL_MAX) {
            stopPolling();
            setWResultMsg('Withdrawal timed out. Verify manually. Balance was not changed.');
            setWStep('error');
          } else {
            setWStatusMsg(`Confirming transfer to ${formatted}… (${pollCount.current}/${POLL_MAX})`);
          }
        } catch { }
      }, POLL_INTERVAL);
    } catch {
      setWResultMsg('Network error. Please try again.');
      setWStep('error');
    }
  };

  const resetWithdraw = () => { stopPolling(); setWStep('idle'); setWError(''); setWStatusMsg(''); setWResultMsg(''); };

  const handleDeleteTx = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      setTxs(prev => prev.filter(t => t.id !== id));
    } catch { } finally { setDeletingId(null); setConfirmDeleteId(null); }
  };

  const handleClear = async (key: string) => {
    setClearing(key);
    try {
      if (key === 'revenue') {
        await clearTransactionsByType(['subscription']);
        setTxs(prev => prev.filter(t => t.type !== 'subscription'));
      } else if (key === 'withdrawn') {
        await clearTransactionsByType(['withdrawal', 'withdrawal_fee']);
        setTxs(prev => prev.filter(t => t.type !== 'withdrawal' && t.type !== 'withdrawal_fee'));
      }
    } catch { } finally { setClearing(null); setConfirmClear(null); }
  };

  const filtered = txs.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'subscription') return t.type === 'subscription';
    if (filter === 'withdrawal') return t.type === 'withdrawal' || t.type === 'withdrawal_fee';
    return true;
  });

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>WALLET</h1>
        <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>FINANCIAL OVERVIEW & TRANSACTIONS · CURRENCY: UGX</p>
      </div>

      {/* Balance cards — Available Balance first with prominent styling */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {/* Available Balance — first & highlighted */}
        <div style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.18), rgba(229,9,20,0.10))', border: '1px solid rgba(245,166,35,0.4)', borderRadius: 14, padding: '22px 20px', gridColumn: '1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ color: '#f5a623', fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>AVAILABLE BALANCE</span>
            <div style={{ background: 'rgba(245,166,35,0.2)', borderRadius: 8, padding: 8, display: 'flex' }}><DollarIcon size={16} color="#f5a623" /></div>
          </div>
          <div style={{ color: '#fff', fontSize: 26, fontWeight: 900, letterSpacing: 0.5 }}>UGX {balance.toLocaleString()}</div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setWStep('form')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#e50914', border: 'none', borderRadius: 7, color: '#fff', padding: '8px 16px', fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
              <ArrowUpIcon size={12} /> WITHDRAW FUNDS
            </button>
          </div>
        </div>

        {/* Total Revenue */}
        <div style={{ background: '#16161a', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 14, padding: '22px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>TOTAL EARNED</span>
            <div style={{ background: 'rgba(34,197,94,0.12)', borderRadius: 8, padding: 8, display: 'flex' }}><DollarIcon size={16} color="#22c55e" /></div>
          </div>
          <div style={{ color: '#22c55e', fontSize: 22, fontWeight: 900 }}>UGX {totalRevenue.toLocaleString()}</div>
          <div style={{ marginTop: 12 }}>
            {confirmClear === 'revenue' ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ color: '#e50914', fontSize: 9, letterSpacing: 0.8 }}>CLEAR ALL REVENUE?</span>
                <button onClick={() => handleClear('revenue')} disabled={clearing === 'revenue'}
                  style={{ background: '#e50914', border: 'none', borderRadius: 4, color: '#fff', padding: '3px 8px', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                  {clearing === 'revenue' ? '...' : 'YES'}
                </button>
                <button onClick={() => setConfirmClear(null)}
                  style={{ background: '#333', border: 'none', borderRadius: 4, color: '#888', padding: '3px 8px', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                  NO
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmClear('revenue')}
                style={{ background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.2)', borderRadius: 6, color: '#e50914', padding: '5px 12px', fontSize: 9, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                CLEAR HISTORY
              </button>
            )}
          </div>
        </div>

        {/* Total Withdrawn */}
        <div style={{ background: '#16161a', border: '1px solid rgba(229,9,20,0.12)', borderRadius: 14, padding: '22px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>TOTAL WITHDRAWN</span>
            <div style={{ background: 'rgba(229,9,20,0.12)', borderRadius: 8, padding: 8, display: 'flex' }}><ArrowUpIcon size={16} color="#e50914" /></div>
          </div>
          <div style={{ color: '#e50914', fontSize: 22, fontWeight: 900 }}>UGX {totalWithdrawn.toLocaleString()}</div>
          <div style={{ marginTop: 12 }}>
            {confirmClear === 'withdrawn' ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ color: '#e50914', fontSize: 9, letterSpacing: 0.8 }}>CLEAR ALL?</span>
                <button onClick={() => handleClear('withdrawn')} disabled={clearing === 'withdrawn'}
                  style={{ background: '#e50914', border: 'none', borderRadius: 4, color: '#fff', padding: '3px 8px', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                  {clearing === 'withdrawn' ? '...' : 'YES'}
                </button>
                <button onClick={() => setConfirmClear(null)}
                  style={{ background: '#333', border: 'none', borderRadius: 4, color: '#888', padding: '3px 8px', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                  NO
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmClear('withdrawn')}
                style={{ background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.2)', borderRadius: 6, color: '#e50914', padding: '5px 12px', fontSize: 9, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                CLEAR HISTORY
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fee note */}
      <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertIcon size={14} color="#f5a623" />
        <span style={{ color: '#888', fontSize: 11 }}>
          Each withdrawal incurs a <strong style={{ color: '#f5a623' }}>UGX {WITHDRAW_FEE.toLocaleString()} processing fee</strong>. Balance must cover amount + fee. Fee is only deducted after a successful transfer.
        </span>
      </div>

      {/* Floating Withdraw Modal */}
      {(wStep === 'form' || wStep === 'processing' || wStep === 'done' || wStep === 'error') && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget && wStep !== 'processing') resetWithdraw(); }}>
          <div style={{ background: '#16161a', border: '1px solid rgba(229,9,20,0.25)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, fontFamily: 'Arial, sans-serif' }}>

            {wStep === 'form' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <div style={{ background: 'rgba(229,9,20,0.12)', borderRadius: 8, padding: 8, display: 'flex' }}><ArrowUpIcon size={18} color="#e50914" /></div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>WITHDRAW FUNDS</div>
                    <div style={{ color: '#444', fontSize: 10, marginTop: 2 }}>AVAILABLE: UGX {Math.max(0, balance - WITHDRAW_FEE).toLocaleString()}</div>
                  </div>
                  <button onClick={resetWithdraw} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18, fontFamily: 'Arial, sans-serif', lineHeight: 1 }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>AMOUNT (UGX)</label>
                    <input style={inputStyle} type="number" min="1" placeholder="e.g. 10000" value={wAmount} onChange={e => { setWAmount(e.target.value); setWError(''); }} />
                  </div>
                  <div>
                    <label style={labelStyle}>MOBILE MONEY NUMBER (+256...)</label>
                    <input style={inputStyle} type="tel" placeholder="070 1 000 000" value={wPhone} onChange={e => { setWPhone(e.target.value); setWError(''); }} />
                  </div>
                  <div>
                    <label style={labelStyle}>NOTE (OPTIONAL)</label>
                    <input style={inputStyle} placeholder="e.g. Monthly payout" value={wNote} onChange={e => setWNote(e.target.value)} />
                  </div>
                </div>
                {wAmount && parseFloat(wAmount) > 0 && (
                  <div style={{ background: '#111', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 11, color: '#666' }}>
                    Amount: <strong style={{ color: '#fff' }}>UGX {parseFloat(wAmount || '0').toLocaleString()}</strong> + Fee: <strong style={{ color: '#f5a623' }}>UGX {WITHDRAW_FEE.toLocaleString()}</strong> = Total: <strong style={{ color: '#e50914' }}>UGX {(parseFloat(wAmount || '0') + WITHDRAW_FEE).toLocaleString()}</strong>
                  </div>
                )}
                {wError && <div style={{ color: '#e50914', fontSize: 11, marginBottom: 12 }}>{wError}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={doWithdraw} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#e50914', border: 'none', borderRadius: 10, color: '#fff', padding: '12px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                    <CheckIcon size={13} /> CONFIRM & SEND
                  </button>
                  <button onClick={resetWithdraw} style={{ padding: '12px 20px', background: '#333', border: 'none', borderRadius: 10, color: '#aaa', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>CANCEL</button>
                </div>
              </>
            )}

            {wStep === 'processing' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #2a2a2a', borderTop: '3px solid #f5a623', flexShrink: 0, animation: 'spin 0.9s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>PROCESSING WITHDRAWAL</div>
                  <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>{wStatusMsg}</div>
                  <div style={{ color: '#333', fontSize: 10, marginTop: 3 }}>Do not close this window.</div>
                </div>
              </div>
            )}

            {wStep === 'done' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <CheckIcon size={24} color="#22c55e" />
                  <div>
                    <div style={{ color: '#22c55e', fontSize: 14, fontWeight: 700 }}>WITHDRAWAL SUCCESSFUL</div>
                    <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{wResultMsg}</div>
                  </div>
                </div>
                <button onClick={resetWithdraw} style={{ width: '100%', padding: '10px', background: '#22c55e', border: 'none', borderRadius: 10, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>CLOSE</button>
              </div>
            )}

            {wStep === 'error' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <AlertIcon size={22} color="#e50914" />
                  <div>
                    <div style={{ color: '#e50914', fontSize: 14, fontWeight: 700 }}>WITHDRAWAL FAILED</div>
                    <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{wResultMsg}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setWStep('form')} style={{ flex: 1, padding: '10px', background: '#e50914', border: 'none', borderRadius: 10, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>TRY AGAIN</button>
                  <button onClick={resetWithdraw} style={{ padding: '10px 18px', background: '#333', border: 'none', borderRadius: 10, color: '#aaa', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>CLOSE</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 16, gap: 0 }}>
        {[{ key: 'local', label: 'SITE TRANSACTIONS' }, { key: 'gateway', label: 'PAYMENT GATEWAY' }].map(t => (
          <button key={t.key} onClick={() => setTxTab(t.key as any)}
            style={{ padding: '10px 18px', background: 'transparent', border: 'none', borderBottom: txTab === t.key ? '2px solid #e50914' : '2px solid transparent', color: txTab === t.key ? '#fff' : '#555', fontSize: 11, fontWeight: txTab === t.key ? 700 : 400, cursor: 'pointer', fontFamily: 'Arial, sans-serif', letterSpacing: 1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {txTab === 'local' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['all', 'subscription', 'withdrawal'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? '#e50914' : '#222', border: 'none', borderRadius: 6, color: filter === f ? '#fff' : '#555', padding: '7px 14px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
            {loading ? (
              <div style={{ color: '#444', fontSize: 11, letterSpacing: 1, padding: '20px 0' }}>LOADING...</div>
            ) : filtered.length === 0 ? (
              <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '24px 0', textAlign: 'center' }}>NO TRANSACTIONS FOUND</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['TYPE', 'DESCRIPTION', 'AMOUNT', 'PHONE', 'DATE', 'STATUS', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ background: t.type === 'subscription' ? 'rgba(34,197,94,0.12)' : t.type === 'withdrawal' ? 'rgba(229,9,20,0.12)' : 'rgba(245,166,35,0.12)', borderRadius: 6, padding: 5, display: 'flex' }}>
                            {t.type === 'subscription' ? <DollarIcon size={12} color="#22c55e" /> : t.type === 'withdrawal' ? <ArrowUpIcon size={12} color="#e50914" /> : <AlertIcon size={12} color="#f5a623" />}
                          </div>
                          <span style={{ color: t.type === 'subscription' ? '#22c55e' : t.type === 'withdrawal' ? '#e50914' : '#f5a623', fontSize: 9, fontWeight: 700, letterSpacing: 1.5 }}>
                            {t.type === 'withdrawal_fee' ? 'FEE' : t.type.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.desc}</td>
                      <td style={{ ...tdStyle, color: t.type === 'subscription' ? '#22c55e' : '#e50914', fontWeight: 700 }}>
                        {t.type === 'subscription' ? '+' : '−'} UGX {t.amount?.toLocaleString()}
                      </td>
                      <td style={{ ...tdStyle, color: '#555', fontSize: 10 }}>{t.phone || '—'}</td>
                      <td style={{ ...tdStyle, color: '#444', fontSize: 10 }}>
                        {(t.date as any)?.toDate?.()?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) || '—'}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {t.status === 'completed' ? <CheckIcon size={12} color="#22c55e" /> : <AlertIcon size={12} color="#f5a623" />}
                          <span style={{ color: t.status === 'completed' ? '#22c55e' : '#f5a623', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{t.status.toUpperCase()}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {confirmDeleteId === t.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button onClick={() => handleDeleteTx(t.id!)} disabled={deletingId === t.id}
                              style={{ background: '#e50914', border: 'none', borderRadius: 5, color: '#fff', padding: '4px 8px', fontSize: 9, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                              {deletingId === t.id ? '...' : 'YES'}
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              style={{ background: '#222', border: 'none', borderRadius: 5, color: '#666', padding: '4px 8px', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                              NO
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(t.id!)}
                            style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 6 }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#e50914')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                            <TrashIcon size={13} color="currentColor" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {txTab === 'gateway' && (
        <div style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ color: '#444', fontSize: 11 }}>Transactions with <strong style={{ color: '#f5a623' }}>luostream</strong> reference prefix</span>
            <button onClick={loadGateway} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: '#222', border: 'none', borderRadius: 6, color: '#888', padding: '6px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
              <RefreshIcon size={12} color="#888" /> REFRESH
            </button>
          </div>
          {gatewayLoading ? (
            <div style={{ color: '#444', fontSize: 11, letterSpacing: 1, padding: '20px 0' }}>LOADING GATEWAY TRANSACTIONS...</div>
          ) : gatewayTxs.length === 0 ? (
            <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '24px 0', textAlign: 'center' }}>NO GATEWAY TRANSACTIONS FOUND</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['REFERENCE', 'PHONE', 'AMOUNT', 'PROVIDER', 'STATUS', 'DATE'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {gatewayTxs.map((t: any, i: number) => {
                  const status = t.request_status || t.status || '—';
                  const isOk = status === 'success';
                  const isFail = status === 'failed' || status === 'error';
                  return (
                    <tr key={t.internal_reference || i}>
                      <td style={{ ...tdStyle, fontSize: 10, color: '#555', fontFamily: 'monospace', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.customer_reference || t.internal_reference || '—'}</td>
                      <td style={{ ...tdStyle, fontSize: 10 }}>{t.msisdn || '—'}</td>
                      <td style={{ ...tdStyle, color: '#22c55e', fontWeight: 700 }}>UGX {Number(t.amount || 0).toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontSize: 10, color: '#888' }}>{(t.provider || '').replace(/_/g, ' ')}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {isOk ? <CheckIcon size={12} color="#22c55e" /> : isFail ? <AlertIcon size={12} color="#e50914" /> : <AlertIcon size={12} color="#f5a623" />}
                          <span style={{ color: isOk ? '#22c55e' : isFail ? '#e50914' : '#f5a623', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{status.toUpperCase()}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: '#444', fontSize: 10 }}>
                        {t.completed_at ? new Date(t.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Arial, sans-serif' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 12, letterSpacing: 0.5, outline: 'none', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { color: '#333', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textAlign: 'left', padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'Arial, sans-serif' };
const tdStyle: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#888', fontSize: 11, paddingRight: 12, fontFamily: 'Arial, sans-serif' };
