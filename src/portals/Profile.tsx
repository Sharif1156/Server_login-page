import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Alert, Avatar, Badge, Field, PageHeader } from '@/components/ui';
import { roleLabel } from '@/lib/format';
import type { User } from '@shared/types';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export function Profile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<User>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm({
      name: user.name, phone: user.phone, batch: user.batch, semester: user.semester, section: user.section,
      bloodGroup: user.bloodGroup, skills: user.skills, experience: user.experience, address: user.address,
      facebook: user.facebook, linkedin: user.linkedin, github: user.github,
    });
  }, [user?.id]);

  if (!user) return null;
  const set = (k: keyof User, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = { ...form, semester: Number(form.semester) };
      const d = await api<{ user: User }>('/api/portal/profile', { method: 'PATCH', body: JSON.stringify(payload) });
      setUser(d.user);
      toast('Demo profile updated.', 'success');
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="My profile" description="Update your demo profile. Changes are stored only in this local demo database." />
      <div className="profile-layout">
        <div className="card profile-summary">
          <Avatar name={user.name} color={user.avatarColor} size={88} />
          <h2>{user.name}</h2>
          <Badge variant="info">{roleLabel(user.role)}</Badge>
          <dl className="profile-dl">
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Student ID</dt><dd>{user.studentId}</dd></div>
            {user.membershipId && <div><dt>Membership ID</dt><dd>{user.membershipId}</dd></div>}
            {user.position && <div><dt>Position</dt><dd>{user.position}</dd></div>}
            <div><dt>Status</dt><dd><Badge variant="success">{user.status}</Badge></dd></div>
          </dl>
          <Alert type="info">Email, student ID and role are fixed for demo accounts.</Alert>
        </div>
        <form className="card profile-form" onSubmit={onSubmit}>
          <h3>Editable details</h3>
          <div className="form-grid">
            <Field label="Full name" required><input value={form.name || ''} onChange={(e) => set('name', e.target.value)} required /></Field>
            <Field label="Phone"><input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} /></Field>
            <Field label="Batch"><input value={form.batch || ''} onChange={(e) => set('batch', e.target.value)} /></Field>
            <Field label="Semester"><input type="number" min={1} max={12} value={form.semester || 1} onChange={(e) => set('semester', Number(e.target.value))} /></Field>
            <Field label="Section"><input value={form.section || ''} onChange={(e) => set('section', e.target.value)} /></Field>
            <Field label="Blood group"><select value={form.bloodGroup || ''} onChange={(e) => set('bloodGroup', e.target.value)}><option value="">Select</option>{bloodGroups.map((b) => <option key={b}>{b}</option>)}</select></Field>
          </div>
          <Field label="Skills"><textarea rows={3} value={form.skills || ''} onChange={(e) => set('skills', e.target.value)} /></Field>
          <Field label="Experience"><textarea rows={3} value={form.experience || ''} onChange={(e) => set('experience', e.target.value)} /></Field>
          <Field label="Address"><input value={form.address || ''} onChange={(e) => set('address', e.target.value)} /></Field>
          <h3>Social links</h3>
          <div className="form-grid">
            <Field label="Facebook"><input value={form.facebook || ''} onChange={(e) => set('facebook', e.target.value)} placeholder="https://facebook.com/…" /></Field>
            <Field label="LinkedIn"><input value={form.linkedin || ''} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
            <Field label="GitHub"><input value={form.github || ''} onChange={(e) => set('github', e.target.value)} placeholder="https://github.com/…" /></Field>
          </div>
          {error && <Alert type="error">{error}</Alert>}
          <button className="btn btn-primary" disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save changes</button>
        </form>
      </div>
    </>
  );
}
