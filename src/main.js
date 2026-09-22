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

function renderAssetsDetail(coin) {
  assetDetail.innerHTML = `
        <article data-id=${escapeHtml(coin.id)}>
        <button id="back-button">Back</button>
          <img src="${escapeHtml(coin.image)}" alt="${escapeHtml(coin.name)}" height="50" width="50">
          <span>${escapeHtml(coin.symbol)}</span><br/>
          <span>${escapeHtml(coin.name)}</span><br/>
          <span>current price: ${escapeHtml(formatter.format(coin.current_price))}</span><br/>
          <span>market cap: ${escapeHtml(formatter.format(coin.market_cap))}</span><br/>
          <span>volume: ${escapeHtml(formatter.format(coin.total_volume))}</span><br/>
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
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
