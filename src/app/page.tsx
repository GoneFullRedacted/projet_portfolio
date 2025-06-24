// src/app/page.tsx

import Link from 'next/link';
import { Project } from '@/models/project';

export default async function HomePage() {
  let projects: Project[] = []; // 👈 Initialise projects comme un tableau vide pour éviter 'undefined'

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects`, {
      cache: 'no-store' // S'assure que les données sont toujours fraîches en dev
    });

    // 👈 Gérer si la réponse n'est pas OK (par exemple, 404, 500 de l'API)
    if (!response.ok) {
      console.error(`Erreur lors de la récupération des projets: ${response.status} - ${response.statusText}`);
      // Tu peux choisir d'afficher un message d'erreur ici si tu veux
      // Ou laisser 'projects' vide pour afficher le message "Aucun projet trouvé".
    } else {
      const data = await response.json();
      // 👈 S'assurer que les données reçues sont bien un tableau
      if (Array.isArray(data)) {
        projects = data as Project[];
      } else {
        console.warn("L'API /api/projects n'a pas renvoyé un tableau. Vérifiez votre route API.");
        // projects reste un tableau vide []
      }
    }
  } catch (error) {
    // 👈 Gérer les erreurs réseau (pas de connexion, URL mal formée, etc.)
    console.error("Erreur de connexion lors de la récupération des projets:", error);
    // projects reste un tableau vide []
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Mes Projets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 👈 C'est ICI que tu insères le test projects.length */}
        {projects.length > 0 ? (
          // Si projects contient des éléments, on les mappe
          projects.map((project: Project) => (
            <div key={project.id} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">{project.title}</h2>
              <p className="text-gray-600 mb-4">{project.description_courte}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {/* 👈 Et ici, le test pour project.tags (très important !) */}
                {project.tags && Array.isArray(project.tags) && project.tags.length > 0 ? (
                  project.tags.map((tag: string) => (
                    <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))
                ) : (
                  // Optionnel : afficher quelque chose si pas de tags ou si tags n'est pas un tableau
                  <span className="text-gray-400 text-xs">Pas de tags</span>
                )}
              </div>
              <Link href={`/projects/${project.id}`} className="text-blue-500 hover:underline">
                Voir les détails
              </Link>
            </div>
          ))
        ) : (
          // 👈 Si projects est vide (soit réellement vide, soit à cause d'une erreur de fetch), on affiche un message
          <p className="col-span-full text-center text-gray-500">
            Aucun projet trouvé ou impossible de charger les projets.
            Vérifiez votre API et votre base de données.
          </p>
        )}
      </div>
    </div>
  );
}