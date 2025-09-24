import React, { useEffect, useState } from "react";
import { get_main_category } from "../services/api_main_category";
import "./MainCategoryGrid.css";
import { product_category_api } from "../services/product_category_api";

const categoryImages = {
  Electronics: "https://via.placeholder.com/150?text=Electronics",
  Clothing: "https://via.placeholder.com/150?text=Clothing",
  Books: "https://via.placeholder.com/150?text=Books",
  Toys: "https://via.placeholder.com/150?text=Toys",
};

const MainCategoryGrid = ({ onCategoryClick }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await get_main_category();
        setCategories(data.main_categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    fetchCategories();
  }, []);

  const handleCategoryClick = async (cat) => {
    try {
      setLoadingCategory(cat);
      
      // Call the product_category_api to get products for this category
      const productsData = await product_category_api(cat);
      
      // Pass both category and products data to parent component
      if (onCategoryClick) {
        onCategoryClick({
          category: cat,
          products: productsData.appliances || productsData,
          rawApiResponse: productsData
        });
      }
    } catch (error) {
      console.error("Failed to fetch products for category:", cat, error);
      
      // Pass error information to parent
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
          {loadingCategory === cat && (
            <div className="category-loading">Loading...</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MainCategoryGrid;