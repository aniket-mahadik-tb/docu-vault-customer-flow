
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
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
const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  panCard: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Please enter a valid PAN Card number (e.g., ABCDE1234F)" }),
  businessName: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const NewCustomer = () => {
  const { addCustomer, generateUploadLink } = useCustomers();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      panCard: "",
      businessName: "",
    },
  });

  const onSubmit = (data: CustomerFormValues) => {
    try {
      // Add the new customer
      const newCustomer = addCustomer(data);
      
      // Generate upload link for the customer
      const uploadLink = generateUploadLink(newCustomer.id);
      
      // Show success toast
      toast({
        title: "Customer added successfully",
        description: `Upload link sent to ${data.email}`,
      });
      
      // Navigate to the customer detail page
      navigate(`/admin/customers/${newCustomer.id}`);
    } catch (error) {
      console.error("Error adding customer:", error);
      toast({
        title: "Error adding customer",
        description: "There was a problem adding the customer. Please try again.",
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
          onClick={() => navigate("/admin/customers")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer List
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Add New Customer</CardTitle>
            <CardDescription>
              Create a new customer and send them a document upload link
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
                        Customer's full legal name
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
                        <Input 
                          type="email" 
                          placeholder="john@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Document upload link will be sent to this email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="1234567890" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="panCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Card</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ABCDE1234F" 
                          {...field} 
                          autoCapitalize="characters"
                          onChange={(e) => {
                            // Convert input to uppercase for PAN Card
                            field.onChange(e.target.value.toUpperCase());
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Permanent Account Number card details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ABC Enterprises" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional - Leave blank for individual customers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" /> Create & Send Upload Link
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewCustomer;
