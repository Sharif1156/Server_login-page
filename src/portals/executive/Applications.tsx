import { useEffect, useMemo, useState } from 'react';
import { Search, CheckCircle2, XCircle, RotateCcw, Eye, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Alert, Badge, EmptyState, Field, Loading, Modal, PageHeader } from '@/components/ui';
import { formatDate, roleLabel, timeAgo } from '@/lib/format';
import type { Application, ApplicationStatus } from '@shared/types';

const statusVariant = (s: ApplicationStatus) => s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : 'warning';

export function Applications() {
  const { toast } = useToast();
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [role, setRole] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Application | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api<{ applications: Application[] }>('/api/portal/applications').then((d) => setItems(d.applications)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((a) =>
    (status === 'all' || a.status === status) && (role === 'all' || a.role === role) &&
    (a.name.toLowerCase().includes(query.toLowerCase()) || a.studentId.toLowerCase().includes(query.toLowerCase()) || a.email.toLowerCase().includes(query.toLowerCase()))
  ), [items, status, role, query]);

  const review = async (newStatus: ApplicationStatus) => {
    if (!selected) return;
    setBusy(true);
    try {
      const d = await api<{ application: Application }>(`/api/portal/applications/${selected.id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus, note }) });
      setItems((list) => list.map((a) => a.id === d.application.id ? d.application : a));
      setSelected(d.application);
      toast(`Application ${newStatus}.`, newStatus === 'approved' ? 'success' : 'info');
      setSelected(null);
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusy(false); }
  };

  const open = (a: Application) => { setSelected(a); setNote(a.reviewNote || ''); };
  const counts = { pending: items.filter((a) => a.status === 'pending').length, approved: items.filter((a) => a.status === 'approved').length, rejected: items.filter((a) => a.status === 'rejected').length };

  return (
    <>
      <PageHeader title="Applications" description="Review demo membership, CR and executive applications. Approving publishes them to the demo directory; no real login is created." />
      <div className="filter-bar">
        <div className="search-input"><Search size={18} /><input placeholder="Search applications…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="pending">Pending ({counts.pending})</option><option value="approved">Approved ({counts.approved})</option><option value="rejected">Rejected ({counts.rejected})</option></select>
        <select value={role} onChange={(e) => setRole(e.target.value)}><option value="all">All roles</option><option value="member">Member</option><option value="cr">CR</option><option value="executive">Executive</option></select>
      </div>
      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState title="No applications found" /> : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Applicant</th><th>Role</th><th>Batch / Section</th><th>Position</th><th>Submitted</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong><small className="cell-sub">{a.studentId}</small><small className="cell-sub">{a.email}</small></td>
                  <td><Badge variant="info">{a.role === 'cr' ? 'CR' : roleLabel(a.role)}</Badge></td>
                  <td>{a.batch} / {a.section}<small className="cell-sub">Semester {a.semester}</small></td>
                  <td>{a.position || '—'}</td>
                  <td>{timeAgo(a.submittedAt)}</td>
                  <td><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td>
                  <td><button className="btn btn-ghost btn-xs" onClick={() => open(a)}><Eye size={14} /> Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Application #${selected.id} — ${selected.name}` : ''} wide>
        {selected && (
          <>
            <div className="application-detail">
              <dl className="profile-dl two-col">
                <div><dt>Role</dt><dd>{roleLabel(selected.role)}</dd></div>
                <div><dt>Status</dt><dd><Badge variant={statusVariant(selected.status)}>{selected.status}</Badge></dd></div>
                <div><dt>Student ID</dt><dd>{selected.studentId}</dd></div>
                <div><dt>Email</dt><dd>{selected.email}</dd></div>
                <div><dt>Phone</dt><dd>{selected.phone}</dd></div>
                <div><dt>Batch / Semester / Section</dt><dd>{selected.batch} / {selected.semester} / {selected.section}</dd></div>
                <div><dt>Blood group</dt><dd>{selected.bloodGroup || '—'}</dd></div>
                <div><dt>Position</dt><dd>{selected.position || '—'}</dd></div>
                {selected.panelYear && <div><dt>Panel year</dt><dd>{selected.panelYear}</dd></div>}
                {selected.tenureStart && <div><dt>Tenure start</dt><dd>{selected.tenureStart}</dd></div>}
                <div><dt>Submitted</dt><dd>{formatDate(selected.submittedAt)}</dd></div>
                {selected.reviewedAt && <div><dt>Reviewed</dt><dd>{formatDate(selected.reviewedAt)}</dd></div>}
              </dl>
              {selected.skills && <div className="application-block"><strong>Skills</strong><p>{selected.skills}</p></div>}
              {selected.experience && <div className="application-block"><strong>Experience</strong><p>{selected.experience}</p></div>}
              {selected.address && <div className="application-block"><strong>Address</strong><p>{selected.address}</p></div>}
            </div>
            <Field label="Review note"><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for this demo review" /></Field>
            <Alert type="info">Demo review only. Approving adds the applicant to the public demo directory; it does not create a real account or send email.</Alert>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              {selected.status !== 'pending' && <button className="btn btn-outline" onClick={() => review('pending')} disabled={busy}><RotateCcw size={15} /> Reopen</button>}
              <button className="btn btn-danger" onClick={() => review('rejected')} disabled={busy}>{busy ? <Loader2 size={15} className="spin" /> : <XCircle size={15} />} Reject</button>
              <button className="btn btn-primary" onClick={() => review('approved')} disabled={busy}>{busy ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />} Approve</button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
