import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { PersonCard, type Person } from '@/components/PersonCard';
import { EmptyState, Loading, PageHeader } from '@/components/ui';

export function CRDirectory() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [batch, setBatch] = useState('all');
  const [semester, setSemester] = useState('all');

  useEffect(() => {
    api<{ people: Person[] }>('/api/public/crs').then((d) => setPeople(d.people)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const batches = useMemo(() => Array.from(new Set(people.map((p) => p.batch).filter(Boolean))).sort() as string[], [people]);
  const semesters = useMemo(() => Array.from(new Set(people.map((p) => p.semester).filter(Boolean))).sort((a, b) => Number(a) - Number(b)) as number[], [people]);
  const filtered = useMemo(() => people.filter((p) =>
    (batch === 'all' || p.batch === batch) &&
    (semester === 'all' || String(p.semester) === semester) &&
    p.name.toLowerCase().includes(query.toLowerCase())
  ), [people, query, batch, semester]);

  const groups = useMemo(() => {
    const map = new Map<string, Person[]>();
    for (const p of filtered) {
      const key = `Batch ${p.batch} · Semester ${p.semester}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="container section">
      <PageHeader eyebrow="Your voice" title="Class Representatives" description="Your first point of contact for club news in every batch and section."
        action={<div className="header-btns"><Link className="btn btn-primary btn-sm" to="/cr/register">Register as a CR</Link><Link className="btn btn-ghost btn-sm" to="/cr/login">CR login</Link></div>} />
      <div className="filter-bar">
        <div className="search-input"><Search size={18} /><input placeholder="Search CRs…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <select value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Batch"><option value="all">All batches</option>{batches.map((b) => <option key={b} value={b}>Batch {b}</option>)}</select>
        <select value={semester} onChange={(e) => setSemester(e.target.value)} aria-label="Semester"><option value="all">All semesters</option>{semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}</select>
      </div>
      {loading ? <Loading /> : groups.length === 0 ? <EmptyState title="No CRs found" description="Try a different batch or search." /> : groups.map(([title, list]) => (
        <div key={title} className="cr-group">
          <h2 className="list-heading">{title} <span className="muted">({list.length})</span></h2>
          <div className="person-grid">{list.map((p) => <PersonCard key={p.id} person={p} subtitle={`Section ${p.section}`} />)}</div>
        </div>
      ))}
    </div>
  );
}
