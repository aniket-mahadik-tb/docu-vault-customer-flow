import React, { useEffect, useState } from "react";
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
  Home,
  Shield
} from "lucide-react";

import { CustomerLinks, AdminLinks, SuperAdminLinks, BankLinks } from "@/utils/globalConstants";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDocumentUploadService } from "@/services/documentUploadService";

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
}

const AppSidebar = () => {
  // const { role } = useUser();
  const { state: sidebarState } = useSidebar();
  const location = useLocation();
  const [Role, SetRole] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const { getValueFromLocalStorage } = useLocalStorage();
  const documentUploadService = useDocumentUploadService();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const roleFromStorage = getValueFromLocalStorage("role");
    SetRole(roleFromStorage);

    if (roleFromStorage === "Customer") {
      setLinks(CustomerLinks);
    } else if (roleFromStorage === "INTERNAL_USER") {
      setLinks(AdminLinks);
    } else if (roleFromStorage === "SUPER_ADMIN") {
      setLinks(SuperAdminLinks);
    } else if (roleFromStorage === "BANK") {
      setLinks(BankLinks);
    } else {
      setLinks([]);
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-bharti-blueLight text-white font-medium" : "hover:bg-sidebar-accent/50";

  // const links = role === "Customer" ? CustomerLinks :
  //   role === "Admin" ? AdminLinks :
  //     role === "Bank" ? BankLinks : [];

  const getLinksByRole = (role: string) => {
    switch (role) {
      case "INTERNAL_USER":
        return AdminLinks;
      case "SUPER_ADMIN":
        return SuperAdminLinks;
      case "BANK":
        return BankLinks;
      case "Customer": {
        return CustomerLinks;
      }
      default:
        return []; // ✨ fallback if no role found
    }
  };

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