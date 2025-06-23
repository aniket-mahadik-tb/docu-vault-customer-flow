import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

import { useUserService } from "@/services/userService";

import { useLocalStorage } from "@/hooks/useLocalStorage";

const validatePAN = (pan: string): boolean => {
  // Basic PAN card validation: 5 letters, 4 numbers, 1 letter (AAAAA1234A format)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

const CustomerEntry = () => {
  const navigate = useNavigate();
  const { setRole } = useUser();
  const UserService = useUserService();
  const { getValueFromLocalStorage, setValueToLocalStorage } = useLocalStorage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(
    () => {
      setValueToLocalStorage("token", token)
      setValueToLocalStorage("role", "Customer");
      setRole("Customer");
      navigate("/customer/upload");
    }, [navigate, getValueFromLocalStorage]
  )

  return null;
};

export default CustomerEntry;
