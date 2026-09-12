"use client";

import { useState, useEffect, useId, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  Trash2,
  ArrowLeft,
  Settings,
  Database,
  Search,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Save,
  Check,
  AlertCircle,
  Sun,
  Moon,
  Activity,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  KeyRound,
  UserCheck,
  Shield,
  Sparkles,
  Stethoscope,
  Building2,
  CalendarDays,
  User,
  MessageSquare,
  Copy,
  FileText,
  Camera,
  Upload,
  ImageIcon,
  Plus,
  Maximize2,
  Printer,
  Share2,
  X,
  Download,
  History,
  Pill,
  ClipboardList,
  FilePlus,
  UserPlus,
} from "lucide-react";
import {
  Appointment,
  PatientRecord,
  PatientSummary,
  ClinicScheduleSettings,
  getAdminAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getPatientHistory,
  getAllPatientsSummary,
  addPatientRecord,
  deletePatientRecord,
  compressImageFile,
  getLocalSettings,
  saveLocalSettings,
  formatTime12h,
  formatDateDisplay,
  formatDateWithDay,
  getLocalDateString,
  getTomorrowDateString,
} from "@/lib/booking-service";
import { isSupabaseConfigured } from "@/lib/supabase";

function WhatsAppIcon({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.502.1-.201.05-.376-.025-.527-.075-.15-.678-1.634-.929-2.238-.245-.589-.494-.509-.678-.519l-.578-.01c-.201 0-.527.075-.803.376s-1.054 1.03-1.054 2.511c0 1.482 1.079 2.912 1.23 3.113.15.201 2.122 3.24 5.14 4.544.718.31 1.279.496 1.716.635.721.23 1.377.197 1.896.12.578-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.177L2.07 21.605a.75.75 0 0 0 .925.925l4.428-1.364A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-8.5 10a8.5 8.5 0 1 1 14.887 5.617.75.75 0 0 0-.214.544l.872 2.833-2.833-.872a.75.75 0 0 0-.544.214A8.47 8.47 0 0 1 12 20.5 8.5 8.5 0 0 1 3.5 12z"
      />
    </svg>
  );
}

// Authentication Storage Keys
const AUTH_SESSION_KEY = "sai_doctor_auth_session";
const CUSTOM_CREDS_KEY = "sai_doctor_custom_credentials";

// Default Doctor Credentials
const DEFAULT_DOCTOR_PHONE = "9876543210";
const DEFAULT_DOCTOR_PASS = "sai123";

export default function DoctorPortalPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Security Credentials Tab State
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credsSaved, setCredsSaved] = useState(false);
  const [credsError, setCredsError] = useState("");

  // Dashboard Tabs & Data State
  const [activeTab, setActiveTab] = useState<
    "appointments" | "history" | "settings" | "security" | "database"
  >("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Patient Medical History State
  const [patientsSummary, setPatientsSummary] = useState<PatientSummary[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<{
    phone: string;
    name: string;
    age?: number;
  } | null>(null);
  const [selectedPatientRecords, setSelectedPatientRecords] = useState<
    PatientRecord[]
  >([]);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [activeRecordTab, setActiveRecordTab] = useState<
    "timeline" | "new_record"
  >("timeline");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // New Checkup Record Form State
  const [newCheckupDate, setNewCheckupDate] = useState(getLocalDateString());
  const [newPatientAge, setNewPatientAge] = useState<string>("");
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [newPrescriptionText, setNewPrescriptionText] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newFollowUpDate, setNewFollowUpDate] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [recordSaveError, setRecordSaveError] = useState("");
  const [recordSaveSuccess, setRecordSaveSuccess] = useState(false);

  // Direct Walk-In Patient Form Modal State
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInAge, setWalkInAge] = useState("");

  // Lightbox Zoom State
  const [zoomImageSrc, setZoomImageSrc] = useState<string | null>(null);

  // Printable Prescription State
  const [printableRecord, setPrintableRecord] = useState<PatientRecord | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Local timezone safe today & tomorrow
  const todayStr = getLocalDateString();
  const tomorrowStr = getTomorrowDateString();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] =
    useState<ClinicScheduleSettings>(getLocalSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Form IDs for accessibility
  const loginPhoneId = useId();
  const loginPassId = useId();
  const shift1StartId = useId();
  const shift1EndId = useId();
  const shift2StartId = useId();
  const shift2EndId = useId();
  const slotDurationId = useId();

  // 1. Check Session on Mount
  useEffect(() => {
    try {
      const localSession = localStorage.getItem(AUTH_SESSION_KEY);
      const sessionData = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (localSession === "true" || sessionData === "true") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  // 2. Fetch Appointments & Patients Directory when Authenticated
  const loadAppointments = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    setRefreshing(true);
    try {
      const [data, summary] = await Promise.all([
        getAdminAppointments(),
        getAllPatientsSummary(),
      ]);
      setAppointments(data);
      setPatientsSummary(summary);
    } catch (err) {
      console.error("Failed to load appointments & patients", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments(true);
      setSettings(getLocalSettings());
    }
  }, [isAuthenticated]);

  // Handle Login Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);

    const cleanPhone = loginPhone.trim().replace(/\D/g, "");
    const cleanPass = loginPassword.trim();

    if (!cleanPhone || cleanPhone.length < 10) {
      setAuthError("Please enter a valid 10-digit mobile number.");
      setIsLoggingIn(false);
      return;
    }

    if (!cleanPass) {
      setAuthError("Please enter your password.");
      setIsLoggingIn(false);
      return;
    }

    // Check stored credentials or fall back to default
    let expectedPhone = DEFAULT_DOCTOR_PHONE;
    let expectedPass = DEFAULT_DOCTOR_PASS;

    try {
      const storedCreds = localStorage.getItem(CUSTOM_CREDS_KEY);
      if (storedCreds) {
        const parsed = JSON.parse(storedCreds);
        if (parsed.phone) expectedPhone = parsed.phone;
        if (parsed.password) expectedPass = parsed.password;
      }
    } catch (err) {
      console.error("Error reading credentials", err);
    }

    const isClinicPhoneMatch =
      cleanPhone === "9431343718" && cleanPass === DEFAULT_DOCTOR_PASS;
    const isExactMatch =
      cleanPhone === expectedPhone && cleanPass === expectedPass;

    if (isExactMatch || isClinicPhoneMatch) {
      try {
        if (rememberMe) {
          localStorage.setItem(AUTH_SESSION_KEY, "true");
        } else {
          sessionStorage.setItem(AUTH_SESSION_KEY, "true");
        }
      } catch (err) {
        console.error("Storage error", err);
      }
      setIsAuthenticated(true);
      setIsLoggingIn(false);
    } else {
      setAuthError("Invalid mobile number or password. Please verify.");
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch (err) {
      console.error("Storage clear error", err);
    }
    setIsAuthenticated(false);
    setLoginPassword("");
  };

  // Quick autofill demo credentials
  const handleAutoFillDemo = () => {
    setLoginPhone(DEFAULT_DOCTOR_PHONE);
    setLoginPassword(DEFAULT_DOCTOR_PASS);
    setAuthError("");
  };

  // Handle Save Custom Credentials
  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredsError("");
    setCredsSaved(false);

    const cleanP = newPhone.trim().replace(/\D/g, "");
    if (!cleanP || cleanP.length < 10) {
      setCredsError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (newPassword.length < 4) {
      setCredsError("Password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setCredsError("Passwords do not match.");
      return;
    }

    try {
      localStorage.setItem(
        CUSTOM_CREDS_KEY,
        JSON.stringify({ phone: cleanP, password: newPassword }),
      );
      setCredsSaved(true);
      setNewPhone("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setCredsSaved(false), 4000);
    } catch (err) {
      setCredsError("Failed to save credentials to local storage.");
    }
  };

  // Instant optimistic status update
  const handleStatusChange = async (
    id: string,
    newStatus: "confirmed" | "completed" | "cancelled",
  ) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    );
    updateAppointmentStatus(id, newStatus);
  };

  // Instant optimistic deletion of appointment
  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to remove this appointment? The 15-minute slot will become available again for other patients.",
      )
    ) {
      setAppointments((prev) => prev.filter((item) => item.id !== id));
      deleteAppointment(id);
    }
  };

  // ==========================================
  // PATIENT MEDICAL HISTORY & PRESCRIPTION HANDLERS
  // ==========================================

  // Open Patient History Modal
  const handleOpenPatientHistory = async (
    phone: string,
    name: string,
    age?: number,
    openNewForm: boolean = false,
  ) => {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    setSelectedPatient({ phone: cleanPhone, name, age });
    setNewCheckupDate(getLocalDateString());
    setNewPatientAge(age ? String(age) : "");
    setNewDiagnosis("");
    setNewPrescriptionText("");
    setNewNotes("");
    setNewFollowUpDate("");
    setNewImages([]);
    setRecordSaveError("");
    setRecordSaveSuccess(false);
    setActiveRecordTab(openNewForm ? "new_record" : "timeline");
    setIsPatientModalOpen(true);
    setLoadingHistory(true);

    try {
      const records = await getPatientHistory(cleanPhone);
      setSelectedPatientRecords(records);
    } catch (err) {
      console.error("Failed to load patient records", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle Photo & Report Upload / Camera Capture with Auto-Compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setRecordSaveError("");

    try {
      const compressedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const compressed = await compressImageFile(file, 1200, 1200, 0.75);
          compressedList.push(compressed);
        }
      }
      setNewImages((prev) => [...prev, ...compressedList]);
    } catch (err) {
      console.error("Failed to compress images", err);
      setRecordSaveError("Failed to process attached photo. Please try again.");
    } finally {
      setIsUploadingImage(false);
      // Reset input value
      if (e.target) e.target.value = "";
    }
  };

  // Remove Photo from New Record Form
  const handleRemoveNewImage = (indexToRemove: number) => {
    setNewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Save New Checkup Record / Prescription
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setRecordSaveError("");
    setIsSavingRecord(true);

    const cleanPhone = selectedPatient.phone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length < 8) {
      setRecordSaveError("Patient phone number is missing.");
      setIsSavingRecord(false);
      return;
    }

    if (!newDiagnosis.trim() && !newPrescriptionText.trim() && newImages.length === 0) {
      setRecordSaveError(
        "Please provide at least a diagnosis, prescription text, or an attached prescription photo.",
      );
      setIsSavingRecord(false);
      return;
    }

    const patientAgeNum = newPatientAge ? parseInt(newPatientAge, 10) : selectedPatient.age;

    const res = await addPatientRecord({
      patient_phone: cleanPhone,
      patient_name: selectedPatient.name,
      patient_age: patientAgeNum,
      checkup_date: newCheckupDate || getLocalDateString(),
      diagnosis: newDiagnosis.trim() || "Routine Checkup / Consultation",
      prescription_text: newPrescriptionText.trim(),
      prescription_images: newImages,
      notes: newNotes.trim(),
      follow_up_date: newFollowUpDate || undefined,
    });

    if (res.success && res.record) {
      // Optimistic update timeline
      setSelectedPatientRecords((prev) => [res.record!, ...prev]);
      setRecordSaveSuccess(true);
      setIsSavingRecord(false);

      // Reset form
      setNewDiagnosis("");
      setNewPrescriptionText("");
      setNewNotes("");
      setNewFollowUpDate("");
      setNewImages([]);

      // Refresh Patients Directory in background
      getAllPatientsSummary().then((summary) => setPatientsSummary(summary));

      // Switch to timeline after 500ms
      setTimeout(() => {
        setRecordSaveSuccess(false);
        setActiveRecordTab("timeline");
      }, 700);
    } else {
      setRecordSaveError(res.error || "Failed to save record.");
      setIsSavingRecord(false);
    }
  };

  // Delete Record Permanently
  const handleDeleteRecord = async (recordId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this checkup record and prescription? This action cannot be undone.",
      )
    ) {
      return;
    }

    setSelectedPatientRecords((prev) => prev.filter((r) => r.id !== recordId));
    await deletePatientRecord(recordId);
    getAllPatientsSummary().then((summary) => setPatientsSummary(summary));
  };

  // Share Prescription via WhatsApp to Patient
  const handleShareWhatsAppPrescription = (record: PatientRecord) => {
    const cleanPhone = record.patient_phone.replace(/\D/g, "").slice(-10);
    const ageStr = record.patient_age ? ` (${record.patient_age} yrs)` : "";
    const dateFormatted = formatDateDisplay(record.checkup_date);

    let message = `🌿 *SAI HOMOEO CLINIC - PRESCRIPTION*\n`;
    message += `👨‍⚕️ *Dr. S. K. Sharma* (B.H.M.S)\n`;
    message += `----------------------------------------\n`;
    message += `👤 *Patient:* ${record.patient_name}${ageStr}\n`;
    message += `📅 *Date:* ${dateFormatted}\n`;
    message += `🩺 *Diagnosis:* ${record.diagnosis}\n\n`;

    if (record.prescription_text) {
      message += `💊 *PRESCRIPTION (Rx):*\n${record.prescription_text}\n\n`;
    }

    if (record.notes) {
      message += `📝 *Doctor Advice & Notes:*\n${record.notes}\n\n`;
    }

    if (record.follow_up_date) {
      message += `🔄 *Next Follow-up:* ${formatDateDisplay(record.follow_up_date)}\n\n`;
    }

    message += `----------------------------------------\n`;
    message += `📍 *Sai Homoeo Clinic*, Near Ramni Kali Mandir, Baridih, Jamshedpur\n`;
    message += `📞 *Helpline / Appointments:* +91 94313 43718 / +91 98765 43210\n`;
    message += `_Take medicines in clean mouth, 15 mins before or after meals._`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/91${cleanPhone}?text=${encoded}`, "_blank");
  };

  // Print Prescription Slip
  const handlePrintPrescription = (record: PatientRecord) => {
    setPrintableRecord(record);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Walk-In Patient Submission
  const handleStartWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = walkInPhone.trim().replace(/\D/g, "").slice(-10);
    if (!walkInName.trim()) return;
    if (!cleanPhone || cleanPhone.length < 8) return;

    setIsWalkInModalOpen(false);
    handleOpenPatientHistory(
      cleanPhone,
      walkInName.trim(),
      walkInAge ? parseInt(walkInAge, 10) : undefined,
      true,
    );
    setWalkInName("");
    setWalkInPhone("");
    setWalkInAge("");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalSettings(settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Live count computations
  const todayCount = appointments.filter(
    (a) => a.appointment_date === todayStr && a.status !== "cancelled",
  ).length;
  const tomorrowCount = appointments.filter(
    (a) => a.appointment_date === tomorrowStr && a.status !== "cancelled",
  ).length;
  const allCount = appointments.filter((a) => a.status !== "cancelled").length;

  // In-memory instant date filtering
  const dateFilteredAppointments = selectedDate
    ? appointments.filter((apt) => apt.appointment_date === selectedDate)
    : appointments;

  const filteredAppointments = dateFilteredAppointments.filter((apt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      apt.patient_name.toLowerCase().includes(query) ||
      apt.patient_phone.includes(query) ||
      apt.problem.toLowerCase().includes(query)
    );
  });

  const morningBookings = filteredAppointments.filter((a) => {
    const hour = parseInt(a.slot_start_time.split(":")[0], 10);
    return hour < 15;
  });

  const eveningBookings = filteredAppointments.filter((a) => {
    const hour = parseInt(a.slot_start_time.split(":")[0], 10);
    return hour >= 15;
  });

  // Loading state while verifying session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-700">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">
            Securing Doctor Portal...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 1. UN-AUTHENTICATED: SPLIT-CARD DOCTOR LOGIN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans">
        {/* Top Navigation */}
        <div className="max-w-3xl w-full mx-auto flex items-center justify-between pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs transition"
          >
            <ArrowLeft size={15} className="text-slate-600" />
            <span>Return to Website</span>
          </Link>

          <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100/80 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck size={13} className="text-emerald-700" />
            <span>Doctor Secure Login</span>
          </span>
        </div>

        {/* Split Card Container with Outer Border */}
        <div className="max-w-3xl w-full mx-auto my-auto py-6">
          <div className="bg-white rounded-3xl overflow-hidden border-2 border-emerald-900 shadow-2xl grid grid-cols-1 md:grid-cols-12">
            {/* HALF 1: DARK BRANDING SECTION (Top on Mobile / Left on Desktop) */}
            <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-emerald-900">
              {/* Subtle ambient lighting */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-900/40">
                  <Stethoscope size={24} />
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Sai Homoeo Clinic
                  </h1>
                  <span className="inline-block mt-1 text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Doctor Portal Access
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2 relative z-10">
                <Lock size={13} className="text-emerald-400 shrink-0" />
                <span>256-Bit Encrypted Clinical Data</span>
              </div>
            </div>

            {/* HALF 2: LIGHT FORM SECTION (Bottom on Mobile / Right on Desktop) */}
            <div className="md:col-span-7 bg-white p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-black text-slate-900">
                    Sign In to Workspace
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your registered doctor mobile number &amp; password.
                  </p>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
                    <AlertCircle
                      size={15}
                      className="text-red-500 shrink-0 mt-0.5"
                    />
                    <p className="flex-1">{authError}</p>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Mobile Input */}
                  <div className="space-y-1">
                    <label
                      htmlFor={loginPhoneId}
                      className="block text-xs font-bold text-slate-700"
                    >
                      Doctor Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 flex items-center font-bold text-xs border-r border-slate-200 pr-2.5">
                        <span>+91</span>
                      </div>
                      <input
                        id={loginPhoneId}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="9876543210"
                        value={loginPhone}
                        onChange={(e) =>
                          setLoginPhone(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full pl-16 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label
                      htmlFor={loginPassId}
                      className="block text-xs font-bold text-slate-700"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id={loginPassId}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Remember on this browser</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-sm shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        <span>Sign In to Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Demo Helper Chip */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2 transition"
                >
                  <Sparkles size={13} className="text-emerald-600" />
                  <span>1-Click Auto Fill: 9876543210 • sai123</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 pb-2">
          Sai Homoeo Clinic • Baridih, Jamshedpur • Confidential Portal Access
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. AUTHENTICATED: CLEAN & EXECUTIVE DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. TOP EXECUTIVE HEADER */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          {/* Left: Brand & Return */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition shrink-0"
              title="Return to Website"
            >
              <ArrowLeft size={16} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white truncate">
                  Sai Homoeo Clinic
                </span>
                <span className="hidden md:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0">
                  <ShieldCheck size={11} />
                  <span>Doctor Workspace</span>
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 truncate">
                Baridih, Jamshedpur • 15-Minute Slot Management
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition hidden sm:inline-flex items-center gap-1.5 border border-slate-700"
            >
              <span>View Website</span>
              <ChevronRight size={14} />
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 hover:text-white font-bold text-xs transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0"
              title="Sign Out from Doctor Portal"
            >
              <LogOut size={13} className="shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* 2. NAVIGATION TABS */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6 flex gap-1 border-t border-slate-800/80 pt-1 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-3 sm:px-4 py-2 text-xs font-bold border-b-2 shrink-0 flex items-center gap-1.5 transition ${
              activeTab === "appointments"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar size={14} />
            <span>
              <span className="hidden sm:inline">Appointments</span>
              <span className="sm:hidden">Bookings</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none ${
                activeTab === "appointments"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {allCount}
            </span>
          </button>

          {/* Patient Checkup & History Tab */}
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 sm:px-4 py-2 text-xs font-bold border-b-2 shrink-0 flex items-center gap-1.5 transition ${
              activeTab === "history"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ClipboardList size={14} />
            <span>Checkup &amp; History</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none ${
                activeTab === "history"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {patientsSummary.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 sm:px-4 py-2 text-xs font-bold border-b-2 shrink-0 flex items-center gap-1.5 transition ${
              activeTab === "settings"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock size={14} />
            <span>
              <span className="hidden sm:inline">
                Clinic Timings &amp; Shifts
              </span>
              <span className="sm:hidden">Shifts</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-3 sm:px-4 py-2 text-xs font-bold border-b-2 shrink-0 flex items-center gap-1.5 transition ${
              activeTab === "security"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound size={14} />
            <span>
              <span className="hidden sm:inline">Doctor Security</span>
              <span className="sm:hidden">Security</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={`px-3 sm:px-4 py-2 text-xs font-bold border-b-2 shrink-0 flex items-center gap-1.5 transition ${
              activeTab === "database"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database size={14} />
            <span>
              <span className="hidden sm:inline">DB Config</span>
              <span className="sm:hidden">Database</span>
            </span>
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* TAB 1: APPOINTMENTS & LIVE FEED */}
      {/* ========================================== */}
      {activeTab === "appointments" && (
        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-6 pb-24 space-y-4 sm:space-y-6">
          {/* Quick Date Filters & Search */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Date Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Today Button */}
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedDate === todayStr
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>Today</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none ${
                      selectedDate === todayStr
                        ? "bg-white/25 text-white"
                        : todayCount > 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {todayCount}
                  </span>
                </button>

                {/* Tomorrow Button */}
                <button
                  onClick={() => setSelectedDate(tomorrowStr)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedDate === tomorrowStr
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>Tomorrow</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none ${
                      selectedDate === tomorrowStr
                        ? "bg-white/25 text-white"
                        : tomorrowCount > 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tomorrowCount}
                  </span>
                </button>

                {/* All Dates Button */}
                <button
                  onClick={() => setSelectedDate("")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedDate === ""
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>All Dates</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none ${
                      selectedDate === ""
                        ? "bg-white/25 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {allCount}
                  </span>
                </button>
              </div>

              {/* Custom Date Input */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-500 font-semibold shrink-0">
                  Select Date:
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-semibold"
                />
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search patient by name, mobile number, or health condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* Total */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 truncate">
                  Total Bookings
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Calendar size={14} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {filteredAppointments.length}
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-0.5 truncate">
                {selectedDate ? formatDateDisplay(selectedDate) : "All time"}
              </div>
            </div>

            {/* Morning Shift */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 truncate">
                  Morning Shift
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Sun size={14} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-2">
                {morningBookings.length}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                10:00 AM – 02:00 PM
              </div>
            </div>

            {/* Evening Shift */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 truncate">
                  Evening Shift
                </span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Moon size={14} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-teal-800 mt-2">
                {eveningBookings.length}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                05:00 PM – 10:00 PM
              </div>
            </div>

            {/* Database Status */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 truncate">
                  Cloud Database
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Activity size={14} />
                </div>
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 mt-2 flex items-center gap-1.5 truncate">
                <span
                  className={`w-2 h-2 shrink-0 rounded-full ${isSupabaseConfigured ? "bg-emerald-500" : "bg-amber-500"}`}
                ></span>
                <span className="truncate">
                  {isSupabaseConfigured ? "Supabase Live" : "Local Storage"}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                Multi-tenant ready
              </div>
            </div>
          </div>

          {/* Appointments Feed Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Feed Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Patient Consultation Queue
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {filteredAppointments.length} patient appointments found
                  </p>
                </div>
              </div>

              <button
                onClick={() => loadAppointments(false)}
                disabled={refreshing}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh live data"
              >
                <RefreshCw
                  size={12}
                  className={refreshing ? "animate-spin text-emerald-700" : ""}
                />
                <span>Refresh</span>
              </button>
            </div>

            {/* List Body */}
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                Loading appointments...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar size={26} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">
                    No bookings found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    There are no patient appointments scheduled for this date.
                    New bookings will appear here instantly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 sm:p-5 space-y-3.5 bg-slate-50/50">
                {filteredAppointments.map((apt) => {
                  const isDone = apt.status === "completed";
                  const isCancelled = apt.status === "cancelled";

                  return (
                    <div
                      key={apt.id}
                      className={`rounded-2xl border transition-all p-3.5 sm:p-5 bg-white shadow-2xs hover:shadow-md ${
                        isDone
                          ? "border-emerald-800/80 bg-emerald-50/20"
                          : isCancelled
                            ? "border-slate-300 bg-slate-50/70 opacity-80"
                            : "border-emerald-800 hover:border-emerald-900"
                      }`}
                    >
                      {/* Left Slot Time Badge + Patient Info */}
                      <div className="flex items-start gap-3.5">
                        {/* Left Side 15-Minute Slot Badge */}
                        <div className="w-20 sm:w-24 shrink-0 p-2 sm:p-2.5 rounded-xl bg-emerald-900 text-white text-center shadow-2xs border border-emerald-950">
                          <div className="text-xs sm:text-sm font-black text-white tracking-tight leading-none">
                            {formatTime12h(apt.slot_start_time)}
                          </div>
                          <div className="text-[10px] text-emerald-200 font-semibold mt-1 leading-none">
                            to {formatTime12h(apt.slot_end_time)}
                          </div>
                          <div className="text-[9px] uppercase font-bold text-emerald-300/80 mt-1 sm:mt-1.5 leading-none">
                            15 Mins
                          </div>
                        </div>

                        {/* Patient Details */}
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-extrabold text-slate-900 break-words">
                              {apt.patient_name}
                            </span>
                            {typeof apt.patient_age === "number" &&
                              apt.patient_age > 0 &&
                              apt.patient_age <= 120 && (
                                <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                  {apt.patient_age} yrs
                                </span>
                              )}
                            <span
                              className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                isDone
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : isCancelled
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-emerald-100 text-emerald-900 border-emerald-300"
                              }`}
                            >
                              {apt.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">
                              Health Concern:
                            </span>
                            <span className="font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 text-[11px] sm:text-xs">
                              {apt.problem}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <span>Date:</span>
                              <strong className="text-emerald-900 font-extrabold">
                                {formatDateDisplay(apt.appointment_date)}
                              </strong>
                            </span>
                            <span>•</span>
                            <span className="capitalize font-medium text-slate-600">
                              {apt.consultation_mode === "in-clinic"
                                ? "🏥 In-Clinic"
                                : "📱 Online"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Toolbar */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        {/* Left Group: Checkup & History + Direct Patient Contacts */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                          {/* Main Action: Checkup & History */}
                          <button
                            onClick={() =>
                              handleOpenPatientHistory(
                                apt.patient_phone,
                                apt.patient_name,
                                apt.patient_age,
                                false,
                              )
                            }
                            className="w-full sm:w-auto h-9 px-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                            title="View Patient Checkup & History"
                          >
                            <ClipboardList
                              size={14}
                              className="text-emerald-200 shrink-0"
                            />
                            <span>Checkup &amp; History</span>
                          </button>

                          {/* Contact: Call & WhatsApp */}
                          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                            <a
                              href={`tel:${apt.patient_phone}`}
                              className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
                              title="Call Patient"
                            >
                              <Phone
                                size={13}
                                className="text-emerald-700 shrink-0"
                              />
                              <span className="truncate">
                                {apt.patient_phone}
                              </span>
                            </a>

                            <a
                              href={`https://wa.me/91${apt.patient_phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(
                                apt.patient_name,
                              )},%20regarding%20your%20appointment%20at%20Sai%20Homoeo%20Clinic%20on%20${encodeURIComponent(
                                formatDateDisplay(apt.appointment_date),
                              )}%20at%20${encodeURIComponent(formatTime12h(apt.slot_start_time))}.`}
                              target="_blank"
                              rel="noreferrer"
                              className="h-9 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95"
                              title="WhatsApp Patient"
                            >
                              <WhatsAppIcon
                                size={14}
                                className="text-white shrink-0"
                              />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>

                        {/* Right Group: Status Toggles & Delete */}
                        <div className="flex items-center justify-end gap-1.5 pt-1 sm:pt-0 border-t border-slate-100 sm:border-t-0">
                          {!isDone && (
                            <button
                              onClick={() =>
                                handleStatusChange(apt.id, "completed")
                              }
                              className="h-8.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 flex-1 sm:flex-initial"
                              title="Mark as Completed"
                            >
                              <CheckCircle2 size={13} />
                              <span>Complete</span>
                            </button>
                          )}

                          {!isCancelled && (
                            <button
                              onClick={() =>
                                handleStatusChange(apt.id, "cancelled")
                              }
                              className="h-8.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 flex-1 sm:flex-initial"
                              title="Cancel Appointment"
                            >
                              <XCircle size={13} />
                              <span>Cancel</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(apt.id)}
                            className="h-8.5 w-8.5 rounded-xl bg-red-50 hover:bg-red-100 hover:text-red-700 hover:border-red-200 border border-red-200 text-red-500 flex items-center justify-center transition active:scale-95 shrink-0"
                            title="Delete Permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* TAB: PATIENT MEDICAL HISTORY & RECORDS */}
      {/* ========================================== */}
      {activeTab === "history" && (
        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 space-y-4 sm:space-y-6">
          {/* Header Action Banner */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full">
                <ClipboardList size={12} />
                <span>PATIENT RECORDS &amp; EMR</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                Patient Checkup History &amp; Prescriptions
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Search patients, view past clinical checkups, digital prescriptions, and attached paper Rx &amp; lab report photos.
              </p>
            </div>

            <div className="shrink-0 pt-1 md:pt-0">
              <button
                onClick={() => setIsWalkInModalOpen(true)}
                className="w-full md:w-auto px-4 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
              >
                <UserPlus size={15} />
                <span>+ Walk-In / New Checkup</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics & Search */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
              <div className="bg-slate-50/90 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[9px] sm:text-xs uppercase font-bold text-slate-500 truncate">
                  Total Patients
                </span>
                <div className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">
                  {patientsSummary.length}
                </div>
                <span className="text-[9px] sm:text-[10px] text-emerald-700 font-semibold mt-0.5 truncate">
                  Registered
                </span>
              </div>

              <div className="bg-emerald-50/60 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 flex flex-col justify-between">
                <span className="text-[9px] sm:text-xs uppercase font-bold text-emerald-800 truncate">
                  Total Records
                </span>
                <div className="text-lg sm:text-2xl font-black text-emerald-950 mt-0.5 sm:mt-1">
                  {patientsSummary.reduce((acc, p) => acc + p.visitCount, 0)}
                </div>
                <span className="text-[9px] sm:text-[10px] text-emerald-800 font-semibold mt-0.5 truncate">
                  Prescriptions
                </span>
              </div>

              <div className="bg-slate-50/90 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[9px] sm:text-xs uppercase font-bold text-slate-500 truncate">
                  Photo Scans
                </span>
                <div className="text-xs sm:text-base font-black text-slate-900 mt-0.5 sm:mt-1 flex items-center gap-1 truncate">
                  <Camera size={13} className="text-emerald-700 shrink-0" />
                  <span className="truncate">Camera</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 truncate">
                  Auto-compress
                </span>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search patient by name, mobile number, or health problem..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition font-medium"
              />
            </div>
          </div>

          {/* Patients Directory Grid */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-base font-extrabold text-slate-900">
                    Patient Records &amp; Profiles
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500">
                    {
                      patientsSummary.filter((p) => {
                        if (!historySearchQuery) return true;
                        const q = historySearchQuery.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(q) ||
                          p.phone.includes(q) ||
                          (p.latestDiagnosis && p.latestDiagnosis.toLowerCase().includes(q))
                        );
                      }).length
                    }{" "}
                    patients found
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  getAllPatientsSummary().then((s) => setPatientsSummary(s));
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Refresh Patients Directory"
              >
                <RefreshCw size={12} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Patient Cards List */}
            {patientsSummary.length === 0 ? (
              <div className="p-10 sm:p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ClipboardList size={26} />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800">
                    No patient records recorded yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Start by clicking on &quot;Checkup &amp; History&quot; on any appointment card or click &quot;+ Walk-In / New Checkup&quot; above to create the first medical record.
                  </p>
                </div>
                <button
                  onClick={() => setIsWalkInModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>Create First Patient Record</span>
                </button>
              </div>
            ) : (
              <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 bg-slate-50/50">
                {patientsSummary
                  .filter((p) => {
                    if (!historySearchQuery) return true;
                    const q = historySearchQuery.toLowerCase();
                    return (
                      p.name.toLowerCase().includes(q) ||
                      p.phone.includes(q) ||
                      (p.latestDiagnosis && p.latestDiagnosis.toLowerCase().includes(q))
                    );
                  })
                  .map((patient) => {
                    return (
                      <div
                        key={patient.phone}
                        className="rounded-2xl border-2 border-emerald-800/80 hover:border-emerald-800 transition-all p-3.5 sm:p-5 bg-white shadow-2xs hover:shadow-md flex flex-col justify-between gap-3"
                      >
                        {/* Top: Avatar & Patient Info */}
                        <div className="flex items-start gap-2.5 sm:gap-3.5">
                          {/* Avatar Circle */}
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-2xs border border-emerald-950">
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                                  {patient.name}
                                </h4>
                                {patient.age && (
                                  <span className="text-[10px] text-slate-600 font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md shrink-0">
                                    {patient.age}y
                                  </span>
                                )}
                              </div>

                              <span
                                className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 border ${
                                  patient.visitCount > 0
                                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {patient.visitCount} {patient.visitCount === 1 ? "Visit" : "Visits"}
                              </span>
                            </div>

                            {/* Phone & Contacts */}
                            <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                              <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px] sm:text-xs">
                                <Phone size={11} className="text-emerald-700 shrink-0" />
                                <span>{patient.phone}</span>
                              </span>
                              <span>•</span>
                              <span className="text-[10px] sm:text-[11px] text-slate-500">
                                Last: <strong className="text-slate-700">{formatDateDisplay(patient.lastVisit)}</strong>
                              </span>
                            </div>

                            {/* Latest Diagnosis */}
                            {patient.latestDiagnosis && (
                              <div className="pt-0.5 flex items-center gap-1.5">
                                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 shrink-0">
                                  Diagnosis:
                                </span>
                                <span className="text-[11px] sm:text-xs font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 truncate">
                                  {patient.latestDiagnosis}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions Toolbar */}
                        <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5">
                            <a
                              href={`tel:${patient.phone}`}
                              className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                              title="Call Patient"
                            >
                              <Phone size={12} className="text-emerald-700" />
                              <span className="sm:hidden">Call</span>
                            </a>
                            <a
                              href={`https://wa.me/91${patient.phone}?text=Hello%20${encodeURIComponent(
                                patient.name,
                              )},%20from%20Dr.%20S.%20K.%20Sharma%20at%20Sai%20Homoeo%20Clinic.`}
                              target="_blank"
                              rel="noreferrer"
                              className="h-8 px-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                              title="WhatsApp Patient"
                            >
                              <WhatsAppIcon size={13} className="text-[#25D366]" />
                              <span className="sm:hidden">WhatsApp</span>
                            </a>
                          </div>

                          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5">
                            <button
                              onClick={() =>
                                handleOpenPatientHistory(
                                  patient.phone,
                                  patient.name,
                                  patient.age,
                                  false,
                                )
                              }
                              className="h-8.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                            >
                              <ClipboardList size={13} className="text-emerald-700 shrink-0" />
                              <span>Checkup &amp; History</span>
                            </button>

                            <button
                              onClick={() =>
                                handleOpenPatientHistory(
                                  patient.phone,
                                  patient.name,
                                  patient.age,
                                  true,
                                )
                              }
                              className="h-8.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 shadow-2xs"
                            >
                              <Plus size={13} />
                              <span>+ New Checkup</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* TAB 2: CLINIC TIMINGS & SHIFTS */}
      {/* ========================================== */}
      {activeTab === "settings" && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Clock size={13} />
                <span>CLINIC SCHEDULE &amp; SLOTS</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Clinic Working Hours &amp; Slot Duration
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your morning and evening consultation shifts. Slot
                calculations will automatically adapt for patient bookings.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check size={16} />
                <span>
                  Clinic shifts and slot duration updated successfully!
                </span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Shift 1: Morning */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Shift 1 (Morning Consultation)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={shift1StartId}
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Opening Time (24h)
                    </label>
                    <input
                      id={shift1StartId}
                      type="time"
                      value={settings.shift1Start}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shift1Start: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">
                      e.g. 10:00 AM
                    </span>
                  </div>
                  <div>
                    <label
                      htmlFor={shift1EndId}
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Closing Time (24h)
                    </label>
                    <input
                      id={shift1EndId}
                      type="time"
                      value={settings.shift1End}
                      onChange={(e) =>
                        setSettings({ ...settings, shift1End: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">
                      e.g. 02:00 PM (14:00)
                    </span>
                  </div>
                </div>
              </div>

              {/* Shift 2: Evening */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  <span>Shift 2 (Evening Consultation)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={shift2StartId}
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Opening Time (24h)
                    </label>
                    <input
                      id={shift2StartId}
                      type="time"
                      value={settings.shift2Start}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shift2Start: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">
                      e.g. 05:00 PM (17:00)
                    </span>
                  </div>
                  <div>
                    <label
                      htmlFor={shift2EndId}
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Closing Time (24h)
                    </label>
                    <input
                      id={shift2EndId}
                      type="time"
                      value={settings.shift2End}
                      onChange={(e) =>
                        setSettings({ ...settings, shift2End: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <span className="text-[10px] text-slate-400">
                      e.g. 10:00 PM (22:00)
                    </span>
                  </div>
                </div>
              </div>

              {/* Slot Duration */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label
                  htmlFor={slotDurationId}
                  className="block text-xs font-bold text-slate-700"
                >
                  Appointment Slot Interval
                </label>
                <select
                  id={slotDurationId}
                  value={settings.slotDurationMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      slotDurationMinutes: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value={10}>10 Minutes per patient</option>
                  <option value={15}>
                    15 Minutes per patient (Recommended Default)
                  </option>
                  <option value={20}>20 Minutes per patient</option>
                  <option value={30}>30 Minutes per patient</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Changing this duration recalculates all future available slots
                  automatically on the website.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>Save Clinic Schedule</span>
              </button>
            </form>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* TAB 3: DOCTOR SECURITY & CREDENTIALS */}
      {/* ========================================== */}
      {activeTab === "security" && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <KeyRound size={13} />
                <span>PORTAL AUTHENTICATION</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Update Doctor Login Credentials
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Change the Doctor mobile number and password used to access this
                management portal. New credentials will apply immediately.
              </p>
            </div>

            {credsSaved && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check size={16} />
                <span>
                  Doctor login mobile number and password updated successfully!
                </span>
              </div>
            )}

            {credsError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{credsError}</span>
              </div>
            )}

            <form
              onSubmit={handleSaveCredentials}
              className="space-y-4 max-w-lg"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Doctor Mobile Number (10 digits)
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={newPhone}
                  onChange={(e) =>
                    setNewPhone(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-sm transition flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>Save New Credentials</span>
              </button>
            </form>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* TAB 4: SUPABASE DB CONFIG */}
      {/* ========================================== */}
      {activeTab === "database" && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-3">
                <Database size={13} />
                <span>DATABASE ARCHITECTURE</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Supabase Multi-Tenant Integration
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This system is built with a partitioned multi-tenant schema. You
                can host multiple clinics or multiple doctor websites using a
                single Supabase project.
              </p>
            </div>

            {/* Connection Status Box */}
            <div
              className={`p-4 rounded-2xl border ${
                isSupabaseConfigured
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : "bg-amber-50 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <span
                  className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? "bg-emerald-600" : "bg-amber-500"}`}
                ></span>
                <span>
                  {isSupabaseConfigured
                    ? "Supabase Connected & Active"
                    : "Local Storage Fallback Mode Active"}
                </span>
              </div>
              <p className="text-xs mt-1 text-slate-600">
                {isSupabaseConfigured
                  ? "Live bookings and schedules are actively writing to and reading from your remote Supabase PostgreSQL database."
                  : "Supabase keys are not set in .env.local yet. The app is running with an automatic local fallback so you can test slots, booking, and admin functions completely offline!"}
              </p>
            </div>

            {/* Setup Instructions */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                How to connect your Supabase project:
              </h3>

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2 overflow-x-auto">
                <div className="text-slate-400">
                  # 1. Create a file named .env.local in your project root:
                </div>
                <div>
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
                </div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900">
                  2. Run SQL Schema:
                </div>
                <p className="text-slate-600">
                  Open your Supabase Dashboard &gt; <strong>SQL Editor</strong>{" "}
                  &gt; Paste the contents of{" "}
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">
                    supabase-schema.sql
                  </code>{" "}
                  and click <strong>Run</strong>.
                </p>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  ✓ It automatically creates tables, unique 15-minute slot
                  collision constraints, RLS policies, and seed data for Sai
                  Homoeo Clinic!
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* MODAL 1: PATIENT MEDICAL HISTORY & PRESCRIPTION */}
      {/* ========================================== */}
      {isPatientModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl border-2 border-emerald-900 overflow-hidden my-0 sm:my-auto animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 shrink-0">
              {/* Mobile Drawer Notch Indicator */}
              <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto sm:hidden mb-2.5"></div>

              <div className="flex items-center justify-between gap-3">
                {/* Patient Info Header */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-700 text-white font-black flex items-center justify-center text-sm sm:text-base shrink-0 shadow-md">
                    {selectedPatient.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-black text-white truncate">
                        {selectedPatient.name}
                      </h3>
                      {selectedPatient.age && (
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                          {selectedPatient.age} yrs
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                      <span className="font-semibold text-emerald-400">
                        +91 {selectedPatient.phone}
                      </span>
                      <span>•</span>
                      <a
                        href={`tel:${selectedPatient.phone}`}
                        className="text-slate-300 hover:text-white underline font-medium text-[11px]"
                      >
                        Call
                      </a>
                      <span>•</span>
                      <a
                        href={`https://wa.me/91${selectedPatient.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#25D366] hover:text-[#20ba5a] underline font-medium text-[11px]"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsPatientModalOpen(false)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition shrink-0"
                  title="Close Window"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="bg-slate-100 p-1.5 border-b border-slate-200 flex items-center justify-center gap-2 shrink-0">
              <button
                onClick={() => setActiveRecordTab("timeline")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition ${
                  activeRecordTab === "timeline"
                    ? "bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <History size={15} />
                <span>Visit History ({selectedPatientRecords.length})</span>
              </button>

              <button
                onClick={() => setActiveRecordTab("new_record")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition ${
                  activeRecordTab === "new_record"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Plus size={15} />
                <span>+ New Checkup &amp; Rx</span>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
              {/* TAB 1: VISIT TIMELINE */}
              {activeRecordTab === "timeline" && (
                <div className="space-y-4">
                  {/* Quick Action Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Medical Records History ({selectedPatientRecords.length})
                    </span>
                    <button
                      onClick={() => setActiveRecordTab("new_record")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition active:scale-95"
                    >
                      <Plus size={13} />
                      <span>+ Add Checkup</span>
                    </button>
                  </div>

                  {loadingHistory ? (
                    <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                      Loading patient medical records...
                    </div>
                  ) : selectedPatientRecords.length === 0 ? (
                    <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                        <ClipboardList size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          No previous medical records found
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                          No past visit notes or prescriptions have been recorded yet for this patient.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveRecordTab("new_record")}
                        className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Plus size={14} />
                        <span>Write First Prescription</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedPatientRecords.map((rec) => {
                        return (
                          <div
                            key={rec.id}
                            className="bg-white rounded-2xl border-2 border-emerald-800 p-4 sm:p-5 shadow-xs space-y-3.5 transition hover:shadow-md"
                          >
                            {/* Record Header: Date & Diagnosis */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="px-2.5 py-1 rounded-lg bg-emerald-900 text-white text-xs font-black flex items-center gap-1.5">
                                  <Calendar size={13} />
                                  <span>{formatDateDisplay(rec.checkup_date)}</span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium">
                                  Dr. S. K. Sharma
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                  Diagnosis:
                                </span>
                                <span className="text-xs font-bold text-emerald-950 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                  {rec.diagnosis}
                                </span>
                              </div>
                            </div>

                            {/* Prescription Box */}
                            {rec.prescription_text && (
                              <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950">
                                    <Pill size={14} className="text-emerald-700" />
                                    <span>Prescription (Rx)</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(rec.prescription_text || "");
                                      alert("Prescription copied to clipboard!");
                                    }}
                                    className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1"
                                    title="Copy Prescription"
                                  >
                                    <Copy size={12} />
                                    <span>Copy</span>
                                  </button>
                                </div>
                                <p className="text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed font-semibold">
                                  {rec.prescription_text}
                                </p>
                              </div>
                            )}

                            {/* Prescription & Lab Scans / Photos */}
                            {rec.prescription_images && rec.prescription_images.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                  <Camera size={12} />
                                  <span>Attached Prescription Photos &amp; Lab Reports ({rec.prescription_images.length})</span>
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {rec.prescription_images.map((imgSrc, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      onClick={() => setZoomImageSrc(imgSrc)}
                                      className="group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-2xs hover:ring-2 hover:ring-emerald-600 transition"
                                    >
                                      {/* Image preview */}
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={imgSrc}
                                        alt={`Prescription ${imgIdx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                      />
                                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                                        <Maximize2 size={18} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Doctor Clinical Notes */}
                            {rec.notes && (
                              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                  Doctor Clinical Notes &amp; Observations:
                                </span>
                                <p className="whitespace-pre-line leading-relaxed">
                                  {rec.notes}
                                </p>
                              </div>
                            )}

                            {/* Follow-up Date */}
                            {rec.follow_up_date && (
                              <div className="text-xs font-bold text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 inline-flex items-center gap-1.5">
                                <RefreshCw size={12} className="text-teal-700" />
                                <span>Next Follow-up Date: {formatDateDisplay(rec.follow_up_date)}</span>
                              </div>
                            )}

                            {/* Action Buttons: WhatsApp Rx, Print Rx, Delete */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleShareWhatsAppPrescription(rec)}
                                  className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95"
                                  title="Share complete prescription to patient via WhatsApp"
                                >
                                  <WhatsAppIcon size={14} className="text-white shrink-0" />
                                  <span>WhatsApp Rx</span>
                                </button>

                                <button
                                  onClick={() => handlePrintPrescription(rec)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                                  title="Print formatted prescription slip"
                                >
                                  <Printer size={13} className="text-slate-600" />
                                  <span>Print Rx</span>
                                </button>
                              </div>

                              <button
                                onClick={() => handleDeleteRecord(rec.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                                title="Delete Record"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: WRITE NEW PRESCRIPTION FORM */}
              {activeRecordTab === "new_record" && (
                <form onSubmit={handleSaveRecord} className="space-y-4">
                  {/* Banner */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill size={16} className="text-emerald-700" />
                      <span className="text-xs font-bold">
                        New Clinical Consultation Record for {selectedPatient.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-semibold">
                      Auto-saves to database &amp; offline
                    </span>
                  </div>

                  {recordSaveError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0 text-red-600" />
                      <span>{recordSaveError}</span>
                    </div>
                  )}

                  {recordSaveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <Check size={15} className="shrink-0 text-emerald-600" />
                      <span>Checkup Record and Prescription saved successfully!</span>
                    </div>
                  )}

                  {/* Row 1: Date & Patient Age */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Checkup Date
                      </label>
                      <input
                        type="date"
                        value={newCheckupDate}
                        onChange={(e) => setNewCheckupDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Patient Age (Years)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 42"
                        value={newPatientAge}
                        onChange={(e) => setNewPatientAge(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Diagnosis & Quick Tags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chief Complaints / Diagnosis
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chronic Eczema & Skin Allergy, Left Kidney Stone, Gastric Acidity..."
                      value={newDiagnosis}
                      onChange={(e) => setNewDiagnosis(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />

                    {/* Quick Selection Tags */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap scrollbar-none mt-2">
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">Quick Select:</span>
                      {[
                        "Chronic Eczema & Allergy",
                        "Kidney Stones (Renal Calculus)",
                        "Digestive & Liver Disorder",
                        "Hair Loss & Dandruff",
                        "Arthritic & Joint Pain",
                        "Cough, Cold & Sinusitis",
                        "Acidity & GERD",
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewDiagnosis(tag)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-950 text-slate-700 text-[10px] font-semibold transition border border-slate-200 shrink-0"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prescription Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Prescription (Rx) — Homeopathic Medicines &amp; Dosages
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        (e.g. Medicine Name, Potency, Dosage, Timing)
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      placeholder="1. Graphites 200 - 4 pills morning empty stomach&#10;2. Sulphur 30 - 4 pills at bedtime alternate days&#10;3. Calendula Ointment - Apply locally twice daily"
                      value={newPrescriptionText}
                      onChange={(e) => setNewPrescriptionText(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
                    />
                  </div>

                  {/* Prescription & Lab Photo Scans (Camera / Upload) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Camera size={14} className="text-emerald-700" />
                          <span>Attach Prescription Photos or Lab Reports</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Snap photo of handwritten paper prescription, previous reports, or USG scans.
                        </p>
                      </div>

                      {/* Hidden File Inputs */}
                      <input
                        type="file"
                        ref={cameraInputRef}
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {/* Buttons */}
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                        >
                          <Camera size={14} />
                          <span>Take Photo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95"
                        >
                          <Upload size={14} />
                          <span>Upload File</span>
                        </button>
                      </div>
                    </div>

                    {isUploadingImage && (
                      <div className="text-center py-2 text-xs text-emerald-800 font-bold animate-pulse">
                        Compressing and processing photo...
                      </div>
                    )}

                    {/* Previews Grid */}
                    {newImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                        {newImages.map((imgSrc, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgSrc}
                              alt={`Attached ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Delete overlay button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(imgIdx)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition active:scale-95"
                              title="Remove photo"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Doctor Notes & Follow-up */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Clinical Notes &amp; Dietary Advice
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Avoid sour foods, drink 3 liters water, report in 2 weeks..."
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Next Recommended Follow-Up Date
                      </label>
                      <input
                        type="date"
                        value={newFollowUpDate}
                        onChange={(e) => setNewFollowUpDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Will be highlighted to patient in WhatsApp prescription.
                      </span>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveRecordTab("timeline")}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSavingRecord}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-70"
                    >
                      <Save size={15} />
                      <span>{isSavingRecord ? "Saving Medical Record..." : "Save Patient Medical Record"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: WALK-IN / DIRECT PATIENT RECORD */}
      {/* ========================================== */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 pb-8 sm:pb-6 shadow-2xl border-2 border-emerald-900 space-y-4 my-0 sm:my-auto animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Mobile notch */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden mb-1"></div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    New Patient Consultation
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Write prescription for walk-in or offline patient
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWalkInModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleStartWalkIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar Verma"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  10-Digit Mobile Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Age (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  value={walkInAge}
                  onChange={(e) => setWalkInAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-xs shadow-md transition active:scale-95"
                >
                  Continue to Prescription &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: LIGHTBOX FULLSCREEN IMAGE VIEWER */}
      {/* ========================================== */}
      {zoomImageSrc && (
        <div
          onClick={() => setZoomImageSrc(null)}
          className="fixed inset-0 z-60 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-bold text-slate-300">
                Prescription / Medical Report Full Screen Scan
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={zoomImageSrc}
                  download="sai-prescription.jpg"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 transition"
                  title="Download Image"
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setZoomImageSrc(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Zoomed Image */}
            <div className="rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl max-h-[82vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoomImageSrc}
                alt="Prescription Scan Zoomed"
                className="max-h-[80vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PRINTABLE PRESCRIPTION SLIP TEMPLATE */}
      {/* ========================================== */}
      {printableRecord && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 text-black font-serif leading-normal z-9999">
          {/* Clinic Header */}
          <div className="border-b-2 border-emerald-900 pb-4 mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-emerald-950 font-sans tracking-tight">
                SAI HOMOEO CLINIC
              </h1>
              <p className="text-xs font-semibold text-slate-700">
                Classical Homoeopathy &amp; Dispensary
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Near Ramni Kali Mandir, Baridih, Jamshedpur - 831017, Jharkhand
              </p>
              <p className="text-xs text-slate-600 font-sans font-bold">
                Phone: +91 94313 43718 / +91 98765 43210
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-base font-black text-slate-900 font-sans">
                Dr. S. K. Sharma
              </h2>
              <p className="text-xs font-semibold text-slate-700">
                B.H.M.S (Classical Homoeopathy)
              </p>
              <p className="text-[11px] text-slate-500 font-sans mt-1">
                Regd. Homoeopathic Practitioner
              </p>
            </div>
          </div>

          {/* Patient Details Row */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6 font-sans text-xs grid grid-cols-3 gap-2">
            <div>
              <span className="text-slate-500 font-medium">Patient Name:</span>
              <p className="font-bold text-slate-900 text-sm">{printableRecord.patient_name}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Age / Phone:</span>
              <p className="font-bold text-slate-900">
                {printableRecord.patient_age ? `${printableRecord.patient_age} yrs • ` : ""}
                +91 {printableRecord.patient_phone}
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium">Date:</span>
              <p className="font-bold text-slate-900 text-sm">
                {formatDateDisplay(printableRecord.checkup_date)}
              </p>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="mb-6 font-sans">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Diagnosis / Clinical Complaints:
            </span>
            <p className="text-sm font-bold text-emerald-950 mt-0.5">
              {printableRecord.diagnosis}
            </p>
          </div>

          {/* Rx Symbol & Medicines */}
          <div className="mb-8 min-h-[220px]">
            <div className="text-2xl font-black text-emerald-950 font-serif mb-2">
              &#8478;
            </div>
            <div className="pl-6 text-sm font-mono whitespace-pre-line leading-loose font-bold text-slate-900">
              {printableRecord.prescription_text || "As directed orally."}
            </div>
          </div>

          {/* Notes & Advice */}
          {printableRecord.notes && (
            <div className="mb-6 font-sans text-xs border-t border-slate-200 pt-3">
              <span className="font-bold text-slate-700">Special Instructions &amp; Diet:</span>
              <p className="text-slate-800 mt-1 whitespace-pre-line font-medium">
                {printableRecord.notes}
              </p>
            </div>
          )}

          {/* Follow-up & Signature */}
          <div className="border-t-2 border-slate-300 pt-6 mt-12 flex items-end justify-between font-sans text-xs">
            <div>
              {printableRecord.follow_up_date && (
                <p className="font-bold text-slate-900">
                  Next Follow-up Visit: {formatDateDisplay(printableRecord.follow_up_date)}
                </p>
              )}
              <p className="text-[10px] text-slate-500 mt-1">
                * Take medicines in clean mouth, 15 mins before or after meals. Avoid raw onion/garlic with doses.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <p className="font-bold text-slate-900">Doctor Signature</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
