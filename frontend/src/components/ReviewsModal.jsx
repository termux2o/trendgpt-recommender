import { useState, useEffect } from "react";

export default function ReviewsModal({ parentAsin, open, onClose }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (open) {
            fetchReviews(1);
        }
    }, [open]);

    const fetchReviews = async (pageNumber) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/reviews_list/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    parent_asin: parentAsin,
                    page: pageNumber,
                    page_size: 10,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            setReviews(data.reviews);
            setPage(data.page);
            setTotalPages(data.total_pages);
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-[600px] max-h-[80vh] rounded-xl p-5 shadow-xl overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-semibold">Product Reviews</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-black text-xl">
                        ✕
                    </button>
                </div>

                {/* Loading State */}
                {loading && <p className="text-center py-5">Loading reviews...</p>}

                {/* Error */}
                {error && (
                    <p className="text-center text-red-600 py-3">
                        {error}
                    </p>
                )}

                {/* Reviews List */}
                {!loading && reviews.length > 0 && (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="border p-3 rounded-lg">
                                <div className="flex justify-between">
                                    <p className="font-semibold">{review.title}</p>
                                    <span className="text-yellow-500">
                                        ⭐ {review.rating}
                                    </span>
                                </div>

                                <p className="text-gray-700 mt-1">{review.text}</p>

                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(review.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* No Reviews */}
                {!loading && !error && reviews.length === 0 && (
                    <p className="text-center py-6 text-gray-500">
                        No reviews found.
                    </p>
                )}

                {/* Pagination Buttons */}
                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => fetchReviews(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <p className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </p>

                    <button
                        onClick={() => fetchReviews(page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
