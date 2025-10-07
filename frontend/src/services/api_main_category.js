const API_URL = "http://127.0.0.1:8000/api"; // Django API base URL

// Fetch all main categories
export async function get_main_category() {
  const response = await fetch(`${API_URL}/main_category/`); // trailing slash
  if (!response.ok) {
    throw new Error("Failed to fetch main_category");
  }
  const data = await response.json();
  return data;
}

// Search categories by text
export async function searchCategories(payload) {
  const response = await fetch(`${API_URL}/search_text/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }

  return await response.json();
}
