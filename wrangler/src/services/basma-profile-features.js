// ═══════════════════════════════════════════════════════════
// BASMA Profile Features — QR, Analytics, Verification, Search
// ═══════════════════════════════════════════════════════════

// ── QR Code Generator (SVG-based) ─────────────────────────
export function generateQRCodeSVG(text, size = 200) {
  // Simple QR code placeholder - in production, use a QR library
  // For now, generate a branded placeholder with the URL
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=svg`;
}

export function generateProfileQR(profileUrl, lang = "ar") {
  const qrUrl = generateQRCodeSVG(profileUrl, 300);
  return {
    url: qrUrl,
    html: `<div style="text-align:center;padding:1rem;">
      <img src="${qrUrl}" alt="QR Code" style="width:200px;height:200px;border-radius:1rem;" />
      <p style="margin-top:0.5rem;font-size:0.8rem;color:#94a3b8;">
        ${lang === "ar" ? "امسح للزيارة" : "Scan to visit"}
      </p>
    </div>`,
  };
}

// ── Profile Analytics ─────────────────────────────────────
export async function trackProfileView(env, profileId, viewerInfo = {}) {
  try {
    const analyticsId = `Analytics/${profileId}/${Date.now()}`;
    await env.FHIR_DB.prepare(
      "INSERT INTO fhir_resources (id, resource_type, resource_id, patient_id, data, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
    ).bind(
      analyticsId,
      "Analytics",
      analyticsId,
      profileId,
      JSON.stringify({
        resourceType: "Analytics",
        profileId,
        event: "view",
        timestamp: new Date().toISOString(),
        viewer: {
          platform: viewerInfo.platform || "telegram",
          userId: viewerInfo.userId || "anonymous",
          location: viewerInfo.location || "unknown",
        },
      })
    ).run();

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function getProfileAnalytics(env, profileId) {
  try {
    const { results } = await env.FHIR_DB.prepare(
      "SELECT data FROM fhir_resources WHERE resource_type='Analytics' AND resource_id LIKE ? ORDER BY created_at DESC LIMIT 100"
    ).bind(`Analytics/${profileId}%`).all();

    const views = results.map(r => JSON.parse(r.data));
    const totalViews = views.length;
    const uniqueViewers = new Set(views.map(v => v.viewer?.userId)).size;
    const todayViews = views.filter(v => {
      const viewDate = new Date(v.timestamp);
      const today = new Date();
      return viewDate.toDateString() === today.toDateString();
    }).length;

    const platformBreakdown = {};
    views.forEach(v => {
      const platform = v.viewer?.platform || "unknown";
      platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
    });

    return {
      ok: true,
      analytics: {
        totalViews,
        uniqueViewers,
        todayViews,
        platformBreakdown,
        recentViews: views.slice(0, 10),
      },
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function formatAnalytics(analytics, lang = "ar") {
  const { totalViews, uniqueViewers, todayViews, platformBreakdown } = analytics;
  const platforms = Object.entries(platformBreakdown).map(([p, c]) => `  ${p}: ${c}`).join("\n");

  return lang === "ar"
    ? `📊 *إحصائيات الملف الشخصي*

👁️ إجمالي المشاهدات: ${totalViews}
👤 المشاهدين الفريدين: ${uniqueViewers}
📅 مشاهدات اليوم: ${todayViews}

📱 حسب المنصة:
${platformes}`
    : `📊 *Profile Analytics*

👁️ Total Views: ${totalViews}
👤 Unique Viewers: ${uniqueViewers}
📅 Today's Views: ${todayViews}

📱 By Platform:
${platforms}`;
}

// ── SCFHS Verification ────────────────────────────────────
export async function verifySCFHS(env, scfhsNumber, name) {
  // Simulate SCFHS verification
  // In production, this would call the SCFHS API
  const isValid = scfhsNumber && scfhsNumber.length >= 6;
  const verified = isValid && /^[0-9]+$/.test(scfhsNumber);

  return {
    ok: true,
    verified,
    scfhsNumber,
    name,
    status: verified ? "verified" : "unverified",
    message: verified
      ? `✅ SCFHS verification successful for ${name} (${scfhsNumber})`
      : `⚠️ SCFHS verification failed. Please check your number.`,
  };
}

export function getVerificationBadge(verified, lang = "ar") {
  if (verified) {
    return {
      badge: "✅",
      text: lang === "ar" ? "موثق من هيئة التخصصات الصحية" : "SCFHS Verified",
      color: "#10b981",
    };
  }
  return {
    badge: "⏳",
    text: lang === "ar" ? "في انتظار التحقق" : "Pending Verification",
    color: "#f59e0b",
  };
}

// ── Profile Search ────────────────────────────────────────
export async function searchProfiles(env, query, role = null, limit = 20) {
  try {
    let sql = "SELECT data FROM fhir_resources WHERE resource_type='Profile'";
    const params = [];

    if (role) {
      sql += " AND resource_id LIKE ?";
      params.push(`${role}-%`);
    }

    if (query) {
      sql += " AND (data LIKE ? OR data LIKE ? OR data LIKE ?)";
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const { results } = await env.FHIR_DB.prepare(sql).bind(...params).all();

    const profiles = results.map(r => {
      const p = JSON.parse(r.data);
      return {
        id: p.id,
        role: p.role,
        name: p.name,
        slug: p.slug,
        specialty: p.answers?.specialty || p.answers?.industry || p.answers?.department || "",
        hospital: p.answers?.hospital || p.answers?.university || "BrainSAIT",
        city: p.answers?.city || "",
        verified: p.answers?.verified || false,
        url: `https://dr.elfadil.com/${p.role}/${p.slug}`,
      };
    });

    return { ok: true, profiles, count: profiles.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function formatSearchResults(results, lang = "ar") {
  if (results.length === 0) {
    return lang === "ar" ? "🔍 لا توجد نتائج" : "🔍 No results found";
  }

  return results.map(p => {
    const icon = p.role === "doctor" ? "🏥" : p.role === "partner" ? "🤝" : p.role === "team" ? "👥" : "🎓";
    const verified = p.verified ? "✅" : "";
    const detail = p.specialty ? ` — ${p.specialty}` : "";
    const location = p.city ? ` (${p.city})` : "";
    return `${icon} ${verified} [${p.name}](${p.url})${detail}${location}`;
  }).join("\n");
}

// ── Profile Embedding ─────────────────────────────────────
export function generateEmbedCode(profileUrl, width = 400, height = 600) {
  return `<iframe src="${profileUrl}?embed=true" width="${width}" height="${height}" frameborder="0" style="border-radius:1rem;border:1px solid rgba(148,163,184,0.1);"></iframe>`;
}

export function generateShareText(profile, lang = "ar") {
  const icon = profile.role === "doctor" ? "🏥" : profile.role === "partner" ? "🤝" : profile.role === "team" ? "👥" : "🎓";
  const specialty = profile.answers?.specialty || profile.answers?.industry || "";

  return lang === "ar"
    ? `${icon} *${profile.name}*\n${specialty}\n\n🔗 ${profile.url}\n\n_تم إنشاء بواسطة بسمه — BrainSAIT_`
    : `${icon} *${profile.name}*\n${specialty}\n\n🔗 ${profile.url}\n\n_Created by BASMA — BrainSAIT_`;
}

// ── Profile Export (vCard) ────────────────────────────────
export function generateVCard(profile) {
  const { answers } = profile;
  const name = answers.fullName || answers.companyName || "Unknown";
  const title = answers.title || answers.position || "";
  const org = answers.hospital || answers.university || "BrainSAIT";
  const email = answers.email || "";
  const phone = answers.phone || "";
  const website = answers.website || "";
  const [firstName, ...lastNameParts] = name.split(" ");
  const lastName = lastNameParts.join(" ");

  return `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${name}
ORG:${org}
TITLE:${title}
TEL;TYPE=WORK:${phone}
EMAIL:${email}
URL:${website}
NOTE:${answers.bio || ""}
END:VCARD`;
}

// ── Profile Comparison ────────────────────────────────────
export function compareProfiles(profile1, profile2, lang = "ar") {
  const fields = ["specialty", "hospital", "city", "education", "certifications", "languages"];
  const comparison = [];

  for (const field of fields) {
    const val1 = profile1.answers?.[field] || "";
    const val2 = profile2.answers?.[field] || "";
    if (val1 || val2) {
      comparison.push({
        field,
        value1: val1 || (lang === "ar" ? "غير محدد" : "Not specified"),
        value2: val2 || (lang === "ar" ? "غير محدد" : "Not specified"),
        match: val1 === val2,
      });
    }
  }

  return {
    ok: true,
    comparison,
    similarity: comparison.filter(c => c.match).length / Math.max(comparison.length, 1),
  };
}

// ── Profile Recommendations ───────────────────────────────
export async function getProfileRecommendations(env, profileId, limit = 5) {
  try {
    const profile = await getProfile(env, profileId);
    if (!profile.ok) return { ok: false, error: "Profile not found" };

    const { role, answers } = profile.profile;
    const specialty = answers?.specialty || answers?.industry || "";
    const city = answers?.city || "";

    // Find similar profiles
    const similar = await searchProfiles(env, specialty, role === "doctor" ? null : role, limit + 1);
    if (!similar.ok) return { ok: false, error: "Search failed" };

    // Filter out the current profile
    const recommendations = similar.profiles
      .filter(p => p.id !== profileId)
      .slice(0, limit);

    return { ok: true, recommendations };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Profile Update ────────────────────────────────────────
export async function updateProfile(env, profileId, updates) {
  try {
    const profile = await getProfile(env, profileId);
    if (!profile.ok) return { ok: false, error: "Profile not found" };

    const updatedProfile = {
      ...profile.profile,
      answers: { ...profile.profile.answers, ...updates },
      updatedAt: new Date().toISOString(),
    };

    await env.FHIR_DB.prepare(
      "UPDATE fhir_resources SET data=?, created_at=datetime('now') WHERE resource_type='Profile' AND resource_id=?"
    ).bind(JSON.stringify(updatedProfile), profileId).run();

    return { ok: true, profile: updatedProfile };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Profile Deletion ──────────────────────────────────────
export async function deleteProfile(env, profileId) {
  try {
    await env.FHIR_DB.prepare(
      "DELETE FROM fhir_resources WHERE resource_type='Profile' AND resource_id=?"
    ).bind(profileId).run();

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Profile Statistics ────────────────────────────────────
export async function getProfileStats(env) {
  try {
    const { results } = await env.FHIR_DB.prepare(
      "SELECT resource_id, data FROM fhir_resources WHERE resource_type='Profile'"
    ).all();

    const profiles = results.map(r => JSON.parse(r.data));
    const byRole = {};
    profiles.forEach(p => {
      byRole[p.role] = (byRole[p.role] || 0) + 1;
    });

    return {
      ok: true,
      stats: {
        total: profiles.length,
        byRole,
        recent: profiles.slice(0, 5).map(p => ({
          name: p.name,
          role: p.role,
          url: `https://dr.elfadil.com/${p.role}/${p.slug}`,
        })),
      },
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
