import type { Metadata } from "next";

export const metadata: Metadata = {
  title: '最初のページ',
  description: 'Playwrightハンズオンの初期ステップ',
};

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Playwrightハンズオン</h1>
      <p className="text-lg mb-2">あなたは1週間後にE2Eのエキスパートです。</p>
      <p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
          操作ボタン
        </button>
      </p>
    </main>
  )
}