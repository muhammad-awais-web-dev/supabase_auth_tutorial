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
          <DialogContent>
            <DialogTitle>Sign Up Form</DialogTitle>
            <DialogDescription>
              This is where the login/signup form will go. You can create a
              separate component for the form and include it here.
            </DialogDescription>
          </DialogContent>
        </Dialog>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                <LogIn />
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">
                    User Not Logged In
                  </span>
                  <span className="truncate text-xs">Login/Signup</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <LogIn />
                Login
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserPlus />
                Sign Up
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
