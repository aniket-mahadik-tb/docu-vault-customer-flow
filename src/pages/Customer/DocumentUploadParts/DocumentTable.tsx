import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Info, X, Upload } from "lucide-react";
import { useCustomers } from "@/contexts/CustomerContext";
import { toast } from "@/components/ui/use-toast";

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

    if (category.category === "DETAILS OF THE COLLATERAL SECURITY") {
      console.log("All unique sections for category:", Array.from(allSections));
    }
    return Array.from(allSections);
  };

  // Get highest section number for this category
  const getHighestSectionNumber = () => {
    const allSections = getAllSectionsForCategory();
    const highest = Math.max(...allSections.map(section => {
      const match = section?.match(/Section (\d+)/);
      return match ? parseInt(match[1]) : 0;
    }), 0);

    if (category.category === "DETAILS OF THE COLLATERAL SECURITY") {
      console.log("Highest section number:", highest);
    }
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

  return (
    <div key={categoryIndex}>
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
                      // Group documents by documentMasterId to find the last API entry with files for each document
                      const documentGroups: { [key: string]: any[] } = {};
                      const lastDocWithFilesMap: { [key: string]: any } = {};
                      
                      // Group all documents by documentMasterId
                      section.documents.forEach((doc: any, index: number) => {
                        if (!documentGroups[doc.documentMasterId]) {
                          documentGroups[doc.documentMasterId] = [];
                        }
                        documentGroups[doc.documentMasterId].push({ ...doc, _originalIndex: index });
                      });
                      
                      // For each document group, find the last entry with files (in API response order)
                      Object.keys(documentGroups).forEach(docMasterId => {
                        const docs = documentGroups[docMasterId];
                        // Find the last document (highest original index) that has files
                        for (let i = docs.length - 1; i >= 0; i--) {
                          const doc = docs[i];
                          if (doc.files && doc.files.length > 0) {
                            lastDocWithFilesMap[docMasterId] = doc;
                            break;
                          }
                        }
                      });
                      
                      // Track which document groups have already rendered their template rows
                      const renderedTemplateRows = new Set<string>();
                      
                      return section.documents.map((document: any, docIndex: number) => {
                        const docKey = isPromoter
                          ? `${document.documentMasterId}_promoter${currentPage - 1}_${section.section}_${instanceIdx}`
                          : `${document.documentMasterId}_${section.section}_${instanceIdx}`;
                        // Build the list of years to render rows for
                        let years: (number | undefined)[];
                        if (document.isMultipleYears) {
                          const apiYear = document.year ? parseInt(document.year, 10) : undefined;
                          const localYears = documentYears[docKey] || [];
                          years = [...new Set([apiYear, ...localYears].filter((y) => y !== undefined))] as number[];
                          if (years.length === 0) years = [];
                        } else {
                          years = [undefined];
                        }
                        const sectionName = section.section;  // Use the actual section name from the data
                        const isMultipleFiles = document.isMultipleFiles;

                        // Build a Set of years already chosen/uploaded for this document (API only)
                        const usedYears = new Set<number>();
                        if (document.year) {
                          usedYears.add(parseInt(document.year, 10));
                        }
                        (documentYears[docKey] || []).forEach((y: number) => usedYears.add(y));
                        years.forEach((y) => { if (y !== undefined) usedYears.add(y); });
                        // Add years from yearRowTemplates (template rows)
                        (yearRowTemplates[docKey] || []).forEach((row: any) => {
                          if (row.year !== null && row.year !== undefined) usedYears.add(row.year);
                        });

                        // Sort years in descending order to ensure proper "+" button placement
                        const sortedYears = [...years].sort((a, b) => (b || 0) - (a || 0));
                        
                        // Find which rows have disabled dropdowns (files uploaded)
                        const disabledRowIndices = sortedYears.map((year, idx) => {
                          const files = getApiFilesForDocument(
                            document.documentMasterId,
                            section.category,
                            document.isMultipleYears ? year : undefined,
                            isPromoter ? currentPage - 1 : undefined,
                            section
                          );
                          return files.length > 0 ? idx : -1;
                        }).filter(idx => idx !== -1);
                        
                        const lastDisabledRowIndex = disabledRowIndices.length > 0 ? Math.max(...disabledRowIndices) : -1;
                        
                        // Check if this is the last document entry for this documentMasterId that has files
                        const isLastDocWithFiles = lastDocWithFilesMap[document.documentMasterId] && 
                                                 lastDocWithFilesMap[document.documentMasterId].year === document.year;
                        
                        // Render API years and then template rows (only for the last document with files)
                        const apiRows = sortedYears.map((year: any, yearIdx: number) => {
                          const yearKey = `${docKey}_${yearIdx}`;

                          // Files already uploaded for this document + year
                          const files = getApiFilesForDocument(
                            document.documentMasterId,
                            section.category,
                            document.isMultipleYears ? year : undefined,
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
                                  {document.documentType}
                                  {document.isMultipleYears && (
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
                                              if (dropdownLocked) return; // prevent change when locked
                                              const newYear = parseInt(e.target.value, 10);
                                              setSelectedYears((prev: any) => ({
                                                ...prev,
                                                [yearKey]: newYear
                                              }));
                                              setDocumentYears((prev: any) => ({
                                                ...prev,
                                                [docKey]: (prev[docKey] || []).map((y: any, idx: number) => idx === yearIdx ? newYear : y)
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
                                {/* Status column: show status for each file from API */}
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
                                          case 'SUBMITTED':
                                            badge = <Badge variant="default" className="bg-green-100 text-green-800">Submitted</Badge>;
                                            break;
                                          case 'PENDING':
                                            badge = <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
                                            break;
                                          case 'REJECTED':
                                            badge = <Badge variant="destructive" className="bg-red-100 text-red-800">Rejected</Badge>;
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
                                {/* Uploaded Files column: only show file names and plus icon */}
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
                                          {/* Trash icon before file name, hidden if status is APPROVED */}
                                          {String(file.docStatus).toUpperCase() !== 'APPROVED' ? (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 text-red-700 mr-1"
                                              aria-label="Delete file"
                                              disabled
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          ) : (
                                            <span style={{ width: 24, display: 'inline-block' }}></span>
                                          )}
                                          {/* Eye icon for preview, always visible */}
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-blue-800 mr-1"
                                            aria-label="View file"
                                            disabled
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
                                {/* Mandatory badge and i icon for multiple files */}
                                <div className="flex items-center justify-center gap-2">
                                  {document.isMandatory ? (
                                    <Badge variant="destructive" className="bg-red-100 text-red-800">Required</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">Optional</Badge>
                                  )}
                                  {/* i icon for multiple files, visible only if isMultipleFiles, else invisible for alignment */}
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
                                    key={`file-${document.documentMasterId}-${docKey}-${yearIdx}-${selectedYears[`${docKey}_${yearIdx}`] ?? year}`}
                                    type="file"
                                    id={`file-${document.documentMasterId}-${docKey}-${yearIdx}`}
                                    multiple
                                    onChange={(e) => {
                                      const selectedYear = document.isMultipleYears ? selectedYears[`${docKey}_${yearIdx}`] : undefined;
                                      if (document.isMultipleYears && !selectedYear) {
                                        toast({ title: "Select year", description: "Please choose a year before uploading", variant: "destructive" });
                                        e.target.value = "";
                                        return;
                                      }
                                      const sectionName = section.section;
                                      e.target.files && handleFileUpload(document.documentMasterId, e.target.files, selectedYear, sectionName);
                                    }}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  />
                                  <label htmlFor={`file-${document.documentMasterId}-${docKey}-${yearIdx}`}>
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleAddMultipleYearRowbtn(docKey, document);
                                    }}
                                    className={`border-gray-300 hover:border-gray-400 hover:bg-gray-50 ${
                                      document.isMultipleYears &&
                                      yearIdx === lastDisabledRowIndex &&
                                      lastDisabledRowIndex !== -1 &&
                                      effectiveYear &&
                                      isLastDocWithFiles ? '' : 'invisible'
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
                        
                        // Only render template rows for the last document entry with files for this documentMasterId
                        // OR if no documents have files yet
                        const shouldRenderTemplateRows = isLastDocWithFiles || 
                                                       (!lastDocWithFilesMap[document.documentMasterId] && !renderedTemplateRows.has(document.documentMasterId));
                        
                        let templateRows: any[] = [];
                        if (shouldRenderTemplateRows && !renderedTemplateRows.has(document.documentMasterId)) {
                          renderedTemplateRows.add(document.documentMasterId);
                          
                          templateRows = (yearRowTemplates[docKey] || []).map((row: any, templateIdx: number) => {
                            const yearKey = `${docKey}_template_${templateIdx}`;
                            const dropdownLocked = false;
                            const effectiveYear = selectedYears[yearKey] ?? row.year;
                            return (
                              <TableRow key={docKey + "_template_" + templateIdx}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2" style={{ textAlign: 'start' }}>
                                    {document.documentType}
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
                                    {document.isMandatory ? (
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
                                      key={`file-${document.documentMasterId}-${docKey}-template-${templateIdx}-${selectedYears[yearKey] ?? row.year}`}
                                      type="file"
                                      id={`file-${document.documentMasterId}-${docKey}-template-${templateIdx}`}
                                      multiple
                                      onChange={(e) => {
                                        const selectedYear = selectedYears[yearKey] ?? row.year;
                                        if (!selectedYear) {
                                          toast({ title: "Select year", description: "Please choose a year before uploading", variant: "destructive" });
                                          e.target.value = "";
                                          return;
                                        }
                                        const sectionName = section.section;
                                        e.target.files && handleFileUpload(document.documentMasterId, e.target.files, selectedYear, sectionName);
                                        // Remove template row after upload (parent should handle this)
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
                                    <label htmlFor={`file-${document.documentMasterId}-${docKey}-template-${templateIdx}`}>
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
                                    {/* Show + button only on the last template row and only if there are no disabled rows and year is selected */}
                                    {templateIdx === (yearRowTemplates[docKey] || []).length - 1 && lastDisabledRowIndex === -1 && effectiveYear && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleAddMultipleYearRowbtn(docKey, document);
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

                          // If no API years and no template rows, render a single blank template row (not in state)
                          if (document.isMultipleYears && apiRows.length === 0 && templateRows.length === 0) {
                            const yearKey = `${docKey}_template_initial`;
                            templateRows = [
                              <TableRow key={docKey + "_template_initial"}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2" style={{ textAlign: 'start' }}>
                                    {document.documentType}
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
                                    {document.isMandatory ? (
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
                                      key={`file-${document.documentMasterId}-${docKey}-template-initial-${selectedYears[yearKey] ?? ''}`}
                                      type="file"
                                      id={`file-${document.documentMasterId}-${docKey}-template-initial`}
                                      multiple
                                      onChange={(e) => {
                                        const selectedYear = selectedYears[yearKey];
                                        if (!selectedYear) {
                                          toast({ title: "Select year", description: "Please choose a year before uploading", variant: "destructive" });
                                          e.target.value = "";
                                          return;
                                        }
                                        const sectionName = section.section;
                                        e.target.files && handleFileUpload(document.documentMasterId, e.target.files, selectedYear, sectionName);
                                        setSelectedYears((prev: any) => {
                                          const updated = { ...prev };
                                          delete updated[yearKey];
                                          return updated;
                                        });
                                      }}
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                    <label htmlFor={`file-${document.documentMasterId}-${docKey}-template-initial`}>
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
                                          handleAddMultipleYearRowbtn(docKey, document);
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