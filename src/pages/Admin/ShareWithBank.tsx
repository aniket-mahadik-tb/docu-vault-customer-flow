
import React, { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Check, Share2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const ShareWithBank = () => {
  const { customers } = useCustomers();
  const { toast } = useToast();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // Filter for customers that have at least one approved document
  const eligibleCustomers = customers.filter((customer) =>
    customer.documents.some((doc) => doc.status === "approved")
  );

  const handleToggleCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleShareWithBank = () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "No customers selected",
        description: "Please select at least one customer to share with the bank.",
        variant: "destructive",
      });
      return;
    }

    // In a real application, this would trigger an API call to share with bank
    toast({
      title: "Documents shared successfully",
      description: `Shared documents for ${selectedCustomers.length} customer(s) with the bank.`,
    });

    // Clear selection after sharing
    setSelectedCustomers([]);
  };

  const approvedDocumentCount = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return 0;
    return customer.documents.filter((doc) => doc.status === "approved").length;
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Share with Bank</h1>
            <p className="text-muted-foreground mt-1">
              Share approved documents with the bank
            </p>
          </div>
          <Button
            onClick={handleShareWithBank}
            disabled={selectedCustomers.length === 0}
          >
            <Share2 className="mr-2 h-4 w-4" /> Share Selected
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Eligible Customers</CardTitle>
            <CardDescription>
              Customers with at least one approved document
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eligibleCustomers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            eligibleCustomers.length > 0 &&
                            selectedCustomers.length === eligibleCustomers.length
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCustomers(eligibleCustomers.map((c) => c.id));
                            } else {
                              setSelectedCustomers([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Approved Documents</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eligibleCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={() => handleToggleCustomer(customer.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <p>{customer.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {customer.panCard}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.businessName || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{approvedDocumentCount(customer.id)} documents</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No customers with approved documents found.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleShareWithBank}
              disabled={selectedCustomers.length === 0}
              className="w-full"
            >
              <Share2 className="mr-2 h-4 w-4" /> Share {selectedCustomers.length} Selected Customer{selectedCustomers.length !== 1 ? "s" : ""}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ShareWithBank;
