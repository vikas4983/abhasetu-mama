'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import {
  Settings,
  Activity,
  Database,
  Shield,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertTriangle,
  Play,
  X,
  FileText,
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  form: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  image: string;
  description: string;
  salt?: string;
}

interface LogEntry {
  timestamp: string;
  event: string;
  status: string;
  details: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Tab State
  const [activeTab, setActiveTab] = useState<'config' | 'health' | 'products' | 'logs'>('config');

  // ABDM Sandbox Config State
  const [config, setConfig] = useState({
    ABDM_CLIENT_ID: '',
    ABDM_CLIENT_SECRET: '',
    ABDM_GATEWAY_URL: '',
    ABDM_CM_ID: '',
    ABDM_HIU_ID: '',
    ABDM_HIP_ID: '',
    sandboxMode: true
  });

  // Health Test Runner State
  const [testSuiteResults, setTestSuiteResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Pharmacy CRUD State
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'prescription',
    brand: '',
    form: 'Tablets',
    price: '',
    originalPrice: '',
    discount: '',
    rating: '4.5',
    image: '',
    description: '',
    salt: ''
  });

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Load configuration, products, and logs on mount
  useEffect(() => {
    loadConfig();
    loadProducts();
    loadLogs();
  }, []);

  const loadConfig = () => {
    fetch('/api/abdm/admin/config')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setConfig(data.config);
        }
      })
      .catch(err => console.error('Error loading config:', err));
  };

  const loadProducts = () => {
    fetch('/api/abdm/pharmacy/products')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setProducts(data.products);
        }
      })
      .catch(err => console.error('Error loading products:', err));
  };

  const loadLogs = () => {
    fetch('/api/abdm/admin/logs')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setLogs(data.logs);
        }
      })
      .catch(err => console.error('Error loading logs:', err));
  };

  // Config Update
  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/abdm/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(t('ABDM credentials updated successfully!'));
        
        // Log config change
        await fetch('/api/abdm/admin/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'ABDM Credentials Updated',
            status: 'SUCCESS',
            details: `Admin changed Client ID to ${config.ABDM_CLIENT_ID} and updated sandbox configurations.`
          })
        });
        loadLogs();
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Failed to update config.'));
    }
  };

  // Run ABDM Unit Health Tests
  const runHealthTests = async () => {
    setIsRunningTests(true);
    showToast(t('Running 14 ABDM validation test cases...'));
    try {
      const res = await fetch('/api/abdm/tests');
      const data = await res.json();
      if (data.status === 'success') {
        setTestSuiteResults(data);
        showToast(t('Sandbox health test completed successfully!'));
        
        // Log health check
        await fetch('/api/abdm/admin/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'System Health Check Run',
            status: data.summary.failed === 0 ? 'SUCCESS' : 'WARNING',
            details: `Admin executed validation suites. Success rate: ${data.summary.successRate}%. Passed: ${data.summary.passed}/${data.summary.total}`
          })
        });
        loadLogs();
      } else {
        showToast('Test runner failed.');
      }
    } catch (err) {
      showToast(t('Error executing test suite.'));
    } finally {
      setIsRunningTests(false);
    }
  };

  // Open product form modal for add
  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'prescription',
      brand: '',
      form: 'Tablets',
      price: '',
      originalPrice: '',
      discount: '0',
      rating: '4.5',
      image: '',
      description: '',
      salt: ''
    });
    setIsProductModalOpen(true);
  };

  // Open product form modal for edit
  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      form: prod.form,
      price: String(prod.price),
      originalPrice: String(prod.originalPrice),
      discount: String(prod.discount),
      rating: String(prod.rating),
      image: prod.image,
      description: prod.description,
      salt: prod.salt || ''
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto calculate original price / discount
    const priceNum = Number(productForm.price);
    const origPriceNum = Number(productForm.originalPrice || productForm.price);
    const discountNum = Math.round(((origPriceNum - priceNum) / origPriceNum) * 100);

    const payload = {
      ...productForm,
      price: priceNum,
      originalPrice: origPriceNum,
      discount: discountNum > 0 ? discountNum : 0,
      rating: Number(productForm.rating)
    };

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct ? { ...payload, id: editingProduct.id } : payload;
      
      const res = await fetch('/api/abdm/pharmacy/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(editingProduct ? t('Medicine updated successfully!') : t('Medicine added to store!'));
        setIsProductModalOpen(false);
        loadProducts();
        
        // Log product edit
        await fetch('/api/abdm/admin/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: editingProduct ? 'Product Catalogue Edited' : 'Product Added',
            status: 'SUCCESS',
            details: `${editingProduct ? 'Updated details' : 'Created new item'} for: "${payload.name}" under category "${payload.category}"`
          })
        });
        loadLogs();
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Error saving medicine details.'));
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(t('Are you sure you want to delete this medicine?'))) return;
    try {
      const res = await fetch(`/api/abdm/pharmacy/products?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast(t('Medicine removed from catalog.'));
        loadProducts();

        // Log deletion
        await fetch('/api/abdm/admin/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'Product Catalogue Deleted',
            status: 'SUCCESS',
            details: `Removed medicine "${name}" (ID: ${id}) from products list.`
          })
        });
        loadLogs();
      } else {
        showToast(data.message);
      }
    } catch (err) {
      showToast(t('Failed to delete product.'));
    }
  };

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/settings'); }} className="back-link">
          Settings
        </a>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="eyebrow">ABHA SETU ADMINISTRATIVE CONSOLE</p>
            <h2>{t('Admin Control Panel')}</h2>
            <p>{t('Manage ABDM Sandbox configurations, audit security logs, run unit tests, and edit pharmacy catalog products.')}</p>
          </div>

          {/* Quick link to API docs */}
          <button 
            onClick={() => router.push('/api-docs')}
            style={{
              background: 'transparent',
              color: 'var(--accent-teal)',
              border: '1.5px solid var(--accent-teal)',
              borderRadius: '30px',
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <BookOpen style={{ width: '13px', height: '13px' }} />
            <span>Interactive API Docs</span>
          </button>
        </div>
      </section>

      {/* Tabs selectors */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginTop: '20px', scrollbarWidth: 'none' }}>
        {[
          { id: 'config', label: 'ABDM Settings', icon: Settings },
          { id: 'health', label: 'ABDM Health Tests', icon: Activity },
          { id: 'products', label: 'Products Manager', icon: Database },
          { id: 'logs', label: 'Security Logs', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`prefill-btn ${isActive ? 'selected-card' : ''}`}
              style={{
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isActive ? 'color-mix(in srgb, var(--accent-teal) 8%, transparent)' : 'transparent',
                border: isActive ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                borderRadius: '30px',
                cursor: 'pointer'
              }}
            >
              <Icon style={{ width: '13px', height: '13px' }} />
              {t(tab.label)}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '20px' }}>
        
        {/* ================= CONFIG TAB ================= */}
        {activeTab === 'config' && (
          <article className="route-card" style={{ padding: '24px', maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Settings style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ margin: 0 }}>Gateway Sandbox Credentials</h3>
            </div>
            
            <form onSubmit={handleConfigSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  ABDM Client ID
                  <input type="text" value={config.ABDM_CLIENT_ID} onChange={(e) => setConfig({ ...config, ABDM_CLIENT_ID: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  ABDM Client Secret
                  <input type="password" value={config.ABDM_CLIENT_SECRET} onChange={(e) => setConfig({ ...config, ABDM_CLIENT_SECRET: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  ABDM Gateway URL
                  <input type="text" value={config.ABDM_GATEWAY_URL} onChange={(e) => setConfig({ ...config, ABDM_GATEWAY_URL: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  ABDM Consent Manager (CM) ID
                  <input type="text" value={config.ABDM_CM_ID} onChange={(e) => setConfig({ ...config, ABDM_CM_ID: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Facility HIU ID
                  <input type="text" value={config.ABDM_HIU_ID} onChange={(e) => setConfig({ ...config, ABDM_HIU_ID: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Facility HIP ID
                  <input type="text" value={config.ABDM_HIP_ID} onChange={(e) => setConfig({ ...config, ABDM_HIP_ID: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                <input type="checkbox" checked={config.sandboxMode} onChange={(e) => setConfig({ ...config, sandboxMode: e.target.checked })} />
                <span>Enable ABDM Sandbox compliance validation modes</span>
              </label>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Save ABDM Configuration
              </button>
            </form>
          </article>
        )}

        {/* ================= HEALTH TESTS TAB ================= */}
        {activeTab === 'health' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Control Panel */}
            <article className="route-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>Gateway Integration Test Suite</h3>
                <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)' }}>Run the full suite of M1, M2, M3, HPR, NHCX, and UHI sandbox test cases.</p>
              </div>
              
              <button
                onClick={runHealthTests}
                disabled={isRunningTests}
                style={{
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '10px 24px',
                  fontSize: '11.5px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isRunningTests ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px color-mix(in srgb, var(--accent-teal) 20%, transparent)'
                }}
              >
                <Play style={{ width: '12px', height: '12px', fill: 'currentColor' }} />
                {isRunningTests ? 'Running Checks...' : 'Execute Suite'}
              </button>
            </article>

            {/* Test Results Summary Grid */}
            {testSuiteResults && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                
                <div className="route-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Passed / Total</span>
                  <strong style={{ fontSize: '24px', color: 'var(--success)', display: 'block', margin: '4px 0' }}>
                    {testSuiteResults.summary.passed} / {testSuiteResults.summary.total}
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>All core modules verified</span>
                </div>

                <div className="route-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Success Rate</span>
                  <strong style={{ fontSize: '24px', color: testSuiteResults.summary.successRate === 100 ? 'var(--success)' : 'var(--accent-cyan)', display: 'block', margin: '4px 0' }}>
                    {testSuiteResults.summary.successRate}%
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Threshold is 100% passed</span>
                </div>

                <div className="route-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Code Coverage</span>
                  <strong style={{ fontSize: '24px', color: 'var(--accent-teal)', display: 'block', margin: '4px 0' }}>
                    {testSuiteResults.summary.coveragePercent}%
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>FHIR schemas covered</span>
                </div>

              </div>
            )}

            {/* Individual Cases List */}
            {testSuiteResults && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {testSuiteResults.results.map((test: any) => (
                  <details 
                    key={test.id} 
                    className="route-card" 
                    style={{ 
                      border: test.passed ? '1px solid var(--border-color)' : '1px solid var(--danger)',
                      background: 'var(--bg-card)'
                    }}
                  >
                    <summary style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {test.passed ? (
                          <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                        ) : (
                          <AlertTriangle style={{ width: '16px', height: '16px', color: 'var(--danger)' }} />
                        )}
                        <span style={{ fontSize: '10px', fontWeight: 'bold', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                          {test.module}
                        </span>
                        <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{test.id}: {test.name}</strong>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{test.durationMs}ms</span>
                    </summary>

                    {/* Test details */}
                    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                      <div style={{ fontSize: '11px', display: 'grid', gap: '8px' }}>
                        <div>
                          <strong>Target Endpoint:</strong> <code>{test.method} {test.endpoint}</code>
                        </div>
                        
                        {/* Assertions */}
                        <div>
                          <strong>Assertions:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                            {test.assertions.map((a: any, idx: number) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: a.passed ? 'var(--text-secondary)' : 'var(--danger)' }}>
                                {a.passed ? '✓' : '✗'} <span>{a.name} (Expected: {JSON.stringify(a.expected)} | Got: {JSON.stringify(a.got)})</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payload */}
                        {test.responsePayload && (
                          <div style={{ marginTop: '8px' }}>
                            <strong>Callback Payload Mock:</strong>
                            <pre style={{ background: '#050c14', color: 'var(--accent-teal)', padding: '10px', borderRadius: '6px', overflowX: 'auto', fontSize: '10.5px', marginTop: '4px', border: '1px solid var(--border-color)' }}>
                              {JSON.stringify(test.responsePayload, null, 2)}
                            </pre>
                          </div>
                        )}

                      </div>
                    </div>
                  </details>
                ))}
              </div>
            )}

            {!testSuiteResults && (
              <article className="route-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Activity style={{ width: '36px', height: '36px', margin: '0 auto 10px', opacity: 0.5 }} />
                <p style={{ fontSize: '12.5px' }}>Click "Execute Suite" above to run live sandbox verification checks.</p>
              </article>
            )}

          </div>
        )}

        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Search and Add control */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <strong style={{ fontSize: '14px' }}>Medicines Catalog ({products.length} Items)</strong>
              
              <button
                onClick={handleAddProductClick}
                style={{
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '8px 16px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus style={{ width: '13px', height: '13px' }} />
                Add Medicine
              </button>
            </div>

            {/* Products grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {products.map(prod => (
                <div key={prod.id} className="route-card" style={{ padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={prod.image} alt={prod.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ fontSize: '12px', margin: '0 0 2px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</h5>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-teal)' }}>₹{prod.price}</span>
                      {prod.discount > 0 && <span style={{ fontSize: '9.5px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{prod.originalPrice}</span>}
                      <span style={{ fontSize: '9px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', padding: '1px 4px', borderRadius: '3px' }}>{prod.category}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => handleEditProductClick(prod)}
                      style={{ background: 'none', border: 'none', padding: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      title="Edit"
                    >
                      <Edit style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      style={{ background: 'none', border: 'none', padding: '6px', color: 'var(--danger)', cursor: 'pointer' }}
                      title="Delete"
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= AUDIT LOGS TAB ================= */}
        {activeTab === 'logs' && (
          <article className="route-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
                Decrypted Audit Log Trail
              </span>
              <button onClick={loadLogs} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                Refresh Trail
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 8px' }}>Timestamp</th>
                  <th style={{ padding: '10px 8px' }}>Event Name</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px' }}>Details / Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{log.event}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span 
                        style={{ 
                          fontSize: '9px', 
                          fontWeight: 'bold', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          background: log.status === 'SUCCESS' ? 'rgba(34,197,94,0.15)' : log.status === 'APPROVED' ? 'rgba(0,180,216,0.15)' : 'rgba(239,68,68,0.15)',
                          color: log.status === 'SUCCESS' ? 'var(--success)' : log.status === 'APPROVED' ? 'var(--accent-cyan)' : 'var(--danger)'
                        }}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        )}

      </div>

      {/* ============================================================= */}
      {/* ==================== PRODUCT CRUD FORM MODAL ================= */}
      {/* ============================================================= */}
      {isProductModalOpen && (
        <div className="checkout-modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles style={{ width: '15px', height: '15px' }} />
                {editingProduct ? 'Edit Catalog Product' : 'Add Product to Store'}
              </span>
              <button className="modal-close" onClick={() => setIsProductModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <form onSubmit={handleProductFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Medicine / Wellness Product Name
                  <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Paracetamol 650mg IP" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Category
                    <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      <option value="prescription">Prescription Drugs</option>
                      <option value="wellness">Health & Wellness</option>
                      <option value="homeopathy">Homeopathy Dilutions</option>
                      <option value="ayurvedic">Ayurvedic Herbal</option>
                      <option value="personal">Personal & Baby Care</option>
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Dosage Form
                    <select value={productForm.form} onChange={(e) => setProductForm({ ...productForm, form: e.target.value })} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      <option value="Tablets">Tablets</option>
                      <option value="Capsules">Capsules</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Liquid">Liquid</option>
                      <option value="Cream">Cream</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Health Brand
                    <input type="text" required value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} placeholder="Setu Labs" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Active Salt / Formula
                    <input type="text" value={productForm.salt} onChange={(e) => setProductForm({ ...productForm, salt: e.target.value })} placeholder="Paracetamol IP 650mg" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Selling Price (₹)
                    <input type="number" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="120" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Original Price (₹)
                    <input type="number" required value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })} placeholder="150" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Rating (★)
                    <input type="number" step="0.1" min="1.0" max="5.0" required value={productForm.rating} onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })} placeholder="4.8" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </label>
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Image URL
                  <input type="text" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="https://images.unsplash.com/..." style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </label>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Product Description
                  <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Fast acting fever relief tablets..." style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', height: '70px', resize: 'none' }} />
                </label>

              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px', display: 'flex', gap: '10px', background: 'var(--bg-secondary)' }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 2, padding: '10px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingProduct ? 'Save Product Changes' : 'Publish Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
