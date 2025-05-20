
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useUser } from "@/contexts/UserContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  
  useEffect(() => {
    if (!userId) {
      navigate("/admin");
    }
  }, [userId, navigate]);

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Here you can manage users and review document submissions.
        </p>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
