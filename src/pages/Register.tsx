import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Upload, ArrowLeft, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { Alert, Field, PageHeader } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import type { Role } from '@shared/types';

const positions = [
  'President', 'Senior Vice President', 'Vice President', 'General Secretary', 'Treasurer',
  'Assistant General Secretary', 'Senior Graphics Design Secretary', 'Sports Secretary (Indoor)',
  'Sports Secretary (Outdoor)', 'Cultural Secretary', 'Debating Secretary', 'Joint Secretary',
  'Programming Secretary', 'Event Management Secretary', 'Organizing Secretary',
  'Alumni Affairs Secretary', 'Robotics Secretary', 'Innovation Secretary',
  'Media & Photography Secretary', 'Executive Member',
];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const semesters = Array.from({ length: 12 }, (_, i) => i + 1);

const titles: Record<Role, { title: string; intro: string; eyebrow: string }> = {
  member: { title: 'Become a Member', intro: 'Join NUBCC Family — Registration Fee: ৳99 Only', eyebrow: 'Membership' },
  cr: { title: 'Register as a Class Representative', intro: 'Are you the CR of your section? Register so classmates can find you and the club can reach your batch quickly.', eyebrow: 'Apply · Class Representative' },
  executive: { title: 'Join the Executive Committee', intro: 'Help lead NUBCC — plan events, run workshops and represent the club. Fill in the form and the admin panel will review your application.', eyebrow: 'Apply · Executive Committee' },
};

export function Register() {
  const { role: roleParam } = useParams();
  const role = (['member', 'cr', 'executive'].includes(roleParam || '') ? roleParam : 'member') as Role;
  const t = titles[role];
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ id: number } | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [form, setForm] = useState({
    name: '', studentId: '', email: '', phone: '', batch: '', semester: '', section: '',
    bloodGroup: '', position: '', panelYear: '2026-2027', tenureStart: new Date().toISOString().slice(0, 10),
    skills: '', experience: '', address: '', facebook: '', linkedin: '', github: '',
    paymentMethod: 'bkash', confirm: false,
  });
  const set = (key: keyof typeof form, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.confirm) { setError('Please confirm the information is correct.'); return; }
    if (role === 'executive' && !form.position) { setError('Please choose a position.'); return; }
    setBusy(true);
    try {
      const payload = {
        role,
        name: form.name, studentId: form.studentId, email: form.email, phone: form.phone,
        batch: form.batch, semester: Number(form.semester), section: form.section,
        bloodGroup: form.bloodGroup,
        position: role === 'executive' ? form.position : role === 'cr' ? 'Class Representative' : '',
        panelYear: role === 'executive' ? form.panelYear : '',
        tenureStart: role === 'executive' ? form.tenureStart : '',
        skills: form.skills, experience: form.experience, address: form.address,
        facebook: form.facebook, linkedin: form.linkedin, github: form.github,
        confirm: true as const,
      };
      const data = await api<{ id: number }>('/api/public/applications', { method: 'POST', body: JSON.stringify(payload) });
      setSuccess({ id: data.id });
      toast('Demo application submitted.', 'success');
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="container section">
        <div className="success-card">
          <CheckCircle2 size={56} className="success-icon" />
          <h1>Application submitted</h1>
          <p>Your demo {role === 'cr' ? 'CR' : role} application <strong>#{success.id}</strong> is now <strong>pending review</strong>.</p>
          <Alert type="info">This is a demo. No real account, payment, or email was created. Sign in with the sample account to explore the portal, or sign in as an executive to review this application.</Alert>
          <div className="success-actions">
            <Link className="btn btn-primary" to={`/${role}/login`}>Go to {role === 'cr' ? 'CR' : role} login</Link>
            <Link className="btn btn-ghost" to="/">Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section register-page">
      <PageHeader eyebrow={t.eyebrow} title={t.title} description={t.intro} action={<Link className="btn btn-ghost btn-sm" to={`/${role}/login`}><ArrowLeft size={15} /> Sign in</Link>} />
      <Alert type="warning">Demo form: use fictional information only. No password is created, no photo is uploaded, and no payment is collected.</Alert>

      <form onSubmit={onSubmit} className="register-form">
        <section className="form-section">
          <h2><span className="step-num">1</span>Personal information</h2>
          <div className="form-grid">
            <Field label="Full name" required><input value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g. Demo Student" /></Field>
            <Field label="Student ID" required><input value={form.studentId} onChange={(e) => set('studentId', e.target.value)} required placeholder="e.g. NUB-2026-999" /></Field>
            <Field label="Email" required><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="demo@example.test" /></Field>
            <Field label="Phone" required><input value={form.phone} onChange={(e) => set('phone', e.target.value)} required placeholder="+8801XXXXXXXXX" /></Field>
          </div>
        </section>

        <section className="form-section">
          <h2><span className="step-num">2</span>{role === 'executive' ? 'Position & academic details' : 'Batch & section'}</h2>
          <div className="form-grid">
            {role === 'executive' && (
              <>
                <Field label="Position" required>
                  <select value={form.position} onChange={(e) => set('position', e.target.value)} required>
                    <option value="">Select a position</option>
                    {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Panel year" required><input value={form.panelYear} onChange={(e) => set('panelYear', e.target.value)} required placeholder="2026-2027" /></Field>
                <Field label="Tenure start" required><input type="date" value={form.tenureStart} onChange={(e) => set('tenureStart', e.target.value)} required /></Field>
              </>
            )}
            <Field label="Batch" required><input value={form.batch} onChange={(e) => set('batch', e.target.value)} required placeholder="e.g. 67" /></Field>
            <Field label="Semester" required>
              <select value={form.semester} onChange={(e) => set('semester', e.target.value)} required>
                <option value="">Select</option>
                {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Section" required><input value={form.section} onChange={(e) => set('section', e.target.value)} required placeholder="e.g. A" /></Field>
            <Field label="Blood group">
              <select value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)}>
                <option value="">Select</option>
                {bloodGroups.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            {role === 'member' && (
              <Field label="Address" required><input value={form.address} onChange={(e) => set('address', e.target.value)} required placeholder="Dhaka, Bangladesh" /></Field>
            )}
          </div>
        </section>

        {role === 'member' && (
          <section className="form-section">
            <h2><span className="step-num">3</span>Skills & experience</h2>
            <div className="form-grid">
              <Field label="Professional skills"><textarea rows={3} value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="e.g. Python, UI design, public speaking" /></Field>
              <Field label="Leadership or volunteering experience"><textarea rows={3} value={form.experience} onChange={(e) => set('experience', e.target.value)} placeholder="Tell us about any club or volunteer work" /></Field>
            </div>
          </section>
        )}

        {role !== 'member' && (
          <section className="form-section">
            <h2><span className="step-num">3</span>Photo & links</h2>
            <div className="photo-row">
              <div className="photo-preview">
                {photoPreview ? <img src={photoPreview} alt="Preview" /> : <Upload size={28} />}
              </div>
              <div>
                <label className="btn btn-outline btn-sm">
                  Choose photo
                  <input type="file" accept="image/png,image/jpeg" hidden onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPhotoPreview(URL.createObjectURL(file));
                  }} />
                </label>
                <p className="field-hint">JPG or PNG, max 2 MB. Preview only — photos are not uploaded in this demo.</p>
              </div>
            </div>
            <div className="form-grid">
              <Field label="Facebook (optional)"><input value={form.facebook} onChange={(e) => set('facebook', e.target.value)} placeholder="https://facebook.com/…" /></Field>
              <Field label="LinkedIn (optional)"><input value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
              <Field label="GitHub (optional)"><input value={form.github} onChange={(e) => set('github', e.target.value)} placeholder="https://github.com/…" /></Field>
            </div>
          </section>
        )}

        {role === 'member' && (
          <section className="form-section">
            <h2><span className="step-num">4</span>Payment information</h2>
            <Alert type="warning"><strong>Demo only — do not send money.</strong> The live site collects a ৳99 registration fee via bKash/Nagad. This clone does not process payments and does not display real payment numbers.</Alert>
            <div className="form-grid">
              <Field label="Payment method (demo)">
                <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
                  <option value="bkash">bKash (demo)</option>
                  <option value="nagad">Nagad (demo)</option>
                  <option value="cash">Cash (demo)</option>
                </select>
              </Field>
              <Field label="Transaction ID (demo)"><input value={`DEMO-${form.studentId || '0000'}`} readOnly /></Field>
            </div>
          </section>
        )}

        <section className="form-section">
          <h2><span className="step-num">{role === 'member' ? 5 : 4}</span>Account</h2>
          <Alert type="info">
            No password is created in this demo. After submitting, use the sample {role === 'cr' ? 'CR' : role} account on the login page.
            New applications appear in the executive portal for review.
          </Alert>
          <label className="checkbox confirm-checkbox">
            <input type="checkbox" checked={form.confirm} onChange={(e) => set('confirm', e.target.checked)} required />
            <span>I confirm the fictional demo information above is correct and agree to follow the club's guidelines. My details will be reviewed in the demo executive panel before publishing.</span>
          </label>
        </section>

        {error && <Alert type="error">{error}</Alert>}
        <div className="form-actions">
          <button className="btn btn-primary btn-lg" type="submit" disabled={busy || !form.confirm}>
            {busy ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
            {role === 'member' ? 'Complete demo registration' : 'Submit application'}
          </button>
          <Link className="btn btn-ghost" to="/">Cancel</Link>
        </div>
        <p className="register-login-link">Already applied? <Link to={`/${role}/login`}>Sign in</Link></p>
      </form>
    </div>
  );
}
