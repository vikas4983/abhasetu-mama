import { ArrowLeft } from 'lucide-react';
import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle, children }: PropsWithChildren<PageHeaderProps>) {
  return (
    <section className="route-hero">
      <Link to="/" className="back-link">
        <ArrowLeft className="small-icon" aria-hidden="true" /> Home
      </Link>
      <div>
        <p className="eyebrow">ABHA SETU</p>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
