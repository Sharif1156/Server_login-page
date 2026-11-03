import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { EmptyState, Loading, PageHeader } from '@/components/ui';
import { eventTypes } from '@/lib/format';
import type { ClubEvent } from '@shared/types';

export function Events() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');

  useEffect(() => {
    api<{ events: ClubEvent[] }>('/api/public/events').then((d) => setEvents(d.events)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => events.filter((e) =>
    (type === 'all' || e.type === type) &&
    (e.title.toLowerCase().includes(query.toLowerCase()) || e.description.toLowerCase().includes(query.toLowerCase()) || e.location.toLowerCase().includes(query.toLowerCase()))
  ), [events, query, type]);
  const upcoming = filtered.filter((e) => e.status === 'upcoming').sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const past = filtered.filter((e) => e.status === 'past').sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  return (
    <div className="container section">
      <PageHeader eyebrow="Events" title="Workshops, contests & meetups" description="Learn something new, compete with friends, and meet people who love building things. Members get special pricing." />
      <div className="filter-bar">
        <div className="search-input"><Search size={18} /><input placeholder="Search events…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Event type">
          <option value="all">All types</option>
          {eventTypes.map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>
      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState title="No events found" description="Try a different search or filter." /> : (
        <>
          {upcoming.length > 0 && <><h2 className="list-heading">Upcoming ({upcoming.length})</h2><div className="event-grid">{upcoming.map((e) => <EventCard key={e.id} event={e} />)}</div></>}
          {past.length > 0 && <><h2 className="list-heading">Past events</h2><p className="muted">A look back at what we've done recently.</p><div className="event-grid">{past.map((e) => <EventCard key={e.id} event={e} />)}</div></>}
        </>
      )}
    </div>
  );
}
