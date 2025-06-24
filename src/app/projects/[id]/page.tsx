// src/app/projects/[id]/page.tsx

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link'; // N'oublie pas d'importer Link si tu l'utilises pour revenir en arrière ou autre
import { notFound } from 'next/navigation'; // Pour gérer le cas où le projet n'est pas trouvé
import { Project } from '@/models/project';

// Interface pour les props de la page dynamique
interface ProjectDetailPageProps {
  params: {
    id: string; // Le paramètre dynamique de l'URL
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/project/${id}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} - ${response.statusText}`);
    notFound();
  }

  const project: Project = await response.json();

  if (!project || project.message === 'Projet non trouvé') {
    notFound();
  }

  return (
    <div className="container mx-auto p-8">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Retour à la liste des projets
      </Link>

      <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
      <p className="text-gray-700 text-lg mb-6">{project.description_courte}</p>

      {/* MODIFICATION HERE: Conditionally render the tags */}
      {project.tags && Array.isArray(project.tags) && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag: string) => (
            <span key={tag} className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mb-6">
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-4">
            Voir le projet en ligne
          </a>
        )}
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Dépôt GitHub
          </a>
        )}
      </div>

      {project.readmeContent ? (
        <div className="prose lg:prose-xl max-w-none">
          <h2 className="text-3xl font-semibold mb-4 border-b pb-2">Description Détaillée (README.md)</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {project.readmeContent}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-gray-500 italic">Aucun README.md trouvé pour ce projet ou erreur de récupération.</p>
      )}
    </div>
  );
}