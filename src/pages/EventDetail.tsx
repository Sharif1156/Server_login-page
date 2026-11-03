import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Users, Ticket, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Alert, Badge, Loading } from '@/components/ui';
import { bdt, formatDate, formatTime } from '@/lib/format';
import type { ClubEvent } from '@shared/types';

export function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => api<{ event: ClubEvent }>(`/api/public/events/${id}`).then((d) => setEvent(d.event)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const register = async () => {
    if (!user) { navigate('/member/login'); return; }
    if (user.role !== 'member') { toast('Event registration is available in the member portal. Sign in with the demo member account.', 'info'); navigate('/member/login'); return; }
    setBusy(true);
    try {
      const d = await api<{ event: ClubEvent }>(`/api/portal/events/${id}/register`, { method: 'POST' });
      setEvent(d.event);
      toast('Registered for this demo event.', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusy(false); }
  };
  const cancel = async () => {
    setBusy(true);
    try {
      const d = await api<{ event: ClubEvent }>(`/api/portal/events/${id}/register`, { method: 'DELETE' });
      setEvent(d.event);
      toast('Registration cancelled.', 'info');
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="container section"><Loading /></div>;
  if (!event) return <div className="container section"><Alert type="error">{error || 'Event not found.'}</Alert><Link className="btn btn-ghost" to="/events">Back to events</Link></div>;
  const full = event.registered >= event.capacity;

  return (
    <div className="container section">
      <Link className="back-link" to="/events"><ArrowLeft size={16} /> All events</Link>
      <div className="event-detail">
        <div className="event-detail-main">
          <div className="event-detail-cover">
            {event.cover && <img src={event.cover} alt={event.title} />}
            <div className="event-detail-badges"><Badge variant="info">{event.type}</Badge>{event.status === 'past' && <Badge>Ended</Badge>}</div>
          </div>
          <h1>{event.title}</h1>
          <div className="event-detail-meta">
            <span><CalendarDays size={17} />{formatDate(event.eventDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {formatTime(event.eventDate)}</span>
            <span><MapPin size={17} />{event.location}</span>
          </div>
          <div className="prose">
            {event.description.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <Alert type="info">Demo event listing. Registration is simulated and no real payment is collected.</Alert>
        </div>
        <aside className="event-detail-sidebar">
          <div className="card registration-card">
            <h3>Registration</h3>
            <div className="price-row"><span>Regular</span><strong>{bdt(event.price)}</strong></div>
            <div className="price-row"><span>Member</span><strong>{bdt(event.memberPrice)}</strong></div>
            <div className="capacity-row"><Users size={16} /><span>{event.registered} / {event.capacity} registered</span></div>
            <div className="capacity-bar"><div style={{ width: `${Math.min(100, (event.registered / event.capacity) * 100)}%` }} /></div>
            {event.status === 'past' ? (
              <button className="btn btn-ghost btn-block" disabled>This event has ended</button>
            ) : event.isRegistered ? (
              <>
                <Alert type="success"><CheckCircle2 size={16} /> You are registered.</Alert>
                <button className="btn btn-ghost btn-block" onClick={cancel} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : null} Cancel registration</button>
              </>
            ) : (
              <button className="btn btn-primary btn-block" onClick={register} disabled={busy || full}>
                {busy ? <Loader2 size={16} className="spin" /> : <Ticket size={16} />}
                {full ? 'Event full' : user?.role === 'member' ? 'Register now' : 'Sign in as member to register'}
              </button>
            )}
            {!user && <p className="field-hint">Use the demo member account: NUB-2026-001 / Member@123</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
