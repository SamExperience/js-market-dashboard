import "./style.css";
//import { marketData } from "./market-data";
import { fetchCoins } from "./services/marketApi";

document.querySelector("#app").innerHTML = `
  <header class="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div class="flex items-baseline gap-3">
      <h1 class="text-2xl font-medium text-gray-900">Market Dashboard</h1>
      <p id="market-count" class="text-sm text-gray-500">0/0</p>
    </div>

    <div class="flex flex-col gap-1 sm:w-64">
      <label for="search" class="text-sm text-gray-600">Search by symbol</label>
      <input
        type="search"
        id="search"
        name="search"
        placeholder="Search symbol..."
        class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
      />
    </div>
  </header>

  <main class="mx-auto max-w-2xl">
    <ul id="market-list" class="list-none divide-y divide-gray-200"></ul>

    <section id="asset-detail" hidden></section>

    <p id="loading" hidden>Loading...</p>
    <p id="error" hidden>Something went wrong.</p>
    <p id="no-results" hidden>No results found.</p>
  </main>
`;

const marketCount = document.querySelector("#market-count");
const marketList = document.querySelector("#market-list");
const assetDetail = document.querySelector("#asset-detail");
const inputSearch = document.querySelector("#search");
const loading = document.querySelector("#loading");
const error = document.querySelector("#error");
const noResults = document.querySelector("#no-results");
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
let filterList;

/**
 * Fetches the latest market data, filters out low-volume coins, and
 * refreshes the UI accordingly. Manages the loading and error states.
 *
 * @async
 * @returns {Promise<Array<Object>|undefined>} The filtered coin list, or
 * `undefined` if the fetch failed.
 * @example
 * const coins = await filterMarketData();
 */
async function filterMarketData() {
  try {
    loading.hidden = false;
    marketList.hidden = true;

    const data = await fetchCoins();
    error.hidden = true;
    if (!data) {
      error.textContent = "No data available";
      error.hidden = false;
      return;
    }
    filterList = data.filter((coin) => coin.total_volume > 1_000_000);

    applyFilterAndRender(filterList);

    return filterList;
  } catch (err) {
    error.textContent = "Unable to load market data.";
    error.hidden = false;
  } finally {
    loading.hidden = true;
  }
}

filterMarketData();

setInterval(() => {
  filterMarketData();
}, 5 * 60_000);

/**
 * Renders the given coins as rows in the market list and updates the
 * visible/total count label.
 *
 * @param {Array<Object>} data - The coins to display.
 * @returns {void}
 * @example
 * renderMarketList(filterList);
 */
function renderMarketList(data) {
  marketList.innerHTML = data
    .map(
      (element) => `
        <li data-id=${escapeHtml(element.id)} class="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-gray-50 sm:px-4">
        <img src="${escapeHtml(element.image)}" alt="${escapeHtml(element.name)}" height="24" width="24" class="rounded-full">
        <span class="text-sm font-medium uppercase text-gray-900">${escapeHtml(element.symbol)}</span>
        <span class="hidden text-sm text-gray-500 sm:inline">${escapeHtml(element.name)}</span>
        <span class="ml-auto text-sm font-medium tabular-nums text-gray-900">${escapeHtml(formatter.format(element.current_price))}</span>
        </li>
        `,
    )
    .join("");

  marketCount.textContent = `${data.length}/${filterList.length}`;
}

inputSearch.addEventListener("input", (event) => {
  const searchCoin = event.target.value.trim().toLowerCase();

  const filteredData = filterList.filter((coin) =>
    coin.symbol.trim().toLowerCase().includes(searchCoin),
  );

  applyFilterAndRender(filteredData);
});

marketList.addEventListener("click", (event) => {
  const row = event.target.closest("li");
  if (!row) return;

  const selectedCoin = filterList.find((coin) => coin.id === row.dataset.id);
  renderAssetsDetail(selectedCoin);
});

/**
 * Renders the detail view for a single coin and wires up its "back"
 * button to return to the market list.
 *
 * @param {Object} coin - The coin to display details for.
 * @returns {void}
 * @example
 * renderAssetsDetail(selectedCoin);
 */
function renderAssetsDetail(coin) {
  assetDetail.innerHTML = `
        <article data-id=${escapeHtml(coin.id)} class="px-4 py-4 sm:px-6">
        <button id="back-button" class="mb-4 text-sm text-gray-500 hover:text-gray-900">Back</button>
          <div class="flex items-center gap-3">
            <img src="${escapeHtml(coin.image)}" alt="${escapeHtml(coin.name)}" height="50" width="50" class="rounded-full">
            <div>
              <span class="block text-lg font-medium uppercase text-gray-900">${escapeHtml(coin.symbol)}</span>
              <span class="block text-sm text-gray-500">${escapeHtml(coin.name)}</span>
            </div>
          </div>
          <div class="mt-4 divide-y divide-gray-200">
            <div class="flex justify-between py-2">
              <span class="text-gray-500">current price</span>
              <span class="text-xl font-medium tabular-nums text-gray-900">${escapeHtml(formatter.format(coin.current_price))}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-500">market cap</span>
              <span class="font-medium tabular-nums text-gray-900">${escapeHtml(formatter.format(coin.market_cap))}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-500">volume</span>
              <span class="font-medium tabular-nums text-gray-900">${escapeHtml(formatter.format(coin.total_volume))}</span>
            </div>
          </div>
        </article>`;
  marketList.hidden = true;
  assetDetail.hidden = false;

  const buttonBackDetail = document.querySelector("#back-button");

  buttonBackDetail.addEventListener("click", () => {
    assetDetail.hidden = true;
    marketList.hidden = false;

    const searchCoin = inputSearch.value.trim().toLowerCase();

    const listSearch = filterList.filter((coin) =>
      coin.symbol.toLowerCase().includes(searchCoin),
    );
    applyFilterAndRender(listSearch);
  });
}

/**
 * Displays either the "no results" message or the rendered market list,
 * depending on whether the filtered data is empty.
 *
 * @param {Array<Object>} filteredData - The coins matching the current filter.
 * @returns {void}
 * @example
 * applyFilterAndRender(filterList);
 */
function applyFilterAndRender(filteredData) {
  if (filteredData.length === 0) {
    noResults.hidden = false;
    marketList.hidden = true;
    marketCount.textContent = `0/${filterList.length}`;
  } else {
    noResults.hidden = true;
    marketList.hidden = false;
    renderMarketList(filteredData);
  }
}
/**
 * Escapes a string for safe interpolation into HTML markup.
 *
 * @param {string} str - The raw string to escape.
 * @returns {string} The HTML-escaped string.
 * @example
 * escapeHtml("<b>"); // "&lt;b&gt;"
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
