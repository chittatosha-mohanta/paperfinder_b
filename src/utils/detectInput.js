// Detects if user typed a DOI or plain text
export function detectInput(query) {
  const doi = query.trim()
  if (/^10\.\d{4,}\/\S+/.test(doi)) return 'doi'
  return 'text'
}