
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import MainLayout from "@/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useUserService } from "@/services/userService";
import { useCustomerService } from "@/services/customerService";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    // try {
    //   const response = await customerService.getCustomerByPanCard(panNumber)
    //   setUserId(panNumber);
    //   setRole("Customer");
    //   navigate("/customer/dashboard");
    //   setIsSubmitting(false);
    // } catch (err: any) {
    //   console.error("Failed to fetch customers:", err);
    //   toast({
    //     title: "Error",
    //     description: "Failed to load customers. Please try again.",
    //     variant: "destructive",
    //   });
    // }



    if (!validatePAN(panNumber)) {
      toast({
        title: "Invalid PAN",
        description: "Please enter a valid PAN card number (format: AAAAA1234A)",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      setUserId(panNumber);
      setRole("Customer");
      navigate("/customer/dashboard");
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Customer Portal</CardTitle>
            <CardDescription>Enter your PAN card number to continue</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="pan" className="text-sm font-medium">
                    PAN Card Number
                  </label>
                  <Input
                    id="pan"
                    placeholder="AAAAA1234A"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    maxLength={10}
                    className="uppercase"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Continue"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CustomerEntry;
