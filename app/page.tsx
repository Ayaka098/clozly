import AppClient from "@/components/AppClient";
import AuthBar from "@/components/AuthBar";

export default function Home() {
  return (
    <>
      <header className="topbar">
        <div className="brand">
          <h1>Clozly</h1>
        </div>
        <nav className="tabs">
          <a className="tab" href="#search">服を探す</a>
          <a className="tab" href="#basics">基本情報</a>
          <a className="tab" href="#account">アカウント</a>
        </nav>
        <AuthBar />
      </header>
      <main>
        <section className="hero card fade-in">
          <div>
            <h2>検索ではなく、判断の代行。</h2>
            <p>
              入力された意図から複数クエリを生成し、Amazon/ZOZOの候補を収集。
              その中から本当に刺さる4件だけを編集して提示します。
            </p>
          </div>
          <div className="hero-visual">
            <div className="tile" />
            <div className="tile" />
            <div className="tile" />
          </div>
        </section>
        <AppClient />
      </main>
    </>
  );
}
