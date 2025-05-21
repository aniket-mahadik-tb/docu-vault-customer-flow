
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { FileText, User, ArrowLeft, Users, Share2, Folder, FileText as NoteIcon } from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
}

const CustomerLinks: SidebarLinkProps[] = [
  { to: "/customer/dashboard", icon: FileText, label: "Dashboard" },
  { to: "/customer/upload", icon: FileText, label: "Upload Documents" },
  { to: "/customer/status", icon: FileText, label: "View Status" },
];

const AdminLinks: SidebarLinkProps[] = [
  { to: "/admin/dashboard", icon: FileText, label: "Dashboard" },
  { to: "/admin/customers", icon: Users, label: "Customer List" },
  { to: "/admin/review", icon: FileText, label: "Review Documents" },
  { to: "/admin/share", icon: Share2, label: "Share with Bank" },
  { to: "/admin/new-customer", icon: User, label: "New Customer" },
];

const BankLinks: SidebarLinkProps[] = [
  { to: "/bank/dashboard", icon: FileText, label: "Dashboard" },
  { to: "/bank/documents", icon: Folder, label: "Shared Documents" },
  { to: "/bank/notes", icon: NoteIcon, label: "View Notes" },
];

const AppSidebar = () => {
  const { role, clearUser } = useUser();
  const { state: sidebarState } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";
  
  const links = role === "Customer" ? CustomerLinks :
               role === "Admin" ? AdminLinks :
               role === "Bank" ? BankLinks : [];
  
  const isCollapsed = sidebarState === "collapsed";
  
  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    clearUser(); // Clear user data when navigating back to home
    navigate("/");
  };
  
  return (
    <Sidebar 
      variant="inset" 
      side="left" 
      className="border-r border-gray-200 w-60 h-full"
    >
      <SidebarContent>
        {/* Increased padding-top from pt-4 to pt-8 to create more space below header */}
        <SidebarGroup className="pt-8">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={link.to} 
                      className={isActive(link.to) ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50"}
                    >
                      <link.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{link.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/" 
                    onClick={handleBackToHome} 
                    className="hover:bg-sidebar-accent/50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {!isCollapsed && <span>Back to Home</span>}
                  </a>
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
