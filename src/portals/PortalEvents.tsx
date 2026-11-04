import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { EmptyState, Loading, PageHeader } from '@/components/ui';
import { eventTypes } from '@/lib/format';
import type { ClubEvent } from '@shared/types';

export function PortalEvents() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  useEffect(() => { api<{ events: ClubEvent[] }>('/api/portal/events').then((d) => setEvents(d.events)).catch(() => {}).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => events
    .filter((e) => (type === 'all' || e.type === type) && e.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.status === b.status ? a.eventDate.localeCompare(b.eventDate) : a.status === 'upcoming' ? -1 : 1)), [events, query, type]);
  return (
    <>
      <PageHeader title="Club events" description="Browse upcoming and past club events. Event registration is managed in the member portal." />
      <div className="filter-bar">
        <div className="search-input"><Search size={18} /><input placeholder="Search events…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option>{eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select>
      </div>
      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState title="No events found" /> : <div className="event-grid">{filtered.map((e) => <EventCard key={e.id} event={e} />)}</div>}
    </>
  );
}
