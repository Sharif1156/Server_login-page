import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, RotateCcw, ExternalLink, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Alert, ConfirmDialog, PageHeader } from '@/components/ui';
import { demoAccount } from '@shared/demo';
import { roleLabel } from '@/lib/format';

export function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  const demo = demoAccount(user.role);

  const handleLogout = async () => {
    await logout();
    toast('Signed out.', 'info');
    navigate(`/${user.role}/login`);
  };
  const reset = async () => {
    setBusy(true);
    try {
      await api('/api/demo/reset', { method: 'POST' });
      toast('Demo data reset.', 'success');
      setConfirmReset(false);
      window.location.reload();
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Settings" description="Demo session and data controls." />
      <div className="settings-grid">
        <div className="card">
          <h3>Session</h3>
          <dl className="profile-dl">
            <div><dt>Signed in as</dt><dd>{user.name}</dd></div>
            <div><dt>Role</dt><dd>{roleLabel(user.role)}</dd></div>
            <div><dt>Demo login</dt><dd><code>{demo.identifier}</code></dd></div>
            <div><dt>Demo password</dt><dd><code>{demo.password}</code></dd></div>
          </dl>
          <button className="btn btn-danger" onClick={handleLogout}><LogOut size={16} /> Sign out</button>
        </div>
        <div className="card">
          <h3>About this demo</h3>
          <Alert type="warning"><ShieldAlert size={16} /> This is an unofficial demo clone. It is not connected to the live NUBCC website, does not send emails, does not process payments, and must never receive real credentials or personal data.</Alert>
          <p className="muted">Authentication uses a local session cookie and only the advertised sample accounts. All portal data is fictional and stored in a local SQLite database.</p>
          <Link className="btn btn-ghost" to="/"><ExternalLink size={16} /> Visit public demo site</Link>
        </div>
        {user.role === 'executive' && (
          <div className="card">
            <h3>Demo data</h3>
            <p className="muted">Reset the local database to the original sample dataset. This removes any demo changes you made.</p>
            <button className="btn btn-outline" onClick={() => setConfirmReset(true)}><RotateCcw size={16} /> Reset demo data</button>
          </div>
        )}
      </div>
      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={reset} title="Reset demo data?" message="This will restore the original sample members, events, applications and announcements. Your demo changes will be lost." confirmLabel="Reset data" danger busy={busy} />
    </>
  );
}
