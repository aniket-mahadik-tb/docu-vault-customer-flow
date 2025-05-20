
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { FileText, User, ArrowLeft } from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
}

const CustomerLinks: SidebarLinkProps[] = [
  { to: "/customer/upload", icon: FileText, label: "Upload Documents" },
  { to: "/customer/status", icon: FileText, label: "View Status" },
];

const AdminLinks: SidebarLinkProps[] = [
  { to: "/admin/dashboard", icon: FileText, label: "Dashboard" },
  { to: "/admin/users", icon: User, label: "Manage Users" },
];

const BankLinks: SidebarLinkProps[] = [
  { to: "/bank/dashboard", icon: FileText, label: "Dashboard" },
  { to: "/bank/documents", icon: FileText, label: "View Documents" },
];

const AppSidebar = () => {
  const { role } = useUser();
  const { state: sidebarState } = useSidebar();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";
  
  const links = role === "Customer" ? CustomerLinks :
               role === "Admin" ? AdminLinks :
               role === "Bank" ? BankLinks : [];
  
  const isCollapsed = sidebarState === "collapsed";
  
  return (
    <Sidebar variant="inset" side="left">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <NavLink to={link.to} className={getNavClass}>
                      <link.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{link.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={getNavClass}>
                    <ArrowLeft className="h-4 w-4" />
                    {!isCollapsed && <span>Back to Home</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
