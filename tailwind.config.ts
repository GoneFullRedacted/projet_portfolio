// tailwind.config.ts (ou .js)

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', // Garde ce chemin pour app/
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), // AJOUTE CETTE LIGNE
  ],
}
export default config