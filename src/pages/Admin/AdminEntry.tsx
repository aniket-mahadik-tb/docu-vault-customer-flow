
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const AdminEntry = () => {
  const navigate = useNavigate();
  const { setUserId } = useUser();
  
  useEffect(() => {
    // Set a default admin ID
    setUserId("ADMIN123");
    // Automatically navigate to dashboard
    navigate("/admin/dashboard");
  }, [navigate, setUserId]);

  return null; // No UI needed as we're redirecting
};

export default AdminEntry;
