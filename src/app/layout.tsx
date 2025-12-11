import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider, MarketplaceProvider, AuthProvider } from "@/providers";
import { Header, Footer } from "@/components/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KINETIC | RWA Training Data Marketplace",
  description: "Upload, license, and monetize real-world skill videos as IP-protected NFTs on Story Protocol. Verified training data for AI/ML models.",
  keywords: ["Web3", "Story Protocol", "IP NFT", "Training Data", "AI", "Machine Learning", "World ID", "IPFS", "Blockchain"],
  authors: [{ name: "KINETIC" }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: "KINETIC | RWA Training Data Marketplace",
    description: "Upload, license, and monetize real-world skill videos as IP-protected NFTs on Story Protocol",
    type: "website",
    images: ['/logo.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-950 cyber-grid`}
      >
        <Web3Provider>
          <AuthProvider>
            <MarketplaceProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </MarketplaceProvider>
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
