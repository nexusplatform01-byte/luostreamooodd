import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { reauthenticateWithCredential, updatePassword, EmailAuthProvider } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { getAdminAuth, getAllUsers, deleteUser, UserDoc } from '../../lib/db';
import { DollarIcon, UsersIcon, MovieIcon, CrownIcon, ChartIcon, LockIcon, CheckIcon, ShieldIcon } from '../../components/Icons';

type Stats = { users: number; vipUsers: number; content: number; revenue: number };
type Activity = { id: string; type: string; desc: string; time: string };

function ChangePasswordCard() {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(''); setSuccess(false);
    if (!form.current || !form.newPass || !form.confirm) { setError('ALL FIELDS ARE REQUIRED'); return; }
    if (form.newPass.length < 6) { setError('NEW PASSWORD MUST BE AT LEAST 6 CHARACTERS'); return; }
    if (form.newPass !== form.confirm) { setError('NEW PASSWORDS DO NOT MATCH'); return; }
    if (form.newPass === form.current) { setError('NEW PASSWORD MUST BE DIFFERENT FROM CURRENT PASSWORD'); return; }

    setLoading(true);
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('NOT AUTHENTICATED');

      const adminAuth = await getAdminAuth();
      const email = adminAuth?.email || fbUser.email || '';

      const credential = EmailAuthProvider.credential(email, form.current);
      await reauthenticateWithCredential(fbUser, credential);
      await updatePassword(fbUser, form.newPass);

      setSuccess(true);
      setForm({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: any) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        setError('CURRENT PASSWORD IS INCORRECT');
      } else {
        setError('PASSWORD CHANGE FAILED: ' + (e.message || 'UNKNOWN ERROR'));
      }
    } finally { setLoading(false); }
  };

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} type="button" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, display: 'flex', alignItems: 'center' }}>
      {show ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      )}
    </button>
  );

  const fieldStyle: React.CSSProperties = { position: 'relative' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 36px 11px 12px', background: '#0d0d0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 12, letterSpacing: 1, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ background: 'rgba(229,9,20,0.12)', borderRadius: 8, padding: 8, display: 'flex' }}>
          <LockIcon size={16} color="#e50914" />
        </div>
        <div>
          <h2 style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: 0, fontFamily: 'Arial, sans-serif' }}>CHANGE ADMIN PASSWORD</h2>
          <p style={{ color: '#444', fontSize: 10, letterSpacing: 0.8, margin: '3px 0 0', fontFamily: 'Arial, sans-serif' }}>UPDATE YOUR ADMIN LOGIN PASSWORD VIA FIREBASE AUTH</p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e50914', fontSize: 11, letterSpacing: 0.8, fontFamily: 'Arial, sans-serif' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#22c55e', fontSize: 11, letterSpacing: 0.8, fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckIcon size={14} color="#22c55e" />
          PASSWORD CHANGED SUCCESSFULLY
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Arial, sans-serif' }}>CURRENT PASSWORD</label>
          <div style={fieldStyle}>
            <input type={showCurrent ? 'text' : 'password'} placeholder="••••••••" value={form.current} onChange={e => set('current', e.target.value)} style={inputStyle} />
            <EyeToggle show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Arial, sans-serif' }}>NEW PASSWORD</label>
          <div style={fieldStyle}>
            <input type={showNew ? 'text' : 'password'} placeholder="••••••••" value={form.newPass} onChange={e => set('newPass', e.target.value)} style={inputStyle} />
            <EyeToggle show={showNew} onToggle={() => setShowNew(!showNew)} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Arial, sans-serif' }}>CONFIRM NEW PASSWORD</label>
          <div style={fieldStyle}>
            <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} style={inputStyle} />
            <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#333', fontSize: 10, letterSpacing: 0.8, fontFamily: 'Arial, sans-serif' }}>
          <ShieldIcon size={12} color="#333" />
          PASSWORD IS STORED SECURELY IN FIREBASE AUTH
        </div>
        <button
          onClick={submit}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: loading ? '#1a1a1a' : 'linear-gradient(135deg,#e50914,#c0000a)', border: 'none', borderRadius: 8, color: loading ? '#555' : '#fff', padding: '10px 22px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Arial, sans-serif' }}
        >
          <LockIcon size={13} color={loading ? '#555' : '#fff'} />
          {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
        </button>
      </div>
    </div>
  );
}

function DeleteUserCard() {
  const [allUsers, setAllUsers] = useState<UserDoc[]>([]);
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [confirmUid, setConfirmUid] = useState<string | null>(null);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);
  const [deletedUids, setDeletedUids] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllUsers().then(u => { setAllUsers(u); setLoadingUsers(false); }).catch(() => setLoadingUsers(false));
  }, []);

  const filtered = allUsers.filter(u => !deletedUids.includes(u.uid) && (
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  )).slice(0, 20);

  const handleDelete = async (uid: string) => {
    setDeletingUid(uid);
    setError('');
    try {
      await deleteUser(uid);
      setDeletedUids(p => [...p, uid]);
      setConfirmUid(null);
    } catch {
      setError('FAILED TO DELETE USER. CHECK FIRESTORE PERMISSIONS.');
    } finally { setDeletingUid(null); }
  };

  return (
    <div style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ background: 'rgba(229,9,20,0.12)', borderRadius: 8, padding: 8, display: 'flex' }}>
          <UsersIcon size={16} color="#e50914" />
        </div>
        <div>
          <h2 style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: 0, fontFamily: 'Arial, sans-serif' }}>DELETE USER</h2>
          <p style={{ color: '#444', fontSize: 10, letterSpacing: 0.8, margin: '3px 0 0', fontFamily: 'Arial, sans-serif' }}>SEARCH AND PERMANENTLY REMOVE A USER ACCOUNT FROM FIRESTORE</p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e50914', fontSize: 11, letterSpacing: 0.8, fontFamily: 'Arial, sans-serif' }}>{error}</div>
      )}

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="SEARCH BY NAME, EMAIL OR PHONE..."
          value={search}
          onChange={e => { setSearch(e.target.value); setConfirmUid(null); }}
          style={{ width: '100%', padding: '11px 12px 11px 36px', background: '#0d0d0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.8, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loadingUsers ? (
        <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '16px 0', fontFamily: 'Arial, sans-serif' }}>LOADING USERS...</div>
      ) : !search.trim() ? (
        <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '16px 0', fontFamily: 'Arial, sans-serif' }}>TYPE TO SEARCH FOR A USER</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '16px 0', fontFamily: 'Arial, sans-serif' }}>NO USERS FOUND</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filtered.map(u => (
            <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#e50914,#6a0008)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {u.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, fontFamily: 'Arial, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || '—'}</div>
                <div style={{ color: '#444', fontSize: 10, marginTop: 2, fontFamily: 'Arial, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email || u.phone || '—'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {u.isVip && <span style={{ background: 'rgba(245,166,35,0.12)', color: '#f5a623', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '2px 7px', borderRadius: 4 }}>VIP</span>}
                {u.isAdmin && <span style={{ background: 'rgba(74,158,255,0.12)', color: '#4a9eff', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '2px 7px', borderRadius: 4 }}>ADMIN</span>}
              </div>
              {confirmUid === u.uid ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ color: '#e50914', fontSize: 10, letterSpacing: 0.5, fontFamily: 'Arial, sans-serif' }}>CONFIRM?</span>
                  <button
                    onClick={() => handleDelete(u.uid)}
                    disabled={deletingUid === u.uid}
                    style={{ background: '#e50914', border: 'none', borderRadius: 6, color: '#fff', padding: '5px 12px', fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: deletingUid === u.uid ? 'not-allowed' : 'pointer', fontFamily: 'Arial, sans-serif', opacity: deletingUid === u.uid ? 0.5 : 1 }}>
                    {deletingUid === u.uid ? '...' : 'YES'}
                  </button>
                  <button onClick={() => setConfirmUid(null)} style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#888', padding: '5px 12px', fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>NO</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmUid(u.uid)}
                  style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)', borderRadius: 6, color: '#e50914', padding: '6px 14px', fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif', flexShrink: 0, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e50914'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(229,9,20,0.1)'; (e.currentTarget as HTMLElement).style.color = '#e50914'; }}>
                  DELETE
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, vipUsers: 0, content: 0, revenue: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersSnap, vipSnap, contentSnap, txSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(query(collection(db, 'users'), where('isVip', '==', true))),
          getDocs(collection(db, 'content')),
          getDocs(query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(10))),
        ]);
        let revenue = 0;
        const acts: Activity[] = [];
        txSnap.docs.forEach(d => {
          const tx = d.data();
          if (tx.type === 'subscription') revenue += tx.amount || 0;
          acts.push({
            id: d.id,
            type: tx.type,
            desc: tx.desc || 'TRANSACTION',
            time: tx.date?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—',
          });
        });
        setStats({ users: usersSnap.size, vipUsers: vipSnap.size, content: contentSnap.size, revenue });
        setActivity(acts);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const cards = [
    { label: 'TOTAL USERS', value: stats.users, Icon: UsersIcon, color: '#4a9eff', sub: 'REGISTERED ACCOUNTS' },
    { label: 'VIP MEMBERS', value: stats.vipUsers, Icon: CrownIcon, color: '#f5a623', sub: 'ACTIVE SUBSCRIPTIONS' },
    { label: 'TOTAL CONTENT', value: stats.content, Icon: MovieIcon, color: '#22c55e', sub: 'MOVIES / SERIES / LIVE' },
    { label: 'TOTAL REVENUE', value: `UGX ${stats.revenue.toLocaleString()}`, Icon: DollarIcon, color: '#e50914', sub: 'FROM SUBSCRIPTIONS' },
  ];

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>DASHBOARD</h1>
        <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0', fontFamily: 'Arial, sans-serif' }}>REAL-TIME OVERVIEW OF YOUR PLATFORM</p>
      </div>

      {loading ? (
        <div style={{ color: '#444', fontSize: 12, letterSpacing: 1, padding: '40px 0', fontFamily: 'Arial, sans-serif' }}>LOADING STATS...</div>
      ) : (<>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {cards.map(c => (
            <div key={c.label} style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '22px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, fontFamily: 'Arial, sans-serif' }}>{c.label}</span>
                <div style={{ background: `${c.color}18`, borderRadius: 8, padding: 8, display: 'flex' }}><c.Icon size={16} color={c.color} /></div>
              </div>
              <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: -1, fontFamily: 'Arial Black, Arial, sans-serif' }}>{c.value}</div>
              <div style={{ color: '#333', fontSize: 10, letterSpacing: 1, marginTop: 4, fontFamily: 'Arial, sans-serif' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <ChartIcon size={16} color="#e50914" />
            <h2 style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: 0, fontFamily: 'Arial, sans-serif' }}>RECENT ACTIVITY</h2>
          </div>
          {activity.length === 0 ? (
            <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '20px 0', fontFamily: 'Arial, sans-serif' }}>NO TRANSACTIONS YET</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif' }}>
              <thead>
                <tr>{['TYPE','DESCRIPTION','DATE'].map(h => (
                  <th key={h} style={{ color: '#333', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textAlign: 'left', padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {activity.map(a => (
                  <tr key={a.id}>
                    <td style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ background: a.type === 'subscription' ? 'rgba(34,197,94,0.12)' : 'rgba(74,158,255,0.12)', color: a.type === 'subscription' ? '#22c55e' : '#4a9eff', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, padding: '3px 8px', borderRadius: 4 }}>{a.type.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '12px 0', color: '#aaa', fontSize: 11, letterSpacing: 0.5, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.desc}</td>
                    <td style={{ padding: '12px 0', color: '#444', fontSize: 10, letterSpacing: 0.5, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>)}

      <DeleteUserCard />
      <ChangePasswordCard />
    </div>
  );
}
