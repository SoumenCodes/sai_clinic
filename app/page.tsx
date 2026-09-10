"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
import {
  Phone,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  X,
  Menu,
  Stethoscope,
  HeartPulse,
  Pill,
  Baby,
  Activity,
  ArrowRight,
  User,
  Check,
  ChevronDown,
  Navigation,
  AlertCircle,
  Lock,
} from "lucide-react";
import {
  SlotInfo,
  generateSlotsForDate,
  getBookedSlotsForDate,
  bookAppointment,
  getLocalSettings,
  formatTime12h,
} from "@/lib/booking-service";

const CLINIC_NAME = "Sai Homoeo Clinic";
const DOCTOR_NAME = "Dr. S. K. Sharma";
const DOCTOR_DEGREE = "B.H.M.S (Classical Homoeopathy)";
const CLINIC_ADDRESS = "Near Ramni Kali Mandir, Baridih, Jamshedpur - 831017, Jharkhand";
const CLINIC_PHONE = "+91 98765 43210";
const WHATSAPP_NUMBER = "919876543210";

const DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=Sai+Homoeo+Clinic%2C+Near+Ramni+Kali+Mandir%2C+Baridih%2C+Jamshedpur%2C+Jharkhand+831017";

function WhatsAppIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
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

const SHORT_SPECIALTIES = [
  {
    title: "Skin & Hair Care",
    icon: Sparkles,
    badge: "Non-Steroidal",
    conditions: "Psoriasis, Eczema, Severe Acne, Hair Fall & Alopecia",
  },
  {
    title: "Digestive & Liver",
    icon: Activity,
    badge: "Root Healing",
    conditions: "Chronic Acidity, IBS, Fatty Liver, Gastritis & Constipation",
  },
  {
    title: "Respiratory & Allergy",
    icon: HeartPulse,
    badge: "Immunity Booster",
    conditions: "Sinusitis, Asthma, Chronic Cough & Allergic Rhinitis",
  },
  {
    title: "Joints & Arthritis",
    icon: Stethoscope,
    badge: "Pain Relief",
    conditions: "Sciatica, Knee Osteoarthritis, Cervical Pain & Gout",
  },
  {
    title: "Kidney Stones",
    icon: Pill,
    badge: "Non-Surgical",
    conditions: "Natural stone dissolution & urinary tract care",
  },
  {
    title: "Child Healthcare",
    icon: Baby,
    badge: "Sweet Pills",
    conditions: "Recurrent Cold/Cough, Tonsillitis, Low Immunity & Growth",
  },
];

const FAQS = [
  {
    q: "Is homoeopathic treatment slow to show results?",
    a: "No! While chronic ailments of several years require steady constitutional care to eradicate from the root, acute problems like acidity, cough, fever, and kidney pain often show relief in hours or days.",
  },
  {
    q: "Can I take homoeopathy with my regular allopathic medicines?",
    a: "Yes, absolutely. Homoeopathic remedies are 100% natural, safe, and do not interfere with essential medications for BP, diabetes, or thyroid. We recommend keeping a 30-minute interval.",
  },
  {
    q: "Are genuine German dilutions used at the clinic?",
    a: "Yes. Sai Homoeo Clinic maintains an authentic in-house dispensary stocked with original Dr. Willmar Schwabe Germany, Reckeweg, Adel, and SBL potencies.",
  },
  {
    q: "How can I book an appointment or consult the doctor?",
    a: "You can easily select your date and 15-minute time slot using the Book button or message Dr. Sharma directly on WhatsApp for instant confirmation.",
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Slot-based booking state
  const todayDateStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Patient Info
  const [patientData, setPatientData] = useState({
    name: "",
    phone: "",
    age: "",
    problem: "General Consultation",
    visitType: "in-clinic" as "in-clinic" | "online",
  });

  const nameInputId = useId();
  const phoneInputId = useId();
  const ageInputId = useId();
  const problemSelectId = useId();
  const typeSelectId = useId();

  // Load available 15-minute slots whenever selectedDate or modal status changes
  useEffect(() => {
    async function loadDateSlots() {
      setLoadingSlots(true);
      setBookingError(null);
      try {
        const settings = getLocalSettings();
        const bookedTimes = await getBookedSlotsForDate(selectedDate);
        const generated = generateSlotsForDate(selectedDate, settings, bookedTimes);
        setSlots(generated);

        // Auto-select first available slot if previous is not available
        const firstAvailable = generated.find((s) => !s.isBooked && !s.isPassed);
        setSelectedSlot((prev) => {
          if (prev && generated.some((s) => s.startTime === prev.startTime && !s.isBooked && !s.isPassed)) {
            return prev;
          }
          return firstAvailable || null;
        });
      } catch (err) {
        console.error("Error loading slots", err);
      } finally {
        setLoadingSlots(false);
      }
    }

    if (bookingModalOpen) {
      loadDateSlots();
    }
  }, [selectedDate, bookingModalOpen]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!selectedSlot) {
      setBookingError("Please select an available 15-minute time slot.");
      return;
    }

    if (!patientData.phone || patientData.phone.trim().length < 8) {
      setBookingError("Please provide a valid mandatory phone number for appointment confirmation.");
      return;
    }

    setIsSubmitting(true);
    const res = await bookAppointment({
      patient_name: patientData.name,
      patient_phone: patientData.phone,
      patient_age: patientData.age ? parseInt(patientData.age, 10) : undefined,
      problem: patientData.problem,
      appointment_date: selectedDate,
      slot_start_time: selectedSlot.startTime,
      slot_end_time: selectedSlot.endTime,
      consultation_mode: patientData.visitType,
    });

    setIsSubmitting(false);

    if (res.success) {
      setBookingSubmitted(true);
    } else {
      setBookingError(res.error || "Failed to book slot. Please pick another available time.");
      // Refresh slots
      const settings = getLocalSettings();
      const bookedTimes = await getBookedSlotsForDate(selectedDate);
      setSlots(generateSlotsForDate(selectedDate, settings, bookedTimes));
    }
  };

  const handleOpenWhatsAppBooking = () => {
    const slotLabel = selectedSlot ? `${selectedSlot.timeLabel} (${selectedSlot.displayLabel})` : "Preferred Slot";
    const message = `Hello Sai Homoeo Clinic! I booked a 15-minute consultation:%0A%0A👤 *Patient Name:* ${patientData.name || "Patient"}%0A📞 *Phone:* ${patientData.phone || "N/A"}%0A🎂 *Age:* ${patientData.age || "N/A"}%0A🩺 *Health Concern:* ${patientData.problem}%0A📅 *Date:* ${selectedDate}%0A⏰ *Time Slot:* ${slotLabel}%0A📍 *Mode:* ${patientData.visitType === "in-clinic" ? "In-Clinic (Baridih)" : "Online Consult"}%0A%0APlease confirm my appointment.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const morningSlots = slots.filter((s) => s.shift === "morning");
  const eveningSlots = slots.filter((s) => s.shift === "evening");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-mobile-nav">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-2.5 px-4 border-b border-emerald-900/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white">Clinic Open Today:</span>
            <span className="hidden sm:inline text-emerald-200">10:00 AM – 2:00 PM &amp; 5:00 PM – 10:00 PM</span>
            <span className="text-emerald-300 font-medium">| Baridih, Jamshedpur</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a
              href={`tel:${CLINIC_PHONE.replace(/\s+/g, "")}`}
              className="flex items-center gap-1.5 text-emerald-300 hover:text-white transition font-semibold"
            >
              <Phone size={13} className="text-emerald-400" />
              <span>{CLINIC_PHONE}</span>
            </a>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold transition"
            >
              <MapPin size={13} />
              <span>Near Ramni Kali Mandir</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="bg-white/95 backdrop-blur-md sticky top-[37px] z-40 border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
              <Sparkles size={22} className="text-amber-300" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                Sai Homoeo <span className="text-emerald-700">Clinic</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                <span>Classical Homoeopathy</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-slate-500 font-normal">Baridih, Jamshedpur</span>
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#specialties" className="hover:text-emerald-700 transition">
              Treatments
            </a>
            <a href="#dispensary" className="hover:text-emerald-700 transition">
              Dispensary &amp; Medicines
            </a>
            <a href="#doctor" className="hover:text-emerald-700 transition">
              About Doctor
            </a>
            <a href="#location" className="hover:text-emerald-700 transition">
              Timings &amp; Map
            </a>
            <a href="#faq" className="hover:text-emerald-700 transition">
              FAQs
            </a>
          </nav>

          {/* Header Action Buttons (Matching Height) */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Sai%20Homoeo%20Clinic,%20I%20want%20to%20consult%20Dr.%20Sharma.`}
              target="_blank"
              rel="noreferrer"
              className="h-11 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-md shadow-emerald-900/10 transition flex items-center justify-center gap-2"
            >
              <WhatsAppIcon size={18} className="text-white" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={() => {
                setBookingSubmitted(false);
                setBookingModalOpen(true);
              }}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-bold text-xs shadow-md shadow-emerald-900/20 hover:from-emerald-800 hover:to-teal-900 transition flex items-center justify-center gap-2"
            >
              <Calendar size={16} />
              <span>Book 15-Min Slot</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-5 py-4 shadow-xl">
            <div className="flex flex-col gap-3 font-semibold text-slate-800 text-sm">
              <a
                href="#specialties"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Treatments</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="#dispensary"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Dispensary &amp; Medicines</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="#doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>About Doctor</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="#location"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Clinic Location &amp; Route</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>FAQs</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Dr.%20Sharma,%20I%20want%20to%20consult%20at%20Sai%20Homoeo%20Clinic.`}
                target="_blank"
                rel="noreferrer"
                className="h-12 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <WhatsAppIcon size={18} />
                <span>WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setBookingSubmitted(false);
                  setBookingModalOpen(true);
                }}
                className="h-12 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Calendar size={18} />
                <span>Book Slot</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* 3. HERO SECTION (SPACIOUS & DOCTOR ON TOP IN MOBILE VIEW) */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-6 sm:pt-16 pb-16 sm:pb-24 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* DOCTOR VISUAL - ON MOBILE DISPLAYED FIRST (order-1), ON DESKTOP RIGHT (lg:order-2 lg:col-span-5) */}
              <div className="order-1 lg:order-2 lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Subtle Aura Glow */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl"></div>

                  <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl border-4 border-white">
                    <img
                      src="/doctor-sitting-desk.jpg"
                      alt="Dr. S. K. Sharma consulting at Sai Homoeo Clinic desk"
                      className="w-full h-auto object-cover object-center"
                    />

                    {/* Gradient Overlay & Name Caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600/90 text-white text-[11px] font-bold mb-1">
                        <Stethoscope size={13} />
                        <span>Chief Homoeopath</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold leading-tight text-white">{DOCTOR_NAME}</h3>
                      <p className="text-xs text-emerald-200 font-medium">{DOCTOR_DEGREE} • Sai Homoeo Clinic</p>
                    </div>
                  </div>

                  {/* Trust Card Badge */}
                  <div className="mt-3 flex items-center justify-between p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        📍
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Near Ramni Kali Mandir</div>
                        <div className="text-[10px] text-slate-500">Baridih, Jamshedpur</div>
                      </div>
                    </div>
                    <a
                      href={DIRECTIONS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition"
                    >
                      Get Route
                    </a>
                  </div>
                </div>
              </div>

              {/* HERO TEXT & CTAS - ON MOBILE DISPLAYED SECOND (order-2), ON DESKTOP LEFT (lg:order-1 lg:col-span-7) */}
              <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col items-start text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-900 text-xs font-bold shadow-2xs">
                  <Sparkles size={14} className="text-emerald-700" />
                  <span>Classical &amp; Modern Homoeopathy</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.14]">
                  Gentle, Natural &amp; <span className="text-gradient">Permanent Healing</span> for Your Whole Family
                </h1>

                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                  Personalized classical homoeopathic care that targets the root cause of chronic illnesses without side effects. Authentic German dilutions and hygienic in-house dispensing.
                </p>

                {/* 3 Quick Bullets */}
                <div className="space-y-2 text-sm text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Detailed Constitutional Consultation &amp; 15-Minute Dedicated Slots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Safe for All Ages (Infants, Adults &amp; Elderly) with Zero Side Effects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Original German Schwabe &amp; Reckeweg Formulations</span>
                  </div>
                </div>

                {/* CTA BUTTONS: EQUAL HEIGHT & BALANCED WIDTH WITH REAL WHATSAPP LOGO */}
                <div className="w-full pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => {
                      setBookingSubmitted(false);
                      setBookingModalOpen(true);
                    }}
                    className="h-13 sm:h-14 flex-1 sm:flex-initial sm:min-w-[200px] px-6 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/20 hover:shadow-xl transition flex items-center justify-center gap-2.5 active:scale-95"
                  >
                    <Calendar size={18} />
                    <span>Book 15-Min Slot</span>
                  </button>

                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Dr.%20Sharma,%20I%20would%20like%20to%20consult%20regarding%20treatment.`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-13 sm:h-14 flex-1 sm:flex-initial sm:min-w-[200px] px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm shadow-lg shadow-green-900/15 hover:shadow-xl transition flex items-center justify-center gap-2.5 active:scale-95"
                  >
                    <WhatsAppIcon size={20} className="text-white" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SHORT & SPACIOUS TREATMENT SPECIALTIES */}
        <section id="specialties" className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="badge-pill bg-emerald-100 text-emerald-800 mb-3">
                <Stethoscope size={14} />
                <span>SPECIALIZED TREATMENTS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                Conditions We Treat
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Classical homoeopathy effectively cures both chronic and acute conditions by stimulating your body's self-healing mechanisms.
              </p>
            </div>

            {/* Clean, Compact 6-Card Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SHORT_SPECIALTIES.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={index}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <IconComponent size={20} />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.conditions}</p>
                    </div>

                    <button
                      onClick={() => {
                        setPatientData((prev) => ({ ...prev, problem: item.title }));
                        setBookingSubmitted(false);
                        setBookingModalOpen(true);
                      }}
                      className="w-full py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition flex items-center justify-center gap-1"
                    >
                      <span>Consult for {item.title.split(" ")[0]}</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. IN-HOUSE DISPENSARY & MEDICINE SHELVES (RIGHT AFTER TREATMENTS) */}
        <section id="dispensary" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              {/* Left Details */}
              <div className="lg:col-span-6 space-y-6">
                <div className="badge-pill bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                  <Pill size={14} />
                  <span>IN-HOUSE DISPENSARY</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Medicine Shelves &amp; Tinctures: <span className="text-emerald-400">Pure German Formulations</span>
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  We maintain a fully stocked dispensary of genuine mother tinctures, biochemic tissue salts, and high-potency dilutions to ensure immediate availability and 100% purity.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Genuine Seal-Packed Brands</h4>
                      <p className="text-xs text-slate-400">Dr. Willmar Schwabe Germany, Reckeweg, Adel &amp; SBL World Class.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Customized On-Spot Dispensing</h4>
                      <p className="text-xs text-slate-400">Remedies hygienically prepared in pure sugar globules or liquid drops.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Direct Availability at Clinic</h4>
                      <p className="text-xs text-slate-400">No outside running—receive your complete prescription immediately.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
                  >
                    <Navigation size={15} />
                    <span>Visit Dispensary at Baridih</span>
                  </a>
                </div>
              </div>

              {/* Right Actual Dispensary Photos */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-800">
                  <img
                    src="/sai-homoeo-clinic-baridih-jamshedpur-s377ozkvkh 4.jpg"
                    alt="Sai Homoeo Clinic Dispensary Medicines"
                    className="w-full h-52 sm:h-64 object-cover"
                  />
                  <div className="p-3 bg-slate-900/90 text-[11px] font-semibold text-slate-300">
                    Dispensary Medicine Inventory
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-800">
                  <img
                    src="/sai-homoeo-clinic-baridih-jamshedpur-kedsc05xw3 3.webp"
                    alt="Consultation and Dispensary Room"
                    className="w-full h-52 sm:h-64 object-cover"
                  />
                  <div className="p-3 bg-slate-900/90 text-[11px] font-semibold text-slate-300">
                    Dispensary Counter &amp; Consultation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. MEET CHIEF CONSULTANT */}
        <section id="doctor" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              {/* Doctor Portrait */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-sm lg:max-w-none">
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 bg-emerald-900 relative">
                    <img
                      src="/doctor-portrait.jpg"
                      alt="Dr. S. K. Sharma Classical Homoeopath"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="text-sm font-bold text-emerald-300">Sai Homoeo Clinic • Baridih</div>
                      <div className="text-lg font-black">{DOCTOR_NAME}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio & Approach */}
              <div className="lg:col-span-7 space-y-5">
                <div className="badge-pill bg-emerald-100 text-emerald-800">
                  <User size={14} />
                  <span>CHIEF CONSULTANT</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {DOCTOR_NAME}
                </h2>
                <p className="text-emerald-700 font-bold text-sm">
                  {DOCTOR_DEGREE} • Classical Homoeopathic Practitioner
                </p>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  "Every patient is unique. At Sai Homoeo Clinic, we take the time to understand your complete case history to prescribe the precise constitutional simillimum that brings permanent healing."
                </p>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>Individualized Case Study</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Dedicated 15-minute slot for constitutional evaluation.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>Zero Side Effects</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Pure natural dilutions with no chemical toxicity.</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setBookingSubmitted(false);
                      setBookingModalOpen(true);
                    }}
                    className="h-12 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <Calendar size={15} />
                    <span>Request 15-Min Slot</span>
                  </button>
                  <a
                    href={`tel:${CLINIC_PHONE.replace(/\s+/g, "")}`}
                    className="h-12 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition flex items-center gap-2"
                  >
                    <Phone size={15} className="text-emerald-700" />
                    <span>Call: {CLINIC_PHONE}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CLINIC LOCATION, TIMINGS & GOOGLE MAPS */}
        <section id="location" className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Address */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="badge-pill bg-emerald-100 text-emerald-800 mb-3">
                    <MapPin size={14} />
                    <span>CLINIC LOCATION &amp; TIMINGS</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Easy to Reach in Baridih
                  </h2>

                  {/* Address Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 mb-4 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Address</div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">{CLINIC_NAME}</div>
                        <p className="text-xs text-slate-600 mt-1">{CLINIC_ADDRESS}</p>
                        <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          <span>Landmark:</span> Near Ramni Kali Mandir
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timings */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Clock size={16} className="text-emerald-700" />
                      <span>Consultation Hours (15-Min Slots)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400">Shift 1 (Morning)</div>
                        <div className="font-extrabold text-slate-800 text-xs mt-0.5">10:00 AM – 2:00 PM</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400">Shift 2 (Evening)</div>
                        <div className="font-extrabold text-slate-800 text-xs mt-0.5">5:00 PM – 10:00 PM</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg text-center">
                      Sunday: 10:00 AM – 1:00 PM (Prior slot booking recommended)
                    </div>
                  </div>
                </div>

                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-13 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <Navigation size={18} />
                  <span>Open Exact Route on Google Maps App</span>
                </a>
              </div>

              {/* Right Map Pin Card */}
              <div className="lg:col-span-6 flex flex-col justify-center items-center min-h-[300px] rounded-3xl bg-slate-900 p-8 text-white text-center relative overflow-hidden shadow-xl border border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30">
                  <MapPin size={32} />
                </div>
                <h3 className="text-xl font-black text-white">{CLINIC_NAME}</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">
                  Near Ramni Kali Mandir, Baridih Main Road, Jamshedpur - 831017
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    From Sakchi ~12 Mins
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    From Telco ~8 Mins
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FAQS */}
        <section id="faq" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="badge-pill bg-emerald-100 text-emerald-800 mb-2">
                <ShieldCheck size={14} />
                <span>FREQUENT QUESTIONS</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient FAQs</h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-4 sm:p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100/80 transition"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={17}
                        className={`text-slate-400 shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-emerald-700" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-white text-sm">Sai Homoeo Clinic</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Near Ramni Kali Mandir, Baridih, Jamshedpur - 831017, Jharkhand
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>&copy; {new Date().getFullYear()} Sai Homoeo Clinic.</span>
            <span>•</span>
            <Link href="/admin" className="hover:text-emerald-400 font-semibold flex items-center gap-1">
              <Lock size={12} />
              <span>Doctor Admin</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* 10. STICKY MOBILE BOTTOM ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-2.5 flex items-center justify-between gap-2">
        <a
          href={`tel:${CLINIC_PHONE.replace(/\s+/g, "")}`}
          className="flex-1 h-12 rounded-xl bg-slate-100 text-slate-900 font-bold text-xs flex flex-col items-center justify-center gap-0.5"
        >
          <Phone size={16} className="text-emerald-700" />
          <span className="text-[10px]">Call</span>
        </a>

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Dr.%20Sharma,%20I%20want%20to%20consult%20at%20Sai%20Homoeo%20Clinic.`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 h-12 rounded-xl bg-[#25D366] text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-xs"
        >
          <WhatsAppIcon size={16} className="text-white" />
          <span className="text-[10px]">WhatsApp</span>
        </a>

        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className="flex-1 h-12 rounded-xl bg-slate-100 text-slate-900 font-bold text-xs flex flex-col items-center justify-center gap-0.5"
        >
          <Navigation size={16} className="text-emerald-700" />
          <span className="text-[10px]">Map</span>
        </a>

        <button
          onClick={() => {
            setBookingSubmitted(false);
            setBookingModalOpen(true);
          }}
          className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
        >
          <Calendar size={15} />
          <span>Book Slot</span>
        </button>
      </div>

      {/* 11. DYNAMIC 15-MINUTE SLOT BOOKING MODAL */}
      {bookingModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBookingModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 relative my-6 max-h-[92vh] flex flex-col">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {!bookingSubmitted ? (
              <div className="overflow-y-auto pr-1 space-y-4 text-left">
                <div>
                  <div className="badge-pill bg-emerald-100 text-emerald-800 mb-1.5">
                    <Clock size={13} />
                    <span>15-MINUTE SLOT BOOKING</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">Choose Date &amp; Available Slot</h3>
                  <p className="text-xs text-slate-500">
                    Dr. S. K. Sharma • Shift 1: 10AM-2PM | Shift 2: 5PM-10PM
                  </p>
                </div>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* STEP 1: SELECT DATE */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                      <span>1. Select Appointment Date *</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">{selectedDate}</span>
                    </label>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(todayDateStr)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center transition ${
                          selectedDate === todayDateStr
                            ? "bg-emerald-700 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
                          setSelectedDate(tomorrow);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center transition ${
                          selectedDate === new Date(Date.now() + 86400000).toISOString().split("T")[0]
                            ? "bg-emerald-700 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        Tomorrow
                      </button>
                      <div className="relative">
                        <input
                          type="date"
                          min={todayDateStr}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full py-1.5 px-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 text-slate-800 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: SELECT 15-MINUTE SLOT */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>2. Select 15-Minute Slot *</span>
                      {selectedSlot && (
                        <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Selected: {selectedSlot.displayLabel}
                        </span>
                      )}
                    </label>

                    {loadingSlots ? (
                      <div className="py-6 text-center text-xs text-slate-400">Loading live availability...</div>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                        {/* Morning Shift Slots */}
                        {morningSlots.length > 0 && (
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              <span>Morning Shift (10:00 AM – 02:00 PM)</span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                              {morningSlots.map((slot, idx) => {
                                const isSelected = selectedSlot?.startTime === slot.startTime;
                                const isUnavailable = slot.isBooked || slot.isPassed;

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    disabled={isUnavailable}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-2 px-1.5 rounded-xl text-xs font-extrabold transition flex flex-col items-center justify-center ${
                                      isSelected
                                        ? "bg-emerald-700 text-white shadow-md scale-98"
                                        : isUnavailable
                                        ? "bg-slate-200/70 text-slate-400 cursor-not-allowed line-through"
                                        : "bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200 hover:border-emerald-300"
                                    }`}
                                  >
                                    <span>{slot.timeLabel}</span>
                                    <span className="text-[9px] font-normal opacity-80">
                                      {slot.isBooked ? "Booked" : slot.isPassed ? "Passed" : "Available"}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Evening Shift Slots */}
                        {eveningSlots.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/80">
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                              <span>Evening Shift (05:00 PM – 10:00 PM)</span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                              {eveningSlots.map((slot, idx) => {
                                const isSelected = selectedSlot?.startTime === slot.startTime;
                                const isUnavailable = slot.isBooked || slot.isPassed;

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    disabled={isUnavailable}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-2 px-1.5 rounded-xl text-xs font-extrabold transition flex flex-col items-center justify-center ${
                                      isSelected
                                        ? "bg-emerald-700 text-white shadow-md scale-98"
                                        : isUnavailable
                                        ? "bg-slate-200/70 text-slate-400 cursor-not-allowed line-through"
                                        : "bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200 hover:border-emerald-300"
                                    }`}
                                  >
                                    <span>{slot.timeLabel}</span>
                                    <span className="text-[9px] font-normal opacity-80">
                                      {slot.isBooked ? "Booked" : slot.isPassed ? "Passed" : "Available"}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* STEP 3: PATIENT MANDATORY DETAILS */}
                  <div className="space-y-3 pt-1 border-t border-slate-100">
                    <div>
                      <label htmlFor={nameInputId} className="block text-xs font-bold text-slate-800 mb-1">
                        Patient Full Name *
                      </label>
                      <input
                        id={nameInputId}
                        required
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={patientData.name}
                        onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={phoneInputId} className="block text-xs font-bold text-slate-800 mb-1">
                          Phone Number (Mandatory) *
                        </label>
                        <input
                          id={phoneInputId}
                          required
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={patientData.phone}
                          onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label htmlFor={ageInputId} className="block text-xs font-bold text-slate-800 mb-1">
                          Patient Age
                        </label>
                        <input
                          id={ageInputId}
                          type="number"
                          placeholder="e.g. 35"
                          value={patientData.age}
                          onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={problemSelectId} className="block text-xs font-bold text-slate-800 mb-1">
                          Health Concern
                        </label>
                        <select
                          id={problemSelectId}
                          value={patientData.problem}
                          onChange={(e) => setPatientData({ ...patientData, problem: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-medium"
                        >
                          <option>General Consultation</option>
                          <option>Skin &amp; Hair Care</option>
                          <option>Digestive &amp; Liver Care</option>
                          <option>Respiratory &amp; Allergies</option>
                          <option>Joints &amp; Arthritis Pain</option>
                          <option>Kidney Stones</option>
                          <option>Child &amp; Pediatric Care</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor={typeSelectId} className="block text-xs font-bold text-slate-800 mb-1">
                          Mode
                        </label>
                        <select
                          id={typeSelectId}
                          value={patientData.visitType}
                          onChange={(e) => setPatientData({ ...patientData, visitType: e.target.value as "in-clinic" | "online" })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 font-medium"
                        >
                          <option value="in-clinic">In-Clinic Visit (Baridih)</option>
                          <option value="online">Online WhatsApp Consult</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedSlot}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Calendar size={16} />
                    <span>{isSubmitting ? "Reserving Slot..." : "Confirm & Book 15-Min Slot"}</span>
                  </button>
                </form>
              </div>
            ) : (
              /* BOOKING CONFIRMATION SCREEN */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">15-Min Slot Confirmed!</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Thank you, <span className="font-bold text-slate-900">{patientData.name}</span>. Your 15-minute consultation slot is booked.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Date:</span>
                    <span className="font-extrabold text-slate-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Reserved Slot:</span>
                    <span className="font-black text-emerald-800">{selectedSlot?.displayLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Phone:</span>
                    <span className="font-bold text-slate-900">{patientData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Concern:</span>
                    <span className="font-bold text-slate-900">{patientData.problem}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-500">Clinic:</span>
                    <span className="font-bold text-slate-900">Sai Homoeo Clinic, Baridih</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleOpenWhatsAppBooking}
                    className="w-full h-13 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <WhatsAppIcon size={20} className="text-white" />
                    <span>Send Details to Dr. Sharma on WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setBookingModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


