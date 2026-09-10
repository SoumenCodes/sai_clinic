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

// Helper: Convert "HH:MM" to minutes from midnight
function timeToMinutes(time24: string): number {
  const [h, m] = time24.split(":").map((v) => parseInt(v, 10));
  return h * 60 + (m || 0);
}

// Initial demo mock appointments for seamless testing
function getInitialMockAppointments(): Appointment[] {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

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
  const isToday = dateStr === now.toISOString().split("T")[0];
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

// Fetch Booked Slots for a Date (Supabase with Local Fallback)
export async function getBookedSlotsForDate(
  dateStr: string,
  clinicSlug: string = DEFAULT_CLINIC_SLUG
): Promise<string[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("slot_start_time, status")
        .eq("appointment_date", dateStr)
        .in("status", ["confirmed", "pending"]);

      if (!error && data) {
        return data.map((item) => {
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
  const all = getLocalAppointments();
  return all
    .filter((a) => a.appointment_date === dateStr && a.status !== "cancelled")
    .map((a) => (a.slot_start_time.length === 8 ? a.slot_start_time.substring(0, 5) : a.slot_start_time));
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

  // Check collision
  const booked = await getBookedSlotsForDate(appointment_date);
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

  // Try Supabase first
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: clinic } = await supabase
        .from("clinics")
        .select("id")
        .eq("slug", params.clinicSlug || DEFAULT_CLINIC_SLUG)
        .single();

      const clinicId = clinic?.id || "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

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
