
/**
 * Utility for mapping document types to realistic preview samples
 */

// Map common document names/types to their sample previews
const documentPreviewMap: Record<string, string> = {
  // KYC documents
  "aadhar": "/lovable-uploads/ee24a3e8-e80f-4791-9af4-b78283b843b5.png",
  "aadhaar": "/lovable-uploads/ee24a3e8-e80f-4791-9af4-b78283b843b5.png",
  "pan": "/lovable-uploads/10b1e398-0dfc-4ede-9504-a7c4be863e24.png",
  "pancard": "/lovable-uploads/10b1e398-0dfc-4ede-9504-a7c4be863e24.png",
  "passport": "/samples/passport-sample.jpg",
  "driving": "/samples/driving-license-sample.jpg",
  "license": "/samples/driving-license-sample.jpg",
  "voter": "/samples/voter-id-sample.jpg",
  
  // Financial documents
  "bank": "/lovable-uploads/7a4a56e7-77df-4e36-bcd7-049f07e5e1ef.png",
  "statement": "/lovable-uploads/7a4a56e7-77df-4e36-bcd7-049f07e5e1ef.png",
  "income": "/samples/income-tax-return-sample.pdf",
  "tax": "/samples/income-tax-return-sample.pdf",
  "itr": "/samples/income-tax-return-sample.pdf",
  "salary": "/samples/salary-slip-sample.pdf",
  "slip": "/samples/salary-slip-sample.pdf",
  "invoice": "/samples/invoice-sample.pdf",
  
  // Business documents
  "gst": "/samples/gst-certificate-sample.pdf",
  "certificate": "/samples/certificate-sample.pdf",
  "registration": "/samples/registration-certificate-sample.pdf",
  "incorporation": "/samples/incorporation-certificate-sample.pdf",
  "address": "/samples/address-proof-sample.jpg",
  "utility": "/samples/utility-bill-sample.pdf",
  "electricity": "/samples/electricity-bill-sample.pdf",
  "shop": "/samples/shop-establishment-sample.pdf",
  
  // Default samples by extension
  "_default_pdf": "/samples/default-document-sample.pdf",
  "_default_image": "/samples/default-image-sample.jpg"
};

/**
 * Get a sample preview URL for a document based on its name and type
 * @param fileName Original filename of the document
 * @param fileType MIME type or extension of the document
 * @returns URL to sample document image/PDF
 */
export const getSamplePreviewUrl = (fileName: string, fileType?: string): string => {
  // Convert to lowercase for matching
  const nameLower = fileName.toLowerCase();
  
  // Special cases for our three main document types
  if (nameLower.includes('aadhar') || nameLower.includes('aadhaar')) {
    return documentPreviewMap['aadhar'];
  }
  
  if (nameLower.includes('pan')) {
    return documentPreviewMap['pan'];
  }
  
  if (nameLower.includes('bank') || nameLower.includes('statement')) {
    return documentPreviewMap['bank'];
  }
  
  // Try to find a matching sample based on keywords in the filename
  for (const [keyword, sampleUrl] of Object.entries(documentPreviewMap)) {
    if (nameLower.includes(keyword)) {
      return sampleUrl;
    }
  }
  
  // If no match found, use default based on file extension
  if (fileType?.includes('pdf') || nameLower.endsWith('.pdf')) {
    return documentPreviewMap['_default_pdf'];
  }
  
  // Default to image sample for other types
  return documentPreviewMap['_default_image'];
};

/**
 * Check if a file needs a PDF viewer
 * @param url File URL or path
 * @returns boolean indicating if PDF viewer should be used
 */
export const isPdfPreview = (url: string): boolean => {
  // For our specific use case, we're treating all three main document types as images
  if (url.includes('ee24a3e8-e80f-4791-9af4-b78283b843b5') || // Aadhaar card
      url.includes('10b1e398-0dfc-4ede-9504-a7c4be863e24') || // PAN card
      url.includes('7a4a56e7-77df-4e36-bcd7-049f07e5e1ef')) { // Bank statement
    return false;
  }
  
  // For all other documents, check file extension
  return url.toLowerCase().endsWith('.pdf');
};

/**
 * Helper to determine if a document is in development/sample mode
 * @returns boolean indicating if we're using sample previews
 */
export const usingSamplePreviews = (): boolean => {
  // In a real app, this might be configuration-driven
  return true;
};
