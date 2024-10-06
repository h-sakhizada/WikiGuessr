import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import "./globals.css";
import Providers from "./providers";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "WikiGuessr",
  description: "Discover the thrill of knowledge with our unique game that challenges users to identify Wikipedia articles from curated fragments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground flex flex-col min-h-screen">
        <Providers>
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
              <div className="flex gap-5 items-center font-semibold">
                <Link href={"/"}>WikiGuessr</Link>
              </div>
              <div className="flex gap-2">
                <HeaderAuth />
                <ThemeSwitcher />
              </div>
            </div>
          </nav>
          <main className="flex-grow flex flex-col items-center">
            <div className="w-full max-w-5xl p-5 flex flex-col flex-grow">
              {children}
            </div>
          </main>
          <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-4">
            <p>&copy; 2024 Half Baked Games.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
