import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers, Customer } from "@/contexts/CustomerContext";
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
import { useCustomerService } from "@/services/customerService";

// Create a schema for form validation
const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string()
    .length(10, { message: "Phone number must be exactly 10 digits" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only digits" }),
  panCard: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Please enter a valid PAN Card number (e.g., ABCDE1234F)" }),
  businessName: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const NewCustomer = () => {
  const navigate = useNavigate();
  // const { addCustomer } = useCustomers();
  const { addCustomer } = useCustomerService();
  const { toast } = useToast();
  
  // State for customer type selection
  const [customerType, setCustomerType] = useState<'individual' | 'organization'>('individual');

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

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      // Include customer type in the data
      const customerData = {
        ...data,
        customerType,
      } as Omit<Customer, 'id' | 'createdAt' | 'documentsSubmitted' | 'documents'>;
      
      await addCustomer(customerData);
      
      toast({
        title: "Success",
        description: "New customer has been created successfully.",
      });
      
      navigate("/admin/customers");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
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
              Create a new customer account
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CardContent className="space-y-4">
                {/* Customer Type Selection */}
                <FormItem>
                  <FormLabel>Customer Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={customerType}
                      onValueChange={(value: 'individual' | 'organization') => setCustomerType(value)}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <label htmlFor="individual" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Individual
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="organization" id="organization" />
                        <label htmlFor="organization" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Organization
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Select whether this is an individual customer or an organization
                  </FormDescription>
                </FormItem>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {customerType === 'individual' ? 'Full Name' : 'Organization Name'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={customerType === 'individual' ? 'John Smith' : 'ABC Corporation'} 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {customerType === 'individual' 
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
                  name="panCard"
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

                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Business Name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Customer's business name, if applicable
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Create Customer
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
