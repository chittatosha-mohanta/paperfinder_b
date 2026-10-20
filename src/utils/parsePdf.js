import * as pdfjsLib from 'pdfjs-dist'

// Tell pdfjs where its worker file is
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

export async function extractTextFromPdf(file) {
  // Convert file to array buffer
  const arrayBuffer = await file.arrayBuffer()

  // Load the PDF
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ''

  // Read first 3 pages only (enough to get title + abstract)
  const pagesToRead = Math.min(3, pdf.numPages)

  for (let i = 1; i <= pagesToRead; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += pageText + ' '
  }

  // Return first 800 characters — title + abstract area
  return fullText.slice(0, 800).trim()
}