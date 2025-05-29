export const API_BASE_URL = "https://api.foodmenuwebbuilder.technolitics.com/api/v1/foodmenu-website-builder";
export const IMAGE_BASE_URL =
  "https://technolitics-s3-bucket.s3.ap-south-1.amazonaws.com/foodmenu-websitebuilder-s3-bucket/";

// Food type IDs
export const VEG_ONLY_ID = "680b1cf0bf70a3cd573d41e7";
export const NON_VEG_ID = "680aeaef3dcbf10cf2e740eb";
export const EGG_ONLY_ID = "680b1cf0bf70a3cd573d41e6";

// Rating scales
export const RATING_OPTIONS = ["Bad", "Average", "Good", "Best"];

// Store projectId dynamically
let projectId: string | null = null;

export function setProjectId(id: string | null) {
  console.log("setProjectId called with:", id);
  projectId = id;
  // Fallback to localStorage to ensure persistence
  if (typeof window !== "undefined") {
    localStorage.setItem("projectId", id || "");
    console.log("Stored in localStorage:", localStorage.getItem("projectId"));
  }
  console.log("projectId after set:", projectId);
}

export function getProjectId(): string | null {
  console.log("getProjectId called, projectId:", projectId);
  // Fallback to localStorage if projectId is null
  if (!projectId && typeof window !== "undefined") {
    const storedId = localStorage.getItem("projectId");
    console.log("Retrieved from localStorage:", storedId);
    projectId = storedId;
  }
  return projectId;
}