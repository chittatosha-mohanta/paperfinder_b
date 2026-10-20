// Main search function — talks to OpenAlex API
const FIELDS = [
  'id', 'doi', 'title', 'authorships',
  'publication_year', 'primary_location',
  'open_access', 'cited_by_count',
  'abstract_inverted_index', 'best_oa_location'
].join(',')

// Rebuilds abstract from OpenAlex's special format
export function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return null
  try {
    const positions = []
    for (const [word, locs] of Object.entries(invertedIndex)) {
      for (const pos of locs) positions.push({ pos, word })
    }
    positions.sort((a, b) => a.pos - b.pos)
    return positions.map(p => p.word).join(' ')
  } catch {
    return null
  }
}

// Search papers by text query
export async function searchPapers(query, page = 1, yearFilter = null) {
  let url = `https://api.openalex.org/works`
    + `?search=${encodeURIComponent(query)}`
    + `&page=${page}&per-page=10`
    + `&select=${FIELDS}`
    + `&mailto=paperfinder@app.com`

  if (yearFilter) url += `&filter=publication_year:${yearFilter}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// Search paper by DOI directly
export async function searchByDOI(doi) {
  const clean = doi.replace('https://doi.org/', '')
  const url = `https://api.openalex.org/works/doi:${clean}?select=${FIELDS}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`DOI not found: ${res.status}`)
  const data = await res.json()
  return { results: [data], meta: { count: 1 } }
}

// Normalize raw API data into clean format
export function normalizePaper(work) {
  return {
    id: work.id,
    doi: work.doi?.replace('https://doi.org/', ''),
    title: work.title || 'Untitled',
    year: work.publication_year,
    authors: (work.authorships || [])
      .slice(0, 5)
      .map(a => a.author?.display_name)
      .filter(Boolean),
    moreAuthors: (work.authorships || []).length > 5,
    abstract: reconstructAbstract(work.abstract_inverted_index),
    isOpenAccess: work.open_access?.is_oa,
    citations: work.cited_by_count || 0,
    venue: work.primary_location?.source?.display_name,
    open_access: work.open_access,
    best_oa_location: work.best_oa_location,
  }
}