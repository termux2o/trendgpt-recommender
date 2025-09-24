import './App.css';
import React, { useState } from "react";
import CategoryBar from "./components/CategoryBar";
import MainCategoryGrid from "./components/MainCategoryGrid";
import ProductGrid from "./components/category_wise";

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Helper to extract category string from API payload or object
  const getCategoryString = (categoryObj) => {
    if (!categoryObj) return null;
    // if selectedCategory is an object like { main_category: { category: "Automotive", products: [...] } }
    return categoryObj.main_category?.category || categoryObj.category || categoryObj;
  };

  return (
    <div className="container">
      <h1>My Shop</h1>

      {/* Category Bar */}
      <CategoryBar onCategoryClick={setSelectedCategory} />

      {/* Main grid if no category selected */}
      {!selectedCategory && (
        <MainCategoryGrid onCategoryClick={setSelectedCategory} />
      )}

      {/* Product grid if category selected */}
      {selectedCategory && (
        <div>
          <button 
            onClick={() => setSelectedCategory(null)} 
            style={{ marginBottom: "10px", padding: "5px 10px", cursor: "pointer" }}
          >
            ← Back to Categories
          </button>

          {/* Pass only the category string */}
          <ProductGrid main_category={getCategoryString(selectedCategory)} />
        </div>
      )}
    </div>
  );
};

export default App;
