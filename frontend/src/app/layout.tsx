import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RENT MEYRAM - Кино жабдықтарын жалға алу",
  description: "Профессионалды кино жабдықтарын жалға беру",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='none' stroke='%232563eb' stroke-width='3' stroke-dasharray='10 5'/><circle cx='50' cy='50' r='30' fill='none' stroke='%232563eb' stroke-width='2' stroke-dasharray='6 3'/><circle cx='50' cy='50' r='15' fill='%232563eb'/></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kk" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full flex flex-col`}>
        <AuthProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
