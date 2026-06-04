'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { useAuth } from '../../../providers/AuthProvider';
import {
  Search,
  Filter,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  ArrowLeft,
  X,
  CreditCard,
  Building,
  Info,
  ChevronRight,
  Sparkles,
  ShoppingBag as CartIcon
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface Product {
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
}

const PRODUCTS_DATABASE: Product[] = [
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
    description: 'Fast acting fever reducer and pain reliever for moderate fever.'
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
    description: 'Excellent homeopathic remedy for muscle aches, bruises, and swelling.'
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
    description: 'Daily immune booster capsule with vitamins C, D3, B12 and Zinc.'
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
    description: 'Rejuvenative tonic that supports stress management and vitality.'
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
    description: 'All-natural throat relief formula with Holy Basil and Honey.'
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
    description: 'Alcohol-free, pH balanced gentle wipes for sensitive baby skin.'
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
    description: 'Broad-spectrum antibiotic tablet for bacterial infections. Requires ABHA Rx upload.'
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
    description: 'Relieves eye dryness, fatigue, and irritation from electronic screens.'
  }
];

export default function PharmacyPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { addRecord, logSecurityEvent } = useAuth();

  // Infinite scroll mock products state
  const [products, setProducts] = useState<Product[]>(PRODUCTS_DATABASE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Filtering States
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);

  // Cart & Checkout States
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment' | 'success'>('cart');
  
  // Checkout Details Forms
  const [shipping, setShipping] = useState({
    name: 'Ananya Verma',
    phone: '9999123456',
    pincode: '482001',
    address: '14, Vijay Nagar Scheme, Near Patel Chowk',
    city: 'Jabalpur',
    state: 'Madhya Pradesh'
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('ananya.verma@okaxis');

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const threshold = 200; // pixels from bottom
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold) {
          if (!isLoadingMore) {
            loadMoreProducts();
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [products, isLoadingMore]);

  const loadMoreProducts = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const nextBatch: Product[] = [];
      const startIdx = products.length + 1;
      const categories: Product['category'][] = ['prescription', 'wellness', 'homeopathy', 'ayurvedic', 'personal'];
      const forms: Product['form'][] = ['Tablets', 'Capsules', 'Syrup', 'Liquid', 'Cream'];
      const brands = ['Setu Labs', 'SBL Homeopathy', 'Himalaya Wellness', 'Dabur Health', 'Johnson & Johnson', 'Alkem Drugs'];
      const images = [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1607619056574-7b8f304b3c8f?auto=format&fit=crop&q=80&w=150',
        'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=150'
      ];
      
      const meds = [
        'Amoxicillin', 'Azithromycin', 'Metformin', 'Atorvastatin', 'Amlodipine',
        'Vitamin C Drops', 'Zinc Immune Shield', 'Tulsi Herbal Cough Syrup', 'Chyawanprash Care', 'Baby Gentle Wash',
        'Nux Vomica 30C', 'Rhus Tox Dilution', 'Neem Purifying Gel', 'Ashwagandha Vigor Capsule', 'Multivitamin Vitality'
      ];

      for (let i = 0; i < 6; i++) {
        const idNum = startIdx + i;
        const medName = meds[idNum % meds.length];
        const category = categories[idNum % categories.length];
        const form = forms[idNum % forms.length];
        const brand = brands[idNum % brands.length];
        const basePrice = 40 + (idNum * 12) % 300;
        const discount = (idNum * 5) % 45;
        const price = Math.round(basePrice * (1 - discount / 100));
        
        nextBatch.push({
          id: `p_gen_${idNum}`,
          name: medName + (form === 'Tablets' ? ' 650mg' : form === 'Capsules' ? ' 500mg' : ' 100ml'),
          category,
          brand,
          form,
          price,
          originalPrice: basePrice,
          discount,
          rating: Number((4.0 + (idNum * 0.1) % 1.0).toFixed(1)),
          image: images[idNum % images.length],
          description: `Clinically formulated ${medName} designed for daily support and wellness.`
        });
      }
      
      setProducts(prev => [...prev, ...nextBatch]);
      setIsLoadingMore(false);
    }, 800);
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('abha_pharmacy_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync cart to localStorage
  const saveCart = (newCart: Record<string, number>) => {
    setCart(newCart);
    try {
      localStorage.setItem('abha_pharmacy_cart', JSON.stringify(newCart));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = (id: string) => {
    const updated = { ...cart, [id]: (cart[id] || 0) + 1 };
    saveCart(updated);
    showToast(t('Added to Cart'));
  };

  const handleRemoveOne = (id: string) => {
    if (!cart[id]) return;
    const updated = { ...cart };
    if (updated[id] === 1) {
      delete updated[id];
    } else {
      updated[id]--;
    }
    saveCart(updated);
  };

  const handleClearProduct = (id: string) => {
    const updated = { ...cart };
    delete updated[id];
    saveCart(updated);
  };

  const handleToggleFormFilter = (form: string) => {
    setSelectedForms(prev =>
      prev.includes(form) ? prev.filter(f => f !== form) : [...prev, form]
    );
  };

  const handleToggleBrandFilter = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // Reset filters helper
  const handleResetFilters = () => {
    setSelectedForms([]);
    setSelectedBrands([]);
    setPriceSort('none');
    setOnlyDiscounted(false);
  };

  // Filters logic
  let filteredProducts = products.filter(p => {
    // 1. Category search
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    
    // 2. Search bar
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchDesc) return false;
    }

    // 3. Form filters
    if (selectedForms.length > 0 && !selectedForms.includes(p.form)) return false;

    // 4. Brand filters
    if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;

    // 5. Discount check
    if (onlyDiscounted && p.discount === 0) return false;

    return true;
  });

  // Sorting logic
  if (priceSort === 'asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  // Cart summary math
  const cartItemsCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const cartSubtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const prod = products.find(p => p.id === id);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);
  const gstAmount = Math.round(cartSubtotal * 0.12);
  const deliveryFee = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 40;
  const totalAmount = cartSubtotal + gstAmount + deliveryFee;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutStep === 'address') {
      setCheckoutStep('payment');
    } else if (checkoutStep === 'payment') {
      // Create record invoice to link inside Health Locker
      const invoiceName = `SetuPharmacy Invoice - #${Math.floor(100000 + Math.random() * 900000)}.pdf`;
      addRecord({
        name: invoiceName,
        type: 'DiagnosticReport',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        source: 'Abha Setu Smart Pharmacy'
      });

      logSecurityEvent('Pharmacy Checkout', `Completed secure purchase of ₹${totalAmount} via ${paymentMethod.toUpperCase()}`);
      
      // Clear Cart
      saveCart({});
      setCheckoutStep('success');
      showToast(t('Order Placed Successfully!'));
    }
  };

  const formsList = ['Tablets', 'Capsules', 'Syrup', 'Liquid', 'Cream'];
  const brandsList = ['Setu Labs', 'SBL Homeopathy', 'Himalaya Wellness', 'Dabur Health', 'Johnson & Johnson', 'Alkem Drugs'];

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/more'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('More Services')}
        </a>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="eyebrow">ABHA DIGITAL PHARMACY</p>
            <h2>{t('Order Medicines & Wellness')}</h2>
            <p>{t('Compare health supplements, search SBL homeopathy, order generic medicines, and track deliveries.')}</p>
          </div>
          
          {/* Floating Cart Trigger */}
          <button 
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'var(--accent-teal)',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              padding: '10px 18px',
              fontSize: '11.5px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px color-mix(in srgb, var(--accent-teal) 30%, transparent)',
              cursor: 'pointer'
            }}
          >
            <ShoppingBag style={{ width: '15px', height: '15px' }} />
            <span>{cartItemsCount} {t('Items')}</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px', fontSize: '9.5px' }}>₹{totalAmount}</span>
          </button>
        </div>
      </section>

      {/* Main Container */}
      <div className="pharmacy-container" style={{ display: 'flex', gap: '20px', marginTop: '20px', alignItems: 'flex-start' }}>
        
        {/* ================= FILTER SIDEBAR (Desktop) ================= */}
        <aside className="route-card" style={{ width: '260px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '80px', flexShrink: 0 }} id="desktop-filter-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter style={{ width: '13px', height: '13px', color: 'var(--accent-teal)' }} />
              Filters
            </span>
            <button onClick={handleResetFilters} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '10.5px', fontWeight: 'bold', cursor: 'pointer' }}>
              Reset All
            </button>
          </div>

          {/* Sort By price */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Sort Price</span>
            <select value={priceSort} onChange={(e) => setPriceSort(e.target.value as any)} style={{ width: '100%', padding: '6px', fontSize: '11px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              <option value="none">Standard Popularity</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>

          {/* Offer Discounts Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={onlyDiscounted} onChange={(e) => setOnlyDiscounted(e.target.checked)} />
            <span>Only Discount Offers</span>
          </label>

          {/* Dosage Form Filter */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Dosage Form</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {formsList.map(form => (
                <label key={form} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <input type="checkbox" checked={selectedForms.includes(form)} onChange={() => handleToggleFormFilter(form)} />
                  <span>{form}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Health Brands</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {brandsList.map(brand => (
                <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => handleToggleBrandFilter(brand)} />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ================= CATALOG SECTION ================= */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Search bar and mobile filter trigger */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="global-search" style={{ flex: 1, padding: 0, height: '40px' }}>
              <Search className="search-icon" style={{ left: '12px' }} />
              <input
                id="pharmacy-search"
                type="text"
                placeholder={t('Search medicines, syrups, brands or wellness components...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '38px', borderRadius: '10px' }}
                aria-label="Search medicines and wellness products"
              />
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsFilterMobileOpen(true)}
              className="prefill-btn"
              style={{
                display: 'none',
                minHeight: 'auto',
                height: '40px',
                padding: '0 12px',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '10px'
              }}
              id="mobile-filter-toggle-btn"
            >
              <Filter style={{ width: '14px', height: '14px' }} />
              <span>Filters</span>
            </button>
          </div>

          {/* Categories Tab selectors */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'prescription', label: 'Prescription Drugs' },
              { id: 'wellness', label: 'Health & Wellness' },
              { id: 'homeopathy', label: 'Homeopathy Dilutions' },
              { id: 'ayurvedic', label: 'Ayurvedic Herbal' },
              { id: 'personal', label: 'Personal & Baby Care' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`prefill-btn ${activeCategory === cat.id ? 'selected-card' : ''}`}
                style={{
                  padding: '6px 12px',
                  minHeight: 'auto',
                  fontSize: '11px',
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  background: activeCategory === cat.id ? 'color-mix(in srgb, var(--accent-teal) 8%, transparent)' : 'transparent',
                  border: activeCategory === cat.id ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  borderRadius: '30px'
                }}
              >
                {t(cat.label)}
              </button>
            ))}
          </div>

          {/* Catalog grid */}
          <section className="flipkart-grid">
            {filteredProducts.map(prod => (
              <article key={prod.id} className="route-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', position: 'relative' }}>
                
                {/* Discount Badge */}
                {prod.discount > 0 && (
                  <span style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10, background: 'var(--accent-teal)', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                    {prod.discount}% OFF
                  </span>
                )}

                {/* Product Image */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', width: '100%', height: '120px', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=150';
                    }}
                  />
                </div>

                {/* Product Meta */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>{prod.brand}</span>
                  <h4 style={{ fontSize: '12.5px', margin: 0, fontWeight: 750, color: 'var(--text-primary)', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '34px' }}>
                    {prod.name}
                  </h4>
                  <span style={{ fontSize: '9px', width: 'fit-content', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {prod.form}
                  </span>
                </div>

                {/* Price and Add Control */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--accent-teal)' }}>₹{prod.price}</strong>
                      {prod.discount > 0 && (
                        <span style={{ fontSize: '10px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{prod.originalPrice}</span>
                      )}
                    </div>
                    <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>Incl. all taxes</span>
                  </div>

                  {/* Quantity Add/Remove Controls */}
                  {cart[prod.id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '2px 6px' }}>
                      <button onClick={() => handleRemoveOne(prod.id)} style={{ border: 'none', background: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <Minus style={{ width: '10px', height: '10px' }} />
                      </button>
                      <strong style={{ fontSize: '11px', color: 'var(--text-primary)', minWidth: '10px', textAlign: 'center' }}>{cart[prod.id]}</strong>
                      <button onClick={() => handleAddToCart(prod.id)} style={{ border: 'none', background: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <Plus style={{ width: '10px', height: '10px' }} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-outline-accent"
                      onClick={() => handleAddToCart(prod.id)}
                      style={{
                        background: 'transparent',
                        border: '1.5px solid var(--accent-teal)',
                        color: 'var(--accent-teal)',
                        padding: '4px 12px',
                        borderRadius: '30px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {t('ADD')}
                    </button>
                  )}
                </div>

              </article>
            ))}

            {filteredProducts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '12px' }}>
                No medicines found matching the active selection.
              </div>
            )}
          </section>

          {/* Infinite Scroll Loader indicator */}
          {isLoadingMore && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 0', gap: '8px', color: 'var(--accent-teal)' }}>
              <div className="spinner" style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent-teal)', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Loading more medicines...</span>
            </div>
          )}

        </div>

      </div>

      {/* ============================================================= */}
      {/* ==================== CART DRAWER / OVERLAY ==================== */}
      {/* ============================================================= */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch' }}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '440px', 
              width: '100%', 
              height: '100vh', 
              margin: 0, 
              borderRadius: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
              background: 'var(--bg-card)'
            }}
          >
            
            {/* Header */}
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CartIcon style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
                Your Secure Cart
              </span>
              <button className="modal-close" onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Steps Tab Indicators */}
            {checkoutStep !== 'success' && (
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderBottom: checkoutStep === 'cart' ? '2.5px solid var(--accent-teal)' : 'none', color: checkoutStep === 'cart' ? 'var(--accent-teal)' : 'inherit' }}>1. REVIEW CART</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderBottom: checkoutStep === 'address' ? '2.5px solid var(--accent-teal)' : 'none', color: checkoutStep === 'address' ? 'var(--accent-teal)' : 'inherit' }}>2. ADDRESS DETAILS</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderBottom: checkoutStep === 'payment' ? '2.5px solid var(--accent-teal)' : 'none', color: checkoutStep === 'payment' ? 'var(--accent-teal)' : 'inherit' }}>3. PAYMENT</div>
              </div>
            )}

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              
              {/* STEP 1: REVIEW CART LIST */}
              {checkoutStep === 'cart' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {Object.entries(cart).map(([id, qty]) => {
                    const prod = products.find(p => p.id === id);
                    if (!prod) return null;
                    return (
                      <div key={id} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px' }}>
                        <img src={prod.image} alt={prod.name} style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontSize: '11.5px', margin: 0, fontWeight: 750 }}>{prod.name}</h5>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Unit Price: ₹{prod.price}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <strong style={{ fontSize: '12px', color: 'var(--accent-teal)' }}>₹{prod.price * qty}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '2px 4px' }}>
                            <button onClick={() => handleRemoveOne(prod.id)} style={{ border: 'none', background: 'none', padding: '2px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                              <Minus style={{ width: '8px', height: '8px' }} />
                            </button>
                            <span style={{ fontSize: '10px', color: 'var(--text-primary)' }}>{qty}</span>
                            <button onClick={() => handleAddToCart(prod.id)} style={{ border: 'none', background: 'none', padding: '2px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                              <Plus style={{ width: '8px', height: '8px' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {cartItemsCount === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      <ShoppingBag style={{ width: '36px', height: '36px', margin: '0 auto 10px', opacity: 0.5 }} />
                      <p style={{ fontSize: '12px' }}>Your shopping cart is empty.</p>
                    </div>
                  )}

                  {/* Prescription Warning Note */}
                  {Object.keys(cart).some(id => products.find(p => p.id === id)?.category === 'prescription') && (
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', fontSize: '10px', color: 'var(--danger)' }}>
                      <Info style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                      <span>Contains RX medicines. Compliance with ABDM requires automatic check of your linked EHR cards for active e-prescriptions.</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: ADDRESS ENTRY */}
              {checkoutStep === 'address' && (
                <form id="address-form" onSubmit={handleCheckoutSubmit} style={{ display: 'grid', gap: '12px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Recipient Full Name
                    <input type="text" required value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Phone Number
                      <input type="tel" required value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </label>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Pin Code
                      <input type="text" required value={shipping.pincode} onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </label>
                  </div>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Street Address & Flat
                    <input type="text" required value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      City
                      <input type="text" required value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </label>
                    <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      State
                      <input type="text" required value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                    </label>
                  </div>
                </form>
              )}

              {/* STEP 3: PAYMENT TYPE SELECT */}
              {checkoutStep === 'payment' && (
                <form id="payment-form" onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    
                    {/* COD Option */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      <div>
                        <strong style={{ fontSize: '12px', display: 'block' }}>Cash / Pay on Delivery</strong>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Pay in cash or UPI QR code on arrival.</span>
                      </div>
                    </label>

                    {/* UPI Option */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '12px', display: 'block' }}>Instant UPI Gateway</strong>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Pay using phone scanner apps.</span>
                        {paymentMethod === 'upi' && (
                          <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} style={{ width: '100%', marginTop: '6px', padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                        )}
                      </div>
                    </label>

                    {/* Card Option */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                      <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '12px', display: 'block' }}>Credit / Debit Cards</strong>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Secure payment checkout portal.</span>
                        {paymentMethod === 'card' && (
                          <div style={{ display: 'grid', gap: '6px', marginTop: '8px' }}>
                            <input type="text" placeholder="Card Number" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                              <input type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                              <input type="password" placeholder="CVV" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} style={{ padding: '6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </label>

                  </div>
                </form>
              )}

              {/* STEP 4: SUCCESS MODAL CONTENT */}
              {checkoutStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-teal) 15%, transparent)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle style={{ width: '28px', height: '28px' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', margin: '0 0 6px' }}>Order Placed!</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 20px' }}>
                    Your prescription check cleared. The order invoice is linked securely to your ABDM Health Locker. Phlebotomists and logistics teams have been notified.
                  </p>
                  
                  {/* Delivery ETA info */}
                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', marginBottom: '20px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DELIVERY RECIPIENT</span>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{shipping.name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{shipping.address}, {shipping.city}</span>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ESTIMATED DELIVERY TIMELINE</span>
                    <strong style={{ fontSize: '13px', color: 'var(--accent-teal)' }}>Tomorrow, by 12:00 PM</strong>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutStep('cart');
                      setIsCartOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'var(--accent-teal)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Back to Store
                  </button>
                </div>
              )}

            </div>

            {/* Drawer Footer billing summary (Only on checkout views) */}
            {checkoutStep !== 'success' && cartItemsCount > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Items Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>CGST/SGST (12%)</span>
                    <span>₹{gstAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Charges</span>
                    <span>{deliveryFee === 0 ? <span style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>FREE</span> : `₹${deliveryFee}`}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13.5px' }}>
                    <span>Total Amount</span>
                    <span style={{ color: 'var(--accent-teal)' }}>₹{totalAmount}</span>
                  </div>
                </div>

                {checkoutStep === 'cart' && (
                  <button
                    onClick={() => setCheckoutStep('address')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--accent-teal)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Proceed to Delivery Address</span>
                    <ChevronRight style={{ width: '14px', height: '14px' }} />
                  </button>
                )}

                {checkoutStep === 'address' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setCheckoutStep('cart')} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Back
                    </button>
                    <button type="submit" form="address-form" style={{ flex: 2, padding: '12px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Confirm Address
                    </button>
                  </div>
                )}

                {checkoutStep === 'payment' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setCheckoutStep('address')} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Back
                    </button>
                    <button type="submit" form="payment-form" style={{ flex: 2, padding: '12px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Place Order (₹{totalAmount})
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* ==================== MOBILE FILTER DRAWER ==================== */}
      {/* ============================================================= */}
      {isFilterMobileOpen && (
        <div className="modal-overlay" onClick={() => setIsFilterMobileOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div className="modal-header">
              <h3>Refine Selection</h3>
              <button className="modal-close" onClick={() => setIsFilterMobileOpen(false)}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Sort Price</span>
                <select value={priceSort} onChange={(e) => setPriceSort(e.target.value as any)} style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  <option value="none">Popularity</option>
                  <option value="asc">Low to High</option>
                  <option value="desc">High to Low</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={onlyDiscounted} onChange={(e) => setOnlyDiscounted(e.target.checked)} />
                <span>Show Only Discounts Offers</span>
              </label>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Form</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {formsList.map(form => (
                    <label key={form} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <input type="checkbox" checked={selectedForms.includes(form)} onChange={() => handleToggleFormFilter(form)} />
                      <span>{form}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Brands</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {brandsList.map(brand => (
                    <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => handleToggleBrandFilter(brand)} />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { handleResetFilters(); setIsFilterMobileOpen(false); }} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Reset All
              </button>
              <button onClick={() => setIsFilterMobileOpen(false)} style={{ flex: 1, padding: '10px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
