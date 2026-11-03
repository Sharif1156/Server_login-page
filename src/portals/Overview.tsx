import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, ClipboardList, BookOpen, Award, Ticket, Megaphone, ArrowRight, Activity, IdCard, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Avatar, Badge, Loading, PageHeader, StatCard } from '@/components/ui';
import { formatDate, roleLabel, timeAgo } from '@/lib/format';
import type { Announcement, Application, Activity as ActivityType, Classmate, ClubEvent, Course, User } from '@shared/types';

export function Overview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activity, setActivity] = useState<ActivityType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [crs, setCrs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const role = user.role;
    const tasks: Promise<any>[] = [
      api<{ events: ClubEvent[] }>('/api/portal/events').then((d) => setEvents(d.events)),
      api<{ announcements: Announcement[] }>('/api/portal/announcements').then((d) => setAnnouncements(d.announcements)),
      api<{ activity: ActivityType[] }>('/api/portal/activity').then((d) => setActivity(d.activity)),
    ];
    if (role === 'member') {
      tasks.push(api<{ courses: Course[] }>('/api/portal/courses').then((d) => setCourses(d.courses)));
      tasks.push(api<{ certificates: any[] }>('/api/portal/certificates').then((d) => setCertificates(d.certificates)));
    }
    if (role === 'cr') tasks.push(api<{ classmates: Classmate[] }>('/api/portal/classmates').then((d) => setClassmates(d.classmates)));
    if (role === 'executive') {
      tasks.push(api<{ applications: Application[] }>('/api/portal/applications').then((d) => setApplications(d.applications)));
      tasks.push(api<{ members: User[] }>('/api/portal/members').then((d) => setMembers(d.members)));
      tasks.push(api<{ people: any[] }>('/api/portal/crs').then((d) => setCrs(d.people)));
    }
    Promise.all(tasks).catch(() => {}).finally(() => setLoading(false));
  }, [user?.id]);

  if (!user) return null;
  if (loading) return <Loading label="Loading your demo portal…" />;
  const role = user.role;
  const upcoming = events.filter((e) => e.status === 'upcoming').sort((a, b) => a.eventDate.localeCompare(b.eventDate)).slice(0, 4);
  const registered = events.filter((e) => e.isRegistered);
  const pending = applications.filter((a) => a.status === 'pending');
  const avgAttendance = classmates.length ? Math.round(classmates.reduce((s, c) => s + c.attendance, 0) / classmates.length) : 0;

  const quickLinks = role === 'member'
    ? [{ to: '/member/events', label: 'Browse events', icon: CalendarDays }, { to: '/member/courses', label: 'My courses', icon: BookOpen }, { to: '/member/certificates', label: 'Certificates', icon: Award }, { to: '/member/profile', label: 'Edit profile', icon: IdCard }]
    : role === 'cr'
      ? [{ to: '/cr/classmates', label: 'My classmates', icon: Users }, { to: '/cr/events', label: 'Club events', icon: CalendarDays }, { to: '/cr/announcements', label: 'Announcements', icon: Megaphone }, { to: '/cr/profile', label: 'Edit CR profile', icon: IdCard }]
      : [{ to: '/executive/applications', label: 'Review applications', icon: ClipboardList }, { to: '/executive/events', label: 'Manage events', icon: CalendarDays }, { to: '/executive/announcements', label: 'Post announcement', icon: Megaphone }, { to: '/executive/members', label: 'Member directory', icon: Users }];

  return (
    <>
      <PageHeader eyebrow={`${roleLabel(role)} portal`} title={`Welcome back, ${user.name.split(' ')[0]}!`} description={role === 'member' ? 'Here is your membership, events and learning progress.' : role === 'cr' ? 'Manage your section, attendance and club updates.' : 'Overview of members, applications, events and announcements.'} />

      <div className="stats-grid">
        {role === 'member' && <>
          <StatCard label="Events registered" value={registered.length} icon={Ticket} />
          <StatCard label="Courses enrolled" value={courses.filter((c) => c.enrolled).length} icon={BookOpen} tone="purple" />
          <StatCard label="Certificates" value={certificates.length} icon={Award} tone="gold" />
          <StatCard label="Member since" value={formatDate(user.joinedAt, { month: 'short', year: 'numeric' })} icon={IdCard} tone="green" />
        </>}
        {role === 'cr' && <>
          <StatCard label="Classmates" value={classmates.length} icon={Users} />
          <StatCard label="Avg. attendance" value={`${avgAttendance}%`} icon={GraduationCap} tone="green" />
          <StatCard label="Upcoming events" value={events.filter((e) => e.status === 'upcoming').length} icon={CalendarDays} tone="purple" />
          <StatCard label="Announcements" value={announcements.length} icon={Megaphone} tone="gold" />
        </>}
        {role === 'executive' && <>
          <StatCard label="Members" value={members.length} icon={Users} />
          <StatCard label="Class representatives" value={crs.length} icon={IdCard} tone="purple" />
          <StatCard label="Pending applications" value={pending.length} icon={ClipboardList} tone="gold" />
          <StatCard label="Upcoming events" value={events.filter((e) => e.status === 'upcoming').length} icon={CalendarDays} tone="green" />
        </>}
      </div>

      <div className="overview-grid">
        <div className="overview-main">
          {role === 'member' && (
            <div className="membership-card">
              <div className="membership-top"><span>NUBCC MEMBER</span><Badge variant="gold">Active</Badge></div>
              <div className="membership-body">
                <Avatar name={user.name} color="#ffffff33" size={56} />
                <div><h3>{user.name}</h3><p>{user.studentId}</p></div>
              </div>
              <div className="membership-meta">
                <div><small>Membership ID</small><strong>{user.membershipId}</strong></div>
                <div><small>Batch / Section</small><strong>{user.batch} / {user.section}</strong></div>
                <div><small>Semester</small><strong>{user.semester}</strong></div>
              </div>
              <div className="barcode" aria-hidden="true" />
            </div>
          )}

          <div className="card">
            <div className="card-header"><h3>Upcoming events</h3><Link to={`/${role}/events`}>View all <ArrowRight size={14} /></Link></div>
            {upcoming.length === 0 ? <p className="muted">No upcoming events.</p> : (
              <div className="mini-event-list">
                {upcoming.map((e) => (
                  <Link key={e.id} to={`/events/${e.id}`} className="mini-event">
                    <div className="mini-date"><span>{new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short' })}</span><strong>{new Date(e.eventDate).getDate()}</strong></div>
                    <div className="mini-event-info"><strong>{e.title}</strong><small>{e.location} · {e.type}</small></div>
                    {e.isRegistered && <Badge variant="success">Registered</Badge>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {role === 'executive' && (
            <div className="card">
              <div className="card-header"><h3>Pending applications</h3><Link to="/executive/applications">Review all <ArrowRight size={14} /></Link></div>
              {pending.length === 0 ? <p className="muted">No pending applications.</p> : (
                <div className="table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Role</th><th>Submitted</th><th></th></tr></thead><tbody>
                  {pending.slice(0, 5).map((a) => (
                    <tr key={a.id}><td>{a.name}<small className="cell-sub">{a.studentId}</small></td><td><Badge variant="info">{a.role === 'cr' ? 'CR' : a.role}</Badge></td><td>{timeAgo(a.submittedAt)}</td><td><Link className="btn btn-ghost btn-xs" to="/executive/applications">Review</Link></td></tr>
                  ))}
                </tbody></table></div>
              )}
            </div>
          )}

          <div className="card">
            <div className="card-header"><h3>Announcements</h3><Link to={`/${role}/announcements`}>View all <ArrowRight size={14} /></Link></div>
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="announcement-mini">
                <div className="announcement-mini-head"><strong>{a.title}</strong>{a.priority === 'important' && <Badge variant="warning">Important</Badge>}</div>
                <p>{a.body}</p>
                <small>{a.authorName} · {timeAgo(a.createdAt)}</small>
              </div>
            ))}
          </div>
        </div>

        <aside className="overview-side">
          <div className="card">
            <div className="card-header"><h3>Quick actions</h3></div>
            <div className="quick-actions">
              {quickLinks.map((q) => <Link key={q.to} to={q.to} className="quick-action"><q.icon size={18} /><span>{q.label}</span><ArrowRight size={14} /></Link>)}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3>Your profile</h3><Link to={`/${role}/profile`}>Edit</Link></div>
            <div className="profile-mini">
              <Avatar name={user.name} color={user.avatarColor} size={52} />
              <div><strong>{user.name}</strong><small>{user.email}</small></div>
            </div>
            <dl className="profile-dl">
              <div><dt>Role</dt><dd>{roleLabel(role)}</dd></div>
              <div><dt>Student ID</dt><dd>{user.studentId}</dd></div>
              <div><dt>Batch / Section</dt><dd>{user.batch} / {user.section}</dd></div>
              {user.position && <div><dt>Position</dt><dd>{user.position}</dd></div>}
            </dl>
          </div>
          <div className="card">
            <div className="card-header"><h3>Recent activity</h3><Activity size={16} /></div>
            {activity.length === 0 ? <p className="muted">No recent activity.</p> : (
              <ul className="activity-list">{activity.map((a) => <li key={a.id}><span>{a.action}</span><small>{timeAgo(a.createdAt)}</small></li>)}</ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
