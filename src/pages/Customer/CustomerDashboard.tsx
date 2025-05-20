
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { FileText, Clock } from "lucide-react";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  
  useEffect(() => {
    if (!userId) {
      navigate("/customer");
    }
  }, [userId, navigate]);

  const dashboardCards = [
    {
      title: "Upload Documents",
      description: "Upload your KYC and other required documents",
      icon: <FileText className="h-8 w-8 text-primary" />,
      action: () => navigate("/customer/upload"),
      color: "bg-primary/5 hover:bg-primary/10 border-primary/20",
    },
    {
      title: "View Status",
      description: "Check the status of your document submissions",
      icon: <Clock className="h-8 w-8 text-secondary" />,
      action: () => navigate("/customer/status"),
      color: "bg-secondary/5 hover:bg-secondary/10 border-secondary/20",
    },
  ];

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Customer Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

export default CustomerDashboard;
