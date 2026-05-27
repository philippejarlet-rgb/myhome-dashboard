'use client'

import Link from 'next/link'

export default function BottomBar() {

  const items = [

    {
      icon: '🏠',
      label: 'Accueil',
      href: '/',
    },

    {
      icon: '🌤️',
      label: 'Météo',
      href: '/weather',
    },

    {
      icon: '🎵',
      label: 'Radios',
      href: '/radios',
    },

    {
      icon: '🍳',
      label: 'Recettes',
      href: '/recipes',
    },

    {
      icon: '🌍',
      label: 'Atlas',
      href: 'https://atlasculinaire.com/',

    },

    {
      icon: '🛒',
      label: 'Courses',
      href: '/courses',
    },

    {
      icon: '📝',
      label: 'Todo',
      href: '/todo',
    },

    {
      icon: '📅',
      label: 'Agenda',
      href: '/agenda',
    },

    {
      icon: '📸',
      label: 'Photos',
      href: '/photos',
    },

  ]

  return (

    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">

      <div className="glass-card rounded-3xl px-8 py-4 flex gap-10">

        {items.map((item) => (

          <Link
             key={item.label}
  href={item.href}
  target={
    item.label === 'Atlas'
      ? '_blank'
      : '_self'
  }
            className="flex flex-col items-center gap-2 text-sm text-zinc-300 hover:text-white hover:scale-110 transition-all"
          >

            <span className="text-2xl">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

          </Link>

        ))}

      </div>

    </div>

  )
}