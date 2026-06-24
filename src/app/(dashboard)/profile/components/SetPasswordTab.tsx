/**
 * @file        SetPasswordTab.tsx
 * @description Renders the 'Set Password' tab which allows users to set a transaction password.
 * @module      profile/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 */

import React from 'react';
import { Key, Eye, EyeOff, X } from 'lucide-react';

interface SetPasswordTabProps {
  t: (key: string) => string;
  setActiveTab: (tab: any) => void;
  passSuccess: boolean;
  passAuthMethod: 'aadhaar' | 'abha';
  setPassAuthMethod: (method: 'aadhaar' | 'abha') => void;
  passwordForm: any;
  handleSetPasswordSubmit: (formData: any) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  passError: string;
  passLoading: boolean;
}

/**
 * Component providing validation logic and otp/password forms to configure transaction security pins.
 */
export const SetPasswordTab: React.FC<SetPasswordTabProps> = ({
  t,
  setActiveTab,
  passSuccess,
  passAuthMethod,
  setPassAuthMethod,
  passwordForm,
  handleSetPasswordSubmit,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passError,
  passLoading,
}) => {
  return (
    <div className="set-password-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .set-password-container {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            background: rgba(15, 23, 42, 0.6) !important;
            backdrop-filter: blur(8px) !important;
            z-index: 9995 !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
          }
          .set-password-card {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius: 24px !important;
            border-top-right-radius: 24px !important;
            width: 100% !important;
            max-width: 100% !important;
            background: var(--bg-card) !important;
            padding: 24px !important;
            animation: modal-slide-up 0.3s ease-out !important;
            box-shadow: 0 -10px 25px rgba(0,0,0,0.15) !important;
          }
          .mobile-only-header {
            display: flex !important;
          }
        }
      `}} />
      <div 
        className="set-password-card"
        style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px',
          width: '100%', padding: '24px', textAlign: 'left'
        }}
      >
        {/* Mobile close header */}
        <div className="mobile-only-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('Set Password')}
          </h3>
          <button 
            onClick={() => setActiveTab('my_profile')} 
            style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-only-title">
          <Key style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
          <span>Set Security Password</span>
        </h4>

        {passSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <img 
              src="/assets/check_icon.png" 
              style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto 12px' }} 
              alt="Verified" 
            />
            <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>Password Set Successfully</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>You can now use this password alongside your ABHA address to access clinical dashboards directly.</p>
          </div>
        ) : (
          <form onSubmit={passwordForm.handleSubmit(handleSetPasswordSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Verification Channel</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1, padding: '10px', borderRadius: '8px', border: passAuthMethod === 'aadhaar' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', background: passAuthMethod === 'aadhaar' ? 'rgba(20, 184, 166, 0.06)' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                  <input type="radio" checked={passAuthMethod === 'aadhaar'} onChange={() => setPassAuthMethod('aadhaar')} style={{ display: 'none' }} />
                  Aadhaar Linked Mobile
                </label>
                <label style={{ flex: 1, padding: '10px', borderRadius: '8px', border: passAuthMethod === 'abha' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', background: passAuthMethod === 'abha' ? 'rgba(20, 184, 166, 0.06)' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                  <input type="radio" checked={passAuthMethod === 'abha'} onChange={() => setPassAuthMethod('abha')} style={{ display: 'none' }} />
                  ABHA Linked Mobile
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Password</span>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Minimum 8 characters" 
                  {...passwordForm.register('newPassword', {
                    required: t('Password is required.'),
                    minLength: { value: 8, message: t('Password must be at least 8 characters long.') }
                  })}
                  style={{ 
                    width: '100%', padding: '10px 64px 10px 10px', borderRadius: '8px', 
                    border: passwordForm.formState.errors.newPassword ? '2px solid var(--danger)' : (passwordForm.watch('newPassword') || '').length >= 8 ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                    background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    boxShadow: passwordForm.formState.errors.newPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                    animation: passwordForm.formState.errors.newPassword ? 'otp-shake 0.4s ease' : 'none'
                  }}
                />
                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {(passwordForm.watch('newPassword') || '').length >= 8 && !passwordForm.formState.errors.newPassword && (
                    <img 
                      src="/assets/check_icon.png" 
                      style={{ width: '18px', height: '18px' }} 
                      alt="Verified" 
                    />
                  )}
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '4px', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                  </button>
                </div>
              </div>
              {passwordForm.formState.errors.newPassword && <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>{passwordForm.formState.errors.newPassword.message as string}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Confirm Password</span>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="Confirm your password" 
                  {...passwordForm.register('confirmPassword', {
                    required: t('Please confirm your password.'),
                    validate: (val: string) => val === passwordForm.watch('newPassword') || t('Passwords do not match.')
                  })}
                  style={{ 
                    width: '100%', padding: '10px 64px 10px 10px', borderRadius: '8px', 
                    border: passwordForm.formState.errors.confirmPassword ? '2px solid var(--danger)' : (passwordForm.watch('confirmPassword') || '').length >= 8 && passwordForm.watch('confirmPassword') === passwordForm.watch('newPassword') ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                    background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    boxShadow: passwordForm.formState.errors.confirmPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                    animation: passwordForm.formState.errors.confirmPassword ? 'otp-shake 0.4s ease' : 'none'
                  }}
                />
                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {(passwordForm.watch('confirmPassword') || '').length >= 8 && passwordForm.watch('confirmPassword') === passwordForm.watch('newPassword') && !passwordForm.formState.errors.confirmPassword && (
                    <img 
                      src="/assets/check_icon.png" 
                      style={{ width: '18px', height: '18px' }} 
                      alt="Verified" 
                    />
                  )}
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '4px', cursor: 'pointer' }}>
                    {showConfirmPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                  </button>
                </div>
              </div>
              {passwordForm.formState.errors.confirmPassword && <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>{passwordForm.formState.errors.confirmPassword.message as string}</div>}
            </div>

            {passError && <div style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 600 }}>{passError}</div>}
            
            <button type="submit" disabled={passLoading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', marginTop: '6px' }}>
              {passLoading ? 'Requesting OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
