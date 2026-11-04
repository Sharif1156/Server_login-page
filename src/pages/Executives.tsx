import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { PersonCard, type Person } from '@/components/PersonCard';
import { EmptyState, Loading, PageHeader } from '@/components/ui';

export function Executives() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState('current');

  useEffect(() => {
    api<{ people: Person[] }>('/api/public/executives').then((d) => setPeople(d.people)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => people.filter((p) =>
    (panel === 'current' || p.panelYear === panel) &&
    (p.name.toLowerCase().includes(query.toLowerCase()) || (p.position || '').toLowerCase().includes(query.toLowerCase()))
  ), [people, query, panel]);

  return (
    <div className="container section">
      <PageHeader eyebrow="Leadership" title="Executive Committee" description="The students who plan our events, run our programs and represent the club."
        action={<div className="header-btns"><Link className="btn btn-primary btn-sm" to="/executive/register">Apply to the committee</Link><Link className="btn btn-ghost btn-sm" to="/executive/login">Executive login</Link></div>} />
      <div className="filter-bar">
        <div className="search-input"><Search size={18} /><input placeholder="Search by name or position…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <select value={panel} onChange={(e) => setPanel(e.target.value)} aria-label="Panel">
          <option value="current">Current committee</option>
          <option value="2026-2027">Panel 2026-2027</option>
        </select>
      </div>
      <p className="muted">Current committee · {filtered.length} demo members</p>
      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState title="No executives found" /> : (
        <div className="person-grid">{filtered.map((p) => <PersonCard key={p.id} person={p} />)}</div>
      )}
    </div>
  );
}
