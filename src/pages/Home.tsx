import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, IdCard, BriefcaseBusiness, GraduationCap, CalendarDays, ChevronDown, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { Loading } from '@/components/ui';
import type { ClubEvent } from '@shared/types';

const portalCards = [
  {
    role: 'member', title: 'Member Portal', icon: IdCard,
    desc: 'View your membership, register for events, track courses and download certificates.',
    points: ['Digital membership card', 'Event registration', 'Courses & certificates'],
  },
  {
    role: 'executive', title: 'Executive Portal', icon: BriefcaseBusiness,
    desc: 'Review applications, manage events and announcements, and oversee club directories.',
    points: ['Application review', 'Event management', 'Member & CR directories'],
  },
  {
    role: 'cr', title: 'CR Portal', icon: GraduationCap,
    desc: 'Manage your class representative profile, section roster, attendance and club updates.',
    points: ['Classmate roster', 'Attendance tracking', 'CR announcements'],
  },
];

const faqs = [
  { q: 'Who can sign in?', a: 'This demo has three sample accounts: member, class representative and executive. Use the “Demo access” panel on each login page.' },
  { q: 'Is this the live NUBCC website?', a: 'No. This is an unofficial demo clone focused on the login pages and portals. It does not connect to nubcc.club and does not process real payments or emails.' },
  { q: 'Can I use my real NUBCC password?', a: 'No. Only the advertised sample accounts work. Never enter real credentials or personal information.' },
  { q: 'What can I do after signing in?', a: 'Members can manage events and courses, CRs can manage classmates and attendance, and executives can review applications and manage club content.' },
];

export function Home() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ events: ClubEvent[] }>('/api/public/events')
      .then((d) => setEvents(d.events.filter((x) => x.status === 'upcoming').slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="hero-pill"><ShieldCheck size={15} /> Demo portal workspace</div>
          <h1>NUBCC login &amp; portal workspace</h1>
          <p>A focused demo of the NUB CSE Computer Club sign-in experience and role-based portals for members, class representatives and executives.</p>
          <div className="hero-actions">
            <Link className="btn btn-join btn-lg" to="/member/register">Join Us <ArrowRight size={18} /></Link>
            <Link className="btn btn-outline-light btn-lg" to="/member/login">Member login</Link>
          </div>
        </div>
      </section>

      <section className="section container" id="portals">
        <div className="section-head">
          <div><div className="eyebrow">Portals</div><h2>Choose your portal</h2><p>Sign in with the matching demo account to explore each workspace.</p></div>
        </div>
        <div className="portal-choice-grid">
          {portalCards.map((p) => (
            <div className="portal-choice-card" key={p.role}>
              <div className="portal-choice-icon"><p.icon size={26} /></div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
              <Link className="btn btn-primary btn-block" to={`/${p.role}/login`}>Sign in <ArrowRight size={16} /></Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt" id="events">
        <div className="container">
          <div className="section-head">
            <div><div className="eyebrow">Happening soon</div><h2>Upcoming events</h2><p>Sign in as a member to register for demo events.</p></div>
            <Link className="btn btn-ghost" to="/member/login">Member login <ArrowRight size={16} /></Link>
          </div>
          {loading ? <Loading /> : <div className="event-grid">{events.map((e) => <EventCard key={e.id} event={e} />)}</div>}
        </div>
      </section>

      <section className="section container" id="about">
        <div className="about-grid">
          <div>
            <div className="eyebrow">About this build</div>
            <h2>Homepage, login pages and portals only</h2>
            <p>This build intentionally keeps the public surface small: one homepage, three login pages, registration/forgot-password flows, and the protected member, CR and executive portals.</p>
            <ul className="check-list">
              <li>Dark NUBCC-inspired interface</li>
              <li>Role-based protected portals</li>
              <li>Local demo data and sample accounts</li>
              <li>No real credentials, payments or emails</li>
            </ul>
          </div>
          <div className="about-card">
            <CalendarDays size={28} />
            <h3>Try the full flow</h3>
            <p>Open a login page, expand “Demo access”, use the sample account, then explore the portal dashboard.</p>
            <Link className="btn btn-outline" to="/cr/login">Open CR login</Link>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="faq">
        <div className="container">
          <div className="section-head"><div><div className="eyebrow">FAQ</div><h2>Common questions</h2></div></div>
          <div className="faq-list">
            {faqs.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}<ChevronDown size={18} /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
