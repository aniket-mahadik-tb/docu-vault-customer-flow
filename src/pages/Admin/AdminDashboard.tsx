
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { getValueFromLocalStorage } = useLocalStorage();
  const [role, setRole] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) {
      navigate("/admin");
    }else {
      const storedRole = getValueFromLocalStorage("role"); // Get the role from local storage
      setRole(storedRole); // Set 
    }
  }, [userId, navigate,getValueFromLocalStorage]);

  const dashboardCards = [
    {
      title: "Customer List",
      description: "View and manage registered customers",
      icon: <Users className="h-8 w-8 text-primary" />,
      action: () => navigate("/admin/customers"),
      color: "bg-primary/5 hover:bg-primary/10 border-primary/20",
    },
    {
      title: "Review Documents",
      description: "Review and approve/reject customer documents",
      icon: <FileText className="h-8 w-8 text-secondary" />,
      action: () => navigate("/admin/review"),
      color: "bg-secondary/5 hover:bg-secondary/10 border-secondary/20",
    },
    {
      title: "Share with Bank",
      description: "Share approved documents with the bank",
      icon: <Share2 className="h-8 w-8 text-accent" />,
      action: () => navigate("/admin/share"),
      color: "bg-accent/5 hover:bg-accent/10 border-accent/20",
    }
  ];

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">{role === "Admin" ? "Admin Dashboard" : "Super Admin Dashboard"}</h1>
        <p className="text-muted-foreground mb-6">
          Welcome to the {role === "Admin" ? "Admin Dashboard" : "Super Admin Dashboard"}. Here you can manage customers, review document submissions, and share approved documents with the bank.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all transform hover:scale-102 ${card.color} border`}
              onClick={card.action}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {card.icon}
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" className="w-full">
                  Continue
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
