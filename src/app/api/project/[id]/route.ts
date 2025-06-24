// src/app/api/project/[id]/route.ts
import { NextResponse, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Le type Context permet d'accéder aux paramètres dynamiques de l'URL
interface Context {
  params: {
    id: string; // Le nom du dossier dynamique [id] correspondra à ce paramètre
  };
}

export async function GET(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _request: Request, // On garde le _request et le commentaire pour ESLint
    { params }: Context // <-- C'EST ICI LA MODIFICATION CLÉ !
  ) {
    const { id } = params; // Extrait l'ID des paramètres

  try {
    const projectResult = await pool.query('SELECT id, title, description_courte, github_url, live_url, tags FROM projects WHERE id = $1', [id]);

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    const project = projectResult.rows[0];
    let readmeContent = null;

    if (project.github_url) {
      try {
        const githubUrlParts = project.github_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (githubUrlParts && githubUrlParts.length >= 3) {
          const owner = githubUrlParts[1];
          const repo = githubUrlParts[2];

          const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/README.md`;

          const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3.raw',
            'User-Agent': 'Next.js-Portfolio-App'
          };

          if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
          }

          const githubResponse = await fetch(githubApiUrl, { headers });

          if (githubResponse.ok) {
            readmeContent = await githubResponse.text();
          } else {
            console.warn(`Impossible de récupérer le README.md pour ${project.github_url}: ${githubResponse.status} ${githubResponse.statusText}`);
          }
        }
      } catch (githubError) {
        console.error('Erreur lors de la récupération du README.md :', githubError);
      }
    }

    return NextResponse.json({ ...project, readmeContent }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de la récupération du projet par ID :', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}