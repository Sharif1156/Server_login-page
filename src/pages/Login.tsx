import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2, ShieldCheck, ArrowRight, Copy, Check, IdCard, BriefcaseBusiness, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Alert, Field } from '@/components/ui';
import { demoAccount } from '@shared/demo';
import type { Role } from '@shared/types';

const config: Record<Role, {
  title: string; subtitle: string; identifierLabel: string;
  registerText: string; registerLink: string; registerNote: string; keepSignedIn: boolean; forgot: boolean;
  icon: typeof IdCard;
}> = {
  member: {
    title: 'Member Login',
    subtitle: 'Sign in with your student ID to view your membership and event registrations.',
    identifierLabel: 'Student ID',
    registerText: 'Not a member yet?', registerLink: 'Join Nafi IT',
    registerNote: 'Your account is activated after review by the Nafi IT team.', keepSignedIn: false, forgot: true,
    icon: IdCard,
  },
  cr: {
    title: 'Class Representative Login',
    subtitle: 'Sign in to manage your CR profile.',
    identifierLabel: 'Email',
    registerText: 'New here?', registerLink: 'Register as a CR',
    registerNote: 'New accounts need admin approval before you can sign in.', keepSignedIn: true, forgot: false,
    icon: GraduationCap,
  },
  executive: {
    title: 'Executive Login',
    subtitle: 'Sign in to the executive committee portal.',
    identifierLabel: 'Email',
    registerText: 'New here?', registerLink: 'Register as an executive',
    registerNote: 'New accounts need admin approval before you can sign in.', keepSignedIn: true, forgot: false,
    icon: BriefcaseBusiness,
  },
};

const roles: Role[] = ['member', 'cr', 'executive'];

export function Login() {
  const { role: roleParam } = useParams();
  const role = (roles.includes(roleParam as Role) ? roleParam : 'member') as Role;
  const cfg = config[role];
  const Icon = cfg.icon;
  const demo = demoAccount(role);
  const showDemo = import.meta.env.VITE_SHOW_DEMO === 'true';
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const fillDemo = () => {
    setIdentifier(demo.identifier);
    setPassword('');
    setError('');
  };

  const copyDemo = async () => {
    try {
      await navigator.clipboard.writeText(demo.identifier);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      fillDemo();
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await login(role, identifier, password, remember);
      toast(`Welcome back, ${u.name.split(' ')[0]}!`, 'success');
      navigate(`/${role}`);
    } catch (err: any) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-icon"><Icon size={26} /></div>
        <h1>{cfg.title}</h1>
        <p>{cfg.subtitle}</p>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          {user && user.role === role && (
            <Alert type="success">
              Signed in as {user.name}. <Link to={`/${role}`}>Open portal <ArrowRight size={14} /></Link>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="auth-form" key={role}>
            <Field label={cfg.identifierLabel}>
              <input
                type={role === 'member' ? 'text' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </Field>
            <Field label="Password">
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="icon-btn" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            <div className="auth-options">
              {cfg.keepSignedIn && (
                <label className="checkbox">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Keep me signed in</span>
                </label>
              )}
              {cfg.forgot && <Link className="auth-forgot" to={`/${role}/forgot-password`}>Forgot password?</Link>}
            </div>

            {error && <Alert type="error">{error}</Alert>}

            <button className="btn btn-primary btn-block auth-submit" type="submit" disabled={busy}>
              {busy ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />} Sign in
            </button>
          </form>

          {showDemo && (
          <details className="demo-access">
            <summary><ShieldCheck size={15} /> Demo access</summary>
            <div className="demo-access-body">
              <p className="demo-warning">Use your assigned Nafi IT account credentials only.</p>
              <dl>
                <div><dt>{demo.identifierLabel}</dt><dd><code>{demo.identifier}</code></dd></div>
                
              </dl>
              <div className="demo-access-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={fillDemo}>Use demo account</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={copyDemo}>
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </details>
          )}
        </div>

        <div className="auth-footer">
          <p>{cfg.registerText} <Link to={`/${role}/register`}>{cfg.registerLink}</Link></p>
          <small>{cfg.registerNote}</small>
        </div>
      </div>
    </div>
  );
}
