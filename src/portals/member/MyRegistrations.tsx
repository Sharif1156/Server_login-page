import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, CalendarDays, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Badge, EmptyState, Loading, PageHeader } from '@/components/ui';
import { bdt, formatDate, formatTime } from '@/lib/format';
import type { ClubEvent } from '@shared/types';

export function MyRegistrations() {
  const { toast } = useToast();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const load = () => api<{ events: ClubEvent[] }>('/api/portal/events').then((d) => setEvents(d.events.filter((e) => e.isRegistered))).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const cancel = async (e: ClubEvent) => {
    setBusyId(e.id);
    try { await api(`/api/portal/events/${e.id}/register`, { method: 'DELETE' }); toast('Registration cancelled.', 'info'); await load(); }
    catch (err: any) { toast(err.message, 'error'); }
    finally { setBusyId(null); }
  };
  return (
    <>
      <PageHeader title="My registrations" description="Events you have registered for in this demo." action={<Link className="btn btn-primary btn-sm" to="/member/events">Browse events</Link>} />
      {loading ? <Loading /> : events.length === 0 ? <EmptyState title="No registrations yet" description="Browse events and register to see them here." icon={Ticket} action={<Link className="btn btn-primary" to="/member/events">Browse events</Link>} /> : (
        <div className="registration-list">
          {events.map((e) => (
            <div key={e.id} className="card registration-item">
              <div className="registration-item-main">
                <div className="mini-date"><span>{new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short' })}</span><strong>{new Date(e.eventDate).getDate()}</strong></div>
                <div>
                  <h3><Link to="/member/events">{e.title}</Link></h3>
                  <div className="event-meta"><span><CalendarDays size={14} />{formatDate(e.eventDate)} · {formatTime(e.eventDate)}</span><span><MapPin size={14} />{e.location}</span></div>
                </div>
              </div>
              <div className="registration-item-side">
                <Badge variant={e.status === 'upcoming' ? 'success' : 'default'}>{e.status === 'upcoming' ? 'Confirmed' : 'Ended'}</Badge>
                <strong>{bdt(e.memberPrice)}</strong>
                {e.status === 'upcoming' && <button className="btn btn-ghost btn-sm" onClick={() => cancel(e)} disabled={busyId === e.id}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
