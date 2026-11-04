import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Trophy, Rocket, Users, CalendarDays, BookOpen, Shield, Database, Brain, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { Loading } from '@/components/ui';
import type { ClubEvent, Course, PublicStats } from '@shared/types';

const faqs = [
  { q: 'Who can join NUBCC?', a: 'Any student of the CSE department at Northern University Bangladesh can become a member — from first semester to final year. No prior experience needed.' },
  { q: 'How do I become a member?', a: 'Fill in the online membership form. On the live site you pay a one-time ৳99 fee by bKash/Nagad; in this demo no payment is collected. Once verified, you can sign in to the member portal.' },
  { q: 'What do members get?', a: 'Member pricing on paid events and workshops, access to study circles and mentors, a chance to join project teams, and priority when committee positions open.' },
  { q: 'Can I join events without being a member?', a: 'Yes. Most events are open to all students — members simply pay less for paid ones.' },
  { q: 'How do I become a CR or join the committee?', a: 'When applications are open you will find the forms under Team on the website. Your application is reviewed by the admin panel before it appears publicly.' },
];

export function Home() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<{ events: ClubEvent[] }>('/api/public/events'),
      api<{ courses: Course[] }>('/api/public/courses'),
      api<{ stats: PublicStats }>('/api/public/stats'),
    ]).then(([e, c, s]) => {
      setEvents(e.events.filter((x) => x.status === 'upcoming').slice(0, 3));
      setCourses(c.courses.slice(0, 3));
      setStats(s.stats);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-pill"><span className="dot" /> Next up · NUB CSE Day 2026</div>
            <h1>Where NUB's <span className="hero-accent">builders</span> learn &amp; lead</h1>
            <p>The official computer club of the CSE department at Northern University Bangladesh — workshops, programming contests, real projects and a community that helps you grow.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" to="/member/register">Become a member <ArrowRight size={18} /></Link>
              <Link className="btn btn-outline btn-lg" to="/events">Explore events</Link>
            </div>
            <div className="hero-stats">
              <div><strong>{stats ? `${stats.members}` : '—'}</strong><span>Demo members</span></div>
              <div><strong>{stats ? `${stats.executives}` : '—'}</strong><span>Committee</span></div>
              <div><strong>{stats ? `${stats.courses}` : '—'}</strong><span>Courses</span></div>
            </div>
          </div>
          <div className="hero-media">
            <img src="/images/hero-lab.jpg" alt="Students collaborating in a computer lab" />
            <div className="hero-card">
              <Users size={20} />
              <div><strong>3,000+ students</strong><span>already in the club</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div><div className="eyebrow">What we do</div><h2>Everything you need to grow as a developer</h2><p>From your first line of code to leading a team — the club gives you practice, mentors and a stage.</p></div>
        </div>
        <div className="feature-grid">
          <div className="feature-card"><Code2 size={26} /><h3>Workshops & courses</h3><p>Hands-on sessions on web, mobile, AI, security and more — taught by seniors and industry mentors.</p><Link to="/member/courses">Browse courses <ArrowRight size={14} /></Link></div>
          <div className="feature-card"><Trophy size={26} /><h3>Contests & hackathons</h3><p>Programming contests, hackathons and tech fests to test your skills and win prizes.</p><Link to="/events">See events <ArrowRight size={14} /></Link></div>
          <div className="feature-card"><Rocket size={26} /><h3>Real projects</h3><p>Build and ship projects with teammates, then showcase them to the whole department.</p><Link to="/events">View projects <ArrowRight size={14} /></Link></div>
          <div className="feature-card"><Users size={26} /><h3>Community</h3><p>Meet people who love tech, find study partners, and grow your network with alumni.</p><Link to="/executives">Meet the team <ArrowRight size={14} /></Link></div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <div><div className="eyebrow">Happening soon</div><h2>Upcoming events</h2></div>
            <Link className="btn btn-ghost" to="/events">All events <ArrowRight size={16} /></Link>
          </div>
          {loading ? <Loading /> : (
            <div className="event-grid">
              {events.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div><div className="eyebrow">Learn & grow</div><h2>Courses & learning tracks</h2><p>Structured, hands-on tracks — pick one and build real skills over a semester.</p></div>
        </div>
        <div className="course-grid">
          {courses.map((c, i) => (
            <div className="course-card" key={c.id}>
              <div className="course-track" style={{ background: c.color }}>{i === 0 ? <Shield size={22} /> : i === 1 ? <Database size={22} /> : <Brain size={22} />}</div>
              <div className="eyebrow">Track {String(i + 1).padStart(2, '0')}</div>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <div className="course-meta"><span>{c.duration}</span><span>{c.lessons} lessons</span><span>{c.level}</span></div>
              <Link className="btn btn-outline btn-sm" to="/member/login">Ask about this course</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container community-grid">
          <div>
            <div className="eyebrow">Our community</div>
            <h2>Building excellence since inception</h2>
            <p>The NUB CSE Computer Club was established with a vision to create a vibrant community of tech enthusiasts and aspiring computer scientists. Over the years, we have grown from a small group of passionate students to a thriving organization with thousands of members.</p>
            <ul className="check-list">
              <li>Weekly workshops & study circles</li>
              <li>Inter-university contests</li>
              <li>Mentorship from seniors & alumni</li>
              <li>Leadership through the committee</li>
            </ul>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/executives">Meet the committee</Link>
              <Link className="btn btn-ghost" to="/class-representatives">Find your CR</Link>
            </div>
          </div>
          <div className="community-media">
            <img src="/images/event-cse-day.jpg" alt="NUBCC technology fair" />
            <div className="community-badge"><strong>20+ Years</strong><span>of Excellence</span></div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head"><div><div className="eyebrow">FAQ</div><h2>New here? Start with these</h2><p>Can't find your answer? <Link to="/contact">Send us a message</Link> and the committee will reply.</p></div></div>
        <div className="faq-list">
          {faqs.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}<ChevronDown size={18} /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to build with us?</h2>
          <p>Join students learning, competing and shipping projects together. It takes two minutes.</p>
          <div className="hero-actions">
            <Link className="btn btn-gold btn-lg" to="/member/register">Become a member</Link>
            <Link className="btn btn-outline-light btn-lg" to="/contact">Talk to us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
