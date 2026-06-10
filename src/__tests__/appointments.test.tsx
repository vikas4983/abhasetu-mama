import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppointmentsPage from '../app/(dashboard)/appointments/page';
import { AuthProvider } from '../providers/AuthProvider';
import { LanguageProvider } from '../providers/LanguageProvider';

// Mock useRouter from next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

// Mock fetch API globally
const mockDoctors = [
  {
    id: 1,
    name: 'Dr. Ayesha Ali',
    medicalSystem: 'Homeopathy',
    speciality: 'Chronic Diseases',
    specialistRole: 'Homeopath',
    degree: 'BHMS',
    experience: '12 Years',
    fee: '400',
    rating: '4.8',
    description: 'Specialist in Homeopathic chronic care.',
    photo: '',
    hospitalName: 'Dr. Ayesha Homeo Health Mall',
    hfrId: 'HFR-100421',
    certificateId: 'HPR-90812'
  },
  {
    id: 2,
    name: 'Dr. Aarav Sharma',
    medicalSystem: 'Allopathy',
    speciality: 'Cardiology',
    specialistRole: 'Cardiologist',
    degree: 'MBBS, MD',
    experience: '15 Years',
    fee: '800',
    rating: '4.9',
    description: 'Expert cardiologist with clinical expertise.',
    photo: '',
    hospitalName: 'Apex Heart Institute',
    hfrId: 'HFR-200155',
    certificateId: 'HPR-88123'
  }
];

const mockSpecialties = [
  { medicalSystem: 'Homeopathy', category: 'Chronic Care', specialistRole: 'Homeopath' },
  { medicalSystem: 'Allopathy', category: 'Cardiology', specialistRole: 'Cardiologist' }
];

global.fetch = jest.fn((url) => {
  if (url.includes('/specialties')) {
    return Promise.resolve({
      json: () => Promise.resolve({ status: 'success', specialties: mockSpecialties }),
    });
  }
  return Promise.resolve({
    json: () => Promise.resolve({ status: 'success', doctors: mockDoctors }),
  });
});

describe('Doctor Consultation Page - Single-Page Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <AuthProvider>
        <LanguageProvider>
          <AppointmentsPage />
        </LanguageProvider>
      </AuthProvider>
    );
  };

  test('renders telehealth header and description correctly', async () => {
    renderComponent();
    expect(screen.getByText(/ABHA SETU TELEHEALTH/i)).toBeInTheDocument();
    expect(screen.getByText(/Interoperable Doctor Consultations/i)).toBeInTheDocument();
  });

  test('renders search input and category filter buttons', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/Search by practitioner name, specialty, or clinic.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All Systems/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Modern Medicine/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Traditional Medicine/i })).toBeInTheDocument();
  });

  test('renders empty selection state on right pane by default', () => {
    renderComponent();
    expect(screen.getByText(/Configure Booking Slot/i)).toBeInTheDocument();
    expect(screen.getByText(/Select any verified doctor from the catalog/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Queue Tokens/i)).toBeInTheDocument();
  });

  test('displays medical systems with emojis and loaded doctor counts', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Check for Allopathy card with count
      const allopathyBtn = screen.getByRole('button', { name: /Allopathy 1 Doctors/i });
      expect(allopathyBtn).toBeInTheDocument();
      
      // Check for Homeopathy card with count
      const homeopathyBtn = screen.getByRole('button', { name: /Homeopathy 1 Doctors/i });
      expect(homeopathyBtn).toBeInTheDocument();
    });
  });

  test('clicking a doctor card opens the booking modal overlay and shows checkout pending on the right column', async () => {
    renderComponent();

    // Wait for doctors list to load and render
    await waitFor(() => {
      expect(screen.getByText('Dr. Aarav Sharma')).toBeInTheDocument();
    });

    // Click select & book on Dr. Aarav Sharma
    const bookButtons = screen.getAllByRole('button', { name: /Select & Book/i });
    fireEvent.click(bookButtons[1]); // second doctor is Aarav Sharma

    // Verify booking modal overlay is loaded
    await waitFor(() => {
      expect(screen.getByText('Book Appointment')).toBeInTheDocument();
      expect(screen.getByText('Select Date')).toBeInTheDocument();
      expect(screen.getByText('Select Time Slot')).toBeInTheDocument();
      expect(screen.getByText('Outline active symptoms')).toBeInTheDocument();
    });

    // Verify right booking pane shows Checkout Pending
    expect(screen.getByText('Checkout Pending')).toBeInTheDocument();
  });
});
