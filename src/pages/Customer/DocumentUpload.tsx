
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useDocuments, DocumentFile } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, X, ChevronDown, ChevronUp, Upload, CheckCircle, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    saving: boolean;
  }
}

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { addDocument, removeDocument, submitFolder, getFolderDocuments, isFolderSubmitted } = useDocuments();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
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
          submitting: false,
          saving: false
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

  const toggleSubDocument = (docId: string) => {
    setSubDocumentStates(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        open: !prev[docId].open
      }
    }));
  };

  const handleFileUpload = async (sectionId: string, docId: string, files: FileList) => {
    if (!userId) return;
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fullFolderId = `${sectionId}_${docId}`;
        await addDocument(userId, fullFolderId, file);
      }
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) added successfully`,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive",
      });
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

  const handleSaveProgress = (sectionId: string, docId: string) => {
    if (!userId) return;
    
    const fullFolderId = `${sectionId}_${docId}`;
    setSubDocumentStates(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        saving: true
      }
    }));
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Progress saved",
        description: "Your upload progress has been saved",
      });
      setSubDocumentStates(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          saving: false
        }
      }));
    }, 500);
  };

  const handleSubmitSubDocument = (sectionId: string, docId: string) => {
    if (!userId) return;
    
    const fullFolderId = `${sectionId}_${docId}`;
    setSubDocumentStates(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        submitting: true
      }
    }));
    
    // Simulate API call
    setTimeout(() => {
      submitFolder(userId, fullFolderId);
      
      toast({
        title: "Documents submitted",
        description: "Your documents have been successfully submitted",
      });
      
      setSubDocumentStates(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          submitting: false
        }
      }));
    }, 1000);
  };

  const handleSubmitSection = (sectionId: string) => {
    if (!userId) return;
    
    setSubmitting(prev => ({ ...prev, [sectionId]: true }));
    
    // Find all document types in this section
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return;
    
    // Submit all doc types in the section
    section.documentTypes.forEach(docType => {
      const fullFolderId = `${sectionId}_${docType.id}`;
      submitFolder(userId, fullFolderId);
    });
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Section submitted",
        description: `All documents in ${section.title} have been submitted`,
      });
      
      setSubmitting(prev => ({ ...prev, [sectionId]: false }));
    }, 1000);
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

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Document Upload</h1>
        
        <div className="space-y-6">
          {documentSections.map(section => {
            const isOpen = openSections[section.id] || false;
            const isSubmitted = isSectionSubmitted(section.id);
            
            return (
              <Card key={section.id} className={isSubmitted ? "border-green-200 bg-green-50" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CardTitle>{section.title}</CardTitle>
                      {isSubmitted && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
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
                          <div className="space-y-4">
                            {section.documentTypes.map(docType => {
                              const fullFolderId = `${section.id}_${docType.id}`;
                              const docFiles = userId ? getFolderDocuments(userId, fullFolderId) : [];
                              const isDocSubmitted = userId ? isFolderSubmitted(userId, fullFolderId) : false;
                              const docState = subDocumentStates[docType.id] || { open: false, submitting: false, saving: false };
                              
                              return (
                                <Card key={docType.id} className={`border ${isDocSubmitted ? "border-green-200 bg-green-50" : ""}`}>
                                  <CardHeader className="p-4">
                                    <div className="flex justify-between items-center">
                                      <div>
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
                                      </div>
                                      <Collapsible open={docState.open} onOpenChange={() => toggleSubDocument(docType.id)}>
                                        <CollapsibleTrigger className="rounded-full p-1 hover:bg-accent">
                                          {docState.open ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                          <div className="pt-4">
                                            {!isDocSubmitted && (
                                              <div className="mb-4">
                                                <label
                                                  htmlFor={`file-upload-${fullFolderId}`}
                                                  className="flex justify-center items-center border-2 border-dashed rounded-lg py-4 px-4 cursor-pointer hover:bg-accent/10"
                                                >
                                                  <div className="text-center">
                                                    <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                      Allowed types: .pdf, .jpg, .jpeg, .png
                                                    </p>
                                                  </div>
                                                  <input
                                                    id={`file-upload-${fullFolderId}`}
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className="hidden"
                                                    onChange={(e) => e.target.files && handleFileUpload(section.id, docType.id, e.target.files)}
                                                  />
                                                </label>
                                              </div>
                                            )}
                                            
                                            {docFiles.length > 0 && (
                                              <div>
                                                <h4 className="text-sm font-medium mb-3">Uploaded Files</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                                            
                                            {!isDocSubmitted && docFiles.length > 0 && (
                                              <div className="mt-4 flex gap-2 flex-wrap">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleSaveProgress(section.id, docType.id)}
                                                  disabled={docState.saving}
                                                >
                                                  <Save className="h-3 w-3 mr-1" />
                                                  {docState.saving ? 'Saving...' : 'Save Progress'}
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  onClick={() => handleSubmitSubDocument(section.id, docType.id)}
                                                  disabled={docState.submitting}
                                                >
                                                  {docState.submitting ? 'Submitting...' : 'Submit'}
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    </div>
                                  </CardHeader>
                                </Card>
                              );
                            })}
                          </div>
                        </CardContent>
                        
                        {!isSubmitted && (
                          <CardFooter className="gap-2 flex-wrap">
                            <Button
                              onClick={() => handleSubmitSection(section.id)}
                              disabled={submitting[section.id]}
                            >
                              {submitting[section.id] ? 'Submitting Section...' : 'Submit All Required Documents'}
                            </Button>
                          </CardFooter>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentUpload;
