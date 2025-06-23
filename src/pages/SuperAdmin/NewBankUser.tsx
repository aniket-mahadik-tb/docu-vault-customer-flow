import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useBankUsers, BankUser } from "@/contexts/BankContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Create a schema for form validation
const bankUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  bankName: z.string()
    .min(2, { message: "Bank name must be at least 2 characters" })
    .regex(/^[A-Za-z\s]+(?:Bank|Ltd\.?|Limited|Corporation|Corp\.?)?$/, {
      message: "Please enter a valid bank name (e.g., HDFC Bank, ICICI Bank Ltd.)"
    }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type BankUserFormValues = z.infer<typeof bankUserSchema>;

const NewBankUser = () => {
  const navigate = useNavigate();
  const { addBankUser } = useBankUsers();
  const { toast } = useToast();

  const form = useForm<BankUserFormValues>({
    resolver: zodResolver(bankUserSchema),
    defaultValues: {
      name: "",
      email: "",
      bankName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: BankUserFormValues) => {
    try {
      // Remove confirmPassword before adding to context
      const { confirmPassword, ...bankUserData } = data;
      addBankUser(bankUserData as Omit<BankUser, 'id' | 'lastLogin' | 'status'>);
      
      toast({
        title: "Success",
        description: "New bank user has been created successfully.",
      });
      
      navigate("/admin/bank-users");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bank user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/bank-users")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Users List
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Add New Bank User</CardTitle>
            <CardDescription>
              Create a new bank user account
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormDescription>
                        Bank user's full legal name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.smith@bank.com" type="email" {...field} />
                      </FormControl>
                      <FormDescription>
                        Bank user's email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="HDFC Bank" {...field} />
                      </FormControl>
                      <FormDescription>
                        Name of the bank
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Password must be at least 8 characters long
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Re-enter the password to confirm
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Create Bank User
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewBankUser; 