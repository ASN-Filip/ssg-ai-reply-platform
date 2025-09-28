import EditProductClient from '@/components/EditProductClient'

type Props = { params: { id: string } }

export default function EditProductPage({ params }: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <EditProductClient id={params.id} />
    </div>
  )
}
