"use client";

import { useAuth } from "@/providers/auth-provider";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronsUpDownIcon,
  SparklesIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
  LogIn,
  User,
  UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoginDialog from "@/components/dialog/login";
import SignUpDialog from "@/components/dialog/signup";

export function NavUserLoggedOut({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const {
    session,
    signInWithPassword,
    signOut,
    signUpWithPassword,
    profile,
    role,
  } = useAuth();
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog>
          <DialogTrigger asChild>
            <SidebarMenuButton
              // size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <LogIn />
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate text-xs">Login</span>
              </div>
            </SidebarMenuButton>
          </DialogTrigger>
          <LoginDialog/>
        </Dialog>
                <Dialog>
          <DialogTrigger asChild>
            <SidebarMenuButton
              // size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserPlus />
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate text-xs">Sign Up</span>
              </div>
            </SidebarMenuButton>
          </DialogTrigger>
          <SignUpDialog/>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
