// ═══════════════════════════════════════════════════════════
// BASMA HuggingFace Integration
// Cloudflare Workers AI + HuggingFace Inference API + Fadil369 Medical Models
// Medical · Arabic · Vision · Speech · Embeddings
// ═══════════════════════════════════════════════════════════

// ── Fadil369 Medical Models (Private HF Repos) ────────────
export const FADIL369_MODELS = {
  "meditron": {
    repo: "Fadil369/meditron-clinical-guidelines-bucket",
    endpoint: "https://huggingface.co/api/models/Fadil369/meditron-clinical-guidelines-bucket",
    description: "Meditron clinical guidelines — Saudi clinical decision support",
    fallback: "epfl-llm/meditron-7b",
    task: "medical-guidelines",
    ar: "دليل سريري — دعم القرار الطبي السعودي",
  },
  "llava-med": {
    repo: "Fadil369/llava-med-v1.5-mistral-7b-bucket",
    endpoint: "https://huggingface.co/api/models/Fadil369/llava-med-v1.5-mistral-7b-bucket",
    description: "LLaVA-Med medical imaging QA — radiology analysis",
    fallback: "microsoft/llava-med-v1.5-mistral-7b",
    task: "medical-vision",
    ar: "تحليل الصور الطبية — الأشعة",
  },
  "medical-qa": {
    repo: "Fadil369/medical-question-answering-datasets",
    endpoint: "https://huggingface.co/api/models/Fadil369/medical-question-answering-datasets",
    description: "Medical QA datasets — clinical question answering",
    fallback: "medalpaca/medical_meadow_medqa",
    task: "medical-qa",
    ar: "أسئلة طبية — إجابات سريرية",
  },
};

// ── Model Registry ────────────────────────────────────────
export const HF_MODELS = {
  // Text Generation (via Cloudflare Workers AI)
  "llama-3.3-70b": { cf: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", task: "text-generation", desc: "Best quality Llama" },
  "llama-3.1-8b": { cf: "@cf/meta/llama-3.1-8b-instruct-fp8", task: "text-generation", desc: "Fast Llama" },
  "llama-3.2-3b": { cf: "@cf/meta/llama-3.2-3b-instruct", task: "text-generation", desc: "Lightweight Llama" },
  "llama-3.2-1b": { cf: "@cf/meta/llama-3.2-1b-instruct", task: "text-generation", desc: "Ultra-light Llama" },
  "deepseek-r1": { cf: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", task: "text-generation", desc: "DeepSeek reasoning" },
  "mistral-7b": { cf: "@cf/mistral/mistral-7b-instruct-v0.2-lora", task: "text-generation", desc: "Mistral instruct" },
  "gemma-2b": { cf: "@cf/google/gemma-2b-it-lora", task: "text-generation", desc: "Google Gemma" },
  "kimi-k2.6": { cf: "@cf/moonshotai/kimi-k2.6", task: "text-generation", desc: "Moonshot Kimi" },
  "glm-4.7": { cf: "@cf/zai-org/glm-4.7-flash", task: "text-generation", desc: "Zhipu GLM" },
  "granite-4.0": { cf: "@cf/ibm-granite/granite-4.0-h-micro", task: "text-generation", desc: "IBM Granite" },
  "gpt-oss-120b": { cf: "@cf/openai/gpt-oss-120b", task: "text-generation", desc: "OpenAI OSS 120B" },

  // Embeddings
  "bge-m3": { cf: "@cf/baai/bge-m3", task: "embeddings", desc: "BAAI BGE-M3 embeddings" },
  "qwen3-embed": { cf: "@cf/qwen/qwen3-embedding-0.6b", task: "embeddings", desc: "Qwen3 embeddings" },
  "plamo-embed": { cf: "@cf/pfnet/plamo-embedding-1b", task: "embeddings", desc: "PFLNet embeddings" },

  // Vision
  "llava-1.5": { cf: "@cf/llava-hf/llava-1.5-7b-hf", task: "image-to-text", desc: "LLaVA vision model" },
  "resnet-50": { cf: "@cf/microsoft/resnet-50", task: "image-classification", desc: "Image classification" },

  // Speech
  "whisper": { cf: "@cf/openai/whisper", task: "speech-recognition", desc: "OpenAI Whisper STT" },
  "nova-3": { cf: "@cf/deepgram/nova-3", task: "speech-recognition", desc: "Deepgram Nova 3" },
  "flux": { cf: "@cf/deepgram/flux", task: "speech-recognition", desc: "Deepgram Flux" },
  "melotts": { cf: "@cf/myshell-ai/melotts", task: "text-to-speech", desc: "MeloTTS" },
  "aura-es": { cf: "@cf/deepgram/aura-2-es", task: "text-to-speech", desc: "Deepgram Aura Spanish" },

  // Image Generation
  "flux-schnell": { cf: "@cf/black-forest-labs/flux-1-schnell", task: "text-to-image", desc: "FLUX image gen" },
  "flux-klein": { cf: "@cf/black-forest-labs/flux-2-klein-9b", task: "text-to-image", desc: "FLUX Klein" },
  "sdxl-lightning": { cf: "@cf/bytedance/stable-diffusion-xl-lightning", task: "text-to-image", desc: "SDXL Lightning" },
  "sd-v1.5-inpaint": { cf: "@cf/runwayml/stable-diffusion-v1-5-inpainting", task: "text-to-image", desc: "SD inpainting" },
  "dreamshaper": { cf: "@cf/lykon/dreamshaper-8-lcm", task: "text-to-image", desc: "DreamShaper" },

  // Safety
  "llama-guard": { cf: "@cf/meta/llama-guard-3-8b", task: "text-generation", desc: "Llama Guard safety" },
};

// ── Medical-Specific Models ───────────────────────────────
export const MEDICAL_MODELS = {
  "clinical-summary": { model: "llama-3.3-70b", systemPrompt: "You are a clinical summarization expert. Extract key medical information and present it in structured format." },
  "drug-interaction": { model: "llama-3.3-70b", systemPrompt: "You are a clinical pharmacist. Analyze drug interactions and provide safety recommendations." },
  "diagnosis-support": { model: "deepseek-r1", systemPrompt: "You are a diagnostic reasoning expert. Analyze symptoms and suggest differential diagnoses." },
  "lab-interpretation": { model: "llama-3.3-70b", systemPrompt: "You are a laboratory medicine specialist. Interpret lab results in clinical context." },
  "radiology-report": { model: "llama-3.3-70b", systemPrompt: "You are a radiology AI assistant. Analyze imaging findings and generate structured reports." },
  "arabic-medical": { model: "llama-3.3-70b", systemPrompt: "أنت خبير طبي متخصص. قدم إجابات طبية دقيقة باللغة العربية." },
};

// ── Arabic-Specific Models ────────────────────────────────
export const ARABIC_MODELS = {
  "arabic-chat": { model: "llama-3.3-70b", systemPrompt: "أنت مساعد ذكي متخصص باللغة العربية. تجاوب بالعربية الفصحى أو حسب لهجة المستخدم." },
  "arabic-medical": { model: "llama-3.3-70b", systemPrompt: "أنت طبيب افتراضي متخصص. قدم نصائح طبية بالعربية مع مراعاة اللهجة السعودية." },
  "arabic-legal": { model: "llama-3.3-70b", systemPrompt: "أنت خبير قانوني متخصص بالأنظمة السعودية. أجب بالعربية." },
  "arabic-business": { model: "llama-3.3-70b", systemPrompt: "أنت مستشار أعمال متخصص بالسوق السعودي. قدم نصائح بالعربية." },
};

// ── HuggingFace Inference API ─────────────────────────────
const HF_API = "https://api-inference.huggingface.co/models";

export async function callHuggingFace(modelId, inputs, apiKey, opts = {}) {
  if (!apiKey) return { ok: false, error: "HUGGINGFACE_API_KEY not configured" };

  const url = `${HF_API}/${modelId}`;
  const body = {
    inputs,
    parameters: {
      max_new_tokens: opts.maxTokens || 500,
      temperature: opts.temperature || 0.7,
      top_p: opts.topP || 0.9,
      do_sample: opts.temperature > 0,
      return_full_text: false,
      ...opts.parameters,
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      return { ok: false, error: `HF API error: ${res.status} ${err}` };
    }

    const data = await res.json();
    const text = Array.isArray(data) ? data[0]?.generated_text || data[0]?.text || "" : data?.generated_text || data?.text || "";

    return { ok: true, text, model: modelId, raw: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Cloudflare Workers AI Model Runner ────────────────────
export async function runCFModel(env, modelKey, messages, opts = {}) {
  const model = HF_MODELS[modelKey];
  if (!model) return { ok: false, error: `Unknown model: ${modelKey}` };
  if (!env.AI) return { ok: false, error: "Workers AI binding not available" };

  try {
    const result = await env.AI.run(model.cf, {
      messages,
      max_tokens: opts.maxTokens || 1500,
      temperature: opts.temperature || 0.7,
      stream: false,
    });

    const text = typeof result.response === "string" ? result.response
      : result.response?.response || result.response?.choices?.[0]?.message?.content
      || result.choices?.[0]?.message?.content || JSON.stringify(result);

    return { ok: true, text, model: modelKey, cfModel: model.cf };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Embeddings ────────────────────────────────────────────
export async function getEmbeddings(env, texts, modelKey = "bge-m3") {
  const model = HF_MODELS[modelKey];
  if (!model || model.task !== "embeddings") return { ok: false, error: "Not an embeddings model" };
  if (!env.AI) return { ok: false, error: "Workers AI binding not available" };

  try {
    const result = await env.AI.run(model.cf, {
      text: Array.isArray(texts) ? texts : [texts],
    });

    return {
      ok: true,
      embeddings: result.data || result,
      model: modelKey,
      dimensions: result.data?.[0]?.length || 0,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Vision (Image Analysis) ───────────────────────────────
export async function analyzeImage(env, imageUrl, prompt = "Describe this image") {
  if (!env.AI) return { ok: false, error: "Workers AI binding not available" };

  try {
    // Fetch image
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();

    const result = await env.AI.run("@cf/llava-hf/llava-1.5-7b-hf", {
      image: [...new Uint8Array(imgBuffer)],
      prompt,
      max_tokens: 500,
    });

    return {
      ok: true,
      description: result.description || result.response || JSON.stringify(result),
      model: "llava-1.5",
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Speech-to-Text (Whisper) ──────────────────────────────
export async function transcribeAudio(env, audioBuffer, language = "auto") {
  if (!env.AI) return { ok: false, error: "Workers AI binding not available" };

  try {
    const result = await env.AI.run("@cf/openai/whisper", {
      audio: [...new Uint8Array(audioBuffer)],
      language: language === "auto" ? undefined : language,
    });

    return {
      ok: true,
      text: result.text || "",
      language: result.language || language,
      segments: result.segments || [],
      model: "whisper",
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Text-to-Speech ────────────────────────────────────────
export async function generateSpeech(env, text, voice = "default") {
  if (!env.AI) return { ok: false, error: "Workers AI binding not available" };

  try {
    const result = await env.AI.run("@cf/myshell-ai/melotts", {
      text,
      voice,
    });

    return {
      ok: true,
      audio: result.audio || result,
      model: "melotts",
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Image Generation ──────────────────────────────────────
export async function generateImage(env, prompt, modelKey = "flux-schnell", opts = {}) {
  const model = HF_MODELS[modelKey];
  if (!model || model.task !== "text-to-image") return { ok: false, error: "Not an image generation model" };
  if (!env.AI) return { ok: false, error: "Workers AI binding not available" };

  try {
    const result = await env.AI.run(model.cf, {
      prompt,
      num_steps: opts.steps || 4,
      guidance_scale: opts.guidance || 7.5,
      width: opts.width || 1024,
      height: opts.height || 1024,
    });

    return {
      ok: true,
      image: result.image || result,
      model: modelKey,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Semantic Search (Embeddings + Cosine Similarity) ──────
export async function semanticSearch(env, query, documents, topK = 5) {
  // Get embeddings for query and documents
  const allTexts = [query, ...documents];
  const embeddings = await getEmbeddings(env, allTexts, "bge-m3");

  if (!embeddings.ok) return embeddings;

  const queryEmbedding = embeddings.embeddings[0];
  const docEmbeddings = embeddings.embeddings.slice(1);

  // Calculate cosine similarity
  const scores = docEmbeddings.map((docEmb, i) => ({
    index: i,
    document: documents[i],
    score: cosineSimilarity(queryEmbedding, docEmb),
  }));

  // Sort by score and return top K
  scores.sort((a, b) => b.score - a.score);

  return {
    ok: true,
    results: scores.slice(0, topK),
    query,
    total: documents.length,
  };
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ── Smart Model Router ────────────────────────────────────
export function selectModel(task, lang = "en") {
  const taskMap = {
    "medical-summary": "llama-3.3-70b",
    "drug-interaction": "llama-3.3-70b",
    "diagnosis": "deepseek-r1",
    "lab-interpretation": "llama-3.3-70b",
    "radiology": "llama-3.3-70b",
    "arabic-chat": "llama-3.3-70b",
    "arabic-medical": "llama-3.3-70b",
    "general": "llama-3.3-70b",
    "fast": "llama-3.2-3b",
    "light": "llama-3.2-1b",
    "reasoning": "deepseek-r1",
    "embedding": "bge-m3",
    "vision": "llava-1.5",
    "stt": "whisper",
    "tts": "melotts",
    "image-gen": "flux-schnell",
  };

  return taskMap[task] || (lang === "ar" ? "llama-3.3-70b" : "llama-3.3-70b");
}

// ── Model Health Check ────────────────────────────────────
export async function checkModelHealth(env) {
  const results = {};

  // Check Workers AI
  if (env.AI) {
    try {
      const start = Date.now();
      await env.AI.run("@cf/meta/llama-3.2-1b-instruct", {
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5,
      });
      results.workers_ai = { ok: true, latency: Date.now() - start };
    } catch (err) {
      results.workers_ai = { ok: false, error: err.message };
    }
  } else {
    results.workers_ai = { ok: false, error: "No AI binding" };
  }

  return results;
}

// ── Available Models List ─────────────────────────────────
export function listModels() {
  const cfModels = Object.entries(HF_MODELS).map(([key, model]) => ({
    key,
    id: model.cf,
    task: model.task,
    description: model.desc,
    source: "cloudflare",
  }));

  const medicalModels = Object.entries(FADIL369_MODELS).map(([key, model]) => ({
    key,
    id: model.repo,
    task: model.task,
    description: model.description,
    ar: model.ar,
    source: "fadil369",
  }));

  return [...cfModels, ...medicalModels];
}

// ── Fadil369 Medical Model Checker ────────────────────────
export async function checkFadil369Models(env) {
  const results = {};
  const hfToken = env?.HUGGINGFACE_API_KEY || env?.HF_TOKEN || "";

  for (const [modelId, cfg] of Object.entries(FADIL369_MODELS)) {
    const cached = _getCached(`fadil369_${modelId}`);
    if (cached) { results[modelId] = cached; continue; }

    // Try primary (private) endpoint
    let result = await _tryHFEndpoint(cfg.endpoint, cfg.repo, modelId, cfg.description, hfToken);

    // If 401 and fallback exists, try public fallback
    if (result.http_status === 401 && cfg.fallback) {
      const fallbackUrl = `https://huggingface.co/api/models/${cfg.fallback}`;
      const fallbackResult = await _tryHFEndpoint(fallbackUrl, cfg.fallback, modelId, cfg.description, "");
      if (fallbackResult.accessible) {
        fallbackResult.note = `Using fallback ${cfg.fallback} (primary repo needs HF_TOKEN)`;
        result = fallbackResult;
      }
    }

    _setCached(`fadil369_${modelId}`, result, result.accessible ? 1800 : 300);
    results[modelId] = result;
  }

  return results;
}

async function _tryHFEndpoint(endpoint, repo, modelId, description, token) {
  try {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(endpoint, { headers });
    if (!res.ok) {
      return {
        status: "error",
        model: modelId,
        repo,
        accessible: false,
        http_status: res.status,
        message: `HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      status: "ok",
      model: modelId,
      repo,
      description,
      accessible: true,
      private: data.private || false,
      downloads: data.downloads || 0,
      likes: data.likes || 0,
    };
  } catch (err) {
    return {
      status: "error",
      model: modelId,
      repo,
      accessible: false,
      message: err.message,
    };
  }
}

// ── Simple Cache ──────────────────────────────────────────
const _cache = {};
function _getCached(key) {
  const entry = _cache[key];
  if (entry && Date.now() - entry.ts < entry.ttl * 1000) return entry.value;
  return null;
}
function _setCached(key, value, ttlSeconds) {
  _cache[key] = { value, ts: Date.now(), ttl: ttlSeconds };
}

// ── Fadil369 Medical Inference ────────────────────────────
export async function callFadil369Model(env, modelId, query, opts = {}) {
  const cfg = FADIL369_MODELS[modelId];
  if (!cfg) return { ok: false, error: `Unknown Fadil369 model: ${modelId}` };

  // For now, fall back to Cloudflare Workers AI with medical system prompt
  // In production, this would call the actual HuggingFace Inference API
  const systemPrompts = {
    "meditron": "You are Meditron, a clinical guidelines AI. Provide evidence-based medical recommendations following Saudi MOH and international clinical guidelines. Always cite the source guideline.",
    "llava-med": "You are LLaVA-Med, a medical imaging analysis AI. Analyze medical images and provide detailed radiology reports with findings, impressions, and recommendations.",
    "medical-qa": "You are a medical question answering system. Provide accurate, evidence-based answers to clinical questions. Cite relevant medical literature when possible.",
  };

  const systemPrompt = systemPrompts[modelId] || "You are a medical AI assistant.";
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ];

  // Use Cloudflare Workers AI as the inference backend
  return runCFModel(env, "llama-3.3-70b", messages, opts);
}

// ── Fadil369 Model Health ─────────────────────────────────
export async function getFadil369Status() {
  return Object.entries(FADIL369_MODELS).map(([key, cfg]) => ({
    key,
    repo: cfg.repo,
    description: cfg.description,
    ar: cfg.ar,
    fallback: cfg.fallback,
    task: cfg.task,
  }));
}
