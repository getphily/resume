import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "getphily's OBS Widgets",
  description: "Custom stream overlays by getphily",
};

import ThemeProvider from "./ThemeProvider";
import { Toaster } from 'react-hot-toast';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={cn("font-sans", geist.variable)}>
      <body>
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>
            <Toaster position="top-center" />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
