// src/app/api/project/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;

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
          const repo = githubUrlParts[2].replace(/\.git$/, ''); // Remove .git if present

          // Try multiple README filename variations
          const readmeVariations = ['README.md', 'README.MD', 'readme.md', 'Readme.md', 'README.txt', 'README'];

          const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Next.js-Portfolio-App'
          };

          if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
          }

          // Try each README variation until one works
          for (const filename of readmeVariations) {
            try {
              const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`;
              const githubResponse = await fetch(githubApiUrl, { headers });

              if (githubResponse.ok) {
                const data = await githubResponse.json();
                // GitHub API returns base64 encoded content - decode it properly for UTF-8
                const decodedBytes = atob(data.content);
                readmeContent = new TextDecoder('utf-8').decode(new Uint8Array([...decodedBytes].map(char => char.charCodeAt(0))));
                console.log(`Successfully fetched ${filename} for ${owner}/${repo}`);
                break; // Found one, stop trying
              }
            } catch (err) {
              console.log(`Failed to fetch ${filename} for ${owner}/${repo}:`, err);
              continue; // Try next variation
            }
          }

          if (!readmeContent) {
            console.warn(`No README found in any format for ${project.github_url}`);
          }
        }
      } catch (githubError) {
        console.error('Erreur lors de la récupération du README :', githubError);
      }
    }

    return NextResponse.json({ ...project, readmeContent }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de la récupération du projet par ID :', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}