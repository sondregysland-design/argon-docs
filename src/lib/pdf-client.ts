/**
 * Client-side PDF to image conversion using pdfjs-dist.
 * Renders each page to a browser canvas and exports as JPEG base64.
 * No native dependencies — works everywhere including Vercel.
 */

export async function renderPdfToImages(file: File): Promise<string[]> {
  // Dynamic import to avoid SSR issues (pdfjs-dist needs DOM APIs)
  // @ts-expect-error pdfjs-dist/build/pdf.mjs lacks type declarations
  const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");

  // Use CDN-hosted worker matching the installed pdfjs-dist version
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
    .promise;

  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d")!;

    await page.render({ canvasContext: context, viewport }).promise;

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
    images.push(base64);
  }

  return images;
}
