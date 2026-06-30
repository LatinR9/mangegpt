import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubGroup Manager",
  description: "Private admin tool for shared subscription groups"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
