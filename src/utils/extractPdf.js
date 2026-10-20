const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://web-production-4afc.up.railway.app'

export async function extractTextFromPDF(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BACKEND_URL}/extract-pdf`, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Could not extract text from PDF.')
  }

  return data.query
}