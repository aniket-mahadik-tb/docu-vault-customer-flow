import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Eye, FileImage, FileText, File, ZoomIn, ZoomOut, Search, Download, ArrowDown, ArrowUp, X } from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

// Initialize PDF.js worker with unpkg CDN (more reliable than cdnjs)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentGroup {
  name: string;
  documents: Array<{
    id: string;
    name: string;
    type?: string;
    thumbnail: string;
    fileUrl: string;
  }>;
}

const BankDocuments = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { customers } = useCustomers();
  const [previewDoc, setPreviewDoc] = useState<{id: string, name: string, url: string, type: string} | null>(null);
  const [documentGroups, setDocumentGroups] = useState<DocumentGroup[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(0);
  const [showSearchPopover, setShowSearchPopover] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!userId) {
      navigate("/bank");
    }
  }, [userId, navigate]);

  // Get shared documents based on the PAN (userId)
  useEffect(() => {
    if (!userId) return;
    
    // Find the customer with matching PAN
    const customer = customers.find(c => c.panCard === userId);
    
    if (!customer) return;
    
    setCustomerName(customer.name);
    
    // Get approved documents and organize them by section
    const sectionMap = new Map<string, DocumentGroup>();
    
    customer.documents.forEach(doc => {
      // Only include approved documents
      if (doc.status === "approved") {
        const sectionName = doc.sectionId === "section1" ? "KYC Documents" :
                            doc.sectionId === "section2" ? "Business Documents" :
                            doc.sectionId === "section3" ? "Address Documents" :
                            doc.sectionId === "section4" ? "Financial Documents" :
                            "Other Documents";
        
        if (!sectionMap.has(sectionName)) {
          sectionMap.set(sectionName, {
            name: sectionName,
            documents: []
          });
        }
        
        // Determine file type
        const fileExtension = doc.name.split('.').pop()?.toLowerCase() || '';
        const fileType = 
          fileExtension === 'pdf' ? 'application/pdf' : 
          ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension) ? 'image' : 
          'other';
        
        sectionMap.get(sectionName)?.documents.push({
          id: doc.id,
          name: doc.name,
          type: fileType,
          thumbnail: doc.fileUrl,
          fileUrl: doc.fileUrl
        });
      }
    });
    
    // Convert map to array
    setDocumentGroups(Array.from(sectionMap.values()));
    
  }, [userId, customers]);

  // Render PDF page when pageNum or zoomLevel changes
  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage(pageNum);
    }
  }, [pageNum, zoomLevel, pdfDoc]);

  // Clean up PDF document when dialog closes
  useEffect(() => {
    if (!openDialog) {
      setPdfDoc(null);
      setPageNum(1);
      setNumPages(0);
      setZoomLevel(1);
      setSearchText("");
      setSearchResults([]);
      setCurrentSearchIndex(0);
    }
  }, [openDialog]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!openDialog || !previewDoc || previewDoc.type !== 'application/pdf') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          if (pageNum < numPages) {
            setPageNum(prev => prev + 1);
          }
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          if (pageNum > 1) {
            setPageNum(prev => prev - 1);
          }
          break;
        case '+':
          setZoomLevel(prev => Math.min(prev + 0.1, 2));
          break;
        case '-':
          setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
          break;
        case 'f':
          if (e.ctrlKey) {
            e.preventDefault();
            setShowSearchPopover(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openDialog, previewDoc, pageNum, numPages]);

  const handlePreviewClick = (doc: {id: string, name: string, type?: string, fileUrl: string}) => {
    const fileExtension = doc.name.split('.').pop()?.toLowerCase() || '';
    const fileType = 
      fileExtension === 'pdf' ? 'application/pdf' : 
      ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension) ? 'image' : 
      'other';
    
    // Check if fileUrl is a placeholder or actual file content
    let docUrl = doc.fileUrl;
    
    // If it's a placeholder, use a demo image instead
    if (docUrl === "/placeholder.svg" || !docUrl) {
      // Use placeholder based on file type
      if (fileType === 'image') {
        docUrl = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80";
      } else if (fileType === 'application/pdf') {
        // For PDFs, use a sample PDF that's publicly accessible
        docUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
      }
    }
    
    setPreviewDoc({
      id: doc.id,
      name: doc.name,
      url: docUrl,
      type: fileType
    });
    setOpenDialog(true);
    
    if (fileType === 'application/pdf') {
      loadPdfDocument(docUrl);
    }
  };

  const loadPdfDocument = async (url: string) => {
    try {
      setIsLoading(true);
      setLoadingProgress(10);
      setErrorMessage(""); // Clear previous errors
      
      const loadingTask = pdfjs.getDocument({
        url: url,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/cmaps/',
        cMapPacked: true,
      });
      
      loadingTask.onProgress = (progress) => {
        const percent = progress.loaded / (progress.total || 100) * 100;
        setLoadingProgress(Math.min(percent, 90));
      };
      
      try {
        const pdf = await loadingTask.promise;
        setLoadingProgress(100);
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPageNum(1);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setErrorMessage("Failed to load the PDF document. Please check if the URL is accessible.");
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error("Error in PDF loading process:", error);
      setErrorMessage("Failed to load the PDF document. The file might be corrupted or inaccessible.");
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (num: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(num);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }
      
      // Scale viewport based on zoom level
      const viewport = page.getViewport({ scale: zoomLevel });
      
      // Set canvas dimensions to match viewport
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
    } catch (error) {
      console.error("Error rendering page:", error);
      setErrorMessage("Error rendering PDF page. Please try again.");
    }
  };

  const handleSearch = async () => {
    if (!pdfDoc || !searchText) return;
    
    setSearchResults([]);
    setCurrentSearchIndex(0);
    
    try {
      const results = [];
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(' ');
        
        if (text.toLowerCase().includes(searchText.toLowerCase())) {
          results.push({
            pageNum: i,
            text: text
          });
        }
      }
      
      setSearchResults(results);
      
      if (results.length > 0) {
        // Navigate to the first result
        setPageNum(results[0].pageNum);
      }
    } catch (error) {
      console.error("Error searching PDF:", error);
    }
  };

  const navigateSearchResult = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;
    
    let newIndex = currentSearchIndex;
    
    if (direction === 'next') {
      newIndex = (newIndex + 1) % searchResults.length;
    } else {
      newIndex = (newIndex - 1 + searchResults.length) % searchResults.length;
    }
    
    setCurrentSearchIndex(newIndex);
    setPageNum(searchResults[newIndex].pageNum);
  };

  // Helper to render document icon based on type
  const renderDocumentIcon = (docName: string) => {
    const fileExtension = docName.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <FileImage className="h-12 w-12 text-blue-500" />;
    } else if (fileExtension === 'pdf') {
      return <FileText className="h-12 w-12 text-red-500" />;
    } else {
      return <File className="h-12 w-12 text-gray-500" />;
    }
  };

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-2">Shared Documents</h1>
        <p className="text-muted-foreground mb-6">
          Viewing documents shared for customer: <span className="font-medium">{customerName}</span> (PAN: {userId})
        </p>

        {documentGroups.length > 0 ? (
          <Tabs defaultValue={documentGroups[0]?.name} className="w-full">
            <TabsList className="mb-4">
              {documentGroups.map((group) => (
                <TabsTrigger key={group.name} value={group.name}>
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {documentGroups.map((group) => (
              <TabsContent key={group.name} value={group.name} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.documents.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                      <div className="aspect-video relative bg-muted flex items-center justify-center">
                        {doc.type === 'image' ? (
                          <img 
                            src={doc.fileUrl === "/placeholder.svg" ? 
                              "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80" : 
                              doc.fileUrl
                            } 
                            alt={doc.name}
                            className="w-full h-full object-contain opacity-80" 
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                        ) : (
                          renderDocumentIcon(doc.name)
                        )}
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="absolute bottom-2 right-2"
                          onClick={() => handlePreviewClick(doc)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">View only</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="bg-muted p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
            <p className="text-muted-foreground">
              No approved documents have been shared for this customer yet.
            </p>
          </div>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{previewDoc?.name}</span>
                {previewDoc?.type === 'application/pdf' && pdfDoc && (
                  <div className="flex items-center gap-2 text-sm font-normal">
                    <span>Page {pageNum} of {numPages}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={pageNum <= 1}
                        onClick={() => setPageNum(prev => Math.max(prev - 1, 1))}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={pageNum >= numPages}
                        onClick={() => setPageNum(prev => Math.min(prev + 1, numPages))}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </DialogTitle>
              <DialogClose />
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                  <Progress value={loadingProgress} className="w-[60%] mb-4" />
                  <p className="text-sm text-muted-foreground">Loading document ({Math.round(loadingProgress)}%)...</p>
                </div>
              )}
              
              {previewDoc && !isLoading && (
                <div className="flex items-center justify-center min-h-[50vh]">
                  {previewDoc.type === 'image' ? (
                    <img 
                      src={previewDoc.url}
                      alt={previewDoc.name}
                      className="max-w-full max-h-[70vh] object-contain" 
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  ) : previewDoc.type === 'application/pdf' ? (
                    <div className="w-full flex flex-col items-center">
                      <canvas 
                        ref={canvasRef} 
                        className="border border-muted rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-muted rounded-lg">
                      <File className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <p>Preview not available for this file type</p>
                      <p className="text-sm text-muted-foreground mt-2">{previewDoc.name}</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            
            <DialogFooter className="border-t mt-4 pt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Document preview only. Download is not permitted.</p>
              
              {(previewDoc?.type === 'image' || previewDoc?.type === 'application/pdf') && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs w-12 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  
                  {previewDoc?.type === 'application/pdf' && (
                    <Popover open={showSearchPopover} onOpenChange={setShowSearchPopover}>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Search className="h-4 w-4 mr-1" />
                          Search
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Search text..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                              }}
                            />
                            <Button size="sm" onClick={handleSearch}>Search</Button>
                          </div>
                          
                          {searchResults.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm">
                                {searchResults.length} results found
                                <span className="ml-1 text-muted-foreground">
                                  (Result {currentSearchIndex + 1} of {searchResults.length})
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => navigateSearchResult('prev')}
                                >
                                  Previous
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => navigateSearchResult('next')}
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error Loading Document</AlertDialogTitle>
              <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default BankDocuments;
