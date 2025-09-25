import React, { useEffect, useState } from "react";
import { get_main_category } from "../services/api_main_category";
import { product_category_api } from "../services/product_category_api";
import "./MainCategoryGrid.css";

// Placeholder images for categories
const categoryImages = {
  Electronics: "https://via.placeholder.com/150?text=Electronics",
  Clothing: "https://via.placeholder.com/150?text=Clothing",
  Books: "https://via.placeholder.com/150?text=Books",
  Toys: "https://via.placeholder.com/150?text=Toys",
};

const MainCategoryGrid = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(null);

  // Fetch main categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await get_main_category();
        setCategories(data.main_categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Handle clicking on a category
  const handleCategoryClick = async (cat) => {
    try {
      setLoadingCategory(cat);

      // Fetch products for the selected category
      const productsData = await product_category_api(cat);

      // Pass category and products to parent
      if (onCategoryClick) {
        onCategoryClick({
          category: cat,
          products: productsData.appliances || [],
          rawApiResponse: productsData
        });
      }
    } catch (error) {
      console.error(`Failed to fetch products for category ${cat}:`, error);
      if (onCategoryClick) {
        onCategoryClick({
          category: cat,
          products: [],
          error: error.message
        });
      }
    } finally {
      setLoadingCategory(null);
    }
  };

  return (
    <div className="grid-container">
      {categories.map((cat) => (
        <div
          key={cat}
          className={`category-card ${loadingCategory === cat ? 'loading' : ''}`}
          onClick={() => handleCategoryClick(cat)}
        >
          <img
            src={categoryImages[cat] || "https://via.placeholder.com/150?text=Category"}
            alt={cat}
          />
          <p>{cat}</p>
          {loadingCategory === cat && <div className="category-loading">Loading...</div>}
        </div>
      ))}
    </div>
  );
};

export default MainCategoryGrid;
