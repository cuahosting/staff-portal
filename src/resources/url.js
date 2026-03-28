// Automatically uses production backend on Vercel builds, localhost for local dev.
export const serverStatus = import.meta.env.MODE === 'production' ? "Production" : "Dev";

export const serverLink = import.meta.env.MODE === 'production'
    ? "https://backend.cosmopolitan.edu.ng:4480/"
    : "http://localhost:4480/";

export const simpleFileUploadAPIKey = "305e0ddf925a3fc5dd34d314f8230349";
export const projectName = "Cosmopolitan University";
export const projectPhone = "+234 805 208 0828";
export const projectEmail = "info@cosmopolitan.edu.ng"
export const projectAddress = "Cosmopolitan University, Abuja";