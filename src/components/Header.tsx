
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { role, userId } = useUser();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          aria-label="Back to Home"
          className="mr-4"
        >
          <Home className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium">DocuVault</h1>
      </div>
      
      <div className="text-sm font-medium">
        {role && userId ? (
          <span className="px-3 py-1.5 bg-secondary/20 text-secondary-foreground rounded-md">
            {role} | {userId}
          </span>
        ) : (
          <span>Welcome</span>
        )}
      </div>
    </header>
  );
};

export default Header;
