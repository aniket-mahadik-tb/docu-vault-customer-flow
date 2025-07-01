import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Info, X, Upload } from "lucide-react";
import { useCustomers } from "@/contexts/CustomerContext";
import { toast } from "@/components/ui/use-toast";
import { useDocumentUploadService } from "@/services/documentUploadService";

interface DocumentTableProps {
  category: any;
  categoryIndex: number | string;
  isMultipleSection: boolean;
  sections: any[];
  sectionInstances: any;
  setSectionInstances: any;
  CardKeyPrefix?: string;
  documentYears: any;
  setDocumentYears: any;
  selectedYears: any;
  setSelectedYears: any;
  yearRowTemplates: any;
  setYearRowTemplates: any;
  currentYear: number;
  handleFileUpload: any;
  getApiFilesForDocument: (documentMasterId: string, category: string, year?: number | string, promoterIndex?: number, section?: any) => any[];
  uploadingDocuments: any;
  isPromoter?: boolean;
  currentPage?: number;
  handleAddSection: (categoryName: string) => void;
  beSections: { [category: string]: string[] };
  temporarySections: { [category: string]: { name: string; instance: any } | null };
}

const DocumentTable: React.FC<DocumentTableProps> = React.memo(({
  category,
  categoryIndex,
  isMultipleSection,
  sections,
  sectionInstances,
  setSectionInstances,
  CardKeyPrefix = '',
  documentYears,
  setDocumentYears,
  selectedYears,
  setSelectedYears,
  yearRowTemplates,
  setYearRowTemplates,
  currentYear,
  handleFileUpload,
  getApiFilesForDocument,
  uploadingDocuments,
  isPromoter = false,
  currentPage = 0,
  handleAddSection,
  beSections,
  temporarySections,
}) => {
  const { sectionTemplates } = useCustomers();
  const documentUploadService = useDocumentUploadService();

  // Modal state
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  React.useEffect(() => {
    if (category.category === "DETAILS OF THE COLLATERAL SECURITY") {
      console.log("=== DocumentTable Render for Collateral Security ===");
      console.log("sections:", sections);
      console.log("sectionInstances:", sectionInstances);
      console.log("temporarySections:", temporarySections);
      console.log("beSections:", beSections);
    }
  }, [sections, category.category, sectionInstances, temporarySections, beSections]);

  // Get all sections for this category without duplicates
  const getAllSectionsForCategory = () => {
    const allSections = new Set([
      ...(beSections[category.category] || []),
      ...(sectionInstances[category.category] || []).map(s => s.section),
      ...sections.map(s => s.section)
    ]);
    return Array.from(allSections);
  };

  // Get highest section number for this category
  const getHighestSectionNumber = () => {
    const allSections = getAllSectionsForCategory();
    const highest = Math.max(...allSections.map(section => {
      const match = section?.match(/Section (\d+)/);
      return match ? parseInt(match[1]) : 0;
    }), 0);
    return highest;
  };

  // Get section number for a specific section
  const getSectionNumber = (section: any) => {
    const match = section.section?.match(/Section (\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const highestSectionNumber = getHighestSectionNumber();

  // Handler to add an additional (blank) year row for a given document key
  const handleAddMultipleYearRowbtn = (key: string, document: any) => {
    setYearRowTemplates((prev: any) => ({
      ...prev,
      [key]: [...(prev[key] || []), { ...JSON.parse(JSON.stringify(document)), year: null, files: [] }],
    }));
  };

  // Add this handler at the top level of the component
  const handleViewFile = async (file: any) => {
    setLoadingPreview(true);
    try {
      const response = await documentUploadService.getDocumentDetails(file.docId);
      if (response && response.status === 200 && response.data) {
        setPreviewData(response.data);
        setShowPreview(true);
      } else {
        toast({ title: "Failed to preview document", description: response?.message || "Unknown error", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Failed to preview document", description: String(err), variant: "destructive" });
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div key={categoryIndex}>
      {/* Preview Modal */}
      {showPreview && previewData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(30, 41, 59, 0.65)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeInOverlay 0.2s',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            padding: '24px 24px 18px 24px',
            width: '520px',
            height: '520px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(30,41,59,0.18), 0 1.5px 8px rgba(30,41,59,0.10)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeInModal 0.25s',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setShowPreview(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(30,41,59,0.09)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                fontSize: 22,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.18s',
                boxShadow: '0 1.5px 6px rgba(30,41,59,0.08)',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(30,41,59,0.16)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(30,41,59,0.09)')}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 style={{
              marginBottom: 12,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 18,
              color: '#1e293b',
              letterSpacing: 0.2,
              fontFamily: 'Inter, sans-serif',
              wordBreak: 'break-all',
              maxWidth: '90%',
            }}>{previewData.fileName}</h2>
            <div style={{
              width: '100%',
              height: '100%',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              overflow: 'auto',
              background: '#f8fafc',
              boxShadow: '0 1.5px 8px rgba(30,41,59,0.06)',
            }}>
              {previewData.contentType && previewData.contentType.startsWith('image') ? (
                <img
                  src={`http://localhost:8080/api/v1${previewData.url}`}
                  alt={previewData.fileName}
                  style={{
                    maxWidth: '95%',
                    maxHeight: '95%',
                    borderRadius: 10,
                    objectFit: 'contain',
                    background: '#fff',
                  }}
                />
              ) : previewData.contentType && previewData.contentType === 'application/pdf' ? (
                <iframe
                  src={`http://localhost:8080/api/v1${previewData.url}`}
                  title={previewData.fileName}
                  style={{
                    width: '95%',
                    height: '95%',
                    border: 'none',
                    borderRadius: 10,
                    background: '#fff',
                  }}
                  allowFullScreen
                />
              ) : (
                <div style={{ padding: 18, color: '#64748b', fontSize: 15 }}>Preview not available for this file type.</div>
              )}
            </div>
          </div>
          <style>{`
            @keyframes fadeInOverlay {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fadeInModal {
              from { opacity: 0; transform: translateY(40px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}
      {sections.map((section, instanceIdx) => {
        const sectionKey = CardKeyPrefix ? `${CardKeyPrefix}_${categoryIndex}` : categoryIndex;
        const currentSectionNumber = getSectionNumber(section);

        // A section is the last section if:
        // 1. It's a multiple section category AND
        // 2. It's the highest numbered section AND
        // 3. It's not a temporary section
        const isLastSection = isMultipleSection &&
          currentSectionNumber === highestSectionNumber &&
          !temporarySections[category.category];

        return (
          <div key={section._instanceId || instanceIdx} className="relative">
            <Card className="mb-6">
              {/* Cross icon for extra sections */}
              {isMultipleSection && instanceIdx > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSectionInstances((prev: any) => {
                      const updated = { ...prev };
                      const categoryKey = CardKeyPrefix ? `${CardKeyPrefix}_${category.category}` : category.category;
                      if (updated[categoryKey] && updated[categoryKey].length > 1) {
                        updated[categoryKey] = updated[categoryKey].filter((s: any) => s._instanceId !== section._instanceId);
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
                  {section.category} {isMultipleSection ? `(${section.section})` : null}
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
                    {(() => {
                      // Group documents by documentMasterId
                      const documentGroups: { [key: string]: any[] } = {};
                      
                      // Group all documents by documentMasterId
                      section.documents.forEach((doc: any, index: number) => {
                        if (!documentGroups[doc.documentMasterId]) {
                          documentGroups[doc.documentMasterId] = [];
                        }
                        documentGroups[doc.documentMasterId].push({ ...doc, _originalIndex: index });
                      });
                      
                      // Now render each document group as a single document with multiple rows
                      return Object.keys(documentGroups).map((documentMasterId) => {
                        const documentsInGroup = documentGroups[documentMasterId];
                        // Use the first document for document properties (they should all be the same except year/files)
                        const masterDocument = documentsInGroup[0];
                        
                        const docKey = isPromoter
                          ? `${masterDocument.documentMasterId}_promoter${currentPage - 1}_${section.section}_${instanceIdx}`
                          : `${masterDocument.documentMasterId}_${section.section}_${instanceIdx}`;
                          
                        const sectionName = section.section;
                        const isMultipleFiles = masterDocument.isMultipleFiles;

                        // Collect all years from API entries for this document group
                        let years: (number | undefined)[] = [];
                        if (masterDocument.isMultipleYears) {
                          // Get years from all API entries in this group
                          const apiYears = documentsInGroup
                            .map(doc => doc.year ? parseInt(doc.year, 10) : undefined)
                            .filter(y => y !== undefined);
                          
                          // Also include any local years from state
                          const localYears = documentYears[docKey] || [];
                          
                          // Combine and deduplicate
                          years = [...new Set([...apiYears, ...localYears])] as number[];
                          if (years.length === 0) years = [];
                        } else {
                          years = [undefined];
                        }

                        // Build a Set of years already chosen/uploaded for this document
                        const usedYears = new Set<number>();
                        documentsInGroup.forEach(doc => {
                          if (doc.year) usedYears.add(parseInt(doc.year, 10));
                        });
                        (documentYears[docKey] || []).forEach((y: number) => usedYears.add(y));
                        // Add years from yearRowTemplates (template rows)
                        (yearRowTemplates[docKey] || []).forEach((row: any) => {
                          if (row.year !== null && row.year !== undefined) usedYears.add(row.year);
                        });

                        // Sort years in descending order
                        const sortedYears = [...years].sort((a, b) => (b || 0) - (a || 0));
                        
                        // Find which rows have disabled dropdowns (files uploaded)
                        const disabledRowIndices = sortedYears.map((year, idx) => {
                          const files = getApiFilesForDocument(
                            masterDocument.documentMasterId,
                            section.category,
                            masterDocument.isMultipleYears ? year : undefined,
                            isPromoter ? currentPage - 1 : undefined,
                            section
                          );
                          return files.length > 0 ? idx : -1;
                        }).filter(idx => idx !== -1);
                        
                        const lastDisabledRowIndex = disabledRowIndices.length > 0 ? Math.max(...disabledRowIndices) : -1;
                        
                        // Render API years
                        const apiRows = sortedYears.map((year: any, yearIdx: number) => {
                          const yearKey = `${docKey}_${yearIdx}`;

                          // Files already uploaded for this document + year
                          const files = getApiFilesForDocument(
                            masterDocument.documentMasterId,
                            section.category,
                            masterDocument.isMultipleYears ? year : undefined,
                            isPromoter ? currentPage - 1 : undefined,
                            section
                          );

                          // Dropdown locked when BE already has at least one file
                          const dropdownLocked = files.length > 0;

                          // Determine the effective year for this row based on the latest selection
                          const effectiveYear = dropdownLocked
                            ? year
                            : (selectedYears[yearKey] ?? year);

                          return (
                            <TableRow key={docKey + "_" + yearIdx}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2" style={{ textAlign: 'start' }}>
                                  {masterDocument.documentType}
                                  {masterDocument.isMultipleYears && (
                                    <>
                                      {(() => {
                                        if (selectedYears[yearKey] === undefined) {
                                          setTimeout(() => {
                                            setSelectedYears((prev: any) => ({
                                              ...prev,
                                              [yearKey]: year
                                            }));
                                            setDocumentYears((prev: any) => ({
                                              ...prev,
                                              [docKey]: (prev[docKey] || []).map((y: any, idx: number) => idx === yearIdx ? year : y)
                                            }));
                                          }, 0);
                                        }
                                        return (
                                          <select
                                            value={effectiveYear ?? ''}
                                            onChange={e => {
                                              if (dropdownLocked) return;
                                              const newYear = parseInt(e.target.value, 10);
                                              setSelectedYears((prev: any) => ({
                                                ...prev,
                                                [yearKey]: newYear
                                              }));
                                              setDocumentYears((prev: any) => ({
                                                ...prev,
                                                [docKey]: (prev[docKey] || []).map((y: any, idx: number) => idx === yearIdx ? year : y)
                                              }));
                                            }}
                                            disabled={dropdownLocked}
                                            className={`border rounded px-2 py-1 text-sm ml-2 ${dropdownLocked ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''}`}
                                          >
                                            <option value="" disabled>Year</option>
                                            {Array.from({ length: 6 }).map((_, i) => {
                                              const optionYear = currentYear - i;
                                              const disableOption = !dropdownLocked && usedYears.has(optionYear) && optionYear !== effectiveYear;
                                              return (
                                                <option key={optionYear} value={optionYear} disabled={disableOption}>
                                                  {optionYear}
                                                </option>
                                              );
                                            })}
                                          </select>
                                        );
                                      })()}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const filesRef = files;
                                  if (filesRef.length === 0) {
                                    return <span className="text-gray-400 text-sm">NA</span>;
                                  }
                                  return (
                                    <div className="space-y-1 flex flex-col">
                                      {filesRef.map((file: any) => {
                                        let badge;
                                        switch ((file.docStatus || '').toUpperCase()) {
                                          case 'APPROVED':
                                            badge = <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
                                            break;
                                          case 'SUBMITTED':
                                            badge = <Badge variant="secondary" className="bg-gray-200 text-gray-800">Submitted</Badge>;
                                            break;
                                          case 'REJECTED':
                                            badge = <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>;
                                            break;
                                          case 'PENDING':
                                            badge = <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
                                            break;
                                          default:
                                            badge = <Badge variant="secondary" className="bg-gray-100 text-gray-800">{file.docStatus}</Badge>;
                                        }
                                        return (
                                          <div key={file.docId} className="flex items-center gap-2">
                                            {badge}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  const filesRef2 = files;
                                  if (filesRef2.length === 0) {
                                    return (
                                      <span className="text-gray-400 text-sm">No files uploaded yet</span>
                                    );
                                  }
                                  return (
                                    <div className="space-y-1 flex flex-col">
                                      {filesRef2.map((file: any, fileIndex: number) => (
                                        <div key={file.docId} className="flex items-center text-sm" style={{ textAlign: 'start' }}>
                                          {String(file.docStatus).toUpperCase() !== 'APPROVED' ? (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 text-red-700 mr-1"
                                              aria-label="Delete file"
                                              // disabled
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          ) : (
                                            <span style={{ width: 24, display: 'inline-block' }}></span>
                                          )}
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-blue-800 mr-1"
                                            aria-label="View file"
                                            onClick={() => handleViewFile(file)}
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                                              <circle cx="12" cy="12" r="3" />
                                            </svg>
                                          </Button>
                                          <span className="truncate max-w-[120px]" title={file.docName}>
                                            {file.docName}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {masterDocument.isMandatory ? (
                                    <Badge variant="destructive" className="bg-red-100 text-red-800">Required</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Optional</Badge>
                                  )}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span style={{ display: 'inline-flex', width: 20, justifyContent: 'center' }}>
                                          <Info className={`h-5 w-5 ${isMultipleFiles ? 'text-blue-500 visible' : 'invisible'}`} />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <span>This document supports multiple files.</span>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 justify-center" style={{ minWidth: 80 }}>
                                  <input
                                    key={`file-${masterDocument.documentMasterId}-${docKey}-${yearIdx}-${selectedYears[`${docKey}_${yearIdx}`] ?? year}`}
                                    type="file"
                                    id={`file-${masterDocument.documentMasterId}-${docKey}-${yearIdx}`}
                                    multiple
                                    onChange={(e) => {
                                      const selectedYear = masterDocument.isMultipleYears ? effectiveYear : undefined;
                                      if (masterDocument.isMultipleYears && !selectedYear) {
                                        toast({ title: "Select year", description: "Please choose a year before uploading", variant: "destructive" });
                                        e.target.value = "";
                                        return;
                                      }
                                      // Restrict upload if isMultipleFiles is false and already a file exists
                                      const existingFiles = getApiFilesForDocument(
                                        masterDocument.documentMasterId,
                                        section.category,
                                        masterDocument.isMultipleYears ? selectedYear : undefined,
                                        isPromoter ? currentPage - 1 : undefined,
                                        section
                                      );
                                      if (!masterDocument.isMultipleFiles && existingFiles.length > 0) {
                                        toast({
                                          title: "Only one file can be uploaded to this field.",
                                          description: "Please delete the existing file to re-upload.",
                                          variant: "destructive",
                                        });
                                        e.target.value = "";
                                        return;
                                      }
                                      e.target.files && handleFileUpload(masterDocument.documentMasterId, e.target.files, selectedYear, sectionName);
                                    }}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  />
                                  <label htmlFor={`file-${masterDocument.documentMasterId}-${docKey}-${yearIdx}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={uploadingDocuments[masterDocument.documentMasterId]}
                                      className="cursor-pointer min-w-[140px] flex items-center justify-center border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                      asChild
                                    >
                                      <span>
                                        {uploadingDocuments[masterDocument.documentMasterId] ? (
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleAddMultipleYearRowbtn(docKey, masterDocument);
                                    }}
                                    className={`border-gray-300 hover:border-gray-400 hover:bg-gray-50 ${
                                      masterDocument.isMultipleYears &&
                                      yearIdx === lastDisabledRowIndex &&
                                      lastDisabledRowIndex !== -1 &&
                                      effectiveYear ? '' : 'invisible'
                                    }`}
                                    aria-label="Add Year"
                                  >
                                    +
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        });
                        
                        // Template rows for additional years
                        let templateRows: any[] = [];
                        templateRows = (yearRowTemplates[docKey] || []).map((row: any, templateIdx: number) => {
                          const yearKey = `${docKey}_template_${templateIdx}`;
                          const dropdownLocked = false;
                          const effectiveYear = selectedYears[yearKey] ?? row.year;
                          return (
                            <TableRow key={docKey + "_template_" + templateIdx}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2" style={{ textAlign: 'start' }}>
                                  {masterDocument.documentType}
                                  <select
                                    value={effectiveYear ?? ''}
                                    onChange={e => {
                                      const newYear = parseInt(e.target.value, 10);
                                      setSelectedYears((prev: any) => ({
                                        ...prev,
                                        [yearKey]: newYear
                                      }));
                                      setYearRowTemplates((prev: any) => ({
                                        ...prev,
                                        [docKey]: (prev[docKey] || []).map((r: any, idx: number) => idx === templateIdx ? { ...r, year: newYear } : r)
                                      }));
                                    }}
                                    className={`border rounded px-2 py-1 text-sm ml-2`}
                                  >
                                    <option value="" disabled>Year</option>
                                    {Array.from({ length: 6 }).map((_, i) => {
                                      const optionYear = currentYear - i;
                                      const disableOption = usedYears.has(optionYear) && optionYear !== effectiveYear;
                                      return (
                                        <option key={optionYear} value={optionYear} disabled={disableOption}>
                                          {optionYear}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-400 text-sm">NA</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-400 text-sm">No files uploaded yet</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {masterDocument.isMandatory ? (
                                    <Badge variant="destructive" className="bg-red-100 text-red-800">Required</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Optional</Badge>
                                  )}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span style={{ display: 'inline-flex', width: 20, justifyContent: 'center' }}>
                                          <Info className={`h-5 w-5 ${isMultipleFiles ? 'text-blue-500 visible' : 'invisible'}`} />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <span>This document supports multiple files.</span>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 justify-center" style={{ minWidth: 80 }}>
                                  <input
                                    key={`file-${masterDocument.documentMasterId}-${docKey}-template-${templateIdx}-${selectedYears[yearKey] ?? row.year}`}
                                    type="file"
                                    id={`file-${masterDocument.documentMasterId}-${docKey}-template-${templateIdx}`}
                                    multiple
                                    onChange={(e) => {
                                      const selectedYear = selectedYears[yearKey] ?? row.year;
                                      if (!selectedYear) {
                                        toast({ title: "Select year", description: "Please choose a year before uploading", variant: "destructive" });
                                        e.target.value = "";
                                        return;
                                      }
                                      // Restrict upload if isMultipleFiles is false and already a file exists
                                      const existingFiles = getApiFilesForDocument(
                                        masterDocument.documentMasterId,
                                        section.category,
                                        masterDocument.isMultipleYears ? selectedYear : undefined,
                                        isPromoter ? currentPage - 1 : undefined,
                                        section
                                      );
                                      if (!masterDocument.isMultipleFiles && existingFiles.length > 0) {
                                        toast({
                                          title: "Only one file can be uploaded to this field.",
                                          description: "Please delete the existing file to re-upload.",
                                          variant: "destructive",
                                        });
                                        e.target.value = "";
                                        return;
                                      }
                                      e.target.files && handleFileUpload(masterDocument.documentMasterId, e.target.files, selectedYear, sectionName);
                                      setYearRowTemplates((prev: any) => {
                                        const updated = { ...prev };
                                        updated[docKey] = (updated[docKey] || []).filter((_, idx) => idx !== templateIdx);
                                        return updated;
                                      });
                                      setSelectedYears((prev: any) => {
                                        const updated = { ...prev };
                                        delete updated[yearKey];
                                        return updated;
                                      });
                                    }}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  />
                                  <label htmlFor={`file-${masterDocument.documentMasterId}-${docKey}-template-${templateIdx}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="cursor-pointer min-w-[140px] flex items-center justify-center border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                      asChild
                                    >
                                      <span>
                                        <Upload className="h-4 w-4" />
                                        <span className="ml-1 block truncate">
                                          Upload Document
                                        </span>
                                      </span>
                                    </Button>
                                  </label>
                                  {templateIdx === (yearRowTemplates[docKey] || []).length - 1 && lastDisabledRowIndex === -1 && effectiveYear && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleAddMultipleYearRowbtn(docKey, masterDocument);
                                      }}
                                      className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                      aria-label="Add Year"
                                    >
                                      +
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        });

                        // If no API years and no template rows, render a single blank template row for multiple years documents
                        if (masterDocument.isMultipleYears && apiRows.length === 0 && templateRows.length === 0) {
                          const yearKey = `${docKey}_template_initial`;
                          templateRows = [
                            <TableRow key={docKey + "_template_initial"}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2" style={{ textAlign: 'start' }}>
                                  {masterDocument.documentType}
                                  <select
                                    value={selectedYears[yearKey] ?? ''}
                                    onChange={e => {
                                      const newYear = parseInt(e.target.value, 10);
                                      setSelectedYears((prev: any) => ({
                                        ...prev,
                                        [yearKey]: newYear
                                      }));
                                    }}
                                    className={`border rounded px-2 py-1 text-sm ml-2`}
                                  >
                                    <option value="" disabled>Year</option>
                                    {Array.from({ length: 6 }).map((_, i) => {
                                      const optionYear = currentYear - i;
                                      const disableOption = usedYears.has(optionYear);
                                      return (
                                        <option key={optionYear} value={optionYear} disabled={disableOption}>
                                          {optionYear}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-400 text-sm">NA</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-400 text-sm">No files uploaded yet</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {masterDocument.isMandatory ? (
                                    <Badge variant="destructive" className="bg-red-100 text-red-800">Required</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Optional</Badge>
                                  )}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span style={{ display: 'inline-flex', width: 20, justifyContent: 'center' }}>
                                          <Info className={`h-5 w-5 ${isMultipleFiles ? 'text-blue-500 visible' : 'invisible'}`} />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <span>This document supports multiple files.</span>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 justify-center" style={{ minWidth: 80 }}>
                                  <input
                                    key={`file-${masterDocument.documentMasterId}-${docKey}-template-initial-${selectedYears[yearKey] ?? ''}`}
                                    type="file"
                                    id={`file-${masterDocument.documentMasterId}-${docKey}-template-initial`}
                                    multiple
                                    onChange={(e) => {
                                      const selectedYear = selectedYears[yearKey];
                                      if (!selectedYear) {
                                        toast({ title: "Select year", description: "Please choose a year before uploading", variant: "destructive" });
                                        e.target.value = "";
                                        return;
                                      }
                                      e.target.files && handleFileUpload(masterDocument.documentMasterId, e.target.files, selectedYear, sectionName);
                                      setSelectedYears((prev: any) => {
                                        const updated = { ...prev };
                                        delete updated[yearKey];
                                        return updated;
                                      });
                                    }}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  />
                                  <label htmlFor={`file-${masterDocument.documentMasterId}-${docKey}-template-initial`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="cursor-pointer min-w-[140px] flex items-center justify-center border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                      asChild
                                    >
                                      <span>
                                        <Upload className="h-4 w-4" />
                                        <span className="ml-1 block truncate">
                                          Upload Document
                                        </span>
                                      </span>
                                    </Button>
                                  </label>
                                  {lastDisabledRowIndex === -1 && selectedYears[yearKey] && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleAddMultipleYearRowbtn(docKey, masterDocument);
                                      }}
                                      className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                      aria-label="Add Year"
                                    >
                                      +
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ];
                        }
                        
                        return [
                          ...apiRows,
                          ...templateRows
                        ];
                      });
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Add Section button - only show if this is the last section and no temporary section exists */}
            {isMultipleSection && isLastSection && !temporarySections[category.category] && (
              <div className="flex justify-start mb-6 -mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSection(category.category)}
                  className="flex items-center gap-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" /> Add Section
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default DocumentTable;