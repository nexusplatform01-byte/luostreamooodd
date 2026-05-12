import { useState, useEffect, useRef } from 'react';
import { getTransactions, addTransaction, deleteTransaction, TransactionDoc } from '../../lib/db';
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

  // Withdraw state
  const [wStep, setWStep] = useState<WStep>('idle');
  const [wAmount, setWAmount] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wNote, setWNote] = useState('');
  const [wError, setWError] = useState('');
  const [wStatusMsg, setWStatusMsg] = useState('');
  const [wResultMsg, setWResultMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  useEffect(() => {
    loadTxs();
  }, []);

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
    } catch {
      setGatewayTxs([]);
    } finally {
      setGatewayLoading(false);
    }
  };

  useEffect(() => {
    if (txTab === 'gateway' && gatewayTxs.length === 0) loadGateway();
  }, [txTab]);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  // Balance is computed from Firebase transactions only
  const totalRevenue = txs.filter(t => t.type === 'subscription').reduce((a, t) => a + (t.amount || 0), 0);
  const totalWithdrawn = txs.filter(t => t.type === 'withdrawal').reduce((a, t) => a + (t.amount || 0), 0);
  const totalFees = txs.filter(t => t.type === 'withdrawal_fee').reduce((a, t) => a + (t.amount || 0), 0);
  const balance = totalRevenue - totalWithdrawn - totalFees;

  const doWithdraw = async () => {
    const amt = parseFloat(wAmount);
    if (!amt || amt <= 0) { setWError('Enter a valid amount.'); return; }
    const total = amt + WITHDRAW_FEE;
    if (total > balance) {
      setWError(`Insufficient balance. You need UGX ${total.toLocaleString()} (amount + UGX ${WITHDRAW_FEE.toLocaleString()} fee) but have UGX ${balance.toLocaleString()}.`);
      return;
    }
    const digits = wPhone.replace(/\D/g, '');
    if (digits.length < 9) { setWError('Enter a valid phone number.'); return; }
    setWError('');

    const formatted = formatUgPhone(wPhone);
    setWStatusMsg(`Initiating withdrawal of UGX ${amt.toLocaleString()} to ${formatted}…`);
    setWStep('processing');

    try {
      const result = await apiWithdraw(
        formatted,
        amt,
        wNote ? `luostream — ${wNote}` : 'luostream — Admin Withdrawal',
      );

      if (!result.success && !result.internal_reference) {
        setWResultMsg(result.message || 'Withdrawal request was rejected by the payment gateway.');
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
            // Record withdrawal + fee in Firebase ONLY after success
            const now = Timestamp.fromDate(new Date());
            const wTx: Omit<TransactionDoc, 'id'> = {
              type: 'withdrawal',
              desc: `WITHDRAWAL — ${formatted}${wNote ? ' — ' + wNote.toUpperCase() : ''}`,
              amount: amt, date: now, status: 'completed',
              internalRef: ref, phone: formatted,
            };
            const feeTx: Omit<TransactionDoc, 'id'> = {
              type: 'withdrawal_fee',
              desc: `WITHDRAWAL FEE — ref: ${ref.slice(-8)}`,
              amount: WITHDRAW_FEE, date: now, status: 'completed',
              internalRef: ref,
            };
            const [wId, fId] = await Promise.all([addTransaction(wTx), addTransaction(feeTx)]);
            setTxs(prev => [{ ...feeTx, id: fId }, { ...wTx, id: wId }, ...prev]);
            setWResultMsg(`UGX ${amt.toLocaleString()} successfully sent to ${formatted}. UGX ${WITHDRAW_FEE.toLocaleString()} fee deducted.`);
            setWStep('done');
            setWAmount(''); setWPhone(''); setWNote('');
          } else if (isPaymentFailed(st)) {
            stopPolling();
            setWResultMsg(st.message || 'Withdrawal failed. No money was deducted from your balance.');
            setWStep('error');
          } else if (pollCount.current >= POLL_MAX) {
            stopPolling();
            setWResultMsg('Withdrawal timed out. If money was sent, please verify manually. Balance was not changed.');
            setWStep('error');
          } else {
            setWStatusMsg(`Confirming transfer to ${formatted}… (${pollCount.current}/${POLL_MAX})`);
          }
        } catch {
          // network blip — keep polling
        }
      }, POLL_INTERVAL);

    } catch {
      setWResultMsg('Network error. Please try again.');
      setWStep('error');
    }
  };

  const resetWithdraw = () => {
    stopPolling();
    setWStep('idle');
    setWError('');
    setWStatusMsg('');
    setWResultMsg('');
  };

  const handleDeleteTx = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      setTxs(prev => prev.filter(t => t.id !== id));
    } catch { /* ignore */ } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
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

      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'TOTAL REVENUE', value: `UGX ${totalRevenue.toLocaleString()}`, color: '#22c55e', Icon: DollarIcon },
          { label: 'TOTAL WITHDRAWN', value: `UGX ${(totalWithdrawn + totalFees).toLocaleString()}`, color: '#e50914', Icon: ArrowUpIcon },
          { label: 'AVAILABLE BALANCE', value: `UGX ${balance.toLocaleString()}`, color: '#f5a623', Icon: DollarIcon },
        ].map(c => (
          <div key={c.label} style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>{c.label}</span>
              <div style={{ background: `${c.color}18`, borderRadius: 8, padding: 8, display: 'flex' }}><c.Icon size={16} color={c.color} /></div>
            </div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Withdraw fee note */}
      <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertIcon size={14} color="#f5a623" />
        <span style={{ color: '#888', fontSize: 11, fontFamily: 'Arial, sans-serif' }}>
          Each withdrawal incurs a <strong style={{ color: '#f5a623' }}>UGX {WITHDRAW_FEE.toLocaleString()} processing fee</strong>. Balance must cover amount + fee. Fee is only deducted after a successful transfer.
        </span>
      </div>

      {/* Withdraw section */}
      <div style={{ marginBottom: 24 }}>
        {wStep === 'idle' && (
          <button onClick={() => setWStep('form')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#e50914', border: 'none', borderRadius: 8, color: '#fff', padding: '9px 18px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
            <ArrowUpIcon size={14} /> WITHDRAW FUNDS
          </button>
        )}

        {wStep === 'form' && (
          <div style={{ background: '#16161a', border: '1px solid rgba(229,9,20,0.2)', borderRadius: 14, padding: 24 }}>
            <h3 style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: '0 0 16px' }}>WITHDRAW FUNDS VIA MOBILE MONEY</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>AMOUNT (UGX) — MAX {Math.max(0, balance - WITHDRAW_FEE).toLocaleString()}</label>
                <input style={inputStyle} type="number" min="1" placeholder="e.g. 10000" value={wAmount} onChange={e => { setWAmount(e.target.value); setWError(''); }} />
              </div>
              <div>
                <label style={labelStyle}>PHONE (+256...)</label>
                <input style={inputStyle} type="tel" placeholder="070 1 000 000" value={wPhone} onChange={e => { setWPhone(e.target.value); setWError(''); }} />
              </div>
              <div>
                <label style={labelStyle}>NOTE (OPTIONAL)</label>
                <input style={inputStyle} placeholder="e.g. Monthly payout" value={wNote} onChange={e => setWNote(e.target.value)} />
              </div>
            </div>
            {wAmount && parseFloat(wAmount) > 0 && (
              <div style={{ background: '#111', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 11, color: '#666', fontFamily: 'Arial, sans-serif' }}>
                Amount: <strong style={{ color: '#fff' }}>UGX {parseFloat(wAmount || '0').toLocaleString()}</strong> + Fee: <strong style={{ color: '#f5a623' }}>UGX {WITHDRAW_FEE.toLocaleString()}</strong> = Total deducted: <strong style={{ color: '#e50914' }}>UGX {(parseFloat(wAmount || '0') + WITHDRAW_FEE).toLocaleString()}</strong>
              </div>
            )}
            {wError && <div style={{ color: '#e50914', fontSize: 11, marginBottom: 12, fontFamily: 'Arial, sans-serif' }}>{wError}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={doWithdraw} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#e50914', border: 'none', borderRadius: 8, color: '#fff', padding: '9px 18px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                <CheckIcon size={13} /> CONFIRM & SEND
              </button>
              <button onClick={resetWithdraw} style={{ background: '#333', border: 'none', borderRadius: 8, color: '#aaa', padding: '9px 18px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>CANCEL</button>
            </div>
          </div>
        )}

        {wStep === 'processing' && (
          <div style={{ background: '#16161a', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 14, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #2a2a2a', borderTop: '3px solid #f5a623', flexShrink: 0, animation: 'spin 0.9s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>PROCESSING WITHDRAWAL</div>
              <div style={{ color: '#555', fontSize: 11, fontFamily: 'Arial, sans-serif', marginTop: 4 }}>{wStatusMsg}</div>
              <div style={{ color: '#333', fontSize: 10, fontFamily: 'Arial, sans-serif', marginTop: 3 }}>Do not navigate away. Balance will only update after confirmation.</div>
            </div>
          </div>
        )}

        {wStep === 'done' && (
          <div style={{ background: '#16161a', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <CheckIcon size={22} color="#22c55e" />
            <div>
              <div style={{ color: '#22c55e', fontSize: 13, fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>WITHDRAWAL SUCCESSFUL</div>
              <div style={{ color: '#666', fontSize: 11, fontFamily: 'Arial, sans-serif', marginTop: 4 }}>{wResultMsg}</div>
            </div>
            <button onClick={resetWithdraw} style={{ marginLeft: 'auto', background: '#2a2a2a', border: 'none', borderRadius: 8, color: '#aaa', padding: '7px 14px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>DISMISS</button>
          </div>
        )}

        {wStep === 'error' && (
          <div style={{ background: '#16161a', border: '1px solid rgba(229,9,20,0.3)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <AlertIcon size={20} color="#e50914" />
            <div>
              <div style={{ color: '#e50914', fontSize: 13, fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>WITHDRAWAL FAILED</div>
              <div style={{ color: '#666', fontSize: 11, fontFamily: 'Arial, sans-serif', marginTop: 4 }}>{wResultMsg}</div>
            </div>
            <button onClick={() => setWStep('form')} style={{ marginLeft: 'auto', background: '#e50914', border: 'none', borderRadius: 8, color: '#fff', padding: '7px 14px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>TRY AGAIN</button>
          </div>
        )}
      </div>

      {/* Transaction tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 16, gap: 0 }}>
        {[
          { key: 'local', label: 'SITE TRANSACTIONS' },
          { key: 'gateway', label: 'PAYMENT GATEWAY' },
        ].map(t => (
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
                            style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 6, transition: 'color 0.15s' }}
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
            <span style={{ color: '#444', fontSize: 11, fontFamily: 'Arial, sans-serif' }}>Showing transactions with <strong style={{ color: '#f5a623' }}>luostream</strong> reference prefix</span>
            <button onClick={loadGateway} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: '#222', border: 'none', borderRadius: 6, color: '#888', padding: '6px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
              <RefreshIcon size={12} color="#888" /> REFRESH
            </button>
          </div>
          {gatewayLoading ? (
            <div style={{ color: '#444', fontSize: 11, letterSpacing: 1, padding: '20px 0' }}>LOADING GATEWAY TRANSACTIONS...</div>
          ) : gatewayTxs.length === 0 ? (
            <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '24px 0', textAlign: 'center' }}>NO GATEWAY TRANSACTIONS FOUND WITH LUOSTREAM REFERENCE</div>
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
                      <td style={{ ...tdStyle, fontSize: 10, color: '#555', fontFamily: 'monospace', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.customer_reference || t.internal_reference || '—'}
                      </td>
                      <td style={{ ...tdStyle, fontSize: 10 }}>{t.msisdn || '—'}</td>
                      <td style={{ ...tdStyle, color: '#22c55e', fontWeight: 700 }}>UGX {Number(t.amount || 0).toLocaleString()}</td>
                      <td style={{ ...tdStyle, fontSize: 10, color: '#888' }}>{(t.provider || '').replace(/_/g, ' ')}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {isOk ? <CheckIcon size={12} color="#22c55e" /> : isFail ? <AlertIcon size={12} color="#e50914" /> : <AlertIcon size={12} color="#f5a623" />}
                          <span style={{ color: isOk ? '#22c55e' : isFail ? '#e50914' : '#f5a623', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
                            {status.toUpperCase()}
                          </span>
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
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.5, outline: 'none', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { color: '#333', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textAlign: 'left', padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'Arial, sans-serif' };
const tdStyle: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#888', fontSize: 11, paddingRight: 12, fontFamily: 'Arial, sans-serif' };
