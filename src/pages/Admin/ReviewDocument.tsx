import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Clock, ZoomIn, ZoomOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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

// Set up PDF.js worker with a direct path (instead of dynamic import)
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

const ReviewDocument = () => {
  const { customerId, documentId } = useParams<{ customerId: string; documentId: string }>();
  const { getCustomer, updateDocumentStatus, generateUploadLink } = useCustomers();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [remarks, setRemarks] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);

  const customer = getCustomer(customerId || "");
  const document = customer?.documents.find((doc) => doc.id === documentId);

  useEffect(() => {
    if (document) {
      if (usingSamplePreviews()) {
        // Use sample preview based on document name
        const sampleUrl = getSamplePreviewUrl(document.name, document.fileUrl?.split(';')[0]);
        
        if (isPdfPreview(sampleUrl)) {
          loadPdf(sampleUrl);
        } else {
          // For non-PDF samples, just set the URL without conversion
          setDocumentBlobUrl(sampleUrl);
        }
      } else {
        // If the fileUrl is a data URL, convert it to a Blob URL
        if (document.fileUrl.startsWith('data:')) {
          const blob = dataURLtoBlob(document.fileUrl);
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            setDocumentBlobUrl(blobUrl);
            
            if (document.fileUrl.toLowerCase().includes('application/pdf') || 
                document.name.toLowerCase().endsWith('.pdf')) {
              loadPdf(blobUrl);
            }
          } else {
            setError("Failed to convert document data to viewable format");
          }
        } else if (document.fileUrl.toLowerCase().endsWith('.pdf')) {
          loadPdf(document.fileUrl);
        }
      }
    }
  }, [document]);

  // Clean up created Blob URL on unmount
  useEffect(() => {
    return () => {
      if (documentBlobUrl) {
        URL.revokeObjectURL(documentBlobUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage();
    }
  }, [pdfDoc, pageNum, zoomLevel]);

  const loadPdf = async (url: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Handle placeholder URLs
      if (url === "/placeholder.svg" || !url) {
        // Use a sample PDF for demo purposes
        url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
      }

      // Create document loading task without dynamic imports
      const loadingTask = pdfjs.getDocument({
        url: url,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist/cmaps/',
        cMapPacked: true,
      });
      
      try {
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setPageNum(1);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF. Using image fallback.");
      }
    } catch (err) {
      console.error("Error in PDF loading process:", err);
      setError("Failed to load PDF. Using image fallback.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async () => {
    if (!pdfDoc || !canvasRef.current) return;
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoomLevel });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error("Could not get canvas context");
        return;
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
    } catch (err) {
      console.error("Error rendering PDF page:", err);
      setError("Failed to render PDF page. Using image fallback.");
    }
  };

  const isPdf = document?.name.toLowerCase().endsWith('.pdf') || 
               getSamplePreviewUrl(document?.name || '').toLowerCase().endsWith('.pdf');
  const isImage = document?.name.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/);
  
  // Get a usable document URL or fallback
  const getDocumentUrl = () => {
    // If we're using sample previews, return the appropriate sample
    if (usingSamplePreviews() && document) {
      return getSamplePreviewUrl(document.name);
    }
    
    // First try the blob URL if we created one
    if (documentBlobUrl) {
      return documentBlobUrl;
    }
    
    // If document has a data URL, use it directly
    if (document?.fileUrl && document.fileUrl.startsWith('data:')) {
      return document.fileUrl;
    }
    
    // Use the original URL or fallback
    if (!document?.fileUrl || document.fileUrl === "/placeholder.svg") {
      // Return appropriate fallback based on document type
      if (isPdf) {
        return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
      } else if (isImage) {
        return "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80";
      }
      return "/placeholder.svg";
    }
    return document.fileUrl;
  };

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

  const handleUpdateStatus = (status: "approved" | "rejected" | "on_hold") => {
    updateDocumentStatus(customer.id, document.id, status, remarks);

    const statusMessage = 
      status === "approved" ? "Document approved successfully" :
      status === "rejected" ? "Document rejected - customer notified" : 
      "Document put on hold";

    toast({
      title: statusMessage,
      description: remarks ? `Remarks: ${remarks}` : undefined,
    });

    if (status === "rejected") {
      const link = generateUploadLink(customer.id, document.id, remarks);
      // In a real app, this would send an email with the link
      toast({
        title: "Reupload link generated",
        description: `Link for document reupload sent to ${customer.email}`,
      });
    }

    navigate(`/admin/customers/${customer.id}`);
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/customers/${customer.id}`)}
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
                  <p className="font-medium">{document.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded On</p>
                  <p className="font-medium">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <p className="font-medium capitalize">
                    {document.status.replace("_", " ")}
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
                  onClick={() => handleUpdateStatus("approved")}
                >
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus("rejected")}
                >
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus("on_hold")}
                >
                  <Clock className="mr-2 h-4 w-4" /> On Hold
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              {usingSamplePreviews() && (
                <CardDescription className="text-yellow-500">
                  Showing sample preview - original content not displayed
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center min-h-[400px] bg-muted/40 relative">
              {isLoading ? (
                <div className="space-y-4 w-full">
                  <Skeleton className="h-[350px] w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              ) : isPdf && !error ? (
                <div className="flex flex-col items-center w-full">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[350px] border border-muted rounded shadow-sm"
                  />
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs w-16 text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={getDocumentUrl()}
                    alt={document.name}
                    className="max-w-full max-h-[350px] object-contain mx-auto"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="mt-4 flex items-center gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs w-16 text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReviewDocument;
