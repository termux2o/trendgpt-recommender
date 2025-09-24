const API_URL = "http://127.0.0.1:8000/api";  // notice /api prefix

export async function get_main_category() {
  const response = await fetch(`${API_URL}/main_category/`); // add trailing slash
  if (!response.ok) {
    throw new Error("Failed to fetch main_category");
  }
  const data = await response.json();
  return data;
}
