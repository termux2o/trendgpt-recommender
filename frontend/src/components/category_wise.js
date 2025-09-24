import React, { useState, useEffect } from 'react';
import './ProductGrid.css';

const ProductGrid = ({ mainCategory }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch products from Django API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/product_category_api/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ main_category: mainCategory }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (mainCategory) {
      fetchProducts();
    }
  }, [mainCategory]);

  // Product card component
  const ProductCard = ({ product }) => (
    <div className="product-card" onClick={() => setSelectedProduct(product)}>
      <div className="product-image">
        <img 
          src={product.images[0]?.large || product.images[0]?.thumb} 
          alt={product.title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
        {product.videos && product.videos.length > 0 && (
          <div className="video-indicator">
            <span>📹 {product.videos.length} videos</span>
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(product.average_rating) ? 'star filled' : 'star'}>
                ★
              </span>
            ))}
          </div>
          <span className="rating-text">
            {product.average_rating} ({product.rating_number})
          </span>
        </div>
        
        <div className="product-store">
          by {product.store}
        </div>
        
        {product.price && (
          <div className="product-price">
            ${product.price}
          </div>
        )}
        
        <div className="product-features">
          {product.features.slice(0, 2).map((feature, index) => (
            <div key={index} className="feature">• {feature}</div>
          ))}
        </div>
      </div>
    </div>
  );

  // Product detail modal
  const ProductDetailModal = () => {
    if (!selectedProduct) return null;

    const product = selectedProduct;

    return (
      <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={() => setSelectedProduct(null)}>×</button>
          
          <div className="product-detail">
            <div className="detail-left">
              <div className="main-image">
                <img 
                  src={product.images[selectedImageIndex]?.hi_res || product.images[selectedImageIndex]?.large} 
                  alt={product.title}
                />
              </div>
              
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.thumb}
                    alt={`Thumbnail ${index + 1}`}
                    className={index === selectedImageIndex ? 'thumbnail active' : 'thumbnail'}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
              
              {product.videos && product.videos.length > 0 && (
                <div className="videos-section">
                  <h4>Product Videos ({product.videos.length})</h4>
                  <div className="videos-list">
                    {product.videos.slice(0, 3).map((video, index) => (
                      <div key={index} className="video-item">
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          ▶ {video.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="detail-right">
              <h1>{product.title}</h1>
              
              <div className="detail-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.average_rating) ? 'star filled' : 'star'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-text">
                  {product.average_rating} out of 5 stars ({product.rating_number} ratings)
                </span>
              </div>
              
              <div className="store-brand">
                Brand: <strong>{product.store}</strong>
              </div>
              
              {product.price && (
                <div className="detail-price">
                  Price: <strong>${product.price}</strong>
                </div>
              )}
              
              <div className="product-features-detail">
                <h3>About this item</h3>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="product-details">
                <h3>Product Details</h3>
                <table className="details-table">
                  <tbody>
                    {Object.entries(product.details).map(([key, value]) => (
                      <tr key={key}>
                        <td className="detail-label">{key}:</td>
                        <td className="detail-value">{typeof value === 'object' ? JSON.stringify(value) : value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="categories">
                <strong>Categories:</strong> {product.categories.join(' > ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      <div className="grid-header">
        <h2>Products in {mainCategory}</h2>
        <span className="product-count">{products.length} products found</span>
      </div>
      
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      
      <ProductDetailModal />
    </div>
  );
};

export default ProductGrid;