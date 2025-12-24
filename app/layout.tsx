import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idea Bank - Research Your Ideas",
  description: "Intelligent idea bank with passive background research",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
