// Generates APA and BibTeX citations from paper data
export function formatAPA(paper) {
  const authors = (paper.authors || [])
    .map(a => {
      const parts = a.split(' ')
      const last = parts[parts.length - 1]
      const initials = parts.slice(0, -1).map(p => p[0] + '.').join(' ')
      return `${last}, ${initials}`
    })
    .join(', ')

  const year = paper.year || 'n.d.'
  const title = paper.title || 'Untitled'
  const venue = paper.venue || ''
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : ''

  return `${authors} (${year}). ${title}. ${venue}. ${doi}`.trim()
}

export function formatBibTeX(paper) {
  const key = (paper.authors?.[0]?.split(' ').pop() || 'Author') +
    (paper.year || 'XXXX') +
    (paper.title?.split(' ')[0] || 'title')

  const authors = (paper.authors || []).join(' and ')
  const doi = paper.doi || ''

  return `@article{${key},
  author    = {${authors}},
  title     = {${paper.title || ''}},
  journal   = {${paper.venue || ''}},
  year      = {${paper.year || ''}},
  doi       = {${doi}}
}`
}