# GitHub ブランチ保護設定ガイド

このドキュメントでは、GitHub Actions の CI/CD テストを活用し、テストが通らないコードを `main` ブランチにマージさせないための設定方法を解説します。

---

## 目次

1. [なぜブランチ保護が必要か](#なぜブランチ保護が必要か)
2. [設定方法①：Rulesets（新機能）](#設定方法rulesets新機能)
3. [設定方法②：Branch Protection Rules（従来）](#設定方法branch-protection-rules従来)
4. [2つの方法の比較](#2つの方法の比較)
5. [トラブルシューティング](#トラブルシューティング)

---

## なぜブランチ保護が必要か

### 問題：デフォルトではテスト失敗でもマージできる

GitHub Actions でテストを実行しても、**デフォルトではテストが失敗していてもマージボタンが押せてしまいます**。

```
開発者がマージ → CI実行 → テスト失敗 → でも main にはすでにバグが入っている 😱
```

### 解決：ブランチ保護ルール

ブランチ保護ルールを設定することで：

| テスト結果 | マージボタンの状態 |
|-----------|------------------|
| ✅ 成功 | 緑色（押せる） |
| ⏳ 実行中 | 黄色（押せない） |
| ❌ 失敗 | 灰色（押せない） |

テストが通らないコードは物理的にマージできなくなります。

---

## 設定方法①：Rulesets（新機能）

GitHub が提供する新しいブランチ保護機能です。より柔軟で強力な設定が可能です。

### 手順

#### 1. 設定画面に移動

```
リポジトリの Settings → Rules → Rulesets → New branch ruleset
```

#### 2. 基本設定

**Ruleset Name**

```
例: Protect main branch
```

**Enforcement status**

```
Disabled → Active に変更
```

#### 3. Target branches を設定

1. **「Add target」** ボタンをクリック
2. **「Include default branch」** を選択

これで `main` ブランチが対象になります。

#### 4. Rules を設定

以下のルールを有効化します：

##### ☑️ **Require status checks to pass**（必須）

CI/CD のテストを必須にする設定。

1. チェックボックスをオン
2. **「Add checks」** ボタンをクリック
3. 検索欄に **「test」** と入力
4. **「test - GitHub Actions」** を選択

**重要:** これを設定しないと、どのテストを必須にするか指定されていないため、効果がありません。

##### 追加設定（任意）

- **「Require branches to be up to date before merging」**
  - マージ前に最新のコードでテストを実行
  
- **「Do not require status checks on creation」**
  - ブランチ作成時はチェックを必須にしない

##### ☑️ **Block force pushes**（推奨）

強制プッシュを防ぎます。

##### ☑️ **Restrict deletions**（推奨）

ブランチの削除を制限します。

#### 5. 保存

画面下部の **「Create」** ボタンをクリック

---

## 設定方法②：Branch Protection Rules（従来）

従来からある設定方法。シンプルで直感的です。

### 手順

#### 1. 設定画面に移動

```
リポジトリの Settings → Branches
```

#### 2. ルールを追加

**「Add branch protection rule」** ボタンをクリック

#### 3. Branch name pattern を入力

```
main
```

または

```
master
```

#### 4. 保護ルールを設定

##### ☑️ **Require a pull request before merging**（任意）

Pull Request なしでの直接 push を防ぎます。

- **「Require approvals」** - レビュー数を設定（例: 1人以上）
- **「Dismiss stale pull request approvals when new commits are pushed」** - 新しいコミットでレビューをリセット

##### ☑️ **Require status checks to pass before merging**（必須）

CI/CD のテストを必須にする設定。

1. チェックボックスをオン
2. 検索欄に **「test」** と入力
3. **「test」** を選択
4. ☑️ **「Require branches to be up to date before merging」**（推奨）
   - マージ前に最新のコードでテストを実行

##### ☑️ **Require conversation resolution before merging**（任意）

PR のすべてのコメントが解決されるまでマージできません。

##### ☑️ **Include administrators**（推奨）

管理者にもルールを適用します。

##### ☑️ **Do not allow bypassing the above settings**（推奨）

誰もこのルールをバイパスできなくなります（管理者を含む）。

##### その他の設定

- **「Require linear history」** - マージコミットを禁止（Squash/Rebase のみ）
- **「Require deployments to succeed before merging」** - デプロイ成功を必須に
- **「Lock branch」** - ブランチを読み取り専用に
- **「Do not allow bypassing the above settings」** - ルールのバイパスを禁止

#### 5. 保存

画面下部の **「Create」** または **「Save changes」** をクリック

---

## 2つの方法の比較

| 項目 | Rulesets（新） | Branch Protection Rules（従来） |
|------|--------------|--------------------------------|
| **UI** | モダンだが複雑 | シンプルで直感的 |
| **設定場所** | Settings → Rules → Rulesets | Settings → Branches |
| **柔軟性** | 高い（複数ブランチ、条件分岐） | 基本的な保護のみ |
| **対象ブランチ** | 複数パターン、タグも可能 | 1パターンのみ |
| **バイパスリスト** | ロール・チーム・アプリ単位 | 人・チーム単位 |
| **機能** | 新機能が追加される | 安定している |
| **学習コスト** | やや高い | 低い |
| **推奨ケース** | 複雑なルールが必要 | シンプルな保護で十分 |

### どちらを使うべきか？

#### Rulesets を推奨する場合

- 複数のブランチパターンに同じルールを適用したい
- より細かい制御が必要
- 最新機能を使いたい

#### Branch Protection Rules を推奨する場合

- シンプルに `main` ブランチだけ保護したい
- 設定が直感的でわかりやすい
- 安定した機能で十分

**結論:** 小規模プロジェクトやシンプルな要件なら、**どちらでも OK** です。

---

## トラブルシューティング

### Q1: テストが失敗してもマージできてしまう

**原因:**
- ブランチ保護ルールが設定されていない
- ステータスチェック名が間違っている

**解決策:**
1. ブランチ保護ルールが有効か確認
2. 「test」が Status checks に追加されているか確認
3. Enforcement status が「Active」になっているか確認

### Q2: 「test」が検索で見つからない

**原因:**
- まだ一度も GitHub Actions が実行されていない

**解決策:**
1. PR を作成するか、対象ブランチに push する
2. GitHub Actions が一度実行されると、検索に表示される
3. または手動で「test」と入力して追加

### Q3: CI が実行されているのにステータスが表示されない

**原因:**
- GitHub Actions のワークフローが対象ブランチで実行されていない

**解決策:**

`.github/workflows/playwright.yml` の `on` セクションを確認：

```yaml
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
```

`dev` ブランチで実行したい場合は、以下を追加：

```yaml
on:
  push:
    branches: [ main, master, dev ]
  pull_request:
    branches: [ main, master, dev ]
```

### Q4: ステータスチェック名がわからない

**確認方法:**

`.github/workflows/playwright.yml` を確認：

```yaml
name: Playwright Tests  # ← ワークフロー名
jobs:
  test:                 # ← これがステータスチェック名
    timeout-minutes: 60
    runs-on: ubuntu-latest
```

GitHub では **ジョブ名**（`test`）がステータスチェックとして認識されます。

### Q5: 設定したのに効果がない

**確認ポイント:**

1. **Target branches が正しいか**
   - `main` または `master` など、保護したいブランチが対象になっているか

2. **Enforcement status が Active か**
   - Disabled のままだと効果がない

3. **具体的なチェックが追加されているか**
   - 「No checks have been added」のままだと効果がない

4. **正しいブランチで作業しているか**
   - `dev` ブランチから `main` への PR でないと、ルールが適用されない

---

## まとめ

- **ブランチ保護ルールは必須**：テストが通らないコードをマージさせない
- **2つの設定方法がある**：Rulesets（新）と Branch Protection Rules（従来）
- **どちらでも OK**：小規模プロジェクトならどちらも同じように機能する
- **ステータスチェック名は「test」**：ワークフローの job 名が重要

---

## 参考リンク

- [GitHub Docs - Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs - Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub Actions - Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

---

_最終更新: 2025-11-30_

