export default function Home() {
  return (
    <div id="root">
      <div className="min-h-screen flex flex-col bg-gray-100">
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex flex-col items-start mb-4">
            <h1 className="text-3xl font-bold">Welcome back Flipper</h1>
          </div>

          <div className="mb-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">AI Generation Control</h2>
                <button className="text-sm text-blue-600 hover:underline">Refresh</button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium mb-1">AI Response Generation</span>
                  <span className="text-xs text-gray-500">Controls both manual generation and automatic cron jobs</span>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-green-600 hover:bg-green-700" aria-label="Toggle AI generation">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-600">Status: <span className="font-medium text-green-600">Enabled</span></div>
            </div>
          </div>

          <div className="flex flex-wrap mb-4">
            <button className="mr-1 ml-1 mb-2 px-4 py-1 rounded-3xl text-sm bg-samsung-blue text-white hover:bg-blue-700" aria-label="Import BV Reviews">Import BV Reviews</button>
            <button className="mr-1 ml-1 mb-2 px-4 py-1 rounded-3xl text-sm bg-samsung-blue text-white hover:bg-blue-700" aria-label="Generate AI Responses">Generate AI Responses</button>
            <button className="mr-1 ml-1 mb-2 px-4 py-1 rounded-3xl text-sm bg-samsung-blue text-white hover:bg-blue-700" aria-label="Push AI Responses to BV">Push AI Responses to BV</button>
            <button className="mr-1 ml-1 mb-2 px-4 py-1 rounded-3xl text-sm bg-samsung-blue text-white hover:bg-blue-700" aria-label="Get Access Token NL_BE">Get Access Token NL_BE</button>
            <button className="mr-1 ml-1 mb-2 px-4 py-1 rounded-3xl text-sm bg-samsung-blue text-white hover:bg-blue-700" aria-label="Get Access Token FR_BE">Get Access Token FR_BE</button>
            <button className="mr-1 ml-1 mb-2 px-4 py-1 rounded-3xl text-sm bg-samsung-blue text-white hover:bg-blue-700" aria-label="Get Access Token NL_NL">Get Access Token NL_NL</button>
          </div>

          <section className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="order-2 lg:order-1 lg:col-span-3">
              <div className="rounded shadow p-4 transition-colors bg-white text-gray-800">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Daily Activity</h3>
                    <div className="flex flex-wrap gap-2 items-end">
                      <div className="flex flex-col">
                        <label className="text-2xs uppercase tracking-wide mb-1">Start</label>
                        <input aria-label="Start date" placeholder="2025-08-28" className="border rounded px-2 py-1 text-xs bg-transparent" type="text" defaultValue="2025-08-28" />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-2xs uppercase tracking-wide mb-1">End</label>
                        <input aria-label="End date" placeholder="2025-09-26" className="border rounded px-2 py-1 text-xs bg-transparent" type="text" defaultValue="2025-09-26" />
                      </div>
                      <button className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">Apply</button>
                      <button className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100">Reset</button>
                      <label className="flex items-center gap-1 text-xs cursor-pointer select-none ml-2">
                        <input type="checkbox" defaultChecked /> Auto-refresh
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-3 flex-wrap items-center justify-end">
                      <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                        <input className="accent-blue-600" type="checkbox" defaultChecked />
                        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" />Imported</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                        <input className="accent-blue-600" type="checkbox" defaultChecked />
                        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600" />Generated</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                        <input className="accent-blue-600" type="checkbox" defaultChecked />
                        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Posted</span>
                      </label>
                    </div>

                    <div className="flex gap-2 flex-wrap items-center justify-end text-xs">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Mode:</span>
                        <button className="px-2 py-0.5 rounded border bg-blue-600 text-white border-blue-600">Stacked</button>
                        <button className="px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-100">Dual Axis</button>
                      </div>
                      <label className="flex items-center gap-1 cursor-pointer select-none"><input type="checkbox" defaultChecked /> <span>Area Fill</span></label>
                      <button className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100">CSV</button>
                      <button className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100">PNG</button>
                    </div>
                  </div>
                </div>

                <div className="h-[360px]">
                  <canvas role="img" aria-label="Activity chart" height={720} width={838} className="block box-border h-[360px] w-[419px]"></canvas>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 lg:col-span-1">
              <div className="bg-white p-4 rounded shadow">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">BV Token Status</h2>
                  <div className="flex gap-3"><button className="text-sm text-blue-600 hover:underline">Refresh</button></div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="border rounded p-2">
                      <div className="font-semibold mb-1">NL_BE</div>
                      <div className="text-xs flex items-center justify-between"><span>three legged</span><span className="font-mono">2423s R</span></div>
                      <div className="text-xs flex items-center justify-between"><span>client</span><span className="text-gray-400">—</span></div>
                    </div>
                    <div className="border rounded p-2">
                      <div className="font-semibold mb-1">FR_BE</div>
                      <div className="text-xs flex items-center justify-between"><span>three legged</span><span className="font-mono">2423s R</span></div>
                      <div className="text-xs flex items-center justify-between"><span>client</span><span className="text-gray-400">—</span></div>
                    </div>
                    <div className="border rounded p-2">
                      <div className="font-semibold mb-1">NL_NL</div>
                      <div className="text-xs flex items-center justify-between"><span>three legged</span><span className="font-mono">2425s R</span></div>
                      <div className="text-xs flex items-center justify-between"><span>client</span><span className="text-gray-400">—</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="min-h-screen flex flex-col bg-gray-100 w-full relative">
            <h3 className="text-2xl mt-4 font-bold mb-4">Statistics</h3>
            <div className="mb-4 text-lg font-semibold">
              <p>Total Reviews Imported: <b>13712</b></p>
              <p>Total AI Reviews Generated and Synced: <b>13586</b></p>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-4">
              <div className="lg:w-2/3 w-full bg-white shadow-lg rounded-lg p-4 order-2 lg:order-1">
                <h4 className="text-xl font-bold mb-4">Main Table</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2">Date</th>
                        <th className="py-2">Original Product Name</th>
                        <th className="py-2">Language</th>
                        <th className="py-2">Total Reviews</th>
                        <th className="py-2">AI Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* sample rows (full list omitted for brevity) */}
                      <tr>
                        <td className="border px-4 py-2">2025-09-27</td>
                        <td className="border px-4 py-2">Galaxy S25 FE</td>
                        <td className="border px-4 py-2">nl_BE</td>
                        <td className="border px-4 py-2">1</td>
                        <td className="border px-4 py-2">1</td>
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">2025-09-27</td>
                        <td className="border px-4 py-2">Galaxy S24</td>
                        <td className="border px-4 py-2">fr_BE</td>
                        <td className="border px-4 py-2">1</td>
                        <td className="border px-4 py-2">1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between mt-4">
                  <button disabled className="px-4 py-2 rounded bg-gray-300 cursor-not-allowed">Previous</button>
                  <button className="px-4 py-2 rounded bg-blue-500 text-white">Next</button>
                </div>
              </div>

              <div className="lg:w-1/3 w-full bg-white shadow-lg rounded-lg p-4 mb-4 lg:mb-0 order-1 lg:order-2 flex flex-col h-full">
                <h4 className="text-xl font-bold mb-2">Total Reviews Per Product</h4>
                <div className="overflow-y-auto max-h-[600px]">
                  <div className="flex flex-col border-b py-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Galaxy S25 Ultra</span>
                      <span>3308</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>AI Reviews:</span>
                      <span>3293</span>
                    </div>
                  </div>
                  {/* ...more rows omitted for brevity */}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow p-4 mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <h2 className="text-lg font-semibold">BV Push Activity (last 7d)</h2>
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-1">Days:
                  <select className="border rounded px-2 py-1 text-sm default:border-gray-300">
                    <option value="7">7</option>
                    <option value="14">14</option>
                    <option value="30">30</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                  </select>
                </label>
                <button className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100">Refresh</button>
              </div>
            </div>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-1 pr-4">Date</th>
                    <th className="py-1 pr-4">Total</th>
                    <th className="py-1 pr-4">Success</th>
                    <th className="py-1 pr-4">Already</th>
                    <th className="py-1 pr-4">RetrySkip</th>
                    <th className="py-1 pr-4">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="py-1 pr-4 font-mono">2025-09-27</td><td className="py-1 pr-4">2</td><td className="py-1 pr-4">2</td><td className="py-1 pr-4">0</td><td className="py-1 pr-4">0</td><td className="py-1 pr-4">0</td></tr>
                  <tr className="border-b"><td className="py-1 pr-4 font-mono">2025-09-26</td><td className="py-1 pr-4">105</td><td className="py-1 pr-4">105</td><td className="py-1 pr-4">0</td><td className="py-1 pr-4">0</td><td className="py-1 pr-4">0</td></tr>
                  {/* more rows... */}
                </tbody>
              </table>
            </div>

            <div className="mb-4 text-xs flex flex-wrap gap-3">
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500" />success:390</span>
              <span className="font-semibold">Total Attempts: 390</span>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Recent Attempts</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left border-b"><th className="py-1 pr-4">Time</th><th className="py-1 pr-4">ReviewId</th><th className="py-1 pr-4">Region</th><th className="py-1 pr-4">Status</th><th className="py-1 pr-4">BV Id</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="py-1 pr-4 font-mono" title="2025-09-27T11:20:04.489Z">13:20:04</td><td className="py-1 pr-4 font-mono" title="244904059">2449040</td><td className="py-1 pr-4">FR_BE</td><td className="py-1 pr-4"><span className="inline-block px-2 py-0.5 rounded text-white text-[10px] bg-green-500">success</span></td><td className="py-1 pr-4 font-mono" title="b955d8af-b819-4ad5-b9ab-2c460f976567">b955d8af-b</td></tr>
                    {/* more rows... */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
