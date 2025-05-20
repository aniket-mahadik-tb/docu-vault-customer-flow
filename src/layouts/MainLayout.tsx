
import React, { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";
import { useUser } from "@/contexts/UserContext";

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const MainLayout = ({ children, showSidebar = false }: MainLayoutProps) => {
  const { role } = useUser();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        <div className="flex flex-1">
          {(showSidebar && role) && (
            <AppSidebar />
          )}
          <SidebarInset className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
