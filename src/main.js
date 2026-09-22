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

const { total, show, filterList } = filterMarketData();
marketCount.textContent = `${show}/${total}`;

function renderMarketList(data) {
  marketList.innerHTML = "";

  data.forEach((element) => {
    marketList.innerHTML += `
    <li>
        <img src="${element.image}" alt="${element.name}" height="30" width="30">
        <span>${element.symbol}</span>
        <span>${element.name}</span>
        <span>${element.current_price}</span>
    </li>`;
  });
}

renderMarketList(filterList);
