import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { navItems } from '../data/content';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const [location] = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);
  const { user } = useApp();

  return (
    <div className="leftnav_left_box" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* FILM ILEB LUO Logo */}
      <Link href="/">
        <div className="leftnav_left_logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 }}>
            <span style={{ color: '#ff1a1a', fontSize: 9.5, fontWeight: 900, letterSpacing: '0.05em', fontFamily: '"Arial Black", Arial, sans-serif' }}>FILM</span>
            <span style={{ color: '#ff1a1a', fontSize: 9.5, fontWeight: 900, letterSpacing: '0.05em', fontFamily: '"Arial Black", Arial, sans-serif' }}>ILEB</span>
            <span style={{ color: '#ffffff', fontSize: 9.5, fontWeight: 900, letterSpacing: '0.05em', fontFamily: '"Arial Black", Arial, sans-serif' }}>LUO</span>
          </div>
        </div>
      </Link>

      <div className="leftnav_nav_box" style={{ flex: 1 }}>
        <div className="leftnav_nav_content">
          <div className="leftnav_nav_inner">
            {navItems.map((item) => {
              const isActive = location === item.route || (item.route !== '/' && location.startsWith(item.route));
              const isHov = hovered === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.route}
                  className={`leftnav_link_item${isActive ? ' leftnav_current_item' : ''}`}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isHov && !isActive ? 'rgba(255,255,255,0.04)' : undefined,
                    textDecoration: 'none',
                  }}
                >
                  <img
                    className="leftnav_leftnav_icon"
                    src={isActive ? item.iconActive : item.iconDefault}
                    alt={item.label}
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.25'; }}
                  />
                  <span className="leftnav_nav_mark">
                    <span style={{ fontFamily: 'Arial, sans-serif', fontWeight: isActive ? 700 : 400 }}>{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Panel Link — only visible to admin users */}
      {user?.isAdmin && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '10px 6px' }}>
          <Link
            href="/admin"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '8px 4px',
              borderRadius: 8,
              background: location.startsWith('/admin') ? 'rgba(229,9,20,0.18)' : 'rgba(229,9,20,0.08)',
              border: `1px solid ${location.startsWith('/admin') ? 'rgba(229,9,20,0.5)' : 'rgba(229,9,20,0.2)'}`,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(229,9,20,0.22)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = location.startsWith('/admin') ? 'rgba(229,9,20,0.18)' : 'rgba(229,9,20,0.08)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e50914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span style={{ color: '#e50914', fontSize: 8, fontWeight: 900, letterSpacing: 1.2, fontFamily: 'Arial, sans-serif' }}>ADMIN</span>
          </Link>
        </div>
      )}
    </div>
  );
}
