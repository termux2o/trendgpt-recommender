import React, { useEffect, useState } from "react";
import { get_main_category, searchCategories } from "../services/api_main_category";
import "./CategoryBar.css";

const CategoryBar = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch main categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await get_main_category();
        setCategories(Array.isArray(data.main_categories) ? data.main_categories : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  // Update input value
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Trigger search on Enter key
  const handleSearchKeyDown = async (e) => {
    if (e.key === "Enter") {
      const value = e.target.value.trim();

      if (value === "") {
        // If search is empty, reload main categories
        try {
          const data = await get_main_category();
          setCategories(Array.isArray(data.main_categories) ? data.main_categories : []);
        } catch (err) {
          console.error("Failed to load categories:", err);
          setCategories([]);
        }
        return;
      }

      // Search API
      try {
        const response = await searchCategories({ query: { searched_text: value } });
        setCategories(Array.isArray(response.searchCategories) ? response.searchCategories : []);
      } catch (err) {
        console.error("Search API failed:", err);
        setCategories([]);
      }
    }
  };

  // Handle category selection
  const handleSelect = (cat) => {
    const selected = cat === "All" ? null : cat;
    setSelectedCategory(selected);
    if (onCategorySelect) onCategorySelect(selected);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={handleSearchChange}
        onKeyDown={handleSearchKeyDown}
        className="search-bar"
      />

      <div className="category-bar">
        {["All", ...(Array.isArray(categories) ? categories : [])].map((cat) => (
          <button
            key={cat}
            className={cat === selectedCategory ? "active" : ""}
            onClick={() => handleSelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
