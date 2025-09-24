import React, { useState, useEffect } from 'react';
import { product_category_api } from "../services/product_category_api";
import './ProductGrid.css';

// Skeleton card for loading
const SkeletonCard = () => (
  <div className="product-card skeleton">
    <div className="product-image skeleton-box"></div>
    <div className="product-info">
      <div className="skeleton-box title"></div>
      <div className="skeleton-box rating"></div>
      <div className="skeleton-box store"></div>
      <div className="skeleton-box price"></div>
    </div>
  </div>
);

const ProductGrid = ({ main_category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Modified: Show only first 6 products for testing
  const PRODUCTS_PER_PAGE = 6;

  // Fetch only first few products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await product_category_api(main_category);
      const allProducts = response.main_category?.products || [];
      
      // Modified: Take only first few products instead of pagination
      const limitedProducts = allProducts.slice(0, PRODUCTS_PER_PAGE);
      setProducts(limitedProducts);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when category changes
  useEffect(() => {
    if (main_category) fetchProducts();
    else {
      setProducts([]);
      setLoading(false);
    }
  }, [main_category]);

  // Product card component
  const ProductCard = ({ product }) => (
    <div className="product-card" onClick={() => setSelectedProduct(product)}>
      <div className="product-image">
        <img
          src={product.images?.[0]?.large || product.images?.[0]?.thumb || 'https://via.placeholder.com/300x300?text=No+Image'}
          alt={product.title}
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
        />
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>

        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(product.average_rating || 0) ? 'star filled' : 'star'}>
                ★
              </span>
            ))}
          </div>
          <span className="rating-text">
            {product.average_rating || 0} ({product.rating_number || 0})
          </span>
        </div>

        <div className="product-store">
          by {product.store || 'Unknown Store'}
        </div>

        {product.price && <div className="product-price">${product.price}</div>}

        {product.features?.length > 0 && (
          <div className="product-features">
            {product.features.slice(0, 2).map((f, idx) => (
              <div key={idx} className="feature">• {f}</div>
            ))}
          </div>
        )}
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
                  src={product.images?.[selectedImageIndex]?.hi_res || product.images?.[selectedImageIndex]?.large || 'https://via.placeholder.com/500x500?text=No+Image'}
                  alt={product.title}
                  loading="lazy"
                />
              </div>

              {product.images?.length > 0 && (
                <div className="image-thumbnails">
                  {product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.thumb}
                      alt={`Thumbnail ${idx + 1}`}
                      className={idx === selectedImageIndex ? 'thumbnail active' : 'thumbnail'}
                      loading="lazy"
                      onClick={() => setSelectedImageIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="detail-right">
              <h1>{product.title}</h1>

              <div className="detail-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.average_rating || 0) ? 'star filled' : 'star'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-text">
                  {product.average_rating || 0} out of 5 stars ({product.rating_number || 0} ratings)
                </span>
              </div>

              <div className="store-brand">
                Brand: <strong>{product.store || 'Unknown'}</strong>
              </div>

              {product.price && <div className="detail-price">Price: <strong>${product.price}</strong></div>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="product-grid">
        {Array(6).fill(0).map((_, idx) => <SkeletonCard key={idx} />)}
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
        <h2>Products in {main_category}</h2>
        <span className="product-count">{products.length} products shown (Limited for testing)</span>
      </div>

      <div className="product-grid">
        {products.length > 0 ? (
          products.map(p => <ProductCard key={p._id} product={p} />)
        ) : (
          <div className="no-products">
            <p>No products found for this category.</p>
          </div>
        )}
      </div>

      <ProductDetailModal />
    </div>
  );
};

export default ProductGrid;