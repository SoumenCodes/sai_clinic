"use client";

import { useState, useEffect, useId } from "react";
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
  Filter,
  Search,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Plus,
  Save,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  Appointment,
  ClinicScheduleSettings,
  getAdminAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getLocalSettings,
  saveLocalSettings,
  formatTime12h,
} from "@/lib/booking-service";
import { isSupabaseConfigured } from "@/lib/supabase";

function WhatsAppIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"appointments" | "settings" | "database">("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<ClinicScheduleSettings>(getLocalSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  const shift1StartId = useId();
  const shift1EndId = useId();
  const shift2StartId = useId();
  const shift2EndId = useId();
  const slotDurationId = useId();

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const loadAppointments = async () => {
    setLoading(true);
    const data = await getAdminAppointments(selectedDate || undefined);
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
    setSettings(getLocalSettings());
  }, [selectedDate]);

  const handleStatusChange = async (id: string, newStatus: "confirmed" | "completed" | "cancelled") => {
    await updateAppointmentStatus(id, newStatus);
    loadAppointments();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this appointment? The slot will become available again.")) {
      await deleteAppointment(id);
      loadAppointments();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalSettings(settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const filteredAppointments = appointments.filter((apt) => {
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* 1. ADMIN HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
              title="Return to Website"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="text-base sm:text-lg font-black leading-tight flex items-center gap-2">
                <span>Sai Homoeo Clinic</span>
                <span className="text-[10px] uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Doctor Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Baridih, Jamshedpur • 15-Minute Slot Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition hidden sm:inline-flex items-center gap-1.5"
            >
              <span>View Website</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* 2. ADMIN TABS */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-slate-800/80 pt-1">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "appointments"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar size={15} />
            <span>Appointments Feed</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "settings"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock size={15} />
            <span>Clinic Timings &amp; Shifts</span>
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "database"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database size={15} />
            <span>Supabase DB Config</span>
          </button>
        </div>
      </header>

      {/* 3. TAB 1: APPOINTMENTS FEED */}
      {activeTab === "appointments" && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Quick Date Filters & Search */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedDate === todayStr
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(tomorrowStr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedDate === tomorrowStr
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Tomorrow
              </button>
              <button
                onClick={() => setSelectedDate("")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedDate === ""
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Dates
              </button>

              <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                <span className="text-[11px] text-slate-400 font-semibold">Custom:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Bookings</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{filteredAppointments.length}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                {selectedDate ? selectedDate : "All time"}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Morning Shift (10AM - 2PM)</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">{morningBookings.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">15-min slots</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Evening Shift (5PM - 10PM)</div>
              <div className="text-2xl font-black text-teal-800 mt-1">{eveningBookings.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">15-min slots</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Database Status</div>
              <div className="text-sm font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? "bg-emerald-500" : "bg-amber-500"}`}
                ></span>
                <span>{isSupabaseConfigured ? "Supabase Live" : "Local Demo Mode"}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Multi-tenant ready</div>
            </div>
          </div>

          {/* Appointment List Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-emerald-700" />
                <span>Patient Queue &amp; Slots</span>
              </h2>
              <button
                onClick={loadAppointments}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                title="Refresh"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading appointments...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No appointments found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are no bookings for the selected date. Any new patient booking from the website will automatically appear here!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => {
                  const isDone = apt.status === "completed";
                  const isCancelled = apt.status === "cancelled";

                  return (
                    <div
                      key={apt.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                        isDone ? "bg-slate-50/60 opacity-80" : isCancelled ? "bg-red-50/30 opacity-70" : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Left Slot Time & Patient Info */}
                      <div className="flex items-start gap-3.5">
                        {/* 15-Minute Slot Badge */}
                        <div className="w-20 sm:w-24 shrink-0 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                          <div className="text-xs sm:text-sm font-black text-emerald-900">
                            {formatTime12h(apt.slot_start_time)}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            to {formatTime12h(apt.slot_end_time)}
                          </div>
                          <div className="text-[9px] uppercase font-bold text-slate-400 mt-1">15 Mins</div>
                        </div>

                        {/* Patient Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-slate-900">{apt.patient_name}</span>
                            {apt.patient_age && (
                              <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                {apt.patient_age} yrs
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isDone
                                  ? "bg-blue-100 text-blue-800"
                                  : isCancelled
                                  ? "bg-red-100 text-red-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {apt.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 font-medium">
                            <span>Concern: </span>
                            <span className="font-bold text-slate-800">{apt.problem}</span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                            <span>Date: <strong className="text-slate-700">{apt.appointment_date}</strong></span>
                            <span>•</span>
                            <span className="capitalize">{apt.consultation_mode}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Call Button */}
                        <a
                          href={`tel:${apt.patient_phone}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
                          title="Call Patient"
                        >
                          <Phone size={13} className="text-emerald-700" />
                          <span>{apt.patient_phone}</span>
                        </a>

                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/91${apt.patient_phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(
                            apt.patient_name
                          )},%20regarding%20your%20appointment%20at%20Sai%20Homoeo%20Clinic%20on%20${
                            apt.appointment_date
                          }%20at%20${formatTime12h(apt.slot_start_time)}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                          title="WhatsApp Patient"
                        >
                          <WhatsAppIcon size={14} className="text-white" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Mark Completed Toggle */}
                        {!isDone && (
                          <button
                            onClick={() => handleStatusChange(apt.id, "completed")}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                            title="Mark as Completed"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}

                        {/* Cancel / Free Slot */}
                        {!isCancelled && (
                          <button
                            onClick={() => handleStatusChange(apt.id, "cancelled")}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
                            title="Cancel Appointment & Free Slot"
                          >
                            <XCircle size={18} />
                          </button>
                        )}

                        {/* Delete Permanently */}
                        <button
                          onClick={() => handleDelete(apt.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-400 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      )}

      {/* 4. TAB 2: CLINIC TIMINGS & SHIFTS */}
      {activeTab === "settings" && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="badge-pill bg-emerald-100 text-emerald-800 mb-2">
              <Clock size={13} />
              <span>CLINIC SHIFT HOURS</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Manage Clinic Shifts &amp; Slot Duration</h2>
            <p className="text-xs text-slate-500 mb-6">
              Adjust your daily morning and evening consultation shifts. Slot calculations will automatically adapt.
            </p>

            {settingsSaved && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check size={16} />
                <span>Shift timings and slot duration updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Shift 1: Morning */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Shift 1 (Morning Consultation)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={shift1StartId} className="block text-xs font-bold text-slate-700 mb-1">
                      Opening Time (24h)
                    </label>
                    <input
                      id={shift1StartId}
                      type="time"
                      value={settings.shift1Start}
                      onChange={(e) => setSettings({ ...settings, shift1Start: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-400">e.g. 10:00 AM</span>
                  </div>
                  <div>
                    <label htmlFor={shift1EndId} className="block text-xs font-bold text-slate-700 mb-1">
                      Closing Time (24h)
                    </label>
                    <input
                      id={shift1EndId}
                      type="time"
                      value={settings.shift1End}
                      onChange={(e) => setSettings({ ...settings, shift1End: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-400">e.g. 02:00 PM (14:00)</span>
                  </div>
                </div>
              </div>

              {/* Shift 2: Evening */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  <span>Shift 2 (Evening Consultation)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={shift2StartId} className="block text-xs font-bold text-slate-700 mb-1">
                      Opening Time (24h)
                    </label>
                    <input
                      id={shift2StartId}
                      type="time"
                      value={settings.shift2Start}
                      onChange={(e) => setSettings({ ...settings, shift2Start: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-400">e.g. 05:00 PM (17:00)</span>
                  </div>
                  <div>
                    <label htmlFor={shift2EndId} className="block text-xs font-bold text-slate-700 mb-1">
                      Closing Time (24h)
                    </label>
                    <input
                      id={shift2EndId}
                      type="time"
                      value={settings.shift2End}
                      onChange={(e) => setSettings({ ...settings, shift2End: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-400">e.g. 10:00 PM (22:00)</span>
                  </div>
                </div>
              </div>

              {/* Slot Duration */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label htmlFor={slotDurationId} className="block text-xs font-bold text-slate-700">
                  Appointment Slot Interval
                </label>
                <select
                  id={slotDurationId}
                  value={settings.slotDurationMinutes}
                  onChange={(e) => setSettings({ ...settings, slotDurationMinutes: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                >
                  <option value={10}>10 Minutes per patient</option>
                  <option value={15}>15 Minutes per patient (Recommended Default)</option>
                  <option value={20}>20 Minutes per patient</option>
                  <option value={30}>30 Minutes per patient</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Changing this duration recalculates all future available slots automatically on the website.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>Save Clinic Schedule</span>
              </button>
            </form>
          </div>
        </main>
      )}

      {/* 5. TAB 3: SUPABASE DB CONFIG & MULTI-TENANCY */}
      {activeTab === "database" && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="badge-pill bg-emerald-100 text-emerald-800 mb-2">
              <Database size={13} />
              <span>DATABASE ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Supabase Multi-Tenant Integration</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This system is built with a partitioned multi-tenant schema. You can host multiple clinics or multiple doctor websites using a single Supabase project.
            </p>

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
                <span>{isSupabaseConfigured ? "Supabase Connected & Active" : "Local Storage Demo Mode Active"}</span>
              </div>
              <p className="text-xs mt-1 text-slate-600">
                {isSupabaseConfigured
                  ? "Live bookings and schedules are actively writing to and reading from your remote Supabase PostgreSQL database."
                  : "Supabase keys are not set in .env.local yet. The app is running with an automatic local fallback so you can test slots, booking, and admin functions completely offline!"}
              </p>
            </div>

            {/* Setup Instructions */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900">How to connect your Supabase project:</h3>

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2 overflow-x-auto">
                <div className="text-slate-400"># 1. Create a file named .env.local in your project root:</div>
                <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900">2. Run SQL Schema:</div>
                <p className="text-slate-600">
                  Open your Supabase Dashboard &gt; <strong>SQL Editor</strong> &gt; Paste the contents of{" "}
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">supabase-schema.sql</code> and click{" "}
                  <strong>Run</strong>.
                </p>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  ✓ It automatically creates tables, unique 15-minute slot collision constraints, RLS policies, and seed data for Sai Homoeo Clinic!
                </p>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
