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
  beSections,
  temporarySections,
}) => {

  console.log("=== MainSection Render ===");
  console.log("sectionInstances:", sectionInstances);
  console.log("temporarySections:", temporarySections);
  console.log("beSections:", beSections);

  // Deduplicate categories based on category name
  const uniqueCategories = React.useMemo(() => {
    const seen = new Set();
    return orgCategories.filter(category => {
      const duplicate = seen.has(category.category);
      seen.add(category.category);
      return !duplicate;
    });
  }, [orgCategories]);

  console.log("Unique categories length:", uniqueCategories.length);
  console.log("Unique categories:", uniqueCategories.map(cat => ({
    category: cat.category,
    isMultipleSection: cat.isMultipleSection,
    section: cat.section
  })));

  return (
    <>
      {uniqueCategories.map((category, categoryIndex) => {
        const isMultipleSection = category.isMultipleSection;
        let sections;

        if (isMultipleSection) {
          // Get existing sections from BE
          const existingSections = beSections[category.category] || [];
          
          // Get sections from instances
          const instanceSections = sectionInstances[category.category] || [];
          
          // Start with the base category for Section 1
          sections = [{
            ...category,
            section: "Section 1"
          }];

          // Add additional sections from BE sections (starting from 2)
          existingSections.slice(1).forEach((sectionName, idx) => {
            // Find matching instance or create from template
            const instance = instanceSections.find(s => s.section === sectionName) || {
              ...category,
              section: sectionName
            };
            sections.push(instance);
          });

          // Add temporary section if it exists
          const tempSection = temporarySections[category.category]?.instance;
          if (tempSection) {
            sections.push(tempSection);
          }

          console.log(`Sections for ${category.category}:`, sections.map(s => s.section));
        } else {
          sections = [category];
        }
        
        return (
          <DocumentTable
            key={`${category.category}_${categoryIndex}`}
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