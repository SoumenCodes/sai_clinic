import { supabase, isSupabaseConfigured } from "./supabase";

export const DEFAULT_CLINIC_SLUG = "sai-homoeo-baridih";

export interface Appointment {
  id: string;
  clinic_id?: string;
  patient_name: string;
  patient_phone: string; // Mandatory
  patient_age?: number;
  problem: string;
  appointment_date: string; // YYYY-MM-DD
  slot_start_time: string; // HH:MM (24h e.g. "10:00")
  slot_end_time: string; // HH:MM (24h e.g. "10:15")
  status: "confirmed" | "completed" | "cancelled";
  consultation_mode: "in-clinic" | "online";
  notes?: string;
  created_at: string;
}

export interface PatientRecord {
  id: string;
  clinic_id?: string;
  patient_phone: string; // Mandatory link
  patient_name: string;
  patient_age?: number;
  checkup_date: string; // YYYY-MM-DD
  diagnosis: string;
  prescription_text?: string;
  prescription_images?: string[]; // Array of base64 data URIs or image URLs
  notes?: string;
  follow_up_date?: string; // YYYY-MM-DD
  created_at: string;
}

export interface PatientSummary {
  phone: string;
  name: string;
  age?: number;
  visitCount: number;
  lastVisit: string;
  latestDiagnosis?: string;
  latestPrescription?: string;
}

export interface SlotInfo {
  startTime: string; // "10:00"
  endTime: string; // "10:15"
  displayLabel: string; // "10:00 AM - 10:15 AM"
  timeLabel: string; // "10:00 AM"
  isBooked: boolean;
  isPassed: boolean;
  shift: "morning" | "evening";
}

export interface ClinicScheduleSettings {
  slotDurationMinutes: number; // default 15
  shift1Start: string; // "10:00"
  shift1End: string; // "14:00"
  shift2Start: string; // "17:00"
  shift2End: string; // "22:00"
  sundayShift1Start: string; // "10:00"
  sundayShift1End: string; // "13:00"
  isSundayClosed: boolean;
}

const DEFAULT_SETTINGS: ClinicScheduleSettings = {
  slotDurationMinutes: 15,
  shift1Start: "10:00",
  shift1End: "14:00",
  shift2Start: "17:00",
  shift2End: "22:00",
  sundayShift1Start: "10:00",
  sundayShift1End: "13:00",
  isSundayClosed: false,
};

// Local storage key names for fallback / demo mode
const LOCAL_STORAGE_APPOINTMENTS_KEY = "sai_clinic_appointments_db";
const LOCAL_STORAGE_SETTINGS_KEY = "sai_clinic_settings_db";

// Helper: Format 24h "HH:MM" to "hh:mm AM/PM"
export function formatTime12h(time24: string): string {
  if (!time24) return "";
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12; // 0 becomes 12
  return `${hour.toString().padStart(2, "0")}:${minute} ${ampm}`;
}

// Helper: Add minutes to "HH:MM"
export function addMinutesToTime(time24: string, minutesToAdd: number): string {
  const [hourStr, minuteStr] = time24.split(":");
  let totalMinutes = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10) + minutesToAdd;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

// Helper: Get local YYYY-MM-DD string according to local timezone
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper: Get tomorrow's local YYYY-MM-DD string
export function getTomorrowDateString(d: Date = new Date()): string {
  const tomorrow = new Date(d);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalDateString(tomorrow);
}

// Helper: Format "YYYY-MM-DD" to "10 Sep 2026"
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = months[monthIndex] || "";
    return `${day} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

// Helper: Format "YYYY-MM-DD" to "Thu, 10 Sep 2026"
export function formatDateWithDay(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, monthIndex, day);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayName = days[d.getDay()] || "";
    const monthName = months[monthIndex] || "";
    return `${dayName}, ${day} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

// Helper: Convert "HH:MM" to minutes from midnight
function timeToMinutes(time24: string): number {
  const [h, m] = time24.split(":").map((v) => parseInt(v, 10));
  return h * 60 + (m || 0);
}

// Initial demo mock appointments for seamless testing
function getInitialMockAppointments(): Appointment[] {
  const today = getLocalDateString();
  const tomorrow = getTomorrowDateString();

  return [
    {
      id: "demo-1",
      patient_name: "Ramesh Sharma",
      patient_phone: "9876543210",
      patient_age: 42,
      problem: "Skin & Hair Care",
      appointment_date: today,
      slot_start_time: "10:30",
      slot_end_time: "10:45",
      status: "confirmed",
      consultation_mode: "in-clinic",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-2",
      patient_name: "Sunita Devi",
      patient_phone: "9835123456",
      patient_age: 38,
      problem: "Kidney Stones",
      appointment_date: today,
      slot_start_time: "18:00",
      slot_end_time: "18:15",
      status: "confirmed",
      consultation_mode: "in-clinic",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-3",
      patient_name: "Amitabh Sen",
      patient_phone: "9431109876",
      patient_age: 50,
      problem: "Digestive & Liver Care",
      appointment_date: tomorrow,
      slot_start_time: "11:00",
      slot_end_time: "11:15",
      status: "confirmed",
      consultation_mode: "in-clinic",
      created_at: new Date().toISOString(),
    },
  ];
}

// Local Storage Helpers
function getLocalAppointments(): Appointment[] {
  if (typeof window === "undefined") return getInitialMockAppointments();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_APPOINTMENTS_KEY);
    if (!raw) {
      const initial = getInitialMockAppointments();
      localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialMockAppointments();
  }
}

function saveLocalAppointments(appointments: Appointment[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.error("Failed to save appointments in local storage", e);
  }
}

export function getLocalSettings(): ClinicScheduleSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveLocalSettings(settings: ClinicScheduleSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings in local storage", e);
  }
}

// Core Function: Generate all 15-min slots for a given date and settings
export function generateSlotsForDate(
  dateStr: string,
  settings: ClinicScheduleSettings = DEFAULT_SETTINGS,
  bookedSlotStartTimes: string[] = []
): SlotInfo[] {
  const selectedDate = new Date(dateStr + "T00:00:00");
  const isSunday = selectedDate.getDay() === 0;
  const slotDuration = settings.slotDurationMinutes || 15;

  const now = new Date();
  const isToday = dateStr === getLocalDateString(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: SlotInfo[] = [];

  const addShiftSlots = (startStr: string, endStr: string, shift: "morning" | "evening") => {
    if (!startStr || !endStr) return;
    const startMin = timeToMinutes(startStr);
    const endMin = timeToMinutes(endStr);

    for (let m = startMin; m < endMin; m += slotDuration) {
      const slotStart = `${Math.floor(m / 60).toString().padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
      const nextM = m + slotDuration;
      const slotEnd = `${Math.floor(nextM / 60).toString().padStart(2, "0")}:${(nextM % 60).toString().padStart(2, "0")}`;

      const isBooked = bookedSlotStartTimes.includes(slotStart);
      const isPassed = isToday && m < currentMinutes;

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        displayLabel: `${formatTime12h(slotStart)} - ${formatTime12h(slotEnd)}`,
        timeLabel: formatTime12h(slotStart),
        isBooked,
        isPassed,
        shift,
      });
    }
  };

  if (isSunday) {
    if (!settings.isSundayClosed && settings.sundayShift1Start && settings.sundayShift1End) {
      addShiftSlots(settings.sundayShift1Start, settings.sundayShift1End, "morning");
    }
  } else {
    // Weekday / Saturday
    // Shift 1 (Morning: 10AM - 2PM)
    addShiftSlots(settings.shift1Start, settings.shift1End, "morning");
    // Shift 2 (Evening: 5PM - 10PM)
    addShiftSlots(settings.shift2Start, settings.shift2End, "evening");
  }

  return slots;
}

// In-memory cache for booked slots (speeds up date switching to 0ms)
const bookedSlotsCache = new Map<string, { times: string[]; expiresAt: number }>();
const DEFAULT_CLINIC_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

// Fetch Booked Slots for a Date (Supabase with Local Fallback + Instant Cache)
export async function getBookedSlotsForDate(
  dateStr: string,
  clinicSlug: string = DEFAULT_CLINIC_SLUG,
  forceRefresh: boolean = false
): Promise<string[]> {
  const cached = bookedSlotsCache.get(dateStr);
  if (!forceRefresh && cached && Date.now() < cached.expiresAt) {
    return cached.times;
  }

  let booked: string[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("slot_start_time, status")
        .eq("appointment_date", dateStr)
        .in("status", ["confirmed", "pending"]);

      if (!error && data) {
        booked = data.map((item) => {
          // Normalize "10:15:00" to "10:15"
          const time = item.slot_start_time;
          return time.length === 8 ? time.substring(0, 5) : time;
        });
      }
    } catch (err) {
      console.warn("Supabase query failed, using local storage fallback", err);
    }
  }

  // Fallback: Local Storage
  if (booked.length === 0) {
    const all = getLocalAppointments();
    booked = all
      .filter((a) => a.appointment_date === dateStr && a.status !== "cancelled")
      .map((a) => (a.slot_start_time.length === 8 ? a.slot_start_time.substring(0, 5) : a.slot_start_time));
  }

  // Cache for 10 seconds for ultra-responsive UI
  bookedSlotsCache.set(dateStr, { times: booked, expiresAt: Date.now() + 10000 });
  return booked;
}

// Book a New Appointment (Collision Checked & Validated)
export async function bookAppointment(params: {
  clinicSlug?: string;
  patient_name: string;
  patient_phone: string; // MANDATORY
  patient_age?: number;
  problem: string;
  appointment_date: string;
  slot_start_time: string; // "10:15"
  slot_end_time?: string;
  consultation_mode?: "in-clinic" | "online";
  notes?: string;
}): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const {
    patient_name,
    patient_phone,
    patient_age,
    problem,
    appointment_date,
    slot_start_time,
    consultation_mode = "in-clinic",
    notes,
  } = params;

  // Validation
  if (!patient_name || !patient_name.trim()) {
    return { success: false, error: "Patient name is required." };
  }
  if (!patient_phone || patient_phone.trim().length < 8) {
    return { success: false, error: "A valid phone number is mandatory for booking." };
  }
  if (!appointment_date || !slot_start_time) {
    return { success: false, error: "Please select a date and an available 15-minute slot." };
  }

  const slot_end_time = params.slot_end_time || addMinutesToTime(slot_start_time, 15);

  // Check collision with force refresh
  const booked = await getBookedSlotsForDate(appointment_date, DEFAULT_CLINIC_SLUG, true);
  const normalizedStart = slot_start_time.length === 8 ? slot_start_time.substring(0, 5) : slot_start_time;
  if (booked.includes(normalizedStart)) {
    return {
      success: false,
      error: `Sorry, slot ${formatTime12h(normalizedStart)} has just been booked. Please pick another available time.`,
    };
  }

  const newAppointment: Appointment = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `apt-${Date.now()}`,
    patient_name: patient_name.trim(),
    patient_phone: patient_phone.trim(),
    patient_age: patient_age ? Number(patient_age) : undefined,
    problem: problem || "General Consultation",
    appointment_date,
    slot_start_time: normalizedStart,
    slot_end_time,
    status: "confirmed",
    consultation_mode,
    notes,
    created_at: new Date().toISOString(),
  };

  // Try Supabase first (using direct UUID for blazing speed)
  if (isSupabaseConfigured && supabase) {
    try {
      const clinicId = DEFAULT_CLINIC_UUID;

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          clinic_id: clinicId,
          patient_name: newAppointment.patient_name,
          patient_phone: newAppointment.patient_phone,
          patient_age: newAppointment.patient_age,
          problem: newAppointment.problem,
          appointment_date: newAppointment.appointment_date,
          slot_start_time: `${newAppointment.slot_start_time}:00`,
          slot_end_time: `${newAppointment.slot_end_time}:00`,
          status: "confirmed",
          consultation_mode: newAppointment.consultation_mode,
          notes: newAppointment.notes,
        })
        .select()
        .single();

      if (!error && data) {
        newAppointment.id = data.id;
      }
    } catch (err) {
      console.warn("Supabase insert failed, persisting to local storage", err);
    }
  }

  // Invalidate slot cache for this date
  bookedSlotsCache.delete(appointment_date);

  // Always keep local storage in sync
  const all = getLocalAppointments();
  all.push(newAppointment);
  saveLocalAppointments(all);

  return { success: true, appointment: newAppointment };
}

// Get All Appointments for Admin with optional Date Filter
export async function getAdminAppointments(
  dateFilter?: string,
  clinicSlug: string = DEFAULT_CLINIC_SLUG
): Promise<Appointment[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true })
        .order("slot_start_time", { ascending: true });

      if (dateFilter) {
        query = query.eq("appointment_date", dateFilter);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map((item) => ({
          ...item,
          slot_start_time: item.slot_start_time.length === 8 ? item.slot_start_time.substring(0, 5) : item.slot_start_time,
          slot_end_time: item.slot_end_time.length === 8 ? item.slot_end_time.substring(0, 5) : item.slot_end_time,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch appointments failed, using local storage", err);
    }
  }

  const all = getLocalAppointments();
  if (dateFilter) {
    return all.filter((a) => a.appointment_date === dateFilter);
  }
  return all.sort((a, b) => {
    if (a.appointment_date === b.appointment_date) {
      return a.slot_start_time.localeCompare(b.slot_start_time);
    }
    return a.appointment_date.localeCompare(b.appointment_date);
  });
}

// Update Appointment Status (Confirmed, Completed, Cancelled)
export async function updateAppointmentStatus(
  id: string,
  newStatus: "confirmed" | "completed" | "cancelled"
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
    } catch (e) {
      console.warn("Supabase status update failed", e);
    }
  }

  const all = getLocalAppointments();
  const updated = all.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
  saveLocalAppointments(updated);
  return true;
}

// Delete / Cancel Appointment Permanently
export async function deleteAppointment(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("appointments").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete failed", e);
    }
  }

  const all = getLocalAppointments();
  const filtered = all.filter((item) => item.id !== id);
  saveLocalAppointments(filtered);
  return true;
}

// ==============================================================================
// PATIENT MEDICAL HISTORY & PRESCRIPTION ENGINE
// ==============================================================================

export const LOCAL_STORAGE_RECORDS_KEY = "sai_clinic_patient_records_db";

// Helper: Client-side image compression for mobile camera captures & uploads
export async function compressImageFile(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Initial Mock Patient Records for Seamless Testing
function getInitialMockRecords(): PatientRecord[] {
  return [
    {
      id: "rec-1",
      clinic_id: DEFAULT_CLINIC_UUID,
      patient_phone: "9876543210",
      patient_name: "Ramesh Sharma",
      patient_age: 42,
      checkup_date: "2026-08-15",
      diagnosis: "Chronic Eczema & Skin Allergic Dermatitis",
      prescription_text:
        "1. Graphites 200 - 4 pills in morning empty stomach for 14 days\n2. Sulphur 30 - 4 pills at bedtime on alternate days\n3. Calendula Ointment - Apply locally on rashes twice daily",
      prescription_images: [],
      notes: "Patient reported intense itching aggravated by warmth and bathing. Advised to avoid synthetic fabrics and harsh chemical soaps.",
      follow_up_date: "2026-09-11",
      created_at: "2026-08-15T10:45:00.000Z",
    },
    {
      id: "rec-2",
      clinic_id: DEFAULT_CLINIC_UUID,
      patient_phone: "9835123456",
      patient_name: "Sunita Devi",
      patient_age: 38,
      checkup_date: "2026-08-20",
      diagnosis: "Left Renal Calculus (6.2mm Kidney Stone) with Dysuria",
      prescription_text:
        "1. Berberis Vulgaris Q (Mother Tincture) - 15 drops in 1/2 glass lukewarm water thrice daily after meals\n2. Lycopodium 200 - 4 pills once daily at 5:00 PM\n3. Hydrangea Arborescens Q - 10 drops twice daily",
      prescription_images: [],
      notes: "Severe left flank pain radiating to groin. Advised 3.5 liters water daily. Restricted tomatoes, spinach, and high-oxalate foods. Repeat KUB USG after 4 weeks.",
      follow_up_date: "2026-09-18",
      created_at: "2026-08-20T18:30:00.000Z",
    },
  ];
}

// Local Storage Helpers for Patient Records
function getLocalPatientRecords(): PatientRecord[] {
  if (typeof window === "undefined") return getInitialMockRecords();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
    if (!raw) {
      const initial = getInitialMockRecords();
      localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialMockRecords();
  }
}

function saveLocalPatientRecords(records: PatientRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error("Failed to save patient records in local storage", e);
  }
}

// Fetch Complete Medical History for a Patient by Phone Number
export async function getPatientHistory(phone: string): Promise<PatientRecord[]> {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10); // Standardize 10-digit phone
  let records: PatientRecord[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("patient_records")
        .select("*")
        .eq("patient_phone", cleanPhone)
        .order("checkup_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("Supabase fetch patient history failed, falling back to local storage", err);
    }
  }

  // Local storage fallback
  const all = getLocalPatientRecords();
  records = all.filter((r) => r.patient_phone.replace(/\D/g, "").slice(-10) === cleanPhone);

  return records.sort((a, b) => {
    if (a.checkup_date === b.checkup_date) {
      return b.created_at.localeCompare(a.created_at);
    }
    return b.checkup_date.localeCompare(a.checkup_date);
  });
}

// Fetch All Unique Patients Directory with their Summary & History Aggregated
export async function getAllPatientsSummary(): Promise<PatientSummary[]> {
  let allRecords: PatientRecord[] = [];
  let allAppointments: Appointment[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const [recordsRes, aptsRes] = await Promise.all([
        supabase.from("patient_records").select("*").order("checkup_date", { ascending: false }),
        supabase.from("appointments").select("*").order("appointment_date", { ascending: false }),
      ]);

      if (recordsRes.data) allRecords = recordsRes.data;
      if (aptsRes.data) allAppointments = aptsRes.data;
    } catch (e) {
      console.warn("Supabase fetch summary failed, using local storage", e);
    }
  }

  if (allRecords.length === 0) allRecords = getLocalPatientRecords();
  if (allAppointments.length === 0) allAppointments = getLocalAppointments();

  const patientsMap = new Map<string, PatientSummary>();

  // 1. Process records
  for (const rec of allRecords) {
    const cleanPhone = rec.patient_phone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone) continue;

    const existing = patientsMap.get(cleanPhone);
    if (!existing) {
      patientsMap.set(cleanPhone, {
        phone: cleanPhone,
        name: rec.patient_name,
        age: rec.patient_age,
        visitCount: 1,
        lastVisit: rec.checkup_date,
        latestDiagnosis: rec.diagnosis,
        latestPrescription: rec.prescription_text,
      });
    } else {
      existing.visitCount += 1;
      if (rec.checkup_date > existing.lastVisit) {
        existing.lastVisit = rec.checkup_date;
        existing.latestDiagnosis = rec.diagnosis;
        existing.latestPrescription = rec.prescription_text;
      }
    }
  }

  // 2. Process appointments to include patients who booked but have no recorded Rx yet
  for (const apt of allAppointments) {
    const cleanPhone = apt.patient_phone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone) continue;

    const existing = patientsMap.get(cleanPhone);
    if (!existing) {
      patientsMap.set(cleanPhone, {
        phone: cleanPhone,
        name: apt.patient_name,
        age: apt.patient_age,
        visitCount: 0,
        lastVisit: apt.appointment_date,
        latestDiagnosis: apt.problem,
      });
    } else {
      if (!existing.age && apt.patient_age) {
        existing.age = apt.patient_age;
      }
    }
  }

  return Array.from(patientsMap.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
}

// Add a New Checkup / Prescription Record
export async function addPatientRecord(
  recordData: Omit<PatientRecord, "id" | "created_at">
): Promise<{ success: boolean; record?: PatientRecord; error?: string }> {
  const cleanPhone = recordData.patient_phone.replace(/\D/g, "").slice(-10);
  if (!cleanPhone || cleanPhone.length < 8) {
    return { success: false, error: "Patient phone number is required to save medical history." };
  }
  if (!recordData.patient_name || !recordData.patient_name.trim()) {
    return { success: false, error: "Patient name is required." };
  }

  const newRecord: PatientRecord = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`,
    clinic_id: recordData.clinic_id || DEFAULT_CLINIC_UUID,
    patient_phone: cleanPhone,
    patient_name: recordData.patient_name.trim(),
    patient_age: recordData.patient_age ? Number(recordData.patient_age) : undefined,
    checkup_date: recordData.checkup_date || getLocalDateString(),
    diagnosis: recordData.diagnosis?.trim() || "Routine Checkup / Consultation",
    prescription_text: recordData.prescription_text || "",
    prescription_images: recordData.prescription_images || [],
    notes: recordData.notes || "",
    follow_up_date: recordData.follow_up_date || undefined,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("patient_records")
        .insert({
          clinic_id: newRecord.clinic_id,
          patient_phone: newRecord.patient_phone,
          patient_name: newRecord.patient_name,
          patient_age: newRecord.patient_age,
          checkup_date: newRecord.checkup_date,
          diagnosis: newRecord.diagnosis,
          prescription_text: newRecord.prescription_text,
          prescription_images: newRecord.prescription_images,
          notes: newRecord.notes,
          follow_up_date: newRecord.follow_up_date,
        })
        .select()
        .single();

      if (!error && data) {
        newRecord.id = data.id;
      }
    } catch (err) {
      console.warn("Supabase insert patient record failed, falling back to local storage", err);
    }
  }

  // Always sync to Local Storage
  const all = getLocalPatientRecords();
  all.unshift(newRecord);
  saveLocalPatientRecords(all);

  return { success: true, record: newRecord };
}

// Update an Existing Patient Record
export async function updatePatientRecord(record: PatientRecord): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("patient_records")
        .update({
          patient_name: record.patient_name,
          patient_age: record.patient_age,
          checkup_date: record.checkup_date,
          diagnosis: record.diagnosis,
          prescription_text: record.prescription_text,
          prescription_images: record.prescription_images,
          notes: record.notes,
          follow_up_date: record.follow_up_date,
        })
        .eq("id", record.id);
    } catch (e) {
      console.warn("Supabase update patient record failed", e);
    }
  }

  const all = getLocalPatientRecords();
  const updated = all.map((r) => (r.id === record.id ? record : r));
  saveLocalPatientRecords(updated);
  return true;
}

// Delete a Patient Record
export async function deletePatientRecord(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("patient_records").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete patient record failed", e);
    }
  }

  const all = getLocalPatientRecords();
  const filtered = all.filter((r) => r.id !== id);
  saveLocalPatientRecords(filtered);
  return true;
}
