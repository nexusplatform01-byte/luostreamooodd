import { useState, useEffect } from 'react';
import { getTransactions, addTransaction, TransactionDoc } from '../../lib/db';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { DollarIcon, ArrowUpIcon, CheckIcon, AlertIcon } from '../../components/Icons';

export default function AdminWallet() {
  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wAmount, setWAmount] = useState('');
  const [wNote, setWNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all'|'subscription'|'withdrawal'>('all');

  useEffect(() => {
    getTransactions().then(data => { setTransactions(data); setLoading(false); });
  }, []);

  const totalRevenue = transactions.filter(t => t.type === 'subscription').reduce((a, t) => a + (t.amount || 0), 0);
  const totalWithdrawn = transactions.filter(t => t.type === 'withdrawal').reduce((a, t) => a + (t.amount || 0), 0);
  const balance = totalRevenue - totalWithdrawn;

  const doWithdraw = async () => {
    const amt = parseFloat(wAmount);
    if (!amt || amt <= 0 || amt > balance) return;
    setSaving(true);
    try {
      const tx: Omit<TransactionDoc, 'id'> = {
        type: 'withdrawal',
        desc: wNote || 'WITHDRAWAL REQUEST',
        amount: amt,
        date: Timestamp.fromDate(new Date()),
        status: 'completed',
      };
      const id = await addTransaction(tx);
      setTransactions(prev => [{ ...tx, id }, ...prev]);
      setWAmount(''); setWNote(''); setShowWithdraw(false);
    } finally { setSaving(false); }
  };

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter);

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: 1, margin: 0, fontFamily: 'Arial Black, Arial, sans-serif' }}>WALLET</h1>
        <p style={{ color: '#444', fontSize: 11, letterSpacing: 1, margin: '6px 0 0' }}>FINANCIAL OVERVIEW & TRANSACTIONS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label:'TOTAL REVENUE', value:`$${totalRevenue.toFixed(2)}`, color:'#22c55e', Icon:DollarIcon },
          { label:'TOTAL WITHDRAWN', value:`$${totalWithdrawn.toFixed(2)}`, color:'#e50914', Icon:ArrowUpIcon },
          { label:'AVAILABLE BALANCE', value:`$${balance.toFixed(2)}`, color:'#f5a623', Icon:DollarIcon },
        ].map(c => (
          <div key={c.label} style={{ background:'#16161a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:'22px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <span style={{ color:'#444', fontSize:10, fontWeight:700, letterSpacing:1.5 }}>{c.label}</span>
              <div style={{ background:`${c.color}18`, borderRadius:8, padding:8, display:'flex' }}><c.Icon size={16} color={c.color} /></div>
            </div>
            <div style={{ color:'#fff', fontSize:26, fontWeight:900 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:20 }}>
        <div style={{ display:'flex', gap:6 }}>
          {(['all','subscription','withdrawal'] as const).map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?'#e50914':'#222', border:'none', borderRadius:6, color:filter===f?'#fff':'#555', padding:'8px 14px', fontSize:10, fontWeight:700, letterSpacing:1.5, cursor:'pointer', fontFamily:'Arial, sans-serif' }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ flex:1 }} />
        <button onClick={()=>setShowWithdraw(!showWithdraw)} style={{ display:'flex', alignItems:'center', gap:6, background:'#e50914', border:'none', borderRadius:8, color:'#fff', padding:'9px 18px', fontSize:11, fontWeight:700, letterSpacing:1, cursor:'pointer', fontFamily:'Arial, sans-serif' }}>
          <ArrowUpIcon size={14} />WITHDRAW
        </button>
      </div>

      {showWithdraw && (
        <div style={{ background:'#16161a', border:'1px solid rgba(229,9,20,0.2)', borderRadius:14, padding:24, marginBottom:20 }}>
          <h3 style={{ color:'#fff', fontSize:13, fontWeight:700, letterSpacing:1, margin:'0 0 16px' }}>REQUEST WITHDRAWAL</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={labelStyle}>AMOUNT ($) — MAX ${balance.toFixed(2)}</label>
              <input style={inputStyle} type="number" step="0.01" max={balance} placeholder="0.00" value={wAmount} onChange={e=>setWAmount(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>NOTE / REFERENCE</label>
              <input style={inputStyle} placeholder="BANK TRANSFER, PAYPAL, etc." value={wNote} onChange={e=>setWNote(e.target.value.toUpperCase())} />
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            <button onClick={doWithdraw} disabled={saving || !wAmount || parseFloat(wAmount)>balance} style={{ display:'flex', alignItems:'center', gap:6, background:'#e50914', border:'none', borderRadius:8, color:'#fff', padding:'9px 18px', fontSize:11, fontWeight:700, letterSpacing:1, cursor:'pointer', fontFamily:'Arial, sans-serif' }}>
              <CheckIcon size={13} />{saving?'PROCESSING...':'CONFIRM WITHDRAWAL'}
            </button>
            <button onClick={()=>setShowWithdraw(false)} style={{ background:'#333', border:'none', borderRadius:8, color:'#fff', padding:'9px 18px', fontSize:11, fontWeight:700, letterSpacing:1, cursor:'pointer', fontFamily:'Arial, sans-serif' }}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ background:'#16161a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:24 }}>
        {loading ? (
          <div style={{ color:'#444', fontSize:11, letterSpacing:1, padding:'20px 0' }}>LOADING TRANSACTIONS...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color:'#333', fontSize:11, letterSpacing:1, padding:'24px 0', textAlign:'center' }}>NO TRANSACTIONS FOUND</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>{['TYPE','DESCRIPTION','AMOUNT','DATE','STATUS'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ background: t.type==='subscription'?'rgba(34,197,94,0.12)':t.type==='withdrawal'?'rgba(229,9,20,0.12)':'rgba(74,158,255,0.12)', borderRadius:6, padding:'5px', display:'flex' }}>
                        {t.type==='subscription'?<DollarIcon size={12} color="#22c55e"/>:t.type==='withdrawal'?<ArrowUpIcon size={12} color="#e50914"/>:<CheckIcon size={12} color="#4a9eff"/>}
                      </div>
                      <span style={{ color: t.type==='subscription'?'#22c55e':t.type==='withdrawal'?'#e50914':'#4a9eff', fontSize:9, fontWeight:700, letterSpacing:1.5 }}>
                        {t.type.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.desc}</td>
                  <td style={{ ...tdStyle, color: t.type==='withdrawal'?'#e50914':'#22c55e', fontWeight:700 }}>
                    {t.type==='withdrawal'?'-':'+'} ${t.amount?.toFixed(2)}
                  </td>
                  <td style={{ ...tdStyle, color:'#444', fontSize:10 }}>
                    {(t.date as any)?.toDate?.()?.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})||'—'}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      {t.status==='completed'?<CheckIcon size={12} color="#22c55e"/>:<AlertIcon size={12} color="#f5a623"/>}
                      <span style={{ color:t.status==='completed'?'#22c55e':'#f5a623', fontSize:9, fontWeight:700, letterSpacing:1 }}>{t.status.toUpperCase()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display:'block', color:'#444', fontSize:10, fontWeight:700, letterSpacing:1.5, marginBottom:6 };
const inputStyle: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'#111', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#fff', fontFamily:'Arial, sans-serif', fontSize:11, letterSpacing:0.5, outline:'none', boxSizing:'border-box' };
const thStyle: React.CSSProperties = { color:'#333', fontSize:10, fontWeight:700, letterSpacing:1.5, textAlign:'left', padding:'0 0 12px', borderBottom:'1px solid rgba(255,255,255,0.04)', fontFamily:'Arial, sans-serif' };
const tdStyle: React.CSSProperties = { padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.03)', color:'#888', fontSize:11, paddingRight:12, fontFamily:'Arial, sans-serif' };
