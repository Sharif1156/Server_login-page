import { useEffect, useState } from 'react';
import { Award, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { EmptyState, Loading, PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/format';
import type { Certificate } from '@shared/types';

export function Certificates() {
  const { user } = useAuth();
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api<{ certificates: Certificate[] }>('/api/portal/certificates').then((d) => setItems(d.certificates)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const download = (c: Certificate) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700" viewBox="0 0 1000 700">
      <rect width="1000" height="700" fill="#f5f8fc"/>
      <rect x="30" y="30" width="940" height="640" fill="white" stroke="#0d6efd" stroke-width="4" rx="18"/>
      <text x="500" y="120" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#0a2540">NUB CSE Computer Club</text>
      <text x="500" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#627d98">DEMO CERTIFICATE OF COMPLETION</text>
      <text x="500" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#627d98">This certifies that</text>
      <text x="500" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="44" fill="#0a2540">${user?.name || 'Demo Member'}</text>
      <text x="500" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#627d98">has completed</text>
      <text x="500" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#0d6efd">${c.title}</text>
      <text x="500" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#627d98">Issued ${formatDate(c.issuedAt)} · Code ${c.code}</text>
      <text x="500" y="620" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#9fb3c8">Demo only — not an official NUBCC certificate.</text>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${c.code}.svg`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Certificates" description="Download demo certificates for completed courses." />
      {loading ? <Loading /> : items.length === 0 ? <EmptyState title="No certificates yet" description="Complete a demo course to earn a certificate." icon={Award} /> : (
        <div className="certificate-grid">
          {items.map((c) => (
            <div key={c.id} className="card certificate-card">
              <div className="certificate-icon"><Award size={32} /></div>
              <h3>{c.title}</h3>
              <p>Issued {formatDate(c.issuedAt)}</p>
              <code>{c.code}</code>
              <button className="btn btn-primary btn-sm" onClick={() => download(c)}><Download size={15} /> Download demo certificate</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
