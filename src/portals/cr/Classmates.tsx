import { useEffect, useMemo, useState } from 'react';
import { Search, Save, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Avatar, EmptyState, Loading, PageHeader, StatCard } from '@/components/ui';
import type { Classmate } from '@shared/types';

export function Classmates() {
  const { toast } = useToast();
  const [items, setItems] = useState<Classmate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Record<number, number>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const load = () => api<{ classmates: Classmate[] }>('/api/portal/classmates').then((d) => {
    setItems(d.classmates);
    setDraft(Object.fromEntries(d.classmates.map((c) => [c.id, c.attendance])));
  }).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => items.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.studentId.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const avg = items.length ? Math.round(items.reduce((s, c) => s + c.attendance, 0) / items.length) : 0;
  const low = items.filter((c) => c.attendance < 75).length;

  const save = async (c: Classmate) => {
    setBusyId(c.id);
    try {
      const d = await api<{ classmates: Classmate[] }>(`/api/portal/classmates/${c.id}`, { method: 'PATCH', body: JSON.stringify({ attendance: draft[c.id] ?? c.attendance }) });
      setItems(d.classmates);
      toast(`Attendance updated for ${c.name}.`, 'success');
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setBusyId(null); }
  };

  return (
    <>
      <PageHeader title="My classmates" description="Demo section roster and attendance. Update attendance percentages for your section." />
      <div className="stats-grid stats-grid-3">
        <StatCard label="Classmates" value={items.length} icon={Users} />
        <StatCard label="Average attendance" value={`${avg}%`} icon={Users} tone="green" />
        <StatCard label="Below 75%" value={low} icon={Users} tone="red" />
      </div>
      <div className="filter-bar"><div className="search-input"><Search size={18} /><input placeholder="Search by name or student ID…" value={query} onChange={(e) => setQuery(e.target.value)} /></div></div>
      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState title="No classmates found" /> : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Student ID</th><th>Contact</th><th>Section</th><th>Attendance</th><th></th></tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td><div className="cell-user"><Avatar name={c.name} size={34} /><span>{c.name}</span></div></td>
                  <td><code>{c.studentId}</code></td>
                  <td><small className="cell-sub">{c.email}</small><small className="cell-sub">{c.phone}</small></td>
                  <td>{c.section}</td>
                  <td>
                    <div className="attendance-input">
                      <input type="number" min={0} max={100} value={draft[c.id] ?? c.attendance} onChange={(e) => setDraft((d) => ({ ...d, [c.id]: Number(e.target.value) }))} />
                      <span>%</span>
                    </div>
                  </td>
                  <td><button className="btn btn-ghost btn-xs" onClick={() => save(c)} disabled={busyId === c.id || draft[c.id] === c.attendance}><Save size={14} /> Save</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
