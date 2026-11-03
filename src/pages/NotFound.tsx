import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function NotFound() {
  return (
    <div className="container section not-found">
      <Compass size={56} />
      <h1>Page not found</h1>
      <p className="muted">This demo clone does not have that page.</p>
      <Link className="btn btn-primary" to="/">Back to home</Link>
    </div>
  );
}
