
import React, { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import AppSidebar from "@/components/AppSidebar";
import { useUser } from "@/contexts/UserContext";

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const MainLayout = ({ children, showSidebar = true }: MainLayoutProps) => {
  const { role, userId } = useUser();

  // Only show sidebar if user is authenticated (has userId) AND showSidebar is true
  const displaySidebar = showSidebar && userId;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        <div className="flex flex-1">
          {displaySidebar && role && (
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
