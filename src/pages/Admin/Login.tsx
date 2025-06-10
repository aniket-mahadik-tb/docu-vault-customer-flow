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
import { Lock, User } from "lucide-react";

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
      setValueToLocalStorage("role", role);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md p-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="mb-4">
                {/* Replace with your actual logo */}
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-gray-500">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="userId"
                      type="text"
                      placeholder="Enter your user ID"
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="pl-10 h-11 bg-gray-50/50 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 h-11 bg-gray-50/50 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="text-sm text-right">
                  <a href="#" className="text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </CardFooter>
            </form>
            <div className="px-6 pb-6 text-center text-sm text-gray-500">
              <p>Protected by DocuVault Security</p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
