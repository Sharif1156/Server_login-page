import { useEffect, useMemo, useState } from 'react';
import { Search, Download, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { Avatar, Badge, EmptyState, Loading, PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/format';
import type { User } from '@shared/types';

export function Members() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  useEffect(() => { api<{ members: User[] }>('/api/portal/members').then((d) => setMembers(d.members)).catch(() => {}).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.studentId.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase())), [members, query]);

  const exportCsv = () => {
    const rows = [['Name', 'Student ID', 'Email', 'Batch', 'Semester', 'Section', 'Membership ID', 'Joined'], ...filtered.map((m) => [m.name, m.studentId, m.email, m.batch, String(m.semester), m.section, m.membershipId, m.joinedAt])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'demo-members.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Members" description="Demo member directory." action={<button className="btn btn-outline btn-sm" onClick={exportCsv}><Download size={15} /> Export CSV</button>} />
      <div className="filter-bar"><div className="search-input"><Search size={18} /><input placeholder="Search members…" value={query} onChange={(e) => setQuery(e.target.value)} /></div><Badge variant="info">{filtered.length} members</Badge></div>
      {loading ? <Loading /> : filtered.length === 0 ? <EmptyState title="No members found" icon={Users} /> : (
        <div className="card table-wrap">
          <table className="data-table">
            <thead><tr><th>Member</th><th>Student ID</th><th>Batch / Section</th><th>Membership ID</th><th>Joined</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td><div className="cell-user"><Avatar name={m.name} color={m.avatarColor} size={34} /><div><strong>{m.name}</strong><small className="cell-sub">{m.email}</small></div></div></td>
                  <td><code>{m.studentId}</code></td>
                  <td>{m.batch} / {m.section}<small className="cell-sub">Semester {m.semester}</small></td>
                  <td><code>{m.membershipId}</code></td>
                  <td>{formatDate(m.joinedAt)}</td>
                  <td><Badge variant="success">{m.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
