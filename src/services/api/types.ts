// src/services/api/types.ts
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
  }
  
  export interface ApiError {
    message: string;
    code?: string;
    details?: any;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
  }
  
 