const API_URL = import.meta.env.VITE_API_URL;

export async function fetchCoins() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`API error: ${response.status}`);

  return await response.json();
}
