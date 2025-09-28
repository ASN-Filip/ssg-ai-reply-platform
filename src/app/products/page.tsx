import ProductsClient from '../../components/ProductsClient';

export default function ProductsPage() {
  return (
    <div id="root">
      <div className="min-h-screen flex flex-col bg-gray-100">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Products</h1>
          </div>

          <ProductsClient />

          <div className="mt-4"></div>
        </main>

      </div>
    </div>
  );
}
