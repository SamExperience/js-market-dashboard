import "./style.css";
import { marketData } from "./market-data";

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

function filterMarketData() {
  const filterList = marketData.filter((data) => data.total_volume > 1_000_000);
  const total = marketData.length;
  const show = filterList.length;

  return { filterList, total, show };
}

let { total, show, filterList } = filterMarketData();

function renderMarketList(data) {
  marketList.innerHTML = "";

  data.forEach((element, id) => {
    marketList.innerHTML += `
        <li data-id=${element.id}>
        <img src="${element.image}" alt="${element.name}" height="30" width="30">
        <span>${element.symbol}</span>
        <span>${element.name}</span>
        <span>${element.current_price}</span>
        </li>`;
  });
  marketCount.textContent = `${data.length}/${total}`;
}

renderMarketList(filterList);

inputSearch.addEventListener("input", (event) => {
  const searchCoin = event.target.value.trim().toLowerCase();

  const filteredData = filterList.filter((coin) =>
    coin.symbol.trim().toLowerCase().includes(searchCoin),
  );
  renderMarketList(filteredData);
});

marketList.addEventListener("click", (event) => {
  const row = event.target.closest("li");
  if (!row) return;

  const selectedCoin = filterList.find((coin) => coin.id === row.dataset.id);
  renderAssetsDetail(selectedCoin);
});

function renderAssetsDetail(coin) {
  assetDetail.innerHTML = `
        <article data-id=${coin.id}>
        <button id="back-button">Back</button>
          <img src="${coin.image}" alt="${coin.name}" height="50" width="50">
          <span>${coin.symbol}</span><br/>
          <span>${coin.name}</span><br/>
          <span>current price: ${coin.current_price}</span><br/>
          <span>market cap: ${coin.market_cap}</span><br/>
          <span>volume: ${coin.total_volume}</span><br/>
        </larticle>`;
  marketList.hidden = true;
  assetDetail.hidden = false;

  const buttonBackDetail = document.querySelector("#back-button");

  buttonBackDetail.addEventListener("click", () => {
    assetDetail.hidden = true;
    marketList.hidden = false;

    const searchCoin = inputSearch.value.toLowerCase();

    const listSearch = filterList.filter((coin) =>
      coin.symbol.toLowerCase().includes(searchCoin),
    );

    renderMarketList(listSearch);
  });
}
