
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { useDocuments } from "@/contexts/DocumentContext";
import type { DocumentFile } from "@/contexts/DocumentContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, FileText, Eye } from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

// Configure PDF.js with a stable CDN URL for the worker
// Note: Using version variable to ensure version compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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

interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  destroy: () => Promise<void>;
}

interface PDFPageProxy {
  getViewport: (scale: { scale: number }) => any;
  render: (params: { canvasContext: CanvasRenderingContext2D, viewport: any }) => { promise: Promise<void> };
}

const BankDocuments = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { documents, getFolderDocuments, removeDocument } = useDocuments();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [documentFiles, setDocumentFiles] = useState<DocumentFile[]>([]);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ userId: string; folder: string; fileId: string } | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Mock document folders
  const documentFolders = [
    { id: "personal_identification", name: "Personal Identification" },
    { id: "address_proof", name: "Address Proof" },
    { id: "income_proof", name: "Income Proof" },
  ];

  useEffect(() => {
    if (userId && selectedFolder) {
      setDocumentFiles(getFolderDocuments(userId, selectedFolder));
    }
  }, [userId, selectedFolder, documents, getFolderDocuments]);

  const handleFolderClick = (folderId: string) => {
    setSelectedFolder(folderId);
  };

  const confirmDeleteDocument = (userId: string, folder: string, fileId: string) => {
    setDocumentToDelete({ userId, folder, fileId });
    setDeleteConfirmationOpen(true);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setDocumentToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      removeDocument(documentToDelete.userId, documentToDelete.folder, documentToDelete.fileId);
      setDocumentFiles(prevFiles => prevFiles.filter(file => file.id !== documentToDelete.fileId));
      setDeleteConfirmationOpen(false);
      setDocumentToDelete(null);
    }
  };

  const renderPage = useCallback(async () => {
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
      setError("Failed to render PDF page.");
    }
  }, [pdfDoc, pageNum, zoomLevel]);

  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage();
    }
  }, [pdfDoc, pageNum, zoomLevel, renderPage]);

  const loadPdf = async (url: string): Promise<PDFDocumentProxy | null> => {
    try {
      // Handle placeholder URLs or empty strings
      if (url === "/placeholder.svg" || !url) {
        // Use a sample PDF for demo purposes
        url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
      }
    
      const loadingTask = pdfjs.getDocument({
        url: url,
        // Use unpkg for consistent CDN availability
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
      });
    
      return await loadingTask.promise;
    } catch (err) {
      console.error("Error loading PDF:", err);
      return null;
    }
  };

  const handleDocumentClick = async (file: DocumentFile) => {
    if (file.url && file.url.toLowerCase().endsWith('.pdf')) {
      setError(null);
      try {
        const pdf = await loadPdf(file.url);
        if (pdf) {
          setPdfDoc(pdf);
          setPageNum(1);
        } else {
          setError("Failed to load PDF document.");
        }
      } catch (pdfError) {
        console.error("Error loading PDF:", pdfError);
        setError("Failed to load PDF document.");
      }
    } else {
      // Handle non-PDF documents (e.g., images)
      window.open(file.url, '_blank');
    }
  };

  return (
    <MainLayout>
      <div className="py-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>Manage and view your uploaded documents.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Document Folders */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4">Document Folders</h3>
              <ul className="space-y-2">
                {documentFolders.map((folder) => (
                  <li key={folder.id}>
                    <Button
                      variant="outline"
                      className={`w-full justify-start ${selectedFolder === folder.id ? 'bg-secondary hover:bg-secondary/80' : ''}`}
                      onClick={() => handleFolderClick(folder.id)}
                    >
                      {folder.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Uploaded Documents */}
            <div className="col-span-1 md:col-span-2">
              {selectedFolder ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
                  {documentFiles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documentFiles.map((file) => (
                        <div key={file.id} className="relative border rounded-md p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 mr-2" />
                              <span className="font-medium">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => confirmDeleteDocument(userId, selectedFolder, file.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">Uploaded: {new Date(file.uploaded).toLocaleDateString()}</p>
                            <Button variant="outline" size="sm" onClick={() => handleDocumentClick(file)}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No documents uploaded in this folder.</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Select a folder to view documents.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Are you sure you want to delete this document?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleCancelDelete}>Cancel</AlertDialogAction>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-700 text-white">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* PDF Viewer */}
        {pdfDoc && (
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <canvas ref={canvasRef} className="border border-gray-300" />
              <div className="flex items-center mt-4">
                <Button onClick={() => setPageNum(prev => Math.max(1, prev - 1))} disabled={pageNum <= 1}>Previous</Button>
                <span className="mx-4">Page {pageNum} of {pdfDoc.numPages}</span>
                <Button onClick={() => setPageNum(prev => Math.min(pdfDoc.numPages, prev + 1))} disabled={pageNum >= pdfDoc.numPages}>Next</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </MainLayout>
  );
};

export default BankDocuments;
