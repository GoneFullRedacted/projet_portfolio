// src/models/project.ts

export interface Project {
    id: string; // Ou number, selon le type de ton ID dans la BDD
    title: string;
    description_courte: string;
    github_url?: string; // Le ? indique que c'est optionnel
    live_url?: string;
    tags: string[]; // C'est un tableau de chaînes de caractères
    readmeContent?: string; // Optionnel, car il est ajouté dynamiquementf
  }