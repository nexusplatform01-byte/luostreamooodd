import { useState, useEffect } from 'react';
import { getPlans, getSubscriptions, updatePlan, addPlan, deletePlan, PlanDoc, SubscriptionDoc } from '../../lib/db';
import { CrownIcon, EditIcon, CheckIcon, PlusIcon, TrashIcon } from '../../components/Icons';

const emptyPlan: Omit<PlanDoc, 'id'> = { name: '', price: 0, duration: 1, durationUnit: 'month', features: '', isActive: true, color: '#4a9eff' };

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<PlanDoc[]>([]);
  const [subs, setSubs] = useState<SubscriptionDoc[]>([]);
  const [editPlan, setEditPlan] = useState<PlanDoc | null>(null);
  const [newPlanForm, setNewPlanForm] = useState<Omit<PlanDoc, 'id'>>(emptyPlan);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<'plans' | 'subscribers'>('plans');

  useEffect(() => {
    getPlans().then(setPlans);
    getSubscriptions().then(setSubs);
  }, []);

  const savePlan = async () => {
    if (!editPlan?.id) return;
    setSaving(true);
    try {
      await updatePlan(editPlan.id, editPlan);
      setPlans(ps => ps.map(p => p.id === editPlan.id ? editPlan : p));
      setEditPlan(null);
    } finally { setSaving(false); }
  };

  const handleAddPlan = async () => {
    if (!newPlanForm.name) return;
    setAdding(true);
    try {
      const id = await addPlan(newPlanForm);
      setPlans(ps => [...ps, { ...newPlanForm, id }]);
      setNewPlanForm(emptyPlan);
      setShowAddForm(false);
    } finally { setAdding(false); }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`DELETE PLAN "${name}"? THIS CANNOT BE UNDONE.`)) return;
    await deletePlan(id);
    setPlans(ps => ps.filter(p => p.id !== id));
  };

  const setNew = (k: string, v: any) => setNewPlanForm(f => ({ ...f, [k]: v }));

  const activeSubs = subs.filter(s => s.status === 'active');
  const totalRevenue = subs.reduce((a, s) => a + (s.amount || 0), 0);

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>SUBSCRIPTIONS</h1>
        <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>{activeSubs.length} ACTIVE · UGX {totalRevenue.toLocaleString()} TOTAL REVENUE</p>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 28 }}>
        {(['plans', 'subscribers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', color: tab === t ? '#e50914' : '#555', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, padding: '10px 24px 12px', cursor: 'pointer', borderBottom: tab === t ? '2px solid #e50914' : '2px solid transparent', marginBottom: -1 }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => setShowAddForm(!showAddForm)} style={btnStyle('#e50914')}>
              <PlusIcon size={14} />{showAddForm ? 'CANCEL' : 'ADD PLAN'}
            </button>
          </div>

          {showAddForm && (
            <div style={{ background: '#16161a', border: '1px solid rgba(229,9,20,0.3)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 1, margin: '0 0 16px' }}>ADD NEW SUBSCRIPTION PLAN</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>PLAN NAME *</label>
                  <input style={inputStyle} placeholder="E.G. MONTHLY" value={newPlanForm.name} onChange={e => setNew('name', e.target.value.toUpperCase())} />
                </div>
                <div>
                  <label style={labelStyle}>PRICE (UGX) *</label>
                  <input style={inputStyle} type="number" min="0" value={newPlanForm.price} onChange={e => setNew('price', Number(e.target.value))} />
                </div>
                <div>
                  <label style={labelStyle}>DURATION</label>
                  <input style={inputStyle} type="number" min="1" value={newPlanForm.duration} onChange={e => setNew('duration', Number(e.target.value))} />
                </div>
                <div>
                  <label style={labelStyle}>DURATION UNIT</label>
                  <select style={inputStyle} value={newPlanForm.durationUnit} onChange={e => setNew('durationUnit', e.target.value)}>
                    <option value="day">DAY</option>
                    <option value="week">WEEK</option>
                    <option value="month">MONTH</option>
                    <option value="year">YEAR</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>COLOR</label>
                  <input style={inputStyle} type="color" value={newPlanForm.color} onChange={e => setNew('color', e.target.value)} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>FEATURES (COMMA SEPARATED)</label>
                  <textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }} placeholder="HD STREAMING, NO ADS, 1 DEVICE" value={newPlanForm.features} onChange={e => setNew('features', e.target.value.toUpperCase())} />
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="new-active" checked={newPlanForm.isActive} onChange={e => setNew('isActive', e.target.checked)} />
                  <label htmlFor="new-active" style={{ color: '#888', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>PLAN IS ACTIVE (VISIBLE TO USERS)</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={handleAddPlan} disabled={adding || !newPlanForm.name} style={btnStyle('#22c55e')}>
                  <CheckIcon size={13} />{adding ? 'SAVING...' : 'CREATE PLAN'}
                </button>
                <button onClick={() => { setShowAddForm(false); setNewPlanForm(emptyPlan); }} style={btnStyle('#333')}>CANCEL</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {plans.map(plan => (
              <div key={plan.id} style={{ background: '#16161a', border: `1px solid ${editPlan?.id === plan.id ? '#e50914' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, padding: 24 }}>
                {editPlan?.id === plan.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div><label style={labelStyle}>PLAN NAME</label><input style={inputStyle} value={editPlan.name} onChange={e => setEditPlan({ ...editPlan, name: e.target.value.toUpperCase() })} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div><label style={labelStyle}>PRICE (UGX)</label><input style={inputStyle} type="number" step="500" min="0" value={editPlan.price} onChange={e => setEditPlan({ ...editPlan, price: Number(e.target.value) })} /></div>
                      <div><label style={labelStyle}>DURATION</label><input style={inputStyle} type="number" min="1" value={editPlan.duration} onChange={e => setEditPlan({ ...editPlan, duration: Number(e.target.value) })} /></div>
                      <div>
                        <label style={labelStyle}>UNIT</label>
                        <select style={inputStyle} value={editPlan.durationUnit} onChange={e => setEditPlan({ ...editPlan, durationUnit: e.target.value as any })}>
                          <option value="day">DAY</option>
                          <option value="week">WEEK</option>
                          <option value="month">MONTH</option>
                          <option value="year">YEAR</option>
                        </select>
                      </div>
                      <div><label style={labelStyle}>COLOR</label><input style={inputStyle} type="color" value={editPlan.color} onChange={e => setEditPlan({ ...editPlan, color: e.target.value })} /></div>
                    </div>
                    <div><label style={labelStyle}>FEATURES (COMMA SEPARATED)</label><textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={editPlan.features} onChange={e => setEditPlan({ ...editPlan, features: e.target.value.toUpperCase() })} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" id={`active-${plan.id}`} checked={editPlan.isActive} onChange={e => setEditPlan({ ...editPlan, isActive: e.target.checked })} />
                      <label htmlFor={`active-${plan.id}`} style={{ color: '#888', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>PLAN IS ACTIVE</label>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={savePlan} disabled={saving} style={btnStyle('#22c55e')}><CheckIcon size={13} />{saving ? 'SAVING...' : 'SAVE'}</button>
                      <button onClick={() => setEditPlan(null)} style={btnStyle('#333')}>CANCEL</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CrownIcon size={14} color={plan.color} />
                        <span style={{ color: plan.color, fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>{plan.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ background: plan.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(100,100,100,0.12)', color: plan.isActive ? '#22c55e' : '#555', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '2px 8px', borderRadius: 4 }}>{plan.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                        <button onClick={() => setEditPlan({ ...plan })} style={iconBtn('#4a9eff')}><EditIcon size={13} /></button>
                        <button onClick={() => handleDeletePlan(plan.id!, plan.name)} style={iconBtn('#e50914')}><TrashIcon size={13} /></button>
                      </div>
                    </div>
                    <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
                      UGX {plan.price.toLocaleString()}
                      <span style={{ color: '#444', fontSize: 12, fontWeight: 400 }}>/{plan.duration} {plan.durationUnit}{plan.duration > 1 ? 'S' : ''}</span>
                    </div>
                    <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {plan.features.split(',').map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 10, letterSpacing: 0.8 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                          {f.trim()}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'subscribers' && (
        <div style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
          {subs.length === 0 ? (
            <div style={{ color: '#333', fontSize: 11, letterSpacing: 1, padding: '20px 0', textAlign: 'center' }}>NO SUBSCRIPTIONS YET</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['USER','PLAN','AMOUNT (UGX)','START DATE','END DATE','STATUS'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id}>
                    <td style={tdStyle}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 11 }}>{s.userName}</div>
                      <div style={{ color: '#444', fontSize: 10 }}>{s.userEmail}</div>
                    </td>
                    <td style={tdStyle}><span style={{ color: '#f5a623', fontWeight: 700, fontSize: 10, letterSpacing: 1 }}>{s.plan}</span></td>
                    <td style={{ ...tdStyle, color: '#22c55e', fontWeight: 700 }}>UGX {s.amount?.toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#555', fontSize: 10 }}>{(s.startDate as any)?.toDate?.()?.toLocaleDateString('en-UG') || '—'}</td>
                    <td style={{ ...tdStyle, color: '#555', fontSize: 10 }}>{(s.endDate as any)?.toDate?.()?.toLocaleDateString('en-UG') || '—'}</td>
                    <td style={tdStyle}>
                      <span style={{ background: s.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(100,100,100,0.12)', color: s.status === 'active' ? '#22c55e' : '#555', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '3px 8px', borderRadius: 4 }}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#fff', fontFamily: 'Arial, sans-serif', fontSize: 11, letterSpacing: 0.5, outline: 'none', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { color: '#333', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textAlign: 'left', padding: '0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'Arial, sans-serif' };
const tdStyle: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#888', fontSize: 11, paddingRight: 12, fontFamily: 'Arial, sans-serif' };
const btnStyle = (bg: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 6, background: bg, border: 'none', borderRadius: 8, color: '#fff', padding: '9px 18px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: 'Arial, sans-serif' });
const iconBtn = (c: string): React.CSSProperties => ({ background: `${c}18`, border: 'none', borderRadius: 6, color: c, padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' });
