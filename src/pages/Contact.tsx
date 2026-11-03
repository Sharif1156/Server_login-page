import { useState, type FormEvent } from 'react';
import { Mail, MapPin, MessageSquare, Loader2, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { Alert, Field, PageHeader } from '@/components/ui';
import { useToast } from '@/context/ToastContext';

export function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api('/api/public/contact', { method: 'POST', body: JSON.stringify(form) });
      setSent(true);
      toast('Demo message saved locally.', 'success');
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="container section">
      <PageHeader eyebrow="Contact" title="Talk to the committee" description="Questions about membership, events, courses or the committee? Send a demo message." />
      <div className="contact-grid">
        <div className="contact-info">
          <div className="card contact-card"><Mail size={22} /><h3>Email</h3><p>demo@nubcc.test</p><small>Demo address — no email is sent.</small></div>
          <div className="card contact-card"><MapPin size={22} /><h3>Campus</h3><p>Northern University Bangladesh</p><small>CSE Department · Dhaka, Bangladesh</small></div>
          <div className="card contact-card"><MessageSquare size={22} /><h3>Office hours</h3><p>Sun–Thu · 10 AM – 4 PM</p><small>Demo schedule only.</small></div>
        </div>
        <div className="card contact-form-card">
          {sent ? (
            <Alert type="success">Thanks! Your demo message was saved locally. No email was sent and no real committee was contacted.</Alert>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="form-grid">
                <Field label="Name" required><input value={form.name} onChange={(e) => set('name', e.target.value)} required /></Field>
                <Field label="Email" required><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required /></Field>
              </div>
              <Field label="Subject" required><input value={form.subject} onChange={(e) => set('subject', e.target.value)} required /></Field>
              <Field label="Message" required><textarea rows={6} value={form.body} onChange={(e) => set('body', e.target.value)} required /></Field>
              {error && <Alert type="error">{error}</Alert>}
              <button className="btn btn-primary" disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Send size={16} />} Send demo message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
