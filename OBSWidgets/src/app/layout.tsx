import type { Metadata } from "next";
import "./globals.css";
import "@radix-ui/themes/styles.css";

export const metadata: Metadata = {
  title: "getphily's OBS Widgets",
  description: "Custom stream overlays by getphily",
};

import ThemeProvider from "./ThemeProvider";
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>
          <Toaster position="top-center" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
