import express from 'express';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { createServer as createHttpServer } from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, get, run, queries, logActivity, seedDatabase } from './db.js';
import { demoAccount } from '../shared/demo.js';
import type { Role } from '../shared/types.js';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    role?: Role;
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 3000);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '128kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (isProd) res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
});

app.use(session({
  name: 'nafiit_demo_sid',
  secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 8 * 60 * 60 * 1000,
  },
}));

// Basic same-origin guard for mutating API requests.
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin) {
    try {
      const allowed = `${req.protocol}://${req.get('host')}`;
      if (new URL(origin).origin !== allowed) {
        return res.status(403).json({ error: 'Cross-origin request blocked.' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid origin.' });
    }
  }
  next();
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many attempts. Try again later.' } });
const writeLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many requests. Slow down.' } });

function currentUser(req: express.Request) {
  return req.session.userId ? queries.userById(req.session.userId) : undefined;
}
function requireAuth(roles?: Role[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: 'Please sign in with a demo account.' });
    if (roles && !roles.includes(user.role)) return res.status(403).json({ error: 'This portal is not available for your role.' });
    (req as any).user = user;
    next();
  };
}
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- Auth ----------
const loginSchema = z.object({
  role: z.enum(['member', 'cr', 'executive']),
  identifier: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(120),
  remember: z.boolean().optional(),
});

app.post('/api/auth/login', authLimiter, asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Enter your demo ID/email and password.' });
  const { role, identifier, password, remember } = parsed.data;
  const demo = demoAccount(role);
  // Demo-only: reject anything that is not the advertised sample account.
  if (identifier.toLowerCase() !== demo.identifier.toLowerCase()) {
    return res.status(401).json({ error: 'Demo only: use the sample account shown on this page. Real Nafi IT credentials are not accepted.' });
  }
  const record = queries.userByLogin(role, identifier);
  if (!record || !bcrypt.compareSync(password, record.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect demo password. Use the sample password shown on this page.' });
  }
  await new Promise<void>((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));
  req.session.userId = record.user.id;
  req.session.role = record.user.role;
  req.session.cookie.maxAge = remember ? 7 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  await new Promise<void>((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));
  logActivity(record.user.id, `Signed in to the ${role} demo portal`);
  res.json({ user: record.user, demo: true });
}));

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('nafiit_demo_sid');
    res.json({ ok: true });
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: currentUser(req) || null, demo: true });
});

// ---------- Public ----------
app.get('/api/public/stats', (_req, res) => {
  const members = get<{ n: number }>("SELECT COUNT(*) AS n FROM users WHERE role='member'")!.n;
  const executives = queries.publicExecutives().length;
  const crs = queries.publicCrs().length;
  const courses = get<{ n: number }>('SELECT COUNT(*) AS n FROM courses')!.n;
  const upcomingEvents = get<{ n: number }>("SELECT COUNT(*) AS n FROM events WHERE status='upcoming'")!.n;
  res.json({ stats: { members, executives, crs, courses, upcomingEvents } });
});
app.get('/api/public/events', (req, res) => res.json({ events: queries.events(currentUser(req)?.id) }));
app.get('/api/public/events/:id', (req, res) => {
  const event = queries.eventById(Number(req.params.id), currentUser(req)?.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  res.json({ event });
});
app.get('/api/public/executives', (_req, res) => res.json({ people: queries.publicExecutives() }));
app.get('/api/public/crs', (_req, res) => res.json({ people: queries.publicCrs() }));
app.get('/api/public/courses', (_req, res) => res.json({ courses: queries.courses() }));

const applicationSchema = z.object({
  role: z.enum(['member', 'cr', 'executive']),
  name: z.string().trim().min(2).max(100),
  studentId: z.string().trim().min(3).max(40),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().min(6).max(25),
  batch: z.string().trim().min(1).max(30),
  semester: z.coerce.number().int().min(1).max(12),
  section: z.string().trim().min(1).max(10),
  bloodGroup: z.string().trim().max(5).optional().default(''),
  position: z.string().trim().max(100).optional().default(''),
  panelYear: z.string().trim().max(20).optional().default(''),
  tenureStart: z.string().trim().max(20).optional().default(''),
  skills: z.string().trim().max(500).optional().default(''),
  experience: z.string().trim().max(1000).optional().default(''),
  address: z.string().trim().max(300).optional().default(''),
  facebook: z.string().trim().max(200).optional().default(''),
  linkedin: z.string().trim().max(200).optional().default(''),
  github: z.string().trim().max(200).optional().default(''),
  confirm: z.literal(true),
}).strict();

app.post('/api/public/applications', writeLimiter, (req, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please complete all required fields with fictional demo details. Passwords and payment details are not accepted.' });
  const a = parsed.data;
  if (a.role === 'executive' && !a.position) return res.status(400).json({ error: 'Please choose a position.' });
  const result = run(`INSERT INTO applications
    (role,name,student_id,email,phone,batch,semester,section,blood_group,position,panel_year,tenure_start,skills,experience,address,facebook,linkedin,github,status,submitted_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'pending', ?)`,
    a.role, a.name, a.studentId, a.email, a.phone, a.batch, a.semester, a.section, a.bloodGroup,
    a.position, a.panelYear, a.tenureStart, a.skills, a.experience, a.address, a.facebook, a.linkedin, a.github, new Date().toISOString());
  res.status(201).json({ ok: true, id: Number(result.lastInsertRowid), status: 'pending', message: 'Demo application submitted. No real account or payment was created.' });
});

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().min(2).max(150),
  body: z.string().trim().min(5).max(2000),
}).strict();
app.post('/api/public/contact', writeLimiter, (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please complete the contact form.' });
  const c = parsed.data;
  run('INSERT INTO messages (name,email,subject,body,created_at) VALUES (?,?,?,?,?)', c.name, c.email, c.subject, c.body, new Date().toISOString());
  res.json({ ok: true, message: 'Demo message saved locally. No email was sent.' });
});

// ---------- Portal ----------
app.get('/api/portal/announcements', requireAuth(), (req, res) => {
  const user = (req as any).user;
  res.json({ announcements: queries.announcements(user.role) });
});
app.get('/api/portal/events', requireAuth(), (req, res) => {
  const user = (req as any).user;
  res.json({ events: queries.events(user.id) });
});
app.get('/api/portal/activity', requireAuth(), (req, res) => {
  const user = (req as any).user;
  res.json({ activity: queries.activity(user.id) });
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(25).optional(),
  batch: z.string().trim().max(30).optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
  section: z.string().trim().max(10).optional(),
  bloodGroup: z.string().trim().max(5).optional(),
  skills: z.string().trim().max(500).optional(),
  experience: z.string().trim().max(1000).optional(),
  address: z.string().trim().max(300).optional(),
  facebook: z.string().trim().max(200).optional(),
  linkedin: z.string().trim().max(200).optional(),
  github: z.string().trim().max(200).optional(),
}).strict();

app.patch('/api/portal/profile', requireAuth(), (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid profile fields.' });
  const user = (req as any).user;
  const map: Record<string, string> = {
    name: 'name', phone: 'phone', batch: 'batch', semester: 'semester', section: 'section',
    bloodGroup: 'blood_group', skills: 'skills', experience: 'experience', address: 'address',
    facebook: 'facebook', linkedin: 'linkedin', github: 'github',
  };
  const entries = Object.entries(parsed.data).filter(([, v]) => v !== undefined);
  if (!entries.length) return res.status(400).json({ error: 'Nothing to update.' });
  const sets = entries.map(([k]) => `${map[k]} = ?`);
  const values = entries.map(([, v]) => v);
  run(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, ...values, user.id);
  logActivity(user.id, 'Updated profile');
  res.json({ user: queries.userById(user.id) });
});

// Member event registration
app.post('/api/portal/events/:id/register', requireAuth(['member']), writeLimiter, (req, res) => {
  const user = (req as any).user;
  const event = queries.eventById(Number(req.params.id));
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  if (event.status !== 'upcoming') return res.status(400).json({ error: 'This event has ended.' });
  if (event.registered >= event.capacity) return res.status(400).json({ error: 'This event is full.' });
  try {
    run('INSERT INTO event_registrations (event_id,user_id,registered_at) VALUES (?,?,?)', event.id, user.id, new Date().toISOString());
  } catch {
    return res.status(409).json({ error: 'You are already registered for this event.' });
  }
  logActivity(user.id, `Registered for ${event.title}`);
  res.json({ ok: true, event: queries.eventById(event.id, user.id) });
});
app.delete('/api/portal/events/:id/register', requireAuth(['member']), (req, res) => {
  const user = (req as any).user;
  const event = queries.eventById(Number(req.params.id));
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  run('DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?', event.id, user.id);
  logActivity(user.id, `Cancelled registration for ${event.title}`);
  res.json({ ok: true, event: queries.eventById(event.id, user.id) });
});

// Courses / certificates
app.get('/api/portal/courses', requireAuth(), (req, res) => {
  const user = (req as any).user;
  res.json({ courses: queries.courses(user.role === 'member' ? user.id : undefined) });
});
app.post('/api/portal/courses/:id/enroll', requireAuth(['member']), writeLimiter, (req, res) => {
  const user = (req as any).user;
  const course = queries.courses().find((c) => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  try {
    run('INSERT INTO enrollments (course_id,user_id,progress,enrolled_at) VALUES (?,?,0,?)', course.id, user.id, new Date().toISOString());
  } catch {
    return res.status(409).json({ error: 'Already enrolled.' });
  }
  logActivity(user.id, `Enrolled in ${course.title}`);
  res.json({ ok: true, courses: queries.courses(user.id) });
});
app.post('/api/portal/courses/:id/progress', requireAuth(['member']), (req, res) => {
  const user = (req as any).user;
  const progress = z.coerce.number().int().min(0).max(100).safeParse(req.body?.progress);
  if (!progress.success) return res.status(400).json({ error: 'Progress must be 0–100.' });
  const result = run('UPDATE enrollments SET progress = ? WHERE course_id = ? AND user_id = ?', progress.data, Number(req.params.id), user.id);
  if (!result.changes) return res.status(404).json({ error: 'Enrollment not found.' });
  res.json({ ok: true, courses: queries.courses(user.id) });
});
app.get('/api/portal/certificates', requireAuth(['member']), (req, res) => {
  const user = (req as any).user;
  res.json({ certificates: queries.certificates(user.id) });
});

// CR classmates
app.get('/api/portal/classmates', requireAuth(['cr']), (req, res) => {
  const user = (req as any).user;
  res.json({ classmates: queries.classmates(user.id) });
});
app.patch('/api/portal/classmates/:id', requireAuth(['cr']), (req, res) => {
  const user = (req as any).user;
  const attendance = z.coerce.number().int().min(0).max(100).safeParse(req.body?.attendance);
  if (!attendance.success) return res.status(400).json({ error: 'Attendance must be 0–100.' });
  const result = run('UPDATE classmates SET attendance = ? WHERE id = ? AND cr_id = ?', attendance.data, Number(req.params.id), user.id);
  if (!result.changes) return res.status(404).json({ error: 'Classmate not found.' });
  logActivity(user.id, 'Updated class attendance');
  res.json({ ok: true, classmates: queries.classmates(user.id) });
});

// Executive management
app.get('/api/portal/applications', requireAuth(['executive']), (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  res.json({ applications: queries.applications(status, role) });
});
app.patch('/api/portal/applications/:id', requireAuth(['executive']), (req, res) => {
  const schema = z.object({ status: z.enum(['pending', 'approved', 'rejected']), note: z.string().trim().max(500).optional().default('') }).strict();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid review.' });
  const app = queries.applicationById(Number(req.params.id));
  if (!app) return res.status(404).json({ error: 'Application not found.' });
  const user = (req as any).user;
  run('UPDATE applications SET status = ?, reviewed_at = ?, review_note = ? WHERE id = ?', parsed.data.status, new Date().toISOString(), parsed.data.note, app.id);
  logActivity(user.id, `${parsed.data.status === 'approved' ? 'Approved' : parsed.data.status === 'rejected' ? 'Rejected' : 'Reopened'} application #${app.id} (${app.name})`);
  res.json({ ok: true, application: queries.applicationById(app.id) });
});
app.get('/api/portal/members', requireAuth(['executive']), (_req, res) => res.json({ members: queries.users('member') }));
app.get('/api/portal/crs', requireAuth(['executive']), (_req, res) => res.json({ people: queries.publicCrs() }));

const announcementSchema = z.object({
  title: z.string().trim().min(3).max(150),
  body: z.string().trim().min(5).max(2000),
  audience: z.enum(['all', 'member', 'cr', 'executive']).default('all'),
  priority: z.enum(['normal', 'important']).default('normal'),
}).strict();
app.post('/api/portal/announcements', requireAuth(['executive']), writeLimiter, (req, res) => {
  const parsed = announcementSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid announcement.' });
  const user = (req as any).user;
  const a = parsed.data;
  const result = run('INSERT INTO announcements (title,body,audience,priority,created_at,author_id) VALUES (?,?,?,?,?,?)', a.title, a.body, a.audience, a.priority, new Date().toISOString(), user.id);
  logActivity(user.id, `Published announcement: ${a.title}`);
  res.status(201).json({ ok: true, id: Number(result.lastInsertRowid), announcements: queries.announcements() });
});
app.delete('/api/portal/announcements/:id', requireAuth(['executive']), (req, res) => {
  run('DELETE FROM announcements WHERE id = ?', Number(req.params.id));
  res.json({ ok: true, announcements: queries.announcements() });
});

const eventSchema = z.object({
  title: z.string().trim().min(3).max(150),
  type: z.enum(['workshop', 'seminar', 'contest', 'meetup', 'social', 'other']),
  description: z.string().trim().min(10).max(3000),
  eventDate: z.string().trim().min(5).max(40),
  location: z.string().trim().min(2).max(150),
  price: z.coerce.number().int().min(0).max(1000000),
  memberPrice: z.coerce.number().int().min(0).max(1000000),
  capacity: z.coerce.number().int().min(1).max(10000),
  cover: z.string().trim().max(200).optional().default('/images/event-workshop.jpg'),
  status: z.enum(['upcoming', 'past']).default('upcoming'),
}).strict();
app.post('/api/portal/events', requireAuth(['executive']), writeLimiter, (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success || Number.isNaN(Date.parse(parsed.data.eventDate))) return res.status(400).json({ error: 'Invalid event details.' });
  const e = parsed.data;
  const result = run('INSERT INTO events (title,type,description,event_date,location,price,member_price,capacity,cover,status) VALUES (?,?,?,?,?,?,?,?,?,?)', e.title, e.type, e.description, e.eventDate, e.location, e.price, e.memberPrice, e.capacity, e.cover, e.status);
  const user = (req as any).user;
  logActivity(user.id, `Created event: ${e.title}`);
  res.status(201).json({ ok: true, id: Number(result.lastInsertRowid), events: queries.events() });
});
app.patch('/api/portal/events/:id', requireAuth(['executive']), (req, res) => {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid event details.' });
  const existing = queries.eventById(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Event not found.' });
  const map: Record<string, string> = { title: 'title', type: 'type', description: 'description', eventDate: 'event_date', location: 'location', price: 'price', memberPrice: 'member_price', capacity: 'capacity', cover: 'cover', status: 'status' };
  const entries = Object.entries(parsed.data).filter(([, v]) => v !== undefined);
  if (!entries.length) return res.status(400).json({ error: 'Nothing to update.' });
  run(`UPDATE events SET ${entries.map(([k]) => `${map[k]} = ?`).join(', ')} WHERE id = ?`, ...entries.map(([, v]) => v), existing.id);
  res.json({ ok: true, events: queries.events() });
});
app.delete('/api/portal/events/:id', requireAuth(['executive']), (req, res) => {
  const existing = queries.eventById(Number(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Event not found.' });
  run('DELETE FROM events WHERE id = ?', existing.id);
  const user = (req as any).user;
  logActivity(user.id, `Deleted event: ${existing.title}`);
  res.json({ ok: true, events: queries.events() });
});

app.post('/api/demo/reset', requireAuth(['executive']), (_req, res) => {
  seedDatabase(true);
  res.json({ ok: true, message: 'Demo data reset to the original sample dataset.' });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

// ---------- Frontend ----------
const httpServer = createHttpServer(app);
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    configFile: path.join(root, 'vite.config.ts'),
    server: { middlewareMode: true, hmr: { server: httpServer }, allowedHosts: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const dist = path.join(root, 'dist');
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong in the demo server.' });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Nafi IT demo portal running at http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  console.log('Demo accounts: member NAFIIT-2026-001 / Member@123 · cr cr@demo.nafiit.test / Cr@12345 · executive executive@demo.nafiit.test / Exec@12345');
});
