import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users, CheckCircle2, Loader2 } from 'lucide-react';
import type { ClubEvent } from '@shared/types';
import { bdt, formatDate, formatTime } from '@/lib/format';
import { Badge } from './ui';

interface Props {
  event: ClubEvent;
  onRegister?: (event: ClubEvent) => void;
  onCancel?: (event: ClubEvent) => void;
  busy?: boolean;
  memberView?: boolean;
  linkTo?: string;
}

export function EventCard({ event, onRegister, onCancel, busy, memberView, linkTo }: Props) {
  const d = new Date(event.eventDate);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const full = event.registered >= event.capacity;
  const cover = (
    <>
      {event.cover ? <img src={event.cover} alt="" loading="lazy" /> : <div className="event-cover-fallback" />}
      <div className="event-date-badge"><span>{month}</span><strong>{day}</strong></div>
      <div className="event-type-badge"><Badge variant={event.status === 'past' ? 'default' : 'info'}>{event.type}</Badge></div>
      {event.status === 'past' && <div className="event-ended">Ended</div>}
    </>
  );
  return (
    <article className="event-card">
      {linkTo ? <Link to={linkTo} className="event-cover" aria-label={event.title}>{cover}</Link> : <div className="event-cover">{cover}</div>}
      <div className="event-body">
        <h3>{linkTo ? <Link to={linkTo}>{event.title}</Link> : event.title}</h3>
        <p className="event-desc">{event.description}</p>
        <div className="event-meta">
          <span><CalendarDays size={15} />{formatDate(event.eventDate, { weekday: 'short', month: 'short', day: 'numeric' })} · {formatTime(event.eventDate)}</span>
          <span><MapPin size={15} />{event.location}</span>
          <span><Users size={15} />{event.registered}/{event.capacity} registered</span>
        </div>
        <div className="event-footer">
          <div className="event-price">
            <strong>{bdt(memberView ? event.memberPrice : event.price)}</strong>
            {event.price !== event.memberPrice && <small>Member {bdt(event.memberPrice)}</small>}
          </div>
          <div className="event-actions">
            {linkTo && <Link className="btn btn-ghost btn-sm" to={linkTo}>Details</Link>}
            {event.status === 'upcoming' && event.isRegistered && <Badge variant="success"><CheckCircle2 size={13} /> Registered</Badge>}
            {event.status === 'upcoming' && !event.isRegistered && onRegister && (
              <button className="btn btn-primary btn-sm" onClick={() => onRegister(event)} disabled={busy || full}>
                {busy ? <Loader2 size={15} className="spin" /> : full ? 'Full' : 'Register'}
              </button>
            )}
            {event.status === 'upcoming' && event.isRegistered && onCancel && (
              <button className="btn btn-ghost btn-sm" onClick={() => onCancel(event)} disabled={busy}>Cancel</button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
