import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Loader2, CalendarDays } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Badge, ConfirmDialog, EmptyState, Field, Loading, Modal, PageHeader } from '@/components/ui';
import { bdt, formatDate, formatTime, eventTypes } from '@/lib/format';
import type { ClubEvent } from '@shared/types';

const covers = ['/images/event-workshop.jpg', '/images/event-cse-day.jpg', '/images/event-tour.jpg'];
const emptyForm = {
  title: '', type: 'workshop', description: '', eventDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
  location: '', price: 0, memberPrice: 0, capacity: 100, cover: covers[0], status: 'upcoming',
};

export function ManageEvents() {
  const { toast } = useToast();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ClubEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState<ClubEvent | null>(null);

  const load = () => api<{ events: ClubEvent[] }>('/api/portal/events').then((d) => setEvents(d.events)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (e: ClubEvent) => {
    setEditing(e);
    setForm({ title: e.title, type: e.type, description: e.description, eventDate: new Date(e.eventDate).toISOString().slice(0, 16), location: e.location, price: e.price, memberPrice: e.memberPrice, capacity: e.capacity, cover: e.cover || covers[0], status: e.status });
    setModal(true);
  };
  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, price: Number(form.price), memberPrice: Number(form.memberPrice), capacity: Number(form.capacity), eventDate: new Date(form.eventDate).toISOString() };
      const d = editing
        ? await api<{ events: ClubEvent[] }>(`/api/portal/events/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await api<{ events: ClubEvent[] }>('/api/portal/events', { method: 'POST', body: JSON.stringify(payload) });
      setEvents(d.events);
      setModal(false);
      toast(editing ? 'Event updated.' : 'Event created.', 'success');
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    if (!deleteEvent) return;
    setBusy(true);
    try {
      const d = await api<{ events: ClubEvent[] }>(`/api/portal/events/${deleteEvent.id}`, { method: 'DELETE' });
      setEvents(d.events);
      setDeleteEvent(null);
      toast('Event deleted.', 'info');
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Manage events" description="Create, edit and remove demo club events." action={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New event</button>} />
      {loading ? <Loading /> : events.length === 0 ? <EmptyState title="No events" icon={CalendarDays} action={<button className="btn btn-primary" onClick={openCreate}>Create event</button>} /> : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Event</th><th>Date</th><th>Type</th><th>Registered</th><th>Price</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.title}</strong><small className="cell-sub">{e.location}</small></td>
                  <td>{formatDate(e.eventDate)}<small className="cell-sub">{formatTime(e.eventDate)}</small></td>
                  <td><Badge variant="info">{e.type}</Badge></td>
                  <td>{e.registered}/{e.capacity}</td>
                  <td>{bdt(e.price)}<small className="cell-sub">Member {bdt(e.memberPrice)}</small></td>
                  <td><Badge variant={e.status === 'upcoming' ? 'success' : 'default'}>{e.status}</Badge></td>
                  <td><div className="row-actions"><button className="icon-btn" onClick={() => openEdit(e)} aria-label="Edit"><Pencil size={16} /></button><button className="icon-btn danger" onClick={() => setDeleteEvent(e)} aria-label="Delete"><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit event' : 'New event'} wide>
        <form onSubmit={save}>
          <Field label="Title" required><input value={form.title} onChange={(e) => set('title', e.target.value)} required /></Field>
          <div className="form-grid">
            <Field label="Type"><select value={form.type} onChange={(e) => set('type', e.target.value)}>{eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
            <Field label="Status"><select value={form.status} onChange={(e) => set('status', e.target.value)}><option value="upcoming">Upcoming</option><option value="past">Past</option></select></Field>
            <Field label="Date & time" required><input type="datetime-local" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} required /></Field>
            <Field label="Location" required><input value={form.location} onChange={(e) => set('location', e.target.value)} required /></Field>
            <Field label="Regular price (৳)"><input type="number" min={0} value={form.price} onChange={(e) => set('price', Number(e.target.value))} /></Field>
            <Field label="Member price (৳)"><input type="number" min={0} value={form.memberPrice} onChange={(e) => set('memberPrice', Number(e.target.value))} /></Field>
            <Field label="Capacity"><input type="number" min={1} value={form.capacity} onChange={(e) => set('capacity', Number(e.target.value))} /></Field>
            <Field label="Cover image"><select value={form.cover} onChange={(e) => set('cover', e.target.value)}>{covers.map((c) => <option key={c} value={c}>{c.split('/').pop()}</option>)}</select></Field>
          </div>
          <Field label="Description" required><textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} required /></Field>
          <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy && <Loader2 size={16} className="spin" />} {editing ? 'Save changes' : 'Create event'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteEvent} onClose={() => setDeleteEvent(null)} onConfirm={remove} title="Delete event?" message={deleteEvent ? `Delete “${deleteEvent.title}” and its demo registrations?` : ''} confirmLabel="Delete" danger busy={busy} />
    </>
  );
}
