
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
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  BarChart2, 
  Upload, 
  ClipboardList, 
  User, 
  Users, 
  FileText, 
  Share2, 
  Folder, 
  MessageSquare,
  Home 
} from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
}

const CustomerLinks: SidebarLinkProps[] = [
  { to: "/customer/dashboard", icon: Home, label: "Dashboard" },
  { to: "/customer/upload", icon: Upload, label: "Upload Documents" },
  { to: "/customer/status", icon: ClipboardList, label: "View Status" },
];

const AdminLinks: SidebarLinkProps[] = [
  { to: "/admin/dashboard", icon: BarChart2, label: "Dashboard" },
  { to: "/admin/customers", icon: Users, label: "Customer List" },
  { to: "/admin/review", icon: FileText, label: "Review Documents" },
  { to: "/admin/share", icon: Share2, label: "Share with Bank" },
  { to: "/admin/new-customer", icon: User, label: "New Customer" },
];

const BankLinks: SidebarLinkProps[] = [
  { to: "/bank/dashboard", icon: BarChart2, label: "Dashboard" },
  { to: "/bank/documents", icon: Folder, label: "Shared Documents" },
  { to: "/bank/notes", icon: MessageSquare, label: "View Notes" },
];

const AppSidebar = () => {
  const { role } = useUser();
  const { state: sidebarState } = useSidebar();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? "bg-bharti-blueLight text-white font-medium" : "hover:bg-sidebar-accent/50";
  
  const links = role === "Customer" ? CustomerLinks :
               role === "Admin" ? AdminLinks :
               role === "Bank" ? BankLinks : [];
  
  const isCollapsed = sidebarState === "collapsed";
  
  return (
    <Sidebar 
      variant="inset" 
      side="left" 
      className="border-r border-gray-200 w-60 h-full"
    >
      <SidebarContent>
        <SidebarGroup className="pt-8">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={link.to} 
                      className={isActive(link.to) ? "bg-bharti-blueLight text-white font-medium" : "hover:bg-sidebar-accent/50"}
                    >
                      <link.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{link.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
