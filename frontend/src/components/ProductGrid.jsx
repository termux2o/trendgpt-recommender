import React, { useState, useEffect, useCallback, useRef } from 'react';
import { product_category_api } from "../services/product_category_api";
import './ProductGrid.css';

// ================= Skeleton Loader =================
const SkeletonCard = React.memo(() => (
  <div className="product-card skeleton">
    <div className="product-image skeleton-box"></div>
    <div className="product-info">
      <div className="skeleton-box title"></div>
      <div className="skeleton-box rating"></div>
      <div className="skeleton-box store"></div>
      <div className="skeleton-box price"></div>
    </div>
  </div>
));

// ================= Product Card =================
const ProductCard = React.memo(({ product, onProductClick }) => {
  const handleClick = useCallback(() => onProductClick(product), [product, onProductClick]);

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image">
        <img
          src={product.images?.[0]?.large || 'https://via.placeholder.com/300x300?text=No+Image'}
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
              <span key={i} className={i < Math.floor(product.average_rating || 0) ? 'star filled' : 'star'}>★</span>
            ))}
          </div>
          <span className="rating-text">{product.average_rating || 0} ({product.rating_number || 0})</span>
        </div>
        <div className="product-store">by {product.store || 'Unknown Store'}</div>
        {product.price && <div className="product-price">${product.price}</div>}
      </div>
    </div>
  );
});

// ================= Product Modal =================
const ProductDetailModal = React.memo(({ product, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  useEffect(() => setSelectedImageIndex(0), [product]);
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="product-detail">
          <div className="detail-left">
            <div className="main-image">
              <img
                src={product.images?.[selectedImageIndex]?.hi_res || product.images?.[selectedImageIndex]?.large || 'https://via.placeholder.com/500x500?text=No+Image'}
                alt={product.title}
                loading="lazy"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.thumb}
                    alt={`Thumbnail ${idx + 1}`}
                    className={idx === selectedImageIndex ? 'thumbnail active' : 'thumbnail'}
                    onClick={() => setSelectedImageIndex(idx)}
                    loading="lazy"
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
                  <span key={i} className={i < Math.floor(product.average_rating || 0) ? 'star filled' : 'star'}>★</span>
                ))}
              </div>
              <span className="rating-text">{product.average_rating || 0} out of 5 stars ({product.rating_number || 0} ratings)</span>
            </div>
            <div className="store-brand">Brand: <strong>{product.store || 'Unknown'}</strong></div>
            {product.price && <div className="detail-price">Price: <strong>${product.price}</strong></div>}
          </div>
        </div>
      </div>
    </div>
  );
});

// ================= Pagination Component =================
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button 
        className="pagination-btn prev" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      
      <div className="pagination-numbers">
        {pages.map(page => (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button 
        className="pagination-btn next" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
});

// ================= Main Grid =================
const CONFIG = { productsPerPage: 20 };

const ProductGrid = ({ main_category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch products with pagination
  useEffect(() => {
    if (!main_category) return;
    setLoading(true);
    setError(null);

    product_category_api(main_category, currentPage)
      .then(res => {
        setProducts(res.appliances || []);
        setTotalPages(res.total_pages || 1);
        setTotalResults(res.total_results || 0);
      })
      .catch(err => setError(err.message || 'Failed to fetch products'))
      .finally(() => setLoading(false));
  }, [main_category, currentPage]);

  const handleProductClick = useCallback((p) => setSelectedProduct(p), []);
  const handleModalClose = useCallback(() => setSelectedProduct(null), []);
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const skeletons = Array(12).fill(0).map((_, idx) => <SkeletonCard key={idx} />);

  if (error) return (
    <div className="error">
      <p>Error: {error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <div className="product-grid-container">
      <div className="grid-header">
        <h2>Products in {main_category}</h2>
        {!loading && (
          <span className="product-count">
            Page {currentPage} of {totalPages} • Showing {products.length} of {totalResults} products
          </span>
        )}
      </div>

      {loading ? (
        <div className="product-grid">{skeletons}</div>
      ) : (
        <>
          <div className="product-grid">
            {products.map(p => (
              <ProductCard key={p._id} product={p} onProductClick={handleProductClick} />
            ))}
          </div>
          
          {products.length > 0 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </>
      )}

      <ProductDetailModal product={selectedProduct} onClose={handleModalClose} />
    </div>
  );
};

export default React.memo(ProductGrid);