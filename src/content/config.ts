import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 部員プロフィール。ファイル名（id）が作品棚のURLセグメントになる（例: member_bansho → /gallery/member_bansho/）
const members = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/members' }),
  schema: z.object({
    nickname: z.string(),
    icon: z.string(),
    iconWidth: z.number().default(130),
    /** 作品棚ページの自己紹介。<br> 等のHTMLを含めてよい */
    bio: z.string(),
    /** 作品集トップでの並び順（フェーズ3で使用） */
    order: z.number().default(99),
    /** false = 自由制作領域（passthrough）。動的生成の対象外（例: ヤスタジャン） */
    managed: z.boolean().default(true),
  }),
});

// 個別作品。works/<member>/<slug>.md → /gallery/<member>/<slug>/
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    /** 作品ページの見出し（<title>にも使用） */
    title: z.string(),
    /** 作品棚カードの見出し（未指定なら title を流用） */
    cardTitle: z.string().optional(),
    /** 本文画像の直後に出す見出し。既定は「どういう作品？」。空文字にすると見出しを出さず本文に委ねる */
    heading: z.string().default('どういう作品？'),
    /** 作品棚での並び順 */
    order: z.number(),
    /** 作品棚カードのサムネイル */
    card: z.object({
      thumb: z.string(),
      width: z.number().default(300),
    }),
    /** 作品ページに並べる画像 */
    images: z
      .array(z.object({ src: z.string(), width: z.number().optional() }))
      .default([]),
    /** 関連リンク（例: まちかね祭ページへの導線） */
    related: z
      .object({
        href: z.string(),
        label: z.string(),
        thumb: z.string(),
        width: z.number().default(150),
      })
      .optional(),
    /** 設定時はカードのみ生成し、リンク先を外部URLにする（個別ページは作らない。例: Apple II） */
    external: z.string().optional(),
  }),
});

export const collections = { members, works };
