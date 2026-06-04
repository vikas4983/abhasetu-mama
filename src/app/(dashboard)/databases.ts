export interface Product {
  id: string;
  name: string;
  category: 'prescription' | 'wellness' | 'homeopathy' | 'ayurvedic' | 'personal';
  brand: string;
  form: 'Tablets' | 'Capsules' | 'Syrup' | 'Liquid' | 'Cream';
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  image: string;
  description: string;
  salt?: string;
}

export const PRODUCTS_DATABASE: Product[] = [
  {
    id: 'p1',
    name: 'Paracetamol 650mg IP (SetuCure)',
    category: 'prescription',
    brand: 'Setu Labs',
    form: 'Tablets',
    price: 32,
    originalPrice: 40,
    discount: 20,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=150',
    description: 'Fast acting fever reducer and pain reliever for moderate fever.',
    salt: 'Paracetamol 650mg'
  },
  {
    id: 'p2',
    name: 'Arnica Montana 30C Dilution',
    category: 'homeopathy',
    brand: 'SBL Homeopathy',
    form: 'Liquid',
    price: 95,
    originalPrice: 110,
    discount: 13,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=150',
    description: 'Excellent homeopathic remedy for muscle aches, bruises, and swelling.',
    salt: 'Arnica Montana 30C'
  },
  {
    id: 'p3',
    name: 'Multivitamin Complex & Zinc (SetuFit)',
    category: 'wellness',
    brand: 'Setu Labs',
    form: 'Tablets',
    price: 240,
    originalPrice: 320,
    discount: 25,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1616671285410-67126132473c?auto=format&fit=crop&q=80&w=150',
    description: 'Daily immune booster capsule with vitamins C, D3, B12 and Zinc.',
    salt: 'Vitamins C, D3, B12 & Zinc'
  },
  {
    id: 'p4',
    name: 'Ashwagandha Organic Stress-Free',
    category: 'ayurvedic',
    brand: 'Himalaya Wellness',
    form: 'Capsules',
    price: 180,
    originalPrice: 200,
    discount: 10,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=150',
    description: 'Rejuvenative tonic that supports stress management and vitality.',
    salt: 'Withania Somnifera (Ashwagandha)'
  },
  {
    id: 'p5',
    name: 'Cough Relief Tulsi Honey Syrup',
    category: 'prescription',
    brand: 'Dabur Health',
    form: 'Syrup',
    price: 85,
    originalPrice: 100,
    discount: 15,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1550572017-8894df051a80?auto=format&fit=crop&q=80&w=150',
    description: 'All-natural throat relief formula with Holy Basil and Honey.',
    salt: 'Ocimum Sanctum (Tulsi) & Honey'
  },
  {
    id: 'p6',
    name: 'Gentle Baby Moisturizing Wipes',
    category: 'personal',
    brand: 'Johnson & Johnson',
    form: 'Cream',
    price: 150,
    originalPrice: 180,
    discount: 16,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=150',
    description: 'Alcohol-free, pH balanced gentle wipes for sensitive baby skin.',
    salt: 'Moisturizer & Aloe Vera Extracts'
  },
  {
    id: 'p7',
    name: 'Amoxicillin Trihydrate 500mg IP',
    category: 'prescription',
    brand: 'Alkem Drugs',
    form: 'Capsules',
    price: 112,
    originalPrice: 140,
    discount: 20,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d304a3b24?auto=format&fit=crop&q=80&w=150',
    description: 'Broad-spectrum antibiotic tablet for bacterial infections. Requires ABHA Rx upload.',
    salt: 'Amoxicillin Trihydrate 500mg'
  },
  {
    id: 'p8',
    name: 'SootheEye Cool-Drops',
    category: 'personal',
    brand: 'Setu Labs',
    form: 'Liquid',
    price: 70,
    originalPrice: 90,
    discount: 22,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=150',
    description: 'Relieves eye dryness, fatigue, and irritation from electronic screens.',
    salt: 'Naphazoline HCl & Carboxymethylcellulose'
  }
];

export interface LabPackage {
  id: string;
  name: string;
  parameters: number;
  provider: string;
  price: number;
  originalPrice: number;
  discount: number;
  reportHours: number;
  sampleType: string;
  description: string;
  image: string;
}

export const LAB_PACKAGES_DATABASE: LabPackage[] = [
  {
    id: 'l1',
    name: 'ABHA Active Full Body Health Checkup',
    parameters: 54,
    provider: 'Janki Raman Diagnostic Lab, Jabalpur',
    price: 890,
    originalPrice: 1990,
    discount: 55,
    reportHours: 24,
    sampleType: 'Blood & Urine',
    description: 'Complete screening of liver, kidney, blood sugar, cholesterol, thyroid, and blood counts.',
    image: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'l2',
    name: 'Thyroid Care Profile (T3, T4, TSH)',
    parameters: 3,
    provider: 'DR AYESHAH HOMEO LAB, Bhopal',
    price: 350,
    originalPrice: 700,
    discount: 50,
    reportHours: 12,
    sampleType: 'Blood',
    description: 'Evaluates thyroid gland function and checks for hyperthyroidism or hypothyroidism.',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'l3',
    name: 'Comprehensive Diabetes Screening (HbA1c & Fasting)',
    parameters: 4,
    provider: 'Metro Diagnostics',
    price: 290,
    originalPrice: 600,
    discount: 51,
    reportHours: 8,
    sampleType: 'Blood (Fasting Required)',
    description: 'Measures average blood sugar levels over the past 3 months and active fasting levels.',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'l4',
    name: 'Active Lipid & Cholesterol Profile',
    parameters: 7,
    provider: 'Janki Raman Diagnostic Lab, Jabalpur',
    price: 390,
    originalPrice: 800,
    discount: 51,
    reportHours: 12,
    sampleType: 'Blood',
    description: 'Helps assess risk of cardiovascular disease by measuring bad and good cholesterol ratios.',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'l5',
    name: 'Vitamin D & B12 Vitality Duo',
    parameters: 2,
    provider: 'Metro Diagnostics',
    price: 750,
    originalPrice: 1500,
    discount: 50,
    reportHours: 24,
    sampleType: 'Blood',
    description: 'Identifies bone wellness, nervous health, and metabolic energy cofactor deficiencies.',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=300'
  }
];
