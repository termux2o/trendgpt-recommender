const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Fetch products for a given main category
 * Supports pagination: page, page_size
 */
export const product_category_api = async (mainCategory, { page = 1, page_size = 50, signal } = {}) => {
  try {
    console.log("Sending API request for category:", mainCategory, "page:", page, "page_size:", page_size);

    const response = await fetch(`${API_BASE_URL}/product_category_api/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal, // allows AbortController to cancel request
      body: JSON.stringify({
        main_category: mainCategory,
        page,
        page_size
      }),
    });

    console.log("Raw response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from server:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log("API response data:", data);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};
