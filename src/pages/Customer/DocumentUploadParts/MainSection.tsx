import React from "react";
import DocumentTable from "./DocumentTable";

interface MainSectionProps {
  orgCategories: any[];
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
  handleAddSection: (categoryName: string) => void;
}

const MainSection: React.FC<MainSectionProps> = ({
  orgCategories,
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
  handleAddSection,
}) => {
  return (
    <>
      {orgCategories.map((category, categoryIndex) => {
        const isMultipleSection = category.isMultipleSection;
        // Get the sections array for this category, or use the original category if no instances exist
        const sections = isMultipleSection && sectionInstances[category.category] 
          ? sectionInstances[category.category] 
          : [category];
        
        return (
          <DocumentTable
            key={categoryIndex}
            category={category}
            categoryIndex={categoryIndex}
            isMultipleSection={isMultipleSection}
            sections={sections}
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
            handleAddSection={handleAddSection}
          />
        );
      })}
    </>
  );
};

export default MainSection; 