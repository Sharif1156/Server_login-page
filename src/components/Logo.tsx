import { Link } from 'react-router-dom';

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo-light' : ''}`} aria-label="Nafi IT home">
      <img src="/assets/nafiit-logo.png" alt="Nafi IT logo" width={40} height={40} />
      {!compact && (
        <span className="logo-text">
          <strong>Nafi IT</strong>
          <small>IT Services &amp; Consulting</small>
        </span>
      )}
    </Link>
  );
}
