// Generates all free access links for a paper
export function buildLinks(work) {
  const links = []
  const doi = work.doi?.replace('https://doi.org/', '')
  const bestOa = work.best_oa_location
  const oaUrl = work.open_access?.oa_url

  // 1. Best open access PDF (highest priority)
  if (bestOa?.pdf_url) {
    links.push({ label: '📄 Free PDF', href: bestOa.pdf_url, type: 'primary' })
  } else if (oaUrl) {
    links.push({ label: '🔓 Free Access', href: oaUrl, type: 'primary' })
  }

  // 2. arXiv link
  if (oaUrl?.includes('arxiv.org')) {
    if (!links.find(l => l.href === oaUrl)) {
      links.push({ label: 'arXiv', href: oaUrl, type: 'arxiv' })
    }
  }

  // 3. Unpaywall by DOI
  if (doi) {
    links.push({ label: 'Unpaywall', href: `https://unpaywall.org/${doi}`, type: 'secondary' })
  }

  // 4. OpenAlex page
  if (work.id) {
    links.push({ label: 'OpenAlex', href: work.id, type: 'green' })
  }

  // 5. CORE fallback
  links.push({
    label: 'CORE',
    href: `https://core.ac.uk/search?q=${encodeURIComponent(work.title || '')}`,
    type: 'secondary'
  })

  return links
}