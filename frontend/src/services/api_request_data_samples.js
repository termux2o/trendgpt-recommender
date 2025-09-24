const API_URL = "http://127.0.0.1:8000/api";  // notice /api prefix

export async function getRecommendations() {
  const response = await fetch(`${API_URL}/recommendations/`); // add trailing slash
  if (!response.ok) {
    throw new Error("Failed to fetch recommendations");
  }
  const data = await response.json();
  return data;
}
