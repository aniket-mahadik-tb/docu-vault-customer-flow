
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
        {/* Header at the top with z-index to stay above other elements */}
        <header className="sticky top-0 z-50 w-full h-16 bg-white border-b border-gray-200">
          <Header />
        </header>
        
        <div className="flex flex-1">
          {displaySidebar && role && (
            <div 
              className="fixed z-40"
              style={{
                top: "64px", // Exactly 64px from top (header height)
                left: 0,
                bottom: 0,
                width: "240px"
              }}
            >
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
