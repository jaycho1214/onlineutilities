import { toast } from "sonner";

export class NotepadError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = "NotepadError";
  }
}

export const ErrorCodes = {
  CREATE_FAILED: "CREATE_FAILED",
  UPDATE_FAILED: "UPDATE_FAILED",
  DELETE_FAILED: "DELETE_FAILED",
  LOAD_FAILED: "LOAD_FAILED",
  STORAGE_FULL: "STORAGE_FULL",
  INVALID_DATA: "INVALID_DATA",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

export function handleNotepadError(error: unknown, operation: string) {
  console.error(`Notepad ${operation} error:`, error);
  
  if (error instanceof NotepadError) {
    toast.error(error.userMessage || error.message);
    return;
  }
  
  if (error instanceof DOMException) {
    if (error.name === "QuotaExceededError") {
      toast.error("Storage is full. Please delete some notes to continue.");
      return;
    }
  }
  
  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch")) {
      toast.error("Network error. Please check your connection.");
      return;
    }
    
    toast.error(`${operation} failed: ${error.message}`);
    return;
  }
  
  toast.error(`${operation} failed. Please try again.`);
}

export function showSuccessToast(message: string) {
  toast.success(message);
}

export function showInfoToast(message: string) {
  toast.info(message);
}

export function showWarningToast(message: string) {
  toast.warning(message);
}