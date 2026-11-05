// Lightweight API smoke test. Run against a local demo server:
//   npm run dev
//   npm run smoke
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function req(path, { method = 'GET', body, cookie } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie')?.split(';')[0];
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, cookie: setCookie };
}
function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); process.exitCode = 1; }
  else console.log('ok:', msg);
}

const stats = await req('/api/public/stats');
assert(stats.status === 200 && stats.data.stats.members > 0, 'public stats');

const accounts = [
  ['member', 'NAFIIT-2026-001', process.env.NAFIIT_MEMBER_PASSWORD],
  ['cr', 'cr@demo.nafiit.test', process.env.NAFIIT_CR_PASSWORD],
  ['executive', 'executive@demo.nafiit.test', process.env.NAFIIT_EXECUTIVE_PASSWORD],
];
const cookies = {};
for (const [role, identifier, password] of accounts) {
  const login = await req('/api/auth/login', { method: 'POST', body: { role, identifier, password } });
  assert(login.status === 200 && login.data.user?.role === role, `${role} demo login`);
  cookies[role] = login.cookie;
  const me = await req('/api/auth/me', { cookie: login.cookie });
  assert(me.data.user?.role === role, `${role} session`);
}

const rejected = await req('/api/auth/login', { method: 'POST', body: { role: 'member', identifier: 'real@example.com', password: 'secret' } });
assert(rejected.status === 401, 'non-demo credentials rejected');

const events = await req('/api/portal/events', { cookie: cookies.member });
assert(events.status === 200 && events.data.events.length > 0, 'member events');
const target = events.data.events.find((e) => e.status === 'upcoming' && !e.isRegistered);
if (target) {
  const reg = await req(`/api/portal/events/${target.id}/register`, { method: 'POST', cookie: cookies.member });
  assert(reg.status === 200, 'event registration');
  const cancel = await req(`/api/portal/events/${target.id}/register`, { method: 'DELETE', cookie: cookies.member });
  assert(cancel.status === 200, 'event cancellation');
}

const classmates = await req('/api/portal/classmates', { cookie: cookies.cr });
assert(classmates.status === 200 && classmates.data.classmates.length > 0, 'CR classmates');
const forbidden = await req('/api/portal/classmates', { cookie: cookies.member });
assert(forbidden.status === 403, 'role guard blocks member from CR route');

const apps = await req('/api/portal/applications', { cookie: cookies.executive });
assert(apps.status === 200 && apps.data.applications.length > 0, 'executive applications');
const pending = apps.data.applications.find((a) => a.status === 'pending');
if (pending) {
  const review = await req(`/api/portal/applications/${pending.id}`, { method: 'PATCH', cookie: cookies.executive, body: { status: 'approved', note: 'Smoke test approval' } });
  assert(review.status === 200 && review.data.application.status === 'approved', 'application review');
}

const ann = await req('/api/portal/announcements', { method: 'POST', cookie: cookies.executive, body: { title: 'Smoke test', body: 'Temporary smoke test announcement.', audience: 'all', priority: 'normal' } });
assert(ann.status === 201, 'create announcement');
if (ann.data.id) {
  const del = await req(`/api/portal/announcements/${ann.data.id}`, { method: 'DELETE', cookie: cookies.executive });
  assert(del.status === 200, 'delete announcement');
}

const appSubmit = await req('/api/public/applications', { method: 'POST', body: {
  role: 'cr', name: 'Smoke Test CR', studentId: 'NAFIIT-TEST-999', email: 'smoke@demo.nafiit.test', phone: '+8801700000000',
  batch: '70', semester: 1, section: 'A', confirm: true,
} });
assert(appSubmit.status === 201, 'public demo application');
const badApp = await req('/api/public/applications', { method: 'POST', body: { role: 'cr', name: 'X', studentId: '1', email: 'bad', phone: '1', batch: '1', semester: 1, section: 'A', confirm: true, password: 'should-reject' } });
assert(badApp.status === 400, 'application rejects password field');

// Restore clean demo data.
const reset = await req('/api/demo/reset', { method: 'POST', cookie: cookies.executive });
assert(reset.status === 200, 'demo reset');

console.log(process.exitCode ? '\nSmoke test failed.' : '\nSmoke test passed.');
