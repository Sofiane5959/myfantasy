import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyFantasy",
  description: "Pour toi. Tes désirs. Ton tempo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
