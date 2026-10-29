import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value))
}

function clickbaitScore(title) {
  let score = 0
  if (/\b(heboh|viral|ternyata|bongkar|rahasia|shocking|gila|parah)\b/i.test(title)) score += 0.22
  if (/[!?]{2,}/.test(title)) score += 0.22
  if (title.length > 110) score += 0.12
  if (title === title.toUpperCase() && title.length > 12) score += 0.18
  return Math.min(1, score)
}

function domainReputation(hostname) {
  const registry = readJson(join(ROOT, 'src/data/domains.json'))
  const entry = registry.domains.find(
    (item) => hostname === item.domain || hostname.endsWith(`.${item.domain}`),
  )
  return entry ? entry.reputation : 0.5
}

function classifyPageType(url, title, text) {
  const haystack = `${url} ${title} ${text}`.toLowerCase()
  if (/(cek fakta|fact check|hoaks|hoax|klarifikasi)/.test(haystack)) return 'fact-check'
  if (/(satire|parodi|humor)/.test(haystack)) return 'satire'
  if (/(opini|pendapat|editorial)/.test(haystack)) return 'opinion'
  if (/(promo|diskon|jual|beli)/.test(haystack)) return 'promotion'
  if (text.length > 500) return 'news'
  return 'unknown'
}

function computeLinkRisk(item) {
  const hostname = new URL(item.url).hostname.replace(/^www\./, '')
  const reputation = domainReputation(hostname)
  const clickbait = clickbaitScore(item.title)
  const pageType = classifyPageType(item.url, item.title, item.text)
  const pageTypeRisk =
    pageType === 'fact-check'
      ? 0.1
      : pageType === 'satire'
        ? 0.45
        : pageType === 'opinion'
          ? 0.35
          : pageType === 'promotion'
            ? 0.75
            : pageType === 'news'
              ? 0.45
              : 0.6
  const features = {
    domainRisk: 1 - reputation,
    pageTypeRisk,
    claimSupportRisk: 0.5,
    stanceConsistencyRisk: 0.5,
    internalStyleRisk: Math.min(1, clickbait),
    recencyRisk: 0.4,
    mediaProvenanceRisk: 0.5,
    aiAssessmentRisk: 0.45,
  }
  const weights = {
    domainRisk: 0.16,
    pageTypeRisk: 0.10,
    claimSupportRisk: 0.22,
    stanceConsistencyRisk: 0.20,
    internalStyleRisk: 0.10,
    recencyRisk: 0.08,
    mediaProvenanceRisk: 0.08,
    aiAssessmentRisk: 0.06,
  }
  let z = -1.15
  for (const key of Object.keys(weights)) {
    z += weights[key] * features[key]
  }
  return Math.round(sigmoid(z) * 100)
}

function metrics(rows) {
  let tp = 0
  let fp = 0
  let tn = 0
  let fn = 0
  for (const row of rows) {
    if (row.predicted && row.expected) tp += 1
    else if (row.predicted && !row.expected) fp += 1
    else if (!row.predicted && !row.expected) tn += 1
    else fn += 1
  }
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp)
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn)
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)
  return { tp, fp, tn, fn, precision, recall, f1 }
}

const linkData = readJson(join(ROOT, 'data/eval/link-seed.json'))
const linkRows = linkData.map((item) => {
  const score = computeLinkRisk(item)
  const predicted =
    score >= 40 ||
    clickbaitScore(item.title) >= 0.35 ||
    (domainReputation(new URL(item.url).hostname.replace(/^www\./, '')) === 0.5 && item.text.length < 200)
  return {
    id: item.id,
    expected: item.label === 'hoax',
    predicted,
    score,
  }
})
const linkMetrics = metrics(linkRows)

const commentData = readJson(join(ROOT, 'data/eval/comment-seed.json'))
const commentRows = commentData.map((thread) => {
  const unique = new Set(thread.comments).size
  const duplicatePercent = ((thread.comments.length - unique) / thread.comments.length) * 100
  const spamCount = thread.comments.filter((text) =>
    /(judi|slot|promo|gratis|klik|bio)/i.test(text),
  ).length
  const spamPercent = (spamCount / thread.comments.length) * 100
  const score = Math.round(
    Math.min(100, duplicatePercent * 1.2 + spamPercent * 1.5 + (thread.comments.length >= 6 ? 10 : 0)),
  )
  return {
    id: thread.id,
    expected: thread.label === 'coordinated',
    predicted: score >= 50,
    score,
  }
})
const commentMetrics = metrics(commentRows)

const imageData = readJson(join(ROOT, 'data/eval/image-seed.json'))
const imageRows = imageData.map((item) => {
  const exifRisk = item.exifPresent ? 0.15 : 0.35
  const aiRisk = item.aiGeneratedLikelihood ?? 0.45
  const contextRisk = item.context ? 0.35 : 0.55
  const score = Math.round((exifRisk * 0.2 + aiRisk * 0.5 + contextRisk * 0.3) * 100)
  return {
    id: item.id,
    expected: item.label !== 'authentic',
    predicted: score >= 45,
    score,
  }
})
const imageMetrics = metrics(imageRows)

const report = `# Laporan Evaluasi Seed

Tanggal: ${new Date().toISOString().slice(0, 10)}

Dataset ini adalah seed kecil untuk pengujian harness. Belum menggantikan dataset penuh.

## Link

| Metrik | Nilai |
|---|---:|
| Item | ${linkRows.length} |
| Precision | ${linkMetrics.precision.toFixed(3)} |
| Recall | ${linkMetrics.recall.toFixed(3)} |
| F1 | ${linkMetrics.f1.toFixed(3)} |
| TP/FP/TN/FN | ${linkMetrics.tp}/${linkMetrics.fp}/${linkMetrics.tn}/${linkMetrics.fn} |

## Komentar

| Metrik | Nilai |
|---|---:|
| Thread | ${commentRows.length} |
| Precision | ${commentMetrics.precision.toFixed(3)} |
| Recall | ${commentMetrics.recall.toFixed(3)} |
| F1 | ${commentMetrics.f1.toFixed(3)} |
| TP/FP/TN/FN | ${commentMetrics.tp}/${commentMetrics.fp}/${commentMetrics.tn}/${commentMetrics.fn} |

## Foto

| Metrik | Nilai |
|---|---:|
| Item | ${imageRows.length} |
| Precision | ${imageMetrics.precision.toFixed(3)} |
| Recall | ${imageMetrics.recall.toFixed(3)} |
| F1 | ${imageMetrics.f1.toFixed(3)} |
| TP/FP/TN/FN | ${imageMetrics.tp}/${imageMetrics.fp}/${imageMetrics.tn}/${imageMetrics.fn} |

## Catatan

- Dataset seed belum cukup untuk klaim akurasi rilis.
- Fitur AI tidak dijalankan pada harness ini.
- Target rilis tetap mengikuti tabel 7.4 pada plan.md.
`

writeFileSync(join(ROOT, 'docs/eval-report.md'), report)
writeFileSync(
  join(ROOT, 'data/calibration.json'),
  JSON.stringify(
    {
      version: '2026.1-seed',
      date: new Date().toISOString().slice(0, 10),
      weights: {
        link: {
          domainRisk: 0.16,
          pageTypeRisk: 0.10,
          claimSupportRisk: 0.22,
          stanceConsistencyRisk: 0.20,
          internalStyleRisk: 0.10,
          recencyRisk: 0.08,
          mediaProvenanceRisk: 0.08,
          aiAssessmentRisk: 0.06,
        },
      },
      metrics: {
        linkF1: linkMetrics.f1,
        commentF1: commentMetrics.f1,
        imageF1: imageMetrics.f1,
      },
    },
    null,
    2,
  ),
)

console.log('Eval report written to docs/eval-report.md')
console.log(`Link F1=${linkMetrics.f1.toFixed(3)} Comment F1=${commentMetrics.f1.toFixed(3)} Image F1=${imageMetrics.f1.toFixed(3)}`)