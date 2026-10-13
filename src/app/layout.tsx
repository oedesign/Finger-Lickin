import type { Metadata } from "next";
import { validatePublicEnv } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Finger-Lickin",
    template: "%s | Finger-Lickin",
  },
  description: "The application foundation for the Finger-Lickin marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  validatePublicEnv();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
