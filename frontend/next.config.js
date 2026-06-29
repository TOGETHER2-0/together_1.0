/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // In produzione il frontend chiama direttamente il backend pubblico
  // tramite NEXT_PUBLIC_API_URL (vedi lib/api.ts). Nessun rewrite/proxy:
  // niente più dipendenza da localhost:8000 o da un tunnel ngrok.
};

module.exports = nextConfig;
