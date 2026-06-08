import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー | 不平等割り勘ルーレット",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Noto Sans JP', sans-serif", color: "white", padding: "40px 20px 80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; }
        h2 { font-size: 16px; font-weight: 700; margin: 32px 0 10px; color: rgba(255,255,255,0.9); border-left: 3px solid #FF6B6B; padding-left: 10px; }
        p, li { font-size: 14px; line-height: 1.8; color: rgba(255,255,255,0.65); }
        ul { padding-left: 20px; margin: 8px 0; }
        a { color: #74C0FC; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>← トップに戻る</Link>
        </div>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 4, background: "linear-gradient(135deg, #FF6B6B, #FFD93D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>PRIVACY POLICY</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 32 }}>プライバシーポリシー</p>

        <p>本プライバシーポリシーは、「不平等割り勘ルーレット」（以下「本サービス」）における、利用者の個人情報および関連情報の取り扱いについて説明するものです。</p>

        <h2>アクセス解析ツールの利用について</h2>
        <p>本サービスでは、サービスの利用状況を把握するためにGoogle LLC（以下「Google」）が提供するGoogle Analyticsを利用しています。Google Analyticsはトラフィックデータの収集のためにCookieを使用しています。収集されるデータは匿名であり、個人を特定するものではありません。</p>
        <ul>
          <li>収集される情報：ページの閲覧数、滞在時間、アクセス元、使用デバイスなど</li>
          <li>データはGoogleのプライバシーポリシーに基づき管理されます</li>
          <li>ブラウザの設定によりCookieを無効化することで、データ収集を拒否することができます</li>
        </ul>
        <p>Google Analyticsの利用規約およびプライバシーポリシーについては、<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Googleのプライバシーポリシー</a>をご確認ください。</p>

        <h2>広告配信について</h2>
        <p>本サービスでは、Googleが提供するGoogle AdSenseを利用した広告を掲載する場合があります。Google AdSenseはCookieを使用して、利用者の興味・関心に基づいた広告を表示します。</p>
        <ul>
          <li>広告のカスタマイズにはCookieおよびデバイス識別子が使用されます</li>
          <li>収集された情報はGoogleのプライバシーポリシーに従い管理されます</li>
          <li><a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">広告設定ページ</a>からパーソナライズ広告を無効化することができます</li>
        </ul>

        <h2>Cookieについて</h2>
        <p>本サービスでは、利用者の利便性向上およびサービスの品質改善を目的として、Cookieを使用することがあります。ブラウザの設定によってCookieの受け取りを拒否することができますが、一部機能が利用できなくなる場合があります。</p>

        <h2>個人情報の収集について</h2>
        <p>本サービスは、ブラウザ上で動作するアプリケーションです。入力された金額・名前などのデータはすべてお使いのデバイス上のみで処理されており、サーバーへの送信・保存は行っておりません。</p>

        <h2>プライバシーポリシーの変更</h2>
        <p>本プライバシーポリシーは、法令の改正やサービス内容の変更に伴い、予告なく改定される場合があります。最新の内容は本ページにてご確認ください。</p>

        <h2>お問い合わせ</h2>
        <p>本プライバシーポリシーに関するご質問は、サービス運営者までお問い合わせください。</p>

        <p style={{ marginTop: 48, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>最終更新日：2026年6月8日</p>
      </div>
    </div>
  );
}
