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
  const [customerType, setCustomerType] = useState<string>("");
  const [links, setLinks] = useState([]);
  const { getValueFromLocalStorage } = useLocalStorage();
  const documentUploadService = useDocumentUploadService();

  useEffect(() => {
    const roleFromStorage = getValueFromLocalStorage("role");
    SetRole(roleFromStorage);

    const fetchCustomerTypeAndSetLinks = async () => {
      if (roleFromStorage === "Customer") {
        try {
          const response = await documentUploadService.getDocumentMasters();
          // response.data is an array
          const org = response.data.find(
            (item: any) => item.customerType?.toUpperCase() === "ORGANIZATION"
          );
          const individual = response.data.find(
            (item: any) => item.customerType?.toUpperCase() === "INDIVIDUAL"
          );
          if (org) {
            setCustomerType("Organization");
            setLinks(CustomerLinks);
          } else if (individual) {
            setCustomerType("Individual");
            setLinks(
              CustomerLinks.filter(
                (link) =>
                  link.to !== "/customer/addPromoter" &&
                  link.to !== "/customer/promoters"
              )
            );
          } else {
            setLinks(CustomerLinks);
          }
        } catch (error) {
          setLinks(CustomerLinks);
        }
      } else if (roleFromStorage === "Admin") {
        setLinks(AdminLinks);
      } else if (roleFromStorage === "SuperAdmin") {
        setLinks(SuperAdminLinks);
      } else if (roleFromStorage === "Bank") {
        setLinks(BankLinks);
      } else {
        setLinks([]);
      }
    };
    fetchCustomerTypeAndSetLinks();
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-bharti-blueLight text-white font-medium" : "hover:bg-sidebar-accent/50";

  // const links = role === "Customer" ? CustomerLinks :
  //   role === "Admin" ? AdminLinks :
  //     role === "Bank" ? BankLinks : [];

  const getLinksByRole = (role: string) => {
    switch (role) {
      case "Admin":
        return AdminLinks;
      case "SuperAdmin":
        return SuperAdminLinks;
      case "Bank":
        return BankLinks;
      case "Customer":
        return CustomerLinks;
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