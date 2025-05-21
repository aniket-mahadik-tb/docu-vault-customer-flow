
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { role, userId } = useUser();

  return (
    <div className="h-16 flex items-center justify-between px-4 md:px-6 w-full">
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
          <div className="inline-flex h-9 items-center justify-center rounded-md border border-bharti-blue bg-transparent px-3 text-bharti-blue hover:bg-bharti-blue/10">
            {role} | {userId}
          </div>
        ) : (
          <span>Welcome</span>
        )}
      </div>
    </div>
  );
};

export default Header;
