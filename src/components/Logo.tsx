import { Link } from 'react-router-dom';

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo-light' : ''}`} aria-label="NUBCC home">
      <img src="/assets/nubcc-logo.png" alt="NUBCC logo" width={40} height={40} />
      {!compact && (
        <span className="logo-text">
          <strong>NUBCC</strong>
          <small>CSE Computer Club</small>
        </span>
      )}
    </Link>
  );
}
