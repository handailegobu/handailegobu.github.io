import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://handailegobu.github.io',

  // 既存の主要URL（/about/ 等のディレクトリ形式）を維持するため
  // 'directory' 形式（about/index.html を出力 → /about/ で配信）を採用。
  // 末尾スラッシュの扱いはPoCで実出力を確認する。
  build: {
    format: 'directory',
  },
  trailingSlash: 'ignore',

  integrations: [sitemap()],
});
