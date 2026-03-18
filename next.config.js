/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite importar imágenes externas si las usás en el futuro
  images: {
    domains: ['*.supabase.co'],
  },
}

module.exports = nextConfig
