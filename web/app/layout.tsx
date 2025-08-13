import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Position Calculator",
  description: "DCA position calculator with stage-based dynamic TP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


