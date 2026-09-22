import "./style.css";
//import { marketData } from "./market-data";
import { fetchCoins } from "./services/marketApi";

document.querySelector("#app").innerHTML = `
  <header>
    <h1>Market Dashboard</h1>

    <p id="market-count">0/0</p>

    <label for="search">Search by symbol</label>
    <input
      type="search"
      id="search"
      name="search"
      placeholder="Search symbol..."
    />
  </header>

  <main>
    <ul id="market-list"></ul>

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

let filterList;

async function filterMarketData() {
  try {
    loading.hidden = false;
    marketList.hidden = true;

    const data = await fetchCoins();
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
}, 60_000);

function renderMarketList(data) {
  marketList.innerHTML = data
    .map(
      (element) => `
        <li data-id=${escapeHtml(element.id)}>
        <img src="${escapeHtml(element.image)}" alt="${escapeHtml(element.name)}" height="30" width="30">
        <span>${escapeHtml(element.symbol)}</span>
        <span>${escapeHtml(element.name)}</span>
        <span>${escapeHtml(element.current_price)}</span>
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
          <span>current price: ${escapeHtml(coin.current_price)}</span><br/>
          <span>market cap: ${escapeHtml(coin.market_cap)}</span><br/>
          <span>volume: ${escapeHtml(coin.total_volume)}</span><br/>
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
