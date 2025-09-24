import React, { useEffect, useState } from "react";
import { getRecommendations } from "../services/api_request_data_samples";

function RecommendationList_data_source() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getRecommendations()
      .then(data => setItems(data.appliances || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Recommendations</h2>
      <ul>
        {items.map(item => (
          <li key={item._id}>
            _id: {item._id}, Title: {item.title}, Category: {item.main_category}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationList_data_source;
