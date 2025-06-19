import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { useDocuments, DocumentFile } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Plus, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDocumentUploadService, DocumentType, DocumentCategory } from "@/services/documentUploadService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { addDocument, removeDocument, submitFolder, getFolderDocuments, isFolderSubmitted } = useDocuments();
  const { syncCustomerDocuments } = useCustomers();
  const documentUploadService = useDocumentUploadService();
  
  const [customerType, setCustomerType] = useState<'Individual' | 'Organization'>();
  const [orgCategories, setOrgCategories] = useState<DocumentCategory[]>([]);
  const [promoterCategories, setPromoterCategories] = useState<DocumentCategory[]>([]);
  // Promoters state for Organization
  const [promoters, setPromoters] = useState<{ id: number }[]>([]);
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
        const response = await documentUploadService.getDocumentMasters();
        // response.data is an array
        const org = response.data.find(
          (item: any) => item.customerType?.toUpperCase() === "ORGANIZATION"
        );
        const promoter = response.data.find(
          (item: any) => item.customerType?.toUpperCase() === "PROMOTER"
        );
        const individual = response.data.find(
          (item: any) => item.customerType?.toUpperCase() === "INDIVIDUAL"
        );

        if (org) {
          setCustomerType("Organization");
          setOrgCategories(org.documentsByCategory);
          setPromoterCategories(promoter?.documentsByCategory || []);
        } else if (individual) {
          setCustomerType("Individual");
          setOrgCategories(individual.documentsByCategory);
          setPromoterCategories([]);
        }
      } catch (error) {
        console.error("Error fetching document masters:", error);
      }
    };

    fetchDocumentMasters();
  }, []);

  // Sync uploaded files state with document context
  useEffect(() => {
    if (!userId || orgCategories.length === 0) return;

    const syncUploadedFiles = () => {
      const syncedFiles: Record<string, DocumentFile[]> = {};

      // Default table
      orgCategories.forEach(category => {
        category.documents.forEach(document => {
          const folderId = `documents_${document.id}`;
          const folderDocuments = getFolderDocuments(userId, folderId);
          if (folderDocuments.length > 0) {
            syncedFiles[document.id] = folderDocuments;
          }
        });
      });

      // Promoter tables
      promoterCategories.forEach(category => {
        category.documents.forEach(document => {
          for (let i = 0; i < promoters.length; i++) {
            const promoterDocId = `${document.id}_promoter${i}`;
            const folderDocuments = getFolderDocuments(userId, promoterDocId);
            if (folderDocuments.length > 0) {
              syncedFiles[promoterDocId] = folderDocuments;
            }
          }
        });
      });

      setUploadedFiles(syncedFiles);
    };

    syncUploadedFiles();
  }, [userId, orgCategories, promoterCategories, getFolderDocuments, promoters.length]);

  const handleFileUpload = async (documentId: string, files: FileList) => {
    if (!userId) return;
    try {
      setUploadingDocuments(prev => ({ ...prev, [documentId]: true }));
      const formData = new FormData();
      const uploadedFilesList: DocumentFile[] = [];
  
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        formData.append(`documents[${i}].documentMasterId`, documentId);
        formData.append(`documents[${i}].file`, file);
  
        // Just for UI display
        uploadedFilesList.push({
          id: `file_${Date.now()}_${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploaded: new Date(),
          lastModified: file.lastModified,
        });
      }
      formData.append("pan", "EMUPP6262H");
      await documentUploadService.uploadDocuments(formData);
      const folderId = `documents_${documentId}`;
      submitFolder(userId, folderId);
      setUploadedFiles(prev => ({
        ...prev,
        [documentId]: [...(prev[documentId] || []), ...uploadedFilesList],
      }));
  
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully`,
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
    setUploadedFiles(prev => {
      const updatedFiles = {
        ...prev,
        [documentId]: prev[documentId]?.filter(file => file.id !== fileId) || []
      };
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

  // Add promoter handler
  const handleAddPromoter = () => {
    setPromoters((prev) => [...prev, { id: Date.now() }]);
  };
  // Remove promoter handler
  const handleRemovePromoter = (index: number) => {
    setPromoters((prev) => prev.filter((_, i) => i !== index));
  };

  if (!customerType) {
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

          {/* Always show the default table */}
          {orgCategories.map((category, categoryIndex) => (
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
                      <TableHead className="w-[15%] text-center">Mandatory</TableHead>
                      <TableHead className="w-[10%]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.documents.map((document: DocumentType) => (
                      <TableRow key={document.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {document.documentType}
                            {document.isMultiple && (
                              <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-pointer">
                                      <Info className="h-4 w-4 text-blue-500" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" align="center" className="max-w-xs whitespace-pre-line text-sm">
                                    Multiple files required (e.g., front and back sides)
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
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
                          ) : document.isMultiple ? (
                            <span className="text-gray-400 text-sm">No files uploaded (multiple files required)</span>
                          ) : (
                            <span className="text-gray-400 text-sm">No files uploaded</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
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
                                className="cursor-pointer min-w-[140px] flex items-center justify-center"
                                asChild
                              >
                                <span>
                                  {uploadingDocuments[document.id] ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                  ) : document.isMultiple && uploadedFiles[document.id] && uploadedFiles[document.id].length > 0 ? (
                                    <Plus className="h-4 w-4" />
                                  ) : (
                                    <Upload className="h-4 w-4" />
                                  )}
                                  <span className="ml-1 block truncate">
                                    {document.isMultiple && uploadedFiles[document.id] && uploadedFiles[document.id].length > 0
                                      ? "Add More Docs"
                                      : "Upload Document"}
                                  </span>
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

          {/* Organization: Promoter logic */}
          {customerType === 'Organization' && (
            <>
              {/* Only render promoter tables if promoters.length > 0 */}
              {promoters.length > 0 && promoters.map((promoter, promoterIndex) => (
                <div key={promoter.id} className="mb-10">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">Promoter {promoterIndex + 1}</h2>
                    <button
                      type="button"
                      onClick={() => handleRemovePromoter(promoterIndex)}
                      className="ml-2 flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-900 px-4 py-2 border border-red-300 shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-none"
                      title="Remove Promoter"
                      aria-label="Remove Promoter"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>Remove Promoter</span>
                    </button>
                  </div>
                  {promoterCategories.map((category, categoryIndex) => (
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
                              <TableHead className="w-[15%] text-center">Mandatory</TableHead>
                              <TableHead className="w-[10%]">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {category.documents.map((document: DocumentType) => {
                              // Unique document id per promoter
                              const promoterDocId = `${document.id}_promoter${promoterIndex}`;
                              return (
                                <TableRow key={promoterDocId}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      {document.documentType}
                                      {document.isMultiple && (
                                        <TooltipProvider>
                                          <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                              <span className="cursor-pointer">
                                                <Info className="h-4 w-4 text-blue-500" />
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" align="center" className="max-w-xs whitespace-pre-line text-sm">
                                              Multiple files required (e.g., front and back sides)
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {getStatusBadge(promoterDocId)}
                                  </TableCell>
                                  <TableCell>
                                    {uploadedFiles[promoterDocId] && uploadedFiles[promoterDocId].length > 0 ? (
                                      <div className="space-y-1">
                                        {uploadedFiles[promoterDocId].map((file, fileIndex) => (
                                          <div key={file.id} className="flex items-center justify-between text-sm">
                                            <span className="truncate max-w-[150px]" title={file.name}>
                                              {file.name}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemoveFile(promoterDocId, file.id)}
                                              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : document.isMultiple ? (
                                      <span className="text-gray-400 text-sm">No files uploaded (multiple files required)</span>
                                    ) : (
                                      <span className="text-gray-400 text-sm">No files uploaded</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
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
                                        id={`file-${promoterDocId}`}
                                        multiple
                                        onChange={(e) => e.target.files && handleFileUpload(promoterDocId, e.target.files)}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                      />
                                      <label htmlFor={`file-${promoterDocId}`}>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          disabled={uploadingDocuments[promoterDocId]}
                                          className="cursor-pointer min-w-[140px] flex items-center justify-center"
                                          asChild
                                        >
                                          <span>
                                            {uploadingDocuments[promoterDocId] ? (
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                            ) : document.isMultiple && uploadedFiles[promoterDocId] && uploadedFiles[promoterDocId].length > 0 ? (
                                              <Plus className="h-4 w-4" />
                                            ) : (
                                              <Upload className="h-4 w-4" />
                                            )}
                                            <span className="ml-1 block truncate">
                                              {document.isMultiple && uploadedFiles[promoterDocId] && uploadedFiles[promoterDocId].length > 0
                                                ? "Add More Docs"
                                                : "Upload Document"}
                                            </span>
                                          </span>
                                        </Button>
                                      </label>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleAddPromoter}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 shadow-lg flex items-center gap-2 text-base font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-none"
                  variant="default"
                  type="button"
                  style={{ borderRadius: 0 }}
                >
                  <Plus className="h-5 w-5" />
                  Add Promoter
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentUpload;
