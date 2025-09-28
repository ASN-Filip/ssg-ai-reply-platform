import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getSiteMap } from '../src/lib/siteMap.server.js'

async function main() {
  const map = await getSiteMap()
  const out = path.resolve(process.cwd(), 'node_modules', '.cache')
  await mkdir(out, { recursive: true })
  await writeFile(path.join(out, 'site-map.json'), JSON.stringify(map, null, 2), 'utf-8')
  console.log('site-map written')
}

main().catch(err => { console.error(err); process.exit(1) })
