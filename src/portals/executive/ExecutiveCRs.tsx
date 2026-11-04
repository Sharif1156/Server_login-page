import { useEffect, useMemo, useState } from 'react';
import { Search, Download, IdCard } from 'lucide-react';
import { api } from '@/lib/api';
import { Avatar, Badge, EmptyState, Loading, PageHeader } from '@/components/ui';
import type { Person } from '@/components/PersonCard';

export function ExecutiveCRs() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [batch, setBatch] = useState('all');
  useEffect(() => { api<{ people: Person[] }>('/api/portal/crs').then((d) => setPeople(d.people)).catch(() => {}).finally(() => setLoading(false)); }, []);
  const batches = useMemo(() => Array.from(new Set(people.map((p) => p.batch).filter(Boolean))).sort() as string[], [people]);
  const filtered = useMemo(() => people.filter((p) => (batch === 'all' || p.batch === batch) && p.name.toLowerCase().includes(query.toLowerCase())), [people, query, batch]);
  const exportCsv = () => {
    const rows = [['Name', 'Batch', 'Semester', 'Section', 'Email', 'Phone'], ...filtered.map((p) => [p.name, p.batch || '', String(p.semester || ''), p.section || '', p.email || '', p.phone || ''])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'demo-crs.csv'; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <>
      <PageHeader title="CR directory" description="Approved class representatives in the demo dataset." action={<button className="btn btn-outline btn-sm" onClick={exportCsv}><Download size={15} /> Export CSV</button>} />
      <div className="filter-bar">
        <div className="search-input"><Search size={18} /><input placeholder="Search CRs…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <select value={batch} onChange={(e) => setBatch(e.target.value)}><option value="all">All batches</option>{batches.map((b) => <option key={b} value={b}>Batch {b}</option>)}</select>
        <Badge variant="info">{filtered.length} CRs</Badge>
      </div>
      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState title="No CRs found" icon={IdCard} /> : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>CR</th><th>Batch</th><th>Semester</th><th>Section</th><th>Contact</th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td><div className="cell-user"><Avatar name={p.name} color={p.avatarColor} size={34} /><strong>{p.name}</strong></div></td>
                  <td>{p.batch}</td><td>{p.semester}</td><td>{p.section}</td>
                  <td><small className="cell-sub">{p.email}</small><small className="cell-sub">{p.phone}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
