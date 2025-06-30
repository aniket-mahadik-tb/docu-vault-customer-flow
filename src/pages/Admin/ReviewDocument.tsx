import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Customer, useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { fileTypeFromBlob } from 'file-type';
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as pdfjs from "pdfjs-dist";
import { getSamplePreviewUrl, isPdfPreview, usingSamplePreviews } from "@/lib/previewUtils";
import { useCustomerService } from "@/services/customerService";
import { CustomerType, DocumentResponseType, FileResponseType } from "@/utils/types";
import { useTempCustomer } from "@/utils/TempContext";
import { useDocumentService } from "@/services/documentService";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';

// Updated PDF.js worker with a direct path (using cdnjs instead of unpkg)
const pdfWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

// Utility function to convert base64/dataURL to Blob
const dataURLtoBlob = (dataURL: string): Blob | null => {
  try {
    // Convert base64/URL data to blob
    const arr = dataURL.split(',');
    if (arr.length < 2) return null;

    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  } catch (error) {
    console.error("Error converting data URL to blob:", error);
    return null;
  }
};

// Utility to flatten the new tempCustomer.documents format
const flattenDocuments = (documentsArr) => {
  if (!Array.isArray(documentsArr)) return [];
  return documentsArr.flatMap((customer) =>
    (customer.documentsByCategory || []).flatMap((cat) =>
      (cat.documents || []).map((doc) => ({
        ...doc,
        category: cat.category,
        customerType: customer.customerType,
      }))
    )
  );
};

const ReviewDocument = () => {
  const { masterId, documentId } = useParams<{ masterId: string; documentId: string }>();
  const { getCustomer, updateDocumentStatus, generateUploadLink } = useCustomers();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [documentBlobType, setDocumentBlobType] = useState<string | null>(null);

  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const { tempCustomer, setTempCustomer } = useTempCustomer();
  const [document, setDocument] = useState<any | null>(null);
  const customerService = useCustomerService();
  const [rejectLoading, setRejectLoading] = useState<boolean>(false);
  const [onHoldLoading, setOnHoldLoading] = useState<boolean>(false);
  const [approveLoding, setApproveLoding] = useState<boolean>(false);
  const documentService = useDocumentService();

  const [zoom, setZoom] = useState(1);
  const zoomPluginInstance = zoomPlugin();


  const handleZoom = async (action: "IN" | "OUT") => {
    if (action == "IN") {
      if (zoom < 1.5) setZoom(prev => prev + 0.1)
    } else {
      if (zoom > 1) setZoom(prev => prev - 0.1)
    }
  }

  const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    return (
      <div className="flex items-center gap-2 mt-4">
        <div className="inline-flex rounded-md shadow-sm border border-gray-200 bg-white/80 backdrop-blur-md overflow-hidden" role="group">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { zoomOut(); handleZoom("OUT"); }}
            title="Zoom Out"
            aria-label="Zoom Out"
            className="rounded-none border-0 transition-transform duration-150 hover:scale-105 hover:bg-gray-100"
          >
            <ZoomOut className="h-4 w-4 drop-shadow" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="rounded-none border-0 bg-white text-gray-700 cursor-default select-none"
            style={{ pointerEvents: "none" }}
            tabIndex={-1}
            aria-label="Current Zoom Percentage"
            title="Current Zoom Percentage"
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { zoomIn(); handleZoom("IN"); }}
            title="Zoom In"
            aria-label="Zoom In"
            className="rounded-none border-0 transition-transform duration-150 hover:scale-105 hover:bg-gray-100"
          >
            <ZoomIn className="h-4 w-4 drop-shadow" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { resetTransform(); setZoom(1); }}
            title="Reset Zoom"
            aria-label="Reset Zoom"
            className="rounded-none border-0 transition-transform duration-150 hover:scale-105 hover:bg-gray-100"
          >
            <RotateCcw className="h-4 w-4 drop-shadow" />
          </Button>
        </div>
      </div>
    );
  };


  // Clean up created Blob URL on unmount
  useEffect(() => {
    (async function fetchCustomer() {
      try {
        if (tempCustomer) {
          setCustomer(tempCustomer);
          const res = await documentService.getDocumentByDocumentID(documentId);
          setDocument(res.data);
          // Fetch the file as a Blob and create an object URL
          setIsLoading(true);
          setError(null);
          try {
            const fileBlob = await documentService.getFile(res.data.url); // fileBlob is a Blob
            if (documentBlobUrl) {
              URL.revokeObjectURL(documentBlobUrl);
            }
            const type = await fileTypeFromBlob(fileBlob);
            const url = URL.createObjectURL(fileBlob);
            setDocumentBlobUrl(url);
            setDocumentBlobType(type?.mime);
          } catch (err) {
            setError("Failed to load document preview.");
          } finally {
            setIsLoading(false);
          }
        } else {
          toast({
            title: `failed to fetch customer details`,
            description: "Something went wrong please try again",
            variant: "destructive",
          });
          navigate("/admin/customers");
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
    })();

    return () => {
      if (documentBlobUrl) {
        URL.revokeObjectURL(documentBlobUrl);
      }
    };
  }, []);

  useEffect(() => {
    // Only apply zoom for PDFs
    if (
      (documentBlobType === "application/pdf" || (document?.fileName && document.fileName.toLowerCase().endsWith('.pdf')))
      && typeof zoomPluginInstance.zoomTo === 'function'
    ) {
      zoomPluginInstance.zoomTo(zoom);
    }
  }, [zoom, documentBlobType, document?.fileName]);

  if (!customer || !document) {
    return (
      <MainLayout showSidebar={true}>
        <div className="py-6">
          <p>Document not found.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleUpdateStatus = async (status: "APPROVED" | "REJECTED" | "UPLOADED") => {
    if (rejectLoading || onHoldLoading || approveLoding) return;
    try {
      await customerService.updateDocumentStatus(customer.pan, document.documentId, status, remarks)
      const statusMessage =
        status === "APPROVED" ? "Document approved successfully" :
          status === "REJECTED" ? "Document rejected - customer notified" :
            "Document put on hold";
      toast({
        title: statusMessage,
        description: remarks ? `Remarks: ${remarks}` : undefined,
      });
      const response = await customerService.getCustomerDocuments(customer.pan);
      const customers: CustomerType = { ...customer, documents: response }
      await setTempCustomer(customers);
      setApproveLoding(false)
      setRejectLoading(false)
      setOnHoldLoading(false)
      navigate(`/admin/customers/details`);
    }
    catch (e: any) {
      setApproveLoding(false)
      setRejectLoading(false)
      setOnHoldLoading(false)
      toast({
        title: "Failed to update status",
        description: remarks ? `Remarks: ${remarks}` : undefined,
        variant: "destructive"
      });
    }
    setApproveLoding(false)
    setRejectLoading(false)
    setOnHoldLoading(false)
  };

  // Document preview rendering
  const renderPreview = () => {

    if (isLoading) {
      return (
        <div className="space-y-4 w-full">
          <Skeleton className="h-[350px] w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      );
    }
    if (error) {
      return <p className="text-sm text-red-500 mt-2">{error}</p>;
    }
    if (documentBlobUrl) {
      // 1. If type is image/*
      if (documentBlobType && documentBlobType.startsWith("image/")) {
        return (

          <TransformWrapper
            initialScale={1}
            wheel={{ disabled: true }}          // disables zoom via mouse wheel / touchpad
            pinch={{ disabled: true }}         // disables pinch-to-zoom gesture (touchscreens/touchpad)
            doubleClick={{ disabled: true }}   // disables double-click to zoom
            panning={{ disabled: false }}
          >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
              <>

                <TransformComponent>
                  <img src={documentBlobUrl} alt={document?.fileName} />
                </TransformComponent>
                <Controls />
              </>
            )}
          </TransformWrapper>

        );
      }
      // 2. If type is PDF
      if (documentBlobType === "application/pdf" || (document?.fileName && document.fileName.toLowerCase().endsWith('.pdf'))) {
        return (
          <div style={{ width: '100%', height: '400px' }}>
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
              <Viewer fileUrl={documentBlobUrl} plugins={[zoomPluginInstance]} />
            </Worker>
          </div>
        );
      }


      // 4. As a last resort, try to render as image
      return (
        <div>
          <p>Preview not supported. <a href={documentBlobUrl} download="document" >Click here to download</a></p>
        </div>
      );
    }
    return <p>No preview available.</p>;
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/customers/details`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Review</CardTitle>
              <CardDescription>
                Review and provide a decision for the document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Document Name</p>
                  <p className="font-medium flex items-center">
                    {document.fileName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded On</p>
                  <p className="font-medium">
                    {new Date(document.uploadedOn).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <p className="font-medium capitalize">
                    {document?.currentStatus?.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <label htmlFor="remarks" className="text-sm text-muted-foreground">
                    Remarks
                  </label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add optional remarks here..."
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              
              <div className="grid grid-cols-3 gap-4 w-full">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleUpdateStatus("APPROVED")
                    setApproveLoding(true)
                  }}
                  title={document.currentStatus == "APPROVED" ? "Cant change status once approved" : "Approve document"}
                  disabled={document.currentStatus == "APPROVED"}
                >
                  {approveLoding ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Approving
                    </span>
                  ) : (
                    <><Check className="mr-2 h-4 w-4" /> Approve</>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (!remarks.trim()) {
                      toast({
                        title: "Remarks required",
                        description: "Please provide remarks before rejecting the document.",
                        variant: "destructive"
                      });
                      return;
                    }
                    handleUpdateStatus("REJECTED");
                    setRejectLoading(true)
                  }}
                  title={document.currentStatus == "APPROVED" ? "Cant change status once approved" : "Reject document"}
                  disabled={document.currentStatus == "APPROVED"}
                >
                  {rejectLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Rejecting
                    </span>
                  ) : (
                    <><X className="mr-2 h-4 w-4" /> Reject</>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>

            {documentBlobType !== "application/pdf" ? (
              <div style={{ width: '100%', height: '400px', overflow: 'hidden', background: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardContent className="flex flex-col justify-center items-center min-h-[400px] bg-muted/40 relative " style={{ cursor: "move" }}>
                  {renderPreview()}
                </CardContent>
              </div>
            ) : (
              <CardContent className="flex flex-col justify-center items-center min-h-[400px] bg-muted/40 relative">
                {renderPreview()}
                <div className="flex items-center gap-2 mt-4">
                  <div className="inline-flex rounded-md shadow-sm border border-gray-200 bg-white/80 backdrop-blur-md overflow-hidden" role="group">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))}
                      title="Zoom Out"
                      aria-label="Zoom Out"
                      className="rounded-none border-0 transition-transform duration-150 hover:scale-105 hover:bg-gray-100"
                    >
                      <ZoomOut className="h-4 w-4 drop-shadow" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="rounded-none border-0 bg-white text-gray-700 cursor-default select-none"
                      style={{ pointerEvents: "none" }}
                      tabIndex={-1}
                      aria-label="Current Zoom Percentage"
                      title="Current Zoom Percentage"
                    >
                      {Math.round(zoom * 100)}%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(z => Math.min(z + 0.1, 3))}
                      title="Zoom In"
                      aria-label="Zoom In"
                      className="rounded-none border-0 transition-transform duration-150 hover:scale-105 hover:bg-gray-100"
                    >
                      <ZoomIn className="h-4 w-4 drop-shadow" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(0.5)}
                      title="Reset Zoom"
                      aria-label="Reset Zoom"
                      className="rounded-none border-0 transition-transform duration-150 hover:scale-105 hover:bg-gray-100"
                    >
                      <RotateCcw className="h-4 w-4 drop-shadow" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}

          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReviewDocument;
