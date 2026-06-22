# 阪大レゴ部HP Astro移行計画

> 作成日: 2026-06-22
> 対象リポジトリ: `handailegobu.github.io`（GitHub Pages・ユーザー/組織ページ）

---

## 0. この計画のゴール

現状の「継ぎ足し型・手コピーHTML」から、**Markdown中心 + コンポーネント化**された Astro サイトへ移行する。狙いは次の4点。

1. **編集負担の軽減** … 非情報系・代替わりの激しい編集係でも、Markdownでタイトル・画像・本文だけ書けば記事が増やせる状態にする。
2. **コンポーネント化** … ヘッダー/フッター/ナビ/作品カードを1箇所定義に集約。
3. **バグ・負債の解消** … jQuery後差し込み・強制リロード・廃止フレームワーク(Skel)・IE8ポリフィルを撤去。
4. **SEOの維持と改善** … 主要ページの検索順位を落とさず（高価値URLは不変に保つ）、メタ情報・sitemapを整備して底上げする。

---

## 1. 現状アーキテクチャ（移行前）

| 項目 | 現状 |
|---|---|
| ページ生成 | ビルド工程なし。126枚の素のHTMLを手書き・コピーで管理 |
| 共通部品 | `commonHTML/header.html`・`footer.html` を **jQuery `.load()` でクライアント側差し込み**（121ファイルが同方式） |
| CSS | `css/main.css`（`sass/*.scss` から手動コンパイル）。フレームワークは **Skel（開発終了）** |
| JS | jQuery + dropotron + skel + IE8ポリフィル(`html5shiv`/`respond.js`) |
| 解析/認証 | GA4 `G-EXMSWLBNQG`、Search Console認証 `googlee7ccf0a20dd9e0cf.html` |
| デプロイ | master直下のHTMLをGitHub Pagesがそのまま配信 |

### 既知の問題点
- **`index.html` の強制リロードハック**（[index.html:261-264](index.html#L261-L264)）。ナビ表示のため毎回1回リロードしておりちらつき・低速の原因。
- **ナビがJS後差し込み** → クローラ・OGP生成に乗りにくい。
- **SEO要素が未整備**: `meta description` 0件 / OGP 0件 / `sitemap.xml`・`robots.txt` なし。
- **作品ページ・部員棚が完全な手コピー**（`<head>`40行が全ファイル重複）。

---

## 2. 移行後アーキテクチャ（目標）

### 技術スタック
- **Astro**（静的出力 / SSGモード）
- **統合**: `@astrojs/sitemap`（sitemap自動生成）, `@astrojs/mdx`（必要に応じ）
- **CSS**: 既存 `main.css` をいったんそのまま流用 → 段階的に整理（後述）。Skel/jQuery依存のレイアウトクラス（`4u 12u(mobile)` 等）は当面CSSとして温存し、視覚を変えない。
- **JS**: ナビのドロップダウン/モバイルメニューだけ素のJS（数十行）に置換。jQuery・Skelは撤去。

### ディレクトリ構成（案）
```
src/
  layouts/
    BaseLayout.astro      # <head>・GA・SEOメタ・OGP・共通スクリプト
    ArticleLayout.astro   # 記事系の共通ガワ（box/section）
  components/
    Header.astro          # ロゴ + Nav
    Nav.astro             # ナビ（現 header.html を移植、現在地ハイライト）
    Footer.astro
    WorkCard.astro        # 作品サムネカード（部員棚の繰り返し要素）
    MemberCard.astro      # 部員アイコン+紹介カード
    Seo.astro             # title/description/og/canonical を一元化
  content/
    config.ts             # コレクションのスキーマ定義(zod)
    works/                # 部員の個別作品（Markdown）
      bansho/orca.md
      ...
    members/              # 部員プロフィール
      bansho.md
    workshops/            # ワークショップ記事 (about/workshop_*)
    workrequests/         # 製作依頼記事 (about/workrequest_*)
    gakusai/              # 学祭記事
    contests/             # コンテスト記事
    news/                 # 最新情報（任意。frontmatterのdate+本文）
  pages/
    index.astro           # トップ
    about/index.astro
    gallery/index.astro
    join/index.astro
    contact/index.astro
    gallery/[member]/index.astro      # 部員棚（works/membersから自動生成）
    gallery/[member]/[work].astro     # 個別作品（worksから自動生成）
    ...
public/
  images/ css/ javascript/ ...  # 既存アセットを移設（パス維持）
  googlee7ccf0a20dd9e0cf.html   # SC認証ファイルはそのまま配置
  CNAME / .nojekyll など
```

### コンテンツコレクション設計（例）

`works`（個別作品）frontmatterスキーマ:
```yaml
---
title: "シャチ"
member: "bansho"          # members コレクションへの参照
order: 3                  # 部員棚での並び順
thumbnail: "/images/gallery/member_bansho/orca.png"
relatedLink: "/gallery/gakusai_24_machikane/"   # 任意
relatedLabel: "↓2024まちかね祭↓"
---
本文をMarkdownで記述（「どういう作品？」など）
```

`members`（部員）:
```yaml
---
nickname: "番匠"
slug: "bansho"
icon: "/images/gallery/thumbnail/bansho_icon.png"
intro: "いろいろ作ります。特に和風建築が好きです"
order: 4
active: true              # 卒業生フラグ等
---
```

→ **部員棚ページ・作品集トップのカード一覧は、これらのコレクションから自動生成**。新作品を追加したい編集係は `works/番匠/新作品.md` を1枚足すだけで、個別ページ・部員棚カード・並び順が自動反映される。これが移行の最大の価値。

### 自由制作領域（パススルー）— 重要な設計方針

部員の中には、**共通テンプレートを使わず独自にデザイン・実装している作品**がある。最大の例が **ヤスタジャン**（`gallery/member_yasutajan/`）で、独自の `style.css`・`script.js`・Webフォント・ツールチップ等のインタラクションを持つ自己完結ページである。

これらは **Markdownコレクションに変換しない**。Astroの `public/` は中身を**そのまま（バイト単位で）配信**するため、こうしたフォルダは `public/gallery/member_yasutajan/` へ**無改変でコピーするだけ**とする。

メリット:
- 本人の独自デザイン・JS・更新の自由を一切損なわない。
- **URLが `.html` のまま完全一致**するので、この領域はSEOリスクすらゼロ。
- 「普通の編集係はMarkdown、技術力のある部員は自由制作」という**二層運用**が成立し、代替わりに強い。

実装上の注意:
- 部員棚カード一覧に載せるため、`members` コレクションには **`managed: false`（自動生成しない＝パススルー）** のような区別フラグを持たせ、`gallery/[member]/index.astro` の `getStaticPaths` から **除外**する（ルート衝突の回避）。カード（アイコン・紹介文・リンク先）は従来通りコレクションから出す。
- 既存の絶対URLやWindows風パス（`\images\...`）等の癖もそのまま温存する（触らない）。

> この方針は将来、他の部員が独自ページを作りたい場合にもそのまま適用できる。`public/` に置けば共通ガワの外で自由に作れる、という運用ルールにする。

---

## 3. SEO維持の方針（最重要）

ご指定の「検索上位から外れる変更をしない」を守る。ただし**全URLを維持するのではなく、価値のあるURLを守り、低流入の末端URLは将来の管理性を優先して移行を許容する**方針とする（全URL `.html` 維持＝`build.format:'file'` は管理負債になるため採らない）。

### 3-1. URLを2層に分けて扱う
既存URLは性質が異なる2種類に分かれる。

| 種類 | 例 | Astro既定での扱い | 方針 |
|---|---|---|---|
| **ディレクトリ形式**（拡張子なし。主要ページ・主要導線） | `/`、`/about/`、`/gallery/`、`/join/`、`/contact/` | **既定でそのまま維持** | 追加対策ゼロで完全維持 |
| **`.html`形式**（末端ページ） | `…/orca.html`、`workshop_*.html`、`contest*.html` | 既定では `…/orca/` に変化 | クリーンURLへ移行を許容 |

- ナビ・ランディングの**高価値ページはすべて前者**で、Astroの**デフォルト出力（クリーンURL）のままURLが変わらない**。トップページと主要導線は特別な対策なしで保護される。
- 後者の `.html` 末端ページ（個別作品・各記事）は主に**サイト内リンク経由で到達**するロングテールで、検索からの直接流入はわずか。内部リンクはコレクションから自動生成されるため**移行後もリンク切れは起きない**。

> `build.format:'file'`（全URLに`.html`を強制）は採用しない。Astroの慣習（クリーンURL）に逆らい、新規ページ・内部リンクで毎回`.html`を意識する必要が生じ、代替わりする非情報系編集係には事故のもとになるため。

### 3-2. 末端URL変更への保険（被リンク分のみ）
- 移行前に **GA4「ランディングページ」レポート / Search Console** で「実際に検索流入・外部被リンクのある末端URL」を特定する（おそらく数本）。
- 該当する旧 `.html` URLにのみ、**meta refresh + `<link rel="canonical">`** のリダイレクト用スタブを `public/` に置く（GitHub Pagesは301不可のためこれが現実解。ユーザー誘導と被リンク評価の大半を引き継げる）。
- 流入実績のない末端URLはスタブ不要。

### 3-3. 移行前後の検証
- 移行前の全URL一覧（126本）を取得しスナップショット保存。
- 移行後、**ディレクトリ形式の主要URLが同一URLで200を返すこと**を機械チェック（ここは厳守ライン）。
- 末端URLは「旧URL→新URL」の対応表を作り、内部リンクの追従とスタブ設置漏れがないか確認。
- `<title>` は既存の良質な文言（例:「シャチ｜部員の作品棚：番匠｜作品集｜大阪大学レゴ部」）を**そのまま踏襲**。

### 3-4. 引き継ぎ必須要素
- GA4タグ `G-EXMSWLBNQG`（`BaseLayout` に集約）。
- Search Console認証ファイル `googlee7ccf0a20dd9e0cf.html`（`public/` にそのまま）。
- `images/logo.png` のfavicon参照。

### 3-4. SEO“改善”（移行と同時に底上げ。順位を下げないプラス施策のみ）
- 全ページに `meta description`（コレクションのfrontmatterから生成）。
- OGP（`og:title`/`og:image`/`og:description`）→ SNSシェア時の見栄え向上。
- `@astrojs/sitemap` で `sitemap.xml` 自動生成 → Search Console登録。
- `robots.txt` 追加（sitemap参照）。
- `canonical` タグ。

---

## 4. デプロイ方式の変更

現状: master直下のHTMLを直接配信。
移行後: **ビルドが必要**になるため、GitHub Actions でデプロイ。

- `.github/workflows/deploy.yml` で `npm ci && astro build` → `dist/` を GitHub Pages へ。
- Pages設定を「Deploy from a branch」→「GitHub Actions」へ切替（**ここは要オーナー操作**）。
- `astro.config.mjs`: `site: 'https://handailegobu.github.io'`、`base: '/'`。
- `.nojekyll` を出力に含める（`_`始まりのAstro資産対策）。

> リスク: 編集係が「ファイルを置けば公開」できる現状の手軽さは失われる。ただしMarkdown push → Actions自動ビルドなので、運用フローを README に明記すれば吸収可能。

---

## 5. 段階移行プラン（安全第一）

各フェーズはコミット単位を分け、**コミットは自動実行せずメッセージ確認**いただく。

### フェーズ0: 準備（破壊なし）
- [ ] 別ブランチ作成（例 `feat/astro-migration`）。masterは無傷のまま。
- [ ] 全URL一覧の取得とスナップショット保存（移行後の照合用）。
- [ ] GA4 / Search Console で**流入・被リンクのある末端URLを特定**（リダイレクトスタブ対象の洗い出し）。

### フェーズ1: 基盤構築
- [ ] Astro初期化、`public/` に既存 `images/css/javascript` とSC認証ファイルを移設。
- [ ] `BaseLayout` / `Header` / `Nav` / `Footer` / `Seo` を作成（現 `header.html`/`footer.html` を移植、現在地ハイライトを `currentPos` 相当のpropで再現）。
- [ ] ナビのドロップダウン/モバイルメニューを素のJSで実装し、jQuery依存を切る。

### フェーズ2: 実証（PoC）— 「部員の作品棚」1名分
- [ ] `members` + `works` コレクションを定義し、**番匠**1名をMarkdown化。
- [ ] `gallery/[member]/index.astro` と `[work].astro` を実装。
- [ ] **出力URL（クリーンURL化される末端パス）・見た目・GAを検証**。旧→新URL対応を確認し、必要ならスタブ方式も試す。←ここで方式の妥当性を最終判断。

### フェーズ3: 横展開
- [ ] 残りの部員棚・作品をMarkdown化（最も重複が多く効果大）。**ただし自由制作領域（ヤスタジャン等）は変換せず `public/` へ無改変コピー**し、カードのみコレクションに登録。
- [ ] ワークショップ/製作依頼/学祭/コンテスト記事をコレクション化。
- [ ] トップ・about・gallery・join・contact を移植。
- [ ] 最新情報(news)をfrontmatter管理にし、トップへ自動表示。

### フェーズ4: SEO仕上げ & 切替
- [ ] sitemap / robots.txt / description / OGP を全ページに付与。
- [ ] **主要（ディレクトリ形式）URLの200チェック**＋末端URLの旧→新対応確認・スタブ設置。
- [ ] GitHub Actions デプロイを設定し、Pages設定を切替（オーナー操作）。
- [ ] 公開後、Search Console でカバレッジ・sitemap・主要ページの順位を監視。

### フェーズ5: 後片付け
- [ ] 旧 `commonHTML`・Skel/jQuery・IE8ポリフィル・`pageTemplate.html` 等を撤去。
- [ ] 編集係向け運用手順を README / 編集ガイドに更新。

---

## 6. リスクと対策

| リスク | 影響 | 対策 |
|---|---|---|
| 主要ページの順位下落 | 大 | 主要ページはディレクトリ形式でURL不変。200チェックで担保 |
| 末端URL変更による流入減 | 小〜中 | 流入実績のあるURLのみ meta refresh + canonical スタブ。内部リンクは自動追従 |
| デプロイ方式変更で公開フロー混乱 | 中 | Actions自動化 + 運用手順を明文化 |
| レイアウトCSS(`4u`等)の互換崩れ | 中 | main.cssを当面流用、視覚差分を目視確認してから整理 |
| 編集係の学習コスト（Markdown/Git） | 中 | テンプレMDと記入例を用意、frontmatter最小化 |
| 画像パスのずれ | 中 | `public/images` でパス完全維持、相対参照は絶対参照へ統一 |
| **画像の大文字拡張子(`.JPG`30件)** | 中 | Linux本番のみ404になる罠。`public/`で大小文字保持、参照は実ファイル名と完全一致を徹底 |
| **巨大リポジトリ(作業408MB/.git419MB)** | 中 | Astro画像最適化は**無効**のまま画像を`public/`で無処理配信。Actionsビルド時間に留意 |
| Font Awesome kitの外部依存 | 低 | kit失効で全アイコン消失リスク。移行時に自己ホスト化を検討（任意） |

---

## 6.5. 着手前の棚卸し（追加調査で判明）

### 自由制作領域の扱いは「フォルダ単位」ではなく「ページ単位」
- ヤスタジャンの **`index.html` は共通テンプレ依存**（jQuery `.load()` 使用）。一方 `sine_curve_tracer.html` 等の**作品ページは完全独自**。
- 方針: **index.html はコレクションから再生成（managed）**、独自の**作品ページ＋`style.css`/`script.js` のみ `public/` へpassthrough**。フォルダ丸ごとpassthroughは不可（撤去予定のcommonHTML依存が残るため）。→ 本人確認のうえ確定。

### 孤立ページ（被リンク0件）の処遇
- `projectseg.html`/`requestedworks.html`/`workrequest_past_list.html`/`contact.html`(ルート重複)/`HTML_TUTORIAL.html`/`pageTemplate.html` はどこからもリンクされていない。`activities2014/2015.html` は相互リンクのみ（ナビはコメントアウト）。
- 方針: 開発物（HTML_TUTORIAL/pageTemplate）は公開対象から除外。その他は**Search Consoleで検索流入を確認 → 不要なら段階的に削除/リダイレクト**（無言削除はSEO観点で避ける）。

### 全ページ共通の小改善
- `lang="ja"` がほぼ全ページ未指定 → `BaseLayout` で一括付与。
- お問い合わせは `mailto:` のみでフォームバックエンド無し → 移行容易（懸念なし）。

---

## 7. 決めていただきたい事項

1. **デプロイ方式の切替（GitHub Actions化）に同意いただけるか**（Pages設定変更が必要）。
2. **見た目を現状維持するか／移行を機にデザインも刷新するか**（本計画は「現状維持」前提）。
3. **PoC対象の部員**（おすすめ: 作品数が多く構造が典型的な「番匠」）。
4. 末端 `.html` URLをクリーンURL化する方針（本計画の推奨）で問題ないか。気になる場合はGA4/SCの流入データを先に確認。
5. **ヤスタジャンの index.html を再生成してよいか**（作品ページは無改変passthrough）。
6. **孤立ページの扱い**（開発物は除外／その他はSC確認後に判断）。

---

## 8. 結論

- Astro移行は本サイトの課題（コンポーネント化・継ぎ足し・編集負担）に **正面から効く** 妥当な選択。
- SEOは「全URL維持」ではなく **高価値ページ（ディレクトリ形式）を不変に保ち、低流入の末端URLはクリーンURL化を許容**する方針。後者は被リンク分のみリダイレクトスタブで保険をかける。これは将来の管理性とSEO保護を両立する現実解。
- いきなり全面移行せず、**フェーズ2のPoC（番匠1名）で方式の妥当性を実証してから横展開**するのが安全。
