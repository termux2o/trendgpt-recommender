const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const product_category_api = async (mainCategory) => {
  try {
    console.log("Sending API request for category:", mainCategory);

    const response = await fetch(`${API_BASE_URL}/product_category_api/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ main_category: mainCategory }), // <-- MUST match Django
    });

    console.log("Raw response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from server:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log("API response data:", data); // <-- log full response
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};
