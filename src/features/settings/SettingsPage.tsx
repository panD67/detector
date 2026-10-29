import { useEffect, useMemo, useState } from 'react'
import {
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react'
import { Badge, Button, Card, Field, Input, PageHeader, Select } from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { createAdapter } from '../../lib/ai/factory'
import { clearAiCache } from '../../lib/ai/cache'
import { getPreset, PROVIDER_PRESETS } from '../../lib/ai/presets'
import { clearHistory } from '../../lib/storage/history'
import { decryptJson, encryptJson } from '../../lib/storage/crypto'
import {
  APP_SETTINGS_SCHEMA,
  clearAllSettings,
  defaultSettings,
  loadSettings,
  saveSettings,
  type AppSettings,
} from '../../lib/storage/settings'
import type { AiProfile } from '../../types/analysis'
import { uid } from '../../lib/utils'

function emptyProfile(): AiProfile {
  const preset = getPreset('gemini')!
  return {
    id: uid(),
    name: preset.label,
    kind: preset.kind,
    baseUrl: preset.baseUrl,
    model: preset.model,
    visionModel: preset.visionModel,
    apiKey: '',
    createdAt: new Date().toISOString(),
  }
}

export default function SettingsPage() {
  const { toast } = useToast()
  const initial = loadSettings()
  const [locked, setLocked] = useState(initial.locked)
  const [settings, setSettings] = useState(initial.settings)
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [draft, setDraft] = useState<AiProfile>(emptyProfile())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)

  const activeProfile = useMemo(
    () => settings.profiles.find((profile) => profile.id === settings.activeProfileId) ?? null,
    [settings],
  )

  useEffect(() => {
    if (!locked) {
      try {
        saveSettings(settings)
      } catch {
        // Validation errors are handled in form actions.
      }
    }
  }, [settings, locked])

  async function unlock(): Promise<void> {
    if (!passphrase.trim()) {
      toast({ title: 'Passphrase wajib diisi', variant: 'error' })
      return
    }
    try {
      const raw = window.localStorage.getItem('hoaxlab:settings')
      if (!raw) throw new Error('Data terkunci tidak ditemukan.')
      const decrypted = await decryptJson<AppSettings>(raw, passphrase)
      const validated = APP_SETTINGS_SCHEMA.parse(decrypted)
      setSettings(validated)
      setLocked(false)
      setPassphrase('')
      toast({ title: 'Data berhasil dibuka', variant: 'success' })
    } catch {
      toast({
        title: 'Passphrase salah atau data rusak',
        variant: 'error',
      })
    }
  }

  async function lockData(): Promise<void> {
    if (!passphrase.trim()) {
      toast({ title: 'Masukkan passphrase untuk mengunci', variant: 'error' })
      return
    }
    try {
      const payload = await encryptJson(settings, passphrase)
      window.localStorage.setItem('hoaxlab:settings', payload)
      setLocked(true)
      setPassphrase('')
      toast({
        title: 'Data terkunci',
        description: 'Passphrase diperlukan untuk membuka kembali.',
        variant: 'success',
      })
    } catch {
      toast({ title: 'Gagal mengunci data', variant: 'error' })
    }
  }

  function applyPreset(presetId: string): void {
    const selected = getPreset(presetId)
    if (!selected) return
    setDraft((current) => ({
      ...current,
      name: selected.label,
      kind: selected.kind,
      baseUrl: selected.baseUrl,
      model: selected.model,
      visionModel: selected.visionModel,
    }))
  }

  function saveProfile(): void {
    if (!draft.name.trim() || !draft.model.trim() || !draft.apiKey.trim()) {
      toast({
        title: 'Lengkapi nama, model, dan API key',
        variant: 'error',
      })
      return
    }

    const profile = { ...draft, createdAt: draft.createdAt || new Date().toISOString() }
    setSettings((current) => {
      const exists = current.profiles.some((item) => item.id === profile.id)
      const profiles = exists
        ? current.profiles.map((item) => (item.id === profile.id ? profile : item))
        : [...current.profiles, profile]
      return {
        ...current,
        profiles,
        activeProfileId: current.activeProfileId ?? profile.id,
      }
    })
    setDraft(emptyProfile())
    setEditingId(null)
    setShowKey(false)
    toast({ title: 'Profil disimpan', variant: 'success' })
  }

  function editProfile(profile: AiProfile): void {
    setDraft(profile)
    setEditingId(profile.id)
    setShowKey(false)
  }

  function deleteProfile(id: string): void {
    setSettings((current) => ({
      ...current,
      profiles: current.profiles.filter((profile) => profile.id !== id),
      activeProfileId:
        current.activeProfileId === id
          ? current.profiles.find((profile) => profile.id !== id)?.id ?? null
          : current.activeProfileId,
    }))
    toast({ title: 'Profil dihapus', variant: 'info' })
  }

  async function testConnection(): Promise<void> {
    if (!draft.apiKey.trim() || !draft.model.trim()) {
      toast({ title: 'Isi API key dan model terlebih dahulu', variant: 'error' })
      return
    }
    setTesting(true)
    try {
      const adapter = createAdapter(draft)
      const response = await adapter.analyze({
        system: 'Balas hanya dengan JSON valid.',
        user: 'Kembalikan {"ok":true,"provider":"test"}.',
        jsonMode: true,
        timeoutMs: 30_000,
      })
      toast({
        title: 'Koneksi berhasil',
        description: response.text.slice(0, 120),
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Koneksi gagal',
        description: error instanceof Error ? error.message : 'Kesalahan tidak dikenal.',
        variant: 'error',
      })
    } finally {
      setTesting(false)
    }
  }

  function deleteAllData(): void {
    clearAllSettings()
    clearAiCache()
    void clearHistory()
    setSettings(defaultSettings())
    setLocked(false)
    toast({ title: 'Semua data lokal dihapus', variant: 'success' })
  }

  if (locked) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Konfigurasi"
          title="Pengaturan terkunci"
          description="Data pengaturan dienkripsi. Masukkan passphrase untuk membuka."
          icon={<Lock className="h-5 w-5" aria-hidden="true" />}
        />
        <Card className="max-w-md p-5">
          <Field
            label="Passphrase"
            hint="Passphrase tidak disimpan. Jika lupa, data tidak bisa dipulihkan."
          >
            <div className="relative">
              <Input
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
                placeholder="Masukkan passphrase"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                onClick={() => setShowPassphrase((value) => !value)}
                aria-label={showPassphrase ? 'Sembunyikan passphrase' : 'Tampilkan passphrase'}
              >
                {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Button className="mt-4" onClick={() => void unlock()}>
            Buka kunci
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Konfigurasi"
        title="Pengaturan"
        description="Hubungkan provider AI dengan API key milikmu. Konfigurasi disimpan lokal dan tidak dikirim ke server HoaxLab."
        icon={<Settings className="h-5 w-5" aria-hidden="true" />}
        actions={<Badge variant="brand">{settings.profiles.length} profil</Badge>}
      />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-white">
              {editingId ? 'Edit profil' : 'Tambah profil'}
            </h2>
            {editingId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft(emptyProfile())
                  setEditingId(null)
                }}
              >
                Batal
              </Button>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Preset provider">
              <Select
                value={PROVIDER_PRESETS.find((item) => item.kind === draft.kind)?.id ?? 'custom'}
                onChange={(event) => applyPreset(event.target.value)}
              >
                {PROVIDER_PRESETS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nama profil">
              <Input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="Profil utama"
              />
            </Field>
            <Field label="Base URL">
              <Input
                value={draft.baseUrl ?? ''}
                onChange={(event) => setDraft({ ...draft, baseUrl: event.target.value })}
                placeholder="https://api.example.com/v1"
              />
            </Field>
            <Field label="Model teks">
              <Input
                value={draft.model}
                onChange={(event) => setDraft({ ...draft, model: event.target.value })}
                placeholder="nama-model"
              />
            </Field>
            <Field label="Model vision" hint="Kosongkan jika provider tidak mendukung vision.">
              <Input
                value={draft.visionModel ?? ''}
                onChange={(event) => setDraft({ ...draft, visionModel: event.target.value })}
                placeholder="nama-model-vision"
              />
            </Field>
            <Field label="API key">
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={draft.apiKey}
                  onChange={(event) => setDraft({ ...draft, apiKey: event.target.value })}
                  placeholder="sk-..."
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() => setShowKey((value) => !value)}
                  aria-label={showKey ? 'Sembunyikan API key' : 'Tampilkan API key'}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={saveProfile}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {editingId ? 'Simpan perubahan' : 'Tambah profil'}
            </Button>
            <Button variant="secondary" loading={testing} onClick={() => void testConnection()}>
              Test koneksi
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-400/20 bg-brand-400/[0.07] text-brand-300">
              <KeyRound className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-sm font-bold text-white">Profil aktif</h2>
            {activeProfile ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold text-white">{activeProfile.name}</p>
                <p className="text-xs text-slate-400">
                  {activeProfile.model} · {activeProfile.kind}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={activeProfile.visionModel ? 'brand' : 'neutral'}>
                    Vision {activeProfile.visionModel ? 'aktif' : 'tidak'}
                  </Badge>
                  <Badge variant="neutral">Web search {activeProfile.kind === 'gemini' ? 'aktif' : 'terbatas'}</Badge>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Belum ada profil aktif. Tambahkan profil dan test koneksi.
              </p>
            )}
          </Card>

          <Card className="p-4">
            <p className="text-[11px] leading-relaxed text-slate-400">
              API key disimpan di browser. Jangan gunakan perangkat bersama tanpa mengunci data.
            </p>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-sm font-bold text-white">Daftar profil</h2>
        </div>
        {settings.profiles.length === 0 ? (
          <div className="p-5 text-xs text-slate-400">Belum ada profil.</div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {settings.profiles.map((profile) => (
              <div key={profile.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{profile.name}</p>
                    {settings.activeProfileId === profile.id && (
                      <Badge variant="brand" dot>
                        Aktif
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {profile.kind} · {profile.model}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setSettings((current) => ({ ...current, activeProfileId: profile.id }))
                    }
                  >
                    Jadikan aktif
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => editProfile(profile)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => deleteProfile(profile.id)}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-bold text-white">Kunci data</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Enkripsi semua pengaturan dengan passphrase. Data tidak bisa dibuka tanpa passphrase.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              type="password"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              placeholder="Passphrase"
            />
            <Button onClick={() => void lockData()}>Kunci</Button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold text-white">Hapus semua data</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Menghapus profil, riwayat, cache AI, dan pengaturan dari browser ini.
          </p>
          <Button variant="danger" className="mt-4" onClick={deleteAllData}>
            Hapus semua
          </Button>
        </Card>
      </div>
    </div>
  )
}
