"use client";

import * as React from "react";

import { useTheme } from "next-themes";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { NavUserLoggedOut } from "@/components/sidebar/loggedout/nav-user-logged-out";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: <BotIcon />,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: <BookOpenIcon />,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: <FrameIcon />,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: <PieChartIcon />,
    },
    {
      name: "Travel",
      url: "#",
      icon: <MapIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    session,
    signInWithPassword,
    signOut,
    signUpWithPassword,
    profile,
    role,
  } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {profile && <TeamSwitcher teams={data.teams} />}
      </SidebarHeader>
      <SidebarContent>
        {profile && (
          <>
            <NavMain items={data.navMain} />
            <NavProjects projects={data.projects} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        {theme === "light" ? (
          <SidebarMenuButton
            // size="lg"
            onClick={() => setTheme("dark")}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Moon />
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate text-xs">Dark Mode</span>
            </div>
          </SidebarMenuButton>
        ) : (
          <SidebarMenuButton
            // size="lg"
            onClick={() => setTheme("light")}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Sun />
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate text-xs">Light Mode</span>
            </div>
          </SidebarMenuButton>
        )}
        {profile ? (
          <NavUser user={data.user} />
        ) : (
          <NavUserLoggedOut user={data.user} />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
