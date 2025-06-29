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
  getApiFilesForDocument: (documentMasterId: string, category: string, year?: number | string, promoterIndex?: number, section?: any) => any[];
  uploadingDocuments: any;
  handleAddSection: (categoryName: string) => void;
  beSections: { [category: string]: string[] };
  temporarySections: { [category: string]: { name: string; instance: any } | null };
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
  beSections,  //that one which is going to repeat
  temporarySections,
}) => {


  console.log("orgCategories", orgCategories);

  return (
    <>
      {orgCategories.map((category, categoryIndex) => {
        const isMultipleSection = category.isMultipleSection;
        // Get the sections array for this category
        let sections;
        if (isMultipleSection) {
          // First check if this category has any temporary sections
          const hasTemporarySection = temporarySections[category.category] !== null;
          
          if (hasTemporarySection) {
            // If we have a temporary section, include it
            sections = [category, ...sectionInstances[category.category] || []];
          } else {
            // If no temporary section, just use the category as is from API
            sections = [category];
          }
        } else {
          // For non-multiple sections, just use the category
          sections = [category];
        }
        
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
            beSections={beSections}
            temporarySections={temporarySections}
          />
        );
      })}
    </>
  );
};

export default MainSection; 