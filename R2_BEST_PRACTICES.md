# Brainsait Unified Ecosystem - Best Practice R2 Integration

*Updated: 2026-05-26 - Using EXISTING R2 buckets*

---

## Available R2 Buckets (21 total)

| Bucket | Recommended Use |
|--------|----------------|
| `brainsait-media` | 📸 New: User uploads, avatars |
| `brainsait-temp` | 🔄 Temp files, caches |
| `brainsait-files` | 📄 General file storage |
| `brainsait-storage` | 💾 Primary storage |
| `brainsait-documents` | 📝 PDFs, reports |
| `brainsait-contracts` | 📜 Signed contracts |
| `brainsait-backups` | 🛡️ Database backups |
| `brainsait-models` | 🤖 ML model weights |
| `brainsait-predictions` | 📊 AI predictions |
| `brainsait-radiology` | 🏥 Medical images/PACS |
| `brainsait-healthcare-media` | �🏥 Healthcare media |
| `brainsait-healthcare-files` | 🏥 Healthcare files |
| `basma-storage` | 💳 BASMA ERP files |

---

## Integration Maps

### R2 → Worker Bindings

| Worker | Bucket | Status |
|--------|--------|--------|
| `browser-r2-worker` | `brainsait-files` | Likely current |
| Media Worker (new) | `brainsait-media` | Use this |
| BASMA workers | `basma-storage` | Already configured |
| Healthcare | `brainsait-healthcare-*` | Keep as-is |

---

## Recommended Architecture

```
┌─────────────────────────────────────────────┐
│           Storage Selection               │
├─────────────────────────────────────────────┤
│                                             │
│  Upload Request                             │
│  │                                          │
│  ├─ User Avatar/Photo   → brainsait-media   │
│  ├─ Document/PDF       → brainsait-documents│
│  ├─ Contract          → brainsait-contracts │
│  ├─ Backup            → brainsait-backups   │
│  ├─ ML Model          → brainsait-models   │
│  └─ Temp/Cache        → brainsait-temp      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Bucket Organization
- **Per-purpose**: Don't lump everything in one bucket
- **Retention policies**: Auto-expire temp files
- **Class usage**: Use Standard for frequent access, IA for archives

### 2. Naming Conventions
- `{org}-{department}-{type}`
- Examples:
  - `brainsait-contracts-signed-2025`
  - `basma-invoices-2025-q4`

### 3. Lifecycle Rules
```toml
# wrangler.toml lifecycle example
[[.lifecycle.rules]]
  prefix = "temp/"
  expire_after = "7d"  # Auto-delete after 7 days
```

---

## Usage by Service

### Healthcare (HIPAA considerations)
- `brainsait-healthcare-files` - PHI documents
- `brainsait-radiology` - DICOM PACS
- Note: Enable CORS, encryption at rest

### BASMA ERP
- `basma-storage` - Invoices, receipts
- Access via existing BASMA workers

### AI/ML Pipeline
- `brainsait-models` - Model weights
- `brainsait-predictions` - Output cache
- `brainsait-training-data` - Training datasets

---

*R2 Integration Best Practices - BotFather v2.1*