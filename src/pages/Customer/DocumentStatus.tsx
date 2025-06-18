import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useDocuments, DocumentFile } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, FileText, Folder } from "lucide-react";
import { useDocumentUploadService, DocumentMastersResponse, DocumentType } from "@/services/documentUploadService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const DocumentStatus = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { getFolderDocuments, isFolderSubmitted } = useDocuments();
  const documentUploadService = useDocumentUploadService();
  
  const [documentMasters, setDocumentMasters] = useState<DocumentMastersResponse | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, DocumentFile[]>>({});

  useEffect(() => {
    if (!userId) {
      navigate("/customer");
    }
  }, [userId, navigate]);

  // Call document masters API on page render
  useEffect(() => {
    const fetchDocumentMasters = async () => {
      try {
        const response = await documentUploadService.getDocumentMasters("Individual");
        setDocumentMasters(response.data);
      } catch (error) {
        console.error("Error fetching document masters:", error);
      }
    };

    fetchDocumentMasters();
  }, [documentUploadService]);

  // Sync uploaded files state with document context
  useEffect(() => {
    if (!userId || !documentMasters) return;

    const syncUploadedFiles = () => {
      const syncedFiles: Record<string, DocumentFile[]> = {};
      
      documentMasters.documentsByCategory.forEach(category => {
        category.documents.forEach(document => {
          const folderId = `documents_${document.id}`;
          const folderDocuments = getFolderDocuments(userId, folderId);
          
          if (folderDocuments.length > 0) {
            syncedFiles[document.id] = folderDocuments;
          }
        });
      });
      
      setUploadedFiles(syncedFiles);
    };

    syncUploadedFiles();
  }, [userId, documentMasters, getFolderDocuments]);

  const isDocumentSubmitted = (documentId: string): boolean => {
    if (!userId) return false;
    const folderId = `documents_${documentId}`;
    return isFolderSubmitted(userId, folderId);
  };

  const getDocumentStatus = (documentId: string) => {
    const isSubmitted = isDocumentSubmitted(documentId);
    const hasFiles = uploadedFiles[documentId] && uploadedFiles[documentId].length > 0;
    
    if (!hasFiles) {
      return { 
        status: 'pending', 
        icon: <Clock className="h-4 w-4 text-yellow-600" />, 
        label: 'Pending'
      };
    }
    
    if (isSubmitted) {
      return { 
        status: 'submitted', 
        icon: <CheckCircle className="h-4 w-4 text-green-600" />, 
        label: 'Submitted'
      };
    } else if (hasFiles) {
      return { 
        status: 'uploaded', 
        icon: <FileText className="h-4 w-4 text-blue-600" />, 
        label: 'Uploaded'
      };
    } else {
      return { 
        status: 'pending', 
        icon: <AlertCircle className="h-4 w-4 text-yellow-600" />, 
        label: 'Pending'
      };
    }
  };

  const getStatusBadge = (documentId: string) => {
    const status = getDocumentStatus(documentId);
    
    switch (status.status) {
      case 'submitted':
        return <Badge variant="default" className="bg-green-100 text-green-800">Submitted</Badge>;
      case 'uploaded':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Uploaded</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getLastUploadedDate = (documentId: string): string | null => {
    const files = uploadedFiles[documentId];
    if (!files || files.length === 0) return null;
    
    const dates = files.map(file => new Date(file.uploaded));
    const lastDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return lastDate.toLocaleDateString();
  };

  const getFileCount = (documentId: string): number => {
    return uploadedFiles[documentId]?.length || 0;
  };

  // Get all documents from all categories for the single table
  const getAllDocuments = (): Array<{ document: DocumentType; category: string }> => {
    if (!documentMasters) return [];
    
    const allDocuments: Array<{ document: DocumentType; category: string }> = [];
    
    documentMasters.documentsByCategory.forEach(category => {
      category.documents.forEach(document => {
        allDocuments.push({ document, category: category.category });
      });
    });
    
    return allDocuments;
  };

  if (!documentMasters) {
    return (
      <MainLayout showSidebar={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading document status...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const allDocuments = getAllDocuments();

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Document Status</h1>
            <p className="text-gray-600 mt-1">
              Track the status of your uploaded documents
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                {allDocuments.length} documents available
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%]">Document Type</TableHead>
                      <TableHead className="w-[20%]">Category</TableHead>
                      <TableHead className="w-[15%]">Status</TableHead>
                      <TableHead className="w-[15%]">Files Count</TableHead>
                      <TableHead className="w-[15%]">Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allDocuments.length > 0 ? (
                      allDocuments.map(({ document, category }) => {
                        const fileCount = getFileCount(document.id);
                        const lastUpdated = getLastUploadedDate(document.id);
                        
                        return (
                          <TableRow key={document.id}>
                            <TableCell className="font-medium">
                              {document.documentType}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">{category}</span>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(document.id)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{fileCount}</span>
                                <span className="text-sm text-gray-500">
                                  {fileCount === 1 ? 'file' : 'files'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {lastUpdated ? (
                                <span className="text-sm font-medium">{lastUpdated}</span>
                              ) : (
                                <span className="text-sm text-gray-400">Not uploaded</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No documents found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => navigate("/customer/dashboard")}
              className="px-6"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentStatus;
