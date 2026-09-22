import "./style.css";

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
    <section id="market-list"></section>

    <section id="asset-detail" hidden></section>

    <p id="loading" hidden>Loading...</p>
    <p id="error" hidden>Something went wrong.</p>
    <p id="no-results" hidden>No results found.</p>
  </main>
`;
