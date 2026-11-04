import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, CircleUserRound, ArrowRight, IdCard, BriefcaseBusiness, GraduationCap } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/#events', label: 'Events' },
  { to: '/#about', label: 'About' },
  { to: '/#faq', label: 'FAQ' },
];

const portals = [
  { to: '/member/login', label: 'Member Portal', icon: IdCard },
  { to: '/executive/login', label: 'Executive Portal', icon: BriefcaseBusiness },
  { to: '/cr/login', label: 'CR Portal', icon: GraduationCap },
];

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setPortalOpen(location.pathname.endsWith('/login'));
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setPortalOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="public-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => isActive && !location.hash ? 'active' : ''}>{n.label}</NavLink>
            ))}
            <div className="nav-portals-mobile">
              {portals.map((p) => <Link key={p.to} to={p.to}>{p.label}</Link>)}
            </div>
          </nav>
          <div className="header-actions">
            <div className="portal-dropdown" ref={dropdownRef}>
              <button className="btn btn-login btn-sm" onClick={() => setPortalOpen((v) => !v)} aria-expanded={portalOpen} aria-haspopup="menu">
                <CircleUserRound size={17} /> Login <ChevronDown size={14} />
              </button>
              {portalOpen && (
                <div className="dropdown-menu login-dropdown" role="menu">
                  {portals.map((p) => (
                    <Link key={p.to} to={p.to} role="menuitem">
                      <p.icon size={17} /> <span>{p.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {user ? (
              <Link className="btn btn-join btn-sm" to={`/${user.role}`}>My portal <ArrowRight size={15} /></Link>
            ) : (
              <Link className="btn btn-join btn-sm" to="/member/register">Join Us</Link>
            )}
            <button className="icon-btn mobile-menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main"><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-simple">
          <Logo light />
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/member/login">Member</Link>
            <Link to="/executive/login">Executive</Link>
            <Link to="/cr/login">CR</Link>
          </div>
          <p className="footer-demo">Unofficial demo clone. Use sample accounts only — never enter real NUBCC credentials or personal data.</p>
        </div>
      </footer>
    </div>
  );
}
