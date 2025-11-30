# Playwright テストのベストプラクティス

このドキュメントでは、Playwright を使った E2E テストにおける重要な知見とベストプラクティスをまとめています。

---

## 目次

1. [Playwright ブラウザのインストール戦略](#playwright-ブラウザのインストール戦略)
2. [getByRole における要素選択の使い分け](#getbyrole-における要素選択の使い分け)

---

## Playwright ブラウザのインストール戦略

### 基本の仕組み

Playwright のブラウザ（Chromium、Firefox、WebKit）は、プロジェクトフォルダではなく、**ユーザーのホームディレクトリにキャッシュ**されます。

```bash
~/.cache/ms-playwright/  # Mac/Linux の場合
```

### ローカル開発環境

プロジェクトごとにブラウザをインストールする必要は**ありません**。

```bash
# 初回のみ（または Playwright のバージョンを上げた時）
npx playwright install

# 以降、同じバージョンの Playwright を使う他のプロジェクトでは不要
```

#### 注意点

Playwright のバージョンが異なる場合、それぞれのバージョンに対応したブラウザが必要になります。

**例：**
- プロジェクト A が `@playwright/test@1.40.0` を使用
- プロジェクト B が `@playwright/test@1.41.0` を使用
- → それぞれのバージョンで一度ずつインストールが必要

### CI/CD 環境

GitHub Actions などのクリーンな環境では、**毎回ブラウザのインストールが必要**です。ただし、これはワークフローで自動化されるため、手動で実行する必要はありません。

```yaml
# .github/workflows/playwright.yml の例
- name: Install dependencies
  run: npm ci
- name: Install Playwright Browsers
  run: npx playwright install --with-deps
- name: Run Playwright tests
  run: npx playwright test
```

### まとめ

| 環境 | インストール頻度 | 備考 |
|------|------------------|------|
| ローカル | Playwright バージョンごとに1回 | キャッシュが再利用される |
| CI/CD | ジョブ実行ごとに毎回 | ワークフローで自動化 |

---

## getByRole における要素選択の使い分け

Playwright の `getByRole()` で要素を選択する際、`name` オプションには**文字列**と**正規表現**の2つの方法があります。

### 文字列（完全一致） - 推奨

```typescript
getByRole("button", { name: "操作ボタン" })
```

**特徴：**
- 指定したテキストに**完全一致**
- より厳密で堅牢
- 意図が明確

**マッチする例：**
```tsx
<button>操作ボタン</button>  // ✅ マッチする
```

**マッチしない例：**
```tsx
<button>操作ボタンの設定を開く</button>  // ❌ マッチしない
<button>この操作ボタンを押す</button>    // ❌ マッチしない
```

### 正規表現（部分マッチ） - 限定的に使用

```typescript
getByRole("button", { name: /操作ボタン/ })
```

**特徴：**
- 指定したパターンを**含む**すべての要素にマッチ
- 柔軟だがリスクあり
- 複数マッチで strict mode violation エラーになる可能性

**マッチする例：**
```tsx
<button>操作ボタン</button>              // ✅ マッチする
<button>操作ボタンの設定を開く</button>  // ✅ マッチする（意図しない）
<button>この操作ボタンを押す</button>    // ✅ マッチする（意図しない）
```

### 具体的な問題ケース

将来的に UI が変更された場合：

```tsx
<button>操作ボタン</button>
<button>操作ボタンの設定を開く</button>
```

```typescript
// 文字列 → 正しく動作 ✅
getByRole("button", { name: "操作ボタン" })
// "操作ボタン" だけにマッチ

// 正規表現 → エラー！❌
getByRole("button", { name: /操作ボタン/ })
// Error: strict mode violation: getByRole("button", { name: /操作ボタン/ }) 
// resolved to 2 elements
```

### 正規表現を使うべきケース

以下のような場合にのみ正規表現を使用します：

#### 1. 大文字小文字を区別しない

```typescript
getByRole("button", { name: /送信/i })
// "送信", "送信", "SoUsHiN" すべてにマッチ
```

#### 2. 動的な値を含む

```typescript
getByRole("button", { name: /残り\d+個/ })
// "残り1個", "残り99個" などにマッチ
```

#### 3. 複数のパターンに対応

```typescript
getByRole("button", { name: /送信|Submit/ })
// "送信" または "Submit" にマッチ
```

#### 4. 完全一致の正規表現

```typescript
getByRole("button", { name: /^操作ボタン$/ })
// "操作ボタン" だけに完全一致
// ただし、通常は文字列を使う方がシンプル
```

### ベストプラクティス

1. **基本は文字列を使う**（厳密でわかりやすい）
2. **本当に必要な時だけ正規表現を使う**（柔軟性が必要な場合のみ）
3. **テストの意図を明確にする**（コードを読んだ人が理解しやすいように）

### 参考：getByRole が参照するもの

`getByRole()` はアクセシビリティツリーを参照します。具体的には：

1. **要素のテキストコンテンツ**
```tsx
<button>操作ボタン</button>
```

2. **aria-label 属性**
```tsx
<button aria-label="操作ボタン">送信</button>
```

3. **aria-labelledby で参照されるテキスト**
```tsx
<span id="label">操作ボタン</span>
<button aria-labelledby="label">👆</button>
```

**注意：** CSS クラス（Tailwind CSS を含む）は `name` のマッチングには**影響しません**。CSS は見た目だけを変更するためです。

---

## まとめ

- **ブラウザインストール**: ローカルでは Playwright バージョンごとに1回、CI/CD では毎回（自動化）
- **要素選択**: 基本は文字列（厳密）、必要な場合のみ正規表現（柔軟）
- **堅牢性**: より厳密な方が保守性の高いテストになる

---

_最終更新: 2025-11-30_

