
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, FileText } from "lucide-react";

const BankDashboard = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  
  useEffect(() => {
    if (!userId) {
      navigate("/bank");
    }
  }, [userId, navigate]);

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Bank Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Folder className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">Shared Documents</h3>
                  <p className="text-sm text-muted-foreground">View documents shared by customers</p>
                </div>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => navigate("/bank/documents")}
              >
                View Documents
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">View Notes</h3>
                  <p className="text-sm text-muted-foreground">Check notes and proposals from admin</p>
                </div>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={() => navigate("/bank/notes")}
              >
                View Notes
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            You are logged in as a bank representative with access to shared documents for PAN: <strong>{userId}</strong>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default BankDashboard;
