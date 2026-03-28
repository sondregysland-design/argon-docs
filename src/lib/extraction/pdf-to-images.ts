/**
 * Server-side PDF to image conversion using pdfjs-dist.
 * Converts each page of a PDF to a base64-encoded PNG image.
 */

export async function pdfToImages(
  pdfBuffer: ArrayBuffer
): Promise<string[]> {
  // Dynamic import for server-side usage
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
    useSystemFonts: true,
  }).promise;

  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // High res for better extraction

    // Use OffscreenCanvas for Node.js compatibility or fallback
    const { createCanvas } = await import("canvas").catch(() => {
      throw new Error(
        "canvas package required for server-side PDF rendering. Run: npm install canvas"
      );
    });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render as any)({
      canvasContext: context,
      viewport,
    }).promise;

    const dataUrl = canvas.toDataURL("image/png");
    // Strip the data:image/png;base64, prefix
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    images.push(base64);
  }

  return images;
}

export async function getPdfPageCount(pdfBuffer: ArrayBuffer): Promise<number> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
  }).promise;
  return pdf.numPages;
}
