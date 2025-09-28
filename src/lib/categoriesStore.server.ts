import fs from 'fs'
import path from 'path'

const STORE_PATH = path.resolve(process.cwd(), 'data', 'categories-store.json')

export async function readCategories(): Promise<unknown[]> {
  try {
    const raw = await fs.promises.readFile(STORE_PATH, 'utf-8')
    return JSON.parse(raw) as unknown[]
  } catch (err) {
    // If file missing, initialize and return empty array
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') {
      await writeCategories([])
      return []
    }
    throw err
  }
}

export async function writeCategories(categories: unknown[]) {
  const dir = path.dirname(STORE_PATH)
  await fs.promises.mkdir(dir, { recursive: true })
  const tmp = STORE_PATH + '.tmp'
  await fs.promises.writeFile(tmp, JSON.stringify(categories, null, 2), 'utf-8')
  await fs.promises.rename(tmp, STORE_PATH)
}
