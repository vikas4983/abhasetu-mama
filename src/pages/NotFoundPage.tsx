import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <div className="route-card">
        <h2>Page not found</h2>
        <p>The requested route is not available in this demo.</p>
        <Link className="primary-action" to="/">
          <Home className="small-icon" aria-hidden="true" />
          Return Home
        </Link>
      </div>
    </section>
  );
}
