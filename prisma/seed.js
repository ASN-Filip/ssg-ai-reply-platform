import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categoriesSeed = [
  {
    name: 'Televisions',
    categoryId: 'televisions',
    categoryType: 'product',
    label: 'Televisions',
    description: 'Samsung televisies voor elke woonkamer, van lifestyle-modellen tot QLED toppers.',
    aiTrainingData: 'Productcategorie voor Samsung TV-advies, inclusief lifestyle, OLED en QLED modellen.',
    children: [
      {
        name: 'Lifestyle TVs',
        categoryId: 'lifestyle-tvs',
        categoryType: 'subcategory',
        label: 'Lifestyle TVs',
        description: 'The Frame, The Serif en andere lifestyle televisies.',
        aiTrainingData: 'Gebruik voor lifestyle televisies en designgerichte schermen.',
      },
      {
        name: 'QLED TVs',
        categoryId: 'qled-tvs',
        categoryType: 'subcategory',
        label: 'QLED TVs',
        description: 'Premium QLED-televisies met levendige kleuren en helderheid.',
        aiTrainingData: 'Gebruik voor vragen rond QLED of Neo QLED televisies.',
      },
    ],
  },
  {
    name: 'Audio',
    categoryId: 'audio',
    categoryType: 'product',
    label: 'Audio',
    description: 'Soundbars, draadloze speakers en andere Samsung audio-oplossingen.',
    aiTrainingData: 'Categorie voor Samsung audio-producten, inclusief soundbars en draagbare speakers.',
    children: [
      {
        name: 'Soundbars',
        categoryId: 'soundbars',
        categoryType: 'subcategory',
        label: 'Soundbars',
        description: 'Krachtige soundbars met Dolby Atmos en Q-Symphony.',
        aiTrainingData: 'Gebruik voor soundbars, Dolby Atmos en Q-Symphony vragen.',
      },
      {
        name: 'Wearable Audio',
        categoryId: 'wearable-audio',
        categoryType: 'subcategory',
        label: 'Wearable Audio',
        description: 'Galaxy Buds en andere draagbare audio devices.',
        aiTrainingData: 'Gebruik voor vragen over Galaxy Buds en draagbare audio-apparaten.',
      },
    ],
  },
  {
    name: 'Home Appliances',
    categoryId: 'home-appliances',
    categoryType: 'product',
    label: 'Home Appliances',
    description: 'Wasmachines, koelkasten en andere huishoudapparaten.',
    aiTrainingData: 'Categorie voor huishoudtoestellen en witgoed van Samsung.',
    children: [
      {
        name: 'Washing Machines',
        categoryId: 'washing-machines',
        categoryType: 'subcategory',
        label: 'Washing Machines',
        description: 'AI-wasmachines en energiezuinige modellen.',
        aiTrainingData: 'Gebruik voor wasmachine-advies en AI-wasprogramma’s.',
      },
      {
        name: 'Refrigerators',
        categoryId: 'refrigerators',
        categoryType: 'subcategory',
        label: 'Refrigerators',
        description: 'Bespoke en Family Hub koelkasten.',
        aiTrainingData: 'Gebruik voor koelkastadvies, Bespoke en Family Hub features.',
      },
    ],
  },
]

async function upsertCategoryTree(definition, parentId = null) {
  const { children = [], ...categoryData } = definition
  const payload = {
    name: categoryData.name,
    categoryId: categoryData.categoryId ?? null,
    categoryType: categoryData.categoryType ?? null,
    label: categoryData.label ?? null,
    description: categoryData.description ?? null,
    aiTrainingData: categoryData.aiTrainingData ?? null,
    parentId,
  }

  const category = await prisma.category.upsert({
    where: { name: categoryData.name },
    update: payload,
    create: payload,
  })

  for (const child of children) {
    await upsertCategoryTree(child, category.id)
  }

  return category
}

async function seedCategories() {
  const results = []
  for (const category of categoriesSeed) {
    const seeded = await upsertCategoryTree(category, null)
    results.push(seeded.name)
  }
  return results
}

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

  const seededCategories = await seedCategories()

  console.log('Seeded user:', user.email, 'id:', user.id)
  console.log('Seeded categories:', seededCategories.join(', '))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
