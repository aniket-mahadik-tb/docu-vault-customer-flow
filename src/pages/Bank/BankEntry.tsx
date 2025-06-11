
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/contexts/CustomerContext";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Mock PANs that are allowed to access the system
const ALLOWED_PANS = ["ABCDE1234F", "PQRST5678G", "XYZAB9012C"];

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
  const { customers } = useCustomers();
  const [showOTP, setShowOTP] = useState(false);
  const [panValue, setPanValue] = useState("");
  const [sharedCustomerPANs, setSharedCustomerPANs] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pan: "",
    },
  });

  const { getValueFromLocalStorage,setValueToLocalStorage } = useLocalStorage();

  // Default OTP value for easier demo access
  const defaultOTP = "123456";
  
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: defaultOTP,
    },
  });

  // Extract PANs of customers who have at least one approved document
  useEffect(() => {
    const pansWithApprovedDocs = customers
      .filter(customer => 
        customer.documents.some(doc => doc.status === "approved")
      )
      .map(customer => customer.panCard);
    
    setSharedCustomerPANs(pansWithApprovedDocs);
  }, [customers]);

  const handlePANSubmit = (values: z.infer<typeof formSchema>) => {
    // Check if PAN is in either the hardcoded list or the shared customers list
    const isAllowed = ALLOWED_PANS.includes(values.pan) || sharedCustomerPANs.includes(values.pan);
    
    if (!isAllowed) {
      toast({
        title: "Access Denied",
        description: "This PAN is not authorized to access the system.",
        variant: "destructive",
      });
      return;
    }

    // Store PAN for later use
    setPanValue(values.pan);
    
    // Simulate sending OTP
    toast({
      title: "OTP Sent",
      description: "A 6-digit OTP has been sent to your registered mobile/email.",
    });
    
    // Show OTP verification form
    setShowOTP(true);
  };

  const handleOTPSubmit = (values: z.infer<typeof otpSchema>) => {
    console.log("OTP submitted:", values.otp);
    // In a real app, you'd verify the OTP with backend
    // For this mock, we'll accept any 6-digit OTP
    
    // Set the user as authenticated
    setUserId(panValue);
    setRole("Bank");
    
    toast({
      title: "Verification Successful",
      description: "You now have access to shared documents.",
    });

    setValueToLocalStorage("role","Bank");
    
    // Navigate to bank dashboard
    navigate("/bank/dashboard");
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    Request Access
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
                                  {defaultOTP}
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
                  <Button type="submit" className="w-full">
                    Verify OTP
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
