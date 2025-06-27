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
}) => {
  return (
    <>
      {categories.map((category, categoryIndex) => {
        const isMultipleSection = category.isMultipleSection;
        const instances = isMultipleSection ? (sectionInstances[`promoter${currentPage - 1}_${categoryIndex}`] || 1) : 1;
        return (
          <DocumentTable
            key={categoryIndex}
            category={category}
            categoryIndex={categoryIndex}
            isMultipleSection={isMultipleSection}
            instances={instances}
            sectionInstances={sectionInstances}
            setSectionInstances={setSectionInstances}
            CardKeyPrefix={`promoter${currentPage - 1}`}
            documentYears={documentYears}
            setDocumentYears={setDocumentYears}
            selectedYears={selectedYears}
            setSelectedYears={setSelectedYears}
            currentYear={currentYear}
            handleFileUpload={handleFileUpload}
            getApiFilesForDocument={getApiFilesForDocument}
            uploadingDocuments={uploadingDocuments}
            isPromoter={true}
            currentPage={currentPage}
          />
        );
      })}
    </>
  );
};

export default PromoterSection; 