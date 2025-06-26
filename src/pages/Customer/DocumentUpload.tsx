import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { useDocuments, DocumentFile } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Plus, Info, X, ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
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
import { useLocalStorage } from "@/hooks/useLocalStorage";

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { getValueFromLocalStorage, setValueToLocalStorage } = useLocalStorage();
  const token = getValueFromLocalStorage("token");
  const { addDocument, removeDocument, submitFolder, getFolderDocuments, isFolderSubmitted } = useDocuments();
  const { syncCustomerDocuments } = useCustomers();
  const documentUploadService = useDocumentUploadService();

  const [customerType, setCustomerType] = useState<'Individual' | 'Organization'>();
  const [orgCategories, setOrgCategories] = useState<DocumentCategory[]>([]);
  const [promoterCategories, setPromoterCategories] = useState<DocumentCategory[]>([]);
  // Promoters state for Organization
  const [promoters, setPromoters] = useState<{ id: number; details?: any; categories?: DocumentCategory[] }[]>([]);
  const [uploadingDocuments, setUploadingDocuments] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, DocumentFile[]>>({});
  // Add state to track multiple section instances
  const [sectionInstances, setSectionInstances] = useState<{ [key: string]: number }>({});
  // Add state to track years for each document with isMultipleYear
  const [documentYears, setDocumentYears] = useState<{ [key: string]: number[] }>({});
  const currentYear = new Date().getFullYear();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0); // 0 = main documents, 1+ = promoter pages

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
          setValueToLocalStorage("customerType", "Organization");
          setOrgCategories(org.documentsByCategory);
          setPromoterCategories(promoter?.documentsByCategory || []);
        } else if (individual) {
          setCustomerType("Individual");
          setValueToLocalStorage("customerType", "Individual");
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
    if (!token || orgCategories.length === 0) return;

    const syncUploadedFiles = () => {
      const syncedFiles: Record<string, DocumentFile[]> = {};

      // Default table
      orgCategories.forEach(category => {
        category.documents.forEach(document => {
          const folderId = `documents_${document.documentMasterId}`;
          const folderDocuments = getFolderDocuments(token, folderId);
          if (folderDocuments.length > 0) {
            syncedFiles[document.documentMasterId] = folderDocuments;
          }
        });
      });

      // Promoter tables
      promoterCategories.forEach(category => {
        category.documents.forEach(document => {
          for (let i = 0; i < promoters.length; i++) {
            const promoterDocId = `${document.documentMasterId}_promoter${i}`;
            const folderDocuments = getFolderDocuments(token, promoterDocId);
            if (folderDocuments.length > 0) {
              syncedFiles[promoterDocId] = folderDocuments;
            }
          }
        });
      });

      setUploadedFiles(syncedFiles);
    };

    syncUploadedFiles();
  }, [token, orgCategories, promoterCategories, getFolderDocuments, promoters.length]);

  const handleFileUpload = async (documentId: string, files: FileList, year?: number) => {
    if (!token) return;

    try {
      setUploadingDocuments(prev => ({ ...prev, [documentId]: true }));

      const folderId = `documents_${documentId}`;
      const originalDocumentId = documentId.includes('_promoter')
        ? documentId.split('_promoter')[0]
        : documentId;

      const metadata = {
        documentMasterId: originalDocumentId,
        promoter: currentPage > 0 ? `promoter${currentPage}` : "",
        year: year || "",
        section: ""
      };

      const formData = new FormData();
      formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      await documentUploadService.uploadDocuments(formData, token); // Updated signature with token

      // Optionally add to local state if needed
      submitFolder(token, folderId); // still submitting folder as per old logic

      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully`,
      });

      // Update uploaded file context/state if necessary
      const syncedFiles: Record<string, DocumentFile[]> = {};
      const folderDocuments = getFolderDocuments(token, folderId);
      if (folderDocuments.length > 0) {
        syncedFiles[documentId] = folderDocuments;
      }
      setUploadedFiles(prev => ({ ...prev, ...syncedFiles }));

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
    if (!token) return;
    const folderId = `documents_${documentId}`;
    removeDocument(token, folderId, fileId);

    // Sync the uploaded files state to reflect changes
    const folderDocuments = getFolderDocuments(token, folderId);
    setUploadedFiles(prev => ({
      ...prev,
      [documentId]: folderDocuments
    }));

    toast({
      title: "File removed",
      description: "Document has been removed",
    });
  };

  const isDocumentSubmitted = (documentId: string): boolean => {
    if (!token) return false;
    const folderId = `documents_${documentId}`;
    return isFolderSubmitted(token, folderId);
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
  const handleAddPromoter = async () => {
    try {
      // Fetch promoter documents from API
      const response = await documentUploadService.getDocumentMasters();

      // const promoterData = response.data.find(
      //   (item: any) => item.customerType?.toUpperCase() === "PROMOTER"
      // );


      const promoterData = response.data.find((item: any) =>
        item.customerType?.toLowerCase().startsWith("promoter")
      );

      if (promoterData) {
        const newPromoter = {
          id: Date.now(),
          categories: promoterData.documentsByCategory
        };
        setPromoters((prev) => [...prev, newPromoter]);
        // Navigate to the new promoter's documents page
        setCurrentPage(promoters.length + 1);
      } else {
        toast({
          title: "Error",
          description: "Could not fetch promoter document requirements hiii",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching promoter documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch promoter document requirements",
        variant: "destructive",
      });
    }
  };

  // Remove promoter handler
  const handleRemovePromoter = (index: number) => {
    setPromoters((prev) => prev.filter((_, i) => i !== index));
    // Always go to previous page, or 0 if at first promoter page
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else {
      setCurrentPage(0);
    }
  };

  // Navigation handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < promoters.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Get total pages (main page + promoter pages)
  const totalPages = promoters.length + 1;

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
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentPage === 0 ? "Document Upload" : `Promoter ${currentPage} Documents`}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentPage === 0
                  ? "Please upload the required documents for your application"
                  : "Please upload the required documents for this promoter"
                }
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {customerType === 'Organization' && (
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
              )}
              {customerType === 'Organization' && currentPage > 0 && (
                <Button
                  onClick={() => handleRemovePromoter(currentPage - 1)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-lg flex items-center gap-2 text-base font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-none"
                  variant="destructive"
                  type="button"
                  style={{ borderRadius: 0 }}
                >
                  <Trash2 className="h-5 w-5" />
                  Remove Promoter
                </Button>
              )}
            </div>
          </div>

          {/* Main Documents Page (Page 0) */}
          {currentPage === 0 && (
            <>
              {/* Always show the default table */}
              {orgCategories.map((category, categoryIndex) => {
                const isMultipleSection = category.isMultipleSection;
                const instances = isMultipleSection ? (sectionInstances[categoryIndex] || 1) : 1;
                return (
                  <div key={categoryIndex}>
                    {Array.from({ length: instances }).map((_, instanceIdx) => (
                      <div key={instanceIdx} className="relative">
                        <Card className="mb-6">
                          {/* Cross icon for extra sections */}
                          {isMultipleSection && instanceIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSectionInstances(prev => {
                                  const updated = { ...prev };
                                  if (updated[categoryIndex] > 1) {
                                    updated[categoryIndex] = updated[categoryIndex] - 1;
                                  }
                                  return updated;
                                });
                              }}
                              className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-red-100 text-red-500 border border-red-200 hover:border-red-300"
                              aria-label="Remove section"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-800">
                              {category.category} {isMultipleSection && instances > 1 ? `(${instanceIdx + 1})` : null}
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
                                  const docKey = `${document.documentMasterId}_${instanceIdx}`;
                                  // If isMultipleYear, manage years for this doc instance
                                  const years = document.isMultipleYears
                                    ? documentYears[docKey] || [currentYear]
                                    : [undefined];
                                  const isMultipleFiles = document.isMultiple ?? document.isMultiple;
                                  return years.map((year, yearIdx) => (
                                    <TableRow key={docKey + "_" + yearIdx}>
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                          {document.documentType}
                                          {document.isMultipleYears && (
                                            <select
                                              value={year}
                                              onChange={e => {
                                                const newYear = parseInt(e.target.value, 10);
                                                setDocumentYears(prev => ({
                                                  ...prev,
                                                  [docKey]: prev[docKey].map((y, idx) => idx === yearIdx ? newYear : y)
                                                }));
                                              }}
                                              className="border rounded px-2 py-1 text-sm ml-2"
                                            >
                                              {Array.from({ length: 6 }).map((_, i) => (
                                                <option key={currentYear - i} value={currentYear - i}>{currentYear - i}</option>
                                              ))}
                                            </select>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {getStatusBadge(document.documentMasterId)}
                                      </TableCell>
                                      <TableCell>
                                        {uploadedFiles[document.documentMasterId] && uploadedFiles[document.documentMasterId].length > 0 ? (
                                          <div className="space-y-1">
                                            {uploadedFiles[document.documentMasterId].map((file, fileIndex) => (
                                              <div key={file.id} className="flex items-center text-sm" style={{ textAlign: 'start' }}>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleRemoveFile(document.documentMasterId, file.id)}
                                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800 mr-1"
                                                  aria-label="Delete file"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <span className="truncate max-w-[120px]" title={file.name} style={{ marginRight: isMultipleFiles ? '0.5rem' : 0 }}>
                                                  {file.name}
                                                </span>
                                                {isMultipleFiles && fileIndex === uploadedFiles[document.documentMasterId].length - 1 && (
                                                  <>
                                                    <input
                                                      type="file"
                                                      id={`file-plus-${document.documentMasterId}`}
                                                      multiple
                                                      onChange={(e) => e.target.files && handleFileUpload(document.documentMasterId, e.target.files, year)}
                                                      className="hidden"
                                                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    />
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 ml-2 rounded-full border border-blue-200 bg-blue-50 hover:border-blue-300"
                                                      aria-label="Add more files"
                                                      onClick={() => window.document.getElementById(`file-plus-${document.documentMasterId}`)?.click()}
                                                    >
                                                      <Plus className="h-4 w-4" />
                                                    </Button>
                                                  </>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : isMultipleFiles ? (
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
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="file"
                                            id={`file-${document.documentMasterId}`}
                                            multiple
                                            onChange={(e) => e.target.files && handleFileUpload(document.documentMasterId, e.target.files, year)}
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                          />
                                          <label htmlFor={`file-${document.documentMasterId}`}>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              disabled={uploadingDocuments[document.documentMasterId]}
                                              className="cursor-pointer min-w-[140px] flex items-center justify-center border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                              asChild
                                            >
                                              <span>
                                                {uploadingDocuments[document.documentMasterId] ? (
                                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                                ) : (
                                                  <Upload className="h-4 w-4" />
                                                )}
                                                <span className="ml-1 block truncate">
                                                  Upload Document
                                                </span>
                                              </span>
                                            </Button>
                                          </label>
                                          {document.isMultipleYears && yearIdx === years.length - 1 && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => setDocumentYears(prev => ({
                                                ...prev,
                                                [docKey]: [...(prev[docKey] || [currentYear]), currentYear]
                                              }))}
                                              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                              aria-label="Add Year"
                                            >
                                              +
                                            </Button>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ));
                                })}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                    {/* +Add button for multiple sections, outside and below the last card, left-aligned */}
                    {isMultipleSection && (
                      <div className="flex justify-start mb-6 -mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSectionInstances(prev => ({
                            ...prev,
                            [categoryIndex]: (prev[categoryIndex] || 1) + 1
                          }))}
                          className="flex items-center gap-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" /> Add Section
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Promoter Documents Page (Page 1+) */}
          {currentPage > 0 && promoters[currentPage - 1] && (
            <>
              {/* Promoter Documents */}
              {promoters[currentPage - 1].categories?.map((category, categoryIndex) => {
                const isMultipleSection = category.isMultipleSection;
                const instances = isMultipleSection ? (sectionInstances[`promoter${currentPage - 1}_${categoryIndex}`] || 1) : 1;
                return (
                  <div key={categoryIndex}>
                    {Array.from({ length: instances }).map((_, instanceIdx) => (
                      <div key={instanceIdx} className="relative">
                        <Card className="mb-6">
                          {/* Cross icon for extra sections */}
                          {isMultipleSection && instanceIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSectionInstances(prev => {
                                  const updated = { ...prev };
                                  const key = `promoter${currentPage - 1}_${categoryIndex}`;
                                  if (updated[key] > 1) {
                                    updated[key] = updated[key] - 1;
                                  }
                                  return updated;
                                });
                              }}
                              className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-red-100 text-red-500 border border-red-200 hover:border-red-300"
                              aria-label="Remove section"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-800">
                              {category.category} {isMultipleSection && instances > 1 ? `(${instanceIdx + 1})` : null}
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
                                  const docKey = `${document.documentMasterId}_promoter${currentPage - 1}_${instanceIdx}`;
                                  // If isMultipleYear, manage years for this doc instance
                                  const years = document.isMultipleYears
                                    ? documentYears[docKey] || [currentYear]
                                    : [undefined];
                                  const isMultipleFiles = document.isMultiple ?? document.isMultiple;
                                  return years.map((year, yearIdx) => (
                                    <TableRow key={docKey + "_" + yearIdx}>
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                          {document.documentType}
                                          {document.isMultipleYears && (
                                            <select
                                              value={year}
                                              onChange={e => {
                                                const newYear = parseInt(e.target.value, 10);
                                                setDocumentYears(prev => ({
                                                  ...prev,
                                                  [docKey]: prev[docKey].map((y, idx) => idx === yearIdx ? newYear : y)
                                                }));
                                              }}
                                              className="border rounded px-2 py-1 text-sm ml-2"
                                            >
                                              {Array.from({ length: 6 }).map((_, i) => (
                                                <option key={currentYear - i} value={currentYear - i}>{currentYear - i}</option>
                                              ))}
                                            </select>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {getStatusBadge(docKey)}
                                      </TableCell>
                                      <TableCell>
                                        {uploadedFiles[docKey] && uploadedFiles[docKey].length > 0 ? (
                                          <div className="space-y-1">
                                            {uploadedFiles[docKey].map((file, fileIndex) => (
                                              <div key={file.id} className="flex items-center text-sm" style={{ textAlign: 'start' }}>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleRemoveFile(docKey, file.id)}
                                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800 mr-1"
                                                  aria-label="Delete file"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <span className="truncate max-w-[120px]" title={file.name} style={{ marginRight: isMultipleFiles ? '0.5rem' : 0 }}>
                                                  {file.name}
                                                </span>
                                                {isMultipleFiles && fileIndex === uploadedFiles[docKey].length - 1 && (
                                                  <>
                                                    <input
                                                      type="file"
                                                      id={`file-plus-${docKey}`}
                                                      multiple
                                                      onChange={(e) => e.target.files && handleFileUpload(docKey, e.target.files, year)}
                                                      className="hidden"
                                                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    />
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 ml-2 rounded-full border border-blue-200 bg-blue-50 hover:border-blue-300"
                                                      aria-label="Add more files"
                                                      onClick={() => window.document.getElementById(`file-plus-${docKey}`)?.click()}
                                                    >
                                                      <Plus className="h-4 w-4" />
                                                    </Button>
                                                  </>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : isMultipleFiles ? (
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
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="file"
                                            id={`file-${docKey}`}
                                            multiple
                                            onChange={(e) => e.target.files && handleFileUpload(docKey, e.target.files, year)}
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                          />
                                          <label htmlFor={`file-${docKey}`}>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              disabled={uploadingDocuments[docKey]}
                                              className="cursor-pointer min-w-[140px] flex items-center justify-center border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                              asChild
                                            >
                                              <span>
                                                {uploadingDocuments[docKey] ? (
                                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                                ) : (
                                                  <Upload className="h-4 w-4" />
                                                )}
                                                <span className="ml-1 block truncate">
                                                  Upload Document
                                                </span>
                                              </span>
                                            </Button>
                                          </label>
                                          {document.isMultipleYears && yearIdx === years.length - 1 && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => setDocumentYears(prev => ({
                                                ...prev,
                                                [docKey]: [...(prev[docKey] || [currentYear]), currentYear]
                                              }))}
                                              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                              aria-label="Add Year"
                                            >
                                              +
                                            </Button>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ));
                                })}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                    {/* +Add button for multiple sections, outside and below the last card, left-aligned */}
                    {isMultipleSection && (
                      <div className="flex justify-start mb-6 -mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSectionInstances(prev => ({
                            ...prev,
                            [`promoter${currentPage - 1}_${categoryIndex}`]: (prev[`promoter${currentPage - 1}_${categoryIndex}`] || 1) + 1
                          }))}
                          className="flex items-center gap-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        >
                          <Plus className="h-4 w-4" /> Add Section
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Page {currentPage + 1} of {totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <Button
                      key={index}
                      variant={currentPage === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(index)}
                      className={`w-8 h-8 p-0 ${currentPage === index
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                    >
                      {index}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentUpload;
