const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface HotelAnalysisResult {
  rating: number;
  pros: string[];
  cons: string[];
  verdict: string;
  raw_count: number;
}

export interface DocumentAnalysisResult {
  extracted_text: string;
  summary: string;
  document_type: string;
  detected_language: string;
  status: string;
}

const getBaseUrl = () => API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

export const analyzeHotel = async (url: string): Promise<HotelAnalysisResult> => {
  const baseUrl = getBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/reviews/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Analysis Fetch Error:", error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("Cannot connect to backend. Is the server running on http://localhost:8000?");
    }
    throw error;
  }
};

export const analyzeDocument = async (file: File): Promise<DocumentAnalysisResult> => {
  const baseUrl = getBaseUrl();
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const response = await fetch(`${baseUrl}/documents/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Document Analysis Fetch Error:", error);
    throw error;
  }
};
