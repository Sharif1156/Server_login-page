import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Ticket, BookOpen, Award, Megaphone, User as UserIcon,
  Settings as SettingsIcon, Users, ClipboardList, IdCard, Menu, X, LogOut, ExternalLink, ChevronDown,
} from 'lucide-react';
import { Logo } from './Logo';
import { Avatar, Badge } from './ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { roleLabel } from '@/lib/format';
import type { Role } from '@shared/types';

const navByRole: Record<Role, Array<{ to: string; label: string; icon: any; end?: boolean }>> = {
  member: [
    { to: '/member', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/member/events', label: 'Events', icon: CalendarDays },
    { to: '/member/registrations', label: 'My registrations', icon: Ticket },
    { to: '/member/courses', label: 'Courses', icon: BookOpen },
    { to: '/member/certificates', label: 'Certificates', icon: Award },
    { to: '/member/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/member/profile', label: 'My profile', icon: UserIcon },
    { to: '/member/settings', label: 'Settings', icon: SettingsIcon },
  ],
  cr: [
    { to: '/cr', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/cr/classmates', label: 'My classmates', icon: Users },
    { to: '/cr/events', label: 'Events', icon: CalendarDays },
    { to: '/cr/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/cr/profile', label: 'CR profile', icon: UserIcon },
    { to: '/cr/settings', label: 'Settings', icon: SettingsIcon },
  ],
  executive: [
    { to: '/executive', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/executive/applications', label: 'Applications', icon: ClipboardList },
    { to: '/executive/members', label: 'Members', icon: Users },
    { to: '/executive/crs', label: 'CR directory', icon: IdCard },
    { to: '/executive/events', label: 'Manage events', icon: CalendarDays },
    { to: '/executive/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/executive/profile', label: 'My profile', icon: UserIcon },
    { to: '/executive/settings', label: 'Settings', icon: SettingsIcon },
  ],
};

export function PortalLayout() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  if (!user) return null;
  const role = user.role;
  const nav = navByRole[role];
  const current = nav.find((n) => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to));

  const handleLogout = async () => {
    await logout();
    toast('Signed out.', 'info');
    navigate(`/${role}/login`);
  };

  return (
    <div className="portal-shell">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={`portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Logo light />
          <button className="icon-btn sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <div className="sidebar-role">
          <Badge variant="gold">{roleLabel(role)} portal</Badge>
          <span className="sidebar-demo">Demo</span>
        </div>
        <nav className="sidebar-nav" aria-label="Portal navigation">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
              <n.icon size={18} /><span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="sidebar-public-link"><ExternalLink size={15} /> Public demo site</Link>
          <p>Sample data only. Never enter real credentials.</p>
        </div>
      </aside>
      <div className="portal-main">
        <header className="portal-topbar">
          <button className="icon-btn portal-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <div className="topbar-title">
            <h2>{current?.label || 'Portal'}</h2>
            <span className="topbar-breadcrumb">Nafi IT / {roleLabel(role)}</span>
          </div>
          <div className="topbar-actions">
            <Badge variant="warning">Demo mode</Badge>
            <div className="user-menu">
              <button className="user-menu-btn" onClick={() => setUserMenu((v) => !v)} aria-expanded={userMenu}>
                <Avatar name={user.name} color={user.avatarColor} size={36} />
                <span className="user-menu-name">{user.name}</span>
                <ChevronDown size={15} />
              </button>
              {userMenu && (
                <div className="dropdown-menu user-dropdown">
                  <div className="dropdown-user-info">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                  <Link to={`/${role}/profile`} onClick={() => setUserMenu(false)}><UserIcon size={15} /> My profile</Link>
                  <Link to={`/${role}/settings`} onClick={() => setUserMenu(false)}><SettingsIcon size={15} /> Settings</Link>
                  <button onClick={handleLogout}><LogOut size={15} /> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="portal-content">
          <div className="portal-demo-note">
            <strong>Nafi IT portal.</strong> Keep your account details private.
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
