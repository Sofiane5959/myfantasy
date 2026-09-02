import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyFantasy",
  description: "Pour toi. Tes désirs. Ton tempo.",
  // Application à contenu adulte et données sensibles : pas d'indexation.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#08060D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)] antialiased">
        {children}
      </body>
    </html>
  );
}
