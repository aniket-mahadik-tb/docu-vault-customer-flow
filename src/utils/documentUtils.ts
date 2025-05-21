
// Utility function to convert base64/dataURL to Blob
export const dataURLtoBlob = (dataURL: string): Blob | null => {
  try {
    // Convert base64/URL data to blob
    const arr = dataURL.split(',');
    if (arr.length < 2) return null;
    
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  } catch (error) {
    console.error("Error converting data URL to blob:", error);
    return null;
  }
};

// Storage management
export const STORAGE_KEY = "document_storage";
export const STORAGE_META_KEY = "document_storage_meta";
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_TOTAL_STORAGE = 4 * 1024 * 1024; // 4MB

// Get file data from storage
export const getFileData = (fileId: string): string | null => {
  try {
    const storageData = localStorage.getItem(STORAGE_KEY);
    if (!storageData) return null;
    
    const fileStorage = JSON.parse(storageData);
    return fileStorage[fileId] || null;
  } catch (error) {
    console.error("Failed to get file data:", error);
    return null;
  }
};

// Save file data to storage
export const saveFileData = (fileId: string, dataUrl: string): boolean => {
  try {
    // Get current storage
    const storageData = localStorage.getItem(STORAGE_KEY);
    let fileStorage: Record<string, string> = {};
    
    if (storageData) {
      fileStorage = JSON.parse(storageData);
    }
    
    // Add new file
    fileStorage[fileId] = dataUrl;
    
    // Save back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fileStorage));
    
    return true;
  } catch (error) {
    console.error("Failed to save file data:", error);
    return false;
  }
};

// Remove file data from storage
export const removeFileData = (fileId: string): boolean => {
  try {
    const storageData = localStorage.getItem(STORAGE_KEY);
    if (!storageData) return true;
    
    const fileStorage = JSON.parse(storageData);
    if (fileStorage[fileId]) {
      delete fileStorage[fileId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fileStorage));
    }
    
    return true;
  } catch (error) {
    console.error("Failed to remove file data:", error);
    return false;
  }
};
