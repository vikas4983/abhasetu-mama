import { FormEvent, useState } from 'react';
import { CheckCircle2, Download, IdCard, QrCode, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@components/ui/PageHeader';
import { Seo } from '@components/seo/Seo';
import { abdmMilestoneOneSteps, abdmReferenceUrl } from '@/constants/enterpriseData';
import { abdmMockApi } from '@features/abdm/abdmMockApi';

export default function AbdmPage() {
  const [form, setForm] = useState({ aadhaar: '', mobile: '', otp: '', abhaAddress: '', abhaNumber: '', facilityQr: '' });
  const [status, setStatus] = useState('Ready for secure ABDM V3 sandbox simulation.');
  const [loading, setLoading] = useState(false);

  const run = async (action: keyof typeof abdmMockApi) => {
    setLoading(true);
    try {
      const response = await abdmMockApi[action](form);
      setStatus(response.message);
    } catch {
      setStatus('Request failed safely. Please retry after checking the details.');
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run('requestAadhaarOtp');
  };

  return (
    <>
      <Seo title="ABDM V3 Workflows" description="ABHA SETU ABDM Milestone 1 sandbox-ready mock flows for ABHA creation, verification, and QR onboarding." />
      <PageHeader title="ABDM V3 Workflows" subtitle="Milestone 1 ready architecture for ABHA creation, OTP verification, ABHA address, returning patient, mobile verification, and facility QR flows." />
      <section className="abdm-grid">
        <form className="form-panel abdm-form" onSubmit={submit}>
          <label>Aadhaar Number<input inputMode="numeric" value={form.aadhaar} onChange={(event) => setForm({ ...form, aadhaar: event.target.value })} placeholder="Enter sandbox Aadhaar" /></label>
          <label>Mobile Number<input inputMode="tel" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} placeholder="+91 mobile number" /></label>
          <label>OTP<input inputMode="numeric" value={form.otp} onChange={(event) => setForm({ ...form, otp: event.target.value })} placeholder="6 digit OTP" /></label>
          <label>ABHA Number<input value={form.abhaNumber} onChange={(event) => setForm({ ...form, abhaNumber: event.target.value })} placeholder="ABHA number" /></label>
          <label>ABHA Address<input value={form.abhaAddress} onChange={(event) => setForm({ ...form, abhaAddress: event.target.value })} placeholder="name@abdm" /></label>
          <label>Facility QR Payload<input value={form.facilityQr} onChange={(event) => setForm({ ...form, facilityQr: event.target.value })} placeholder="Facility QR mock payload" /></label>
          <div className="abdm-actions">
            <button className="primary-action" type="submit" disabled={loading}><IdCard className="small-icon" /> Create ABHA OTP</button>
            <button className="back-link" type="button" onClick={() => void run('verifyOtp')} disabled={loading}>Verify OTP</button>
            <button className="back-link" type="button" onClick={() => void run('verifyAbhaNumber')} disabled={loading}>Verify ABHA Number</button>
            <button className="back-link" type="button" onClick={() => void run('verifyAbhaAddress')} disabled={loading}>Verify ABHA Address</button>
            <button className="back-link" type="button" onClick={() => void run('scanFacilityQr')} disabled={loading}><QrCode className="small-icon" /> Scan Facility QR</button>
            <a className="back-link" href="/certificates/sample-abha-card.svg" download><Download className="small-icon" /> Download ABHA Card</a>
          </div>
          <p className="secure-status" role="status"><ShieldCheck className="small-icon" /> {status}</p>
        </form>
        <aside className="route-card abdm-checklist">
          <h3>Milestone 1 Scope</h3>
          <ul className="clean-list">
            {abdmMilestoneOneSteps.map((step) => <li key={step}><CheckCircle2 className="small-icon" /> {step}</li>)}
          </ul>
          <a className="card-link" href={abdmReferenceUrl} target="_blank" rel="noreferrer">Official ABDM V3 Documentation</a>
        </aside>
      </section>
    </>
  );
}
