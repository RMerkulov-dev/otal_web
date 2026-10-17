// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

/**
 * ЗАМІНІТЬ перед публікацією на домен, де житиме сайт-візитка.
 * Від цього значення залежать canonical, og:url, sitemap і robots.txt.
 * Це НЕ ser.od.ua: там каталог на Prom.ua, куди візитка веде відвідувача.
 */
const SITE_URL = 'https://otal.od.ua';

export default defineConfig({
  site: SITE_URL,
  integrations: [react(), sitemap()],
  build: { inlineStylesheets: 'auto' },
  vite: { build: { cssMinify: 'lightningcss' } },
});
