// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const result = await pool.query('SELECT id, title, description_courte, github_url, live_url, tags FROM projects');
    
    const projects = result.rows.map(project => ({
      ...project,
      tags: project.tags || [] // Convert null to empty array
    }));
    
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// Si tu avais d'autres méthodes HTTP, tu les exporterais ici aussi, par exemple:
// export async function POST(request: NextRequest) { ... }
// export async function PUT(request: NextRequest) { ... }
// export async function DELETE(request: NextRequest) { ... }