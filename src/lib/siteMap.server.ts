import { readdir, stat } from 'fs/promises'
import path from 'path'

const APP_DIR_DEFAULT = path.resolve(process.cwd(), 'src', 'app')

function prettify(segment: string) {
  if (!segment) return 'Home'
  return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

async function hasPageFile(dir: string) {
  const files = await readdir(dir)
  return files.some(f => /^page\.(tsx|jsx|ts|js)$/.test(f))
}

export type SiteMapItem = { path: string; label: string }

export async function getSiteMap(appDir = APP_DIR_DEFAULT): Promise<{ static: SiteMapItem[]; dynamic: SiteMapItem[] }> {
  async function scan(dir: string, base = ''): Promise<SiteMapItem[]> {
    const entries = await readdir(dir)
    const results: SiteMapItem[] = []

    for (const entry of entries) {
      const full = path.join(dir, entry)
      const s = await stat(full)
      if (s.isDirectory()) {
        if (entry === 'api' || entry.startsWith('.')) continue
        if (await hasPageFile(full)) results.push({ path: `${base}/${entry}`, label: prettify(entry) })

        const subEntries = await readdir(full)
        for (const sub of subEntries) {
          const subFull = path.join(full, sub)
          const ss = await stat(subFull)
          if (ss.isDirectory()) {
            if (await hasPageFile(subFull)) results.push({ path: `${base}/${entry}/${sub}`, label: prettify(sub) })
          }
        }
      } else {
        if (/^page\.(tsx|jsx|ts|js)$/.test(entry)) results.push({ path: '/', label: 'Home' })
      }
    }

    return results
  }

  const items = await scan(appDir)
  const unique = Array.from(new Map(items.map(i => [i.path, i])).values())
  unique.sort((a, b) => a.path.localeCompare(b.path))

  const staticRoutes = unique.filter(i => !i.path.includes('[') && !i.path.includes(':'))
  const dynamicRoutes = unique.filter(i => i.path.includes('[') || i.path.includes(':'))

  return { static: staticRoutes, dynamic: dynamicRoutes }
}
