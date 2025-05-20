import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { useDocuments, DocumentFile } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, X, ChevronDown, ChevronUp, Upload, CheckCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const documentSections = [
  {
    id: 'section1',
    title: 'KYC Documents',
    description: 'Identity and address verification documents',
    documentTypes: [
      {
        id: 'kyc1',
        name: 'PAN Card',
        description: 'Permanent Account Number card issued by Income Tax Department',
        required: true,
      },
      {
        id: 'kyc2',
        name: 'Aadhaar Card',
        description: 'Unique Identification Authority of India (UIDAI) issued Aadhaar card',
        required: true,
      },
      {
        id: 'kyc3',
        name: 'Certificate of Incorporation',
        description: 'For registered businesses and companies',
        required: true,
      },
      {
        id: 'kyc4',
        name: 'GST Registration',
        description: 'Goods and Services Tax registration certificate',
        required: false,
      }
    ]
  },
  {
    id: 'section2',
    title: 'Bank Statements',
    description: 'Banking transaction documents',
    documentTypes: [
      {
        id: 'bank1',
        name: 'Current Account Statements',
        description: 'Last 6 months statements of primary business account',
        required: true,
      },
      {
        id: 'bank2',
        name: 'Savings Account Statements',
        description: 'Last 6 months statements of proprietor/director accounts',
        required: false,
      },
      {
        id: 'bank3',
        name: 'Bank Account Opening Letter',
        description: 'Document confirming account details and signatories',
        required: false,
      }
    ]
  },
  {
    id: 'section3',
    title: 'Loan Statements',
    description: 'Existing loan and credit documentation',
    documentTypes: [
      {
        id: 'loan1',
        name: 'Existing Loan Statements',
        description: 'Last 12 months statements of existing business loans',
        required: false,
      },
      {
        id: 'loan2',
        name: 'Credit Card Statements',
        description: 'Last 6 months statements of business credit cards',
        required: false,
      },
      {
        id: 'loan3',
        name: 'Loan Sanction Letters',
        description: 'Approval documents for existing loans',
        required: false,
      },
      {
        id: 'loan4',
        name: 'Repayment Track Record',
        description: 'Proof of timely repayment of previous loans',
        required: false,
      }
    ]
  },
  {
    id: 'section4',
    title: 'Financial Documents',
    description: 'Business financial records and statements',
    documentTypes: [
      {
        id: 'fin1',
        name: 'Income Tax Returns',
        description: 'Last 3 years ITR filings with computation sheet',
        required: true,
      },
      {
        id: 'fin2',
        name: 'Balance Sheet',
        description: 'Audited balance sheets for previous 3 financial years',
        required: true,
      },
      {
        id: 'fin3',
        name: 'Profit & Loss Statement',
        description: 'P&L statements for previous 3 financial years',
        required: true,
      },
      {
        id: 'fin4',
        name: 'Cash Flow Statement',
        description: 'Statement of cash flows for the business',
        required: false,
      },
      {
        id: 'fin5',
        name: 'Sales Tax Returns',
        description: 'GST/VAT returns for the last year',
        required: true,
      }
    ]
  },
  {
    id: 'section5',
    title: 'Property Documents',
    description: 'Business premises and collateral documentation',
    documentTypes: [
      {
        id: 'prop1',
        name: 'Property Ownership Deed',
        description: 'Legal document proving ownership of property offered as collateral',
        required: false,
      },
      {
        id: 'prop2',
        name: 'Rent Agreement',
        description: 'Rental agreement for business premises if not owned',
        required: false,
      },
      {
        id: 'prop3',
        name: 'Property Tax Receipts',
        description: 'Last 3 years property tax payment receipts',
        required: false,
      },
      {
        id: 'prop4',
        name: 'Property Valuation Report',
        description: 'Recent valuation of property by authorized valuer',
        required: false,
      },
      {
        id: 'prop5',
        name: 'Property Insurance',
        description: 'Insurance documents for the property offered as security',
        required: false,
      }
    ]
  },
  {
    id: 'section6',
    title: 'Business Documents',
    description: 'Business registration and operational documents',
    documentTypes: [
      {
        id: 'biz1',
        name: 'Business Plan',
        description: 'Detailed business plan including projections',
        required: true,
      },
      {
        id: 'biz2',
        name: 'Trade License',
        description: 'Valid trade license issued by local municipality',
        required: true,
      },
      {
        id: 'biz3',
        name: 'MSME Registration',
        description: 'Micro, Small, Medium Enterprise registration certificate',
        required: false,
      },
      {
        id: 'biz4',
        name: 'Partnership Deed',
        description: 'For partnership firms',
        required: false,
      }
    ]
  }
];

interface SubDocumentState {
  [key: string]: {
    open: boolean;
    submitting: boolean;
  }
}

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { addDocument, removeDocument, submitFolder, getFolderDocuments, isFolderSubmitted } = useDocuments();
  const { syncCustomerDocuments } = useCustomers();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [subDocumentStates, setSubDocumentStates] = useState<SubDocumentState>({});
  
  useEffect(() => {
    if (!userId) {
      navigate("/customer");
    }

    // Initialize states for sub-documents
    const initialSubDocumentStates: SubDocumentState = {};
    documentSections.forEach(section => {
      section.documentTypes.forEach(docType => {
        initialSubDocumentStates[docType.id] = {
          open: false,
          submitting: false
        };
      });
    });
    setSubDocumentStates(initialSubDocumentStates);
  }, [userId, navigate]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleFileUpload = async (sectionId: string, docId: string, files: FileList) => {
    if (!userId) return;
    
    try {
      setSubDocumentStates(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          submitting: true
        }
      }));
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fullFolderId = `${sectionId}_${docId}`;
        await addDocument(userId, fullFolderId, file);
      }
      
      // Auto-submit the document when files are uploaded
      const fullFolderId = `${sectionId}_${docId}`;
      submitFolder(userId, fullFolderId);
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) added and submitted successfully`,
      });
      
      setSubDocumentStates(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          submitting: false
        }
      }));
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive",
      });
      
      setSubDocumentStates(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          submitting: false
        }
      }));
    }
  };

  const handleRemoveFile = (sectionId: string, docId: string, fileId: string) => {
    if (!userId) return;
    
    const fullFolderId = `${sectionId}_${docId}`;
    removeDocument(userId, fullFolderId, fileId);
    
    toast({
      title: "File removed",
      description: "Document has been removed",
    });
  };

  const isSectionSubmitted = (sectionId: string): boolean => {
    if (!userId) return false;
    
    // Find all document types in this section
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return false;
    
    // Check if all required documents in the section are submitted
    const requiredDocs = section.documentTypes.filter(doc => doc.required);
    
    for (const doc of requiredDocs) {
      const fullFolderId = `${sectionId}_${doc.id}`;
      if (!isFolderSubmitted(userId, fullFolderId)) {
        return false;
      }
    }
    
    return requiredDocs.length > 0;
  };

  // Calculate progress percentage for a section
  const calculateSectionProgress = (sectionId: string): number => {
    if (!userId) return 0;
    
    // Find section
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return 0;
    
    // Count required documents and submitted required documents
    const requiredDocs = section.documentTypes.filter(doc => doc.required);
    if (requiredDocs.length === 0) return 100; // If no required docs, progress is 100%
    
    let submittedCount = 0;
    for (const doc of requiredDocs) {
      const fullFolderId = `${sectionId}_${doc.id}`;
      if (isFolderSubmitted(userId, fullFolderId)) {
        submittedCount++;
      }
    }
    
    // Calculate percentage
    return Math.round((submittedCount / requiredDocs.length) * 100);
  };

  // Get the count of required documents in a section
  const getRequiredDocCount = (sectionId: string): number => {
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return 0;
    return section.documentTypes.filter(doc => doc.required).length;
  };

  // Get the count of submitted required documents
  const getSubmittedRequiredDocCount = (sectionId: string): number => {
    if (!userId) return 0;
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return 0;
    
    const requiredDocs = section.documentTypes.filter(doc => doc.required);
    let submittedCount = 0;
    
    for (const doc of requiredDocs) {
      const fullFolderId = `${sectionId}_${doc.id}`;
      if (isFolderSubmitted(userId, fullFolderId)) {
        submittedCount++;
      }
    }
    
    return submittedCount;
  };

  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    if (!userId) return 0;
    
    let totalRequiredDocs = 0;
    let totalSubmittedDocs = 0;
    
    documentSections.forEach(section => {
      const requiredDocs = section.documentTypes.filter(doc => doc.required);
      totalRequiredDocs += requiredDocs.length;
      
      requiredDocs.forEach(doc => {
        const fullFolderId = `${section.id}_${doc.id}`;
        if (isFolderSubmitted(userId, fullFolderId)) {
          totalSubmittedDocs++;
        }
      });
    });
    
    if (totalRequiredDocs === 0) return 100;
    return Math.round((totalSubmittedDocs / totalRequiredDocs) * 100);
  };

  // Check if all required documents are uploaded
  const areAllRequiredDocsSubmitted = (): boolean => {
    if (!userId) return false;
    
    for (const section of documentSections) {
      const requiredDocs = section.documentTypes.filter(doc => doc.required);
      for (const doc of requiredDocs) {
        const fullFolderId = `${section.id}_${doc.id}`;
        if (!isFolderSubmitted(userId, fullFolderId)) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Handle submit all documents
  const handleSubmitAllDocuments = () => {
    if (!userId) return;
    
    // Sync documents with customer context
    syncCustomerDocuments(userId);
    
    toast({
      title: "Documents Submitted",
      description: "All your documents have been successfully submitted for review.",
    });
    
    // Navigate to document status page
    navigate("/customer/status");
  };

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Document Upload</h1>
        
        <div className="space-y-6">
          {documentSections.map(section => {
            const isOpen = openSections[section.id] || false;
            const isSubmitted = isSectionSubmitted(section.id);
            const progressPercentage = calculateSectionProgress(section.id);
            
            return (
              <Card key={section.id} className={isSubmitted ? "border-green-200 bg-green-50" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    {!isOpen && (
                      <div className="flex items-center gap-2">
                        <CardTitle>{section.title}</CardTitle>
                        {isSubmitted && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    )}
                    <Collapsible open={isOpen} onOpenChange={(value) => setOpenSections(prev => ({ ...prev, [section.id]: value }))}>
                      <CollapsibleTrigger 
                        className="rounded-full p-1 hover:bg-accent"
                      >
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          <h3 className="text-lg font-medium mb-1">{section.title}</h3>
                          {section.documentTypes.filter(doc => doc.required).length > 0 && (
                            <div className="mb-4">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Upload progress</span>
                                <span>{progressPercentage}%</span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.documentTypes.map(docType => {
                              const fullFolderId = `${section.id}_${docType.id}`;
                              const docFiles = userId ? getFolderDocuments(userId, fullFolderId) : [];
                              const isDocSubmitted = userId ? isFolderSubmitted(userId, fullFolderId) : false;
                              const docState = subDocumentStates[docType.id] || { open: false, submitting: false };
                              
                              return (
                                <Card key={docType.id} className={`border ${isDocSubmitted ? "border-green-200 bg-green-50" : ""}`}>
                                  <CardHeader className="p-4">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <CardTitle className="text-base">{docType.name}</CardTitle>
                                        {docType.required && (
                                          <Badge variant="destructive" className="text-xs">Required</Badge>
                                        )}
                                        {isDocSubmitted && (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                      </div>
                                      <CardDescription className="text-xs mt-1">{docType.description}</CardDescription>
                                      <div className="text-xs text-muted-foreground mt-2">
                                        <span>Max size: 2MB • Accepted: Images, PDF</span>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    {!isDocSubmitted && (
                                      <label
                                        htmlFor={`file-upload-${fullFolderId}`}
                                        className="flex justify-center items-center border-2 border-dashed rounded-lg py-4 px-4 cursor-pointer hover:bg-accent/10"
                                      >
                                        <div className="text-center">
                                          <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                                          <p className="text-sm font-medium">Upload Document</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Click to upload or drag and drop
                                          </p>
                                        </div>
                                        <input
                                          id={`file-upload-${fullFolderId}`}
                                          type="file"
                                          multiple
                                          accept=".pdf,.jpg,.jpeg,.png"
                                          className="hidden"
                                          disabled={docState.submitting}
                                          onChange={(e) => e.target.files && handleFileUpload(section.id, docType.id, e.target.files)}
                                        />
                                      </label>
                                    )}
                                    
                                    {docFiles.length > 0 && (
                                      <div className="mt-4">
                                        <h4 className="text-sm font-medium mb-3">Uploaded Files</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                          {docFiles.map((file) => (
                                            <div
                                              key={file.id}
                                              className="relative border rounded-md p-2 group"
                                            >
                                              <div className="aspect-square w-full flex items-center justify-center bg-gray-100 rounded mb-1">
                                                {file.type.includes('image') ? (
                                                  <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="h-full w-full object-cover rounded"
                                                  />
                                                ) : (
                                                  <FileText className="h-8 w-8 text-muted-foreground" />
                                                )}
                                              </div>
                                              <p className="text-xs truncate" title={file.name}>
                                                {file.name}
                                              </p>
                                              {!isDocSubmitted && (
                                                <button
                                                  onClick={() => handleRemoveFile(section.id, docType.id, file.id)}
                                                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                  <X className="h-3 w-3 text-muted-foreground" />
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  {!isOpen && (
                    <>
                      <CardDescription>{section.description}</CardDescription>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Upload progress</span>
                          <span>{calculateSectionProgress(section.id)}%</span>
                        </div>
                        <Progress value={calculateSectionProgress(section.id)} className="h-2" />
                      </div>
                    </>
                  )}
                </CardHeader>
              </Card>
            );
          })}
        </div>
        
        {/* Overall Progress Section */}
        <div className="mt-10">
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-xl">Submission Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {documentSections.map(section => {
                const submittedCount = getSubmittedRequiredDocCount(section.id);
                const requiredCount = getRequiredDocCount(section.id);
                
                return (
                  <div key={`summary-${section.id}`} className="flex justify-between items-center">
                    <div className="font-medium">{section.title}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {submittedCount}/{requiredCount} required docs
                      </span>
                      <Circle className="h-3 w-3" fill={submittedCount > 0 ? "#FFA500" : "none"} stroke={submittedCount > 0 ? "#FFA500" : "currentColor"} />
                    </div>
                  </div>
                );
              })}
              
              <Separator className="my-4" />
              
              <Button 
                className="w-full py-6" 
                disabled={!areAllRequiredDocsSubmitted()}
                onClick={handleSubmitAllDocuments}
              >
                Submit All Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentUpload;
