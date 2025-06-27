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
import Header from "./DocumentUploadParts/Header";
import Pagination from "./DocumentUploadParts/Pagination";
import MainSection from "./DocumentUploadParts/MainSection";
import PromoterSection from "./DocumentUploadParts/PromoterSection";
import PromoterActions from "./DocumentUploadParts/PromoterActions";

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
  // Add state to track selected year for each document/yearIdx
  const [selectedYears, setSelectedYears] = useState<{ [key: string]: number }>({});
  const currentYear = new Date().getFullYear();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0); // 0 = main documents, 1+ = promoter pages

  const [apiDocumentMasters, setApiDocumentMasters] = useState<any[]>([]); // <-- New state

  // Call document masters API on page render
  useEffect(() => {
    const fetchDocumentMasters = async () => {
      try {
        const response = await documentUploadService.getDocumentMasters();
        setApiDocumentMasters(response.data); // <-- Store API data
        // response.data is an array
        const org = response.data.find(
          (item: any) => item.customerType?.toUpperCase() === "ORGANIZATION"
        );
        const individual = response.data.find(
          (item: any) => item.customerType?.toUpperCase() === "INDIVIDUAL"
        );

        // Find all promoters (customerType starts with 'promoter', case-insensitive)
        const promoterEntries = response.data.filter(
          (item: any) => typeof item.customerType === 'string' && item.customerType.toLowerCase().startsWith('promoter')
        );

        if (org) {
          setCustomerType("Organization");
          setValueToLocalStorage("customerType", "Organization");
          setOrgCategories(org.documentsByCategory);
          // If you want to use the first promoter's categories as the template for new promoters:
          setPromoterCategories(promoterEntries[0]?.documentsByCategory || []);
        } else if (individual) {
          setCustomerType("Individual");
          setValueToLocalStorage("customerType", "Individual");
          setOrgCategories(individual.documentsByCategory);
          setPromoterCategories([]);
        }

        // Initialize promoters state from API response
        if (promoterEntries.length > 0) {
          const initialPromoters = promoterEntries.map((entry: any, idx: number) => ({
            id: Date.now() + idx, // or use a better unique id if available
            categories: entry.documentsByCategory,
            details: {}, // You can fill this if you have promoter details
          }));
          setPromoters(initialPromoters);
        } else {
          setPromoters([]);
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

      // Fetch latest document masters from API to update uploaded files from API
      try {
        const response = await documentUploadService.getDocumentMasters();
        setApiDocumentMasters(response.data);
      } catch (err) {
        // Optionally handle error
        console.error("Error refreshing document masters after upload", err);
      }

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
      // Fetch promoter documents from specific promoter API
      const response = await documentUploadService.getPromoterDocumentMasters();

      if (response.data) {
        const newPromoter = {
          id: Date.now(),
          categories: response.data.documentsByCategory
        };
        setPromoters((prev) => [...prev, newPromoter]);
        // Navigate to the new promoter's documents page
        setCurrentPage(promoters.length + 1);
      } else {
        toast({
          title: "Error",
          description: "Could not fetch promoter document requirements",
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

  // Helper to get files for a document from API response
  const getApiFilesForDocument = (
    documentMasterId: string,
    category: string,
    year?: number | string,
    promoterIndex?: number
  ) => {
    let customerTypeObj;
    if (promoterIndex !== undefined) {
      customerTypeObj = apiDocumentMasters.find((d) =>
        d.customerType?.toLowerCase() === `promoter${promoterIndex + 1}`
      );
    } else {
      customerTypeObj = apiDocumentMasters.find((d) =>
        d.customerType?.toUpperCase() === customerType?.toUpperCase()
      );
    }
    if (!customerTypeObj) return [];
    const categoryObj = customerTypeObj.documentsByCategory.find(
      (cat: any) => cat.category === category
    );
    if (!categoryObj) return [];
    let docObjs = categoryObj.documents.filter(
      (doc: any) => doc.documentMasterId === documentMasterId
    );
    if (year !== undefined && year !== null) {
      docObjs = docObjs.filter((doc: any) => String(doc.year) === String(year));
    }
    let files: any[] = [];
    docObjs.forEach((doc: any) => {
      if (doc.files && doc.files.length > 0) {
        files = files.concat(doc.files);
      }
    });
    return files;
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
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Header currentPage={currentPage} customerType={customerType} />
            <PromoterActions
              customerType={customerType}
              currentPage={currentPage}
              handleAddPromoter={handleAddPromoter}
              handleRemovePromoter={handleRemovePromoter}
            />
          </div>
          {/* Main Documents Page (Page 0) */}
          {currentPage === 0 && (
            <MainSection
              orgCategories={orgCategories}
              sectionInstances={sectionInstances}
              setSectionInstances={setSectionInstances}
              documentYears={documentYears}
              setDocumentYears={setDocumentYears}
              selectedYears={selectedYears}
              setSelectedYears={setSelectedYears}
              currentYear={currentYear}
              handleFileUpload={handleFileUpload}
              getApiFilesForDocument={getApiFilesForDocument}
              uploadingDocuments={uploadingDocuments}
            />
          )}
          {/* Promoter Documents Page (Page 1+) */}
          {currentPage > 0 && promoters[currentPage - 1] && (
            <PromoterSection
              promoter={promoters[currentPage - 1]}
              categories={promoters[currentPage - 1].categories}
              sectionInstances={sectionInstances}
              setSectionInstances={setSectionInstances}
              documentYears={documentYears}
              setDocumentYears={setDocumentYears}
              selectedYears={selectedYears}
              setSelectedYears={setSelectedYears}
              currentYear={currentYear}
              handleFileUpload={handleFileUpload}
              getApiFilesForDocument={getApiFilesForDocument}
              uploadingDocuments={uploadingDocuments}
              currentPage={currentPage}
            />
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          goToPage={goToPage}
        />
      </div>
    </MainLayout>
  );
};

export default DocumentUpload;