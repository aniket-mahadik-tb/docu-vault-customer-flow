
import React, { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
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
        {/* Sticky header with higher z-index */}
        <div className="sticky top-0 z-50 w-full">
          <Header />
        </div>
        
        {/* Main content area with sidebar and content */}
        <div className="flex flex-1">
          {displaySidebar && role && (
            <div className="fixed top-16 h-[calc(100vh-4rem)] z-40 left-0">
              <AppSidebar />
            </div>
          )}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 ml-auto" style={{ marginLeft: displaySidebar && role ? "240px" : "0" }}>
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
