"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Home, LayoutGrid, Gamepad2, ShieldCheck, Trophy, UserCog, UserRound, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainLinks = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/activities", label: "Actividades", icon: LayoutGrid },
  { href: "/didacticas", label: "Didácticas", icon: Gamepad2 },
  { href: "/my-activities", label: "Mis actividades aprobadas", icon: Trophy },
  { href: "/profile", label: "Mi perfil", icon: UserRound },
];

const adminLinks = [
  { href: "/admin/users", label: "Usuarios", icon: UserCog },
  { href: "/admin/groups", label: "Grupos", icon: Users },
  { href: "/admin/activities", label: "Actividades", icon: ShieldCheck },
  { href: "/admin/didacticas", label: "Didácticas", icon: Gamepad2 },
];

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <GraduationCap className="size-5" />
          <span className="text-sm font-semibold">Activity</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton render={<Link href={link.href} />} isActive={pathname.startsWith(link.href)}>
                    <link.icon />
                    <span>{link.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminLinks.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton render={<Link href={link.href} />} isActive={pathname.startsWith(link.href)}>
                      <link.icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
