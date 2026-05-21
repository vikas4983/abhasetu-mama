import { FormEvent, useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Seo } from '@components/seo/Seo';
import { PageHeader } from '@components/ui/PageHeader';
import { Toast } from '@components/feedback/Toast';
import { contactInfo } from '@/constants/enterpriseData';

const initialState = { email: '', mobile: '', query: '' };

export default function ContactPage() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const mobileValid = /^[0-9+\-\s]{10,16}$/.test(form.mobile);
    if (!emailValid || !mobileValid || form.query.trim().length < 10) {
      setError('Enter a valid email, mobile number, and at least 10 characters in the query.');
      return;
    }
    setError('');
    setToast('Thanks. Your proposal has been captured for the AbhaSetu team.');
    setForm(initialState);
  };

  return (
    <>
      <Seo title="Contact" description="Get in touch with ABHA SETU for healthcare proposals, partnerships, and support." />
      <PageHeader title="Get In Touch" subtitle="Send a query, proposal, partnership request, or implementation question to the AbhaSetu team." />
      <section className="contact-grid">
        <form className="form-panel contact-form" onSubmit={submit} noValidate>
          <label>
            Email
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="you@example.com" />
          </label>
          <label>
            Mobile Number
            <input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} type="tel" placeholder="+91 99810 57765" />
          </label>
          <label>
            Query / Proposal
            <textarea value={form.query} onChange={(event) => setForm({ ...form, query: event.target.value })} placeholder="Tell us what you want to build or discuss." />
          </label>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <button className="primary-action" type="submit">Submit Proposal</button>
        </form>
        <aside className="contact-panel">
          <a href={`mailto:${contactInfo.email}`}><Mail className="small-icon" /> {contactInfo.email}</a>
          <a href={`tel:${contactInfo.phone}`}><Phone className="small-icon" /> {contactInfo.phone}</a>
          <p><MapPin className="small-icon" /> {contactInfo.address}</p>
        </aside>
      </section>
      {toast ? <Toast message={toast} onClose={() => setToast('')} /> : null}
    </>
  );
}
