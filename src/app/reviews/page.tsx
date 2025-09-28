import Link from "next/link";

export default function ReviewsPage() {
  return (
    <div id="root">
      <div className="min-h-screen flex flex-col bg-gray-100">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Reviews</h1>
          </div>

          <input
            placeholder="Search..."
            className="bg-white p-4 rounded-full w-full border-0"
            type="text"
            defaultValue={""}
            aria-label="Search reviews"
          />

          <div className="flex justify-between mt-4">
            <div className="flex space-x-4">
              <select className="p-2 border rounded" defaultValue="createdAt" aria-label="Sort by">
                <option value="createdAt">Import Date</option>
                <option value="rating">Rating</option>
                <option value="reviewerName">Reviewer Name</option>
                <option value="isSynced">Sync status</option>
              </select>
              <select className="p-2 border rounded" defaultValue="asc" aria-label="Sort direction">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <Link href="/reviews/1" aria-label="Open review Fijne smartphone" className="block">
              <article className="p-6 m-2 cursor-pointer bg-white rounded-3xl">
              <div className="mb-2 justify-end flex gap-2">
                <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-200 rounded-full">Synced with BV</span>
                <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-200 rounded-full">AI Reply Generated</span>
              </div>
              <h2 className="text-xl font-bold">Fijne smartphone</h2>
              <div className="mt-2">Rating: <span className="text-yellow-500">★★★★★</span></div>
              <p className="mt-4">Locale: nl_BE</p>
              <p className="mt-4">Device name: Galaxy S25 FE (SM-S731BZKGEUB)</p>
              <p className="mt-2">Date: 27/09/2025, 13:00:02</p>
              </article>
            </Link>

            <Link href="/reviews/2" aria-label="Open review Premium" className="block">
              <article className="p-6 m-2 cursor-pointer bg-white rounded-3xl">
              <div className="mb-2 justify-end flex gap-2">
                <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-200 rounded-full">Synced with BV</span>
                <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-200 rounded-full">AI Reply Generated</span>
              </div>
              <h2 className="text-xl font-bold">Premium</h2>
              <div className="mt-2">Rating: <span className="text-yellow-500">★★★★★</span></div>
              <p className="mt-4">Locale: fr_BE</p>
              <p className="mt-4">Device name: Galaxy S24 (Online Exclusive) (SM-S921BLBDEUB)</p>
              <p className="mt-2">Date: 27/09/2025, 13:00:02</p>
              </article>
            </Link>

            <Link href="/reviews/3" aria-label="Open review Zeer tevreden" className="block">
              <article className="p-6 m-2 cursor-pointer bg-white rounded-3xl">
              <div className="mb-2 justify-end flex gap-2">
                <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-200 rounded-full">Synced with BV</span>
                <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-200 rounded-full">AI Reply Generated</span>
              </div>
              <h2 className="text-xl font-bold">Zeer tevreden van mijn s25 ultra</h2>
              <div className="mt-2">Rating: <span className="text-yellow-500">★★★★★</span></div>
              <p className="mt-4">Locale: nl_BE</p>
              <p className="mt-4">Device name: Galaxy S25 Ultra (SM-S938BZKDEUB)</p>
              <p className="mt-2">Date: 27/09/2025, 01:00:02</p>
              </article>
            </Link>

            {/* more static cards can be added or dynamically rendered from data */}
          </div>

          <div className="mt-4 flex justify-center">
            <button type="button" className="bg-samsung-blue text-white px-4 py-2 rounded-3xl hover:bg-blue-700">Load More</button>
          </div>

        </main>
      </div>
    </div>
  );
}
