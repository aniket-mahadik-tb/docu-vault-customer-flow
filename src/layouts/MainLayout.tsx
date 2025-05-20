
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
        
        <div className="flex flex-1">
          {displaySidebar && role && (
            <div className="fixed left-0 top-16 bottom-0 z-40">
              <AppSidebar />
            </div>
          )}
          <main 
            className="flex-1 overflow-y-auto p-4 md:p-6" 
            style={{ 
              marginLeft: displaySidebar && role ? "240px" : "0",
              marginTop: "0px" // Ensure content starts right after header
            }}
          >
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
