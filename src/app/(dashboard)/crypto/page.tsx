/**
 * @file        page.tsx
 * @description Page component for RSA encryption, decryption, and keypair generation simulation.
 * @module      abdm/crypto
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-11
 * @modified    2026-06-11
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { 
  Key, 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

/**
 * @description Renders the RSA Cryptography utility page.
 * @returns {React.JSX.Element} The rendered Cryptography page.
 */
export default function CryptoPage(): React.JSX.Element {
  const router = useRouter();
  const { t } = useLanguage();
  const { logSecurityEvent, currentUser } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Active public key from session
  const [activePublicKey, setActivePublicKey] = useState('');
  const [isPublicKeyLoading, setIsPublicKeyLoading] = useState(true);

  // Key Pair Generator States
  const [genPublicKey, setGenPublicKey] = useState('');
  const [genPrivateKey, setGenPrivateKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Encryption States
  const [encryptPlainText, setEncryptPlainText] = useState('');
  const [encryptPublicKey, setEncryptPublicKey] = useState('');
  const [encryptCipherText, setEncryptCipherText] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Decryption States
  const [decryptCipherText, setDecryptCipherText] = useState('');
  const [decryptPrivateKey, setDecryptPrivateKey] = useState('');
  const [decryptPlainText, setDecryptPlainText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Copy States for Feedback
  const [copiedKey, setCopiedKey] = useState<'genPub' | 'genPriv' | 'cipher' | 'plain' | null>(null);

  // Fetch Session Public Key on Mount
  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const res = await fetch('/api/abdm/crypto/public-key');
        const data = await res.json();
        if (res.ok && data.status === 'success' && data.publicKey) {
          setActivePublicKey(data.publicKey);
          setEncryptPublicKey(data.publicKey);
          showToast(t('Active gateway public key loaded!'));
        }
      } catch (err) {
        console.error('Failed to load session public key:', err);
      } finally {
        setIsPublicKeyLoading(false);
      }
    };
    fetchPublicKey();
  }, [t]);

  /**
   * Copies text to clipboard and handles the copy feedback state.
   * @param {string} text - text to copy
   * @param {string} key - copy indicator state key
   */
  const handleCopy = async (text: string, key: 'genPub' | 'genPriv' | 'cipher' | 'plain') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast(t('Copied to clipboard!'));
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      showToast(t('Failed to copy.'));
    }
  };

  /**
   * Generates a 2048-bit RSA keypair by calling the backend generator.
   */
  const handleGenerateKeyPair = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/abdm/crypto/generate-keypair', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setGenPublicKey(data.publicKey);
        setGenPrivateKey(data.privateKey);
        showToast(t('RSA Key Pair generated successfully!'));
        logSecurityEvent('RSA Keypair Gen', 'Generated temporary 2048-bit RSA testing keypair.');
      } else {
        showToast(data.message || t('Key generation failed.'));
      }
    } catch (err) {
      showToast(t('Network error generating keypair.'));
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Encrypts the plain text using the specified public key.
   * @param {React.FormEvent} e - submit event
   */
  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encryptPlainText) {
      showToast(t('Please enter plain text to encrypt.'));
      return;
    }
    setIsEncrypting(true);
    try {
      const res = await fetch('/api/abdm/crypto/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plainText: encryptPlainText,
          publicKey: encryptPublicKey || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setEncryptCipherText(data.cipherText);
        showToast(t('Data encrypted successfully!'));
      } else {
        showToast(data.message || t('Encryption failed.'));
      }
    } catch (err) {
      showToast(t('Network error during encryption.'));
    } finally {
      setIsEncrypting(false);
    }
  };

  /**
   * Decrypts the cipher text using the specified private key.
   * @param {React.FormEvent} e - submit event
   */
  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decryptCipherText) {
      showToast(t('Please enter cipher text to decrypt.'));
      return;
    }
    if (!decryptPrivateKey) {
      showToast(t('Please enter private key to decrypt.'));
      return;
    }
    setIsDecrypting(true);
    try {
      const res = await fetch('/api/abdm/crypto/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cipherText: decryptCipherText,
          privateKey: decryptPrivateKey
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setDecryptPlainText(data.plainText);
        showToast(t('Data decrypted successfully!'));
      } else {
        showToast(data.message || t('Decryption failed.'));
      }
    } catch (err) {
      showToast(t('Network error during decryption.'));
    } finally {
      setIsDecrypting(false);
    }
  };

  /**
   * Helper to load the generated public key into the encryption form.
   */
  const loadGenPublicKey = () => {
    if (genPublicKey) {
      setEncryptPublicKey(genPublicKey);
      showToast(t('Loaded generated public key into Encryption form.'));
    }
  };

  /**
   * Helper to load the generated private key into the decryption form.
   */
  const loadGenPrivateKey = () => {
    if (genPrivateKey) {
      setDecryptPrivateKey(genPrivateKey);
      showToast(t('Loaded generated private key into Decryption form.'));
    }
  };

  if (isPageLoading) {
    return (
      <>
        <section className="route-hero">
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '80px', height: '14px', marginBottom: '8px' }}></div>
          <div className="setu-skeleton setu-skeleton-title" style={{ width: '180px', height: '24px', marginBottom: '8px' }}></div>
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '320px', height: '14px' }}></div>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '20px' }}>
          <div className="route-card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div className="setu-skeleton setu-skeleton-title" style={{ width: '150px', height: '18px', marginBottom: '12px' }}></div>
            <div className="setu-skeleton" style={{ width: '100%', height: '80px', borderRadius: '8px' }}></div>
          </div>
        </div>
      </>
    );
  }

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'master_admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '24px' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
          <Lock style={{ width: '48px', height: '48px', color: 'var(--danger)' }} />
        </div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>{t('Access Denied')}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', marginBottom: '24px' }}>
          {t('This section is restricted to Administrator and Super Admin roles. You do not have permissions to access RSA cryptography.')}
        </p>
        <button className="prefill-btn active" onClick={() => router.push('/')} style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '12px' }}>
          {t('Back to Dashboard')}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">ABHA SETU CRYPTO UTILITY</p>
          <h2>{t('RSA Cryptography tool')}</h2>
          <p>{t('Perform secure RSA-OAEP SHA-1 encryption and decryption using session public keys or custom key pairs.')}</p>
        </div>
      </section>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '20px' }}>
        
        {/* Session Public Key Status banner */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          textAlign: 'left'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
              Gateway Session Status / गेटवे सत्र स्थिति
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: activePublicKey ? 'var(--success)' : 'var(--text-muted)' }}></div>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {isPublicKeyLoading ? 'Checking session public key...' : (activePublicKey ? 'Active Session Key Loaded / सत्र कुंजी लोड' : 'No Active Session Public Key')}
              </strong>
            </div>
          </div>
          {activePublicKey && (
            <button
              onClick={() => {
                setEncryptPublicKey(activePublicKey);
                showToast(t('Autofilled Encryption Public Key!'));
              }}
              style={{
                background: 'rgba(20, 184, 166, 0.1)',
                border: '1px solid var(--accent-teal)',
                color: 'var(--accent-teal)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Autofill Session Key / सत्र कुंजी भरें
            </button>
          )}
        </div>

        {/* 1. Key Pair Generator */}
        <article className="route-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ margin: 0, fontSize: '16px' }}>Generate RSA-2048 Testing Key Pair</h3>
            </div>
            <button
              onClick={handleGenerateKeyPair}
              disabled={isGenerating}
              style={{
                background: 'var(--accent-teal)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {isGenerating ? <RefreshCw className="animate-spin" style={{ width: '14px', height: '14px' }} /> : <Key style={{ width: '14px', height: '14px' }} />}
              <span>Generate Keypair</span>
            </button>
          </div>

          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Need a key pair for encryption testing? Generate a temporary cryptographically secure 2048-bit RSA key pair.
          </p>

          {(genPublicKey || genPrivateKey) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
              {/* Public Key Display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Generated Public Key (PEM)</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={loadGenPublicKey}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                    >
                      Use in Encrypt
                    </button>
                    <button
                      onClick={() => handleCopy(genPublicKey, 'genPub')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      aria-label="Copy public key"
                    >
                      {copiedKey === 'genPub' ? <Check style={{ width: '12px', height: '12px', color: 'var(--success)' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={genPublicKey}
                  style={{ width: '100%', height: '120px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '9px', resize: 'none', outline: 'none' }}
                />
              </div>

              {/* Private Key Display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Generated Private Key (PEM)</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={loadGenPrivateKey}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                    >
                      Use in Decrypt
                    </button>
                    <button
                      onClick={() => handleCopy(genPrivateKey, 'genPriv')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      aria-label="Copy private key"
                    >
                      {copiedKey === 'genPriv' ? <Check style={{ width: '12px', height: '12px', color: 'var(--success)' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={genPrivateKey}
                  style={{ width: '100%', height: '120px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '9px', resize: 'none', outline: 'none' }}
                />
              </div>
            </div>
          )}
        </article>

        {/* Form Grid (Encrypt & Decrypt Side-by-Side) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* 2. RSA Encryption */}
          <article className="route-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ margin: 0, fontSize: '16px' }}>RSA Encrypt (Plain text → Base64 cipher)</h3>
            </div>
            
            <form onSubmit={handleEncrypt} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Plain Text to Encrypt / सादा पाठ
                <textarea
                  required
                  disabled={isEncrypting}
                  value={encryptPlainText}
                  onChange={(e) => setEncryptPlainText(e.target.value)}
                  placeholder="Enter plaintext (e.g. your OTP code, Aadhaar details, etc.)"
                  style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', opacity: isEncrypting ? 0.6 : 1 }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                RSA Encryption Public Key (PEM format)
                <textarea
                  required
                  disabled={isEncrypting}
                  value={encryptPublicKey}
                  onChange={(e) => setEncryptPublicKey(e.target.value)}
                  placeholder="Paste PEM public key (begins with -----BEGIN PUBLIC KEY-----)"
                  style={{ width: '100%', height: '100px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '10px', outline: 'none', opacity: isEncrypting ? 0.6 : 1 }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(20, 184, 166, 0.05)', padding: '8px 12px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <ShieldCheck style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                <span>Padding: RSA/ECB/OAEPWithSHA-1AndMGF1Padding (Legacy)</span>
              </div>

              <button
                type="submit"
                disabled={isEncrypting || !encryptPlainText || !encryptPublicKey}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'var(--accent-teal)',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: (isEncrypting || !encryptPlainText || !encryptPublicKey) ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                {isEncrypting ? <RefreshCw className="animate-spin" style={{ width: '16px', height: '16px' }} /> : <Lock style={{ width: '16px', height: '16px' }} />}
                <span>Encrypt Text</span>
              </button>
            </form>

            {encryptCipherText && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Base64 Ciphertext Outcome</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setDecryptCipherText(encryptCipherText);
                        showToast(t('Copied ciphertext to Decryption form.'));
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                    >
                      Use in Decrypt
                    </button>
                    <button
                      onClick={() => handleCopy(encryptCipherText, 'cipher')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                      aria-label="Copy ciphertext"
                    >
                      {copiedKey === 'cipher' ? <Check style={{ width: '12px', height: '12px', color: 'var(--success)' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={encryptCipherText}
                  style={{ width: '100%', height: '100px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '10px', resize: 'none', outline: 'none' }}
                />
              </div>
            )}
          </article>

          {/* 3. RSA Decryption */}
          <article className="route-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Unlock style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ margin: 0, fontSize: '16px' }}>RSA Decrypt (Base64 cipher → Plain text)</h3>
            </div>
            
            <form onSubmit={handleDecrypt} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Base64 Ciphertext to Decrypt
                <textarea
                  required
                  disabled={isDecrypting}
                  value={decryptCipherText}
                  onChange={(e) => setDecryptCipherText(e.target.value)}
                  placeholder="Paste base64 encoded ciphertext here"
                  style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '11px', outline: 'none', opacity: isDecrypting ? 0.6 : 1 }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                RSA Private Key (PEM format)
                <textarea
                  required
                  disabled={isDecrypting}
                  value={decryptPrivateKey}
                  onChange={(e) => setDecryptPrivateKey(e.target.value)}
                  placeholder="Paste PEM private key (begins with -----BEGIN PRIVATE KEY-----)"
                  style={{ width: '100%', height: '100px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '10px', outline: 'none', opacity: isDecrypting ? 0.6 : 1 }}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(20, 184, 166, 0.05)', padding: '8px 12px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <AlertCircle style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                <span>Padding: RSA/ECB/OAEPWithSHA-1AndMGF1Padding (Legacy)</span>
              </div>

              <button
                type="submit"
                disabled={isDecrypting || !decryptCipherText || !decryptPrivateKey}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'var(--accent-teal)',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: (isDecrypting || !decryptCipherText || !decryptPrivateKey) ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                {isDecrypting ? <RefreshCw className="animate-spin" style={{ width: '16px', height: '16px' }} /> : <Unlock style={{ width: '16px', height: '16px' }} />}
                <span>Decrypt Text</span>
              </button>
            </form>

            {decryptPlainText && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Decrypted Plaintext</span>
                  <button
                    onClick={() => handleCopy(decryptPlainText, 'plain')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                    aria-label="Copy decrypted text"
                  >
                    {copiedKey === 'plain' ? <Check style={{ width: '12px', height: '12px', color: 'var(--success)' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={decryptPlainText}
                  style={{ width: '100%', height: '100px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '13px', resize: 'none', outline: 'none' }}
                />
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
