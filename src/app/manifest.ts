import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MediView Desktop',
    short_name: 'MediView',
    description: 'Patient Management Dashboard',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff', // White background
    theme_color: '#008080', // Teal theme color
    icons: [
      {
        // Placeholder icon, replace with actual icon later
        src: '/icon.svg', // Assuming you might add an SVG icon later
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
