// src/app/api/project/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Function to fetch README from GitHub
async function fetchReadmeFromGitHub(githubUrl: string): Promise<string | null> {
  try {
    // Extract owner and repo from GitHub URL
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      console.error('Invalid GitHub URL format:', githubUrl);
      return null;
    }
    
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, ''); // Remove .git if present
    
    // Common README filename variations to try
    const readmeVariations = [
      'README.md',
      'README.MD', 
      'readme.md',
      'Readme.md',
      'README.txt',
      'README'
    ];
    
    for (const filename of readmeVariations) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${cleanRepo}/contents/${filename}`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Portfolio-App'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          // GitHub API returns base64 encoded content
          const content = atob(data.content);
          console.log(`Successfully fetched README: ${filename} from ${owner}/${cleanRepo}`);
          return content;
        }
      } catch (error) {
        console.log(`Failed to fetch ${filename} from ${owner}/${cleanRepo}:`, error);
        continue; // Try next variation
      }
    }
    
    console.log(`No README found in any format for ${owner}/${cleanRepo}`);
    return null;
  } catch (error) {
    console.error('Error fetching README from GitHub:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch project from database
    const result = await pool.query(
      'SELECT id, title, description_courte, github_url, live_url, tags FROM projects WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Projet non trouvé' }, { status: 404 });
    }

    const project = {
      ...result.rows[0],
      tags: result.rows[0].tags || [] // Convert null to empty array
    };

    // Fetch README from GitHub if github_url exists
    let readmeContent = null;
    if (project.github_url) {
      console.log(`Fetching README for project ${id} from ${project.github_url}`);
      readmeContent = await fetchReadmeFromGitHub(project.github_url);
    }

    // Add README content to project
    const projectWithReadme = {
      ...project,
      readmeContent
    };

    return NextResponse.json(projectWithReadme, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération du projet :', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}