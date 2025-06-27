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
}) => {
  return (
    <>
      {orgCategories.map((category, categoryIndex) => {
        const isMultipleSection = category.isMultipleSection;
        const instances = isMultipleSection ? (sectionInstances[categoryIndex] || 1) : 1;
        return (
          <DocumentTable
            key={categoryIndex}
            category={category}
            categoryIndex={categoryIndex}
            isMultipleSection={isMultipleSection}
            instances={instances}
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
        );
      })}
    </>
  );
};

export default MainSection; 