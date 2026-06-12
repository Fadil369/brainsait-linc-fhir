// ═══════════════════════════════════════════════════════════
// BASMA Profile Builder — Voice-Guided Profile Creation
// Doctors · Partners · Teams · Students
// Hosted on dr.elfadil.com
// ═══════════════════════════════════════════════════════════

// ── Profile Templates ─────────────────────────────────────
export const PROFILE_SCHEMAS = {
  doctor: {
    ar: {
      title: "الملف الطبي",
      questions: [
        { field: "fullName", ask: "ما اسمك الكامل؟", required: true },
        { field: "title", ask: "ما لقبك المهني؟ (مثال: أستاذ، استشاري، أخصائي)", required: true },
        { field: "specialty", ask: "ما تخصصك الطبي؟", required: true },
        { field: "hospital", ask: "في أي مستشفى تعمل؟", required: true },
        { field: "city", ask: "في أي مدينة؟", required: true },
        { field: "bio", ask: "أخبرني عن نفسك في 2-3 جمل (الخبرة، المهارات، הישגים)", required: true },
        { field: "education", ask: "ما هي مؤهلاتك التعليمية؟ (الجامعة، الدرجة)", required: false },
        { field: "certifications", ask: "هل لديك شهادات معتمدة؟ (ABMS, SCFHS, etc.)", required: false },
        { field: "languages", ask: "ما اللغات التي تتحدثها؟", required: false },
        { field: "services", ask: "ما الخدمات التي تقدمها للمرضى؟", required: false },
        { field: "email", ask: "ما بريدك الإلكتروني المهني؟", required: false },
        { field: "phone", ask: "ما رقم هاتفك للمواعيد؟", required: false },
        { field: "website", ask: "هل لديك موقع إلكتروني؟", required: false },
        { field: "photo", ask: "أرسل صورتك الشخصية (أو اكتب 'لاحقاً')", required: false },
        { field: "available", ask: "ما أوقات عملك؟", required: false },
      ],
    },
    en: {
      title: "Medical Profile",
      questions: [
        { field: "fullName", ask: "What is your full name?", required: true },
        { field: "title", ask: "What is your professional title? (e.g., Professor, Consultant, Specialist)", required: true },
        { field: "specialty", ask: "What is your medical specialty?", required: true },
        { field: "hospital", ask: "Which hospital do you work at?", required: true },
        { field: "city", ask: "Which city?", required: true },
        { field: "bio", ask: "Tell me about yourself in 2-3 sentences (experience, skills, achievements)", required: true },
        { field: "education", ask: "What are your educational qualifications? (University, degree)", required: false },
        { field: "certifications", ask: "Do you have any certifications? (ABMS, SCFHS, etc.)", required: false },
        { field: "languages", ask: "What languages do you speak?", required: false },
        { field: "services", ask: "What services do you offer to patients?", required: false },
        { field: "email", ask: "What is your professional email?", required: false },
        { field: "phone", ask: "What is your appointment phone number?", required: false },
        { field: "website", ask: "Do you have a website?", required: false },
        { field: "photo", ask: "Send your photo (or type 'later')", required: false },
        { field: "available", ask: "What are your working hours?", required: false },
      ],
    },
  },

  partner: {
    ar: {
      title: "ملف الشريك",
      questions: [
        { field: "companyName", ask: "ما اسم شركتك؟", required: true },
        { field: "contactPerson", ask: "ما اسم الشخص المسؤول؟", required: true },
        { field: "role", ask: "ما منصبه؟", required: true },
        { field: "industry", ask: "ما مجال عمل الشركة؟", required: true },
        { field: "description", ask: "أخبرني عن شركتك في 2-3 جمل", required: true },
        { field: "services", ask: "ما الخدمات التي تقدمونها؟", required: false },
        { field: "website", ask: "ما موقع الشركة الإلكتروني؟", required: false },
        { field: "email", ask: "ما البريد الإلكتروني للتواصل؟", required: false },
        { field: "phone", ask: "ما رقم الهاتف؟", required: false },
        { field: "logo", ask: "أرسل شعار الشركة (أو اكتب 'لاحقاً')", required: false },
        { field: "partnershipLevel", ask: "ما مستوى الشراكة؟ (ذهبي، فضي، برونزي)", required: false },
      ],
    },
    en: {
      title: "Partner Profile",
      questions: [
        { field: "companyName", ask: "What is your company name?", required: true },
        { field: "contactPerson", ask: "Who is the contact person?", required: true },
        { field: "role", ask: "What is their role?", required: true },
        { field: "industry", ask: "What is your industry?", required: true },
        { field: "description", ask: "Tell me about your company in 2-3 sentences", required: true },
        { field: "services", ask: "What services do you offer?", required: false },
        { field: "website", ask: "What is your company website?", required: false },
        { field: "email", ask: "What is your contact email?", required: false },
        { field: "phone", ask: "What is your phone number?", required: false },
        { field: "logo", ask: "Send your company logo (or type 'later')", required: false },
        { field: "partnershipLevel", ask: "What is your partnership level? (Gold, Silver, Bronze)", required: false },
      ],
    },
  },

  team: {
    ar: {
      title: "ملف الفريق",
      questions: [
        { field: "fullName", ask: "ما اسمك الكامل؟", required: true },
        { field: "position", ask: "ما منصبك في برين سايت؟", required: true },
        { field: "department", ask: "ما قسمك؟", required: true },
        { field: "bio", ask: "أخبرني عن نفسك في 2-3 جمل", required: true },
        { field: "skills", ask: "ما مهاراتك الرئيسية؟", required: false },
        { field: "experience", ask: "ما خبرتك السابقة؟", required: false },
        { field: "email", ask: "ما بريدك الإلكتروني؟", required: false },
        { field: "linkedin", ask: "ما رابط LinkedIn الخاص بك؟", required: false },
        { field: "photo", ask: "أرسل صورتك (أو اكتب 'لاحقاً')", required: false },
      ],
    },
    en: {
      title: "Team Profile",
      questions: [
        { field: "fullName", ask: "What is your full name?", required: true },
        { field: "position", ask: "What is your position at BrainSAIT?", required: true },
        { field: "department", ask: "What is your department?", required: true },
        { field: "bio", ask: "Tell me about yourself in 2-3 sentences", required: true },
        { field: "skills", ask: "What are your key skills?", required: false },
        { field: "experience", ask: "What is your previous experience?", required: false },
        { field: "email", ask: "What is your email?", required: false },
        { field: "linkedin", ask: "What is your LinkedIn URL?", required: false },
        { field: "photo", ask: "Send your photo (or type 'later')", required: false },
      ],
    },
  },

  student: {
    ar: {
      title: "ملف الطالب",
      questions: [
        { field: "fullName", ask: "ما اسمك الكامل؟", required: true },
        { field: "university", ask: "ما جامعتك؟", required: true },
        { field: "program", ask: "ما برنامجك الدراسي؟", required: true },
        { field: "year", ask: "ما سنة دراستك؟", required: true },
        { field: "bio", ask: "أخبرني عن نفسك في 2-3 جمل", required: true },
        { field: "interests", ask: "ما اهتماماتك الأكاديمية؟", required: false },
        { field: "projects", ask: "ما مشاريعك الحالية أو السابقة؟", required: false },
        { field: "skills", ask: "ما مهاراتك التقنية؟", required: false },
        { field: "email", ask: "ما بريدك الإلكتروني؟", required: false },
        { field: "linkedin", ask: "ما رابط LinkedIn الخاص بك؟", required: false },
        { field: "photo", ask: "أرسل صورتك (أو اكتب 'لاحقاً')", required: false },
      ],
    },
    en: {
      title: "Student Profile",
      questions: [
        { field: "fullName", ask: "What is your full name?", required: true },
        { field: "university", ask: "What is your university?", required: true },
        { field: "program", ask: "What is your program of study?", required: true },
        { field: "year", ask: "What year are you in?", required: true },
        { field: "bio", ask: "Tell me about yourself in 2-3 sentences", required: true },
        { field: "interests", ask: "What are your academic interests?", required: false },
        { field: "projects", ask: "What are your current or past projects?", required: false },
        { field: "skills", ask: "What are your technical skills?", required: false },
        { field: "email", ask: "What is your email?", required: false },
        { field: "linkedin", ask: "What is your LinkedIn URL?", required: false },
        { field: "photo", ask: "Send your photo (or type 'later')", required: false },
      ],
    },
  },
};

// ── Profile Builder State ─────────────────────────────────
const profileSessions = new Map(); // chatId -> session

export function getProfileSession(chatId) {
  if (!profileSessions.has(chatId)) {
    profileSessions.set(chatId, {
      chatId,
      role: null,
      schema: null,
      currentQuestion: 0,
      answers: {},
      state: "idle", // idle, collecting, reviewing, published
      lang: "ar",
      createdAt: Date.now(),
    });
  }
  return profileSessions.get(chatId);
}

export function clearProfileSession(chatId) {
  profileSessions.delete(chatId);
}

// ── Conversation Flow ─────────────────────────────────────

export function startProfileBuilder(chatId, role, lang = "ar") {
  const session = getProfileSession(chatId);
  const schema = PROFILE_SCHEMAS[role];

  if (!schema) {
    return { ok: false, error: `Unknown role: ${role}` };
  }

  session.role = role;
  session.schema = schema[lang];
  session.currentQuestion = 0;
  session.answers = {};
  session.state = "collecting";
  session.lang = lang;

  const firstQ = session.schema.questions[0];
  return {
    ok: true,
    message: lang === "ar"
      ? `🌟 *بناء الملف الشخصي — ${session.schema.title}*\n\nسأسألك بعض الأسئلة لبناء ملفك الشخصي الاحترافي على *dr.elfadil.com*\n\n${firstQ.ask}`
      : `🌟 *Profile Builder — ${session.schema.title}*\n\nI'll ask you some questions to build your professional profile on *dr.elfadil.com*\n\n${firstQ.ask}`,
    question: firstQ,
    progress: `1/${session.schema.questions.length}`,
  };
}

export function answerQuestion(chatId, answer) {
  const session = getProfileSession(chatId);

  if (session.state !== "collecting") {
    return { ok: false, error: "Not in collecting state" };
  }

  const questions = session.schema.questions;
  const currentQ = questions[session.currentQuestion];

  // Save answer
  session.answers[currentQ.field] = answer;
  session.currentQuestion++;

  // Check if done
  if (session.currentQuestion >= questions.length) {
    session.state = "reviewing";
    return {
      ok: true,
      done: true,
      message: formatProfileReview(session),
      answers: session.answers,
    };
  }

  // Next question
  const nextQ = questions[session.currentQuestion];
  const progress = `${session.currentQuestion + 1}/${questions.length}`;

  return {
    ok: true,
    done: false,
    message: nextQ.ask,
    question: nextQ,
    progress,
  };
}

function formatProfileReview(session) {
  const { answers, schema, lang } = session;
  const lines = [];

  lines.push(lang === "ar"
    ? `📋 *مراجعة الملف الشخصي — ${schema.title}*\n`
    : `📋 *Profile Review — ${schema.title}*\n`);

  for (const q of schema.questions) {
    const value = answers[q.field];
    if (value) {
      const label = q.ask.replace(/[؟?]/g, "").replace("ما ", "").replace("What is ", "").replace("Tell me about ", "").trim();
      lines.push(`*${label}:* ${value}`);
    }
  }

  lines.push(lang === "ar"
    ? "\n✅ هل تريد نشر الملف؟"
    : "\n✅ Do you want to publish this profile?");

  return lines.join("\n");
}

// ── Profile HTML Generator ────────────────────────────────

export function generateProfileHTML(session) {
  const { role, answers, lang } = session;
  const isDoctor = role === "doctor";
  const isPartner = role === "partner";
  const isTeam = role === "team";
  const isStudent = role === "student";

  const name = answers.fullName || answers.companyName || "Unknown";
  const title = answers.title || answers.position || answers.role || "";
  const bio = answers.bio || answers.description || "";
  const specialty = answers.specialty || answers.industry || answers.department || "";
  const hospital = answers.hospital || answers.university || "BrainSAIT";
  const city = answers.city || "";
  const email = answers.email || "";
  const phone = answers.phone || "";
  const website = answers.website || "";
  const linkedin = answers.linkedin || "";
  const languages = answers.languages || "";
  const services = answers.services || "";
  const education = answers.education || "";
  const certifications = answers.certifications || "";
  const skills = answers.skills || "";
  const experience = answers.experience || "";
  const projects = answers.projects || "";
  const interests = answers.interests || "";
  const available = answers.available || "";
  const partnershipLevel = answers.partnershipLevel || "";

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const roleIcon = isDoctor ? "🏥" : isPartner ? "🤝" : isTeam ? "👥" : "🎓";
  const roleLabel = isDoctor ? (lang === "ar" ? "طبيب" : "Doctor") :
                    isPartner ? (lang === "ar" ? "شريك" : "Partner") :
                    isTeam ? (lang === "ar" ? "فريق" : "Team") :
                    (lang === "ar" ? "طالب" : "Student");

  return `<!DOCTYPE html>
<html lang="${lang === "ar" ? "ar" : "en"}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — BrainSAIT Profile</title>
  <meta name="description" content="${bio.slice(0, 160)}">
  <meta property="og:title" content="${name} — BrainSAIT">
  <meta property="og:description" content="${bio.slice(0, 160)}">
  <meta property="og:type" content="profile">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); min-height: 100vh; color: #e2e8f0; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
    .card { background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(20px); border-radius: 1.5rem; padding: 2.5rem; border: 1px solid rgba(148, 163, 184, 0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .header { text-align: center; margin-bottom: 2rem; }
    .avatar { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1rem; border: 4px solid rgba(59, 130, 246, 0.3); }
    .name { font-size: 2rem; font-weight: 700; color: #f8fafc; margin-bottom: 0.5rem; }
    .title { font-size: 1.1rem; color: #94a3b8; margin-bottom: 0.25rem; }
    .specialty { font-size: 0.9rem; color: #60a5fa; font-weight: 500; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; margin: 0.5rem 0.25rem; }
    .badge-blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-green { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-purple { background: rgba(139, 92, 246, 0.2); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
    .section { margin-top: 1.5rem; }
    .section-title { font-size: 1rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
    .section-title::before { content: ''; width: 3px; height: 1rem; background: #3b82f6; border-radius: 2px; }
    .content { color: #cbd5e1; line-height: 1.7; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .item { background: rgba(15, 23, 42, 0.5); padding: 1rem; border-radius: 0.75rem; border: 1px solid rgba(148, 163, 184, 0.05); }
    .item-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .item-value { font-size: 0.95rem; color: #e2e8f0; margin-top: 0.25rem; }
    .contact-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; text-decoration: none; transition: all 0.2s; margin: 0.25rem; }
    .btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4); }
    .btn-outline { background: transparent; color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .btn-outline:hover { background: rgba(59, 130, 246, 0.1); }
    .footer { text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(148, 163, 184, 0.1); }
    .footer-text { font-size: 0.8rem; color: #475569; }
    .footer-link { color: #3b82f6; text-decoration: none; }
    .footer-link:hover { text-decoration: underline; }
    @media (max-width: 640px) { .card { padding: 1.5rem; } .name { font-size: 1.5rem; } .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="avatar">${roleIcon}</div>
        <h1 class="name">${name}</h1>
        ${title ? `<p class="title">${title}</p>` : ""}
        ${specialty ? `<p class="specialty">${specialty}</p>` : ""}
        <div>
          <span class="badge badge-blue">${roleLabel}</span>
          ${hospital ? `<span class="badge badge-green">${hospital}</span>` : ""}
          ${city ? `<span class="badge badge-purple">${city}</span>` : ""}
          ${partnershipLevel ? `<span class="badge badge-${partnershipLevel === "ذهبي" || partnershipLevel === "Gold" ? "blue" : "purple"}">${partnershipLevel}</span>` : ""}
        </div>
      </div>

      ${bio ? `
      <div class="section">
        <h2 class="section-title">${lang === "ar" ? "نبذة عني" : "About Me"}</h2>
        <div class="content">${bio}</div>
      </div>` : ""}

      ${education || certifications || experience ? `
      <div class="section">
        <h2 class="section-title">${lang === "ar" ? "المؤهلات والخبرات" : "Qualifications & Experience"}</h2>
        <div class="grid">
          ${education ? `<div class="item"><div class="item-label">${lang === "ar" ? "التعليم" : "Education"}</div><div class="item-value">${education}</div></div>` : ""}
          ${certifications ? `<div class="item"><div class="item-label">${lang === "ar" ? "الشهادات" : "Certifications"}</div><div class="item-value">${certifications}</div></div>` : ""}
          ${experience ? `<div class="item"><div class="item-label">${lang === "ar" ? "الخبرة" : "Experience"}</div><div class="item-value">${experience}</div></div>` : ""}
        </div>
      </div>` : ""}

      ${services || skills || interests ? `
      <div class="section">
        <h2 class="section-title">${lang === "ar" ? "المهارات والخدمات" : "Skills & Services"}</h2>
        <div class="grid">
          ${services ? `<div class="item"><div class="item-label">${lang === "ar" ? "الخدمات" : "Services"}</div><div class="item-value">${services}</div></div>` : ""}
          ${skills ? `<div class="item"><div class="item-label">${lang === "ar" ? "المهارات" : "Skills"}</div><div class="item-value">${skills}</div></div>` : ""}
          ${interests ? `<div class="item"><div class="item-label">${lang === "ar" ? "الاهتمامات" : "Interests"}</div><div class="item-value">${interests}</div></div>` : ""}
          ${projects ? `<div class="item"><div class="item-label">${lang === "ar" ? "المشاريع" : "Projects"}</div><div class="item-value">${projects}</div></div>` : ""}
        </div>
      </div>` : ""}

      ${languages || available ? `
      <div class="section">
        <h2 class="section-title">${lang === "ar" ? "معلومات إضافية" : "Additional Info"}</h2>
        <div class="grid">
          ${languages ? `<div class="item"><div class="item-label">${lang === "ar" ? "اللغات" : "Languages"}</div><div class="item-value">${languages}</div></div>` : ""}
          ${available ? `<div class="item"><div class="item-label">${lang === "ar" ? "أوقات العمل" : "Availability"}</div><div class="item-value">${available}</div></div>` : ""}
        </div>
      </div>` : ""}

      ${email || phone || website || linkedin ? `
      <div class="section">
        <h2 class="section-title">${lang === "ar" ? "التواصل" : "Contact"}</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${email ? `<a href="mailto:${email}" class="contact-btn btn-primary">📧 ${email}</a>` : ""}
          ${phone ? `<a href="tel:${phone}" class="contact-btn btn-outline">📞 ${phone}</a>` : ""}
          ${website ? `<a href="${website}" target="_blank" class="contact-btn btn-outline">🌐 ${lang === "ar" ? "الموقع" : "Website"}</a>` : ""}
          ${linkedin ? `<a href="${linkedin}" target="_blank" class="contact-btn btn-outline">💼 LinkedIn</a>` : ""}
        </div>
      </div>` : ""}

      <div class="footer">
        <p class="footer-text">
          ${lang === "ar" ? "تم إنشاء هذا الملف بواسطة" : "Profile created by"}
          <a href="https://brainsait.org" class="footer-link">BrainSAIT</a>
          ${lang === "ar" ? "powered by" : "powered by"}
          <a href="https://t.me/brainsait_bot" class="footer-link">بسمه BASMA</a>
        </p>
        <p class="footer-text" style="margin-top: 0.5rem;">
          ${lang === "ar" ? "آخر تحديث:" : "Last updated:"} ${new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Profile Storage ───────────────────────────────────────

export async function publishProfile(env, session) {
  const html = generateProfileHTML(session);
  const name = session.answers.fullName || session.answers.companyName || "unknown";
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const role = session.role;

  // Store in D1
  const profileId = `${role}-${slug}`;
  try {
    await env.FHIR_DB.prepare(
      "INSERT OR REPLACE INTO fhir_resources (id, resource_type, resource_id, patient_id, data, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
    ).bind(
      `Profile/${profileId}`,
      "Profile",
      profileId,
      null,
      JSON.stringify({
        resourceType: "Profile",
        id: profileId,
        role,
        name,
        slug,
        answers: session.answers,
        html,
        publishedAt: new Date().toISOString(),
      })
    ).run();

    return {
      ok: true,
      profileId,
      slug,
      url: `https://dr.elfadil.com/${role}/${slug}`,
      html,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function getProfile(env, profileId) {
  try {
    const row = await env.FHIR_DB.prepare(
      "SELECT data FROM fhir_resources WHERE resource_type='Profile' AND resource_id=?"
    ).bind(profileId).first();

    if (!row) return { ok: false, error: "Profile not found" };
    return { ok: true, profile: JSON.parse(row.data) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function listProfiles(env, role = null) {
  try {
    let sql = "SELECT data FROM fhir_resources WHERE resource_type='Profile'";
    if (role) sql += ` AND resource_id LIKE '${role}-%'`;
    sql += " ORDER BY created_at DESC LIMIT 50";

    const { results } = await env.FHIR_DB.prepare(sql).all();
    return {
      ok: true,
      profiles: results.map(r => {
        const p = JSON.parse(r.data);
        return { id: p.id, role: p.role, name: p.name, slug: p.slug, url: `https://dr.elfadil.com/${p.role}/${p.slug}` };
      }),
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
