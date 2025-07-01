import React, { useEffect, useState, useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Check, Share2, User, Pencil, Plus, X as XIcon, File, Landmark } from "lucide-react";
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
import { CustomersToShareWithBank, useCustomerService } from "@/services/customerService";
import CustomerList from "./CustomerList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const ShareWithBank = () => {
  const [customers, setCustomers] = useState<CustomersToShareWithBank[] | null>(null);
  const { toast } = useToast();
  const customerService = useCustomerService();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const { customers: allCustomers, findCustomerByPanCard } = useCustomers();
  const [openDialogPan, setOpenDialogPan] = useState<string | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, string[]>>({});
  const [selectedBanks, setSelectedBanks] = useState<Record<string, string[]>>({});

  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = selectedCustomers.length > 0 && selectedCustomers.length < customers.length;
    }
  }, [selectedCustomers, customers]);

  useEffect(() => {
    (async () => {
      const customersList = await customerService.getCustomersToShareWithBank();
      setCustomers(customersList);
    })();
  }, [])

  // Filter for customers that have at least one approved document
  const eligibleCustomers = customers
  // .filter((customer) =>
  //   // customer.documents.some((doc) => doc.status === "approved")
  //   customer
  // );

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

  const handleOpenDialog = (pan: string) => setOpenDialogPan(pan);
  const handleCloseDialog = () => setOpenDialogPan(null);
  const handleToggleDoc = (pan: string, docId: string) => {
    setSelectedDocs((prev) => {
      const prevDocs = prev[pan] || [];
      return {
        ...prev,
        [pan]: prevDocs.includes(docId)
          ? prevDocs.filter((id) => id !== docId)
          : [...prevDocs, docId],
      };
    });
  };

  const mockBanks = [
    "HDFC Bank",
    "ICICI Bank",
    "SBI",
    "Axis Bank",
    "Kotak Mahindra Bank"
  ];

  const handleToggleBank = (pan: string, bank: string) => {
    setSelectedBanks((prev) => {
      const prevBanks = prev[pan] || [];
      return {
        ...prev,
        [pan]: prevBanks.includes(bank)
          ? prevBanks.filter((b) => b !== bank)
          : [...prevBanks, bank],
      };
    });
  };

  return (customers) ? (
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
            {customers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[4%]">
                        <input
                          ref={headerCheckboxRef}
                          type="checkbox"
                          checked={customers.length > 0 && selectedCustomers.length === customers.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCustomers(customers.map((c) => c.pan));
                            } else {
                              setSelectedCustomers([]);
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </TableHead>
                      <TableHead className="w-[17.5%]">Customer</TableHead>
                      <TableHead className="w-[17.5%]">Business</TableHead>
                      <TableHead className="w-[17.5%]">Approved Documents</TableHead>
                      <TableHead className="w-[22%] min-w-[120px] text-center">Share With</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.pan} className="items-center">
                        <TableCell className="px-4 py-2 w-[4%]">
                          <Checkbox
                            checked={selectedCustomers.includes(customer.pan)}
                            onCheckedChange={() => handleToggleCustomer(customer.pan)}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-2 w-[17.5%]">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.pan}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2 align-middle w-[17.5%]">{customer?.name || "-"}</TableCell>
                        <TableCell className="px-4 py-2 w-[17.5%]">
                          {selectedDocs[customer.pan]?.length > 0 ? (
                            <div className="flex items-center gap-2 select-none" style={{ minHeight: 32 }}>
                            <Check className="h-4 w-4 text-green-500" />
                              <span className="text-green-700 font-medium">{selectedDocs[customer.pan].length} selected</span>
                              <Button
                                type="button"
                                size="icon"
                                className="h-8 w-8 p-0 ml-1 rounded-md border border-gray-200 bg-white/80 shadow-sm hover:bg-gray-100 transition duration-150 flex items-center justify-center"
                                onClick={() => handleOpenDialog(customer.pan)}
                                aria-label="Edit documents"
                              >
                                <Pencil className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(customer.pan)}
                            >
                              Select Document
                            </Button>
                          )}
                          <Dialog open={openDialogPan === customer.pan} onOpenChange={(open) => open ? handleOpenDialog(customer.pan) : handleCloseDialog()}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Select Documents for {customer.name}</DialogTitle>
                                <DialogDescription>
                                  Choose one or more approved documents to share with the bank.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="max-h-60 overflow-y-auto my-4">
                                {(() => {
                                  // MOCK DOCUMENTS
                                  const approvedDocs = [
                                    { id: 'doc1', name: 'PAN Card.pdf' },
                                    { id: 'doc2', name: 'Aadhaar Card.pdf' },
                                    { id: 'doc3', name: 'Bank Statement.pdf' },
                                  ];
                                  return approvedDocs.map(doc => (
                                    <div key={doc.id} className="flex items-center gap-2 py-1">
                                      <Checkbox
                                        checked={selectedDocs[customer.pan]?.includes(doc.id) || false}
                                        onCheckedChange={() => handleToggleDoc(customer.pan, doc.id)}
                                        id={`doc-checkbox-${doc.id}`}
                                      />
                                      <label htmlFor={`doc-checkbox-${doc.id}`} className="cursor-pointer select-none">
                                        {doc.name}
                                      </label>
                                    </div>
                                  ));
                                })()}
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button type="button" variant="default">Done</Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell className="px-4 py-2 w-[22%] min-w-[120px]">
                          <div className="flex items-center border rounded px-2 py-1 bg-gray-100 min-h-[40px] w-full justify-end">
                            <div className="flex flex-row flex-wrap gap-1 items-center">
                              {selectedBanks[customer.pan]?.map(bank => (
                                <span
                                  key={bank}
                                  className="inline-flex items-center h-5 px-1.5 rounded bg-white text-gray-700 text-[11px] font-medium border border-gray-300 mr-1"
                                  style={{ minWidth: 0 }}
                                >
                                  <span>{bank}</span>
                                  <button
                                    type="button"
                                    className="ml-0.5 p-0.5 rounded hover:bg-gray-300 transition"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleToggleBank(customer.pan, bank);
                                    }}
                                    tabIndex={-1}
                                    aria-label={`Remove ${bank}`}
                                  >
                                    <XIcon className="h-3 w-3 text-gray-500" />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="flex-shrink-0 ml-2 border-l border-gray-300 pl-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="p-2"
                                          aria-label="Select Banks"
                                        >
                                          <Landmark className="h-4 w-4 text-gray-500" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="start">
                                        {mockBanks.map(bank => (
                                          <DropdownMenuCheckboxItem
                                            key={bank}
                                            checked={selectedBanks[customer.pan]?.includes(bank) || false}
                                            onCheckedChange={() => handleToggleBank(customer.pan, bank)}
                                          >
                                            {bank}
                                          </DropdownMenuCheckboxItem>
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Select Bank
                                </TooltipContent>
                              </Tooltip>
                            </div>
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
  ) : (
    <MainLayout showSidebar={true}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading document status...</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShareWithBank;
