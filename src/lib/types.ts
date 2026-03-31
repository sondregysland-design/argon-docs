export interface ExtractedField {
  name: string;
  value: string | null;
  confidence: number;
}

export interface Page {
  pageNumber: number;
  imageBase64?: string | null;
  pageData: ExtractedField[] | null;
  confidence: number | null;
}

export interface ExtractionData {
  id: string;
  fileName: string;
  templateName: string | null;
  status: string;
  confidence: number | null;
  extractedData: ExtractedField[] | null;
  pageCount: number;
  pages: Page[];
  errorMessage?: string | null;
}
