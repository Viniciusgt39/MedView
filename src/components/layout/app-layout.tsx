
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, Users, Settings, Stethoscope } from "lucide-react"; // Use Stethoscope icon

import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    // Check if the current pathname starts with the given path.
    // For the dashboard ('/'), check for exact match.
    return path === '/' ? pathname === path : pathname.startsWith(path);
  };

  return (
    <SidebarProvider defaultOpen={true} collapsible="icon">
      <Sidebar>
        <SidebarHeader className="items-center">
           <Stethoscope className="size-6 text-primary" />
           <span className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">
             NexusView
           </span>
           <SidebarTrigger className="ml-auto md:hidden" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Dashboard"
                isActive={isActive('/')}
              >
                <Link href="/">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Pacientes"
                isActive={isActive('/patients')}
              >
                <Link href="/patients">
                  <Users />
                  <span>Pacientes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Relatórios"
                isActive={isActive('/reports')}
              >
                <Link href="/reports">
                  <BarChart3 />
                  <span>Relatórios</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Configurações"
                isActive={isActive('/settings')}
              >
                <Link href="/settings">
                  <Settings />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        {/* Wrap footer content in a Link to the profile page */}
        <Link href="/profile" className="block group/profile-link" title="Ver Perfil">
          <SidebarFooter className="items-center gap-3 group-hover/profile-link:bg-sidebar-accent transition-colors">
             <Avatar className="size-8">
               {/* Placeholder image for doctor */}
               <AvatarImage src="https://picsum.photos/id/237/32/32" data-ai-hint="doctor avatar" alt="Dr. Profile" />
               <AvatarFallback>RA</AvatarFallback> {/* Initials for Dr. Ricardo Alves */}
             </Avatar>
             <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
               <span className="font-medium">Dr. Ricardo Alves</span> {/* Updated Name */}
               <span className="text-muted-foreground">Médico</span>
             </div>
          </SidebarFooter>
        </Link>
      </Sidebar>
      {/* Main content area */}
      <SidebarInset className="p-4 md:p-6">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
