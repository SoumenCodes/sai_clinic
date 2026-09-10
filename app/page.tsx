"use client";

import { useState, useId } from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  Star,
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
} from "lucide-react";

const CLINIC_NAME = "Sai Homoeo Clinic";
const DOCTOR_NAME = "Dr. S. K. Sharma";
const DOCTOR_DEGREE = "B.H.M.S (Classical Homoeopathy)";
const CLINIC_ADDRESS = "Near Ramni Kali Mandir, Baridih, Jamshedpur - 831017, Jharkhand";
const CLINIC_PHONE = "+91 98765 43210";
const WHATSAPP_NUMBER = "919876543210";

const DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=Sai+Homoeo+Clinic%2C+Near+Ramni+Kali+Mandir%2C+Baridih%2C+Jamshedpur%2C+Jharkhand+831017";

const SPECIALTIES = [
  {
    id: "skin",
    title: "Skin & Hair Disorders",
    category: "Chronic",
    icon: Sparkles,
    conditions: ["Psoriasis", "Eczema", "Severe Acne", "Alopecia (Hair Fall)", "Chronic Urticaria", "Fungal Infections"],
    description:
      "Root-cause internal treatment for stubborn dermatological conditions without topical steroid suppression.",
    highlight: "Non-steroid & permanent relief",
  },
  {
    id: "gastro",
    title: "Digestive & Liver Care",
    category: "Gastro",
    icon: Activity,
    conditions: ["Chronic Acidity & GERD", "Irritable Bowel Syndrome (IBS)", "Fatty Liver", "Chronic Gastritis", "Constipation", "Piles & Fissure"],
    description:
      "Natural restoration of gut motility and liver enzymes using gentle bio-chemic & mother tincture formulations.",
    highlight: "Restores natural digestion",
  },
  {
    id: "respiratory",
    title: "Respiratory & Allergies",
    category: "Allergy",
    icon: HeartPulse,
    conditions: ["Chronic Sinusitis", "Allergic Rhinitis", "Bronchial Asthma", "Recurrent Cough", "Nasal Polyps", "Dust/Pollen Allergies"],
    description:
      "Strengthens bronchial immunity so weather changes and allergens no longer trigger distressing attacks.",
    highlight: "Immunity-building therapy",
  },
  {
    id: "joints",
    title: "Joints, Arthritis & Spine",
    category: "Pain",
    icon: Stethoscope,
    conditions: ["Osteoarthritis & Knee Pain", "Sciatica Nerve Pain", "Cervical Spondylosis", "Gout (High Uric Acid)", "Rheumatoid Arthritis", "Lumbar Back Pain"],
    description:
      "Reduces joint inflammation, restores mobility, and controls uric acid levels naturally without painkiller toxicity.",
    highlight: "Pain relief without NSAIDs",
  },
  {
    id: "renal",
    title: "Kidney Stones & Urinary Care",
    category: "Renal",
    icon: Pill,
    conditions: ["Kidney Stone Dissolution", "Ureteric Calculus", "Recurrent UTIs", "Burning Micturition", "Prostate Enlargement (BPH)"],
    description:
      "Proven homoeopathic medicines like Berberis & Sarsaparilla complexes to dissolve and flush stones safely.",
    highlight: "Avoid unnecessary surgeries",
  },
  {
    id: "pediatric",
    title: "Child & Pediatric Health",
    category: "Pediatric",
    icon: Baby,
    conditions: ["Recurrent Cold & Fever", "Tonsillitis & Adenoids", "Delayed Milestones", "Teething Troubles", "Bedwetting", "Appetite Issues"],
    description:
      "Sweet pills that kids love! Safe, chemical-free treatment designed to build lifelong natural immunity.",
    highlight: "Kid-friendly & sweet pills",
  },
  {
    id: "women",
    title: "Female Healthcare",
    category: "Women",
    icon: ShieldCheck,
    conditions: ["PCOS / PCOD", "Irregular Periods", "Hormonal Imbalance", "Uterine Fibroids", "Leucorrhoea", "Menopausal Symptoms"],
    description:
      "Holistic constitutional regulation of endocrine rhythms and menstrual health without synthetic hormones.",
    highlight: "Gentle hormonal balance",
  },
  {
    id: "mind",
    title: "Migraine, Anxiety & Sleep",
    category: "Wellness",
    icon: Award,
    conditions: ["Chronic Migraine", "Tension Headaches", "Anxiety & Panic", "Sleep Disorders (Insomnia)", "Vertigo & Dizziness"],
    description:
      "Restores nervous system equilibrium and reduces neural sensitivity to stress triggers.",
    highlight: "Non-habit forming remedies",
  },
];

const TESTIMONIALS = [
  {
    name: "Rakesh Verma",
    area: "Baridih, Jamshedpur",
    condition: "Chronic Eczema (4 Years)",
    rating: 5,
    text: "I was suffering from severe skin itching and rashes on my hands for 4 years. Allopathic ointments only gave temporary relief. Within 3 months of Dr. Sharma's homoeopathic treatment, my skin is completely clear! Highly recommended.",
  },
  {
    name: "Sunita Devi",
    area: "Telco Colony, Jamshedpur",
    condition: "7.8 mm Kidney Stone",
    rating: 5,
    text: "Doctor suggested immediate surgery for my kidney stone. We visited Sai Homoeo Clinic near Kali Mandir. With the doctor's medicine, the stone passed naturally in just 6 weeks with zero pain. God bless doctor!",
  },
  {
    name: "Priya Mukherjee",
    area: "Sakchi, Jamshedpur",
    condition: "Child Recurrent Tonsillitis",
    rating: 5,
    text: "My 6-year-old son used to catch cold and severe throat pain every 15 days. Dr. Sharma's gentle sweet pills improved his immunity dramatically. He hasn't missed a school day in 6 months.",
  },
  {
    name: "Amitabh Sen",
    area: "Bistupur, Jamshedpur",
    condition: "Severe Acidity & Fatty Liver",
    rating: 5,
    text: "Very patient doctor who listens to your entire case for 20-30 minutes. The dispensary is genuine with high quality German dilutions. My digestion and liver issue is totally resolved.",
  },
];

const FAQS = [
  {
    q: "Is homoeopathic treatment slow to give results?",
    a: "No, that is a common myth! While deep chronic ailments (like eczema or arthritis of 5-10 years) require steady constitutional treatment to heal from the roots, acute issues like fever, cough, acidity, and kidney pain often show remarkable relief within hours or days.",
  },
  {
    q: "Can I take homoeopathic medicine while taking allopathic tablets for BP / Diabetes?",
    a: "Yes, absolutely! Homoeopathic remedies are 100% natural, non-reactive, and safe to take alongside your existing essential medications. We advise maintaining a simple 30-45 minute gap between doses.",
  },
  {
    q: "Are there strict dietary restrictions (like no onions or garlic)?",
    a: "Modern classical homoeopathy requires only basic discipline: avoid eating, drinking (except water), or smoking for 15-20 minutes before and after taking your dose so the oral mucosa can absorb the medicine optimally.",
  },
  {
    q: "How are the medicines dispensed at Sai Homoeo Clinic?",
    a: "We maintain an authentic in-house dispensary stocked with world-standard German Schwabe, Dr. Reckeweg, Adel, and SBL potencies. Your remedies are hygienically customized on the spot in globules or liquid drops according to your exact constitutional diagnosis.",
  },
  {
    q: "Can I book a consultation or ask for medicines via WhatsApp?",
    a: "Yes! You can request an appointment through this website or send a direct WhatsApp message. We confirm timing slots promptly and also assist returning patients with refill requests.",
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [patientData, setPatientData] = useState({
    name: "",
    phone: "",
    age: "",
    problem: "General Consultation",
    timeSlot: "Evening (5:30 PM - 9:00 PM)",
    visitType: "In-Clinic (Baridih)",
  });

  const nameInputId = useId();
  const phoneInputId = useId();
  const ageInputId = useId();
  const problemSelectId = useId();
  const slotSelectId = useId();
  const typeSelectId = useId();

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitted(true);
  };

  const handleOpenWhatsAppBooking = () => {
    const message = `Hello Sai Homoeo Clinic! I would like to book a consultation:%0A%0A👤 *Patient Name:* ${patientData.name || "Patient"}%0A📞 *Phone:* ${patientData.phone || "N/A"}%0A🎂 *Age:* ${patientData.age || "N/A"}%0A🩺 *Health Concern:* ${patientData.problem}%0A⏰ *Preferred Time:* ${patientData.timeSlot}%0A📍 *Type:* ${patientData.visitType}%0A%0APlease confirm the appointment slot.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const filteredSpecialties =
    selectedSpecialty === "all"
      ? SPECIALTIES
      : SPECIALTIES.filter((s) => s.category.toLowerCase() === selectedSpecialty.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-mobile-nav">
      {/* 1. TOP NOTIFICATION / QUICK BAR */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-900/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">Clinic Open Today:</span>
            <span className="hidden sm:inline text-emerald-200/90">10:00 AM – 1:30 PM &amp; 5:30 PM – 9:00 PM</span>
            <span className="text-emerald-300 font-medium">| Baridih, Jamshedpur</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a
              href={`tel:${CLINIC_PHONE.replace(/\s+/g, "")}`}
              className="flex items-center gap-1.5 text-emerald-300 hover:text-white transition font-medium"
            >
              <Phone size={13} className="text-emerald-400" />
              <span>{CLINIC_PHONE}</span>
            </a>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold transition"
            >
              <MapPin size={13} />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="bg-white/95 backdrop-blur-md sticky top-[33px] z-40 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
              <Sparkles size={22} className="text-amber-300" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                Sai Homoeo <span className="text-emerald-700">Clinic</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                <span>Classical Care</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-slate-500 font-normal">Baridih, Jamshedpur</span>
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <a href="#specialties" className="hover:text-emerald-700 transition">
              Specialties
            </a>
            <a href="#doctor" className="hover:text-emerald-700 transition">
              Meet Doctor
            </a>
            <a href="#dispensary" className="hover:text-emerald-700 transition">
              Dispensary
            </a>
            <a href="#testimonials" className="hover:text-emerald-700 transition">
              Patient Reviews
            </a>
            <a href="#location" className="hover:text-emerald-700 transition">
              Location &amp; Timings
            </a>
            <a href="#faq" className="hover:text-emerald-700 transition">
              FAQs
            </a>
          </nav>

          {/* Header Action CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Sai%20Homoeo%20Clinic,%20I%20want%20to%20consult%20Dr.%20Sharma.`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 font-semibold text-xs transition"
            >
              <MessageCircle size={16} className="text-emerald-600" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={() => {
                setBookingSubmitted(false);
                setBookingModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-700/25 hover:from-emerald-700 hover:to-teal-800 hover:shadow-lg transition active:scale-95"
            >
              <Calendar size={15} />
              <span>Book Consultation</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
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
                <span>Specialties &amp; Treatments</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="#doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Meet Chief Consultant</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="#dispensary"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>In-House Pharmacy</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Patient Reviews</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="#location"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Location &amp; Google Maps</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>Patient FAQs</span>
                <ChevronRight size={16} className="text-slate-400" />
              </a>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setBookingSubmitted(false);
                  setBookingModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold text-center flex items-center justify-center gap-2 shadow-md"
              >
                <Calendar size={18} />
                <span>Book Appointment Now</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${CLINIC_PHONE.replace(/\s+/g, "")}`}
                  className="py-2.5 px-3 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Phone size={14} className="text-emerald-700" />
                  <span>Call Doctor</span>
                </a>
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Navigation size={14} className="text-emerald-600" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* 3. HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-8 sm:pt-14 pb-16 sm:pb-24 border-b border-slate-200/60">
          {/* Subtle decorative medical cross & aura background */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/25 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Hero Left Content */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Trust Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-emerald-900 text-xs font-bold mb-4 shadow-2xs">
                  <Sparkles size={14} className="text-emerald-700" />
                  <span>Trusted Classical Homoeopathy in Baridih</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="text-emerald-700 font-semibold">Near Ramni Kali Mandir</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5">
                  Gentle, Natural &amp; <span className="text-gradient">Permanent Healing</span> for Your Whole Family
                </h1>

                {/* Subtitle */}
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl font-normal">
                  Classical constitutional homoeopathic care that targets the root cause—not just temporarily masking symptoms.
                  Safe, 100% natural, and side-effect free remedies prepared with genuine German &amp; Indian potencies.
                </p>

                {/* 3 Key Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-8">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">15+ Yrs Clinical Experience</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">Zero Side Effects &amp; Pure</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">In-House Pure Dispensary</span>
                  </div>
                </div>

                {/* Hero CTAs */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setBookingSubmitted(false);
                      setBookingModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/20 hover:shadow-xl transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Calendar size={18} />
                    <span>Book Clinic Visit</span>
                    <ArrowRight size={16} />
                  </button>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Dr.%20Sharma,%20I%20would%20like%20to%20consult%20regarding%20treatment.`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} className="text-emerald-600" />
                    <span>Chat on WhatsApp</span>
                  </a>
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2"
                  >
                    <Navigation size={17} className="text-emerald-700" />
                    <span>Get Directions</span>
                  </a>
                </div>

                {/* Rating Social Proof */}
                <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {["bg-emerald-600", "bg-teal-600", "bg-amber-600", "bg-indigo-600"].map((bg, idx) => (
                      <div
                        key={idx}
                        className={`w-9 h-9 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-xs`}
                      >
                        {["RV", "SD", "PM", "AS"][idx]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" />
                      ))}
                      <span className="font-extrabold text-slate-900 text-sm ml-1">4.9 / 5.0</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Over 480+ local patients treated in Jamshedpur</p>
                  </div>
                </div>
              </div>

              {/* Hero Right Visual - Doctor in Chair at Desk */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative Frame Glow */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-lg opacity-25"></div>

                  {/* Main Image Container */}
                  <div className="relative rounded-2xl overflow-hidden bg-white shadow-2xl border-4 border-white">
                    <img
                      src="/doctor-sitting-desk.jpg"
                      alt="Dr. S. K. Sharma consulting at Sai Homoeo Clinic desk"
                      className="w-full h-auto object-cover object-center transform hover:scale-102 transition duration-500"
                    />

                    {/* Gradient Overlay for bottom text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

                    {/* Bottom Caption inside Image */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600/90 text-white text-[11px] font-bold mb-1">
                        <Stethoscope size={13} />
                        <span>Chief Homoeopath</span>
                      </div>
                      <h3 className="text-lg font-extrabold leading-tight text-white">{DOCTOR_NAME}</h3>
                      <p className="text-xs text-emerald-200 font-medium">{DOCTOR_DEGREE} • Sai Homoeo Clinic</p>
                    </div>
                  </div>

                  {/* Floating Trust Badge 1 (Top Right) */}
                  <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3 animate-float hidden sm:flex">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Award size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">100% Classical</div>
                      <div className="text-[10px] text-slate-500 font-semibold">German Dilutions</div>
                    </div>
                  </div>

                  {/* Floating Trust Badge 2 (Bottom Left) */}
                  <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3 hidden sm:flex">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">98% Relief Rate</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Chronic Illnesses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. STATS & KEY PILLARS RIBBON */}
        <section className="bg-slate-900 text-white py-10 relative z-10 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">15+</div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Years Experience</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Serving Baridih &amp; Jamshedpur</p>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-1">12,000+</div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Treated Patients</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Families trust our care</p>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-teal-400 mb-1">100%</div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Safe &amp; Natural</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Zero harsh chemical side effects</p>
              </div>
              <div className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300 mb-1">German</div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Pure Pharmacy</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Schwabe &amp; Reckeweg original</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. TREATMENT SPECIALTIES SECTION */}
        <section id="specialties" className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="badge-pill bg-emerald-100 text-emerald-800 mb-3">
                <Stethoscope size={14} />
                <span>CLINICAL SPECIALTIES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Specialized Treatments for Chronic &amp; Acute Conditions
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Homoeopathy treats the patient as a whole, addressing biological predispositions and immune triggers to provide long-lasting recovery.
              </p>

              {/* Filter Pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[
                  { id: "all", label: "All Treatments" },
                  { id: "chronic", label: "Skin & Hair" },
                  { id: "gastro", label: "Digestive/Liver" },
                  { id: "allergy", label: "Respiratory" },
                  { id: "pain", label: "Joints & Spine" },
                  { id: "renal", label: "Kidney Stones" },
                  { id: "pediatric", label: "Kids Health" },
                  { id: "women", label: "Women Care" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedSpecialty(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                      selectedSpecialty === tab.id
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Specialties Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSpecialties.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-700 group-hover:text-white transition duration-300">
                        <IconComponent size={24} />
                      </div>
                      <div className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mb-2">
                        {item.highlight}
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 mb-2 leading-snug">{item.title}</h3>
                      <p className="text-xs text-slate-600 mb-4 leading-relaxed">{item.description}</p>

                      <div className="space-y-1.5 mb-6">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Treated Issues:</div>
                        {item.conditions.slice(0, 4).map((cond, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <Check size={13} className="text-emerald-600 shrink-0" />
                            <span>{cond}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setPatientData((prev) => ({ ...prev, problem: item.title }));
                        setBookingSubmitted(false);
                        setBookingModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition flex items-center justify-center gap-1.5 group-hover:bg-emerald-700 group-hover:text-white"
                    >
                      <span>Consult for {item.title.split(" ")[0]}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Banner under specialties */}
            <div className="mt-12 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl sm:text-2xl font-black">Suffering from a chronic condition not listed above?</h3>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-normal">
                  Classical homoeopathy treats the entire constitution of the patient. Book a consultation to discuss your complete health history.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setBookingSubmitted(false);
                    setBookingModalOpen(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-white text-emerald-900 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition"
                >
                  Book 30-Min Consultation
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. MEET CHIEF CONSULTANT SECTION */}
        <section id="doctor" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Doctor Portrait Image */}
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
                  {/* Verified experience badge */}
                  <div className="absolute -bottom-4 right-4 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800">
                    <Award size={20} className="text-amber-400" />
                    <div className="text-xs">
                      <div className="font-bold text-white">B.H.M.S Registered</div>
                      <div className="text-[10px] text-slate-400">Classical Practitioner</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Details & Philosophy */}
              <div className="lg:col-span-7">
                <div className="badge-pill bg-emerald-100 text-emerald-800 mb-3">
                  <User size={14} />
                  <span>CHIEF CONSULTANT &amp; HOMOEOPATH</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {DOCTOR_NAME}
                </h2>
                <p className="text-emerald-700 font-bold text-sm mb-6">
                  {DOCTOR_DEGREE} • 15+ Years Classical Homoeopathic Practice
                </p>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  "At Sai Homoeo Clinic, my goal is simple: listen to you patiently, understand what makes your symptoms unique, and prescribe pure, individualized classical remedies that restore your health permanently without lifetime drug dependency."
                </p>

                {/* Core Principles */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                      <Stethoscope size={16} className="text-emerald-600" />
                      <span>In-Depth Case Study</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      We dedicate ample time to record physical, emotional, and constitutional indicators before choosing the simillimum.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span>Root-Cause Eradication</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Zero temporary steroid suppressions. We stimulate your body’s vital force to heal internally.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                      <Pill size={16} className="text-emerald-600" />
                      <span>Original German Potencies</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Only genuine dilutions from Dr. Willmar Schwabe, Reckeweg &amp; SBL to ensure maximum therapeutic efficacy.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                      <Clock size={16} className="text-emerald-600" />
                      <span>Dedicated Follow-Up Care</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Regular tracking of symptom reduction and systematic potency adjustments until total recovery.
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setBookingSubmitted(false);
                      setBookingModalOpen(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <Calendar size={16} />
                    <span>Request Doctor Consultation</span>
                  </button>
                  <a
                    href={`tel:${CLINIC_PHONE.replace(/\s+/g, "")}`}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition flex items-center gap-2"
                  >
                    <Phone size={15} className="text-emerald-700" />
                    <span>Call Direct: {CLINIC_PHONE}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. IN-HOUSE PHARMACY & DISPENSARY SHOWCASE */}
        <section id="dispensary" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              {/* Text Left */}
              <div className="lg:col-span-6 space-y-6">
                <div className="badge-pill bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                  <Pill size={14} />
                  <span>AUTHENTIC IN-HOUSE PHARMACY</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Fully Stocked Dispensary with <span className="text-emerald-400">Pure German &amp; Indian Dilutions</span>
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  The clinical success of homoeopathy depends on the purity of the medicine. At Sai Homoeo Clinic, we maintain a complete dispensary of mother tinctures, biochemic tissue salts, and high-potency centesimal/decimal dilutions.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Genuine Brands Only</h4>
                      <p className="text-xs text-slate-400">
                        Dr. Willmar Schwabe Germany, Dr. Reckeweg, Adel, SBL, and Wheezal seal-packed stocks.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Hygienic Custom Dispensing</h4>
                      <p className="text-xs text-slate-400">
                        Medicines are prepared immediately after consultation in pure pharmaceutical-grade sugar globules or liquid drops.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Direct Availability</h4>
                      <p className="text-xs text-slate-400">
                        No running around different medical stores—receive your prescribed remedies on the spot inside the clinic.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    <Navigation size={16} />
                    <span>Visit Dispensary at Baridih</span>
                  </a>
                </div>
              </div>

              {/* Images Right - Actual Dispensary Photos */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-800">
                    <img
                      src="/sai-homoeo-clinic-baridih-jamshedpur-s377ozkvkh 4.jpg"
                      alt="Sai Homoeo Clinic Dispensary Medicines"
                      className="w-full h-52 sm:h-64 object-cover hover:scale-105 transition duration-500"
                    />
                    <div className="p-3 bg-slate-900/90 text-[11px] font-semibold text-slate-300">
                      Medicine Shelves &amp; Tinctures
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-6">
                  <div className="rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-800">
                    <img
                      src="/sai-homoeo-clinic-baridih-jamshedpur-kedsc05xw3 3.webp"
                      alt="Consultation and Dispensary Room"
                      className="w-full h-52 sm:h-64 object-cover hover:scale-105 transition duration-500"
                    />
                    <div className="p-3 bg-slate-900/90 text-[11px] font-semibold text-slate-300">
                      Dispensary Counter &amp; Consultation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. PATIENT SUCCESS STORIES / TESTIMONIALS */}
        <section id="testimonials" className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="badge-pill bg-emerald-100 text-emerald-800 mb-3">
                <Star size={14} className="text-amber-500" fill="currentColor" />
                <span>PATIENT EXPERIENCES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Real Stories of Recovery &amp; Relief
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                See what patients from Baridih, Telco, Sakchi, and across Jamshedpur have to say about their healing journeys at Sai Homoeo Clinic.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TESTIMONIALS.map((review, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div>
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="currentColor" />
                      ))}
                    </div>

                    {/* Condition Tag */}
                    <div className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-3 border border-emerald-100">
                      {review.condition}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-6 font-normal">
                      "{review.text}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{review.name}</div>
                      <div className="text-[11px] text-slate-500">{review.area}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      {review.name.charAt(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. LOCATION, TIMINGS & GOOGLE MAPS NAVIGATION */}
        <section id="location" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-stretch">
              {/* Left Address & Timing Details */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  <div className="badge-pill bg-emerald-100 text-emerald-800 mb-3">
                    <MapPin size={14} />
                    <span>FIND US IN JAMSHEDPUR</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Convenient Location &amp; Flexible Timings
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                    Located centrally in Baridih, easily accessible from Telco, Golmuri, Sakchi, and Mango.
                  </p>

                  {/* Address Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinic Address</div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">{CLINIC_NAME}</div>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">{CLINIC_ADDRESS}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          <span>Landmark:</span> Near Ramni Kali Mandir
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timings Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Clock size={16} className="text-emerald-700" />
                      <span>Consultation Hours</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Morning Shift</div>
                        <div className="font-extrabold text-slate-800 text-xs mt-0.5">10:00 AM – 1:30 PM</div>
                        <div className="text-[10px] text-slate-500">Mon to Sat</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Evening Shift</div>
                        <div className="font-extrabold text-slate-800 text-xs mt-0.5">5:30 PM – 9:00 PM</div>
                        <div className="text-[10px] text-slate-500">Mon to Sat</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg text-center">
                      Sunday Special: 10:00 AM – 1:00 PM (Prior appointment recommended)
                    </div>
                  </div>
                </div>

                {/* Direct Google Maps Action Button */}
                <div>
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2.5"
                  >
                    <Navigation size={18} />
                    <span>Open Exact Location in Google Maps</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>

              {/* Right Interactive Map Card */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="relative flex-1 min-h-[350px] sm:min-h-[420px] rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xl bg-slate-900 flex flex-col justify-between p-6 text-white">
                  {/* Decorative Map Grid Styling */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>

                  {/* Top Map header */}
                  <div className="relative z-10 flex items-center justify-between bg-slate-800/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                        📍
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Sai Homoeo Clinic</div>
                        <div className="text-[10px] text-emerald-400 font-medium">Baridih, Jamshedpur</div>
                      </div>
                    </div>
                    <a
                      href={DIRECTIONS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1"
                    >
                      <span>Directions</span>
                      <ArrowRight size={12} />
                    </a>
                  </div>

                  {/* Center Map Pin Graphic */}
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/30 animate-ping absolute inset-0"></div>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-2xl relative z-10">
                        <MapPin size={32} />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <h4 className="text-lg font-black text-white">Near Ramni Kali Mandir</h4>
                      <p className="text-xs text-slate-300 mt-0.5">Baridih Main Road, Jamshedpur - 831017</p>
                    </div>
                  </div>

                  {/* Bottom Map Shortcuts */}
                  <div className="relative z-10 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 backdrop-blur-md border border-slate-700">
                      <div className="text-[10px] text-slate-400">From Sakchi</div>
                      <div className="font-bold text-white text-xs mt-0.5">~12 Mins</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 backdrop-blur-md border border-slate-700">
                      <div className="text-[10px] text-slate-400">From Telco</div>
                      <div className="font-bold text-white text-xs mt-0.5">~8 Mins</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 backdrop-blur-md border border-slate-700">
                      <div className="text-[10px] text-slate-400">From Golmuri</div>
                      <div className="font-bold text-white text-xs mt-0.5">~6 Mins</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. FAQS SECTION */}
        <section id="faq" className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="badge-pill bg-emerald-100 text-emerald-800 mb-3">
                <ShieldCheck size={14} />
                <span>COMMON QUESTIONS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600 text-sm">
                Clear and honest guidance regarding homoeopathic consultation and medications.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-5 text-left font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-emerald-700" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-normal">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 11. CLOSING CALL TO ACTION */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <div className="badge-pill bg-emerald-800/80 text-emerald-300 border border-emerald-600/40">
              <Sparkles size={14} />
              <span>START YOUR HEALING TODAY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Experience Gentle, Root-Level Healing?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
              Book a clinic consultation at Baridih or connect directly with Dr. Sharma on WhatsApp to ask your questions before visiting.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  setBookingSubmitted(false);
                  setBookingModalOpen(true);
                }}
                className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl transition flex items-center gap-2"
              >
                <Calendar size={18} />
                <span>Book Appointment Now</span>
              </button>
              <a
                href={`tel:${CLINIC_PHONE.replace(/\s+/g, "")}`}
                className="px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition flex items-center gap-2"
              >
                <Phone size={17} className="text-emerald-400" />
                <span>Call: {CLINIC_PHONE}</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 12. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1 */}
            <div className="space-y-3 md:col-span-2">
              <div className="text-lg font-black text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  S
                </div>
                <span>Sai Homoeo Clinic</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                A dedicated classical homoeopathic clinic in Baridih, Jamshedpur led by Dr. S. K. Sharma (B.H.M.S). Providing permanent and safe treatment for chronic skin, joint, digestive, pediatric, and respiratory disorders.
              </p>
              <div className="text-[11px] text-slate-500">
                Near Ramni Kali Mandir, Baridih, Jamshedpur - 831017, Jharkhand
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Links</div>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#specialties" className="hover:text-emerald-400 transition">
                    Treatment Specialties
                  </a>
                </li>
                <li>
                  <a href="#doctor" className="hover:text-emerald-400 transition">
                    Meet Doctor
                  </a>
                </li>
                <li>
                  <a href="#dispensary" className="hover:text-emerald-400 transition">
                    In-House Pharmacy
                  </a>
                </li>
                <li>
                  <a href="#location" className="hover:text-emerald-400 transition">
                    Clinic Timings &amp; Map
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-emerald-400 transition">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-3">Contact Doctor</div>
              <div className="space-y-2.5 text-xs">
                <a
                  href={`tel:${CLINIC_PHONE.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition"
                >
                  <Phone size={14} className="text-emerald-400" />
                  <span>{CLINIC_PHONE}</span>
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition"
                >
                  <MessageCircle size={14} className="text-emerald-400" />
                  <span>WhatsApp Consultation</span>
                </a>
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition"
                >
                  <Navigation size={14} className="text-emerald-400" />
                  <span>Google Maps Route</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>&copy; {new Date().getFullYear()} Sai Homoeo Clinic, Baridih. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Classical Homoeopathy</span>
              <span>•</span>
              <span>Baridih, Jamshedpur</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 13. STICKY MOBILE BOTTOM ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-2.5 flex items-center justify-between gap-2">
        <a
          href={`tel:${CLINIC_PHONE.replace(/\s+/g, "")}`}
          className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition active:scale-95"
        >
          <Phone size={16} className="text-emerald-700" />
          <span className="text-[10px]">Call</span>
        </a>

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Dr.%20Sharma,%20I%20want%20to%20consult%20at%20Sai%20Homoeo%20Clinic.`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex flex-col items-center justify-center gap-0.5 border border-emerald-200 transition active:scale-95"
        >
          <MessageCircle size={16} className="text-emerald-600" />
          <span className="text-[10px]">WhatsApp</span>
        </a>

        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition active:scale-95"
        >
          <Navigation size={16} className="text-emerald-700" />
          <span className="text-[10px]">Map</span>
        </a>

        <button
          onClick={() => {
            setBookingSubmitted(false);
            setBookingModalOpen(true);
          }}
          className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-800/20 active:scale-95 transition"
        >
          <Calendar size={15} />
          <span>Book Visit</span>
        </button>
      </div>

      {/* 14. BOOKING APPOINTMENT MODAL */}
      {bookingModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setBookingModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {!bookingSubmitted ? (
              <>
                <div className="badge-pill bg-emerald-100 text-emerald-800 mb-2">
                  <Calendar size={13} />
                  <span>REQUEST CONSULTATION</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">Book an Appointment</h3>
                <p className="text-xs text-slate-500 mb-5">
                  Dr. S. K. Sharma • Sai Homoeo Clinic, Baridih, Jamshedpur
                </p>

                <form onSubmit={handleBookingSubmit} className="space-y-4 text-left">
                  <div>
                    <label htmlFor={nameInputId} className="block text-xs font-bold text-slate-700 mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      id={nameInputId}
                      required
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={patientData.name}
                      onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={phoneInputId} className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        id={phoneInputId}
                        required
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={patientData.phone}
                        onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50"
                      />
                    </div>
                    <div>
                      <label htmlFor={ageInputId} className="block text-xs font-bold text-slate-700 mb-1">
                        Patient Age
                      </label>
                      <input
                        id={ageInputId}
                        type="number"
                        placeholder="e.g. 35"
                        value={patientData.age}
                        onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={problemSelectId} className="block text-xs font-bold text-slate-700 mb-1">
                      Health Concern / Specialty
                    </label>
                    <select
                      id={problemSelectId}
                      value={patientData.problem}
                      onChange={(e) => setPatientData({ ...patientData, problem: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50"
                    >
                      <option>General Consultation</option>
                      <option>Skin &amp; Hair Disorders (Eczema, Psoriasis, Acne)</option>
                      <option>Kidney Stones &amp; Urinary Care</option>
                      <option>Digestive &amp; Liver (Acidity, Gastritis, Fatty Liver)</option>
                      <option>Respiratory &amp; Allergies (Asthma, Sinusitis)</option>
                      <option>Joints, Arthritis &amp; Sciatica Pain</option>
                      <option>Child &amp; Pediatric Healthcare</option>
                      <option>Female Healthcare (PCOS, Periods)</option>
                      <option>Chronic Migraine &amp; Stress</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={slotSelectId} className="block text-xs font-bold text-slate-700 mb-1">
                        Preferred Time Slot
                      </label>
                      <select
                        id={slotSelectId}
                        value={patientData.timeSlot}
                        onChange={(e) => setPatientData({ ...patientData, timeSlot: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50"
                      >
                        <option>Morning (10:00 AM – 1:30 PM)</option>
                        <option>Evening (5:30 PM – 9:00 PM)</option>
                        <option>Sunday (10:00 AM – 1:00 PM)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={typeSelectId} className="block text-xs font-bold text-slate-700 mb-1">
                        Consultation Mode
                      </label>
                      <select
                        id={typeSelectId}
                        value={patientData.visitType}
                        onChange={(e) => setPatientData({ ...patientData, visitType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50"
                      >
                        <option>In-Clinic Visit (Baridih)</option>
                        <option>Online Phone/WhatsApp Consult</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm shadow-lg shadow-emerald-800/25 transition active:scale-95"
                  >
                    Submit Booking Request
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    🔒 Your health information is kept strictly confidential.
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Request Prepared!</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Thank you, <span className="font-bold text-slate-900">{patientData.name || "Patient"}</span>. Send your details directly to Dr. Sharma's WhatsApp for instant confirmation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs space-y-1.5">
                  <div>
                    <span className="font-semibold text-slate-500">Concern:</span>{" "}
                    <span className="font-bold text-slate-900">{patientData.problem}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Slot:</span>{" "}
                    <span className="font-bold text-slate-900">{patientData.timeSlot}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Location:</span>{" "}
                    <span className="font-bold text-slate-900">Near Ramni Kali Mandir, Baridih</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleOpenWhatsAppBooking}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition"
                  >
                    <MessageCircle size={18} />
                    <span>Send Details to WhatsApp</span>
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

