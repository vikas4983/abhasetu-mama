'use client';

/**
 * @file        AuthProvider.tsx
 * @description Provides authentication state and operations for different roles (patient, doctor, admin) in Abha Setu application.
 * @module      auth
 * @layer       provider
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-11
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'operator' | 'master_admin';
  name: string;
  abhaId?: string;
  photo?: string;
  abhaProfile?: any;
  mobile?: string;
  linkedAccounts?: any[];
}

export interface Appointment {
  id: string;
  title: string;
  doctor: string;
  meta: string;
  status: string;
  token?: string;
}

export interface HealthRecord {
  name: string;
  type: string;
  date: string;
  source: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'security' | 'abdm' | 'general';
  unread: boolean;
}

export interface SecurityLog {
  event: string;
  details: string;
  time: string;
}

export interface ActiveToken {
  tokenNum: string;
  facilityName: string;
  expiresAt: number;
}

interface AuthContextType {
  currentUser: User | null;
  abhaCreated: boolean;
  abhaCard: any | null;
  appointments: Appointment[];
  records: HealthRecord[];
  notifications: Notification[];
  securityLogs: SecurityLog[];
  activeToken: ActiveToken | null;
  setActiveToken: (token: ActiveToken | null) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithJwt: (token: string, user: User) => Promise<void>;
  loginWithOtp: (role: 'patient' | 'doctor' | 'operator', identifier: string, otp: string) => Promise<boolean>;
  loginWithDl: (dlNumber: string, abhaProfile: any) => Promise<boolean>;
  loginWithAbhaAccount: (role: 'patient' | 'doctor' | 'operator', account: any, linkedAccounts?: any[]) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, mobile: string) => void;
  logSecurityEvent: (event: string, details: string) => void;
  addNotification: (title: string, message: string, type: 'security' | 'abdm' | 'general') => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  addRecord: (record: HealthRecord) => void;
  setAbhaCreated: (created: boolean, card: any) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  clearNotifications: () => void;
  deleteNotification: (id: number) => void;
  markNotificationRead: (id: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const demoCredentials = {
  admin: { email: "admin@abhasetu.com", pass: "Admin@123", name: "System Administrator" },
  doctor: { email: "doctor@abhasetu.com", pass: "Doctor@123", name: "Dr. Ayesha Ali", photo: "/assets/doctors/dr-ayesha-ali.jpeg" },
  patient: { email: "patient@abhasetu.com", pass: "Patient@123", name: "Dr. Ayesha Ali", photo: "/assets/doctors/dr-ayesha-ali.jpeg" },
  operator: { email: "operator@abhasetu.com", pass: "Operator@123", name: "OPD Desk Operator" }
};

export const demoOtpCredentials = {
  patient: { name: "Aarav Sharma", mobile: "9876543210", aadhaar: "123456789012", abha: "91-1234-5678-9012", photo: "/assets/doctors/dr-ayesha-ali.jpeg" },
  doctor: { name: "Dr. Ayesha Ali", mobile: "9981057765", aadhaar: "987654321098", abha: "91-9876-5432-1098", photo: "/assets/doctors/dr-ayesha-ali.jpeg" },
  operator: { name: "OPD Desk Operator", mobile: "8888888888", aadhaar: "888888888888", abha: "91-8888-8888-8888", photo: "" }
};

const DEFAULT_APPOINTMENTS: Appointment[] = [
  { id: "SETU-APP-101", title: "Video Consultation", doctor: "Dr. Ayesha Ali", meta: "Today, 4:30 PM", status: "Confirmed", token: "SETU-TKN-304" },
  { id: "SETU-APP-102", title: "Blood Test Package", doctor: "CityCare Diagnostics", meta: "Tomorrow, 8:00 AM", status: "Sample Pickup", token: "SETU-TKN-912" }
];

const DEFAULT_RECORDS: HealthRecord[] = [
  { name: "CBC Blood Report", type: "Lab Report", date: "May 14, 2026", source: "Apollo Diagnostics" },
  { name: "Prescription - Fever Care", type: "Prescription", date: "May 10, 2026", source: "Dr. Ayesha Ali" },
  { name: "Health ATM Screening", type: "Vitals", date: "May 08, 2026", source: "ABHA SETU Kiosk" }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: 1, title: "Login Successful", message: "Logged in securely from your browser.", time: "Just now", type: "security", unread: true },
  { id: 2, title: "ABDM Update", message: "Your health records locker is synced and encrypted.", time: "10 mins ago", type: "abdm", unread: true }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [abhaCreated, setAbhaCreatedState] = useState(false);
  const [abhaCard, setAbhaCard] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(DEFAULT_APPOINTMENTS);
  const [records, setRecords] = useState<HealthRecord[]>(DEFAULT_RECORDS);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [activeToken, setActiveTokenState] = useState<ActiveToken | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load state from localStorage on startup
  useEffect(() => {
    try {
      const data = localStorage.getItem('setu_state');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.currentUser) setCurrentUser(parsed.currentUser);
        if (parsed.abhaCreated) setAbhaCreatedState(parsed.abhaCreated);
        if (parsed.abhaCard) setAbhaCard(parsed.abhaCard);
        if (parsed.appointments) setAppointments(parsed.appointments);
        if (parsed.records) setRecords(parsed.records);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.securityLogs) setSecurityLogs(parsed.securityLogs);
        if (parsed.activeToken) setActiveTokenState(parsed.activeToken);
      } else {
        // Initial setup
        const initial = {
          currentUser: null,
          abhaCreated: false,
          abhaCard: null,
          appointments: DEFAULT_APPOINTMENTS,
          records: DEFAULT_RECORDS,
          notifications: DEFAULT_NOTIFICATIONS,
          securityLogs: [{ event: "Platform Init", details: "ABHA Setu security controller successfully loaded.", time: new Date().toLocaleTimeString() }],
          activeToken: null,
          theme: 'dark-teal',
          iconStyle: 'glassmorphic'
        };
        localStorage.setItem('setu_state', JSON.stringify(initial));
        setSecurityLogs(initial.securityLogs);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Synchronize central branding configuration on mount
  useEffect(() => {
    const syncBranding = async () => {
      try {
        const res = await fetch('/api/abdm/admin/config');
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.config) {
            const serverConfig = data.config;
            const current = JSON.parse(localStorage.getItem('setu_state') || '{}');
            let updated = false;

            if (serverConfig.selectedLogo && serverConfig.selectedLogo !== current.selectedLogo) {
              current.selectedLogo = serverConfig.selectedLogo;
              updated = true;
            }
            if (serverConfig.theme && serverConfig.theme !== current.theme) {
              current.theme = serverConfig.theme;
              updated = true;
            }
            if (serverConfig.iconStyle && serverConfig.iconStyle !== current.iconStyle) {
              current.iconStyle = serverConfig.iconStyle;
              updated = true;
            }

            if (updated) {
              localStorage.setItem('setu_state', JSON.stringify(current));
              window.dispatchEvent(new Event('setu_state_update'));
            }
          }
        }
      } catch (e) {
        console.error('Failed to sync branding configurations:', e);
      }
    };
    syncBranding();
  }, []);

  // Prevent navigating away / closing tab if a session is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!currentUser) return;
      const sessionExpiry = localStorage.getItem('abha_session_expiry');
      const isSessionActive = sessionExpiry && Number(sessionExpiry) > Date.now();
      
      if (isSessionActive) {
        e.preventDefault();
        e.returnValue = 'You have an active secure session. Are you sure you want to navigate away?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  // Update helper
  const syncToLocalStorage = (updates: Partial<{
    currentUser: User | null;
    abhaCreated: boolean;
    abhaCard: any;
    appointments: Appointment[];
    records: HealthRecord[];
    notifications: Notification[];
    securityLogs: SecurityLog[];
    activeToken: ActiveToken | null;
  }>) => {
    try {
      const current = JSON.parse(localStorage.getItem('setu_state') || '{}');
      const next = { ...current, ...updates };
      localStorage.setItem('setu_state', JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  const setActiveToken = (token: ActiveToken | null) => {
    setActiveTokenState(token);
    syncToLocalStorage({ activeToken: token });
  };

  const logSecurityEvent = (event: string, details: string) => {
    const sanitizedDetails = details
      .replace(/\b\d{12}\b/g, "************")
      .replace(/\b\d{6}\b/g, "******")
      .replace(/\b\d{10}\b/g, "**********");

    const newLog: SecurityLog = {
      event,
      details: sanitizedDetails,
      time: new Date().toLocaleTimeString()
    };

    setSecurityLogs(prev => {
      const next = [newLog, ...prev].slice(0, 50);
      syncToLocalStorage({ securityLogs: next });
      return next;
    });
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    let matchedRole: 'admin' | 'doctor' | 'patient' | 'operator' | null = null;
    let name = "";
    let photo = "";

    for (const [role, creds] of Object.entries(demoCredentials)) {
      if (creds.email === email && creds.pass === pass) {
        matchedRole = role as any;
        name = creds.name;
        photo = (creds as any).photo || "";
        break;
      }
    }

    if (matchedRole) {
      const newUser: User = {
        email,
        role: matchedRole,
        name,
        photo,
        abhaId: matchedRole === 'patient' ? 'ananya@abdm' : undefined
      };
      setCurrentUser(newUser);
      syncToLocalStorage({ currentUser: newUser });
      logSecurityEvent("User Login", `Authenticated as ${name} (${matchedRole.toUpperCase()})`);
      addNotification("Login Successful", "Logged in securely from your browser.", "security");
      return true;
    } else {
      logSecurityEvent("Login Failed", `Attempted email: ${email}`);
      return false;
    }
  };

  const logout = () => {
    if (currentUser) {
      logSecurityEvent("User Logout", `Signed out session for ${currentUser.name}`);
    }
    setCurrentUser(null);
    localStorage.removeItem('adminToken');
    syncToLocalStorage({ currentUser: null });
    router.push('/login');
  };

  const loginWithJwt = async (token: string, user: User) => {
    setCurrentUser(user);
    localStorage.setItem('adminToken', token);
    syncToLocalStorage({ currentUser: user });
    logSecurityEvent("JWT Admin Login", `Authenticated via secure JWT as ${user.name} (${user.role.toUpperCase()})`);
    addNotification("Secure Login", `Logged in as ${user.role === 'master_admin' ? 'Master Admin' : 'Admin'}`, "security");
  };

  const loginWithOtp = async (role: 'patient' | 'doctor' | 'operator', identifier: string, otp: string): Promise<boolean> => {
    if (otp !== '123456') {
      logSecurityEvent("OTP Login Failed", `Invalid OTP entered for role: ${role.toUpperCase()}`);
      return false;
    }

    const creds = demoOtpCredentials[role];
    if (!creds) return false;

    const cleanedIdentifier = identifier.replace(/[-\s]/g, '');
    const cleanedMobile = creds.mobile.replace(/[-\s]/g, '');
    const cleanedAadhaar = creds.aadhaar.replace(/[-\s]/g, '');
    const cleanedAbha = creds.abha.replace(/[-\s]/g, '');

    if (
      cleanedIdentifier !== cleanedMobile &&
      cleanedIdentifier !== cleanedAadhaar &&
      cleanedIdentifier !== cleanedAbha
    ) {
      logSecurityEvent("OTP Login Failed", `Identifier mismatch for role: ${role.toUpperCase()}`);
      return false;
    }

    const newUser: User = {
      email: `${role}@abhasetu.com`,
      role,
      name: creds.name,
      photo: creds.photo || "",
      abhaId: role === 'patient' ? 'aarav.sharma@sbx' : undefined
    };

    setCurrentUser(newUser);
    syncToLocalStorage({ currentUser: newUser });
    logSecurityEvent("User OTP Login", `Authenticated via OTP as ${creds.name} (${role.toUpperCase()})`);
    addNotification("Login Successful", `OTP verified. Welcomed ${creds.name}.`, "security");
    return true;
  };

  const loginWithDl = async (dlNumber: string, abhaProfile: any): Promise<boolean> => {
    const profile = abhaProfile || {};
    const newUser: User = {
      email: 'patient@abhasetu.com',
      role: 'patient',
      name: profile.name || 'Aarav Sharma',
      photo: profile.photo || '/assets/doctors/dr-ayesha-ali.jpeg',
      abhaId: profile.abhaId || profile.abhaNumber || 'aarav.sharma@sbx',
      abhaProfile: profile,
      mobile: profile.mobile || ''
    };
    setCurrentUser(newUser);
    syncToLocalStorage({ currentUser: newUser });
    logSecurityEvent("User DL Login", `Authenticated via Driving License (${dlNumber}) as ${newUser.name}`);
    addNotification("Login Successful", `DL verified and access granted.`, "security");
    return true;
  };

  const loginWithAbhaAccount = async (role: 'patient' | 'doctor' | 'operator', account: any, linkedAccounts?: any[]): Promise<boolean> => {
    const newUser: User = {
      email: `${role}@abhasetu.com`,
      role,
      name: account.name,
      photo: account.profilePhoto || "",
      abhaId: account.preferredAbhaAddress || account.ABHANumber,
      abhaProfile: account,
      mobile: account.mobile || "",
      linkedAccounts: linkedAccounts || [account]
    };

    setCurrentUser(newUser);
    syncToLocalStorage({ currentUser: newUser });
    logSecurityEvent("User ABHA Account Login", `Authenticated via ABHA account as ${account.name} (${role.toUpperCase()})`);
    addNotification("Login Successful", `ABHA Verified. Welcomed ${account.name}.`, "security");
    return true;
  };

  const register = (name: string, email: string, mobile: string) => {
    const newUser: User = {
      email,
      role: 'patient',
      name,
      photo: '/assets/doctors/dr-ayesha-ali.jpeg',
      abhaId: '',
      mobile
    };
    setCurrentUser(newUser);
    syncToLocalStorage({ currentUser: newUser });
    logSecurityEvent("User Registered", `Patient account created: ${name}, ${email}`);
    addNotification("Account Created", "Welcome to Abha Setu National Digital Health Bridge!", "general");
    router.push('/');
  };

  const addNotification = (title: string, message: string, type: 'security' | 'abdm' | 'general') => {
    const newNotif: Notification = {
      id: Date.now(),
      title,
      message,
      time: "Just now",
      type,
      unread: true
    };
    setNotifications(prev => {
      const next = [newNotif, ...prev].slice(0, 30);
      syncToLocalStorage({ notifications: next });
      return next;
    });
  };

  const addAppointment = (appt: Omit<Appointment, 'id'>) => {
    const newAppt: Appointment = {
      ...appt,
      id: `SETU-APP-${Math.floor(100 + Math.random() * 900)}`
    };
    setAppointments(prev => {
      const next = [newAppt, ...prev];
      syncToLocalStorage({ appointments: next });
      return next;
    });
  };

  const addRecord = (record: HealthRecord) => {
    setRecords(prev => {
      const next = [record, ...prev];
      syncToLocalStorage({ records: next });
      return next;
    });
  };

  const setAbhaCreated = (created: boolean, card: any) => {
    setAbhaCreatedState(created);
    setAbhaCard(card);
    syncToLocalStorage({ abhaCreated: created, abhaCard: card });
  };

  const clearNotifications = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, unread: false }));
      syncToLocalStorage({ notifications: next });
      return next;
    });
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      syncToLocalStorage({ notifications: next });
      return next;
    });
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, unread: false } : n);
      syncToLocalStorage({ notifications: next });
      return next;
    });
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      syncToLocalStorage({ currentUser: next });
      
      // Dispatch a custom event to notify other components/tabs in real-time
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('setu_state_update'));
      }
      
      return next;
    });
  };

  // Route security shield
  useEffect(() => {
    const isPublicPath = 
      pathname === '/login' || 
      pathname === '/register' || 
      pathname === '/admin/login' ||
      pathname === '/staff-login';

    if (!currentUser && !isPublicPath) {
      // Check if we have loaded from localStorage
      const data = localStorage.getItem('setu_state');
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.currentUser) {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [currentUser, pathname, router]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      abhaCreated,
      abhaCard,
      appointments,
      records,
      notifications,
      securityLogs,
      activeToken,
      setActiveToken,
      login,
      loginWithJwt,
      loginWithOtp,
      loginWithDl,
      loginWithAbhaAccount,
      logout,
      register,
      logSecurityEvent,
      addNotification,
      addAppointment,
      addRecord,
      setAbhaCreated,
      updateCurrentUser,
      clearNotifications,
      deleteNotification,
      markNotificationRead
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
