import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { NotificationProvider } from "@/components/ui/NotificationSystem";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ThikaBizHub - Your Premier Local Business Directory",
  description: "Discover, connect, and thrive with local businesses in Thika, Kenya. Find verified businesses, exclusive deals, and share your experiences.",
  keywords: "Thika, Kenya, business directory, local businesses, deals, discounts, premium directory",
  authors: [{ name: "ThikaBizHub Team" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "ThikaBizHub - Your Premier Local Business Directory",
    description: "Connecting you with the best local businesses in Thika, Kenya",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1B4332",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} scroll-smooth`} data-scroll-behavior="smooth">
      <body className="font-sans antialiased bg-[#FAFAF8] text-neutral-900">
        <NotificationProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </NotificationProvider>
      </body>
    </html>
  );
}
