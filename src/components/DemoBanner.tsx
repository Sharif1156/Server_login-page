import { ShieldAlert } from 'lucide-react';

export function DemoBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`demo-banner ${compact ? 'demo-banner-compact' : ''}`} role="note">
      <ShieldAlert size={16} />
      <span>
        <strong>Demo clone.</strong> Not the live NUBCC site. Use sample accounts only — never enter real passwords, payment details, or personal data.
      </span>
    </div>
  );
}
