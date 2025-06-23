import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { BankService } from "@/services/BankService";

const formSchema = z.object({
  pan: z.string().length(10, "PAN must be 10 characters").toUpperCase(),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const BankEntry = () => {
  const navigate = useNavigate();
  const { setUserId, setRole } = useUser();
  const { toast } = useToast();
  const [showOTP, setShowOTP] = useState(false);
  const [panValue, setPanValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pan: "",
    },
  });

  const { setValueToLocalStorage } = useLocalStorage();
  
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "123456", // Default OTP for demo
    },
  });

  const handlePANSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await BankService.verifyPAN(values.pan);
      
      if (!response.success) {
        toast({
          title: "Access Denied",
          description: response.message,
          variant: "destructive",
        });
        return;
      }

      // Store PAN for later use
      setPanValue(values.pan);
      
      toast({
        title: "OTP Sent",
        description: "A 6-digit OTP has been sent to your registered mobile/email.",
      });
      
      // Show OTP verification form
      setShowOTP(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify PAN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      setIsLoading(true);
      const response = await BankService.verifyOTP(panValue, values.otp);
      
      if (!response.success) {
        toast({
          title: "Verification Failed",
          description: response.message,
          variant: "destructive",
        });
        return;
      }

      // Set the user as authenticated
      setUserId(panValue);
      setRole("Bank");
      setValueToLocalStorage("role", "Bank");
      
      toast({
        title: "Verification Successful",
        description: "You now have access to shared documents.",
      });
      
      // Navigate to bank dashboard
      navigate("/bank/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    otpForm.setValue("otp", value, { shouldValidate: true });
    
    // If the OTP is complete (6 digits), automatically submit the form
    if (value.length === 6) {
      otpForm.handleSubmit(handleOTPSubmit)();
    }
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bank Document Portal</CardTitle>
            <CardDescription>
              {!showOTP 
                ? "Enter customer PAN to access shared documents" 
                : "Enter the OTP sent to your registered contact details"}
            </CardDescription>
          </CardHeader>
          
          {!showOTP ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePANSubmit)}>
                <CardContent>
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="pan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer PAN</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter PAN (e.g., ABCDE1234F)"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Request Access"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(handleOTPSubmit)}>
                <CardContent>
                  <div className="grid gap-6">
                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <div className="bg-muted rounded p-2 text-center w-full font-mono text-lg">
                                  {field.value}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground text-center">Pre-filled OTP for demo purposes</p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="text-sm text-muted-foreground">
                      For this demo, click "Verify OTP" to access the bank portal
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default BankEntry;
