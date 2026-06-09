'use client'

import { useRouter } from 'next/navigation'
import {
  CloudSun, ListTodo, ShoppingCart, Music2, Globe, HelpCircle, Camera
} from 'lucide-react'

const sections = [
  {
    icon: <HelpCircle size={28} className="text-cyan-400" />,
    title: "MyHome — c'est quoi ?",
    content: [
      'MyHome est un dashboard personnel conçu pour rester affiché en permanence sur une tablette murale tactile dans votre maison.',
      'Il regroupe tous vos outils du quotidien en un seul endroit : météo multi-villes, listes de tâches et de courses, radios en streaming, recettes du monde, actualités et photos.',
      "Tout est accessible d'un simple tap, sans clavier, depuis 1 à 2 mètres de distance.",
    ],
  },
  {
    icon: <CloudSun size={28} className="text-sky-400" />,
    title: 'Météo',
    content: [
      "→ Ajouter une ville : depuis la page Météo, tapez le nom d'une ville dans le champ en bas et validez. La ville s'ajoute à votre liste.",
      '→ Supprimer une ville : appuyez sur la croix (×) à côté du nom de la ville dans la liste.',
      '→ Les villes sont sauvegardées — elles restent après fermeture de l\'app.',
    ],
  },
  {
    icon: <ListTodo size={28} className="text-emerald-400" />,
    title: 'Todo',
    content: [
      '→ Ajouter une tâche : tapez dans le champ texte en bas de la liste et validez (bouton + ou touche Entrée).',
      '→ Cocher / décocher : tapez sur la case à gauche de la tâche pour la marquer comme faite.',
      '→ Supprimer une tâche : tapez sur la corbeille à droite de la tâche.',
      '→ Trier les tâches : maintenez appuyé sur la poignée (≡) à gauche d\'une tâche et faites-la glisser à la position souhaitée.',
    ],
  },
  {
    icon: <ShoppingCart size={28} className="text-orange-400" />,
    title: 'Courses',
    content: [
      "→ Ajouter un article : saisissez le nom de l'article et choisissez le magasin associé, puis validez.",
      '→ Magasins favoris : les magasins que vous utilisez souvent sont mémorisés et proposés en auto-complétion.',
      '→ Groupement automatique : les articles sont regroupés par magasin dans la liste pour faciliter les courses.',
      '→ Supprimer un article : tapez sur la corbeille à droite de l\'article.',
    ],
  },
  {
    icon: <Globe size={28} className="text-purple-400" />,
    title: 'Recettes du Monde',
    content: [
      '→ La page Recettes du Monde est un moteur de recherche de recettes du monde entier.',
      '→ Tapez un ingrédient ou un plat dans la barre de recherche pour trouver des recettes.',
      '→ Cliquez sur une recette pour voir ses détails complets.',
    ],
  },
  {
    icon: <Globe size={28} className="text-amber-400" />,
    title: 'Atlas Culinaire',
    content: [
      '→ Le bouton "Atlas Culinaire" (dans la barre du bas ou le menu) ouvre directement le site atlasculinaire.com.',
      '→ Vous accédez à l\'intégralité du site avec toutes ses recettes, articles et fonctionnalités.',
    ],
  },
  {
    icon: <Camera size={28} className="text-yellow-400" />,
    title: 'Photos',
    content: [
      '→ La page Photos est une galerie personnelle : vous pouvez y uploader vos propres photos et les supprimer.',
      '→ Uploader une photo : tapez sur le bouton d\'upload, choisissez une image depuis votre appareil.',
      '→ Supprimer une photo : tapez sur la corbeille affichée sur la photo.',
      '→ Écran de veille : lorsque le dashboard est inactif, un diaporama démarre automatiquement et affiche vos photos en ordre aléatoire. La radio continue de jouer en fond pendant le diaporama.',
    ],
  },
  {
    icon: <Music2 size={28} className="text-pink-400" />,
    title: 'Radios',
    content: [
      "→ Ajouter via la recherche : tapez sur l'onglet « Recherche » en bas de la page Radios, saisissez un nom (ex: jazz, RTL, Couleur 3) et tapez sur le résultat souhaité — la radio est ajoutée immédiatement avec son logo.",
      "→ Ajouter manuellement : tapez sur l'onglet « Saisie manuelle », renseignez le nom, l'URL du stream et optionnellement un logo, puis validez.",
      '→ Modifier / changer le logo : tapez sur « Modifier » sous une radio pour éditer ses informations.',
      '→ Mettre en favori : tapez sur l\'étoile (★) d\'une radio pour la faire apparaître dans le widget de la page d\'accueil.',
      '→ Supprimer une radio : tapez sur « Supprimer » sous la radio concernée.',
      "→ Note : la radio s'arrête si vous changez de page dans MyHome. Revenez sur la page Radios pour reprendre la lecture.",
    ],
  },
]

export default function HelpPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white p-4 md:p-8 pb-32">
      <div className="flex items-center gap-3 md:gap-6 mb-6 md:mb-10">
        <button
          onClick={() => router.push('/')}
          className="glass-card rounded-2xl px-4 py-2 text-sm md:text-base hover:scale-105 transition-all"
        >
          ← Retour
        </button>
        <h1 className="text-3xl md:text-5xl font-thin tracking-wide">Aide</h1>
      </div>

      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="glass-card rounded-2xl p-5 md:p-7 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3 mb-1">
              {section.icon}
              <h2 className="text-xl md:text-2xl font-semibold">{section.title}</h2>
            </div>
            <div className="flex flex-col gap-2">
              {section.content.map((line, i) => (
                <p key={i} className="text-zinc-300 text-base md:text-lg leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
