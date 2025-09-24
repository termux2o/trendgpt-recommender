import React, { useEffect, useState } from "react";
import { get_main_category } from "../services/api_main_category";
import "./CategoryBar.css";

const CategoryBar = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");

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

  const filteredCategories = categories.filter(
    (cat) =>
      cat &&
      cat.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (cat) => {
    setSelectedCategory(cat === "All" ? null : cat);
    if (onCategorySelect) onCategorySelect(cat);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />
      <div className="category-bar">
        {["All", ...filteredCategories].map((cat) => (
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
