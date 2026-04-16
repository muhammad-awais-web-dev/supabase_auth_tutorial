"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { MoreHorizontalIcon, FolderIcon, ArrowRightIcon, Trash2Icon } from "lucide-react"
import type { Database } from "@/types/supabase"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import Link from "next/link"


export function NavProjects({

  
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  type Projects = Database["public"]["Views"]["project_details_with_managers"]["Row"][]
  const { isMobile } = useSidebar()
  const [projectsData, setProjectsData] = useState<Projects>([])

  useEffect(()=>{
    const supabase = createClient()
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("project_details_with_managers")
        .select("*")
      if (error) {
        console.error("Error fetching projects:", error)
      } else {
        setProjectsData(data)
      }
    }
    fetchProjects()
  }, [])

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projectsData.map((item) => (
          <SidebarMenuItem key={item.project_name}>
            <SidebarMenuButton asChild>
              <Link href={`/project/${item.project_id}`} className="flex items-center gap-2">
                <span className="text-sm" >{item.project_name}<span className=" text-foreground/50 text-xs " > - {item.manager_display_name || item.manager_username || "No Manager"}</span></span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="aria-expanded:bg-muted"
                >
                  <MoreHorizontalIcon
                  />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <FolderIcon className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowRightIcon className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2Icon className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontalIcon className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
