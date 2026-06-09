'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, X } from 'lucide-react'

type User = {
  id: string
  email: string
  name: string
  is_admin: boolean
  created_at: string
}

type BgImage = { name: string; url: string }
type Selection = Record<string, string | null>

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [bgImages, setBgImages] = useState<BgImage[]>([])
  const [bgSelection, setBgSelection] = useState<Selection>({})
  const [bgUploading, setBgUploading] = useState(false)
  const [bgSaved, setBgSaved] = useState(false)
  const [bgError, setBgError] = useState('')
  const bgInputRef = useRef<HTMLInputElement>(null)

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setUsers(data)
  }

  const loadBackgrounds = async () => {
    const res = await fetch('/api/admin/backgrounds')
    const data = await res.json()
    setBgImages(data.images ?? [])
    setBgSelection(data.selection ?? {})
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUsers(); loadBackgrounds() }, [])

  const selectBackground = async (page: string, url: string | null) => {
    const updated = { ...bgSelection, [page]: url }
    setBgSelection(updated)
    const res = await fetch('/api/admin/backgrounds', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      setBgSaved(true)
      setTimeout(() => setBgSaved(false), 2000)
    }
  }

  const uploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBgUploading(true)
    setBgError('')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/backgrounds', { method: 'POST', body: form })
    const data = await res.json()
    if (res.ok) {
      await loadBackgrounds()
    } else {
      setBgError(data.error ?? `Erreur ${res.status}`)
    }
    setBgUploading(false)
    e.target.value = ''
  }

  const deleteBackground = async (name: string) => {
    await fetch('/api/admin/backgrounds', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    await loadBackgrounds()
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, name: newName, password: newPassword }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    setSuccess(`Utilisateur ${data.name} créé`)
    setNewName(''); setNewEmail(''); setNewPassword('')
    loadUsers()
  }

  const deleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer ${name} et toutes ses données ?`)) return
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadUsers()
  }

  const logout = async () => {
    await fetch('/api/auth/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-5xl font-thin">Administration</h1>
        <button onClick={logout} className="glass-card rounded-2xl px-4 py-2 text-sm hover:text-red-400 transition-all">
          Déconnexion
        </button>
      </div>

      {/* FONDS D'ÉCRAN */}
      <div className="glass-card rounded-3xl p-6 mb-8 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Fonds d&apos;écran</h2>
          {bgSaved && <span className="text-cyan-400 text-sm">✓ Enregistré</span>}
        </div>

        {/* Upload */}
        <div className="mb-5">
          <input ref={bgInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadBackground} />
          <button
            onClick={() => bgInputRef.current?.click()}
            disabled={bgUploading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-all rounded-xl px-4 py-2 text-sm disabled:opacity-50"
          >
            {bgUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            {bgUploading ? 'Upload...' : 'Ajouter une image'}
          </button>
          {bgError && <p className="text-red-400 text-sm mt-2">{bgError}</p>}
        </div>

        {/* Sélecteur page Radios */}
        {[
          { page: 'radios', label: 'Page Radios' },
          { page: 'weather', label: 'Page Météo' },
          { page: 'todo', label: 'Page Todo' },
          { page: 'courses', label: 'Page Courses' },
          { page: 'news', label: 'Page News' },
          { page: 'help', label: 'Page Aide' },
          { page: 'login', label: 'Page Connexion' },
        ].map(({ page, label }) => (
          <div key={page}>
            <p className="text-zinc-400 text-sm mb-3">{label}</p>
            <div className="flex flex-wrap gap-3">

              {/* Bouton "Aucun" */}
              <button
                onClick={() => selectBackground(page, null)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  !bgSelection[page]
                    ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-300'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Aucun
              </button>

              {/* Thumbnails des images uploadées */}
              {bgImages.map((img) => (
                <div key={img.name} className="relative group">
                  <button
                    onClick={() => selectBackground(page, img.url)}
                    className={`block rounded-xl overflow-hidden transition-all ${
                      bgSelection[page] === img.url
                        ? 'ring-2 ring-cyan-400'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="h-16 w-24 object-cover" />
                  </button>
                  <button
                    onClick={() => deleteBackground(img.name)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              {bgImages.length === 0 && (
                <p className="text-zinc-500 text-sm py-2">Aucune image — utilisez le bouton ci-dessus.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CRÉER UTILISATEUR */}
      <div className="glass-card rounded-3xl p-6 mb-8 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Créer un utilisateur</h2>
        <form onSubmit={createUser} className="flex flex-col gap-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom"
            className="bg-white/10 rounded-xl px-4 py-3 outline-none placeholder:text-zinc-500" />
          <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" type="email"
            className="bg-white/10 rounded-xl px-4 py-3 outline-none placeholder:text-zinc-500" />
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mot de passe" type="password"
            className="bg-white/10 rounded-xl px-4 py-3 outline-none placeholder:text-zinc-500" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-cyan-400 text-sm">✓ {success}</p>}
          <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 rounded-xl py-3 font-semibold transition-all">
            Créer
          </button>
        </form>
      </div>

      {/* UTILISATEURS */}
      <div className="glass-card rounded-3xl p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Utilisateurs ({users.length})</h2>
        {users.length === 0 ? (
          <p className="text-zinc-500">Aucun utilisateur</p>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-zinc-400 text-sm">{user.email}</p>
                  <p className="text-zinc-500 text-xs">{new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <button onClick={() => deleteUser(user.id, user.name)}
                  className="text-zinc-500 hover:text-red-400 transition-all text-sm">
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
