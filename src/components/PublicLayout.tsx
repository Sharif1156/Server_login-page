import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogIn, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { DemoBanner } from './DemoBanner';
import { useAuth } from '@/context/AuthContext';

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/events', label: 'Events' },
  { to: '/executives', label: 'Executives' },
  { to: '/class-representatives', label: 'Find your CR' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => { setMenuOpen(false); setPortalOpen(false); }, [location.pathname]);

  return (
    <div className="public-shell">
      <DemoBanner />
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => isActive ? 'active' : ''}>{n.label}</NavLink>
            ))}
            <div className="nav-portals-mobile">
              <Link to="/member/login">Member login</Link>
              <Link to="/cr/login">CR login</Link>
              <Link to="/executive/login">Executive login</Link>
            </div>
          </nav>
          <div className="header-actions">
            <div className="portal-dropdown">
              <button className="btn btn-ghost btn-sm" onClick={() => setPortalOpen((v) => !v)} aria-expanded={portalOpen}>
                <LogIn size={16} /> Portals <ChevronDown size={14} />
              </button>
              {portalOpen && (
                <div className="dropdown-menu">
                  <Link to="/member/login"><strong>Member portal</strong><small>Membership & events</small></Link>
                  <Link to="/cr/login"><strong>CR portal</strong><small>Class representative tools</small></Link>
                  <Link to="/executive/login"><strong>Executive portal</strong><small>Committee management</small></Link>
                </div>
              )}
            </div>
            {user ? (
              <Link className="btn btn-primary btn-sm" to={`/${user.role}`}>My portal <ArrowRight size={15} /></Link>
            ) : (
              <Link className="btn btn-primary btn-sm" to="/member/register">Join NUBCC</Link>
            )}
            <button className="icon-btn mobile-menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main"><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Logo light />
            <p className="footer-about">The official computer club of the CSE department at Northern University Bangladesh — workshops, contests, projects and community.</p>
            <p className="footer-demo">Demo clone for development. Not affiliated with the live club website.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link to="/events">Events</Link>
            <Link to="/executives">Executive committee</Link>
            <Link to="/class-representatives">Class representatives</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h4>Portals</h4>
            <Link to="/member/login">Member login</Link>
            <Link to="/cr/login">CR login</Link>
            <Link to="/executive/login">Executive login</Link>
            <Link to="/member/register">Become a member</Link>
          </div>
          <div>
            <h4>Demo accounts</h4>
            <p className="footer-small">Member: NUB-2026-001 / Member@123</p>
            <p className="footer-small">CR: cr@demo.nubcc.test / Cr@12345</p>
            <p className="footer-small">Executive: executive@demo.nubcc.test / Exec@12345</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} NUBCC demo clone.</span>
          <span>Built for learning. Do not enter real credentials.</span>
        </div>
      </footer>
    </div>
  );
}
