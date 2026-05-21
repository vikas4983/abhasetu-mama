import { PageHeader } from '@components/ui/PageHeader';
import { Seo } from '@components/seo/Seo';
import { abdmReferenceUrl, policySections } from '@/constants/enterpriseData';

export default function PolicyPage({ type }: { type: 'terms' | 'privacy' }) {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions';
  const sections = isPrivacy ? policySections.privacy : policySections.terms;

  return (
    <>
      <Seo title={title} description={`${title} for ABHA SETU healthcare platform workflows.`} />
      <PageHeader title={title} subtitle="Professional static policy content for the current demo. Final legal review is required before production launch." />
      <section className="policy-card">
        <p>
          ABHA SETU is designed for secure, consent-aware digital healthcare workflows. These terms describe the expected use of this application, ABDM-related responsibilities, and patient privacy commitments.
        </p>
        <ol>
          {sections.map((section) => <li key={section}>{section}</li>)}
        </ol>
        <p>
          ABDM implementation details must follow the latest official sandbox and production guidance:
          {' '}
          <a href={abdmReferenceUrl} target="_blank" rel="noreferrer">ABDM Sandbox V3 Documentation</a>.
        </p>
      </section>
    </>
  );
}
