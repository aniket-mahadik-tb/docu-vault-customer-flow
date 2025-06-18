import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { useDocuments, DocumentFile } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDocumentUploadService, DocumentMastersResponse, DocumentType, DocumentCategory } from "@/services/documentUploadService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { addDocument, removeDocument, submitFolder, getFolderDocuments, isFolderSubmitted } = useDocuments();
  const { syncCustomerDocuments } = useCustomers();
  const documentUploadService = useDocumentUploadService();
  
  const [documentMasters, setDocumentMasters] = useState<DocumentMastersResponse | null>(null);
  const [uploadingDocuments, setUploadingDocuments] = useState<Record<string, boolean>>({});
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

  const handleFileUpload = async (documentId: string, files: FileList) => {
    if (!userId) return;
    
    try {
      setUploadingDocuments(prev => ({ ...prev, [documentId]: true }));
      
      const uploadedFilesList: DocumentFile[] = [];
      const documentsToUpload: any[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const folderId = `documents_${documentId}`;
        await addDocument(userId, folderId, file);
        
        // Create a mock DocumentFile object for display
        const documentFile: DocumentFile = {
          id: `file_${Date.now()}_${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploaded: new Date(),
          lastModified: 0
        };
        
        uploadedFilesList.push(documentFile);
        
        // Prepare document for API upload
        documentsToUpload.push({
          documentId: documentId,
          documentType: documentMasters?.documentsByCategory
            .flatMap(cat => cat.documents)
            .find(doc => doc.id === documentId)?.documentType || "Unknown",
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        });
      }
      
      // Auto-submit the document when files are uploaded
      const folderId = `documents_${documentId}`;
      submitFolder(userId, folderId);
      
      // Update uploaded files state
      setUploadedFiles(prev => ({
        ...prev,
        [documentId]: [...(prev[documentId] || []), ...uploadedFilesList]
      }));
      
      // Call the upload API service
      if (documentsToUpload.length > 0) {
        const uploadRequest = {
          customerId: userId,
          documents: documentsToUpload
        };
        
        const uploadResponse = await documentUploadService.uploadDocuments(uploadRequest);
        console.log("Document upload API response:", uploadResponse);
      }
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) added and submitted successfully`,
      });
      
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive",
      });
    } finally {
      setUploadingDocuments(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const handleRemoveFile = (documentId: string, fileId: string) => {
    if (!userId) return;
    
    const folderId = `documents_${documentId}`;
    removeDocument(userId, folderId, fileId);
    
    // Remove from uploaded files state
    setUploadedFiles(prev => {
      const updatedFiles = {
        ...prev,
        [documentId]: prev[documentId]?.filter(file => file.id !== fileId) || []
      };
      
      // If no files left, the document should be considered pending
      // The status will automatically update to pending due to the updated getDocumentStatus logic
      
      return updatedFiles;
    });
    
    toast({
      title: "File removed",
      description: "Document has been removed",
    });
  };

  const isDocumentSubmitted = (documentId: string): boolean => {
    if (!userId) return false;
    const folderId = `documents_${documentId}`;
    return isFolderSubmitted(userId, folderId);
  };

  const getDocumentStatus = (documentId: string) => {
    const isSubmitted = isDocumentSubmitted(documentId);
    const hasFiles = uploadedFiles[documentId] && uploadedFiles[documentId].length > 0;
    
    // If there are no files in local state, it should be pending regardless of submission status
    if (!hasFiles) {
      return { status: 'pending', icon: <AlertCircle className="h-4 w-4 text-yellow-600" />, label: 'Pending' };
    }
    
    if (isSubmitted) {
      return { status: 'submitted', icon: <CheckCircle className="h-4 w-4 text-green-600" />, label: 'Submitted' };
    } else if (hasFiles) {
      return { status: 'uploaded', icon: <FileText className="h-4 w-4 text-blue-600" />, label: 'Uploaded' };
    } else {
      return { status: 'pending', icon: <AlertCircle className="h-4 w-4 text-yellow-600" />, label: 'Pending' };
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

  if (!documentMasters) {
    return (
      <MainLayout showSidebar={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading document requirements...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Document Upload</h1>
            <p className="text-gray-600 mt-1">
              Please upload the required documents for your application
            </p>
          </div>

          {documentMasters.documentsByCategory.map((category: DocumentCategory, categoryIndex: number) => (
            <Card key={categoryIndex} className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Document Type</TableHead>
                      <TableHead className="w-[15%]">Status</TableHead>
                      <TableHead className="w-[20%]">Uploaded Files</TableHead>
                      <TableHead className="w-[15%]">Mandatory</TableHead>
                      <TableHead className="w-[10%]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.documents.map((document: DocumentType) => (
                      <TableRow key={document.id}>
                        <TableCell className="font-medium">
                          {document.documentType}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(document.id)}
                        </TableCell>
                        <TableCell>
                          {uploadedFiles[document.id] && uploadedFiles[document.id].length > 0 ? (
                            <div className="space-y-1">
                              {uploadedFiles[document.id].map((file, fileIndex) => (
                                <div key={file.id} className="flex items-center justify-between text-sm">
                                  <span className="truncate max-w-[150px]" title={file.name}>
                                    {file.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFile(document.id, file.id)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No files uploaded</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {document.isMandatory ? (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">Required</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              id={`file-${document.id}`}
                              multiple
                              onChange={(e) => e.target.files && handleFileUpload(document.id, e.target.files)}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            <label htmlFor={`file-${document.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={uploadingDocuments[document.id]}
                                className="cursor-pointer"
                                asChild
                              >
                                <span>
                                  {uploadingDocuments[document.id] ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                  ) : (
                                    <Upload className="h-4 w-4" />
                                  )}
                                  <span className="ml-1">Upload</span>
                                </span>
                              </Button>
                            </label>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

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

export default DocumentUpload;
