export const COLORS = {
  midnightBlue: "#1a365d",
  medicalBlue: "#2b6cb8",
  signalTeal: "#0ea5e9",
  deepOrange: "#ea580c",
  profGray: "#64748b",
  glassWhite: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.12)",
};

export const TIER_COLORS = {
  orchestrator: "#2b6cb8",
  specialist: "#0ea5e9",
  core: "#0ea5e9",
  mcp: "#22c55e",
  gateway: "#a855f7",
  platform: "#f59e0b",
  compliance: "#ea580c",
  router: "#0ea5e9",
  bridge: "#64748b",
  admin: "#ef4444",
};

export const NPHIES_CODES = {
  "101": "خدمة طبية (Medical Service)",
  "201": "إقامة (Hospital Stay)",
  "301": "أدوية (Medication)",
  "401": "تشخيص (Diagnostic)",
  "501": "علاج طبيعي (Physical Therapy)",
  "601": "خدمات أسنان (Dental)",
  "701": "نقل إسعاف (Ambulance Transport)",
  "801": "أجهزة طبية (Medical Devices)",
};

export const NPHIES_ERROR_CODES = {
  REJ001: "رقم الهوية الوطنية غير صحيح / Invalid National ID",
  REJ002: "التغطية التأمينية غير صالحة / Coverage expired",
  REJ003: "الخدمة غير مشمولة في البوليصة / Service not covered",
  REJ004: "تفويض مسبق مطلوب / Prior authorization required",
  REJ005: "تكرار المطالبة / Duplicate claim submission",
};

export const CDS_HOOKS = [
  { id: "medication-order", label: "Medication Order", arabic: "أمر دوائي" },
  { id: "medication-dispense", label: "Medication Dispense", arabic: "صرف دواء" },
  { id: "order-review", label: "Order Review", arabic: "مراجعة الطلب" },
  { id: "encounter-start", label: "Encounter Start", arabic: "بدء الموعد" },
  { id: "encounter-discharge", label: "Encounter Discharge", arabic: "انتهاء الموعد" },
  { id: "patient-view", label: "Patient View", arabic: "عرض المريض" },
];
