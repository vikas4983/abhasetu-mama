"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../providers/AuthProvider";
import { useLanguage } from "../../../providers/LanguageProvider";
import {
  UserRound,
  Stethoscope,
  Users,
  ShieldCheck,
  Sparkles,
  Loader2,
  Phone,
  CreditCard,
  Heart,
  Info,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Lock,
  ArrowLeft,
  Fingerprint,
  Upload,
  Image as ImageIcon,
  FileText,
  Check,
  Trash2,
  MapPin,
  Search,
  Globe,
  LogIn,
  UserPlus,
  Home,
} from "lucide-react";
import { showToast } from "../../../utils/toast";
import LogoLoader from "../../../components/common/LogoLoader";
import {
  DRIVING_LICENSE_REGEX,
  ABHA_NUMBER_REGEX,
  ABHA_ADDRESS_REGEX,
  INDIAN_MOBILE_REGEX,
  AADHAAR_REGEX,
} from "../../../constants/regex.constants";

/**
 * Normalizes and returns the base64 source or static path of a profile image.
 * @param {string} photo - base64 string or image path
 * @returns {string} parsed image source
 */
const getPhotoSrc = (photo: string): string => {
  if (!photo) return "";
  if (photo.startsWith("data:") || photo.startsWith("http")) {
    return photo;
  }
  if (photo.startsWith("/9j/")) {
    return `data:image/jpeg;base64,${photo}`;
  }
  if (photo.startsWith("/")) {
    return photo;
  }
  return `data:image/jpeg;base64,${photo}`;
};

/**
 * Simple secure XOR encryption with Base64 encoding/decoding.
 */
const cryptState = (text: string, key: string): string => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length),
    );
  }
  return btoa(unescape(encodeURIComponent(result)));
};

const decryptState = (cipherText: string, key: string): string => {
  try {
    const decoded = decodeURIComponent(escape(atob(cipherText)));
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length),
      );
    }
    return result;
  } catch (e) {
    return "";
  }
};

/**
 * Gets or generates a transient session key stored in window.name.
 */
const getSessionKey = (): string => {
  if (typeof window === "undefined") return "fallback-key-temp";
  let key = window.name;
  if (!key || key.length < 16) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    key = Array.from(
      { length: 32 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    window.name = key;
  }
  return key;
};

/**
 * Compresses base64 image using canvas.
 */
const compressImage = (
  base64Str: string,
  maxSizeKb: number = 100,
): Promise<{ base64: string; sizeKb: number }> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve({ base64: base64Str, sizeKb: 0 });
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxDimension = 1000;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({
          base64: base64Str,
          sizeKb: Math.round((base64Str.length * 0.75) / 1024),
        });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.8;
      let resultDataUrl = canvas.toDataURL("image/jpeg", quality);
      let sizeKb = Math.round(((resultDataUrl.length - 22) * 3) / 4 / 1024);

      while (sizeKb > maxSizeKb && quality > 0.1) {
        quality -= 0.1;
        resultDataUrl = canvas.toDataURL("image/jpeg", quality);
        sizeKb = Math.round(((resultDataUrl.length - 22) * 3) / 4 / 1024);
      }
      resolve({ base64: resultDataUrl, sizeKb });
    };
    img.onerror = () => {
      resolve({
        base64: base64Str,
        sizeKb: Math.round((base64Str.length * 0.75) / 1024),
      });
    };
  });
};

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loginWithOtp, loginWithDl, loginWithAbhaAccount } = useAuth();

  const [selectedRole, setSelectedRole] = useState<
    "patient" | "doctor" | "operator"
  >("patient");
  const [activeTab, setActiveTab] = useState<
    "mobile" | "aadhaar" | "abha" | "dl"
  >("mobile");
  const [identifier, setIdentifier] = useState("");
  const [aadhaarMobile, setAadhaarMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSentRaw, setOtpSentRaw] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [otpError, setOtpError] = useState(false); // true when OTP submission fails — triggers red highlight + shake
  const [showSelectModal, setShowSelectModal] = useState(false);

  const [flowStateRaw, setFlowStateRaw] = useState<
    | "menu"
    | "login_submenu"
    | "create_submenu"
    | "login_mobile"
    | "login_aadhaar"
    | "login_abha"
    | "create_aadhaar"
    | "create_dl"
    | "find_mobile"
  >("menu");
  const [findMobile, setFindMobile] = useState("");
  const [findTxnId, setFindTxnId] = useState("");
  const [foundProfiles, setFoundProfiles] = useState<any[]>([]);

  // Mobile drawer states
  const [drawerTypeRaw, setDrawerTypeRaw] = useState<
    "login" | "create" | "find" | "main" | null
  >(null);
  const [drawerActive, setDrawerActive] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [fadeOpacity, setFadeOpacity] = useState(1);

  const transitionState = (updateFn: () => void) => {
    setFadeOpacity(0);
    setTimeout(() => {
      updateFn();
      setFadeOpacity(1);
    }, 150);
  };

  const setFlowState = (
    val:
      | typeof flowStateRaw
      | ((prev: typeof flowStateRaw) => typeof flowStateRaw),
  ) => {
    transitionState(() => setFlowStateRaw(val));
  };
  const flowState = flowStateRaw;

  const setDrawerType = (
    val:
      | typeof drawerTypeRaw
      | ((prev: typeof drawerTypeRaw) => typeof drawerTypeRaw),
  ) => {
    transitionState(() => setDrawerTypeRaw(val));
  };
  const drawerType = drawerTypeRaw;

  const setOtpSent = (val: boolean | ((prev: boolean) => boolean)) => {
    transitionState(() => setOtpSentRaw(val));
  };
  const otpSent = otpSentRaw;

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setDrawerTypeRaw("main");
        setDrawerActive(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMobileGestureBack = () => {
    if (!drawerActive || !drawerType) return;
    setErrorMsg("");
    if (otpSent) {
      setOtpSent(false);
      setOtpParts(["", "", "", "", "", ""]);
      return;
    }

    if (drawerType === "main") {
      return; // Cannot back out of main drawer!
    }
    setIdentifier("");
    setAadhaarMobile("");
    setAadhaarParts(["", "", ""]);
    setAbhaParts(["", "", "", ""]);
    setOtpParts(["", "", "", "", "", ""]);
    setDlParts(["", "", "", ""]);
    setDlMobile("");
    setDlNumber("");
    setMobileTxnId("");
    setFindMobile("");
    setFindTxnId("");
    setFoundProfiles([]);
    setErrorMsg("");

    if (
      flowState === "login_mobile" ||
      flowState === "login_aadhaar" ||
      flowState === "login_abha"
    ) {
      setFlowState("menu");
    } else if (flowState === "create_aadhaar" || flowState === "create_dl") {
      setFlowState("menu");
    } else if (flowState === "find_mobile") {
      setFlowState("menu");
      setDrawerType("main");
    } else if (flowState === "menu") {
      setDrawerType("main");
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            activeEl.getAttribute("contenteditable") === "true")
        ) {
          return;
        }
        e.preventDefault();
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          handleMobileGestureBack();
        } else {
          handleWebBack();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flowState, otpSent, drawerType, drawerActive]);

  React.useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 50;
    const maxVerticalDeviation = 30;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = Math.abs(touchEndY - touchStartY);

      if (Math.abs(diffX) > minSwipeDistance && diffY < maxVerticalDeviation) {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          handleMobileGestureBack();
        } else {
          handleWebBack();
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [flowState, otpSent, drawerType, drawerActive]);

  const openDrawer = (type: "login" | "create" | "find" | "main") => {
    setDrawerType(type);
    if (type === "find") {
      setFlowState("find_mobile");
    } else {
      setFlowState("menu");
    }
    setTimeout(() => {
      setDrawerActive(true);
    }, 10);
  };

  const closeDrawer = () => {
    setDrawerActive(false);
    setTimeout(() => {
      setDrawerType(null);
      setFlowState("menu");
      setOtpSent(false);
      setIdentifier("");
      setAadhaarMobile("");
      setAadhaarParts(["", "", ""]);
      setAbhaParts(["", "", "", ""]);
      setOtpParts(["", "", "", "", "", ""]);
      setDlParts(["", "", "", ""]);
      setDlMobile("");
      setDlNumber("");
      setMobileTxnId("");
      setFindMobile("");
      setFindTxnId("");
      setFoundProfiles([]);
      setErrorMsg("");
    }, 300);
  };

  const LanguageSwitcher = ({ isDrawer = false }: { isDrawer?: boolean }) => {
    const { language, setLanguage } = useLanguage();

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          position: "absolute",
          top: isDrawer ? "16px" : "20px",
          right: isDrawer ? "16px" : "20px",
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid var(--border-color)",
          padding: "4px 8px",
          borderRadius: "20px",
          backdropFilter: "blur(8px)",
          transition: "all 0.2s",
        }}
      >
        <Globe
          style={{ width: "13px", height: "13px", color: "var(--accent-teal)" }}
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            fontSize: "11px",
            fontWeight: "bold",
            outline: "none",
            cursor: "pointer",
            paddingRight: "4px",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
          }}
          aria-label="Select Language"
        >
          <option
            value="EN"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            EN
          </option>
          <option
            value="HI"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            हिंदी (HI)
          </option>
          <option
            value="TA"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            தமிழ் (TA)
          </option>
          <option
            value="TE"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            తెలుగు (TE)
          </option>
          <option
            value="BN"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            বাংলা (BN)
          </option>
          <option
            value="MR"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            मराठी (MR)
          </option>
          <option
            value="GU"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            ગુજરાતી (GU)
          </option>
          <option
            value="KN"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            ಕನ್ನಡ (KN)
          </option>
        </select>
        <ChevronDown
          style={{
            width: "10px",
            height: "10px",
            pointerEvents: "none",
            color: "var(--text-secondary)",
          }}
        />
      </div>
    );
  };

  const HomeButton = ({ isDrawer = false }: { isDrawer?: boolean }) => {
    return null;
  };

  const renderLargeLogo = (
    type: "mobile" | "aadhaar" | "abha" | "dl" | "find",
  ) => {
    if (type === "find") {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "4px 0 12px 0",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              width: "110px",
              height: "64px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.05))",
                border: "1px solid rgba(20, 184, 166, 0.25)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 24px rgba(20, 184, 166, 0.15)",
                position: "absolute",
                left: "10px",
                zIndex: 1,
              }}
            >
              <img
                src="/assets/logos/mobile_login.svg"
                alt="Mobile"
                style={{
                  // width: "36px",
                  // height: "36px",
                  objectFit: "contain",
                  filter: "var(--logo-filter)",
                }}
              />
            </div>
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "var(--text-primary)",
            }}
          >
            {t("Find ABHA via Mobile")}
          </span>
        </div>
      );
    }

    const srcMap = {
      mobile: "/assets/logos/mobile_login.svg",
      aadhaar: "/assets/logos/aadhaar.png",
      abha: "/assets/logos/abha.png",
      dl: "/assets/logos/dl.png",
    };
    const titleMap = {
      mobile: t("Mobile OTP"),
      aadhaar: t("Aadhaar Card"),
      abha: t("ABHA ID"),
      dl: t("Driving License"),
    };
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "4px 0 12px 0",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "rgba(20, 184, 166, 0.08)",
            border: "1px solid rgba(20, 184, 166, 0.25)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 6px 20px rgba(20, 184, 166, 0.1)",
          }}
        >
          <img
            src={srcMap[type]}
            alt={titleMap[type]}
            style={{
              width: type === "mobile" ? "30px" : "38px",
              height: type === "mobile" ? "30px" : "38px",
              objectFit: "contain",
              filter:
                type === "mobile" || type === "abha"
                  ? "var(--logo-filter)"
                  : "none",
            }}
          />
        </div>
      </div>
    );
  };

  const renderSelectionCards = (isMobileDrawer: boolean = false) => {
    const handleChoice = (choice: "login" | "create" | "find") => {
      if (isMobileDrawer) {
        setOtpSent(false);
        setIdentifier("");
        setAadhaarMobile("");
        setAadhaarParts(["", "", ""]);
        setAbhaParts(["", "", "", ""]);
        setOtpParts(["", "", "", "", "", ""]);
        setDlParts(["", "", "", ""]);
        setDlMobile("");
        setDlNumber("");
        setMobileTxnId("");
        setFindMobile("");
        setFindTxnId("");
        setFoundProfiles([]);
        setErrorMsg("");

        if (choice === "find") {
          setFlowState("find_mobile");
          setDrawerType("find");
        } else {
          setFlowState("menu");
          setDrawerType(choice);
        }
      } else {
        handlePrimaryChoice(choice);
      }
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
        }}
      >
        {/* Option 1: Login */}
        <button
          type="button"
          onClick={() => handleChoice("login")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "14px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            background: "rgba(255, 255, 255, 0.02)",
            color: "var(--text-primary)",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            width: "100%",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = "1px solid var(--accent-teal)";
            e.currentTarget.style.background = "rgba(20, 184, 166, 0.04)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(20, 184, 166, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = "1px solid var(--border-color)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
        >
          {/* Universal Icon */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(20, 184, 166, 0.08)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              border: "1px solid rgba(20, 184, 166, 0.25)",
            }}
          >
            <LogIn
              style={{
                width: "22px",
                height: "22px",
                color: "var(--accent-teal)",
              }}
            />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                {t("Login")}
              </span>
              <span
                style={{
                  fontSize: "8px",
                  background: "rgba(20, 184, 166, 0.15)",
                  color: "var(--accent-teal)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Sign In
              </span>
            </div>
            <div
              style={{
                fontSize: "10.5px",
                color: "var(--text-secondary)",
                marginTop: "2px",
                lineHeight: "1.3",
              }}
            >
              Access clinical profile using linked credentials.
            </div>
            {/* Small badged images */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "8.5px",
                  color: "var(--text-secondary)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "2px 5px",
                  borderRadius: "4px",
                }}
              >
                <img
                  src="/assets/logos/mobile.png"
                  alt=""
                  style={{
                    width: "9px",
                    height: "9px",
                    objectFit: "contain",
                    filter: "var(--logo-filter)",
                  }}
                />
                <span>Mobile</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "8.5px",
                  color: "var(--text-secondary)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "2px 5px",
                  borderRadius: "4px",
                }}
              >
                <img
                  src="/assets/logos/aadhaar.png"
                  alt=""
                  style={{ width: "9px", height: "9px", objectFit: "contain" }}
                />
                <span>Aadhaar</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "8.5px",
                  color: "var(--text-secondary)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "2px 5px",
                  borderRadius: "4px",
                }}
              >
                <img
                  src="/assets/logos/abha.png"
                  alt=""
                  style={{
                    width: "9px",
                    height: "9px",
                    objectFit: "contain",
                    filter: "var(--logo-filter)",
                  }}
                />
                <span>ABHA</span>
              </div>
            </div>
          </div>
        </button>

        {/* Option 2: Create ABHA */}
        <button
          type="button"
          onClick={() => handleChoice("create")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "14px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            background: "rgba(255, 255, 255, 0.02)",
            color: "var(--text-primary)",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            width: "100%",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = "1px solid var(--accent-teal)";
            e.currentTarget.style.background = "rgba(20, 184, 166, 0.04)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(20, 184, 166, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = "1px solid var(--border-color)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
        >
          {/* Universal Icon */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(20, 184, 166, 0.08)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              border: "1px solid rgba(20, 184, 166, 0.25)",
            }}
          >
            <UserPlus
              style={{
                width: "20px",
                height: "20px",
                color: "var(--accent-teal)",
              }}
            />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                {t("Create ABHA")}
              </span>
              <span
                style={{
                  fontSize: "8px",
                  background: "rgba(20, 184, 166, 0.15)",
                  color: "var(--accent-teal)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                New Card
              </span>
            </div>
            <div
              style={{
                fontSize: "10.5px",
                color: "var(--text-secondary)",
                marginTop: "2px",
                lineHeight: "1.3",
              }}
            >
              Register and generate a new ABHA card instantly.
            </div>
            {/* Small badged images */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "8.5px",
                  color: "var(--text-secondary)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "2px 5px",
                  borderRadius: "4px",
                }}
              >
                <img
                  src="/assets/logos/aadhaar.png"
                  alt=""
                  style={{ width: "9px", height: "9px", objectFit: "contain" }}
                />
                <span>Aadhaar</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "8.5px",
                  color: "var(--text-secondary)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "2px 5px",
                  borderRadius: "4px",
                }}
              >
                <img
                  src="/assets/logos/dl.png"
                  alt=""
                  style={{ width: "9px", height: "9px", objectFit: "contain" }}
                />
                <span>DL ID</span>
              </div>
            </div>
          </div>
        </button>

        {/* Option 3: Find ABHA */}
        <button
          type="button"
          onClick={() => handleChoice("find")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "14px",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            background: "rgba(255, 255, 255, 0.02)",
            color: "var(--text-primary)",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            width: "100%",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = "1px solid var(--accent-teal)";
            e.currentTarget.style.background = "rgba(20, 184, 166, 0.04)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(20, 184, 166, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = "1px solid var(--border-color)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
        >
          {/* Universal Icon */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(20, 184, 166, 0.08)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              border: "1px solid rgba(20, 184, 166, 0.25)",
            }}
          >
            <Search
              style={{
                width: "20px",
                height: "20px",
                color: "var(--accent-teal)",
              }}
            />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                {t("Find ABHA")}
              </span>
              <span
                style={{
                  fontSize: "8px",
                  background: "rgba(255,255,255,0.1)",
                  color: "var(--text-secondary)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Retrieve
              </span>
            </div>
            <div
              style={{
                fontSize: "10.5px",
                color: "var(--text-secondary)",
                marginTop: "2px",
                lineHeight: "1.3",
              }}
            >
              Retrieve registered ABHA cards using linked phone.
            </div>
            {/* Small badged images */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "8.5px",
                  color: "var(--text-secondary)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "2px 5px",
                  borderRadius: "4px",
                }}
              >
                <img
                  src="/assets/logos/mobile_hand.png"
                  alt=""
                  style={{
                    width: "9px",
                    height: "9px",
                    objectFit: "contain",
                    filter: "var(--logo-filter)",
                  }}
                />
                <span>Mobile</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "8.5px",
                  color: "var(--text-secondary)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "2px 5px",
                  borderRadius: "4px",
                }}
              >
                <img
                  src="/assets/logos/abha.png"
                  alt=""
                  style={{
                    width: "9px",
                    height: "9px",
                    objectFit: "contain",
                    filter: "var(--logo-filter)",
                  }}
                />
                <span>ABHA</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  };

  const handlePrimaryChoice = (choice: "login" | "create" | "find") => {
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        openDrawer(choice);
      } else {
        if (choice === "login") {
          setFlowState("login_submenu");
        } else if (choice === "create") {
          setFlowState("create_submenu");
        } else if (choice === "find") {
          setFlowState("find_mobile");
        }
      }
    }, 600);
  };

  const otpInputRef = React.useRef<HTMLInputElement>(null);

  // Profile Login States (Mobile/ABHA Number login)
  const [mobileTxnId, setMobileTxnId] = useState("");
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
  const [showAccountSelectModal, setShowAccountSelectModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);

  React.useEffect(() => {
    if (otpSent) {
      // Focus the first OTP digit box as soon as the OTP step is shown
      const t = setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 150);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpSent]);

  // DL Specific States
  const [dlNumber, setDlNumber] = useState("");
  const [dlMobile, setDlMobile] = useState("");
  const [showDlModalRaw, setShowDlModalRaw] = useState(false);
  const setShowDlModal = (val: boolean | ((prev: boolean) => boolean)) => {
    transitionState(() => setShowDlModalRaw(val));
  };
  const showDlModal = showDlModalRaw;
  const [dlFirstName, setDlFirstName] = useState("");
  const [dlMiddleName, setDlMiddleName] = useState("");
  const [dlLastName, setDlLastName] = useState("");

  // Split input states
  const [aadhaarParts, setAadhaarParts] = useState(["", "", ""]);
  const [abhaParts, setAbhaParts] = useState(["", "", "", ""]);
  const [otpParts, setOtpParts] = useState(["", "", "", "", "", ""]);
  const [dlParts, setDlParts] = useState(["", "", "", ""]);
  const [useAbhaAddress, setUseAbhaAddress] = useState(false);

  // Refs for split inputs
  const aadhaarRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];
  const abhaRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];
  const otpRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];
  const dlRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

  const handleSplitChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    parts: string[],
    setParts: (newParts: string[]) => void,
    refs: React.RefObject<HTMLInputElement | null>[],
    maxLength: number,
    allowedRegex: RegExp,
  ) => {
    const val = e.target.value.replace(allowedRegex, "");
    const newParts = [...parts];
    newParts[index] = val.slice(0, maxLength);
    setParts(newParts);

    // Auto-advance if value reached max length
    if (val.length >= maxLength && index < refs.length - 1) {
      refs[index + 1].current?.focus();
    }
  };

  const handleSplitKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    parts: string[],
    refs: React.RefObject<HTMLInputElement | null>[],
  ) => {
    // Reverse focus on Backspace if current field is empty
    if (e.key === "Backspace" && !parts[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleSplitPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    type: "aadhaar" | "abha" | "otp" | "dl",
  ) => {
    e.preventDefault();
    const rawText = e.clipboardData.getData("text");

    if (type === "aadhaar") {
      const cleanText = rawText.replace(/\D/g, "").slice(0, 12);
      const newParts = [
        cleanText.slice(0, 4),
        cleanText.slice(4, 8),
        cleanText.slice(8, 12),
      ];
      setAadhaarParts(newParts);
      const focusIdx = Math.min(Math.floor((cleanText.length - 1) / 4) + 1, 2);
      aadhaarRefs[Math.max(0, focusIdx)].current?.focus();
    } else if (type === "abha") {
      const cleanText = rawText.replace(/\D/g, "").slice(0, 14);
      const newParts = [
        cleanText.slice(0, 2),
        cleanText.slice(2, 6),
        cleanText.slice(6, 10),
        cleanText.slice(10, 14),
      ];
      setAbhaParts(newParts);
      let focusIdx = 0;
      if (cleanText.length > 2) {
        focusIdx = Math.min(Math.floor((cleanText.length - 3) / 4) + 1, 3);
      } else if (cleanText.length > 0) {
        focusIdx = 0;
      }
      abhaRefs[focusIdx].current?.focus();
    } else if (type === "otp") {
      const cleanText = rawText.replace(/\D/g, "").slice(0, 6);
      const newParts = Array(6).fill("");
      for (let i = 0; i < cleanText.length; i++) {
        newParts[i] = cleanText[i];
      }
      setOtpParts(newParts);
      const focusIdx = Math.min(cleanText.length, 5);
      otpRefs[focusIdx].current?.focus();
    } else if (type === "dl") {
      const cleanText = rawText.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const part0 = cleanText.slice(0, 2).replace(/[^A-Z]/g, "");
      const part1 = cleanText.slice(2, 5).replace(/[^A-Z0-9]/g, "");
      const part2 = cleanText.slice(5, 9).replace(/\D/g, "");
      const part3 = cleanText.slice(9, 16).replace(/\D/g, "");

      setDlParts([part0, part1, part2, part3]);

      if (part3.length > 0) {
        dlRefs[3].current?.focus();
      } else if (part2.length > 0) {
        dlRefs[2].current?.focus();
      } else if (part1.length > 0) {
        dlRefs[1].current?.focus();
      } else {
        dlRefs[0].current?.focus();
      }
    }
  };

  const handleWebBack = () => {
    setErrorMsg("");
    if (otpSent) {
      setOtpSent(false);
      setOtpParts(["", "", "", "", "", ""]);
      return;
    }

    setIdentifier("");
    setAadhaarMobile("");
    setAadhaarParts(["", "", ""]);
    setAbhaParts(["", "", "", ""]);
    setOtpParts(["", "", "", "", "", ""]);
    setDlParts(["", "", "", ""]);
    setDlMobile("");
    setDlNumber("");
    setMobileTxnId("");
    setFindMobile("");
    setFindTxnId("");
    setFoundProfiles([]);

    if (
      flowState === "login_mobile" ||
      flowState === "login_aadhaar" ||
      flowState === "login_abha"
    ) {
      setFlowState("login_submenu");
    } else if (flowState === "create_aadhaar" || flowState === "create_dl") {
      setFlowState("create_submenu");
    } else if (flowState === "find_mobile") {
      setFlowState("menu");
    } else if (
      flowState === "login_submenu" ||
      flowState === "create_submenu"
    ) {
      setFlowState("menu");
    }
  };

  const getDlFormProgress = () => {
    let points = 0;
    const maxPoints = 82;

    // 1. DL Number (15 chars max)
    points += Math.min(dlParts.join("").length, 15);

    // 2. First Name (capped at 5)
    points += Math.min(dlFirstName.trim().length, 5);

    // 3. Last Name (capped at 5)
    points += Math.min(dlLastName.trim().length, 5);

    // 4. DOB (capped at 10)
    points += Math.min(dlDob.length, 10);

    // 5. Gender (1 point)
    if (dlGender) points += 1;

    // 6. Address (capped at 15)
    points += Math.min(dlAddress.trim().length, 15);

    // 7. Pincode (6 digits max)
    points += Math.min(dlPinCode.length, 6);

    // 8. State (5 points)
    if (dlState.trim()) points += 5;

    // 9. District (5 points)
    if (dlDistrict.trim()) points += 5;

    // 10. Front Photo (15 points)
    if (dlFrontPhoto) points += 15;

    return Math.round((points / maxPoints) * 100);
  };

  const getLoginProgress = () => {
    let current = 0;
    let total = 10;

    if (flowState === "find_mobile") {
      current = findMobile.length;
      total = 10;
    } else if (activeTab === "mobile") {
      current = identifier.length;
      total = 10;
    } else if (activeTab === "aadhaar") {
      current = aadhaarParts.join("").length;
      total = 12;
    } else if (activeTab === "abha") {
      if (useAbhaAddress) {
        current = Math.min(identifier.length, 14);
        total = 14;
      } else {
        current = abhaParts.join("").length;
        total = 14;
      }
    } else if (activeTab === "dl") {
      current = dlMobile.length;
      total = 10;
    }

    if (otpSent) {
      const otpLen = otpParts.join("").length;
      const combinedCurrent = total + otpLen;
      const combinedTotal = total + 6;
      return Math.round((combinedCurrent / combinedTotal) * 100);
    }

    return Math.round((current / total) * 100);
  };
  const [dlDob, setDlDob] = useState("1994-04-26");
  const [dlGender, setDlGender] = useState("M");
  const [dlFrontPhoto, setDlFrontPhoto] = useState("");
  const [dlBackPhoto, setDlBackPhoto] = useState("");
  const [dlAddress, setDlAddress] = useState("");
  const [dlState, setDlState] = useState("");
  const [dlDistrict, setDlDistrict] = useState("");
  const [dlPinCode, setDlPinCode] = useState("");
  const [dlModalStep, setDlModalStep] = useState(1);
  const [dlFrontPhotoSize, setDlFrontPhotoSize] = useState(0);
  const [dlFrontPhotoOrigSize, setDlFrontPhotoOrigSize] = useState(0);
  const [dlBackPhotoSize, setDlBackPhotoSize] = useState(0);
  const [dlBackPhotoOrigSize, setDlBackPhotoOrigSize] = useState(0);

  // Load draft state on mount (with secure decryption)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const encryptedDraft = sessionStorage.getItem("setu_dl_draft");
      if (encryptedDraft) {
        const key = getSessionKey();
        const decrypted = decryptState(encryptedDraft, key);
        if (decrypted) {
          const draft = JSON.parse(decrypted);
          if (draft.dlNumber) {
            setDlNumber(draft.dlNumber);
            const num = draft.dlNumber;
            const state = num.substring(0, 2);
            const yearMatch = num.match(/(19|20)\d{2}/);
            let rto = "";
            let year = "";
            let serial = "";
            if (yearMatch && yearMatch.index !== undefined) {
              rto = num.substring(2, yearMatch.index);
              year = yearMatch[0];
              serial = num.substring(yearMatch.index + 4);
            } else {
              rto = num.substring(2, 4);
              year = num.substring(4, 8);
              serial = num.substring(8);
            }
            setDlParts([state, rto, year, serial]);
          }
          if (draft.dlMobile) setDlMobile(draft.dlMobile);
          if (draft.showDlModal) setShowDlModal(draft.showDlModal);
          if (draft.dlFirstName) setDlFirstName(draft.dlFirstName);
          if (draft.dlMiddleName) setDlMiddleName(draft.dlMiddleName);
          if (draft.dlLastName) setDlLastName(draft.dlLastName);
          if (draft.dlDob) setDlDob(draft.dlDob);
          if (draft.dlGender) setDlGender(draft.dlGender);
          if (draft.dlFrontPhoto) setDlFrontPhoto(draft.dlFrontPhoto);
          if (draft.dlBackPhoto) setDlBackPhoto(draft.dlBackPhoto);
          if (draft.dlAddress) setDlAddress(draft.dlAddress);
          if (draft.dlState) setDlState(draft.dlState);
          if (draft.dlDistrict) setDlDistrict(draft.dlDistrict);
          if (draft.dlPinCode) setDlPinCode(draft.dlPinCode);
          if (draft.dlModalStep) setDlModalStep(draft.dlModalStep);
          if (draft.dlFrontPhotoSize)
            setDlFrontPhotoSize(draft.dlFrontPhotoSize);
          if (draft.dlFrontPhotoOrigSize)
            setDlFrontPhotoOrigSize(draft.dlFrontPhotoOrigSize);
          if (draft.dlBackPhotoSize) setDlBackPhotoSize(draft.dlBackPhotoSize);
          if (draft.dlBackPhotoOrigSize)
            setDlBackPhotoOrigSize(draft.dlBackPhotoOrigSize);

          if (draft.showDlModal) {
            showToast(
              t("Restored your Driving License onboarding draft securely."),
            );
          }
        }
      }
    } catch (error) {
      console.warn("Failed to restore DL draft state:", error);
    }
  }, []);

  // Save draft state on changes (with secure encryption)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const draft = {
        dlNumber,
        dlMobile,
        showDlModal,
        dlFirstName,
        dlMiddleName,
        dlLastName,
        dlDob,
        dlGender,
        dlFrontPhoto,
        dlBackPhoto,
        dlAddress,
        dlState,
        dlDistrict,
        dlPinCode,
        dlModalStep,
        dlFrontPhotoSize,
        dlFrontPhotoOrigSize,
        dlBackPhotoSize,
        dlBackPhotoOrigSize,
      };

      const key = getSessionKey();
      const encrypted = cryptState(JSON.stringify(draft), key);
      sessionStorage.setItem("setu_dl_draft", encrypted);
    } catch (error) {
      console.warn("Failed to save DL draft state:", error);
    }
  }, [
    dlNumber,
    dlMobile,
    showDlModal,
    dlFirstName,
    dlMiddleName,
    dlLastName,
    dlDob,
    dlGender,
    dlFrontPhoto,
    dlBackPhoto,
    dlAddress,
    dlState,
    dlDistrict,
    dlPinCode,
    dlModalStep,
    dlFrontPhotoSize,
    dlFrontPhotoOrigSize,
    dlBackPhotoSize,
  ]);

  // Auto-populate state/district from pincode
  React.useEffect(() => {
    if (dlPinCode.length === 6) {
      const fetchPincodeDetails = async () => {
        try {
          const res = await fetch(`/api/abdm/pincode/${dlPinCode}`);
          const data = await res.json();
          if (data.status === "success") {
            setDlState(data.state);
            setDlDistrict(data.district);
            showToast(
              t(`Location auto-populated: ${data.district}, ${data.state}`),
            );
          }
        } catch (err) {
          console.warn("Pincode lookup failed:", err);
        }
      };
      fetchPincodeDetails();
    }
  }, [dlPinCode]);

  // Synchronize split inputs with single values
  React.useEffect(() => {
    if (activeTab === "aadhaar") {
      setIdentifier(aadhaarParts.join(""));
    } else if (activeTab === "abha" && !useAbhaAddress) {
      const joined = abhaParts.join("");
      if (joined.length === 14) {
        setIdentifier(
          `${abhaParts[0]}-${abhaParts[1]}-${abhaParts[2]}-${abhaParts[3]}`,
        );
      } else {
        setIdentifier(joined);
      }
    }
  }, [aadhaarParts, abhaParts, activeTab, useAbhaAddress]);

  React.useEffect(() => {
    setDlNumber(dlParts.join("").toUpperCase());
  }, [dlParts]);

  React.useEffect(() => {
    setOtp(otpParts.join(""));
  }, [otpParts]);

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      showToast(t("Please enter a valid identifier."));
      return;
    }

    setIsSendingOtp(true);
    setErrorMsg("");

    if (activeTab === "mobile" || activeTab === "abha") {
      try {
        const cleanedId = identifier.replace(/[-\s]/g, "").trim();
        const hint = activeTab === "mobile" ? "mobile" : "abha-number";

        const res = await fetch("/api/abdm/v3/profile/login/request/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scope: ["abha-login", "mobile-verify"],
            loginHint: hint,
            loginId: cleanedId,
            otpSystem: "abdm",
          }),
        });
        const data = await res.json();
        setIsSendingOtp(false);

        if (res.ok && data.txnId) {
          setMobileTxnId(data.txnId);
          setOtpSent(true);
          showToast(t(data.message || "OTP sent successfully!"));
        } else {
          const msg =
            data.description ||
            data.message ||
            data.loginId ||
            data.scope ||
            data.loginHint ||
            t("Failed to send OTP.");
          setErrorMsg(msg);
          showToast(t("Failed to send OTP."));
        }
      } catch (err: any) {
        setIsSendingOtp(false);
        setErrorMsg(err.message || t("Gateway connection failed."));
        showToast(t("Network error."));
      }
    } else if (activeTab === "aadhaar") {
      try {
        const cleanedId = identifier.replace(/[-\s]/g, "").trim();
        const res = await fetch("/api/abdm/v3/enrollment/request/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loginHint: "aadhaar",
            loginId: cleanedId,
          }),
        });
        const data = await res.json();
        setIsSendingOtp(false);

        if (res.ok && data.txnId) {
          setMobileTxnId(data.txnId);
          setOtpSent(true);
          showToast(t(data.message || "OTP sent to Aadhaar-linked mobile!"));
        } else {
          setErrorMsg(data.message || t("Failed to send Aadhaar OTP."));
          showToast(t("Failed to send OTP."));
        }
      } catch (err: any) {
        setIsSendingOtp(false);
        setErrorMsg(err.message || t("Gateway connection failed."));
        showToast(t("Network error."));
      }
    }
  };

  // DL OTP Request Flow
  const handleSendDlOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlMobile || dlMobile.length !== 10) {
      showToast(t("Please enter a valid 10-digit mobile number."));
      return;
    }

    setIsSendingOtp(true);
    setErrorMsg("");

    try {
      const sessionRes = await fetch("/api/abdm/v3/enrollment/dl/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const sessionData = await sessionRes.json();
      if (sessionData.status !== "success") {
        throw new Error(
          sessionData.message || "Failed to establish DL session",
        );
      }

      const otpRes = await fetch("/api/abdm/v3/enrollment/dl/request/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: dlMobile, dlNumber: "" }),
      });
      const otpData = await otpRes.json();
      setIsSendingOtp(false);

      if (otpRes.ok && otpData.status === "success") {
        setOtpSent(true);
        showToast(t("OTP sent successfully to DL linked mobile!"));
      } else {
        setErrorMsg(otpData.message || t("Failed to send DL OTP."));
        showToast(t("Failed to send OTP."));
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMsg(err.message || t("DL Gateway connection failed."));
      showToast(t("Network error."));
    }
  };

  // Verify and login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      showToast(t("Please enter the verification OTP."));
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    if (activeTab === "mobile" || activeTab === "abha") {
      try {
        const res = await fetch("/api/abdm/v3/profile/login/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scope: ["abha-login", "mobile-verify"],
            authData: {
              authMethods: ["otp"],
              otp: {
                txnId: mobileTxnId,
                otpValue: otp,
              },
            },
          }),
        });
        const data = await res.json();
        setIsVerifying(false);

        if (res.ok && data.authResult === "success") {
          showToast(t("OTP verified successfully!"));
          const rToken =
            data.refreshToken ||
            data.tokens?.refreshToken ||
            "simulated-refresh-token-preview-xyz";
          localStorage.setItem("verify_via_abha_number_refresh_token", rToken);
          if (data.accounts && data.accounts.length > 0) {
            setLinkedAccounts(data.accounts);
            setSelectedAccount(data.accounts[0]);
            if (data.accounts.length === 1) {
              handleSelectAbhaAccount(data.accounts[0], data.accounts);
            } else {
              setShowAccountSelectModal(true);
            }
          } else {
            setErrorMsg(t("No linked accounts found."));
          }
        } else {
          const msg =
            data.description ||
            data.message ||
            data.otpValue ||
            data.txnId ||
            data.authMethods ||
            data.scope ||
            t("Verification failed.");
          setErrorMsg(msg);
          showToast(t("Verification failed."));
        }
      } catch (err: any) {
        setIsVerifying(false);
        setErrorMsg(err.message || t("Gateway connection failed."));
        showToast(t("Network error."));
      }
    } else if (activeTab === "aadhaar") {
      try {
        const res = await fetch("/api/abdm/v3/enrollment/enrol/byAadhaar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txnId: mobileTxnId,
            authData: {
              otp: {
                otpValue: otp,
                mobile: aadhaarMobile,
              },
            },
          }),
        });
        const data = await res.json();
        setIsVerifying(false);

        if (res.ok && data.status === "success") {
          setOtpError(false);
          showToast(t("OTP verified successfully!"));
          const profile = data.ABHAProfile || data;
          const finalName =
            profile.name ||
            [profile.firstName, profile.middleName, profile.lastName]
              .filter(Boolean)
              .join(" ") ||
            "ABHA User";
          const preferredAddr =
            data.abhaAddress ||
            profile.preferredAddress ||
            profile.preferredAbhaAddress ||
            (profile.phrAddress && profile.phrAddress[0]) ||
            profile.abhaId ||
            "";
          const abhaNum =
            data.abhaNumber || profile.ABHANumber || profile.abhaNumber || "";
          const normalizedAcc = {
            name: finalName,
            preferredAbhaAddress: preferredAddr,
            ABHANumber: abhaNum,
            profilePhoto: profile.photo || "",
            photo: profile.photo || "",
            gender:
              profile.gender === "F"
                ? "Female"
                : profile.gender === "M"
                  ? "Male"
                  : profile.gender,
            dob: profile.dob || "",
            mobile: profile.mobile || "",
            firstName: profile.firstName || "",
            middleName: profile.middleName || "",
            lastName: profile.lastName || "",
            address: profile.address || "",
            stateName: profile.stateName || "",
            districtName: profile.districtName || "",
            pinCode: profile.pinCode || "",
            abhaStatus: profile.abhaStatus || "ACTIVE",
            abhaType: profile.abhaType || "STANDARD",
            email: profile.email || "",
          };
          const success = await loginWithAbhaAccount(
            selectedRole,
            normalizedAcc,
            [normalizedAcc],
          );
          if (success) {
            const sessionTtl = 1200;
            const refreshTtl = 1800;
            localStorage.setItem(
              "abha_session_expiry",
              String(Date.now() + sessionTtl * 1000),
            );
            localStorage.setItem(
              "abha_refresh_expiry",
              String(Date.now() + refreshTtl * 1000),
            );
            localStorage.setItem(
              "x_token_expiry",
              String(Date.now() + sessionTtl * 1000),
            );
            localStorage.setItem(
              "verify_via_abha_number_refresh_token",
              data.refreshToken ||
                data.tokens?.refreshToken ||
                "simulated-refresh-token-preview-xyz",
            );
            localStorage.setItem(
              "public_key_expiry",
              String(Date.now() + 90 * 24 * 3600 * 1000),
            );
            window.dispatchEvent(new Event("setu_state_update"));

            showToast(t("Authentication successful! Welcome back."));
            // Redirect to My ABHA Profile after Aadhaar login
            router.push("/profile");
          } else {
            showToast(t("Failed to establish local session."));
          }
        } else {
          // Mark OTP boxes as errored and shake
          setOtpError(true);
          setErrorMsg(data.message || t("Verification failed."));
          showToast(data.message || t("Verification failed."));
          // Auto-refocus first box after error
          setTimeout(() => {
            otpRefs[0].current?.focus();
          }, 200);
        }
      } catch (err: any) {
        setIsVerifying(false);
        setOtpError(true);
        setErrorMsg(err.message || t("Gateway connection failed."));
        showToast(t("Network error."));
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 200);
      }
    }
  };

  const handleSelectAbhaAccount = async (acc: any, allAccounts?: any[]) => {
    setIsVerifying(true);
    try {
      const success = await loginWithAbhaAccount(
        selectedRole,
        acc,
        allAccounts || linkedAccounts || [acc],
      );
      setIsVerifying(false);
      if (success) {
        const sessionTtl = 1200;
        const refreshTtl = 1800;
        localStorage.setItem(
          "abha_session_expiry",
          String(Date.now() + sessionTtl * 1000),
        );
        localStorage.setItem(
          "abha_refresh_expiry",
          String(Date.now() + refreshTtl * 1000),
        );
        localStorage.setItem(
          "x_token_expiry",
          String(Date.now() + sessionTtl * 1000),
        );
        localStorage.setItem(
          "public_key_expiry",
          String(Date.now() + 90 * 24 * 3600 * 1000),
        );
        window.dispatchEvent(new Event("setu_state_update"));

        setShowAccountSelectModal(false);
        showToast(t("ABHA account linked and authenticated!"));
        router.push("/profile");
      } else {
        showToast(t("Failed to establish local session."));
      }
    } catch (e: any) {
      setIsVerifying(false);
      showToast(e.message || t("Authentication failed."));
    }
  };

  // Find ABHA OTP Request Flow
  const handleSendFindOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findMobile || findMobile.length !== 10) {
      showToast(t("Please enter a valid 10-digit mobile number."));
      return;
    }

    setIsSendingOtp(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/abdm/v3/forgot/abha/request/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: findMobile }),
      });
      const data = await res.json();
      setIsSendingOtp(false);

      if (res.ok && data.txnId) {
        setFindTxnId(data.txnId);
        setOtpSent(true);
        setOtpParts(["", "", "", "", "", ""]); // Clear OTP input
        showToast(t(data.message || "OTP sent successfully!"));
      } else {
        setErrorMsg(data.message || t("Failed to send OTP."));
        showToast(t("Failed to send OTP."));
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMsg(err.message || t("Gateway connection failed."));
      showToast(t("Network error."));
    }
  };

  // Find ABHA OTP Verify Flow
  const handleVerifyFindOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      showToast(t("Please enter the verification OTP."));
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/abdm/v3/forgot/abha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txnId: findTxnId,
          otp,
          mobile: findMobile,
        }),
      });
      const data = await res.json();
      setIsVerifying(false);

      if (res.ok && data.status === "success" && data.accounts) {
        showToast(t("OTP verified successfully!"));
        setFoundProfiles(data.accounts);
        setOtpSent(false); // Hide OTP view to show results
      } else {
        setOtpError(true);
        setErrorMsg(data.message || t("Verification failed."));
        showToast(t("Verification failed."));
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 200);
      }
    } catch (err: any) {
      setIsVerifying(false);
      setOtpError(true);
      setErrorMsg(err.message || t("Gateway connection failed."));
      showToast(t("Network error."));
      setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 200);
    }
  };

  // DL OTP Verify Flow
  const handleVerifyDlOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      showToast(t("Please enter the verification OTP."));
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/abdm/v3/enrollment/dl/verify/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      setIsVerifying(false);

      if (res.ok && data.status === "success") {
        showToast(t("OTP Verified! Please complete DL demographic details."));
        setShowDlModal(true);
      } else {
        setErrorMsg(data.message || t("Invalid OTP. Please try again."));
        showToast(t("Verification failed."));
      }
    } catch (err: any) {
      setIsVerifying(false);
      showToast(err.message || t("DL verification connection failed."));
    }
  };

  // Submit DL details
  const handleDlDemographicsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dlNumber) {
      showToast(t("Driving License number is required."));
      return;
    }
    if (
      dlNumber.includes("-") ||
      dlNumber !== dlNumber.toUpperCase() ||
      !DRIVING_LICENSE_REGEX.test(dlNumber)
    ) {
      showToast(
        t(
          "Driving License number must be fully in CAPS and contain no hyphens (-).",
        ),
      );
      return;
    }
    if (!dlFirstName || !dlLastName) {
      showToast(t("First Name and Last Name are required."));
      return;
    }
    if (!dlAddress || !dlState || !dlDistrict || !dlPinCode) {
      showToast(t("All address fields are required."));
      return;
    }
    if (!dlFrontPhoto) {
      showToast(t("Front side photo of your Driving License is required."));
      return;
    }
    setIsVerifying(true);

    try {
      const res = await fetch("/api/abdm/v3/enrollment/enrol/byDl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dlNumber,
          firstName: dlFirstName,
          middleName: dlMiddleName,
          lastName: dlLastName,
          dob: dlDob,
          gender: dlGender,
          mobile: dlMobile,
          frontPhoto: dlFrontPhoto,
          backPhoto: dlBackPhoto,
          address: dlAddress,
          state: dlState,
          district: dlDistrict,
          pinCode: dlPinCode,
        }),
      });
      const data = await res.json();
      setIsVerifying(false);

      if (res.ok && data.status === "success") {
        setShowDlModal(false);
        setDlModalStep(1); // Reset step
        await loginWithDl(dlNumber, data.abhaProfile);
        showToast(t("Authentication successful! Welcome back."));
        router.push("/profile");
      } else {
        showToast(data.message || t("DL Demographics validation failed."));
      }
    } catch (err: any) {
      setIsVerifying(false);
      showToast(err.message || t("DL registration request failed."));
    }
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file extension/type
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      const fileType = file.type;
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (
        !validTypes.includes(fileType) &&
        !["jpg", "jpeg", "png"].includes(fileExtension || "")
      ) {
        showToast(
          t("Invalid file format. Please upload JPEG, PNG, or JPG only."),
        );
        return;
      }

      const origSizeKb = Math.round(file.size / 1024);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;

        // Track orig size
        if (side === "front") {
          setDlFrontPhotoOrigSize(origSizeKb);
        } else {
          setDlBackPhotoOrigSize(origSizeKb);
        }

        // Compress targeting 150 KB
        showToast(t("Optimizing image for upload..."));
        const compressed = await compressImage(rawBase64, 150);

        if (side === "front") {
          setDlFrontPhoto(compressed.base64);
          setDlFrontPhotoSize(compressed.sizeKb);
        } else {
          setDlBackPhoto(compressed.base64);
          setDlBackPhotoSize(compressed.sizeKb);
        }
        showToast(
          t(`${side === "front" ? "Front" : "Back"} side photo optimized.`),
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Format labels and inputs based on tabs
  const getIdentifierPlaceholder = () => {
    if (activeTab === "mobile") return "e.g. 9876543210";
    if (activeTab === "aadhaar") return "e.g. 123456789012";
    return "e.g. 91-1234-5678-9012";
  };

  const getIdentifierLabel = () => {
    if (activeTab === "mobile") return "10-Digit Mobile Number";
    if (activeTab === "aadhaar") return "12-Digit Aadhaar Number";
    return "14-Digit ABHA ID / Address";
  };
  const renderActiveForm = (isMobileLayout: boolean = false) => {
    return (
      <>
        {!otpSent ? (
          <>
            {/* Find Mobile Form */}
            {flowState === "find_mobile" && foundProfiles.length === 0 && (
              <form
                onSubmit={handleSendFindOtp}
                style={{ display: "grid", gap: "12px" }}
              >
                {renderLargeLogo("find")}
                <label
                  style={{
                    display: "grid",
                    gap: "4px",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {t("10-Digit Mobile Number")}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      width: "100%",
                    }}
                  >
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      disabled={isSendingOtp}
                      value={findMobile}
                      onChange={(e) =>
                        setFindMobile(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="e.g. 9876543210"
                      style={{
                        flex: 1,
                        minWidth: "0",
                        width: "100%",
                        padding: "10px 8px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        fontFamily: "monospace",
                        outline: "none",
                        opacity: isSendingOtp ? 0.6 : 1,
                      }}
                    />
                    <Check
                      style={{
                        width: "18px",
                        height: "18px",
                        color: INDIAN_MOBILE_REGEX.test(findMobile)
                          ? "var(--accent-teal)"
                          : "var(--text-muted)",
                        opacity: INDIAN_MOBILE_REGEX.test(findMobile) ? 1 : 0.4,
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                </label>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "8px",
                    width: "100%",
                  }}
                >
                  <button
                    type="button"
                    onClick={isMobile ? handleMobileGestureBack : handleWebBack}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      background: "rgba(20, 184, 166, 0.05)",
                      border: "1px solid rgba(20, 184, 166, 0.35)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "var(--accent-teal)",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.2s",
                      minHeight: "40px",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.border =
                        "1px solid var(--accent-teal)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.05)";
                      e.currentTarget.style.border =
                        "1px solid rgba(20, 184, 166, 0.35)";
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.97)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <ArrowLeft style={{ width: "13px", height: "13px" }} />
                    <span>{t("Back")}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="join-btn"
                    style={{
                      flex: 1,
                      minHeight: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: isSendingOtp ? "not-allowed" : "pointer",
                    }}
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2
                          className="animate-spin"
                          style={{ width: "14px", height: "14px" }}
                        />
                        <span>Requesting OTP...</span>
                      </>
                    ) : (
                      <>
                        <Search style={{ width: "14px", height: "14px" }} />
                        <span>Find My ABHA Details</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* DL Form */}
            {flowState === "create_dl" && (
              <form
                onSubmit={handleSendDlOtp}
                style={{ display: "grid", gap: "12px" }}
              >
                {renderLargeLogo("dl")}
                <label
                  style={{
                    display: "grid",
                    gap: "4px",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  10-Digit Mobile Number
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    disabled={isSendingOtp}
                    value={dlMobile}
                    onChange={(e) =>
                      setDlMobile(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="e.g. 9876543210"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      outline: "none",
                      opacity: isSendingOtp ? 0.6 : 1,
                    }}
                  />
                </label>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "8px",
                    width: "100%",
                  }}
                >
                  <button
                    type="button"
                    onClick={isMobile ? handleMobileGestureBack : handleWebBack}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      background: "rgba(20, 184, 166, 0.05)",
                      border: "1px solid rgba(20, 184, 166, 0.35)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "var(--accent-teal)",
                      cursor: "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.2s",
                      minHeight: "40px",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.border =
                        "1px solid var(--accent-teal)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.05)";
                      e.currentTarget.style.border =
                        "1px solid rgba(20, 184, 166, 0.35)";
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.97)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <ArrowLeft style={{ width: "13px", height: "13px" }} />
                    <span>{t("Back")}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="join-btn"
                    style={{
                      flex: 1,
                      minHeight: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: isSendingOtp ? "not-allowed" : "pointer",
                    }}
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2
                          className="animate-spin"
                          style={{ width: "14px", height: "14px" }}
                        />
                        <span>Requesting OTP...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone style={{ width: "14px", height: "14px" }} />
                        <span>{t("Send OTP")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Standard Forms (Login Mobile, Login Aadhaar, Login ABHA, Create Aadhaar) */}
            {flowState !== "find_mobile" &&
              flowState !== "create_dl" &&
              flowState !== "login_submenu" &&
              flowState !== "create_submenu" && (
                <form
                  onSubmit={handleSendOtp}
                  style={{ display: "grid", gap: "12px" }}
                >
                  {renderLargeLogo(activeTab)}
                  <div style={{ display: "grid", gap: "4px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {getIdentifierLabel()}
                      </span>
                      {activeTab === "abha" && (
                        <button
                          type="button"
                          onClick={() => setUseAbhaAddress(!useAbhaAddress)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--accent-teal)",
                            fontSize: "10px",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontWeight: "bold",
                          }}
                        >
                          {useAbhaAddress
                            ? t("Use 14-Digit ABHA Number")
                            : t("Use ABHA Address (@sbx)")}
                        </button>
                      )}
                    </div>

                    {activeTab === "mobile" ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          width: "100%",
                        }}
                      >
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          disabled={isSendingOtp}
                          value={identifier}
                          onChange={(e) =>
                            setIdentifier(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder={getIdentifierPlaceholder()}
                          style={{
                            flex: 1,
                            minWidth: "0",
                            width: "100%",
                            padding: "10px 8px",
                            borderRadius: "8px",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "13px",
                            fontFamily: "monospace",
                            outline: "none",
                            opacity: isSendingOtp ? 0.6 : 1,
                          }}
                        />
                        <Check
                          style={{
                            width: "18px",
                            height: "18px",
                            color: INDIAN_MOBILE_REGEX.test(identifier)
                              ? "var(--accent-teal)"
                              : "var(--text-muted)",
                            opacity: INDIAN_MOBILE_REGEX.test(identifier)
                              ? 1
                              : 0.4,
                            transition: "all 0.2s",
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    ) : activeTab === "aadhaar" ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            flex: 1,
                            minWidth: "0",
                          }}
                        >
                          {aadhaarParts.map((part, index) => (
                            <input
                              key={index}
                              ref={aadhaarRefs[index]}
                              type="text"
                              required
                              disabled={isSendingOtp}
                              maxLength={4}
                              value={part}
                              onChange={(e) =>
                                handleSplitChange(
                                  e,
                                  index,
                                  aadhaarParts,
                                  setAadhaarParts,
                                  aadhaarRefs,
                                  4,
                                  /\D/g,
                                )
                              }
                              onKeyDown={(e) =>
                                handleSplitKeyDown(
                                  e,
                                  index,
                                  aadhaarParts,
                                  aadhaarRefs,
                                )
                              }
                              onPaste={(e) => handleSplitPaste(e, "aadhaar")}
                              placeholder="••••"
                              style={{
                                flex: 1,
                                minWidth: "0",
                                width: "100%",
                                padding: "10px 4px",
                                borderRadius: "8px",
                                border: "1px solid var(--border-color)",
                                background: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                fontSize: "13px",
                                fontFamily: "monospace",
                                textAlign: "center",
                                outline: "none",
                                opacity: isSendingOtp ? 0.6 : 1,
                              }}
                            />
                          ))}
                        </div>
                        <Check
                          style={{
                            width: "18px",
                            height: "18px",
                            color: AADHAAR_REGEX.test(identifier)
                              ? "var(--accent-teal)"
                              : "var(--text-muted)",
                            opacity: AADHAAR_REGEX.test(identifier) ? 1 : 0.4,
                            transition: "all 0.2s",
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    ) : useAbhaAddress ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          width: "100%",
                        }}
                      >
                        <input
                          type="text"
                          required
                          disabled={isSendingOtp}
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="e.g. ashish.patel@sbx"
                          style={{
                            flex: 1,
                            minWidth: "0",
                            width: "100%",
                            padding: "10px 8px",
                            borderRadius: "8px",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "13px",
                            fontFamily: "monospace",
                            outline: "none",
                            opacity: isSendingOtp ? 0.6 : 1,
                          }}
                        />
                        <Check
                          style={{
                            width: "18px",
                            height: "18px",
                            color: ABHA_ADDRESS_REGEX.test(identifier)
                              ? "var(--accent-teal)"
                              : "var(--text-muted)",
                            opacity: ABHA_ADDRESS_REGEX.test(identifier)
                              ? 1
                              : 0.4,
                            transition: "all 0.2s",
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            flex: 1,
                            minWidth: "0",
                          }}
                        >
                          {abhaParts.map((part, index) => {
                            const maxLen = index === 0 ? 2 : 4;
                            const placeholder = index === 0 ? "••" : "••••";
                            return (
                              <input
                                key={index}
                                ref={abhaRefs[index]}
                                type="text"
                                required
                                disabled={isSendingOtp}
                                maxLength={maxLen}
                                value={part}
                                onChange={(e) =>
                                  handleSplitChange(
                                    e,
                                    index,
                                    abhaParts,
                                    setAbhaParts,
                                    abhaRefs,
                                    maxLen,
                                    /\D/g,
                                  )
                                }
                                onKeyDown={(e) =>
                                  handleSplitKeyDown(
                                    e,
                                    index,
                                    abhaParts,
                                    abhaRefs,
                                  )
                                }
                                onPaste={(e) => handleSplitPaste(e, "abha")}
                                placeholder={placeholder}
                                style={{
                                  flex: index === 0 ? 0.5 : 1,
                                  minWidth: "0",
                                  width: "100%",
                                  padding: "10px 2px",
                                  borderRadius: "8px",
                                  border: "1px solid var(--border-color)",
                                  background: "var(--bg-secondary)",
                                  color: "var(--text-primary)",
                                  fontSize: "12px",
                                  fontFamily: "monospace",
                                  textAlign: "center",
                                  outline: "none",
                                  opacity: isSendingOtp ? 0.6 : 1,
                                }}
                              />
                            );
                          })}
                        </div>
                        <Check
                          style={{
                            width: "18px",
                            height: "18px",
                            color: ABHA_NUMBER_REGEX.test(identifier)
                              ? "var(--accent-teal)"
                              : "var(--text-muted)",
                            opacity: ABHA_NUMBER_REGEX.test(identifier)
                              ? 1
                              : 0.4,
                            transition: "all 0.2s",
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "8px",
                      width: "100%",
                    }}
                  >
                    <button
                      type="button"
                      onClick={isMobile ? handleMobileGestureBack : handleWebBack}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        background: "rgba(20, 184, 166, 0.05)",
                        border: "1px solid rgba(20, 184, 166, 0.35)",
                        borderRadius: "12px",
                        fontSize: "11px",
                        color: "var(--accent-teal)",
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        transition: "all 0.2s",
                        minHeight: "40px",
                        outline: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(20, 184, 166, 0.08)";
                        e.currentTarget.style.border =
                          "1px solid var(--accent-teal)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(20, 184, 166, 0.05)";
                        e.currentTarget.style.border =
                          "1px solid rgba(20, 184, 166, 0.35)";
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = "scale(0.97)";
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <ArrowLeft style={{ width: "13px", height: "13px" }} />
                      <span>{t("Back")}</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="join-btn"
                      style={{
                        flex: 1,
                        minHeight: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        cursor: isSendingOtp ? "not-allowed" : "pointer",
                      }}
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2
                            className="animate-spin"
                            style={{ width: "14px", height: "14px" }}
                          />
                          <span>Requesting OTP...</span>
                        </>
                      ) : (
                        <>
                          <Smartphone
                            style={{ width: "14px", height: "14px" }}
                          />
                          <span>{t("Send OTP")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            {/* Find Mobile Success View (Profiles List) */}
            {flowState === "find_mobile" && foundProfiles.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    background: "rgba(20, 184, 166, 0.08)",
                    border: "1px solid rgba(20, 184, 166, 0.2)",
                    borderRadius: "12px",
                    padding: "12px",
                    textAlign: "center",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  🎉 We found{" "}
                  <strong>{foundProfiles.length} ABHA profiles</strong> linked
                  to this mobile number.
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {foundProfiles.map((acc, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "rgba(20, 184, 166, 0.1)",
                          display: "grid",
                          placeItems: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {acc.profilePhoto ? (
                          <img
                            src={getPhotoSrc(acc.profilePhoto)}
                            alt={acc.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Fingerprint
                            style={{
                              width: "18px",
                              height: "18px",
                              color: "var(--accent-teal)",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            color: "var(--text-primary)",
                          }}
                        >
                          {acc.name}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "var(--text-secondary)",
                            fontFamily: "monospace",
                            marginTop: "2px",
                          }}
                        >
                          ID: {acc.preferredAbhaAddress}
                        </div>
                        <div
                          style={{
                            fontSize: "9px",
                            color: "var(--text-muted)",
                          }}
                        >
                          No: {acc.ABHANumber}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectAbhaAccount(acc, foundProfiles)
                        }
                        className="join-btn"
                        style={{
                          padding: "6px 12px",
                          fontSize: "11px",
                          borderRadius: "8px",
                          minHeight: "30px",
                          cursor: "pointer",
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = "scale(0.97)";
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = "none";
                        }}
                      >
                        Log In
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={isMobile ? handleMobileGestureBack : handleWebBack}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "10px 14px",
                    background: "rgba(20, 184, 166, 0.05)",
                    border: "1px solid rgba(20, 184, 166, 0.35)",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "var(--accent-teal)",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    width: "100%",
                    minHeight: "38px",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.08)";
                    e.currentTarget.style.border =
                      "1px solid var(--accent-teal)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.05)";
                    e.currentTarget.style.border =
                      "1px solid rgba(20, 184, 166, 0.35)";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <ArrowLeft style={{ width: "13px", height: "13px" }} />
                  <span>{t("Back to Menu")}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* OTP Sent / Verification forms */}
            {activeTab === "dl" ? (
              <form
                onSubmit={handleVerifyDlOtp}
                style={{ display: "grid", gap: "12px" }}
              >
                {renderLargeLogo("dl")}
                <div
                  style={{
                    background: "rgba(20, 184, 166, 0.06)",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(20, 184, 166, 0.15)",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  <Info
                    style={{
                      width: "14px",
                      height: "14px",
                      color: "var(--accent-teal)",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    {t(
                      "An OTP has been sent to the mobile number registered with your Driving License.",
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Enter 6-Digit OTP Code
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "center",
                        flex: 1,
                        minWidth: "0",
                      }}
                    >
                      {otpParts.map((part, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          required
                          disabled={isVerifying}
                          maxLength={1}
                          value={part}
                          onChange={(e) => {
                            setOtpError(false);
                            handleSplitChange(
                              e,
                              index,
                              otpParts,
                              setOtpParts,
                              otpRefs,
                              1,
                              /\D/g,
                            );
                          }}
                          onKeyDown={(e) =>
                            handleSplitKeyDown(e, index, otpParts, otpRefs)
                          }
                          onPaste={(e) => handleSplitPaste(e, "otp")}
                          onFocus={(e) => e.target.select()}
                          placeholder="-"
                          aria-label={`OTP digit ${index + 1}`}
                          style={{
                            flex: 1,
                            minWidth: "0",
                            width: "100%",
                            maxWidth: "52px",
                            height: "58px",
                            borderRadius: "12px",
                            border: otpError
                              ? "2px solid var(--danger)"
                              : part
                                ? "2px solid var(--accent-teal)"
                                : "2px solid var(--border-color)",
                            background: otpError
                              ? "rgba(239,68,68,0.06)"
                              : part
                                ? "rgba(20,184,166,0.06)"
                                : "var(--bg-secondary)",
                            color: otpError
                              ? "var(--danger)"
                              : "var(--text-primary)",
                            fontSize: "22px",
                            fontWeight: "800",
                            textAlign: "center",
                            outline: "none",
                            opacity: isVerifying ? 0.6 : 1,
                            transition:
                              "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                            boxShadow: otpError
                              ? "0 0 0 3px rgba(239,68,68,0.15)"
                              : part
                                ? "0 0 0 3px rgba(20,184,166,0.12)"
                                : "none",
                            caretColor: "transparent",
                            animation: otpError
                              ? "otp-shake 0.4s ease"
                              : "none",
                          }}
                        />
                      ))}
                    </div>
                    <Check
                      style={{
                        width: "22px",
                        height: "22px",
                        color:
                          otp.length === 6
                            ? "var(--accent-teal)"
                            : "var(--text-muted)",
                        opacity: otp.length === 6 ? 1 : 0.3,
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div
                    style={{
                      color: "var(--danger)",
                      fontSize: "10.5px",
                      fontWeight: "600",
                      background: "rgba(239,68,68,0.08)",
                      padding: "6px",
                      borderRadius: "4px",
                      border: "1px solid rgba(239,68,68,0.15)",
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={isMobile ? handleMobileGestureBack : handleWebBack}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      background: "rgba(20, 184, 166, 0.05)",
                      border: "1px solid rgba(20, 184, 166, 0.35)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "var(--accent-teal)",
                      cursor: isVerifying ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.2s",
                      opacity: isVerifying ? 0.6 : 1,
                      outline: "none",
                      minHeight: "40px",
                    }}
                    onMouseEnter={(e) => {
                      if (isVerifying) return;
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.border =
                        "1px solid var(--accent-teal)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.05)";
                      e.currentTarget.style.border =
                        "1px solid rgba(20, 184, 166, 0.35)";
                    }}
                    onMouseDown={(e) => {
                      if (!isVerifying)
                        e.currentTarget.style.transform = "scale(0.97)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <ArrowLeft style={{ width: "13px", height: "13px" }} />
                    <span>{t("Back")}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="join-btn"
                    style={{
                      flex: 1,
                      minHeight: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: isVerifying ? "not-allowed" : "pointer",
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.97)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2
                          className="animate-spin"
                          style={{ width: "14px", height: "14px" }}
                        />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles style={{ width: "14px", height: "14px" }} />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleVerifyOtp}
                style={{ display: "grid", gap: "14px" }}
              >
                {renderLargeLogo(activeTab)}
                {/* Info banner */}
                <div
                  style={{
                    background: "rgba(20, 184, 166, 0.06)",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(20, 184, 166, 0.15)",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  <Info
                    style={{
                      width: "14px",
                      height: "14px",
                      color: "var(--accent-teal)",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    {t(
                      "An OTP has been sent to your registered mobile number.",
                    )}
                  </div>
                </div>

                {/* OTP Digit Boxes */}
                <div style={{ display: "grid", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Enter 6-Digit OTP Code
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "center",
                        flex: 1,
                        minWidth: "0",
                      }}
                    >
                      {otpParts.map((part, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          required
                          disabled={isVerifying}
                          maxLength={1}
                          value={part}
                          onChange={(e) =>
                            handleSplitChange(
                              e,
                              index,
                              otpParts,
                              setOtpParts,
                              otpRefs,
                              1,
                              /\D/g,
                            )
                          }
                          onKeyDown={(e) =>
                            handleSplitKeyDown(e, index, otpParts, otpRefs)
                          }
                          onPaste={(e) => handleSplitPaste(e, "otp")}
                          onFocus={(e) => e.target.select()}
                          placeholder="-"
                          aria-label={`OTP digit ${index + 1}`}
                          style={{
                            flex: 1,
                            minWidth: "0",
                            width: "100%",
                            maxWidth: "52px",
                            height: "58px",
                            borderRadius: "12px",
                            border: part
                              ? "2px solid var(--accent-teal)"
                              : "2px solid var(--border-color)",
                            background: part
                              ? "rgba(20,184,166,0.06)"
                              : "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "22px",
                            fontWeight: "800",
                            textAlign: "center",
                            outline: "none",
                            opacity: isVerifying ? 0.6 : 1,
                            transition: "border-color 0.15s, background 0.15s",
                            boxShadow: part
                              ? "0 0 0 3px rgba(20,184,166,0.12)"
                              : "none",
                            caretColor: "transparent",
                          }}
                        />
                      ))}
                    </div>
                    <Check
                      style={{
                        width: "22px",
                        height: "22px",
                        color:
                          otp.length === 6
                            ? "var(--accent-teal)"
                            : "var(--text-muted)",
                        opacity: otp.length === 6 ? 1 : 0.3,
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                </div>

                {/* Aadhaar-Linked Mobile */}
                {activeTab === "aadhaar" && (
                  <label
                    style={{
                      display: "grid",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>
                      Aadhaar-Linked Mobile Number
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      disabled={isVerifying}
                      value={aadhaarMobile}
                      onChange={(e) =>
                        setAadhaarMobile(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="e.g. 9876543210"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        fontFamily: "monospace",
                        outline: "none",
                        opacity: isVerifying ? 0.6 : 1,
                        boxSizing: "border-box",
                      }}
                    />
                  </label>
                )}

                {errorMsg && (
                  <div
                    style={{
                      color: "var(--danger)",
                      fontSize: "10.5px",
                      fontWeight: "600",
                      background: "rgba(239,68,68,0.08)",
                      padding: "6px",
                      borderRadius: "4px",
                      border: "1px solid rgba(239,68,68,0.15)",
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={isMobile ? handleMobileGestureBack : handleWebBack}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      background: "rgba(20, 184, 166, 0.05)",
                      border: "1px solid rgba(20, 184, 166, 0.35)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "var(--accent-teal)",
                      cursor: isVerifying ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.2s",
                      opacity: isVerifying ? 0.6 : 1,
                      outline: "none",
                      minHeight: "40px",
                    }}
                    onMouseEnter={(e) => {
                      if (isVerifying) return;
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.border =
                        "1px solid var(--accent-teal)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.05)";
                      e.currentTarget.style.border =
                        "1px solid rgba(20, 184, 166, 0.35)";
                    }}
                    onMouseDown={(e) => {
                      if (!isVerifying)
                        e.currentTarget.style.transform = "scale(0.97)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <ArrowLeft style={{ width: "13px", height: "13px" }} />
                    <span>{t("Back")}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="join-btn"
                    style={{
                      flex: 1,
                      minHeight: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      cursor: isVerifying ? "not-allowed" : "pointer",
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.97)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2
                          className="animate-spin"
                          style={{ width: "14px", height: "14px" }}
                        />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles style={{ width: "14px", height: "14px" }} />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </>
    );
  };

  const getMaxIdentifierLength = () => {
    if (activeTab === "mobile") return 10;
    if (activeTab === "aadhaar") return 12;
    return 17;
  };

  return (
    <div
      className="login-container"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        padding: "20px",
        background:
          "radial-gradient(circle at top, var(--bg-primary) 30%, #03080e 100%)",
      }}
    >
      <LogoLoader isLoading={isVerifying || isNavigating} type="login" />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
          maxWidth: "440px",
        }}
      >
        {/* Login Card */}
        <div
          className="login-card"
          style={{
            width: "100%",
            background: "var(--bg-card)",
            borderRadius: "16px",
            padding: "30px 24px",
            backdropFilter: "blur(20px)",
            position: "relative",
            overflow: "hidden",
            border: `1px solid rgba(20, 184, 166, ${0.15 + (getLoginProgress() / 100) * 0.45})`,
            boxShadow: `var(--surface-shadow), 0 0 30px rgba(20, 184, 166, ${(getLoginProgress() / 100) * 0.12})`,
            transition: "border 0.3s, box-shadow 0.3s",
          }}
        >
          {/* Progress bar at top of card */}
          {/* SVG Progress Rectangle Border (Indian Flag Colors) */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <defs>
              <linearGradient
                id="indian-flag-grad-login"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FF9933" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#138808" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <rect
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="16"
              fill="none"
              stroke="url(#indian-flag-grad-login)"
              strokeWidth="3"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - getLoginProgress()}
              style={{
                transition: "stroke-dashoffset 0.3s ease-in-out",
                opacity: getLoginProgress() > 0 ? 1 : 0,
              }}
            />
          </svg>

          {/* Shimmer progress bar at top of card when submitting */}
          {(isSendingOtp || isVerifying) && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background:
                  "linear-gradient(90deg, transparent, var(--accent-teal), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer-sweep 1.2s infinite linear",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
                zIndex: 11,
              }}
            />
          )}

          <HomeButton />
          <LanguageSwitcher />

          <div
            style={{
              opacity: fadeOpacity,
              transition: "opacity 150ms ease-in-out",
            }}
          >
            {/* Dynamic Card Header based on flowState */}
            {flowState === "menu" ? (
              <>
                {/* Brand Logo */}
                <div
                  className="logo"
                  style={{
                    justifyContent: "center",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    className="logo-icon"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "transparent",
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src="/assets/logos/logo7.png"
                      alt="Brand Logo"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div
                    className="logo-text"
                    style={{
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h1
                      style={{
                        fontSize: "18px",
                        margin: 0,
                        fontWeight: 800,
                        color: "var(--text-primary)",
                      }}
                    >
                      ABHA SETU
                    </h1>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {t("Digital Health Portal")}
                    </span>
                  </div>
                </div>

                <h2
                  style={{
                    fontSize: "16px",
                    textAlign: "center",
                    margin: "0 0 4px",
                    fontWeight: 800,
                  }}
                >
                  National Health Gateway Portal
                </h2>
                <p
                  className="subtitle"
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    textAlign: "center",
                    margin: "0 0 16px",
                    lineHeight: 1.5,
                  }}
                >
                  Access clinical records, UHI consults, and link care contexts
                  using secure OTP.
                </p>
              </>
            ) : (
              <div
                style={{
                  display:
                    typeof window !== "undefined" && window.innerWidth >= 768
                      ? "block"
                      : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <img
                    src="/assets/logos/logo7.png"
                    alt="Logo"
                    style={{
                      width: "22px",
                      height: "22px",
                      objectFit: "contain",
                    }}
                  />
                  <h1
                    style={{
                      fontSize: "14px",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    ABHA SETU
                  </h1>
                </div>

                <h2
                  style={{
                    fontSize: "15px",
                    margin: "0 0 4px",
                    fontWeight: 800,
                  }}
                >
                  {flowState === "login_submenu" &&
                    "Select Login Method / प्रवेश का माध्यम"}
                  {flowState === "create_submenu" &&
                    "Select Registration Method / नया पंजीकरण"}
                  {flowState === "login_mobile" &&
                    "Authentication via Mobile OTP"}
                  {flowState === "login_aadhaar" &&
                    "Aadhaar Secure Authentication"}
                  {flowState === "login_abha" && "ABHA Profile Login"}
                  {flowState === "create_aadhaar" && "Create ABHA Number"}
                  {flowState === "create_dl" && "ABHA Enrollment using DL"}
                  {flowState === "find_mobile" && "Find ABHA via Mobile"}
                </h2>
                <p
                  className="subtitle"
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    margin: "0 0 16px",
                    lineHeight: 1.5,
                  }}
                >
                  {flowState === "login_submenu" &&
                    "Choose how you want to log in to your digital health card profile."}
                  {flowState === "create_submenu" &&
                    "Choose the document to register and generate a new ABHA identity."}
                  {flowState === "login_mobile" &&
                    "Enter your 10-digit mobile number linked to your ABHA profile."}
                  {flowState === "login_aadhaar" &&
                    "Verify your identity using Aadhaar-linked mobile secure OTP."}
                  {flowState === "login_abha" &&
                    "Enter your 14-digit ABHA Number or ABHA Address (@sbx)."}
                  {flowState === "create_aadhaar" &&
                    "Create your unique 14-digit ABHA number using Aadhaar secure OTP."}
                  {flowState === "create_dl" &&
                    "Enter your mobile number to request a DL verification OTP."}
                  {flowState === "find_mobile" && foundProfiles.length === 0
                    ? "Locate your ABHA profiles linked with your mobile number."
                    : "Select a profile below to log in directly."}
                </p>
              </div>
            )}

            {/* Dashboard Selector Menu */}
            {flowState === "menu" &&
              (isMobile ? (
                <button
                  type="button"
                  onClick={() => openDrawer("main")}
                  className="join-btn"
                  style={{
                    width: "100%",
                    padding: "14px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background:
                      "linear-gradient(135deg, var(--accent-teal), #0d9488)",
                    color: "#ffffff",
                    border: "none",
                    boxShadow: "0 4px 14px rgba(20, 184, 166, 0.25)",
                    transition: "all 0.2s",
                    outline: "none",
                    marginTop: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  <span>{t("Get Started")}</span>
                </button>
              ) : (
                renderSelectionCards()
              ))}

            {/* Desktop inline submenus */}
            {flowState === "login_submenu" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "var(--accent-teal)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <span>Select Login Method</span>
                </div>

                {/* Login Options list */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("mobile");
                    setOtpSent(false);
                    setIdentifier("");
                    setFlowState("login_mobile");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    background: "rgba(255, 255, 255, 0.02)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    width: "100%",
                    minHeight: "56px",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border =
                      "1px solid var(--accent-teal)";
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.04)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(20, 184, 166, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border =
                      "1px solid var(--border-color)";
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.05)",
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/assets/logos/mobile_login.svg"
                      alt="Mobile"
                      style={{
                        width: "28px",
                        height: "28px",
                        objectFit: "contain",
                        filter: "var(--logo-filter)",
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                      Login via Mobile Number
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Login using linked mobile OTP
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("aadhaar");
                    setOtpSent(false);
                    setIdentifier("");
                    setFlowState("login_aadhaar");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(20, 184, 166, 0.45)",
                    background: "rgba(20, 184, 166, 0.02)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    width: "100%",
                    minHeight: "56px",
                    outline: "none",
                    boxShadow: "0 0 10px rgba(20, 184, 166, 0.06)",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(20, 184, 166, 0.85)";
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.06)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(20, 184, 166, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(20, 184, 166, 0.45)";
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.02)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow =
                      "0 0 10px rgba(20, 184, 166, 0.06)";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "12px",
                      fontSize: "8px",
                      background: "var(--accent-teal)",
                      color: "var(--bg-card)",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      boxShadow:
                        "0 2px 6px color-mix(in srgb, var(--accent-teal) 30%, transparent)",
                      zIndex: 2,
                    }}
                  >
                    {t("Preferred")}
                  </span>

                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.05)",
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/assets/logos/aadhaar.png"
                      alt="Aadhaar"
                      style={{
                        width: "28px",
                        height: "28px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                      Login via Aadhaar
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Aadhaar OTP authentication
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("abha");
                    setOtpSent(false);
                    setIdentifier("");
                    setFlowState("login_abha");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    background: "rgba(255, 255, 255, 0.02)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    width: "100%",
                    minHeight: "56px",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border =
                      "1px solid var(--accent-teal)";
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.04)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(20, 184, 166, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border =
                      "1px solid var(--border-color)";
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.05)",
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/assets/logos/abha.png"
                      alt="ABHA"
                      style={{
                        width: "28px",
                        height: "28px",
                        objectFit: "contain",
                        filter: "var(--logo-filter)",
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                      Login via ABHA Number / Address
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Enter 14-digit ABHA or address (@sbx)
                    </div>
                  </div>
                </button>

                {/* Web UI back button */}
                <button
                  type="button"
                  onClick={handleWebBack}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    background: "rgba(20, 184, 166, 0.05)",
                    border: "1px solid rgba(20, 184, 166, 0.35)",
                    color: "var(--accent-teal)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    width: "100%",
                    minHeight: "44px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.08)";
                    e.currentTarget.style.border =
                      "1px solid var(--accent-teal)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.05)";
                    e.currentTarget.style.border =
                      "1px solid rgba(20, 184, 166, 0.35)";
                    e.currentTarget.style.transform = "none";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                >
                  <ArrowLeft style={{ width: "14px", height: "14px" }} />
                  <span>{t("Back to Menu")}</span>
                </button>
              </div>
            )}

            {flowState === "create_submenu" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "var(--accent-teal)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <span>Select ABHA Creation Method</span>
                </div>

                {/* Aadhaar Highlight (Preferred) */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("aadhaar");
                    setOtpSent(false);
                    setIdentifier("");
                    setFlowState("create_aadhaar");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(20, 184, 166, 0.45)",
                    background: "rgba(20, 184, 166, 0.02)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    width: "100%",
                    minHeight: "56px",
                    outline: "none",
                    boxShadow: "0 0 10px rgba(20, 184, 166, 0.06)",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(20, 184, 166, 0.85)";
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.06)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(20, 184, 166, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(20, 184, 166, 0.45)";
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.02)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow =
                      "0 0 10px rgba(20, 184, 166, 0.06)";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "12px",
                      fontSize: "8px",
                      background: "var(--accent-teal)",
                      color: "var(--bg-card)",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      boxShadow:
                        "0 2px 6px color-mix(in srgb, var(--accent-teal) 30%, transparent)",
                      zIndex: 2,
                    }}
                  >
                    {t("Preferred")}
                  </span>

                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.05)",
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/assets/logos/aadhaar.png"
                      alt="Aadhaar"
                      style={{
                        width: "28px",
                        height: "28px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                      Create via Aadhaar
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Instant ABHA Card using Aadhaar OTP
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("dl");
                    setOtpSent(false);
                    setIdentifier("");
                    setFlowState("create_dl");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    background: "rgba(255, 255, 255, 0.02)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    width: "100%",
                    minHeight: "56px",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border =
                      "1px solid var(--accent-teal)";
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.04)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(20, 184, 166, 0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border =
                      "1px solid var(--border-color)";
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.05)",
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src="/assets/logos/dl.png"
                      alt="Driving License"
                      style={{
                        width: "28px",
                        height: "28px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                      Create via Driving License
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Enrollment using Driving License ID
                    </div>
                  </div>
                </button>

                {/* Web UI back button */}
                <button
                  type="button"
                  onClick={handleWebBack}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    background: "rgba(20, 184, 166, 0.05)",
                    border: "1px solid rgba(20, 184, 166, 0.35)",
                    color: "var(--accent-teal)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    width: "100%",
                    minHeight: "44px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.08)";
                    e.currentTarget.style.border =
                      "1px solid var(--accent-teal)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(20, 184, 166, 0.05)";
                    e.currentTarget.style.border =
                      "1px solid rgba(20, 184, 166, 0.35)";
                    e.currentTarget.style.transform = "none";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.97)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                >
                  <ArrowLeft style={{ width: "14px", height: "14px" }} />
                  <span>{t("Back to Menu")}</span>
                </button>
              </div>
            )}

            {/* Desktop inline forms */}
            {flowState !== "menu" &&
              flowState !== "login_submenu" &&
              flowState !== "create_submenu" && (
                <div
                  style={{
                    display:
                      typeof window !== "undefined" && window.innerWidth >= 768
                        ? "block"
                        : "none",
                  }}
                >
                  {renderActiveForm()}
                </div>
              )}

            {/* Quick link to staff portal */}
            <div
              style={{
                textAlign: "center",
                fontSize: "11px",
                marginTop: "20px",
                paddingTop: "14px",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>
                Are you clinical staff, operator, or admin?{" "}
              </span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/staff-login");
                }}
                style={{
                  color: "var(--accent-teal)",
                  fontWeight: "bold",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <ShieldCheck style={{ width: "12px", height: "12px" }} />
                Access Stakeholder Suite
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* DL Demographics Modal */}
      {showDlModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(12px)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "520px",
              padding: "30px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              overflow: "hidden",
              border: `1px solid rgba(20, 184, 166, ${0.15 + (getDlFormProgress() / 100) * 0.45})`,
              boxShadow: `0 24px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(20, 184, 166, ${(getDlFormProgress() / 100) * 0.12})`,
              transition: "border 0.3s, box-shadow 0.3s",
            }}
          >
            <HomeButton />
            <LanguageSwitcher />

            {/* SVG Progress Rectangle Border (Indian Flag Colors) */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <defs>
                <linearGradient
                  id="indian-flag-grad-dl"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FF9933" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#138808" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <rect
                x="1.5"
                y="1.5"
                width="calc(100% - 3px)"
                height="calc(100% - 3px)"
                rx="24"
                fill="none"
                stroke="url(#indian-flag-grad-dl)"
                strokeWidth="3"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - getDlFormProgress()}
                style={{
                  transition: "stroke-dashoffset 0.3s ease-in-out",
                  opacity: getDlFormProgress() > 0 ? 1 : 0,
                }}
              />
            </svg>
            {/* Header */}
            <div>
              <h3
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  textAlign: "left",
                }}
              >
                Driving License Onboarding
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  textAlign: "left",
                }}
              >
                Complete your profile verification via NHA gateway.
              </p>
            </div>

            {/* Visual Step Progress Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                position: "relative",
                padding: "0 10px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "25px",
                  right: "25px",
                  height: "2px",
                  background: "var(--border-color)",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "25px",
                  width: `${((dlModalStep - 1) / 2) * 88}%`,
                  height: "2px",
                  background: "var(--accent-teal)",
                  zIndex: 2,
                  transition: "width 0.3s ease",
                }}
              />

              {/* Step 1 indicator */}
              <div
                style={{
                  zIndex: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
                onClick={() => dlModalStep > 1 && setDlModalStep(1)}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background:
                      dlModalStep >= 1
                        ? "var(--accent-teal)"
                        : "var(--bg-secondary)",
                    color:
                      dlModalStep >= 1 ? "#ffffff" : "var(--text-secondary)",
                    border:
                      dlModalStep >= 1
                        ? "1px solid var(--accent-teal)"
                        : "1px solid var(--border-color)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.3s",
                  }}
                >
                  {dlModalStep > 1 ? (
                    <Check style={{ width: "14px", height: "14px" }} />
                  ) : (
                    "1"
                  )}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color:
                      dlModalStep >= 1
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  Document
                </span>
              </div>

              {/* Step 2 indicator */}
              <div
                style={{
                  zIndex: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
                onClick={() => dlModalStep > 2 && setDlModalStep(2)}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background:
                      dlModalStep >= 2
                        ? "var(--accent-teal)"
                        : "var(--bg-secondary)",
                    color:
                      dlModalStep >= 2 ? "#ffffff" : "var(--text-secondary)",
                    border:
                      dlModalStep >= 2
                        ? "1px solid var(--accent-teal)"
                        : "1px solid var(--border-color)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.3s",
                  }}
                >
                  {dlModalStep > 2 ? (
                    <Check style={{ width: "14px", height: "14px" }} />
                  ) : (
                    "2"
                  )}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color:
                      dlModalStep >= 2
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  Address
                </span>
              </div>

              {/* Step 3 indicator */}
              <div
                style={{
                  zIndex: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background:
                      dlModalStep >= 3
                        ? "var(--accent-teal)"
                        : "var(--bg-secondary)",
                    color:
                      dlModalStep >= 3 ? "#ffffff" : "var(--text-secondary)",
                    border:
                      dlModalStep >= 3
                        ? "1px solid var(--accent-teal)"
                        : "1px solid var(--border-color)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.3s",
                  }}
                >
                  3
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color:
                      dlModalStep >= 3
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  Uploads
                </span>
              </div>
            </div>

            {/* Step 1: Document Details */}
            {dlModalStep === 1 && (
              <div style={{ display: "grid", gap: "14px", textAlign: "left" }}>
                <div
                  style={{
                    display: "grid",
                    gap: "4px",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>Driving License Number</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        flex: 1,
                        minWidth: "0",
                      }}
                    >
                      {/* State code (2 letters) */}
                      <input
                        ref={dlRefs[0]}
                        type="text"
                        required
                        maxLength={2}
                        value={dlParts[0]}
                        onChange={(e) => {
                          const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z]/g, "");
                          const newParts = [...dlParts];
                          newParts[0] = val;
                          setDlParts(newParts);
                          if (val.length === 2) dlRefs[1].current?.focus();
                        }}
                        onPaste={(e) => handleSplitPaste(e, "dl")}
                        placeholder="MP"
                        style={{
                          flex: 0.8,
                          minWidth: "0",
                          width: "100%",
                          padding: "10px 2px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-color)",
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          fontSize: "12px",
                          fontFamily: "monospace",
                          textAlign: "center",
                          outline: "none",
                        }}
                      />

                      {/* RTO code (2 or 3 chars, alphanumeric) */}
                      <input
                        ref={dlRefs[1]}
                        type="text"
                        required
                        maxLength={3}
                        value={dlParts[1]}
                        onChange={(e) => {
                          const val = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "");
                          const newParts = [...dlParts];
                          newParts[1] = val;
                          setDlParts(newParts);
                          if (val.length === 3) dlRefs[2].current?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !dlParts[1])
                            dlRefs[0].current?.focus();
                        }}
                        onPaste={(e) => handleSplitPaste(e, "dl")}
                        placeholder="20N"
                        style={{
                          flex: 1,
                          minWidth: "0",
                          width: "100%",
                          padding: "10px 2px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-color)",
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          fontSize: "12px",
                          fontFamily: "monospace",
                          textAlign: "center",
                          outline: "none",
                        }}
                      />

                      {/* Year of issue (4 digits) */}
                      <input
                        ref={dlRefs[2]}
                        type="text"
                        required
                        maxLength={4}
                        value={dlParts[2]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const newParts = [...dlParts];
                          newParts[2] = val;
                          setDlParts(newParts);
                          if (val.length === 4) dlRefs[3].current?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !dlParts[2])
                            dlRefs[1].current?.focus();
                        }}
                        onPaste={(e) => handleSplitPaste(e, "dl")}
                        placeholder="2016"
                        style={{
                          flex: 1.2,
                          minWidth: "0",
                          width: "100%",
                          padding: "10px 2px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-color)",
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          fontSize: "12px",
                          fontFamily: "monospace",
                          textAlign: "center",
                          outline: "none",
                        }}
                      />

                      {/* Serial number (7 digits) */}
                      <input
                        ref={dlRefs[3]}
                        type="text"
                        required
                        maxLength={7}
                        value={dlParts[3]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const newParts = [...dlParts];
                          newParts[3] = val;
                          setDlParts(newParts);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !dlParts[3])
                            dlRefs[2].current?.focus();
                        }}
                        onPaste={(e) => handleSplitPaste(e, "dl")}
                        placeholder="0311714"
                        style={{
                          flex: 2,
                          minWidth: "0",
                          width: "100%",
                          padding: "10px 2px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-color)",
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          fontSize: "12px",
                          fontFamily: "monospace",
                          textAlign: "center",
                          outline: "none",
                        }}
                      />
                    </div>

                    <Check
                      style={{
                        width: "18px",
                        height: "18px",
                        color:
                          dlNumber.length >= 15 &&
                          DRIVING_LICENSE_REGEX.test(dlNumber)
                            ? "var(--accent-teal)"
                            : "var(--text-muted)",
                        opacity:
                          dlNumber.length >= 15 &&
                          DRIVING_LICENSE_REGEX.test(dlNumber)
                            ? 1
                            : 0.4,
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <label
                    style={{
                      display: "grid",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    First Name
                    <input
                      type="text"
                      required
                      value={dlFirstName}
                      onChange={(e) => setDlFirstName(e.target.value)}
                      placeholder="First Name"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  </label>
                  <label
                    style={{
                      display: "grid",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Middle Name (Optional)
                    <input
                      type="text"
                      value={dlMiddleName}
                      onChange={(e) => setDlMiddleName(e.target.value)}
                      placeholder="Middle Name"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  </label>
                </div>

                <label
                  style={{
                    display: "grid",
                    gap: "4px",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Last Name
                  <input
                    type="text"
                    required
                    value={dlLastName}
                    onChange={(e) => setDlLastName(e.target.value)}
                    placeholder="Last Name"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </label>

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowDlModal(false);
                      setDlModalStep(1);
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "rgba(20, 184, 166, 0.05)",
                      border: "1px solid rgba(20, 184, 166, 0.35)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--accent-teal)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.border =
                        "1px solid var(--accent-teal)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.05)";
                      e.currentTarget.style.border =
                        "1px solid rgba(20, 184, 166, 0.35)";
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.97)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    {t("Back")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!dlNumber) {
                        showToast(t("Driving License number is required."));
                        return;
                      }
                      if (
                        dlNumber.includes("-") ||
                        dlNumber !== dlNumber.toUpperCase() ||
                        !DRIVING_LICENSE_REGEX.test(dlNumber)
                      ) {
                        showToast(
                          t(
                            "Driving License number must be fully in CAPS and contain no hyphens (-).",
                          ),
                        );
                        return;
                      }
                      if (!dlFirstName || !dlLastName) {
                        showToast(t("First and Last Names are required."));
                        return;
                      }
                      setDlModalStep(2);
                    }}
                    className="join-btn"
                    style={{
                      flex: 1.5,
                      padding: "12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Demographics & Address */}
            {dlModalStep === 2 && (
              <div style={{ display: "grid", gap: "14px", textAlign: "left" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <label
                    style={{
                      display: "grid",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Gender
                    <select
                      value={dlGender}
                      onChange={(e) => setDlGender(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        height: "42px",
                        outline: "none",
                      }}
                    >
                      <option value="M">Male / पुरुष</option>
                      <option value="F">Female / महिला</option>
                      <option value="O">Other / अन्य</option>
                    </select>
                  </label>
                  <label
                    style={{
                      display: "grid",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Date of Birth
                    <input
                      type="date"
                      required
                      value={dlDob}
                      onChange={(e) => setDlDob(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        height: "42px",
                        outline: "none",
                      }}
                    />
                  </label>
                </div>

                <label
                  style={{
                    display: "grid",
                    gap: "4px",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Full Address (as printed in DL)
                  <input
                    type="text"
                    required
                    value={dlAddress}
                    onChange={(e) => setDlAddress(e.target.value)}
                    placeholder="e.g. 1787, Nagpur Road, Medical"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <label
                    style={{
                      display: "grid",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    State
                    <input
                      type="text"
                      required
                      value={dlState}
                      onChange={(e) => setDlState(e.target.value)}
                      disabled={dlPinCode.length === 6 && !!dlState}
                      placeholder="e.g. Maharashtra"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                        opacity: dlPinCode.length === 6 && !!dlState ? 0.6 : 1,
                        cursor:
                          dlPinCode.length === 6 && !!dlState
                            ? "not-allowed"
                            : "text",
                      }}
                    />
                  </label>
                  <label
                    style={{
                      display: "grid",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    District / City
                    <input
                      type="text"
                      required
                      value={dlDistrict}
                      onChange={(e) => setDlDistrict(e.target.value)}
                      disabled={dlPinCode.length === 6 && !!dlDistrict}
                      placeholder="e.g. Nagpur"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                        opacity:
                          dlPinCode.length === 6 && !!dlDistrict ? 0.6 : 1,
                        cursor:
                          dlPinCode.length === 6 && !!dlDistrict
                            ? "not-allowed"
                            : "text",
                      }}
                    />
                  </label>
                </div>

                <label
                  style={{
                    display: "grid",
                    gap: "4px",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Pincode
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={dlPinCode}
                    onChange={(e) =>
                      setDlPinCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="e.g. 440001"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </label>

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <button
                    type="button"
                    onClick={() => setDlModalStep(1)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "rgba(20, 184, 166, 0.05)",
                      border: "1px solid rgba(20, 184, 166, 0.35)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--accent-teal)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.border =
                        "1px solid var(--accent-teal)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.05)";
                      e.currentTarget.style.border =
                        "1px solid rgba(20, 184, 166, 0.35)";
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.97)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    {t("Back")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!dlDob || !dlGender) {
                        showToast(t("Please complete demographics fields."));
                        return;
                      }
                      if (!dlAddress || !dlState || !dlDistrict || !dlPinCode) {
                        showToast(t("All address fields are required."));
                        return;
                      }
                      setDlModalStep(3);
                    }}
                    className="join-btn"
                    style={{
                      flex: 1.5,
                      padding: "12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Photo Uploads */}
            {dlModalStep === 3 && (
              <div style={{ display: "grid", gap: "16px", textAlign: "left" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  Upload clear photos of your Driving License card (JPEG or
                  PNG):
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  {/* Front Photo Card */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        fontWeight: "bold",
                      }}
                    >
                      Front Side Photo *
                    </span>
                    {dlFrontPhoto ? (
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "110px",
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: "1.5px solid var(--accent-teal)",
                        }}
                      >
                        <img
                          src={dlFrontPhoto}
                          alt="DL Front"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDlFrontPhoto("");
                            setDlFrontPhotoSize(0);
                            setDlFrontPhotoOrigSize(0);
                          }}
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            background: "rgba(239, 68, 68, 0.85)",
                            border: "none",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                            color: "#ffffff",
                          }}
                        >
                          <Trash2 style={{ width: "12px", height: "12px" }} />
                        </button>
                      </div>
                    ) : (
                      <label
                        style={{
                          width: "100%",
                          height: "110px",
                          border: "2px dashed var(--border-color)",
                          borderRadius: "12px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          background: "rgba(255, 255, 255, 0.02)",
                          transition: "all 0.2s",
                          color: "var(--text-secondary)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.border =
                            "2px dashed var(--accent-teal)";
                          e.currentTarget.style.background =
                            "rgba(20, 184, 166, 0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.border =
                            "2px dashed var(--border-color)";
                          e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.02)";
                        }}
                      >
                        <Upload
                          style={{
                            width: "20px",
                            height: "20px",
                            color: "var(--accent-teal)",
                          }}
                        />
                        <span style={{ fontSize: "10px", fontWeight: 600 }}>
                          Select Front Photo
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={(e) => handlePhotoUpload(e, "front")}
                          style={{ display: "none" }}
                        />
                      </label>
                    )}
                    {dlFrontPhoto ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          marginTop: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "9px",
                            color: "var(--accent-teal)",
                            fontWeight: "bold",
                          }}
                        >
                          ✓ Optimized: {dlFrontPhotoSize} KB{" "}
                          {dlFrontPhotoOrigSize > 0 &&
                            `(from ${dlFrontPhotoOrigSize > 1024 ? `${(dlFrontPhotoOrigSize / 1024).toFixed(1)} MB` : `${dlFrontPhotoOrigSize} KB`})`}
                        </span>
                        <span
                          style={{
                            fontSize: "8px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Size Limit: 150 KB (JPEG/PNG/JPG)
                        </span>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: "8px",
                          color: "var(--text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        Size Limit: Max 150 KB (JPEG/PNG/JPG)
                      </span>
                    )}
                  </div>

                  {/* Back Photo Card */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        fontWeight: "bold",
                      }}
                    >
                      Back Side Photo (Optional)
                    </span>
                    {dlBackPhoto ? (
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "110px",
                          borderRadius: "12px",
                          overflow: "hidden",
                          border: "1.5px solid var(--accent-teal)",
                        }}
                      >
                        <img
                          src={dlBackPhoto}
                          alt="DL Back"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDlBackPhoto("");
                            setDlBackPhotoSize(0);
                            setDlBackPhotoOrigSize(0);
                          }}
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            background: "rgba(239, 68, 68, 0.85)",
                            border: "none",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                            color: "#ffffff",
                          }}
                        >
                          <Trash2 style={{ width: "12px", height: "12px" }} />
                        </button>
                      </div>
                    ) : (
                      <label
                        style={{
                          width: "100%",
                          height: "110px",
                          border: "2px dashed var(--border-color)",
                          borderRadius: "12px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          background: "rgba(255, 255, 255, 0.02)",
                          transition: "all 0.2s",
                          color: "var(--text-secondary)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.border =
                            "2px dashed var(--accent-teal)";
                          e.currentTarget.style.background =
                            "rgba(20, 184, 166, 0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.border =
                            "2px dashed var(--border-color)";
                          e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.02)";
                        }}
                      >
                        <Upload
                          style={{
                            width: "20px",
                            height: "20px",
                            color: "var(--accent-teal)",
                          }}
                        />
                        <span style={{ fontSize: "10px", fontWeight: 600 }}>
                          Select Back Photo
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg, image/png, image/jpg"
                          onChange={(e) => handlePhotoUpload(e, "back")}
                          style={{ display: "none" }}
                        />
                      </label>
                    )}
                    {dlBackPhoto ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          marginTop: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "9px",
                            color: "var(--accent-teal)",
                            fontWeight: "bold",
                          }}
                        >
                          ✓ Optimized: {dlBackPhotoSize} KB{" "}
                          {dlBackPhotoOrigSize > 0 &&
                            `(from ${dlBackPhotoOrigSize > 1024 ? `${(dlBackPhotoOrigSize / 1024).toFixed(1)} MB` : `${dlBackPhotoOrigSize} KB`})`}
                        </span>
                        <span
                          style={{
                            fontSize: "8px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Size Limit: 150 KB (JPEG/PNG/JPG)
                        </span>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: "8px",
                          color: "var(--text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        Size Limit: Max 150 KB (JPEG/PNG/JPG)
                      </span>
                    )}
                  </div>
                </div>

                {/* Consent checkbox */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    padding: "12px",
                    cursor: "pointer",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  <input
                    type="checkbox"
                    required
                    defaultChecked={true}
                    style={{
                      marginTop: "2px",
                      accentColor: "var(--accent-teal)",
                    }}
                  />
                  <span>
                    I hereby give my consent for ABHA enrollment (version 1.4)
                    using my Driving License demographic details and photo
                    credentials.
                  </span>
                </label>

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => setDlModalStep(2)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "rgba(20, 184, 166, 0.05)",
                      border: "1px solid rgba(20, 184, 166, 0.35)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--accent-teal)",
                      cursor: isVerifying ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (isVerifying) return;
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.border =
                        "1px solid var(--accent-teal)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.05)";
                      e.currentTarget.style.border =
                        "1px solid rgba(20, 184, 166, 0.35)";
                    }}
                    onMouseDown={(e) => {
                      if (!isVerifying)
                        e.currentTarget.style.transform = "scale(0.97)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    {t("Back")}
                  </button>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => handleDlDemographicsSubmit()}
                    className="join-btn"
                    style={{
                      flex: 1.5,
                      padding: "12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: isVerifying ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2
                          className="animate-spin"
                          style={{ width: "14px", height: "14px" }}
                        />
                        <span>Verifying & Enrolling...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles style={{ width: "14px", height: "14px" }} />
                        <span>Submit & Verify</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Selection Modal */}
      {showAccountSelectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(10px)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "500px",
              padding: "30px",
              boxShadow: "var(--surface-shadow)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <img
                  src="/assets/logos/logo7.png"
                  alt="Logo"
                  style={{
                    width: "30px",
                    height: "30px",
                    objectFit: "contain",
                  }}
                />
                <h1
                  style={{
                    fontSize: "18px",
                    fontWeight: 900,
                    color: "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  ABHA SETU
                </h1>
              </div>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  margin: "0 0 6px 0",
                  color: "var(--text-primary)",
                }}
              >
                Select ABHA Profile
              </h2>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                We found {linkedAccounts.length} profiles linked with this
                number. Choose one to log in:
              </p>
            </div>

            {/* Custom Alert Box */}
            <div
              style={{
                background: "rgba(217, 119, 6, 0.1)",
                border: "1px solid rgba(217, 119, 6, 0.25)",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textAlign: "left",
                color: "#d97706",
                fontSize: "11px",
                fontWeight: 600,
                lineHeight: "1.4",
              }}
            >
              <span style={{ fontSize: "18px" }}>📢</span>
              <div>
                <strong>Multiple Accounts Found / एकाधिक खाते मिले:</strong> We
                detected multiple active ABHA profiles linked with this mobile
                number. Please select the correct profile below to establish a
                secure session.
              </div>
            </div>

            {/* List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxHeight: "280px",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {linkedAccounts.map((acc, index) => {
                const isSelected =
                  selectedAccount &&
                  (selectedAccount.ABHANumber === acc.ABHANumber ||
                    selectedAccount.preferredAbhaAddress ===
                      acc.preferredAbhaAddress);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAccount(acc)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px",
                      borderRadius: "16px",
                      border: isSelected
                        ? "1.5px solid var(--accent-teal)"
                        : "1px solid var(--border-color)",
                      background: isSelected
                        ? "rgba(20, 184, 166, 0.08)"
                        : "var(--bg-secondary)",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "var(--text-primary)",
                      transition: "all 0.2s ease",
                      outline: "none",
                      boxShadow: isSelected
                        ? "0 0 12px rgba(20, 184, 166, 0.15)"
                        : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(20, 184, 166, 0.1)",
                        display: "grid",
                        placeItems: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {acc.profilePhoto ? (
                        <img
                          src={getPhotoSrc(acc.profilePhoto)}
                          alt={acc.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Fingerprint
                          style={{
                            width: "20px",
                            height: "20px",
                            color: "var(--accent-teal)",
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                          {acc.name}
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            background: "rgba(20, 184, 166, 0.15)",
                            color: "var(--accent-teal)",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          {acc.verificationType || "VERIFIED"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-secondary)",
                          fontFamily: "monospace",
                          marginTop: "2px",
                        }}
                      >
                        ABHA ID: {acc.preferredAbhaAddress || "N/A"}
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "var(--text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        ABHA No: {acc.ABHANumber} | Gender:{" "}
                        {acc.gender === "M" ? "Male" : "Female"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowAccountSelectModal(false);
                  setIsVerifying(false);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "rgba(20, 184, 166, 0.05)",
                  border: "1px solid rgba(20, 184, 166, 0.35)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--accent-teal)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(20, 184, 166, 0.08)";
                  e.currentTarget.style.border = "1px solid var(--accent-teal)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(20, 184, 166, 0.05)";
                  e.currentTarget.style.border =
                    "1px solid rgba(20, 184, 166, 0.35)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.97)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "none";
                }}
              >
                {t("Back")}
              </button>
              <button
                type="button"
                disabled={!selectedAccount}
                onClick={() => handleSelectAbhaAccount(selectedAccount)}
                className="join-btn"
                style={{
                  flex: 2,
                  padding: "12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: !selectedAccount ? "not-allowed" : "pointer",
                  opacity: !selectedAccount ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Sparkles style={{ width: "14px", height: "14px" }} />
                <span>Confirm & Log In</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer (Bottom Sheet) */}
      {drawerType && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            pointerEvents: drawerActive ? "auto" : "none",
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              if (drawerType !== "main") closeDrawer();
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              opacity: drawerActive ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
          />
          {/* Drawer Content Panel */}
          <div
            style={{
              position: "relative",
              width: "100%",
              background: "var(--bg-card)",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              borderTop: "1px solid rgba(20, 184, 166, 0.25)",
              boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.5)",
              padding: "24px 20px 40px",
              transform: drawerActive ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Pull Handle */}
            <div
              style={{
                width: "40px",
                height: "4px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "2px",
                alignSelf: "center",
                marginBottom: "8px",
              }}
            />

            <HomeButton isDrawer />
            <LanguageSwitcher isDrawer />

            <div
              style={{
                opacity: fadeOpacity,
                transition: "opacity 150ms ease-in-out",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
              }}
            >
              {/* Header */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "var(--text-primary)",
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    {drawerType === "main" && t("Select Option")}
                    {drawerType === "login" &&
                      (flowState === "login_mobile"
                        ? t("Login via Mobile Number")
                        : flowState === "login_aadhaar"
                          ? t("Login via Aadhaar")
                          : flowState === "login_abha"
                            ? t("Login via ABHA ID")
                            : t("Login"))}
                    {drawerType === "create" &&
                      (flowState === "create_aadhaar"
                        ? t("Create via Aadhaar")
                        : flowState === "create_dl"
                          ? t("Create via Driving License")
                          : t("Create ABHA"))}
                    {drawerType === "find" && t("Find ABHA")}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    margin: "4px 0 0",
                    lineHeight: 1.4,
                    textAlign: "center",
                  }}
                >
                  {drawerType === "main" &&
                    t("Select a service below to get started:")}
                  {drawerType === "login" &&
                    (flowState === "login_mobile"
                      ? t(
                          "Enter your 10-digit mobile number linked to your ABHA profile.",
                        )
                      : flowState === "login_aadhaar"
                        ? t(
                            "Verify your identity using Aadhaar-linked mobile secure OTP.",
                          )
                        : flowState === "login_abha"
                          ? t(
                              "Enter your 14-digit ABHA Number or ABHA Address (@sbx).",
                            )
                          : t("Select a method to log in to your profile:"))}
                  {drawerType === "create" &&
                    (flowState === "create_aadhaar"
                      ? t(
                          "Create your unique 14-digit ABHA number using Aadhaar secure OTP.",
                        )
                      : flowState === "create_dl"
                        ? t(
                            "Enter your mobile number to request a DL verification OTP.",
                          )
                        : t("Select a registration method below:"))}
                  {drawerType === "find" &&
                    (flowState === "find_mobile" && foundProfiles.length === 0
                      ? t(
                          "Locate your ABHA profiles linked with your mobile number.",
                        )
                      : foundProfiles.length > 0
                        ? t("Select a profile below to log in directly.")
                        : t("Retrieve your registered ABHA details:"))}
                </p>
              </div>

              {/* List of sub-methods or form */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {flowState === "menu" ? (
                  <>
                    {drawerType === "main" && renderSelectionCards(true)}
                    {drawerType === "login" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          marginTop: "12px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsNavigating(true);
                            setTimeout(() => {
                              setIsNavigating(false);
                              setActiveTab("mobile");
                              setOtpSent(false);
                              setIdentifier("");
                              setFlowState("login_mobile");
                            }, 600);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "14px",
                            borderRadius: "16px",
                            border: "1px solid var(--border-color)",
                            background:
                              "linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                            outline: "none",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.border =
                              "1px solid rgba(255, 255, 255, 0.2)";
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0, 0, 0, 0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.border =
                              "1px solid var(--border-color)";
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))";
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }}
                          onTouchStart={(e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.transform = "none";
                          }}
                        >
                          <div
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "14px",
                              background:
                                "linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.04))",
                              border: "1px solid rgba(20, 184, 166, 0.25)",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            <img
                              src="/assets/logos/mobile_login.svg"
                              alt="Mobile"
                              style={{
                                // width: "32px",
                                // height: "32px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "bold",
                                color: "var(--text-primary)",
                              }}
                            >
                              Mobile OTP
                            </span>
                            <span
                              style={{
                                fontSize: "10.5px",
                                color: "var(--text-secondary)",
                                lineHeight: 1.3,
                              }}
                            >
                              Login using linked mobile OTP verification
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsNavigating(true);
                            setTimeout(() => {
                              setIsNavigating(false);
                              setActiveTab("aadhaar");
                              setOtpSent(false);
                              setIdentifier("");
                              setFlowState("login_aadhaar");
                            }, 600);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "14px",
                            borderRadius: "16px",
                            border: "1px solid rgba(20, 184, 166, 0.45)",
                            background:
                              "linear-gradient(90deg, rgba(20, 184, 166, 0.08), rgba(20, 184, 166, 0.02))",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                            outline: "none",
                            transition: "all 0.2s ease",
                            boxShadow: "0 0 12px rgba(20, 184, 166, 0.12)",
                            position: "relative",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.border =
                              "1px solid rgba(20, 184, 166, 0.85)";
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(20, 184, 166, 0.12), rgba(20, 184, 166, 0.04))";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 16px rgba(20, 184, 166, 0.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.border =
                              "1px solid rgba(20, 184, 166, 0.45)";
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(20, 184, 166, 0.08), rgba(20, 184, 166, 0.02))";
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow =
                              "0 0 12px rgba(20, 184, 166, 0.12)";
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }}
                          onTouchStart={(e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.transform = "none";
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "12px",
                              fontSize: "8px",
                              background: "var(--accent-teal)",
                              color: "var(--bg-card)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              boxShadow:
                                "0 2px 6px color-mix(in srgb, var(--accent-teal) 30%, transparent)",
                              zIndex: 2,
                            }}
                          >
                            {t("Preferred")}
                          </span>

                          <div
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "14px",
                              background:
                                "linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05))",
                              border: "1px solid rgba(20, 184, 166, 0.45)",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            <img
                              src="/assets/logos/aadhaar.png"
                              alt="Aadhaar"
                              style={{
                                width: "32px",
                                height: "32px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "bold",
                                color: "var(--text-primary)",
                              }}
                            >
                              Aadhaar
                            </span>
                            <span
                              style={{
                                fontSize: "10.5px",
                                color: "var(--text-secondary)",
                                lineHeight: 1.3,
                              }}
                            >
                              Login using Aadhaar-linked mobile secure OTP
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsNavigating(true);
                            setTimeout(() => {
                              setIsNavigating(false);
                              setActiveTab("abha");
                              setOtpSent(false);
                              setIdentifier("");
                              setFlowState("login_abha");
                            }, 600);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "14px",
                            borderRadius: "16px",
                            border: "1px solid var(--border-color)",
                            background:
                              "linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                            outline: "none",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.border =
                              "1px solid rgba(255, 255, 255, 0.2)";
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0, 0, 0, 0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.border =
                              "1px solid var(--border-color)";
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))";
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }}
                          onTouchStart={(e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.transform = "none";
                          }}
                        >
                          <div
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "14px",
                              background:
                                "linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(20, 184, 166, 0.03))",
                              border: "1px solid rgba(20, 184, 166, 0.2)",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            <img
                              src="/assets/logos/abha.png"
                              alt="ABHA"
                              style={{
                                width: "32px",
                                height: "32px",
                                objectFit: "contain",
                                filter: "var(--logo-filter)",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "bold",
                                color: "var(--text-primary)",
                              }}
                            >
                              ABHA ID
                            </span>
                            <span
                              style={{
                                fontSize: "10.5px",
                                color: "var(--text-secondary)",
                                lineHeight: 1.3,
                              }}
                            >
                              Login using 14-digit ABHA Number or ABHA Address
                            </span>
                          </div>
                        </button>
                      </div>
                    )}

                    {drawerType === "create" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          marginTop: "12px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsNavigating(true);
                            setTimeout(() => {
                              setIsNavigating(false);
                              setActiveTab("aadhaar");
                              setOtpSent(false);
                              setIdentifier("");
                              setFlowState("create_aadhaar");
                            }, 600);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "14px",
                            borderRadius: "16px",
                            border: "1px solid rgba(20, 184, 166, 0.45)",
                            background:
                              "linear-gradient(90deg, rgba(20, 184, 166, 0.08), rgba(20, 184, 166, 0.02))",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                            outline: "none",
                            transition: "all 0.2s ease",
                            boxShadow: "0 0 12px rgba(20, 184, 166, 0.12)",
                            position: "relative",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.border =
                              "1px solid rgba(20, 184, 166, 0.85)";
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(20, 184, 166, 0.12), rgba(20, 184, 166, 0.04))";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 16px rgba(20, 184, 166, 0.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.border =
                              "1px solid rgba(20, 184, 166, 0.45)";
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(20, 184, 166, 0.08), rgba(20, 184, 166, 0.02))";
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow =
                              "0 0 12px rgba(20, 184, 166, 0.12)";
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }}
                          onTouchStart={(e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.transform = "none";
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "12px",
                              fontSize: "8px",
                              background: "var(--accent-teal)",
                              color: "var(--bg-card)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              boxShadow:
                                "0 2px 6px color-mix(in srgb, var(--accent-teal) 30%, transparent)",
                              zIndex: 2,
                            }}
                          >
                            {t("Preferred")}
                          </span>

                          <div
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "14px",
                              background:
                                "linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05))",
                              border: "1px solid rgba(20, 184, 166, 0.45)",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            <img
                              src="/assets/logos/aadhaar.png"
                              alt="Aadhaar"
                              style={{
                                width: "32px",
                                height: "32px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "bold",
                                color: "var(--text-primary)",
                              }}
                            >
                              Aadhaar Card
                            </span>
                            <span
                              style={{
                                fontSize: "10.5px",
                                color: "var(--text-secondary)",
                                lineHeight: 1.3,
                              }}
                            >
                              Generate new ABHA ID using Aadhaar OTP
                              verification
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsNavigating(true);
                            setTimeout(() => {
                              setIsNavigating(false);
                              setActiveTab("dl");
                              setOtpSent(false);
                              setIdentifier("");
                              setFlowState("create_dl");
                            }, 600);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            padding: "14px",
                            borderRadius: "16px",
                            border: "1px solid var(--border-color)",
                            background:
                              "linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                            outline: "none",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.border =
                              "1px solid rgba(255, 255, 255, 0.2)";
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))";
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0, 0, 0, 0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.border =
                              "1px solid var(--border-color)";
                            e.currentTarget.style.background =
                              "linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))";
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                          }}
                          onTouchStart={(e) => {
                            e.currentTarget.style.transform = "scale(0.97)";
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.transform = "none";
                          }}
                        >
                          <div
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "14px",
                              background:
                                "linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.05))",
                              border: "1px solid rgba(20, 184, 166, 0.25)",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            <img
                              src="/assets/logos/dl.png"
                              alt="Driving License"
                              style={{
                                width: "32px",
                                height: "32px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "bold",
                                color: "var(--text-primary)",
                              }}
                            >
                              Driving License
                            </span>
                            <span
                              style={{
                                fontSize: "10.5px",
                                color: "var(--text-secondary)",
                                lineHeight: 1.3,
                              }}
                            >
                              Request ABHA enrollment using DL details and photo
                              credentials
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  renderActiveForm(true)
                )}
              </div>

              {/* Drawer Actions */}
              <div style={{ marginTop: "8px" }}>
                {drawerType !== "main" && flowState === "menu" && (
                  <button
                    type="button"
                    onClick={handleMobileGestureBack}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "rgba(20, 184, 166, 0.05)",
                      border: "1px solid rgba(20, 184, 166, 0.35)",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "var(--accent-teal)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.border =
                        "1px solid var(--accent-teal)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(20, 184, 166, 0.05)";
                      e.currentTarget.style.border =
                        "1px solid rgba(20, 184, 166, 0.35)";
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.98)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <ArrowLeft style={{ width: "14px", height: "14px" }} />
                    <span>{t("Back")}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
