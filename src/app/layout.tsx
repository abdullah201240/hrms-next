import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemedToaster } from "@/components/themed-toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Acme HR Portal", template: "%s · HR Portal" },
  description: "Human resource management portal",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // next-themes mutates <html class="dark"> on the client; suppress the
      // resulting attribute-only hydration diff.
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: browser extensions inject attributes (e.g.
          `cz-shortcut-listen`) onto <body>, which would otherwise trip a
          hydration mismatch. This is the Next/React-recommended guard. */}
      <body
        className="min-h-full flex flex-col print-hide"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
