// Template extraction utilities for Document Master API response

// Extracts promoter template from API response
export function extractPromoterTemplate(apiData: any[]) {
  if (!Array.isArray(apiData)) return null;
  
  // Find all promoters (customerType starts with 'promoter', case-insensitive)
  const promoterEntries = apiData.filter(
    (item: any) =>
      typeof item.customerType === 'string' &&
      item.customerType.replace(/\s+/g, '').toLowerCase().startsWith('promoter')
  );

  // Always use promoter 1 (first promoter entry) as the template for blank promoters
  const promoter1Obj = promoterEntries.find(
    (item: any) =>
      item.customerType &&
      item.customerType.replace(/\s+/g, '').toLowerCase() === 'promoter1'
  );
  
  if (!promoter1Obj) {
    console.log('No promoter 1 found in API data');
    return null;
  }

  // Deep copy and empty all files arrays for template
  const deepEmptyPromoter = JSON.parse(JSON.stringify(promoter1Obj));
  deepEmptyPromoter.documentsByCategory = deepEmptyPromoter.documentsByCategory.map((cat: any) => ({
    ...cat,
    documents: cat.documents.map((doc: any) => ({
      ...doc,
      files: []
    }))
  }));
  
  return deepEmptyPromoter;
}

// Extracts section templates from API response
export function extractSectionTemplates(apiData: any[]) {
  if (!Array.isArray(apiData)) return {};
  
  const sectionTemplates: Record<string, any> = {};
  
  apiData.forEach((customerTypeObj) => {
    if (!customerTypeObj.documentsByCategory || !Array.isArray(customerTypeObj.documentsByCategory)) {
      return;
    }
    
    customerTypeObj.documentsByCategory
      .filter((cat: any) => cat.isMultipleSection === true)
      .forEach((cat: any) => {
        // Deep copy and empty all files arrays for template
        const cleanCategory = {
          ...cat,
          documents: cat.documents.map((doc: any) => ({
            ...doc,
            files: []
          }))
        };
        sectionTemplates[cat.category] = cleanCategory;
      });
  });
  
  return sectionTemplates;
}

// Extracts both promoter and section templates in one call
export function extractAllTemplates(apiData: any[]) {
  const promoterTemplate = extractPromoterTemplate(apiData);
  const sectionTemplates = extractSectionTemplates(apiData);
  
  return {
    promoterTemplate,
    sectionTemplates
  };
} 