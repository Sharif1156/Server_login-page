import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { DEMO_ACCOUNTS } from '../shared/demo.js';
import type { Application, Announcement, Certificate, Classmate, ClubEvent, Course, User } from '../shared/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = process.env.DB_PATH || path.join(dataDir, 'nubcc-demo.sqlite');

export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL CHECK(role IN ('member','cr','executive')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  batch TEXT NOT NULL DEFAULT '',
  semester INTEGER NOT NULL DEFAULT 1,
  section TEXT NOT NULL DEFAULT 'A',
  blood_group TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'approved',
  membership_id TEXT NOT NULL DEFAULT '',
  joined_at TEXT NOT NULL,
  skills TEXT NOT NULL DEFAULT '',
  experience TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  github TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT '#0d6efd'
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TEXT NOT NULL,
  location TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  member_price INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 100,
  cover TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'upcoming'
);
CREATE TABLE IF NOT EXISTS event_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  UNIQUE(event_id, user_id)
);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL CHECK(role IN ('member','cr','executive')),
  name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  batch TEXT NOT NULL DEFAULT '',
  semester INTEGER NOT NULL DEFAULT 1,
  section TEXT NOT NULL DEFAULT 'A',
  blood_group TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL DEFAULT '',
  panel_year TEXT NOT NULL DEFAULT '',
  tenure_start TEXT NOT NULL DEFAULT '',
  skills TEXT NOT NULL DEFAULT '',
  experience TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  github TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TEXT NOT NULL,
  reviewed_at TEXT,
  review_note TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all',
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS classmates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cr_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  section TEXT NOT NULL DEFAULT 'A',
  attendance INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  track TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  duration TEXT NOT NULL,
  lessons INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#0d6efd'
);
CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  enrolled_at TEXT NOT NULL,
  UNIQUE(course_id, user_id)
);
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`);

type Row = Record<string, any>;

export function all<T>(sql: string, ...params: any[]): T[] {
  return db.prepare(sql).all(...params) as T[];
}
export function get<T>(sql: string, ...params: any[]): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}
export function run(sql: string, ...params: any[]) {
  return db.prepare(sql).run(...params);
}

const mapUser = (r: Row): User => ({
  id: r.id, role: r.role, name: r.name, email: r.email, studentId: r.student_id,
  phone: r.phone, batch: r.batch, semester: r.semester, section: r.section,
  bloodGroup: r.blood_group, position: r.position, status: r.status,
  membershipId: r.membership_id, joinedAt: r.joined_at, skills: r.skills,
  experience: r.experience, address: r.address, facebook: r.facebook,
  linkedin: r.linkedin, github: r.github, avatarColor: r.avatar_color,
});

const mapEvent = (r: Row): ClubEvent => ({
  id: r.id, title: r.title, type: r.type, description: r.description,
  eventDate: r.event_date, location: r.location, price: r.price,
  memberPrice: r.member_price, capacity: r.capacity, cover: r.cover,
  status: r.status, registered: r.registered ?? 0,
});

const mapApplication = (r: Row): Application => ({
  id: r.id, role: r.role, name: r.name, studentId: r.student_id, email: r.email,
  phone: r.phone, batch: r.batch, semester: r.semester, section: r.section,
  bloodGroup: r.blood_group, position: r.position, panelYear: r.panel_year,
  tenureStart: r.tenure_start, skills: r.skills, experience: r.experience,
  address: r.address, facebook: r.facebook, linkedin: r.linkedin, github: r.github,
  status: r.status, submittedAt: r.submitted_at, reviewedAt: r.reviewed_at,
  reviewNote: r.review_note,
});

const mapAnnouncement = (r: Row): Announcement => ({
  id: r.id, title: r.title, body: r.body, audience: r.audience,
  priority: r.priority, createdAt: r.created_at, authorName: r.author_name || 'NUBCC Committee',
});

const mapClassmate = (r: Row): Classmate => ({
  id: r.id, crId: r.cr_id, name: r.name, studentId: r.student_id,
  email: r.email, phone: r.phone, section: r.section, attendance: r.attendance,
});

const mapCourse = (r: Row): Course => ({
  id: r.id, title: r.title, track: r.track, description: r.description,
  level: r.level, price: r.price, duration: r.duration, lessons: r.lessons,
  color: r.color, progress: r.progress ?? undefined, enrolled: r.enrolled !== undefined ? Boolean(r.enrolled) : undefined,
});

const mapCertificate = (r: Row): Certificate => ({
  id: r.id, userId: r.user_id, title: r.title, issuedAt: r.issued_at, code: r.code,
});

export const queries = {
  userById: (id: number) => {
    const r = get<Row>('SELECT * FROM users WHERE id = ?', id);
    return r ? mapUser(r) : undefined;
  },
  userByLogin: (role: string, identifier: string) => {
    const r = get<Row>('SELECT * FROM users WHERE role = ? AND (lower(email) = lower(?) OR lower(student_id) = lower(?))', role, identifier, identifier);
    return r ? { user: mapUser(r), passwordHash: r.password_hash as string } : undefined;
  },
  users: (role?: string) => all<Row>(role ? 'SELECT * FROM users WHERE role = ? ORDER BY name' : 'SELECT * FROM users ORDER BY name', ...(role ? [role] : [])).map(mapUser),
  events: (userId?: number) => all<Row>(`
    SELECT e.*, (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) AS registered
    ${userId ? ', (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.user_id = ?) AS is_registered' : ''}
    FROM events e ORDER BY e.event_date ${userId ? 'ASC' : 'DESC'}`, ...(userId ? [userId] : [])).map((r) => ({ ...mapEvent(r), isRegistered: userId ? Boolean(r.is_registered) : undefined })),
  eventById: (id: number, userId?: number) => {
    const r = get<Row>(`SELECT e.*, (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) AS registered
      ${userId ? ', (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id AND er.user_id = ?) AS is_registered' : ''}
      FROM events e WHERE e.id = ?`, ...(userId ? [userId, id] : [id]));
    return r ? { ...mapEvent(r), isRegistered: userId ? Boolean(r.is_registered) : undefined } : undefined;
  },
  applications: (status?: string, role?: string) => {
    const clauses: string[] = []; const params: any[] = [];
    if (status) { clauses.push('status = ?'); params.push(status); }
    if (role) { clauses.push('role = ?'); params.push(role); }
    return all<Row>(`SELECT * FROM applications ${clauses.length ? 'WHERE ' + clauses.join(' AND ') : ''} ORDER BY submitted_at DESC`, ...params).map(mapApplication);
  },
  applicationById: (id: number) => {
    const r = get<Row>('SELECT * FROM applications WHERE id = ?', id);
    return r ? mapApplication(r) : undefined;
  },
  announcements: (role?: string) => all<Row>(`
    SELECT a.*, u.name AS author_name FROM announcements a LEFT JOIN users u ON u.id = a.author_id
    ${role ? "WHERE a.audience = 'all' OR a.audience = ?" : ''}
    ORDER BY a.created_at DESC`, ...(role ? [role] : [])).map(mapAnnouncement),
  classmates: (crId: number) => all<Row>('SELECT * FROM classmates WHERE cr_id = ? ORDER BY name', crId).map(mapClassmate),
  courses: (userId?: number) => all<Row>(`
    SELECT c.* ${userId ? ', e.progress, CASE WHEN e.id IS NULL THEN 0 ELSE 1 END AS enrolled' : ''}
    FROM courses c ${userId ? 'LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = ?' : ''}
    ORDER BY c.id`, ...(userId ? [userId] : [])).map(mapCourse),
  certificates: (userId: number) => all<Row>('SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC', userId).map(mapCertificate),
  activity: (userId: number) => all<{ id: number; action: string; createdAt: string }>('SELECT id, action, created_at AS createdAt FROM activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 8', userId),
  publicCrs: () => {
    const users = all<Row>("SELECT * FROM users WHERE role = 'cr' AND status = 'approved'").map((r) => ({
      id: r.id, name: r.name, batch: r.batch, semester: r.semester, section: r.section,
      email: r.email, phone: r.phone, github: r.github, linkedin: r.linkedin, facebook: r.facebook,
      avatarColor: r.avatar_color, source: 'user' as const,
    }));
    const apps = all<Row>("SELECT * FROM applications WHERE role = 'cr' AND status = 'approved'").map((r) => ({
      id: 10000 + r.id, name: r.name, batch: r.batch, semester: r.semester, section: r.section,
      email: r.email, phone: r.phone, github: r.github, linkedin: r.linkedin, facebook: r.facebook,
      avatarColor: '#0d6efd', source: 'application' as const,
    }));
    return [...users, ...apps];
  },
  publicExecutives: () => {
    const users = all<Row>("SELECT * FROM users WHERE role = 'executive' AND status = 'approved'").map((r) => ({
      id: r.id, name: r.name, position: r.position, semester: r.semester, section: r.section,
      batch: r.batch, email: r.email, github: r.github, linkedin: r.linkedin, facebook: r.facebook,
      avatarColor: r.avatar_color, panelYear: '2026-2027', source: 'user' as const,
    }));
    const apps = all<Row>("SELECT * FROM applications WHERE role = 'executive' AND status = 'approved'").map((r) => ({
      id: 10000 + r.id, name: r.name, position: r.position, semester: r.semester, section: r.section,
      batch: r.batch, email: r.email, github: r.github, linkedin: r.linkedin, facebook: r.facebook,
      avatarColor: '#0d6efd', panelYear: r.panel_year || '2026-2027', source: 'application' as const,
    }));
    return [...users, ...apps];
  },
};

export function logActivity(userId: number | null, action: string) {
  run('INSERT INTO activity (user_id, action, created_at) VALUES (?, ?, ?)', userId, action, new Date().toISOString());
}

export function seedDatabase(force = false) {
  const count = get<{ n: number }>('SELECT COUNT(*) AS n FROM users')!.n;
  if (count > 0 && !force) return;
  db.exec('BEGIN');
  try {
    if (force) {
      for (const t of ['activity', 'messages', 'certificates', 'enrollments', 'courses', 'classmates', 'announcements', 'event_registrations', 'events', 'applications', 'users']) {
        db.exec(`DELETE FROM ${t}; DELETE FROM sqlite_sequence WHERE name = '${t}';`);
      }
    }
    const now = new Date().toISOString();
    const insertUser = db.prepare(`INSERT INTO users
      (role,name,email,student_id,password_hash,phone,batch,semester,section,blood_group,position,status,membership_id,joined_at,skills,experience,address,github,avatar_color)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const hashes = Object.fromEntries(DEMO_ACCOUNTS.map((a) => [a.role, bcrypt.hashSync(a.password, 10)]));
    insertUser.run('member', 'Ayesha Rahman', 'ayesha@demo.nubcc.test', 'NUB-2026-001', hashes.member, '+8801700000001', '62', 6, 'A', 'B+', '', 'approved', 'NUBCC-M-2026-001', '2026-01-15T09:00:00.000Z', 'React, TypeScript, UI design', 'Volunteered at NUBCC CSE Day 2025', 'Dhaka, Bangladesh', 'https://github.com/demo-ayesha', '#0d6efd');
    insertUser.run('cr', 'Tanvir Ahmed', 'cr@demo.nubcc.test', 'NUB-2026-002', hashes.cr, '+8801700000002', '62', 6, 'A', 'O+', 'Class Representative', 'approved', 'NUBCC-CR-2026-002', '2026-01-20T09:00:00.000Z', 'Communication, coordination', 'CR for Batch 62 Section A', 'Dhaka, Bangladesh', 'https://github.com/demo-tanvir', '#0a2540');
    insertUser.run('executive', 'Nusrat Jahan', 'executive@demo.nubcc.test', 'NUB-2026-003', hashes.executive, '+8801700000003', '61', 8, 'B', 'A+', 'General Secretary', 'approved', 'NUBCC-E-2026-003', '2025-12-01T09:00:00.000Z', 'Leadership, event management, public speaking', 'Organized 12+ club events', 'Dhaka, Bangladesh', 'https://github.com/demo-nusrat', '#f6b73c');
    // Extra demo members for executive directory
    const extraMembers = [
      ['Rafiul Islam', 'NUB-2026-004', '62', 6, 'A'], ['Sadia Afrin', 'NUB-2026-005', '63', 5, 'B'],
      ['Mehedi Hasan', 'NUB-2026-006', '64', 4, 'C'], ['Farhana Akter', 'NUB-2026-007', '65', 3, 'A'],
      ['Imran Hossain', 'NUB-2026-008', '66', 2, 'D'], ['Tasnim Jahan', 'NUB-2026-009', '67', 1, 'B'],
    ];
    for (const [name, sid, batch, sem, sec] of extraMembers) {
      insertUser.run('member', name, `${String(sid).toLowerCase()}@demo.nubcc.test`, sid, hashes.member, '+88017000000' + String(sid).slice(-2), batch, sem, sec, '', '', 'approved', `NUBCC-M-2026-${String(sid).slice(-3)}`, now, '', '', 'Dhaka, Bangladesh', '', '#0d6efd');
    }

    const insertEvent = db.prepare(`INSERT INTO events (title,type,description,event_date,location,price,member_price,capacity,cover,status) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    insertEvent.run('NUB CSE Day 2026', 'other', 'Showcase your technical skills, creativity and innovation. Projects may include robotics, IoT, software, hardware, cybersecurity and more. Attractive prizes for the best and most innovative projects.', '2026-12-12T10:00:00+06:00', 'NUB Permanent Campus', 500, 300, 300, '/images/event-cse-day.jpg', 'upcoming');
    insertEvent.run('Saint Martin Tour 2026', 'social', 'An unforgettable journey with NUBCC to Saint Martin’s Island. Blue sea, sandy beaches, sea breeze, sunsets and quality time with friends. A perfect break from academic life.', '2026-12-18T18:00:00+06:00', 'Saint Martin', 10999, 9999, 60, '/images/event-tour.jpg', 'upcoming');
    insertEvent.run('Intro to AI & Machine Learning', 'workshop', 'Hands-on workshop covering ML fundamentals, Python tooling and building your first model. Bring a laptop. Mentors from the NUBCC AI track will guide you.', '2026-11-14T15:00:00+06:00', 'NUB Lab 3', 0, 0, 80, '/images/event-workshop.jpg', 'upcoming');
    insertEvent.run('Programming Contest Bootcamp', 'contest', 'A practice contest and bootcamp for upcoming inter-university programming contests. Topics: data structures, algorithms, problem solving strategies and team coordination.', '2026-11-21T10:00:00+06:00', 'NUB Lab 1', 200, 100, 120, '/images/event-workshop.jpg', 'upcoming');
    insertEvent.run('Web Development Study Circle', 'meetup', 'Weekly study circle for front-end and back-end learners. Build a small project together, review code and share resources. All semesters welcome.', '2026-11-08T16:00:00+06:00', 'NUB Room 402', 0, 0, 40, '/images/event-workshop.jpg', 'upcoming');
    insertEvent.run('NUBCC Excursion III.0', 'social', 'A day-long winter adventure with friends, activities, food and live music. Includes exclusive NUBCC jersey.', '2025-11-29T08:00:00+06:00', 'Rajendra ECO Resort', 1549, 1399, 150, '/images/event-tour.jpg', 'past');
    insertEvent.run('C Programming Course', 'workshop', 'NUBCC Presents: C Programming Course — from fundamentals to problem solving.', '2026-09-20T23:59:00+06:00', 'NUB Labs', 599, 499, 100, '/images/event-workshop.jpg', 'past');

    const insertApp = db.prepare(`INSERT INTO applications
      (role,name,student_id,email,phone,batch,semester,section,blood_group,position,panel_year,tenure_start,skills,experience,address,status,submitted_at,reviewed_at,review_note)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const app = (role: string, name: string, sid: string, batch: string, sem: number, sec: string, status: string, position = '', daysAgo = 1) => {
      const submitted = new Date(Date.now() - daysAgo * 86400000).toISOString();
      insertApp.run(role, name, sid, `${sid.toLowerCase()}@demo.nubcc.test`, '+8801700000' + sid.slice(-3), batch, sem, sec, 'B+', position, role === 'executive' ? '2026-2027' : '', role === 'executive' ? '2026-11-01' : '', 'Demo skills', 'Demo experience', 'Dhaka, Bangladesh', status, submitted, status === 'pending' ? null : submitted, status === 'approved' ? 'Verified demo application.' : status === 'rejected' ? 'Incomplete demo details.' : '');
    };
    app('cr', 'Pratyay Kumar Biswas', 'NUB-2025-101', '62', 8, 'A', 'approved');
    app('cr', 'Md. Shakil Rana', 'NUB-2025-102', '62', 8, 'C', 'approved');
    app('cr', 'Mohammad Sajid', 'NUB-2024-103', '66', 7, 'A', 'approved');
    app('cr', 'Mahadi Hasan Shovo', 'NUB-2024-104', '68', 5, 'A', 'approved');
    app('cr', 'Asaduzzaman Noor', 'NUB-2023-105', '69', 4, 'A', 'approved');
    app('cr', 'Raisul Islam', 'NUB-2023-106', '70', 3, 'A', 'approved');
    app('cr', 'Sompa Akter', 'NUB-2023-107', '70', 3, 'B', 'approved');
    app('cr', 'Joy Sutradhar', 'NUB-2023-108', '69', 4, 'B', 'approved');
    app('executive', 'Atik Hasan', 'NUB-2022-201', '60', 9, 'B', 'approved', 'Senior Secretary of Graphics Design', 30);
    app('executive', 'Md. Hanif Molla', 'NUB-2022-202', '59', 10, 'A', 'approved', 'Vice President', 30);
    app('executive', 'Esmail Hossain Tasin', 'NUB-2022-203', '60', 9, 'B', 'approved', 'Treasurer (Cash)', 30);
    app('executive', 'Md Sabbir Hossain', 'NUB-2023-204', '63', 6, 'C', 'approved', 'Joint Secretary', 30);
    app('executive', 'Afia Raisa', 'NUB-2022-205', '59', 10, 'H', 'approved', 'Senior Vice President', 30);
    app('executive', 'Hamid Bakhtiyar Nowsad', 'NUB-2024-206', '64', 5, 'D', 'approved', 'Programming Secretary', 30);
    app('member', 'Nafis Ahmed', 'NUB-2026-301', '67', 1, 'A', 'pending', '', 0);
    app('cr', 'Tahmid Hasan', 'NUB-2026-302', '67', 1, 'B', 'pending', '', 1);
    app('executive', 'Rumana Akter', 'NUB-2025-303', '65', 4, 'C', 'pending', 'Assistant Cultural Secretary', 2);
    app('member', 'Sabbir Rahman', 'NUB-2026-304', '68', 1, 'D', 'pending', '', 3);
    app('cr', 'Mithila Parvin', 'NUB-2025-305', '66', 3, 'C', 'rejected', '', 5);

    const insertAnn = db.prepare('INSERT INTO announcements (title,body,audience,priority,created_at,author_id) VALUES (?,?,?,?,?,?)');
    insertAnn.run('Welcome to the demo portals', 'This is a local demo clone of the NUBCC member, CR and executive portals. All data is fictional. Explore freely — changes are stored only in this demo database.', 'all', 'important', new Date(Date.now() - 2 * 86400000).toISOString(), 3);
    insertAnn.run('CSE Day 2026 project submission', 'Submit your CSE Day project abstract by December 1. Teams of up to 4 members. Robotics, IoT, software and cybersecurity categories are open.', 'all', 'normal', new Date(Date.now() - 86400000).toISOString(), 3);
    insertAnn.run('CR meeting — Batch 62', 'All Batch 62 CRs: please collect event registration counts from your sections before Friday. Meeting at Room 402, 3 PM.', 'cr', 'important', new Date(Date.now() - 3 * 86400000).toISOString(), 3);
    insertAnn.run('Member study circle schedule', 'Web development study circle meets every Sunday at 4 PM. Bring your laptop and a project idea. Beginners welcome.', 'member', 'normal', new Date(Date.now() - 4 * 86400000).toISOString(), 3);
    insertAnn.run('Executive committee sync', 'Weekly committee sync on Thursday at 5 PM. Agenda: CSE Day logistics, tour payments, and new application reviews.', 'executive', 'normal', new Date(Date.now() - 5 * 86400000).toISOString(), 3);

    const cr = queries.userByLogin('cr', 'cr@demo.nubcc.test')!.user;
    const insertClassmate = db.prepare('INSERT INTO classmates (cr_id,name,student_id,email,phone,section,attendance) VALUES (?,?,?,?,?,?,?)');
    const classmates = [
      ['Ayesha Rahman', 'NUB-2026-001', 92], ['Rafiul Islam', 'NUB-2026-004', 85], ['Sadia Afrin', 'NUB-2026-005', 78],
      ['Mehedi Hasan', 'NUB-2026-006', 88], ['Farhana Akter', 'NUB-2026-007', 95], ['Imran Hossain', 'NUB-2026-008', 70],
      ['Tasnim Jahan', 'NUB-2026-009', 82], ['Nafis Ahmed', 'NUB-2026-301', 65], ['Sabbir Rahman', 'NUB-2026-304', 74],
      ['Rumana Akter', 'NUB-2025-303', 90],
    ];
    for (const [name, sid, att] of classmates) insertClassmate.run(cr.id, name, sid, `${String(sid).toLowerCase()}@demo.nubcc.test`, '+8801700000' + String(sid).slice(-3), 'A', att);

    const insertCourse = db.prepare('INSERT INTO courses (title,track,description,level,price,duration,lessons,color) VALUES (?,?,?,?,?,?,?,?)');
    insertCourse.run('Advanced C Programming', 'Starter', 'Master C fundamentals, pointers, memory and problem solving.', 'Beginner', 599, '8 weeks', 24, '#0d6efd');
    insertCourse.run('Front-end Web Applications', 'Advanced', 'HTML, CSS, JavaScript and React — build responsive web apps.', 'Intermediate', 999, '10 weeks', 32, '#0a2540');
    insertCourse.run('PHP & Laravel Framework', 'Advanced', 'Server-side web development with PHP and Laravel.', 'Intermediate', 999, '10 weeks', 30, '#7c3aed');
    insertCourse.run('AI & Machine Learning', 'Premium', 'From ML fundamentals to neural networks and real projects.', 'Advanced', 1999, '12 weeks', 36, '#059669');
    insertCourse.run('Cyber Security Fundamentals', 'Premium', 'Security basics, threat modeling and safe computing practices.', 'Intermediate', 1999, '10 weeks', 28, '#dc2626');
    insertCourse.run('Database Management', 'Track 02', 'Relational databases, SQL, normalization and query optimization.', 'Intermediate', 999, '8 weeks', 24, '#d97706');
    insertCourse.run('Flutter Mobile Apps', 'Advanced', 'Build cross-platform mobile apps with Flutter and Dart.', 'Intermediate', 999, '10 weeks', 30, '#0891b2');
    insertCourse.run('MERN Stack Development', 'Advanced', 'MongoDB, Express, React and Node — full-stack JavaScript.', 'Advanced', 999, '12 weeks', 40, '#16a34a');

    const member = queries.userByLogin('member', 'NUB-2026-001')!.user;
    run('INSERT INTO enrollments (course_id,user_id,progress,enrolled_at) VALUES (?,?,?,?)', 2, member.id, 65, '2026-08-01T09:00:00.000Z');
    run('INSERT INTO enrollments (course_id,user_id,progress,enrolled_at) VALUES (?,?,?,?)', 4, member.id, 30, '2026-09-10T09:00:00.000Z');
    run('INSERT INTO certificates (user_id,title,issued_at,code) VALUES (?,?,?,?)', member.id, 'C Programming Course — Completion', '2026-10-01T09:00:00.000Z', 'NUBCC-CERT-2026-0001');
    run('INSERT INTO event_registrations (event_id,user_id,registered_at) VALUES (?,?,?)', 1, member.id, new Date(Date.now() - 86400000).toISOString());
    run('INSERT INTO event_registrations (event_id,user_id,registered_at) VALUES (?,?,?)', 3, member.id, new Date(Date.now() - 2 * 86400000).toISOString());
    // Seed some registrations for capacity realism
    for (let i = 4; i <= 9; i++) run('INSERT OR IGNORE INTO event_registrations (event_id,user_id,registered_at) VALUES (?,?,?)', 1, i, now);
    logActivity(member.id, 'Joined NUBCC as a member');
    logActivity(member.id, 'Registered for NUB CSE Day 2026');
    logActivity(cr.id, 'Updated class attendance records');
    logActivity(3, 'Reviewed 3 new applications');
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

seedDatabase();
