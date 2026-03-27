import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smoke Alarm",
  description: "Health dashboard for your apps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
