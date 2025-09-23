// frontend/src/services/api.js
const API_URL = "http://127.0.0.1:8000";  // Django backend

export async function getRecommendations() {
  const response = await fetch(`${API_URL}/recommendations`);
  const data = await response.json();
  return data;
}
