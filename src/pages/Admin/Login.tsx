
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCustomerService } from "@/services/customerService";
import { useUserService } from "@/services/userService";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const Login = () => {
  const navigate = useNavigate();
  const { setUserId, setRole, userId, role } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const customerService = useCustomerService();
  const userService = useUserService();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const { setValueToLocalStorage } = useLocalStorage();

  useEffect(() => {
    localStorage.removeItem("role");
  }, [])
  useEffect(() => {
    if (userId && role === "Admin") {
      console.log("Admin already logged in:", userId);
      console.log(role)
      navigate("/admin/dashboard");
      return;
    }
  }, [navigate, setUserId]);


  const validateUser = async (userId: string, password: string): Promise<boolean> => {
    try {
      const response = await userService.getUserById(userId);
      if (response.status === 200 && response.data) {
        return response.data === "Admin" || response.data === "SuperAdmin";
      }
      return false;
    } catch (err) {
      console.error("Validation error:", err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await userService.getUserById(formData.userId);
      const role = response.data;
      console.log(role);
      setValueToLocalStorage("role", role);
      //here i want to set the role in the local storage
    }
    catch (err) {
      console.error("Validation error:", err);
      return false;
    }


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



    // if (!await validateUser(formData.userId, formData.password)) {
    //   toast({
    //     title: "Invalid User Credebtials",
    //     description: "Please enter valid Credentials",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      setUserId("ADMIN123");
      setRole("Admin");
      navigate("/admin/dashboard");
      setIsSubmitting(false);
    }, 500);
  };




  return (role == "Admin" && userId) ? <Outlet /> : (
    <MainLayout showSidebar={false}>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter your credentials</CardTitle>
            <CardDescription>Enter your authorization details to continue</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="pan" className="text-sm font-medium">
                    User Id
                  </label>
                  <Input
                    name="userId"
                    type="text"
                    placeholder="user_123"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    maxLength={10}
                    className="uppercase"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="pan" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    maxLength={10}
                    className="uppercase"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>);

}
export default Login;
