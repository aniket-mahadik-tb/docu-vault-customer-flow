
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

interface CustomerFormValues {
  name: string;
  email: string;
  phone: string;
  panCard: string;
  businessName: string;
}

const NewCustomer = () => {
  const { addCustomer, generateUploadLink } = useCustomers();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      panCard: "",
      businessName: "",
    },
  });

  const onSubmit = (data: CustomerFormValues) => {
    const newCustomer = addCustomer(data);
    const uploadLink = generateUploadLink(newCustomer.id);
    
    toast({
      title: "Customer added successfully",
      description: `Upload link sent to ${data.email}`,
    });
    
    navigate(`/admin/customers/${newCustomer.id}`);
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
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} required />
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
                          required 
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
                          required 
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
                          required 
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
