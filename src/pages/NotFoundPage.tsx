import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <div className="route-card">
        <h2>Page not found</h2>
        <p>The requested route is not available in this demo.</p>
        <Link to="/">Return Home</Link>
      </div>
    </section>
  );
}
