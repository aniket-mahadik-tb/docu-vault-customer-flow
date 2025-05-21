
/**
 * Utility for mapping document types to realistic preview samples
 */

// Map common document names/types to their sample previews
const documentPreviewMap: Record<string, string> = {
  // KYC documents
  "aadhar": "/samples/aadhar-card-sample.jpg",
  "aadhaar": "/samples/aadhar-card-sample.jpg",
  "pan": "/samples/pan-card-sample.jpg",
  "pancard": "/samples/pan-card-sample.jpg",
  "passport": "/samples/passport-sample.jpg",
  "driving": "/samples/driving-license-sample.jpg",
  "license": "/samples/driving-license-sample.jpg",
  "voter": "/samples/voter-id-sample.jpg",
  
  // Financial documents
  "bank": "/samples/bank-statement-sample.pdf",
  "statement": "/samples/bank-statement-sample.pdf",
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
  // Consider both .pdf extension and bank statement (which may appear as .png in our sample)
  if (url.toLowerCase().endsWith('.pdf')) return true;
  
  // Special case for bank statement sample which might be a PNG but we want to treat as PDF
  if (url.toLowerCase().includes('bank-statement-sample')) return false;
  
  return false;
};

/**
 * Helper to determine if a document is in development/sample mode
 * @returns boolean indicating if we're using sample previews
 */
export const usingSamplePreviews = (): boolean => {
  // In a real app, this might be configuration-driven
  return true;
};
