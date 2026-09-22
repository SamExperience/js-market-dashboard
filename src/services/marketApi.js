const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches the current list of coins from the configured market data API.
 *
 * @async
 * @returns {Promise<Array<Object>>} The parsed JSON array of coin data.
 * @throws {Error} If the HTTP response status is not OK.
 * @example
 * const coins = await fetchCoins();
 */
export async function fetchCoins() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`API error: ${response.status}`);

  return await response.json();
}
