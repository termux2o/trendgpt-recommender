// frontend/src/components/RecommendationList.js
import React, { useEffect, useState } from "react";
import { getRecommendations } from "../services/api_request_data_samples";

function RecommendationList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getRecommendations().then(data => setItems(data));
  }, []);

  return (
    <div>
      <h2>Recommendations</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item.title} - {item.main_category}</li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationList;
