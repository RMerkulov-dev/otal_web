import type { APIRoute } from 'astro';

/** robots.txt тримається того ж домену, що й canonical у astro.config.mjs. */
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
