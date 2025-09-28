import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const name = 'Flipper'
  const email = 'filip@adsomenoise.com'
  const passwordPlain = 'C4lvad0s!'

  const hashed = await bcrypt.hash(passwordPlain, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, password: hashed, role: 'admin', emailVerified: new Date() },
    create: { name, email, password: hashed, role: 'admin', emailVerified: new Date() },
  })

  console.log('Seeded user:', user.email, 'id:', user.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
