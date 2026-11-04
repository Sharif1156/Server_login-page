import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2, ShieldCheck, ArrowRight, Copy, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Alert, Field } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { demoAccount, DEMO_NOTICE } from '@shared/demo';
import type { Role } from '@shared/types';

const config: Record<Role, {
  title: string; subtitle: string; identifierLabel: string; placeholder: string;
  registerText: string; registerLink: string; registerNote: string; keepSignedIn: boolean; forgot: boolean;
}> = {
  member: {
    title: 'Member Login',
    subtitle: 'Sign in with your student ID to view your membership and event registrations.',
    identifierLabel: 'Student ID', placeholder: 'NUB-2026-001',
    registerText: 'Not a member yet?', registerLink: 'Join NUBCC',
    registerNote: 'Your account activates once your payment is verified.', keepSignedIn: false, forgot: true,
  },
  cr: {
    title: 'Class Representative Login',
    subtitle: 'Sign in to manage your CR profile.',
    identifierLabel: 'Email', placeholder: 'cr@demo.nubcc.test',
    registerText: 'New here?', registerLink: 'Register as a CR',
    registerNote: 'New accounts need admin approval before you can sign in.', keepSignedIn: true, forgot: false,
  },
  executive: {
    title: 'Executive Login',
    subtitle: 'Sign in to the executive committee portal.',
    identifierLabel: 'Email', placeholder: 'executive@demo.nubcc.test',
    registerText: 'New here?', registerLink: 'Register as an executive',
    registerNote: 'New accounts need admin approval before you can sign in.', keepSignedIn: true, forgot: false,
  },
};

const roles: Role[] = ['member', 'cr', 'executive'];

export function Login() {
  const { role: roleParam } = useParams();
  const role = (roles.includes(roleParam as Role) ? roleParam : 'member') as Role;
  const cfg = config[role];
  const demo = demoAccount(role);
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
    setPassword(demo.password);
    setError('');
  };

  const copyDemo = async () => {
    try {
      await navigator.clipboard.writeText(`${demo.identifier} / ${demo.password}`);
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
      <div className="auth-bg" aria-hidden="true" />
      <div className="auth-container">
        <div className="auth-brand">
          <Logo />
          <div className="auth-role-tabs" role="tablist" aria-label="Portal type">
            {roles.map((r) => (
              <Link key={r} to={`/${r}/login`} className={r === role ? 'active' : ''} role="tab" aria-selected={r === role}>
                {r === 'cr' ? 'CR' : r === 'executive' ? 'Executive' : 'Member'}
              </Link>
            ))}
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-icon"><LogIn size={24} /></div>
            <h1>{cfg.title}</h1>
            <p>{cfg.subtitle}</p>
          </div>

          {user && user.role === role && (
            <Alert type="success">
              You are already signed in as {user.name}. <Link to={`/${role}`}>Go to your portal <ArrowRight size={14} /></Link>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="auth-form">
            <Field label={cfg.identifierLabel} required>
              <input
                type={role === 'member' ? 'text' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={cfg.placeholder}
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Password" required>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter demo password"
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

            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
              {busy ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />} Sign in
            </button>
          </form>

          <div className="demo-credentials">
            <div className="demo-credentials-header">
              <ShieldCheck size={16} />
              <strong>Demo account</strong>
              <button type="button" className="btn btn-ghost btn-xs" onClick={copyDemo}>
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <dl>
              <div><dt>{demo.identifierLabel}</dt><dd><code>{demo.identifier}</code></dd></div>
              <div><dt>Password</dt><dd><code>{demo.password}</code></dd></div>
            </dl>
            <button type="button" className="btn btn-outline btn-sm btn-block" onClick={fillDemo}>Use demo account</button>
            <p className="demo-warning">{DEMO_NOTICE}</p>
          </div>

          <div className="auth-footer">
            <p>{cfg.registerText} <Link to={`/${role}/register`}>{cfg.registerLink}</Link></p>
            <small>{cfg.registerNote}</small>
          </div>
        </div>
        <p className="auth-back"><Link to="/">← Back to demo home</Link></p>
      </div>
    </div>
  );
}
