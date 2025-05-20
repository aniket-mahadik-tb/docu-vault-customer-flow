
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useUser } from "@/contexts/UserContext";

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
        <p className="text-muted-foreground">
          Welcome to the bank dashboard. Here you can review and process customer document submissions.
        </p>
      </div>
    </MainLayout>
  );
};

export default BankDashboard;
