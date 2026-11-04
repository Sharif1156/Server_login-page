import { useEffect, useState, type FormEvent } from 'react';
import { Megaphone, Plus, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Alert, Badge, ConfirmDialog, EmptyState, Field, Loading, Modal, PageHeader } from '@/components/ui';
import { timeAgo } from '@/lib/format';
import type { Announcement } from '@shared/types';

export function Announcements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', priority: 'normal' });
  const isExec = user?.role === 'executive';

  const load = () => api<{ announcements: Announcement[] }>('/api/portal/announcements').then((d) => setItems(d.announcements)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await api<{ announcements: Announcement[] }>('/api/portal/announcements', { method: 'POST', body: JSON.stringify(form) });
      setItems(d.announcements);
      setModal(false);
      setForm({ title: '', body: '', audience: 'all', priority: 'normal' });
      toast('Announcement published.', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!deleteId) return;
    setBusy(true);
    try {
      const d = await api<{ announcements: Announcement[] }>(`/api/portal/announcements/${deleteId}`, { method: 'DELETE' });
      setItems(d.announcements);
      setDeleteId(null);
      toast('Announcement deleted.', 'info');
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Announcements" description={isExec ? 'Publish updates to members, CRs or the whole club.' : 'Latest updates from the committee.'}
        action={isExec ? <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> New announcement</button> : undefined} />
      {loading ? <Loading /> : items.length === 0 ? <EmptyState title="No announcements" icon={Megaphone} /> : (
        <div className="announcement-list">
          {items.map((a) => (
            <article key={a.id} className={`card announcement-card ${a.priority === 'important' ? 'important' : ''}`}>
              <div className="announcement-head">
                <div className="announcement-badges">
                  {a.priority === 'important' && <Badge variant="warning">Important</Badge>}
                  <Badge variant="info">{a.audience === 'all' ? 'Everyone' : a.audience === 'cr' ? 'CRs' : a.audience}</Badge>
                </div>
                {isExec && <button className="icon-btn danger" onClick={() => setDeleteId(a.id)} aria-label="Delete announcement"><Trash2 size={16} /></button>}
              </div>
              <h3>{a.title}</h3>
              <p>{a.body}</p>
              <small>{a.authorName} · {timeAgo(a.createdAt)}</small>
            </article>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New announcement">
        <form onSubmit={create}>
          <Field label="Title" required><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
          <Field label="Message" required><textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></Field>
          <div className="form-grid">
            <Field label="Audience"><select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}><option value="all">Everyone</option><option value="member">Members</option><option value="cr">Class representatives</option><option value="executive">Executives</option></select></Field>
            <Field label="Priority"><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="normal">Normal</option><option value="important">Important</option></select></Field>
          </div>
          <Alert type="info">Demo announcement — visible only in this local clone.</Alert>
          <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy && <Loader2 size={16} className="spin" />} Publish</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete announcement?" message="This will remove the demo announcement." confirmLabel="Delete" danger busy={busy} />
    </>
  );
}
