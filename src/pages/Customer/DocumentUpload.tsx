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
import {
  isDocumentSubmitted,
  getDocumentStatus,
  getStatusBadgeInfo,
  getApiFilesForDocument
} from "./DocumentUploadParts/documentUploadHelpers";
import { extractAllTemplates } from "@/lib/templateUtils";

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { getValueFromLocalStorage, setValueToLocalStorage } = useLocalStorage();
  const token = getValueFromLocalStorage("token");
  const { addDocument, removeDocument, submitFolder, getFolderDocuments, isFolderSubmitted } = useDocuments();
  const { syncCustomerDocuments, promoterTemplate, setPromoterTemplate, setSectionTemplates, sectionTemplates } = useCustomers();
  const documentUploadService = useDocumentUploadService();

  const [customerType, setCustomerType] = useState<'Individual' | 'Organization'>();
  const [orgCategories, setOrgCategories] = useState<DocumentCategory[]>([]);
  const [promoterCategories, setPromoterCategories] = useState<DocumentCategory[]>([]);
  // Promoters state for Organization
  const [promoters, setPromoters] = useState<{ id: number; details?: any; categories?: DocumentCategory[] }[]>([]);
  const [uploadingDocuments, setUploadingDocuments] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, DocumentFile[]>>({});
  // Add state to track multiple section instances
  const [sectionInstances, setSectionInstances] = useState<{ [category: string]: any[] }>({});
  // Add state to track years for each document with isMultipleYear
  const [documentYears, setDocumentYears] = useState<{ [key: string]: number[] }>({});
  // Add state to track selected year for each document/yearIdx
  const [selectedYears, setSelectedYears] = useState<{ [key: string]: number }>({});
  const currentYear = new Date().getFullYear();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0); // 0 = main documents, 1+ = promoter pages

  const [apiDocumentMasters, setApiDocumentMasters] = useState<any[]>([]); // <-- New state
  const [maxPromoters, setMaxPromoters] = useState(0);

  // New state for section management
  const [beSections, setBeSections] = useState<{ [category: string]: string[] }>({}); // BE sections from API
  const [temporarySections, setTemporarySections] = useState<{ [category: string]: { name: string; instance: any } | null }>({}); // Temporary sections in UI

  // Call document masters API on page render
  useEffect(() => {
    const fetchDocumentMasters = async () => {
      try {
        const response = await documentUploadService.getDocumentMasters();
        setApiDocumentMasters(response.data); // <-- Store API data
        setMaxPromoters(response.data.length - 1); // 1 org, rest promoters
        
        // Extract all templates using the new helper function
        const { promoterTemplate: extractedPromoterTemplate, sectionTemplates: extractedSectionTemplates } = extractAllTemplates(response.data);
        
        // Store templates in context
        setPromoterTemplate(extractedPromoterTemplate);
        setSectionTemplates(extractedSectionTemplates);
        
        // Extract BE sections from API response
        const newBeSections: { [category: string]: string[] } = {};
        response.data.forEach((customerTypeObj: any) => {
          if (customerTypeObj.documentsByCategory) {
            customerTypeObj.documentsByCategory.forEach((cat: any) => {
              if (cat.isMultipleSection && cat.section) {
                if (!newBeSections[cat.category]) {
                  newBeSections[cat.category] = [];
                }
                newBeSections[cat.category].push(cat.section);
              }
            });
          }
        });
        setBeSections(newBeSections);
        
        // response.data is an array
        const org = response.data.find(
          (item: any) => item.customerType?.toUpperCase() === "ORGANIZATION"
        );
        const individual = response.data.find(
          (item: any) => item.customerType?.toUpperCase() === "INDIVIDUAL"
        );

        // Find all promoters (customerType starts with 'promoter', case-insensitive)
        const promoterEntries = response.data.filter(
          (item: any) =>
            typeof item.customerType === 'string' &&
            item.customerType.replace(/\s+/g, '').toLowerCase().startsWith('promoter')
        );

        // Only show real promoters in the UI (those with any file present)
        const realPromoters = promoterEntries.filter((entry: any) => {
          // If ANY file array in ANY document is non-empty, it's a real promoter
          return entry.documentsByCategory.some((cat: any) =>
            cat.documents.some((doc: any) => Array.isArray(doc.files) && doc.files.length > 0)
          );
        });
        setPromoters(
          realPromoters.map((entry: any, idx: number) => ({
            id: Date.now() + idx,
            categories: entry.documentsByCategory,
            details: {},
          }))
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

  const handleFileUpload = async (documentId: string, files: FileList, year?: number, promoterLabel?: string, sectionName?: string) => {
    if (!token) return;

    try {
      setUploadingDocuments(prev => ({ ...prev, [documentId]: true }));

      const folderId = `documents_${documentId}`;
      const originalDocumentId = documentId.includes('_promoter')
        ? documentId.split('_promoter')[0]
        : documentId;

      const metadata = {
        documentMasterId: originalDocumentId,
        promoter: promoterLabel || (currentPage > 0 ? `Promoter ${currentPage}` : ""),
        year: year || "",
        section: sectionName || ""
      };

      console.log("metadata", metadata);
     // return;

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
        
        // Update BE sections after successful upload
        const newBeSections: { [category: string]: string[] } = {};
        response.data.forEach((customerTypeObj: any) => {
          if (customerTypeObj.documentsByCategory) {
            customerTypeObj.documentsByCategory.forEach((cat: any) => {
              if (cat.isMultipleSection && cat.section) {
                if (!newBeSections[cat.category]) {
                  newBeSections[cat.category] = [];
                }
                newBeSections[cat.category].push(cat.section);
              }
            });
          }
        });
        setBeSections(newBeSections);

        // Update orgCategories with latest data based on customer type
        const org = response.data.find(
          (item: any) => item.customerType?.toUpperCase() === "ORGANIZATION"
        );
        const individual = response.data.find(
          (item: any) => item.customerType?.toUpperCase() === "INDIVIDUAL"
        );

        if (customerType === "Organization" && org) {
          setOrgCategories(org.documentsByCategory);
        } else if (customerType === "Individual" && individual) {
          setOrgCategories(individual.documentsByCategory);
        }
        
        // Clear temporary section and section instances if it was uploaded to
        if (sectionName) {
          // Find the category this section belongs to
          const categoryForSection = Object.keys(temporarySections).find(
            cat => temporarySections[cat]?.name === sectionName
          );

          if (categoryForSection) {
            // Clear from temporarySections
            setTemporarySections(prev => ({
              ...prev,
              [categoryForSection]: null
            }));

            // Clear from sectionInstances
            setSectionInstances(prev => {
              const updated = { ...prev };
              if (updated[categoryForSection]) {
                // Remove the section instance that matches this section name
                updated[categoryForSection] = updated[categoryForSection].filter(
                  (instance: any) => instance.section !== sectionName
                );
                // If no more instances, delete the category key
                if (updated[categoryForSection].length === 0) {
                  delete updated[categoryForSection];
                }
              }
              return updated;
            });
          }
        }
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

  // Add promoter handler
  const handleAddPromoter = () => {
    if (promoters.length >= maxPromoters) return;
    const newPromoter = {
      id: Date.now(),
      categories: promoterTemplate ? JSON.parse(JSON.stringify(promoterTemplate.documentsByCategory)) : [],
      details: {},
    };
    setPromoters((prev) => [...prev, newPromoter]);
    setCurrentPage(promoters.length + 1);
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

  // Add section handler using section templates
  const handleAddSection = (categoryName: string) => {
    console.log("=== handleAddSection START ===");
    console.log("Current sectionInstances:", sectionInstances);
    console.log("Current temporarySections:", temporarySections);
    console.log("Current beSections:", beSections);
    
    const template = sectionTemplates[categoryName];

    if (!template) {
      console.warn('No template found for', categoryName);
      return;
    }

    // Check if there's already a temporary section for this category
    if (temporarySections[categoryName]) {
      toast({
        title: "Section already exists",
        description: "First add files to this section before creating a new one",
        variant: "destructive",
      });
      return;
    }

    // Calculate next section number
    const existingSections = beSections[categoryName] || [];
    const nextSectionNumber = existingSections.length + 1;
    const sectionName = `Section ${nextSectionNumber}`;

    console.log("Creating new section:", {
      categoryName,
      nextSectionNumber,
      sectionName
    });

    // Deep clone and add a unique instance ID
    const newSection = { 
      ...JSON.parse(JSON.stringify(template)), 
      section: sectionName // Add section name to the instance
    };

    // Add to section instances
    setSectionInstances(prev => {
      const updated = {
        ...prev,
        [categoryName]: [...(prev[categoryName] || []), newSection]
      };
      console.log("Updated sectionInstances:", updated);
      return updated;
    });

    // Mark as temporary section
    setTemporarySections(prev => {
      const updated = {
        ...prev,
        [categoryName]: {
          name: sectionName,
          instance: newSection
        }
      };
      console.log("Updated temporarySections:", updated);
      return updated;
    });

    console.log("=== handleAddSection END ===");
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
              disableAdd={promoters.length >= maxPromoters}
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
              handleFileUpload={(documentId, files, year, sectionName) => handleFileUpload(documentId, files, year, undefined, sectionName)}
              getApiFilesForDocument={(documentMasterId, category, year, promoterIndex, section) => 
                getApiFilesForDocument(apiDocumentMasters, customerType || '', documentMasterId, category, year, promoterIndex, section)
              }
              uploadingDocuments={uploadingDocuments}
              handleAddSection={handleAddSection}
              beSections={beSections}
              temporarySections={temporarySections}
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
              handleFileUpload={(documentId, files, year, sectionName) => handleFileUpload(documentId, files, year, `Promoter ${currentPage}`, sectionName)}
              getApiFilesForDocument={(documentMasterId, category, year, promoterIndex, section) => 
                getApiFilesForDocument(apiDocumentMasters, `Promoter ${currentPage}`, documentMasterId, category, year, promoterIndex, section)
              }
              uploadingDocuments={uploadingDocuments}
              currentPage={currentPage}
              handleAddSection={handleAddSection}
              beSections={beSections}
              temporarySections={temporarySections}
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