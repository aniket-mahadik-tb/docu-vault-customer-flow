
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import MainLayout from "@/layouts/MainLayout";
import { User, Users, FileText } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { setRole } = useUser();

  const portalCards = [
    {
      title: "Customer Portal",
      description: "Upload documents and track your submission status",
      icon: <User className="h-12 w-12 text-primary" />,
      path: "/customer",
      role: "Customer" as const,
      color: "bg-primary/5 hover:bg-primary/10 border-primary/20",
    },
    {
      title: "Admin Portal",
      description: "Manage users and document submissions",
      icon: <Users className="h-12 w-12 text-secondary" />,
      path: "/admin",
      role: "Admin" as const,
      color: "bg-secondary/5 hover:bg-secondary/10 border-secondary/20",
    },
    {
      title: "Bank Portal",
      description: "Review and process document submissions",
      icon: <FileText className="h-12 w-12 text-accent" />,
      path: "/bank",
      role: "Bank" as const,
      color: "bg-accent/5 hover:bg-accent/10 border-accent/20",
    },
  ];

  const handlePortalSelect = (path: string, role: "Customer" | "Admin" | "Bank") => {
    setRole(role);
    navigate(path);
  };

  return (
    <MainLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Document Management System</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {portalCards.map((card, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all transform hover:scale-105 ${card.color} border-2`}
              onClick={() => handlePortalSelect(card.path, card.role)}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 h-64">
                <div className="mb-4">{card.icon}</div>
                <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
                <p className="text-sm text-center text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
