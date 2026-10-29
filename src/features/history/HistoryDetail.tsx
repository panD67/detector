import { Badge, Button, Card, Progress } from '../../components/ui'
import type { AnalysisResult } from '../../types/analysis'
import { formatDate } from '../../lib/utils'

export default function HistoryDetail({
  result,
  onDelete,
}: {
  result: AnalysisResult
  onDelete: () => void
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="neutral">{result.type}</Badge>
          <h2 className="mt-3 text-xl font-extrabold tracking-tight text-white">{result.title}</h2>
          <p className="mt-1 text-xs text-slate-400">{formatDate(result.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-4xl font-extrabold text-white">{result.score}</p>
          <p className="text-xs text-slate-400">{result.confidence}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">{result.summary}</p>

      <div className="mt-5 space-y-3">
        {result.breakdown.map((item) => (
          <div key={item.key}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">{item.label}</span>
              <span className="font-mono text-slate-400">{item.available ? item.score : 'n/a'}</span>
            </div>
            <Progress value={item.available ? item.score : 0} tone="medium" className="mt-1" />
          </div>
        ))}
      </div>

      {result.type === 'link' && result.claims.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-bold text-white">Klaim</h3>
          <div className="mt-3 space-y-2">
            {result.claims.map((claim) => (
              <div key={claim.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-xs font-semibold text-slate-200">{claim.text}</p>
                <p className="mt-1 text-[11px] text-slate-400">{claim.assessment}: {claim.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.type === 'comment' && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[11px] text-slate-400">Total</p>
            <p className="font-mono text-lg text-white">{result.totalComments}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[11px] text-slate-400">Duplikat</p>
            <p className="font-mono text-lg text-white">{result.duplicatePercent.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {result.type === 'image' && (
        <div className="mt-5">
          <img src={result.preview} alt="Pratinjau" className="max-h-56 rounded-xl border border-white/[0.07] object-contain" />
          {result.ocrText && (
            <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-slate-400">{result.ocrText}</p>
          )}
        </div>
      )}

      {result.findings.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-bold text-white">Temuan</h3>
          <div className="mt-3 space-y-2">
            {result.findings.map((finding) => (
              <div key={finding.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-xs font-semibold text-slate-200">{finding.title}</p>
                <p className="mt-1 text-[11px] text-slate-400">{finding.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.evidence.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-bold text-white">Bukti</h3>
          <div className="mt-3 space-y-2">
            {result.evidence.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-brand-300"
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 text-[11px] leading-relaxed text-slate-400">
        Mode {result.meta.mode}, provider {result.meta.providerLabel ?? '-'}, model {result.meta.model ?? '-'}, prompt {result.meta.promptVersion ?? '-'}, kalibrasi {result.meta.calibrationVersion ?? '-'}, durasi {result.meta.durationMs ?? 0} ms.
      </div>

      <div className="mt-5">
        <Button variant="danger" size="sm" onClick={onDelete}>
          Hapus item
        </Button>
      </div>
    </Card>
  )
}
