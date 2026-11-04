import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { EmptyState, Loading, PageHeader } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { eventTypes } from '@/lib/format';
import type { ClubEvent } from '@shared/types';

export function MemberEvents() {
  const { toast } = useToast();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const load = () => api<{ events: ClubEvent[] }>('/api/portal/events').then((d) => setEvents(d.events)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const register = async (event: ClubEvent) => {
    setBusyId(event.id);
    try {
      await api(`/api/portal/events/${event.id}/register`, { method: 'POST' });
      toast(`Registered for ${event.title}.`, 'success');
      await load();
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusyId(null); }
  };
  const cancel = async (event: ClubEvent) => {
    setBusyId(event.id);
    try {
      await api(`/api/portal/events/${event.id}/register`, { method: 'DELETE' });
      toast('Registration cancelled.', 'info');
      await load();
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusyId(null); }
  };
  const filtered = useMemo(() => events
    .filter((e) => (type === 'all' || e.type === type) && e.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.status === b.status ? a.eventDate.localeCompare(b.eventDate) : a.status === 'upcoming' ? -1 : 1)), [events, query, type]);
  return (
    <>
      <PageHeader title="Events" description="Register for workshops, contests and meetups with member pricing." />
      <div className="filter-bar">
        <div className="search-input"><Search size={18} /><input placeholder="Search events…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option>{eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select>
      </div>
      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState title="No events found" /> : (
        <div className="event-grid">{filtered.map((e) => <EventCard key={e.id} event={e} memberView onRegister={register} onCancel={cancel} busy={busyId === e.id} />)}</div>
      )}
    </>
  );
}
