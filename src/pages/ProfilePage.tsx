import { PageHeader } from '@components/ui/PageHeader';
import { profileImageUrl } from '@/constants/app';
import { useAppSelector } from '@app/store/hooks';

export default function ProfilePage() {
  const profile = useAppSelector((state) => state.profile);

  return (
    <>
      <PageHeader title="Profile" subtitle="Patient identity, linked ABHA ID, emergency contacts, and account settings." />
      <section className="profile-panel">
        <img src={profileImageUrl} alt="" />
        <div><h3>{profile.name}</h3><p>ABHA ID: {profile.abhaId}</p><p>Age {profile.age} - {profile.location}</p></div>
      </section>
      <section className="route-card wide-card"><h3>Linked Details</h3><ul className="clean-list"><li>Mobile verified ending {profile.phoneMasked.slice(-4)}</li><li>Emergency contact: Rohan Verma</li><li>Preferred language configured in settings</li></ul></section>
    </>
  );
}
