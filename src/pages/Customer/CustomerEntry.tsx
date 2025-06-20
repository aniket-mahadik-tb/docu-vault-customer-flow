
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import MainLayout from "@/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useUserService } from "@/services/userService";
import { useCustomerService } from "@/services/customerService";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const validatePAN = (pan: string): boolean => {
  // Basic PAN card validation: 5 letters, 4 numbers, 1 letter (AAAAA1234A format)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

const CustomerEntry = () => {
  const navigate = useNavigate();
  const { setUserId, setRole } = useUser();
  const [panNumber, setPanNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const customerService = useCustomerService();
  const UserService = useUserService();
  const { getValueFromLocalStorage, setValueToLocalStorage } = useLocalStorage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");


  useEffect(
    () => {
      setValueToLocalStorage("token", token)
      setValueToLocalStorage("role", "Customer");
      setUserId("bull"); // Simulated user ID
      setRole("Customer");
      navigate("/customer/upload");
    }, [navigate, getValueFromLocalStorage]
  )

  
};

export default CustomerEntry;
