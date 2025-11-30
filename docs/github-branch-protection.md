# GitHub ブランチ保護設定ガイド

このドキュメントでは、GitHub Actions の CI/CD テストを活用し、テストが通らないコードを `main` ブランチにマージさせないための設定方法を解説します。

---

## 目次

1. [なぜブランチ保護が必要か](#なぜブランチ保護が必要か)
2. [⚠️ 重要：プライベートリポジトリの制限](#重要プライベートリポジトリの制限)
3. [設定方法 ①：Rulesets（新機能）](#設定方法rulesets新機能)
4. [設定方法 ②：Branch Protection Rules（従来）](#設定方法branch-protection-rules従来)
5. [2 つの方法の比較](#2つの方法の比較)
6. [Pull Request のマージ方法](#pull-request-のマージ方法)
7. [トラブルシューティング](#トラブルシューティング)

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
| ---------- | ------------------ |
| ✅ 成功    | 緑色（押せる）     |
| ⏳ 実行中  | 黄色（押せない）   |
| ❌ 失敗    | 灰色（押せない）   |

テストが通らないコードは物理的にマージできなくなります。

---

## ⚠️ 重要：プライベートリポジトリの制限

### GitHub Free プランの制限

**プライベートリポジトリでは、ブランチ保護機能が使えません。**

設定画面に以下の警告が表示されます：

```
⚠️ Your rules won't be enforced on this private repository until you
move to a GitHub Team or Enterprise organization account.
```

### プランごとの機能比較

| 機能                          | パブリックリポジトリ | プライベート（Free） | プライベート（Team/Enterprise） |
| ----------------------------- | -------------------- | -------------------- | ------------------------------- |
| **Rulesets**                  | ✅ 使える            | ❌ 使えない          | ✅ 使える                       |
| **Classic Branch Protection** | ✅ 使える            | ❌ 使えない          | ✅ 使える                       |
| **GitHub Actions**            | ✅ 使える            | ✅ 使える            | ✅ 使える                       |

### 解決策

プライベートリポジトリでブランチ保護を使いたい場合、以下の選択肢があります：

#### 1. リポジトリをパブリックにする（推奨：学習目的の場合）

**メリット:**

- ブランチ保護機能が無料で使える
- Rulesets も Branch Protection Rules も使える
- 追加コストなし

**デメリット:**

- コードが公開される
- センシティブな情報は置けない

**手順:**

```
Settings → General → Danger Zone → Change visibility → Change to public
```

#### 2. GitHub Team プランにアップグレード（推奨：本番環境の場合）

**メリット:**

- プライベートのままブランチ保護が使える
- チーム機能も利用可能

**デメリット:**

- 月額 $4/ユーザー の費用がかかる

**料金:**

- GitHub Team: $4/ユーザー/月（年払い）

#### 3. ブランチ保護なしで運用（非推奨）

**メリット:**

- 無料
- プライベートのまま

**デメリット:**

- テスト失敗でもマージできてしまう
- チームの規律に依存する
- バグが混入しやすい

**注意:** GitHub Actions のテストは実行されますが、テスト失敗でもマージボタンは押せてしまいます。

### どの選択肢を選ぶべきか？

| ケース                      | 推奨                        |
| --------------------------- | --------------------------- |
| 学習・ハンズオン            | パブリックにする            |
| 個人プロジェクト（公開 OK） | パブリックにする            |
| 個人プロジェクト（非公開）  | ブランチ保護なしで運用      |
| チーム開発（本番環境）      | Team プランにアップグレード |
| 企業プロジェクト            | Enterprise プラン           |

---

## 設定方法 ①：Rulesets（新機能）

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

## 設定方法 ②：Branch Protection Rules（従来）

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

- **「Require approvals」** - レビュー数を設定（例: 1 人以上）
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

## 2 つの方法の比較

| 項目               | Rulesets（新）                 | Branch Protection Rules（従来） |
| ------------------ | ------------------------------ | ------------------------------- |
| **UI**             | モダンだが複雑                 | シンプルで直感的                |
| **設定場所**       | Settings → Rules → Rulesets    | Settings → Branches             |
| **柔軟性**         | 高い（複数ブランチ、条件分岐） | 基本的な保護のみ                |
| **対象ブランチ**   | 複数パターン、タグも可能       | 1 パターンのみ                  |
| **バイパスリスト** | ロール・チーム・アプリ単位     | 人・チーム単位                  |
| **機能**           | 新機能が追加される             | 安定している                    |
| **学習コスト**     | やや高い                       | 低い                            |
| **推奨ケース**     | 複雑なルールが必要             | シンプルな保護で十分            |

### どちらを使うべきか？

#### Rulesets を推奨する場合

- 複数のブランチパターンに同じルールを適用したい
- より細かい制御が必要
- 最新機能を使いたい

#### Branch Protection Rules を推奨する場合

- シンプルに `main` ブランチだけ保護したい
- 設定が直感的でわかりやすい
- 安定した機能で十分

**結論:** 小規模プロジェクトやシンプルな要件なら、**Branch Protection Rules がお勧め** です。

### 学習目的でのお勧め

**Branch Protection Rules（従来）を推奨します：**

1. **シンプルで直感的**

   - 設定項目が一画面に並んでいる
   - チェックボックスで視覚的にわかりやすい

2. **学習目的に最適**

   - 基本的なブランチ保護を理解するのに十分
   - Rulesets は複雑な要件がある場合に使う

3. **安定している**

   - 長年使われている機能
   - トラブルシューティング情報が豊富

4. **ドキュメントが豊富**
   - 学習リソースが多い
   - 問題解決しやすい

**Rulesets が必要になるケース:**

- 複数のブランチパターンに同じルールを適用したい
- タグの保護も必要
- より細かい権限制御が必要

---

## Pull Request のマージ方法

Pull Request を承認してマージする際、GitHub は 3 つのマージ方法を提供しています。それぞれの違いを理解して、プロジェクトに適した方法を選びましょう。

### 1. Create a merge commit（マージコミット作成）

**コミット履歴：**

```
main: A---B-------M
              \  /
dev:           C-D
```

**特徴：**

- すべてのコミット履歴が残る
- マージコミット（M）が作成される
- ブランチの分岐・統合が視覚的にわかる

**メリット：**

- 完全な履歴の追跡が可能
- どのコミットがどの PR から来たか明確
- ブランチの開発フローが可視化される

**デメリット：**

- 履歴が複雑になる（特に多数のブランチがある場合）
- マージコミットが増えて履歴が読みにくくなる
- グラフが複雑になる

**いつ使う？**

- チーム開発で詳細な履歴を残したい
- 誰がいつ何をしたか完全に追跡したい
- 大規模プロジェクトでのリリース管理

---

### 2. Squash and merge（スカッシュマージ）✨ 推奨

**コミット履歴：**

```
main: A---B---C'

(dev ブランチの C と D が 1 つのコミット C' にまとまる)
```

**特徴：**

- **複数のコミットを 1 つにまとめる**
- main ブランチがシンプルで見やすい
- 細かい修正コミット（typo 修正、lint 修正など）が消える

**メリット：**

- main ブランチの履歴が非常にシンプル
- 1 つの PR = 1 つのコミット
- 意味のある変更単位で履歴が残る
- 後から `git log` で読みやすい

**デメリット：**

- ブランチでの個々のコミット履歴は失われる
- 詳細な開発プロセスが見えなくなる

**いつ使う？**

- **個人開発やハンズオン**（最もお勧め） ✅
- main ブランチをきれいに保ちたい
- PR 単位での履歴管理で十分
- **初心者におすすめ**

---

### 3. Rebase and merge（リベースマージ）

**コミット履歴：**

```
main: A---B---C---D

(dev ブランチの C と D が main の先端に追加される)
```

**特徴：**

- コミットを 1 つずつ main に追加
- マージコミットなし
- 完全に線形の履歴

**メリット：**

- 履歴が一直線で読みやすい
- マージコミットがない
- すべてのコミットが時系列で並ぶ

**デメリット：**

- コミット履歴が書き換えられる（SHA が変わる）
- どのコミットが同じ PR なのかわかりにくい
- すべてのコミットが意味のあるメッセージである必要がある

**いつ使う？**

- すべてのコミットが意味のある変更
- 線形の履歴を好む場合
- Git に慣れたユーザー

---

## マージ方法の選び方

### プロジェクトタイプ別の推奨

| プロジェクトタイプ | 推奨方法 | 理由 |
| ------------------ | ---------------- | ---------------------------------------- |
| 学習・ハンズオン | Squash and merge | シンプルで理解しやすい |
| 個人プロジェクト | Squash and merge | main ブランチがきれい |
| 小規模チーム | Squash and merge | PR 単位での管理が簡単 |
| 大規模チーム | Create a merge commit | 詳細な履歴の追跡が必要 |
| OSS プロジェクト | Squash and merge | コントリビューターの細かいコミットを統合 |

### 迷ったら

**Squash and merge を選んでください。**

理由：

1. ✅ main ブランチの履歴がシンプル
2. ✅ 学習目的に最適
3. ✅ 細かい修正が 1 つにまとまる
4. ✅ 後から履歴を読むのが簡単

---

## マージ時の注意点

### ⚠️ Bypass rules にチェックしない

Pull Request 画面で以下の表示が出る場合があります：

```
☑ Merge without waiting for requirements to be met (bypass rules)
```

**このチェックボックスは外してください。**

これは**ブランチ保護ルールを無視する**設定です。チェックすると：

- テスト失敗でもマージできてしまう
- レビューなしでマージできてしまう
- ブランチ保護の意味がなくなる

管理者権限がある場合のみ表示されますが、基本的に使うべきではありません。

---

## Git コマンドでのマージ（参考）

GitHub 画面ではなく、コマンドラインでマージする場合：

### Merge commit の場合

```bash
git checkout main
git merge dev
git push origin main
```

### Squash merge の場合

```bash
git checkout main
git merge --squash dev
git commit -m "Add feature X (#4)"
git push origin main
```

### Rebase merge の場合

```bash
git checkout dev
git rebase main
git checkout main
git merge dev
git push origin main
```

**注意:** Branch Protection Rules が有効な場合、コマンドラインからの直接 push はブロックされることがあります。基本的に Pull Request を使いましょう。

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
    branches: [main, master]
  pull_request:
    branches: [main, master]
```

`dev` ブランチで実行したい場合は、以下を追加：

```yaml
on:
  push:
    branches: [main, master, dev]
  pull_request:
    branches: [main, master, dev]
```

### Q4: ステータスチェック名がわからない

**確認方法:**

`.github/workflows/playwright.yml` を確認：

```yaml
name: Playwright Tests # ← ワークフロー名
jobs:
  test: # ← これがステータスチェック名
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
- **2 つの設定方法がある**：Rulesets（新）と Branch Protection Rules（従来）
- **どちらでも OK**：小規模プロジェクトならどちらも同じように機能する
- **ステータスチェック名は「test」**：ワークフローの job 名が重要

---

## 参考リンク

- [GitHub Docs - Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs - Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub Actions - Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

---

_最終更新: 2025-11-30_
