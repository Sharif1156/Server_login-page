import { ShieldAlert } from 'lucide-react';

export function DemoBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`demo-banner ${compact ? 'demo-banner-compact' : ''}`} role="note">
      <ShieldAlert size={16} />
      <span>
        <strong>Nafi IT.</strong> Use only your assigned account credentials.
      </span>
    </div>
  );
}
