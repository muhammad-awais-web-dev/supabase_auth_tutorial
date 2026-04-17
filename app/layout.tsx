import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/providers/auth-provider";
import { ProjectsProvider } from "@/providers/project-provider";

const outfitHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "ProjectFlow",
    template: "%s | ProjectFlow",
  },
  description:
    "ProjectFlow is a collaborative workspace for managing projects, assigning members, and tracking team tasks with secure Supabase authentication.",
  openGraph: {
    title: "ProjectFlow",
    description:
      "Manage projects, assign members, and track progress in a fast, secure team workspace powered by Supabase.",
    type: "website",
    siteName: "ProjectFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProjectFlow",
    description:
      "A collaborative project workspace with member management, task tracking, and secure authentication.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        outfitHeading.variable,
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-full w-full flex flex-col"
      >
        <AuthProvider>
          <ProjectsProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider delayDuration={0}>
                <SidebarProvider>
                  <AppSidebar />
                  <main className=" bg-background w-full h-screen flex flex-col ">
                    <SidebarTrigger size={"icon-lg"} />
                    {children}
                  </main>
                </SidebarProvider>
              </TooltipProvider>
            </ThemeProvider>
          </ProjectsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
