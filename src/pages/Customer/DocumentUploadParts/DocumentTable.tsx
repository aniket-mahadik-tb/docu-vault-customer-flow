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

const DocumentTable: React.FC<DocumentTableProps> = React.memo( ({
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
    if(category.category === "DETAILS OF THE COLLATERAL SECURITY") {
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
    
    if(category.category === "DETAILS OF THE COLLATERAL SECURITY") {
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
    
    if(category.category === "DETAILS OF THE COLLATERAL SECURITY") {
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
  const handleAddMultipleYearRowbtn = (key: string) => {
    setDocumentYears((prev: any) => ({
      ...prev,
      [key]: [...(prev[key] || []), undefined],
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
        
        if(category.category === "DETAILS OF THE COLLATERAL SECURITY") {
          console.log("Rendering section:", {
            sectionNumber: currentSectionNumber,
            isLastSection,
            hasTemporarySection: temporarySections[category.category] !== null
          });
        }
        
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
                    {section.documents.map((document: any) => {
                      const docKey = isPromoter
                        ? `${document.documentMasterId}_promoter${currentPage - 1}_${section.section}_${instanceIdx}`
                        : `${document.documentMasterId}_${section.section}_${instanceIdx}`;
                      // Build the list of years to render rows for
                      let years: (number | undefined)[];
                      if (document.isMultipleYears) {
                        const apiYear = document.year ? parseInt(document.year, 10) : undefined;
                        const localYears = documentYears[docKey] || [];
                        years = [...new Set([apiYear, ...localYears].filter((y) => y !== undefined))] as number[];
                        if (years.length === 0) years.push(undefined);
                      } else {
                        years = [undefined];
                      }
                      const sectionName = section.section;  // Use the actual section name from the data
                      const isMultipleFiles = document.isMultipleFiles;

                      // Build a Set of years already chosen/uploaded for this document
                      const usedYears = new Set<number>();
                      if (document.year) {
                        usedYears.add(parseInt(document.year, 10));
                      }
                      (documentYears[docKey] || []).forEach((y: number) => usedYears.add(y));
                      years.forEach((y) => { if (y !== undefined) usedYears.add(y); });

                      return years.map((year: any, yearIdx: number) => {
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
                                        {/* Show plus icon for uploading more files */}
                                        {isMultipleFiles && fileIndex === filesRef2.length - 1 && (
                                          <>
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
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0 text-blue-600 ml-2 rounded-full border border-blue-200 bg-blue-50"
                                              aria-label="Add more files"
                                              onClick={() => window.document.getElementById(`file-${document.documentMasterId}-${docKey}-${yearIdx}`)?.click()}
                                            >
                                              <Plus className="h-4 w-4" />
                                            </Button>
                                          </>
                                        )}
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
                                {/* Always render the + button, but hide it if not needed for consistent spacing */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddMultipleYearRowbtn(docKey)}
                                  className={`border-gray-300 hover:border-gray-400 hover:bg-gray-50 ${(document.isMultipleYears && yearIdx === years.length - 1) ? '' : 'invisible'}`}
                                  aria-label="Add Year"
                                >
                                  +
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })}
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