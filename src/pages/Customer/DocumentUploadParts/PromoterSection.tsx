import React from "react";
import DocumentTable from "./DocumentTable";

interface PromoterSectionProps {
  promoter: any;
  categories: any[];
  sectionInstances: any;
  setSectionInstances: any;
  documentYears: any;
  setDocumentYears: any;
  selectedYears: any;
  setSelectedYears: any;
  currentYear: number;
  handleFileUpload: any;
  getApiFilesForDocument: any;
  uploadingDocuments: any;
  currentPage: number;
  handleAddSection: (categoryName: string) => void;
}

const PromoterSection: React.FC<PromoterSectionProps> = ({
  promoter,
  categories,
  sectionInstances,
  setSectionInstances,
  documentYears,
  setDocumentYears,
  selectedYears,
  setSelectedYears,
  currentYear,
  handleFileUpload,
  getApiFilesForDocument,
  uploadingDocuments,
  currentPage,
  handleAddSection,
}) => {
  return (
    <>
      {categories.map((category, categoryIndex) => {
        const isMultipleSection = category.isMultipleSection;
        // Get the sections array for this category, or use the original category if no instances exist
        const categoryKey = `promoter${currentPage - 1}_${category.category}`;
        const sections = isMultipleSection && sectionInstances[categoryKey] 
          ? sectionInstances[categoryKey] 
          : [category];
        
        const handlePromoterFileUpload = (documentId: string, files: FileList, year?: number) => {
          handleFileUpload(documentId, files, year, `Promoter ${currentPage}`);
        };
        
        return (
          <DocumentTable
            key={categoryIndex}
            category={category}
            categoryIndex={categoryIndex}
            isMultipleSection={isMultipleSection}
            sections={sections}
            sectionInstances={sectionInstances}
            setSectionInstances={setSectionInstances}
            CardKeyPrefix={`promoter${currentPage - 1}`}
            documentYears={documentYears}
            setDocumentYears={setDocumentYears}
            selectedYears={selectedYears}
            setSelectedYears={setSelectedYears}
            currentYear={currentYear}
            handleFileUpload={handlePromoterFileUpload}
            getApiFilesForDocument={getApiFilesForDocument}
            uploadingDocuments={uploadingDocuments}
            isPromoter={true}
            currentPage={currentPage}
            handleAddSection={handleAddSection}
          />
        );
      })}
    </>
  );
};

export default PromoterSection; 