import fs from 'fs'
import path from 'path'

const STORE_PATH = path.resolve(process.cwd(), 'data', 'products-store.json')

export async function readProducts(): Promise<unknown[]> {
  try {
    const raw = await fs.promises.readFile(STORE_PATH, 'utf-8')
    return JSON.parse(raw) as unknown[]
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') {
      await writeProducts([])
      return []
    }
    throw err
  }
}

export async function writeProducts(products: unknown[]) {
  const dir = path.dirname(STORE_PATH)
  await fs.promises.mkdir(dir, { recursive: true })
  const tmp = STORE_PATH + '.tmp'
  await fs.promises.writeFile(tmp, JSON.stringify(products, null, 2), 'utf-8')
  await fs.promises.rename(tmp, STORE_PATH)
}
