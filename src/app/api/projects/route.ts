// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _request: Request //
    //
) {
  try {
    const result = await pool.query('SELECT id, title, description_courte, github_url, live_url, tags FROM projects');
    return NextResponse.json(result.rows, { status: 200 }); // Utilise NextResponse pour renvoyer du JSON
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// Si tu avais d'autres méthodes HTTP, tu les exporterais ici aussi, par exemple:
// export async function POST(request: Request) { ... }
// export async function PUT(request: Request) { ... }
// export async function DELETE(request: Request) { ... }