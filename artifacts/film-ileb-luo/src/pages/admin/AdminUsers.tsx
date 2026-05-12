import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { subscribeUsers, setUser, deleteUser, getPlans, addSubscription, addTransaction, UserDoc, PlanDoc } from '../../lib/db';
import { UsersIcon, CrownIcon, ShieldIcon, AlertIcon, TrashIcon } from '../../components/Icons';

function calcExpiry(plan: PlanDoc): Date {
  const d = new Date();
  if (plan.durationUnit === 'week') d.setDate(d.getDate() + plan.duration * 7);
  else if (plan.durationUnit === 'month') d.setMonth(d.getMonth() + plan.duration);
  else if (plan.durationUnit === 'year') d.setFullYear(d.getFullYear() + plan.duration);
  else if (plan.durationUnit === 'day') d.setDate(d.getDate() + plan.duration);
  return d;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'vip'|'admin'|'suspended'>('all');

  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  const [activateUser, setActivateUser] = useState<UserDoc | null>(null);
  const [plans, setPlans] = useState<PlanDoc[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [activating, setActivating] = useState(false);
  const [activateMsg, setActivateMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeUsers(data => { setUsers(data); setLoading(false); });
    return unsub;
  }, []);

  useEffect(() => {
    getPlans().then(p => { setPlans(p.filter(x => x.isActive)); });
  }, []);

  const toggleVip = async (u: UserDoc) => {
    await setUser(u.uid, { isVip: !u.isVip, vipExpiry: !u.isVip ? null : u.vipExpiry });
  };
  const toggleAdmin = async (u: UserDoc) => {
    if (!confirm(`${u.isAdmin ? 'REMOVE' : 'GRANT'} ADMIN ACCESS FOR ${u.name}?`)) return;
    await setUser(u.uid, { isAdmin: !u.isAdmin });
  };
  const toggleStatus = async (u: UserDoc) => {
    await setUser(u.uid, { status: u.status === 'suspended' ? 'active' : 'suspended' });
  };

  const handleDelete = async (uid: string) => {
    setDeletingUid(uid);
    try {
      await deleteUser(uid);
      setUsers(prev => prev.filter(u => u.uid !== uid));
    } catch { } finally {
      setDeletingUid(null);
      setConfirmDeleteUid(null);
    }
  };

  const openActivate = (u: UserDoc) => {
    setActivateUser(u);
    setSelectedPlanId(plans[0]?.id || '');
    setActivateMsg('');
  };

  const handleActivate = async () => {
    if (!activateUser || !selectedPlanId) return;
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;
    setActivating(true);
    setActivateMsg('');
    try {
      const expiry = calcExpiry(plan);
      const expiryTs = Timestamp.fromDate(expiry);
      const now = Timestamp.fromDate(new Date());
      await setUser(activateUser.uid, { isVip: true, vipExpiry: expiryTs });
      await addSubscription({
        userId: activateUser.uid,
        userEmail: activateUser.email,
        userName: activateUser.name,
        plan: plan.name,
        amount: plan.price,
        startDate: now,
        endDate: expiryTs,
        status: 'active',
      });
      await addTransaction({
        type: 'subscription',
        desc: `MANUAL ACTIVATION — ${activateUser.name.toUpperCase()} — ${plan.name}`,
        amount: plan.price,
        date: now,
        status: 'completed',
      });
      setActivateMsg(`SUCCESS! ${activateUser.name} is now VIP until ${expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.`);
    } catch (e: any) {
      setActivateMsg('Error: ' + (e.message || 'Failed to activate.'));
    } finally {
      setActivating(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').includes(search);
    const matchFilter =
      filter === 'all' ||
      (filter === 'vip' && u.isVip) ||
      (filter === 'admin' && u.isAdmin) ||
      (filter === 'suspended' && u.status === 'suspended');
    return matchSearch && matchFilter;
  });

  const stats = {
    total: users.length,
    vip: users.filter(u => u.isVip).length,
    admins: users.filter(u => u.isAdmin).length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>USERS</h1>
        <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>MANAGE ALL REGISTERED USERS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'TOTAL USERS', v: stats.total, color: '#4a9eff', Icon: UsersIcon },
          { label: 'VIP MEMBERS', v: stats.vip, color: '#f5a623', Icon: CrownIcon },
          { label: 'ADMINS', v: stats.admins, color: '#e50914', Icon: ShieldIcon },
          { label: 'SUSPENDED', v: stats.suspended, color: '#666', Icon: AlertIcon },
        ].map(c => (
          <div key={c.label} style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: `${c.color}18`, borderRadius: 8, padding: 8, display: 'flex' }}><c.Icon size={16} color={c.color} /></div>
            <div>
              <div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{c.v}</div>
              <div style={{ color: '#444', fontSize: 10, letterSpacing: 1, marginTop: 2 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input style={inputStyle} placeholder="SEARCH BY NAME, EMAIL, PHONE..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'vip', 'admin', 'suspended'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? '#e50914' : '#222', border: 'none', borderRadius: 6, color: filter === f ? '#fff' : '#555', padding: '8px 14px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
        {loading ? (
          <div style={{ color: '#444', fontSize: 11, letterSpacing: 1, padding: '20px 0' }}>LOADING USERS...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '24px 0', textAlign: 'center' }}>NO USERS FOUND</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr>{['NAME', 'EMAIL', 'PHONE', 'STATUS', 'VIP', 'ADMIN', 'JOINED', 'ACTIONS'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.uid}>
                    <td style={{ ...tdStyle, color: '#fff', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#888', flexShrink: 0, overflow: 'hidden' }}>
                          {u.photoURL ? <img src={u.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (u.name || 'U')[0]}
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>{u.name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                    <td style={tdStyle}>{u.phone || '—'}</td>
                    <td style={tdStyle}>
                      <button onClick={() => toggleStatus(u)} style={{ background: u.status === 'suspended' ? 'rgba(229,9,20,0.12)' : 'rgba(34,197,94,0.12)', border: 'none', borderRadius: 4, color: u.status === 'suspended' ? '#e50914' : '#22c55e', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '3px 8px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                        {(u.status || 'ACTIVE').toUpperCase()}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => toggleVip(u)} style={{ background: u.isVip ? 'rgba(245,166,35,0.12)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 4, color: u.isVip ? '#f5a623' : '#555', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '3px 8px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                        {u.isVip ? 'VIP' : 'FREE'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => toggleAdmin(u)} style={{ background: u.isAdmin ? 'rgba(229,9,20,0.12)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 4, color: u.isAdmin ? '#e50914' : '#444', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '3px 8px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                        {u.isAdmin ? 'ADMIN' : 'USER'}
                      </button>
                    </td>
                    <td style={{ ...tdStyle, color: '#444', fontSize: 10 }}>
                      {(u.createdAt as any)?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'}
                    </td>
                    <td style={{ ...tdStyle }}>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <button onClick={() => openActivate(u)}
                          style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 5, color: '#f5a623', fontSize: 9, fontWeight: 700, letterSpacing: 0.8, padding: '4px 8px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
                          ACTIVATE SUB
                        </button>
                        {confirmDeleteUid === u.uid ? (
                          <>
                            <button onClick={() => handleDelete(u.uid)} disabled={deletingUid === u.uid}
                              style={{ background: '#e50914', border: 'none', borderRadius: 5, color: '#fff', padding: '4px 7px', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                              {deletingUid === u.uid ? '...' : 'YES'}
                            </button>
                            <button onClick={() => setConfirmDeleteUid(null)}
                              style={{ background: '#222', border: 'none', borderRadius: 5, color: '#666', padding: '4px 7px', fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                              NO
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDeleteUid(u.uid)}
                            style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 5 }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#e50914')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#333')}>
                            <TrashIcon size={13} color="currentColor" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activate Subscription Modal */}
      {activateUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget && !activating) setActivateUser(null); }}>
          <div style={{ background: '#16161a', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'rgba(245,166,35,0.12)', borderRadius: 8, padding: 8, display: 'flex' }}>
                <CrownIcon size={18} color="#f5a623" />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>ACTIVATE SUBSCRIPTION</div>
                <div style={{ color: '#555', fontSize: 10, letterSpacing: 0.8, marginTop: 2 }}>{activateUser.name} · {activateUser.email}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>SELECT PLAN</label>
              {plans.length === 0 ? (
                <div style={{ color: '#555', fontSize: 11 }}>No active plans found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plans.map(plan => (
                    <label key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: selectedPlanId === plan.id ? 'rgba(245,166,35,0.08)' : '#111', border: `1px solid ${selectedPlanId === plan.id ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <input type="radio" name="plan" value={plan.id} checked={selectedPlanId === plan.id} onChange={() => setSelectedPlanId(plan.id!)} style={{ accentColor: '#f5a623' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: plan.color || '#f5a623', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>{plan.name}</span>
                          <span style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>UGX {plan.price.toLocaleString()}</span>
                        </div>
                        <div style={{ color: '#555', fontSize: 10, marginTop: 3 }}>
                          {plan.duration} {plan.durationUnit}{plan.duration > 1 ? 's' : ''} · {plan.features}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {activateMsg && (
              <div style={{ background: activateMsg.startsWith('Error') ? 'rgba(229,9,20,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${activateMsg.startsWith('Error') ? 'rgba(229,9,20,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: activateMsg.startsWith('Error') ? '#e50914' : '#22c55e', fontSize: 11, letterSpacing: 0.5 }}>
                {activateMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleActivate} disabled={activating || !selectedPlanId || plans.length === 0}
                style={{ flex: 1, padding: '11px', background: activating ? '#333' : 'linear-gradient(135deg,#f5a623,#e08a00)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, cursor: activating ? 'not-allowed' : 'pointer' }}>
                {activating ? 'ACTIVATING...' : 'CONFIRM & ACTIVATE'}
              </button>
              <button onClick={() => { if (!activating) setActivateUser(null); }}
                style={{ padding: '11px 20px', background: '#222', border: 'none', borderRadius: 10, color: '#888', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { flex: 1, minWidth: 220, padding: '10px 12px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.5, outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10, fontFamily: 'Arial, sans-serif' };
const thStyle: React.CSSProperties = { color: '#333', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textAlign: 'left', padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'Arial, sans-serif', paddingRight: 12 };
const tdStyle: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#888', fontSize: 11, paddingRight: 12, fontFamily: 'Arial, sans-serif' };
