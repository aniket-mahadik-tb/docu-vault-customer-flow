
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { DocumentFile, DocumentFolder, DocumentRoot, DocumentContextType } from "@/types/document";
import { dataURLtoBlob, getFileData, saveFileData, removeFileData, STORAGE_KEY, STORAGE_META_KEY, MAX_FILE_SIZE, MAX_TOTAL_STORAGE } from "@/utils/documentUtils";
import { useBlobUrls } from "@/hooks/useBlobUrls";

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Record<string, DocumentRoot>>({});
  const [storageUsage, setStorageUsage] = useState<number>(0);
  const { trackBlobUrl, revokeBlobUrl } = useBlobUrls();

  // Load documents metadata from localStorage on mount
  useEffect(() => {
    const storedMetaData = localStorage.getItem(STORAGE_META_KEY);
    if (storedMetaData) {
      try {
        setDocuments(JSON.parse(storedMetaData));
      } catch (error) {
        console.error("Failed to parse stored document metadata:", error);
      }
    }
  }, []);

  // Save document metadata to localStorage whenever they change
  useEffect(() => {
    try {
      // Only store the metadata (not the actual file contents)
      localStorage.setItem(STORAGE_META_KEY, JSON.stringify(documents));
      
      // Update storage usage estimate
      calculateStorageUsage();
    } catch (error) {
      console.error("Failed to save document metadata:", error);
      toast({
        title: "Storage Error",
        description: "Failed to save document information. Storage might be full.",
        variant: "destructive",
      });
    }
  }, [documents]);

  // Calculate current storage usage
  const calculateStorageUsage = () => {
    try {
      const metaSize = localStorage.getItem(STORAGE_META_KEY)?.length || 0;
      const dataSize = localStorage.getItem(STORAGE_KEY)?.length || 0;
      const totalSize = metaSize + dataSize;
      
      setStorageUsage(totalSize);
      
      // Warn if storage is getting full
      if (totalSize > MAX_TOTAL_STORAGE * 0.8) {
        toast({
          title: "Storage Warning",
          description: "You're approaching the storage limit. Consider removing old documents.",
          variant: "default",
        });
      }
      
      return totalSize;
    } catch (error) {
      console.error("Error calculating storage usage:", error);
      return 0;
    }
  };

  const addDocument = async (userId: string, folder: string, file: File): Promise<DocumentFile> => {
    return new Promise((resolve, reject) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          variant: "destructive",
        });
        reject(new Error("File too large"));
        return;
      }
      
      const fileReader = new FileReader();
      
      fileReader.onload = (e) => {
        const fileId = `${Date.now()}-${file.name}`;
        const fileDataUrl = e.target?.result as string;
        
        try {
          // First attempt to save the file data
          const savedSuccessfully = saveFileData(fileId, fileDataUrl);
          if (!savedSuccessfully) {
            reject(new Error("Failed to save file data. Storage might be full."));
            return;
          }
          
          const newFile: DocumentFile = {
            id: fileId,
            name: file.name,
            type: file.type,
            size: file.size,
            url: fileId, // Store just the ID reference, not the full data
            lastModified: file.lastModified,
            uploaded: new Date(),
          };
          
          setDocuments(prev => {
            const updatedDocs = { ...prev };
            
            // Create user root folder if it doesn't exist
            if (!updatedDocs[userId]) {
              updatedDocs[userId] = { userId, folders: {} };
            }
            
            // Create document folder if it doesn't exist
            if (!updatedDocs[userId].folders[folder]) {
              updatedDocs[userId].folders[folder] = { 
                name: folder, 
                files: [], 
                submitted: false 
              };
            }
            
            // Add file to folder
            updatedDocs[userId].folders[folder].files.push(newFile);
            
            return updatedDocs;
          });
          
          resolve(newFile);
        } catch (error) {
          console.error("Error saving document:", error);
          reject(error);
        }
      };
      
      fileReader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      
      fileReader.readAsDataURL(file);
    });
  };

  const removeDocument = (userId: string, folder: string, fileId: string) => {
    // First remove the file data from storage
    removeFileData(fileId);
    
    // Then update the document list
    setDocuments(prev => {
      const updatedDocs = { ...prev };
      
      if (updatedDocs[userId] && updatedDocs[userId].folders[folder]) {
        // First check for any Blob URLs to revoke
        const files = updatedDocs[userId].folders[folder].files;
        const fileToRemove = files.find(file => file.id === fileId);
        
        if (fileToRemove?.isBlobUrl && fileToRemove.url.startsWith('blob:')) {
          revokeBlobUrl(fileToRemove.url);
        }
        
        updatedDocs[userId].folders[folder].files = files.filter(file => file.id !== fileId);
      }
      
      return updatedDocs;
    });
  };

  const submitFolder = (userId: string, folder: string) => {
    setDocuments(prev => {
      const updatedDocs = { ...prev };
      
      if (updatedDocs[userId] && updatedDocs[userId].folders[folder]) {
        updatedDocs[userId].folders[folder].submitted = true;
      }
      
      return updatedDocs;
    });
  };

  // Enhanced getFolderDocuments function that converts file data to Blob URLs
  const getFolderDocuments = (userId: string, folder: string): DocumentFile[] => {
    if (documents[userId] && documents[userId].folders[folder]) {
      // First revoke any previously created Blob URLs to prevent memory leaks
      documents[userId].folders[folder].files.forEach(file => {
        if (file.isBlobUrl && file.url.startsWith('blob:')) {
          revokeBlobUrl(file.url);
        }
      });
      
      // For each document, if it's just an ID reference, get the actual file data
      return documents[userId].folders[folder].files.map(file => {
        // If the URL is just an ID (not a data URL or blob URL), replace with the actual data
        if (!file.url.startsWith('data:') && !file.url.startsWith('blob:')) {
          const fileData = getFileData(file.id);
          if (fileData) {
            // Convert data URL to Blob URL for better performance
            const blob = dataURLtoBlob(fileData);
            if (blob) {
              // Create a Blob URL from the blob
              const blobUrl = trackBlobUrl(URL.createObjectURL(blob));
              return { ...file, url: blobUrl, isBlobUrl: true };
            }
            return { ...file, url: fileData };
          }
        }
        return file;
      });
    }
    return [];
  };

  const isFolderSubmitted = (userId: string, folder: string): boolean => {
    if (documents[userId] && documents[userId].folders[folder]) {
      return documents[userId].folders[folder].submitted;
    }
    return false;
  };

  const clearUserDocuments = (userId: string) => {
    // Remove all file data for this user
    if (documents[userId]) {
      const userFolders = documents[userId].folders || {};
      Object.values(userFolders).forEach(folder => {
        folder.files.forEach(file => {
          removeFileData(file.id);
          
          // Also revoke any Blob URLs
          if (file.isBlobUrl && file.url.startsWith('blob:')) {
            revokeBlobUrl(file.url);
          }
        });
      });
    }
    
    // Remove user from documents
    setDocuments(prev => {
      const updatedDocs = { ...prev };
      delete updatedDocs[userId];
      return updatedDocs;
    });
  };

  const clearFolderDocuments = (userId: string, folder: string) => {
    setDocuments(prev => {
      const updatedDocs = { ...prev };
      
      if (updatedDocs[userId] && updatedDocs[userId].folders[folder]) {
        // Remove all file data from storage for this folder and revoke Blob URLs
        updatedDocs[userId].folders[folder].files.forEach(file => {
          removeFileData(file.id);
          
          if (file.isBlobUrl && file.url.startsWith('blob:')) {
            revokeBlobUrl(file.url);
          }
        });
        
        // Clear files array and reset submitted status
        updatedDocs[userId].folders[folder].files = [];
        updatedDocs[userId].folders[folder].submitted = false;
      }
      
      return updatedDocs;
    });
  };

  return (
    <DocumentContext.Provider 
      value={{ 
        documents, 
        addDocument, 
        removeDocument, 
        submitFolder, 
        getFolderDocuments, 
        isFolderSubmitted, 
        clearUserDocuments,
        clearFolderDocuments 
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
};
