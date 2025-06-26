import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers, Customer } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useCustomerService, ClientCreateRequest } from "@/services/customerService";

// Create a schema for promoter validation
const promoterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string()
    .length(10, { message: "Phone number must be exactly 10 digits" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only digits" }),
  pan: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Please enter a valid PAN Card number (e.g., ABCDE1234F)" }),
});

// Create a schema for form validation
const customerSchema = z.object({
  clientType: z.enum(["INDIVIDUAL", "ORGANIZATION"]),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string()
    .length(10, { message: "Phone number must be exactly 10 digits" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only digits" }),
  pan: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Please enter a valid PAN Card number (e.g., ABCDE1234F)" }),
  promoters: z.array(promoterSchema).optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const NewCustomer = () => {
  const navigate = useNavigate();
  // const { addCustomer } = useCustomers();
  const { addCustomer } = useCustomerService();
  const { toast } = useToast();
  const customerService = useCustomerService();
  const [isLoading, setIsLoading] = useState(false);


  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      clientType: "INDIVIDUAL",
      name: "",
      email: "",
      phone: "",
      pan: "",
      promoters: [],
    },
  });

  const { fields: promoterFields, append: appendPromoter, remove: removePromoter } = useFieldArray({
    control: form.control,
    name: "promoters",
  });

  const clientType = form.watch("clientType");

  const onSubmit = async (data: CustomerFormValues) => {
    setIsLoading(true);
    try {
      // Create the API payload with correct field names and casing
      const payload: ClientCreateRequest = {
        clientType: data.clientType === "INDIVIDUAL" ? "INDIVIDUAL" : "ORGANIZATION",
        name: data.name,
        pan: data.pan,
        email: data.email,
        phone: data.phone,
        promoters: (data.promoters || []).filter(p => p.name && p.email && p.phone && p.pan) as { name: string; pan: string; email: string; phone: string; }[]
      };

   

      // Make the API call
      const response = await customerService.createClient(payload);

 

      toast({
        title: "Success",
        description: "New customer has been created successfully.",
      });

      navigate("/admin/customers");
    } catch (error: any) {
      console.error('API Error:', error);
      // toast({
      //   title: "Error",
      //   description: error.response?.data?.message || "Failed to create customer. Please try again.",
      //   variant: "destructive",
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const addNewPromoter = () => {
    appendPromoter({
      name: "",
      email: "",
      phone: "",
      pan: "",
    });
  };

  const removePromoterField = (index: number) => {
    removePromoter(index);
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
              Create a new customer account
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent className="space-y-6">
                {/* Customer Type Selection */}
                <FormField
                  control={form.control}
                  name="clientType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex flex-row space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="INDIVIDUAL" id="individual" />
                            <label htmlFor="individual" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Individual
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ORGANIZATION" id="organization" />
                            <label htmlFor="organization" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Organization
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Select whether this is an individual customer or an organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Main Form Fields - 2 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {clientType === 'INDIVIDUAL' ? 'Full Name' : 'Organization Name'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={clientType === 'INDIVIDUAL' ? 'John Smith' : 'ABC Corporation'}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {clientType === 'INDIVIDUAL'
                            ? "Customer's full legal name"
                            : "Organization's legal name"
                          }
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
                          <Input placeholder="john.smith@example.com" type="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          Customer's email address
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
                            placeholder="9876543210"
                            {...field}
                            maxLength={10}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a 10-digit phone number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Card Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ABCDE1234F"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter PAN Card number (e.g., ABCDE1234F)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Promoters Section - Only for Organization */}
               
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Customer'}
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
