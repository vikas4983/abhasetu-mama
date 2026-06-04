'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { useAuth } from '../../../providers/AuthProvider';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  Info,
  Award,
  HelpCircle
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface Course {
  id: string;
  name: string;
  duration: string;
  registryNo: string;
  type: string;
  eligibility: string;
  description: string;
  curriculumPdf: string;
}

const COURSES_DATABASE: Course[] = [
  {
    id: 'c1',
    name: 'Homeopathic Nursing Assistant',
    duration: '12 Months (2600 Hours)',
    registryNo: 'NAPS-CRS-68F75D',
    type: 'NAPS Registered Apprenticeship',
    eligibility: '10th Pass or Vocational Equivalent',
    description: 'Learn clinical assisting, patient registry management, homeopathic pharmacy stocking, and vital checking.',
    curriculumPdf: 'https://s3.ap-south-1.amazonaws.com/naps-prod/documents/course/68f75d5e21ab4930b20d39d1/curriculum/reOsnvtxEJVNrTC4IQYEDlF830fAVukPGDRIW8Mtp2fZQBjuaczn9W1jXII5.pdf'
  },
  {
    id: 'c2',
    name: 'Clinical Research Coordinator',
    duration: '18 Months (3200 Hours)',
    registryNo: 'NAPS-CRS-90281A',
    type: 'Skill India Apprenticeship',
    eligibility: 'Graduate in Pharmacy or Life Sciences',
    description: 'Comprehensive curriculum in clinical trials protocols, patient compliance log management, and GCP audit audits.',
    curriculumPdf: 'https://s3.ap-south-1.amazonaws.com/naps-prod/documents/course/68f75d5e21ab4930b20d39d1/curriculum/reOsnvtxEJVNrTC4IQYEDlF830fAVukPGDRIW8Mtp2fZQBjuaczn9W1jXII5.pdf'
  },
  {
    id: 'c3',
    name: 'Medical Lab Technician Specialist',
    duration: '15 Months (2800 Hours)',
    registryNo: 'NAPS-CRS-402812',
    type: 'NAPS Skill Certification',
    eligibility: '12th Pass in Science (Biology)',
    description: 'Practical training on sample collection phlebotomy, blood cell counts, biochemistry analysis, and NABL compliance.',
    curriculumPdf: 'https://s3.ap-south-1.amazonaws.com/naps-prod/documents/course/68f75d5e21ab4930b20d39d1/curriculum/reOsnvtxEJVNrTC4IQYEDlF830fAVukPGDRIW8Mtp2fZQBjuaczn9W1jXII5.pdf'
  },
  {
    id: 'c4',
    name: 'ABHA Pharmacy Assistant Specialist',
    duration: '9 Months (1800 Hours)',
    registryNo: 'NAPS-CRS-30129B',
    type: 'NAPS Registered Apprenticeship',
    eligibility: '12th Pass (Any stream)',
    description: 'Hands-on practice in e-pharmacy prescription validation, stock bookkeeping, and digital medicine dispatch.',
    curriculumPdf: 'https://s3.ap-south-1.amazonaws.com/naps-prod/documents/course/68f75d5e21ab4930b20d39d1/curriculum/reOsnvtxEJVNrTC4IQYEDlF830fAVukPGDRIW8Mtp2fZQBjuaczn9W1jXII5.pdf'
  }
];

export default function CoursesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { logSecurityEvent } = useAuth();

  // Active view states
  const [activeCourseId, setActiveCourseId] = useState<string>('c1');
  const [enrollmentName, setEnrollmentName] = useState<string>('Ananya Verma');
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);

  // Quiz evaluation States
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Certificate generation simulator states
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [certSerialNumber, setCertSerialNumber] = useState<string>('');

  const activeCourse = COURSES_DATABASE.find(c => c.id === activeCourseId) || COURSES_DATABASE[0];

  const quizQuestions = [
    {
      q: 'Which registry verifies medical practitioners credentials under ABDM?',
      options: ['NHCX Claims registry', 'Healthcare Professionals Registry (HPR)', 'ABHA Patient Registry', 'NAPS Skill Registry'],
      correct: 'Healthcare Professionals Registry (HPR)',
      desc: 'HPR is the national registry that stores and validates professional licenses for all doctors and practitioners in ABDM.'
    },
    {
      q: 'What is the standard digital format used to package secure health data exchange in India?',
      options: ['FHIR Bundle JSON', 'HL7 XML V2', 'PDF scans', 'Encrypted Text file'],
      correct: 'FHIR Bundle JSON',
      desc: 'Fast Healthcare Interoperability Resources (FHIR) is the standard exchange package structure mandated by ABDM.'
    },
    {
      q: 'For home blood sample extraction, phlebotomists must carry samples in:',
      options: ['Airtight plastic files', 'Dry ice temperature boxes', 'Temperature-sealed cooling carrier boxes', 'Normal room temperature cases'],
      correct: 'Temperature-sealed cooling carrier boxes',
      desc: 'Cold-chain cooling carriers maintain +4°C temperature parameters to prevent biological degradation of clinical samples.'
    }
  ];

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentName.trim()) {
      showToast(t('Please enter student name.'));
      return;
    }
    setIsEnrolled(true);
    logSecurityEvent('Apprenticeship Enrolled', `Registered ${enrollmentName} for NAPS course ${activeCourse.name}`);
    showToast(t('Registered Successfully! NAPS Enrollment ID issued.'));
  };

  const handleOptionSelect = (qIdx: number, val: string) => {
    if (isQuizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: val }));
  };

  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length < quizQuestions.length) {
      showToast(t('Please answer all quiz questions.'));
      return;
    }

    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score++;
    });

    setQuizScore(score);
    setIsQuizSubmitted(true);
    showToast(t(`Practice Test Evaluated: ${score}/${quizQuestions.length}`));
    logSecurityEvent('Practice Quiz Taken', `Completed NAPS training practice quiz for ${activeCourse.name} scoring ${score}/3`);
  };

  const handleGenerateCertificate = () => {
    if (quizScore < 2) {
      showToast(t('Assessment failure: score at least 2 correct answers to qualify for skill certificate.'));
      return;
    }

    const serialNum = `NAPS-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
    setCertSerialNumber(serialNum);
    setShowCertificate(true);
    showToast(t('Assessed Skill Certificate generated!'));
  };

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
            <p className="eyebrow">VOCATIONAL SKILLS DEVELOPMENT</p>
            <h2>{t('NAPS Apprenticeship & Training')}</h2>
            <p>{t('Search clinical technician courses, review Skill India curricula, take practice tests, and qualify for completion certificates.')}</p>
          </div>
          
          {/* Official Registry Anchor */}
          <a
            href="https://www.apprenticeshipindia.gov.in/courses"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--accent-teal)',
              color: '#fff',
              borderRadius: '30px',
              padding: '10px 18px',
              fontSize: '11.5px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 8px 24px color-mix(in srgb, var(--accent-teal) 30%, transparent)'
            }}
          >
            <span>Apprenticeship India Portal</span>
            <ExternalLink style={{ width: '14px', height: '14px' }} />
          </a>
        </div>
      </section>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px', alignItems: 'flex-start' }}>
        
        {/* Left column: Courses list selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
            Registered NAPS Tech Courses
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {COURSES_DATABASE.map(c => {
              const isActive = c.id === activeCourseId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCourseId(c.id);
                    setIsEnrolled(false);
                    setIsQuizSubmitted(false);
                    setQuizAnswers({});
                    setShowCertificate(false);
                  }}
                  className={`route-card ${isActive ? 'selected-card' : ''}`}
                  style={{
                    padding: '16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: 'var(--bg-card)',
                    border: isActive ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                >
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: isActive ? 'var(--accent-teal)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {c.type}
                  </span>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>
                    {c.name}
                  </strong>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                    <span>Reg No: {c.registryNo}</span>
                    <span>•</span>
                    <span>{c.duration.split(' ')[0]} {c.duration.split(' ')[1]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Active Course Panel Details & Training Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <article className="route-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Title / Duration Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--accent-teal)', textTransform: 'uppercase' }}>
                  {activeCourse.type}
                </span>
                <h3 style={{ fontSize: '16px', margin: '4px 0 0', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {activeCourse.name}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '6px', fontSize: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '20px' }}>
                <Clock style={{ width: '12px', height: '12px', color: 'var(--accent-cyan)' }} />
                <span>{activeCourse.duration}</span>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              {activeCourse.description}
            </p>

            {/* Metadata (Eligibility, Curriculum link) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>ELIGIBILITY</span>
                <strong style={{ fontSize: '11px', display: 'block', color: 'var(--text-primary)', marginTop: '2px' }}>{activeCourse.eligibility}</strong>
              </div>
              <div>
                <span style={{ fontSize: '8.5px', color: 'var(--text-muted)' }}>CURRICULUM SYLLABUS</span>
                <a
                  href={activeCourse.curriculumPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--accent-teal)',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    marginTop: '2px'
                  }}
                >
                  <FileText style={{ width: '12px', height: '12px' }} />
                  <span>Download Curriculum</span>
                </a>
              </div>
            </div>

            {/* Enrollment / Registration form */}
            {!isEnrolled ? (
              <form onSubmit={handleEnrollSubmit} style={{ display: 'grid', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Apprenticeship Sandbox Enrollment</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="student-name-input"
                    type="text"
                    required
                    value={enrollmentName}
                    onChange={(e) => setEnrollmentName(e.target.value)}
                    placeholder="Enter student full name"
                    style={{ flex: 1, padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    aria-label="Student full name for enrollment"
                  />
                  <button type="submit" style={{ padding: '8px 16px', background: 'var(--accent-teal)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Enroll Course
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ background: 'rgba(0,212,170,0.06)', border: '1px dashed var(--accent-teal)', padding: '14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-teal)' }}>
                  <CheckCircle style={{ width: '15px', height: '15px' }} />
                  <strong style={{ fontSize: '12px' }}>Student Enrolled Successfully</strong>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Student Name: <strong>{enrollmentName}</strong> | Enrollment ID: <strong>NAPS-ST-{activeCourse.registryNo.substring(9)}</strong>
                </span>
              </div>
            )}

          </article>

          {/* ================= PRACTICE ASSESSMENT INTERACTIVE QUIZ ================= */}
          {isEnrolled && (
            <article className="route-card" style={{ padding: '24px' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <HelpCircle style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>Qualification Practice Assessment</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {quizQuestions.map((qObj, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: idx < 2 ? '1px solid var(--border-color)' : 'none', paddingBottom: idx < 2 ? '12px' : 0 }}>
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      Q{idx + 1}. {qObj.q}
                    </strong>

                    <div style={{ display: 'grid', gap: '6px' }}>
                      {qObj.options.map(opt => {
                        const isSelected = quizAnswers[idx] === opt;
                        const isCorrectOption = opt === qObj.correct;
                        
                        let optionBg = 'var(--bg-secondary)';
                        let optionBorder = 'var(--border-color)';
                        
                        if (isSelected) {
                          optionBg = 'color-mix(in srgb, var(--accent-teal) 8%, transparent)';
                          optionBorder = 'var(--accent-teal)';
                        }
                        
                        if (isQuizSubmitted) {
                          if (isCorrectOption) {
                            optionBg = 'rgba(0, 212, 170, 0.12)';
                            optionBorder = 'var(--success)';
                          } else if (isSelected) {
                            optionBg = 'rgba(239, 68, 68, 0.12)';
                            optionBorder = 'var(--danger)';
                          }
                        }

                        return (
                          <div
                            key={opt}
                            onClick={() => handleOptionSelect(idx, opt)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: `1.5px solid ${optionBorder}`,
                              background: optionBg,
                              fontSize: '11px',
                              cursor: isQuizSubmitted ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSelected ? 'var(--accent-teal)' : 'var(--border-color)' }}></span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {isQuizSubmitted && (
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4, paddingLeft: '6px', borderLeft: '2px solid var(--border-color)' }}>
                        <strong>Explanation:</strong> {qObj.desc}
                      </p>
                    )}
                  </div>
                ))}

                {/* Evaluation Trigger Button */}
                {!isQuizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'var(--accent-teal)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    Evaluate Practice Test Answers
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        Assessment Score: <strong>{quizScore} / 3 Correct</strong>
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: quizScore >= 2 ? 'var(--success)' : 'var(--danger)' }}>
                        {quizScore >= 2 ? 'PASSED QUALIFICATION' : 'FAIL (Need 2/3)'}
                      </span>
                    </div>

                    {quizScore >= 2 ? (
                      <button
                        onClick={handleGenerateCertificate}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'var(--accent-teal)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Award style={{ width: '14px', height: '14px' }} />
                        <span>Generate NAPS Assessed Certificate</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'transparent',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        Retry Practice Assessment
                      </button>
                    )}
                  </div>
                )}

              </div>
            </article>
          )}

          {/* ================= ASSESSED COMPLETION CERTIFICATE ================= */}
          {showCertificate && certSerialNumber && (
            <article className="route-card" style={{ padding: '24px', border: '1.5px solid var(--accent-teal)' }}>
              
              <div className="certificate-frame" style={{ border: '2px solid var(--accent-teal)', padding: '20px', position: 'relative', overflow: 'hidden', background: 'var(--bg-secondary)', borderRadius: '10px', boxShadow: 'inset 0 0 20px rgba(0,212,170,0.03)' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--accent-teal)', letterSpacing: '2px' }}>NATIONAL APPRENTICESHIP PROMOTION SCHEME</span>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Government of India - Skill India Hub</span>
                  <hr style={{ border: 'none', borderTop: '1.5px double var(--border-color)', margin: '8px 0' }} />
                  
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase' }}>Certificate of Skill Assessment</h4>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>This is to certify that student</span>
                  <strong style={{ fontSize: '15px', color: 'var(--text-primary)', display: 'block' }}>{enrollmentName}</strong>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                    has successfully completed pre-apprentice practice test requirements for
                  </span>
                  <strong style={{ fontSize: '12px', color: 'var(--accent-teal)', textTransform: 'uppercase' }}>{activeCourse.name}</strong>
                  
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '9px', color: 'var(--text-muted)', textAlign: 'left', marginTop: '6px' }}>
                    <div>
                      <span>License Serial: <strong>{certSerialNumber}</strong></span><br />
                      <span>Registry Course: <strong>{activeCourse.registryNo}</strong></span>
                    </div>
                    <div style={{ textAlign: 'center', border: '1.5px solid var(--accent-teal)', padding: '4px 8px', borderRadius: '4px', color: 'var(--accent-teal)', fontWeight: 'bold', fontSize: '10px' }}>
                      NAPS SKILLS<br />PASSED
                    </div>
                  </div>

                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowCertificate(false)}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Close Certificate View
              </button>

            </article>
          )}

        </div>

      </div>
    </>
  );
}
