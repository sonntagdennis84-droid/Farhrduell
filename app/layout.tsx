import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fahrduell",
  description: "Das Fahrlehrer-Quiz",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/fahrduell.svg",
    apple: "/icons/fahrduell.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#08182E"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
