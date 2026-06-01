'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email: string
  name: string
  is_admin: boolean
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setUsers(data)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUsers() }, [])

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
