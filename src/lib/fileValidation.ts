// src/lib/fileValidation.ts

/**
 * Allowed file types for upload
 */
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain', // .txt
    'text/markdown', // .md
  ];
  
  /**
   * Allowed file extensions
   */
  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.md'];
  
  /**
   * Maximum file size in bytes (10MB)
   */
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  
  /**
   * File validation result interface
   */
  export interface FileValidationResult {
    valid: boolean;
    error?: string;
  }
  
  /**
   * Get file extension from filename
   */
  const getFileExtension = (filename: string): string => {
    return filename.slice(filename.lastIndexOf('.')).toLowerCase();
  };
  
  /**
   * Format bytes to human readable size
   */
  export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };
  
  /**
   * Validate file type, size, and extension
   * @param file - The file to validate
   * @returns FileValidationResult with validation status and error message
   */
  export const validateFile = (file: File): FileValidationResult => {
    // Check if file exists
    if (!file) {
      return {
        valid: false,
        error: 'No file selected',
      };
    }
  
    // Check file extension
    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }
  
    // Check MIME type
    if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
      // Some browsers don't set MIME type for .md files, so we allow empty type if extension is valid
      return {
        valid: false,
        error: 'Invalid file format. Please upload PDF, DOC, DOCX, TXT, or MD files.',
      };
    }
  
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)} (${formatFileSize(file.size)} uploaded).`,
      };
    }
  
    // Check for empty file
    if (file.size === 0) {
      return {
        valid: false,
        error: 'File is empty. Please select a valid file.',
      };
    }
  
    // All validations passed
    return {
      valid: true,
    };
  };
  
  /**
   * Validate multiple files at once
   * @param files - Array of files to validate
   * @returns Array of validation results
   */
  export const validateFiles = (files: File[]): FileValidationResult[] => {
    return files.map(file => validateFile(file));
  };
  
  /**
   * Check if file extension is allowed
   * @param filename - The filename to check
   * @returns boolean indicating if extension is allowed
   */
  export const isAllowedExtension = (filename: string): boolean => {
    const extension = getFileExtension(filename);
    return ALLOWED_EXTENSIONS.includes(extension);
  };
  
  /**
   * Check if file MIME type is allowed
   * @param mimeType - The MIME type to check
   * @returns boolean indicating if MIME type is allowed
   */
  export const isAllowedMimeType = (mimeType: string): boolean => {
    return ALLOWED_TYPES.includes(mimeType);
  };
  
  /**
   * Get a user-friendly error message for file validation
   * @param file - The file that failed validation
   * @returns A descriptive error message
   */
  export const getFileErrorMessage = (file: File): string => {
    const result = validateFile(file);
    return result.error || 'Unknown validation error';
  };
  
  /**
   * Constants export for external use
   */
  export const FILE_VALIDATION_CONSTANTS = {
    ALLOWED_TYPES,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    MAX_FILE_SIZE_MB: MAX_FILE_SIZE / (1024 * 1024),
  } as const;