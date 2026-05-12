import { useState, useEffect } from 'react';
import { subscribeUsers, setUser, UserDoc } from '../../lib/db';
import { UsersIcon, CrownIcon, ShieldIcon, AlertIcon } from '../../components/Icons';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all'|'vip'|'admin'|'suspended'>('all');

  useEffect(() => {
    const unsub = subscribeUsers(data => { setUsers(data); setLoading(false); });
    return unsub;
  }, []);

  const toggleVip = async (u: UserDoc) => {
    await setUser(u.uid, { isVip: !u.isVip, vipExpiry: !u.isVip ? null : u.vipExpiry });
  };
  const toggleAdmin = async (u: UserDoc) => {
    if (!confirm(`${u.isAdmin ? 'REMOVE' : 'GRANT'} ADMIN ACCESS FOR ${u.name}?`)) return;
    await setUser(u.uid, { isAdmin: !u.isAdmin });
  };
  const toggleStatus = async (u: UserDoc) => {
    const newStatus = u.status === 'suspended' ? 'active' : 'suspended';
    await setUser(u.uid, { status: newStatus });
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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>{['NAME', 'EMAIL', 'PHONE', 'STATUS', 'VIP', 'ADMIN', 'JOINED'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
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
                    <td style={{ ...tdStyle, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { flex: 1, minWidth: 220, padding: '10px 12px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.5, outline: 'none', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { color: '#333', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textAlign: 'left', padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'Arial, sans-serif', paddingRight: 12 };
const tdStyle: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#888', fontSize: 11, paddingRight: 12, fontFamily: 'Arial, sans-serif' };
