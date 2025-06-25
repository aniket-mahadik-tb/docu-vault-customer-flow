import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers, CustomerDocument, Customer } from "@/contexts/CustomerContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, File, RefreshCw, Link, Copy, FileText, Folder, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReviewDocuments from "./ReviewDocuments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCustomerService } from "@/services/customerService";
import { ShimmerButton, ShimmerSectionHeader, ShimmerText, ShimmerThumbnail, ShimmerTitle } from "react-shimmer-effects";
import { resolve } from "path";
import { set } from "date-fns";
import { useTempCustomer } from "@/utils/TempContext";
import { CustomerType, DocumentResponseType, FileResponseType } from "@/utils/types";

// Document sections with their titles
const documentSections = [
  { id: "section1", title: "KYC Documents" },
  { id: "section2", title: "Bank Statements" },
  { id: "section3", title: "Loan Statements" },
  { id: "section4", title: "Financial Documents" },
  { id: "section5", title: "Property Documents" },
  { id: "section6", title: "Business Documents" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge variant="default" className="bg-green-500">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "on_hold":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">On Hold</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

// Define a larger color palette for file count badges
const badgeColors = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
  'bg-yellow-100 text-yellow-800',
  'bg-indigo-100 text-indigo-800',
  'bg-teal-100 text-teal-800',
  'bg-red-100 text-red-800',
  'bg-cyan-100 text-cyan-800',
  'bg-lime-100 text-lime-800',
  'bg-fuchsia-100 text-fuchsia-800',
];

// Utility to get color class by file extension
const fileTypeColors = {
  pdf: 'bg-red-100 text-red-800',
  doc: 'bg-blue-100 text-blue-800',
  docx: 'bg-blue-100 text-blue-800',
  xls: 'bg-green-100 text-green-800',
  xlsx: 'bg-green-100 text-green-800',
  csv: 'bg-yellow-100 text-yellow-800',
  jpg: 'bg-pink-100 text-pink-800',
  jpeg: 'bg-pink-100 text-pink-800',
  png: 'bg-purple-100 text-purple-800',
  txt: 'bg-gray-100 text-gray-800',
  zip: 'bg-indigo-100 text-indigo-800',
  default: 'bg-gray-100 text-gray-800',
};

function getFileTypeColor(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return fileTypeColors[ext] || fileTypeColors.default;
}

const CustomerDetail = () => {

  const { getCustomer, generateUploadLink, syncCustomerDocuments } = useCustomers();
  const navigate = useNavigate();
  const customerService = useCustomerService();
  // const initialSyncDone = useRef(false);
  const [reuploadLink, setReuploadLink] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);


  const documentSections = {
    section1: "KYC Documents",
    section2: "Bank Statements",
    section3: "Loan Statements",
    section4: "Financial Documents",
    section5: "Property Documents",
    section6: "Business Documents"
  }

  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const { tempCustomer, setTempCustomer } = useTempCustomer();
  const [allDocuments, setAllDocuments] = useState<DocumentResponseType[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 8;

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


  useEffect(() => {
    effcts();
  }, [tempCustomer])

  useEffect(() => {
    effcts();
  }, [])

  // useEffect(() => {
  //   console.log(allDocuments)
  // }, [allDocuments])

  const effcts = async function fetchCustomer() {
    try {
      if (true) {

        if (tempCustomer) {
          setCustomer(tempCustomer);
          const documents: DocumentResponseType[] = tempCustomer.documents.documentsByCategory.flatMap((cat: any) =>
            (cat.documents || []).map((doc: any) => ({ ...doc, category: cat.category }))
          );
          setAllDocuments(documents);
        } else {
          // If customer not found, redirect to customer list
          toast({
            title: `failed to fetch customer details`,
            description: "Something went wrong please try again",
            variant: "destructive",
          });
          navigate("/admin/customers");
        }
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customer details. Please try again.",
        variant: "destructive",
      });
      navigate("/admin/customers");
    }
  }

  if (!customer) {
    return (
      <MainLayout showSidebar={true}>
        <div >
          <div className="py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin/customers")}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer List
                </Button>
                <h1 className="text-2xl font-bold">Customer Details</h1>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { }} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Sync Documents
                </Button>
                <Button onClick={() => { }}>
                  <Send className="mr-2 h-4 w-4" /> Send Upload Link
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-medium mt-1"><ShimmerTitle line={1} variant="secondary" /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium mt-1"><ShimmerTitle variant="secondary" line={1} /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium mt-1"><ShimmerTitle variant="secondary" line={1} /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium mt-1"><ShimmerTitle variant="secondary" line={1} /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PAN Card</p>
                    <p className="font-medium mt-1"><ShimmerTitle variant="secondary" line={1} /></p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Registration Date</p>
                    <p className="font-medium">
                      <p className="font-medium mt-1"><ShimmerTitle variant="secondary" line={1} /></p>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Submitted Documents</CardTitle>
                  <CardDescription>
                    <p className="font-medium mt-2  "><ShimmerTitle variant="secondary" line={1} /></p>
                  </CardDescription>
                </CardHeader>
                <CardContent>

                  <div className="space-y-6">


                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Document Type</TableHead>
                            <TableHead>Document Name</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>

                          {[1].map((item) => {
                            return (<TableRow >
                              <TableCell >
                                <p className="mt-3 mb-0">
                                  <ShimmerThumbnail height={20} />
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="mt-3 mb-0">
                                  <ShimmerThumbnail height={20} />
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="mt-3 mb-0">
                                  <ShimmerThumbnail height={20} />
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="mt-3 mb-0">
                                  <ShimmerThumbnail height={20} />
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="mt-3 mb-0">
                                  <ShimmerThumbnail height={20} />
                                </p>
                              </TableCell>
                            </TableRow>)
                          })}

                        </TableBody>
                      </Table>
                    </div>

                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }



  const handleSendLink = async (documentId?: string, remarks?: string) => {
    if (generatingLink) return;
    setGeneratingLink(true);
    try {
      const link = await customerService.generateUploadLink(customer.pan, documentId, remarks);
      setReuploadLink(link);
      setLinkDialogOpen(true);
      setGeneratingLink(false);
      if (documentId) {
        toast({
          title: "Document reupload link generated",
          description: `Reupload link for specific document ready to share with ${customer.email}`,
        });
      } else {
        toast({
          title: "Upload link generated",
          description: `Upload link ready to share with ${customer.email}`,
        });
      }
    } catch (error) {
      console.error("Error generating upload link:", error);
      setGeneratingLink(false);
      toast({
        title: "Error",
        description: "Failed to generate upload link. Please try again.",
        variant: "destructive",
      });


    }

  };
  const copyLinkToClipboard = () => {
    if (reuploadLink) {
      navigator.clipboard.writeText(reuploadLink);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard",
      });
    }
  };

  const handleSyncDocuments = async () => {
    try {
      const response = await customerService.getCustomerDocuments(customer.pan);
      const documents: DocumentResponseType[] = tempCustomer.documents.documentsByCategory.flatMap((cat: any) =>
        (cat.documents || []).map((doc: any) => ({ ...doc, category: cat.category }))
      );

      setTempCustomer({ ...customer, documents: response });
      setCustomer({ ...customer, documents: response });
      setAllDocuments(documents);

      toast({
        title: "Documents Synchronized",
        description: "Customer documents have been updated from uploads",
      });
    }
    catch (e: any) {
      console.error(e)
      toast({
        title: `failed to fetch customer details`,
        description: "Something went wrong please try again",
        variant: "destructive",

      });
    }
  };

  // Flatten all file rows for pagination
  const paginatedRows = (allDocuments != null) && allDocuments?.flatMap((doc: DocumentResponseType, docIdx: number) => (
    (doc.files && doc.files.length > 0)
      ? doc.files.map((file: FileResponseType, idx: number) => ({
        doc,
        file,
        idx,
        docIdx
      }))
      : [{
        doc,
        file: null,
        idx: 0,
        docIdx
      }]
  ));

  const totalPages = Math.ceil(paginatedRows.length / entriesPerPage);
  const paginatedRowsToShow = paginatedRows.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  return (
    <MainLayout showSidebar={true}>
      <div className="py-8 px-2 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/customers")}
            className="mb-2 md:mb-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer List
          </Button>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleSyncDocuments} variant="outline" className="bg-gray-200">
              <RefreshCw className="mr-2  w-4" /> Sync Documents
            </Button>

            <Button onClick={() => handleSendLink()}>
              {generatingLink ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating Link
                </span>
              ) : (
                <><Send className="mr-2  w-4" />Send Upload Link</>
              )}
            </Button>
          </div>
        </div>

        {/* Customer Info Card */}
        <Card className="mb-8 shadow-sm border-0 bg-white max-w-full w-full mx-auto">
          <CardContent className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 py-2 px-3 min-h-0 text-sm w-full">
            <div className="flex flex-col min-w-[90px]">
              <span className="text-[11px] text-gray-400 font-medium">PAN</span>
              <span className="font-semibold text-gray-900">{customer.pan}</span>
            </div>
            <span className="mx-2 h-6 border-l border-gray-200 hidden sm:inline-block" />
            <div className="flex flex-col min-w-[90px]">
              <span className="text-[11px] text-gray-400 font-medium">Name</span>
              <span className="font-semibold text-gray-900">{customer.name}</span>
            </div>
            <span className="mx-2 h-6 border-l border-gray-200 hidden sm:inline-block" />
            <div className="flex flex-col min-w-[120px]">
              <span className="text-[11px] text-gray-400 font-medium">Email</span>
              <span className="font-semibold text-gray-900">{customer.email}</span>
            </div>
            <span className="mx-2 h-6 border-l border-gray-200 hidden sm:inline-block" />
            <div className="flex flex-col min-w-[90px]">
              <span className="text-[11px] text-gray-400 font-medium">Phone</span>
              <span className="font-semibold text-gray-900">{customer.phone}</span>
            </div>
            <span className="mx-2 h-6 border-l border-gray-200 hidden sm:inline-block" />
            <div className="flex flex-col min-w-[70px]">
              <span className="text-[11px] text-gray-400 font-medium">Type</span>
              <span className="font-semibold text-gray-900">{customer.clientType}</span>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table - revert to previous look */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              Submitted Documents
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {allDocuments.length} documents available
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%] pl-6">Document Type</TableHead>
                    <TableHead className="w-[20%] px-4">Category</TableHead>
                    <TableHead className="w-[15%] px-4">Files</TableHead>
                    <TableHead className="w-[15%] px-4">Status</TableHead>
                    <TableHead className="w-[15%] px-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRowsToShow.length > 0 ? (
                    paginatedRowsToShow.map(({ doc, file, idx, docIdx }, rowIndex, arr) => {
                      return (
                        <TableRow key={file?.docId ? String(file.docId) : `${String(doc.documentMasterId)}-${idx}`}>
                          <TableCell className="font-medium pl-6">
                            {doc.documentType}
                            {doc.files && doc.files.length > 1 && (
                              <>
                                <span className={`ml-2 rounded px-2 py-0.5 text-xs font-semibold ${badgeColors[docIdx % badgeColors.length]}`}>
                                  {doc.files.length} {doc.files.length === 1 ? 'file' : 'files'}
                                </span>
                                <span className="ml-2 text-gray-400">#{idx + 1}</span>
                                <span
                                  className="ml-1 cursor-pointer inline-flex items-center text-xs bg-pink-100 rounded-full p-0.5"
                                  title="Year: 2022"
                                >
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="inline-block align-middle">
                                    <circle cx="5" cy="5" r="4.5" fill="#fce7f3" />
                                    <text x="5" y="8" textAnchor="middle" fontSize="7" fill="#ec4899" fontWeight="bold">i</text>
                                  </svg>
                                </span>
                              </>
                            )}
                          </TableCell>
                          <TableCell className="px-4">{doc.category}</TableCell>
                          <TableCell className="px-4">
                            {file ? (
                              <span>{file.docName}</span>
                            ) : (
                              <span className="text-sm text-gray-400">No files</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {file ? (
                              <span
                                title={
                                  file.docStatus === 'UPLOADED' ? 'File uploaded, pending review' :
                                    file.docStatus === 'REJECTED' ? 'File was rejected' :
                                      file.docStatus === 'SUBMITTED' ? 'File submitted, awaiting approval' :
                                        'File approved'
                                }
                              >
                                {file.docStatus === "UPLOADED" ? (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">Uploaded</Badge>
                                ) : file.docStatus === "REJECTED" ? (
                                  <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
                                ) : file.docStatus === "SUBMITTED" ? (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Submitted</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>
                                )}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            {file ? (
                              <Button
                                key={file.docId ? String(file.docId) : `${String(doc.documentMasterId)}-action-${idx}`}
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/customers/details/review/${doc.documentMasterId}/${file.docId}`)}
                              >
                                <Eye className="h-4 w-4 mr-1" /> Review
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 px-4">
                        No documents found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-end items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog for Upload Link */}
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Document Upload Link</DialogTitle>
              <DialogDescription>
                Share this link with the customer to allow them to upload the requested document.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={reuploadLink || ""}
                  readOnly
                />
              </div>
              <Button type="submit" size="sm" className="px-3" onClick={copyLinkToClipboard}>
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Click the link to preview the customer's view:
              </p>
              <Button
                variant="link"
                className="mt-2 w-full justify-start"
                onClick={() => {
                  if (reuploadLink) {
                    window.open(reuploadLink, '_blank');
                  }
                }}
              >
                <Link className="mr-2 h-4 w-4" /> Open in new tab
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CustomerDetail;
