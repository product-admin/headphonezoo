/* Customers Comments Fuunctionality */
// List reviewer names that should show the "Verified Buyer" badge when a review
const VERIFIED_BUYERS = [
    'Sarah', 'Ahmed', 'Emily Davis', 'Ali', 'Matthew Harris', 'Laura Taylor', 'Li Wei',
];


// Helper: check if a review is verified. Prefer an explicit `verified` flag on
// the stored object; fall back to the static `VERIFIED_BUYERS` list.
function isReviewVerified(item) {
    if (!item) return false;
    if (typeof item.verified === 'boolean') return item.verified;
    const name = (item.reviewer_name || '').trim().toLowerCase();
    return VERIFIED_BUYERS.some(v => v.trim().toLowerCase() === name);
}

// Find the first review card element for a reviewer name (case-insensitive).
function getReviewCardByReviewer(reviewerName) {
    if (!reviewerName) return null;
    const area = document.getElementById('user_clint_rate_area');
    if (!area) return null;
    const cards = Array.from(area.querySelectorAll('.user_card_rate_div'));
    const targetName = reviewerName.trim().toLowerCase();
    for (const card of cards) {
        const h4 = card.querySelector('h4');
        if (h4 && h4.textContent.trim().toLowerCase() === targetName) return card;
    }
    return null;
}

// Add or remove the Verified Buyer badge for a reviewer card by name.
function markVerifiedByName(reviewerName) {
    const card = getReviewCardByReviewer(reviewerName);
    if (!card) return false;
    const existing = card.querySelector('.verified-badge');
    if (existing) return true; // already marked
    const infoDiv = card.querySelector('.card_clint_rate_info_div');
    if (!infoDiv) return false;
    const badge = document.createElement('span');
    badge.className = 'verified-badge';
    badge.textContent = 'Verified Buyer';
    infoDiv.appendChild(badge);
    return true;
}

function unmarkVerifiedByName(reviewerName) {
    const card = getReviewCardByReviewer(reviewerName);
    if (!card) return false;
    const existing = card.querySelector('.verified-badge');
    if (existing) existing.remove();
    return true;
}

document.getElementById("user_comment_form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const button = document.querySelector("#user_comment_form button[type='submit']");
    button.disabled = true;
    button.style.background = "gray";
    button.style.color = "white";
    button.innerText = "Posting...";

    let reviewer_name = document.getElementById("user_comment_username").value.trim();
    let comment = document.getElementById("user_comment_text").value.trim();
    let email = document.getElementById("user_comment_email")?.value.trim() || "";
    let stars = parseInt(document.getElementById("user_comment_stars").value);
    let review_date = new Date().toISOString().split("T")[0];

    // Helper to resolve current productId by currency (must match checkout IDs)
    const getCurrentProductId = () => {
        try {
            const curr = window.currencyManager?.getCurrentCurrency?.() || 'SGD';
            const map = { SGD: '3009', AUD: '3067', IDR: '3113' };
            return map[curr] || '3009';
        } catch (_) { return '3009'; }
    };
    const productId = getCurrentProductId();
    // Pick an effective column that exists (fallback to legacy '2594')
    async function resolveCommentsColumn(preferred) {
        try {
            const { error } = await supabase
                .from("all_customers_comments")
                .select(preferred)
                .eq("id", 1)
                .single();
            if (error && /does not exist/i.test(error.message)) return '2594';
            return preferred;
        } catch (_) {
            return '2594';
        }
    }

    // Generate a simple unique id for this comment to link images (table + bucket)
    const comment_id = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const newComment = {
        review_date,
        reviewer_name,
        comment,
        email,
        stars,
        comment_id,
    };

    try {
        // Safety check - ensure supabase is available
        if (typeof supabase === 'undefined') {
            throw new Error("Supabase client not available");
        }

        // 1) Handle optional image uploads (max 3)
        // NOTE: Configure your bucket name in BUCKET_NAME and multi-store table/column
        const BUCKET_NAME = 'review-images';
        const MULTI_STORE_TABLE = 'all_review_comment_images';
        const STORE_COLUMN = 'headphonezoo';
        const fileInput = document.getElementById('user_comment_images');
        const files = Array.from(fileInput?.files || []).slice(0, 3);
        let uploadedImagePaths = [];

        if (files.length > 0) {
            // Create a per-comment folder path (e.g., product/<productId>/<comment_id>/filename)
            for (const file of files) {
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const objectPath = `${productId}/${comment_id}/${Date.now()}_${safeName}`;
                const { error: uploadErr } = await supabase.storage.from(BUCKET_NAME).upload(objectPath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });
                if (uploadErr) throw uploadErr;
                uploadedImagePaths.push(objectPath);
            }

            // Store the mapping into the multi-store singleton table (JSONB array per store)
            // 1) Ensure the singleton row exists and fetch existing array
            let storeArray = [];
            let needInsertRow = false;
            try {
                const { data: msData, error: msErr } = await supabase
                    .from(MULTI_STORE_TABLE)
                    .select(STORE_COLUMN)
                    .eq('id', 1)
                    .single();
                if (msErr && /No rows|Row not found/i.test(msErr.message)) {
                    needInsertRow = true;
                } else if (!msErr) {
                    storeArray = Array.isArray(msData?.[STORE_COLUMN]) ? msData[STORE_COLUMN] : [];
                }
            } catch (_) { /* ignore */ }

            if (needInsertRow) {
                // Create singleton row with empty array for this store column
                try {
                    const initObj = { id: 1 };
                    initObj[STORE_COLUMN] = [];
                    await supabase.from(MULTI_STORE_TABLE).insert([initObj]);
                } catch (_) { /* ignore */ }
            }

            const newRecord = {
                comment_id,
                product_id: productId,
                reviewer_name,
                images: uploadedImagePaths
            };
            const updatedStoreArray = [newRecord, ...storeArray];

            // 2) Update the store column array
            try {
                const payload = {};
                payload[STORE_COLUMN] = updatedStoreArray;
                const { error: upErr } = await supabase
                    .from(MULTI_STORE_TABLE)
                    .update(payload)
                    .eq('id', 1);
                if (upErr) throw upErr;
            } catch (e) {
                throw e;
            }
        }

        // Resolve the column we can actually use in DB
        const effectiveColumn = await resolveCommentsColumn(productId);

        // Fetch existing array in the effective column (assume row with id = 1)
        const { data, error: fetchError } = await supabase
            .from("all_customers_comments")
            .select(effectiveColumn)
            .eq("id", 1)
            .single();

        if (fetchError) throw fetchError;

        const existingArray = data?.[effectiveColumn] || [];

        const updatedArray = [newComment, ...existingArray];

        // Update the column with the new array
        const { error: updateError } = await supabase
            .from("all_customers_comments")
            .update({ [effectiveColumn]: updatedArray })
            .eq("id", 1);

        if (updateError) throw updateError;

        document.getElementById("user_comment_form").reset();
        await fetchReviews(); // Optional: refresh UI
        showSuccessNotification();

        // Trigger animation for the newly added review
        setTimeout(() => {
            triggerAnimationForNewElements();
        }, 100);
    } catch (error) {
        console.error("Error inserting comment:", error.message);
    } finally {
        button.disabled = false;
        button.style.background = "#f0f0f0";
        button.style.color = "black";
        button.innerText = "Submit";
    }
});

// Function to trigger animation for newly added elements (optimized)
function triggerAnimationForNewElements() {
    // Get all review cards that have animation classes but haven't been animated yet
    const newAnimatedElements = document.querySelectorAll('.user_card_rate_div.animate-on-scroll:not(.in-view)');

    if (newAnimatedElements.length === 0) return;

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
        const triggerPoint = window.innerHeight * 0.9;

        newAnimatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;

            if (midpoint < triggerPoint) {
                el.classList.add('in-view');
            }
        });
    });
}

// Function to Fetch and Display Reviews
async function fetchReviews() {
    // Safety check - ensure supabase is available
    if (typeof supabase === 'undefined') {
        console.error("Supabase client not available");
        return;
    }

    try {
        const getCurrentProductId = () => {
            try {
                const curr = window.currencyManager?.getCurrentCurrency?.() || 'SGD';
                const map = { SGD: '3009', AUD: '3067', IDR: '3113' };
                return map[curr] || '3009';
            } catch (_) { return '3009'; }
        };
        const productId = getCurrentProductId();
        // Resolve an existing column name (fallback to legacy '2594')
        async function resolveCommentsColumn(preferred) {
            try {
                const { error } = await supabase
                    .from("all_customers_comments")
                    .select(preferred)
                    .eq("id", 1)
                    .single();
                if (error && /does not exist/i.test(error.message)) return '2594';
                return preferred;
            } catch (_) {
                return '2594';
            }
        }
        const effectiveColumn = await resolveCommentsColumn(productId);

        const { data, error } = await supabase
            .from("all_customers_comments")
            .select(effectiveColumn)
            .eq("id", 1)
            .single();

        if (error) throw error;

        const reviews = data?.[effectiveColumn] || [];

        // Fetch any images for these reviews from the new images table in one go
        const BUCKET_NAME = 'review-images';
        const MULTI_STORE_TABLE = 'all_review_comment_images';
        const STORE_COLUMN = 'headphonezoo';
        const commentIds = reviews.map(r => r.comment_id).filter(Boolean);
        let imagesMap = new Map();
        if (commentIds.length > 0) {
            const { data: msData, error: msErr } = await supabase
                .from(MULTI_STORE_TABLE)
                .select(STORE_COLUMN)
                .eq('id', 1)
                .single();
            if (!msErr && msData) {
                const arr = Array.isArray(msData[STORE_COLUMN]) ? msData[STORE_COLUMN] : [];
                // Optionally, filter records by current productId to avoid cross-product collisions
                for (const rec of arr) {
                    if (!rec || !rec.comment_id) continue;
                    if (!imagesMap.has(rec.comment_id)) imagesMap.set(rec.comment_id, rec.images || []);
                }
            }
        }

        let user_clint_rate_area = document.getElementById("user_clint_rate_area");
        user_clint_rate_area.innerHTML = "";

        reviews.forEach((item) => {
            const { review_date, reviewer_name, comment, stars, comment_id } = item;

            if (!comment.trim()) return;

            const div = document.createElement("div");
            div.classList.add("user_card_rate_div", "animate-on-scroll", "from-bottom");
            // Build inner HTML. Place the verified badge inside the star div on the
            // right side so it lines up with the stars.
            const starsHtml = `<span class="star-icons">${"★".repeat(stars)}${"☆".repeat(5 - stars)}</span>`;
            const verifiedHtml = isReviewVerified(item) ? '<span class="verified-badge">Verified Buyer</span>' : '';
            // Build toggleable images if available (max display 3, initially hidden)
            const storedPaths = imagesMap.get(comment_id) || [];
            const maxToShow = Math.min(3, storedPaths.length);
            let imagesToggleHtml = '';
            if (maxToShow > 0) {
                const imagesContainerId = `review_imgs_${comment_id}`;
                const btnId = `toggle_btn_${comment_id}`;
                // Create public URLs via getPublicUrl
                const publicUrls = storedPaths.slice(0, 3).map(p => {
                    const { data: pub } = supabase.storage.from(BUCKET_NAME).getPublicUrl(p);
                    return pub?.publicUrl || '';
                }).filter(Boolean);

                const imgsHtml = publicUrls
                    .map((url, idx) => `<img src="${url}" alt="review image ${idx + 1}" loading="lazy" style="width:100%;max-width:160px;height:auto;border-radius:8px;object-fit:cover;" />`)
                    .join('');

                imagesToggleHtml = `
                    <div class="review-images-wrap" style="margin-top:8px;">
                        <button id="${btnId}" type="button" class="review-images-toggle" data-images='${JSON.stringify(publicUrls)}' style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#f9fafb;cursor:pointer;">
                            <ion-icon name="images"></ion-icon>
                            <span>Show images (${maxToShow})</span>
                        </button>
                        <div id="${imagesContainerId}" class="review-images" style="display:none;margin-top:10px;gap:8px;flex-wrap:wrap;">
                            ${imgsHtml}
                        </div>
                    </div>`;
            }

            div.innerHTML = `
                <div class="card_clint_rate_date_div"><h3>${review_date}</h3></div>
                <div class="card_clint_rate_info_div">
                    <img src="p47-wireless-bluetooth-headphones/headphonezoo.webp" alt="p47 wireless bluetooth headphones - headphonezoo" title="p47 wireless bluetooth headphones - headphonezoo">
                    <h4>${reviewer_name}</h4>
                </div>
                <div class="card_clint_rate_comment_div"><h5>${comment}</h5></div>
                <div class="card_clint_rate_star_div">
                    ${starsHtml}
                    ${verifiedHtml}
                </div>
                ${imagesToggleHtml}
            `;
            user_clint_rate_area.appendChild(div);

            // Attach full-screen gallery behavior if images exist
            if ((imagesMap.get(comment_id) || []).length > 0) {
                const toggleBtn = div.querySelector('.review-images-toggle');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', () => {
                        try {
                            const data = toggleBtn.getAttribute('data-images') || '[]';
                            const urls = JSON.parse(data);
                            if (Array.isArray(urls) && urls.length) {
                                openReviewGallery(urls, 0);
                            }
                        } catch (_) { /* ignore */ }
                    });
                }
            }
        });

        // Trigger animation for newly added elements
        triggerAnimationForNewElements();
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
    }
}

// Function to Show Floating Success Notification
function showSuccessNotification() {
    let notification = document.getElementById("new_comment_success_notification");
    notification.style.display = "block";

    setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translateX(-50%) translateY(0px)";
    }, 10);

    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(-50%) translateY(10px)";
        setTimeout(() => {
            notification.style.display = "none";
        }, 400);
    }, 3000);
}

fetchReviews();

// Add optimized scroll event listener to handle animations for dynamically added reviews
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
        triggerAnimationForNewElements();
    }, 16); // ~60fps throttling
}, { passive: true });


// Review images full-screen gallery using existing modal
(function () {
    let reviewActive = false;
    let urls = [];
    let index = 0;
    let prevHandlerCapture, nextHandlerCapture, keyHandlerCapture, closeHandler, overlayHandler;

    const imageModal = document.getElementById('imageModal');
    const modalContent = imageModal ? imageModal.querySelector('.modal-content') : null;
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const modalPrevBtn = document.getElementById('modalPrevBtn');
    const modalNextBtn = document.getElementById('modalNextBtn');
    const modalClose = document.getElementById('modalClose');

    function applyOpenAnimation() {
        if (!imageModal || !modalContent) return;
        imageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modalContent.style.transition = 'transform 220ms ease, opacity 220ms ease';
        modalContent.style.transform = 'scale(0.985)';
        modalContent.style.opacity = '0';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                modalContent.style.transform = 'scale(1)';
                modalContent.style.opacity = '1';
            });
        });
    }

    function applyCloseAnimation(callback) {
        if (!imageModal || !modalContent) { if (callback) callback(); return; }
        modalContent.style.transition = 'transform 220ms ease, opacity 220ms ease';
        modalContent.style.transform = 'scale(0.985)';
        modalContent.style.opacity = '0';
        setTimeout(() => { if (callback) callback(); }, 220);
    }

    function render() {
        if (!modalImage) return;
        if (modalVideo) {
            try { modalVideo.pause(); } catch (_) { }
            modalVideo.style.display = 'none';
        }
        modalImage.style.display = 'block';
        modalImage.src = urls[index];
    }

    function prev() {
        if (!urls.length) return;
        index = (index - 1 + urls.length) % urls.length;
        render();
    }
    function next() {
        if (!urls.length) return;
        index = (index + 1) % urls.length;
        render();
    }

    function attachCaptureHandlers() {
        prevHandlerCapture = (e) => { e.stopPropagation(); e.preventDefault(); prev(); };
        nextHandlerCapture = (e) => { e.stopPropagation(); e.preventDefault(); next(); };
        keyHandlerCapture = (e) => {
            // capture to block ImageGallery key handlers
            e.stopPropagation();
            if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
            else if (e.key === 'Escape') { e.preventDefault(); close(); }
        };

        if (modalPrevBtn) modalPrevBtn.addEventListener('click', prevHandlerCapture, true);
        if (modalNextBtn) modalNextBtn.addEventListener('click', nextHandlerCapture, true);
        document.addEventListener('keydown', keyHandlerCapture, true);

        closeHandler = () => close();
        overlayHandler = (e) => { if (e.target === imageModal) close(); };
        if (modalClose) modalClose.addEventListener('click', closeHandler);
        if (imageModal) imageModal.addEventListener('click', overlayHandler);
    }

    function detachCaptureHandlers() {
        if (modalPrevBtn && prevHandlerCapture) modalPrevBtn.removeEventListener('click', prevHandlerCapture, true);
        if (modalNextBtn && nextHandlerCapture) modalNextBtn.removeEventListener('click', nextHandlerCapture, true);
        if (keyHandlerCapture) document.removeEventListener('keydown', keyHandlerCapture, true);
        if (modalClose && closeHandler) modalClose.removeEventListener('click', closeHandler);
        if (imageModal && overlayHandler) imageModal.removeEventListener('click', overlayHandler);
        prevHandlerCapture = nextHandlerCapture = keyHandlerCapture = closeHandler = overlayHandler = null;
    }

    function close() {
        if (!reviewActive) return;
        applyCloseAnimation(() => {
            if (imageModal) imageModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            detachCaptureHandlers();
            reviewActive = false;
        });
    }

    // Expose open function globally for use in fetchReviews
    window.openReviewGallery = function (imageUrls, startIndex) {
        if (!Array.isArray(imageUrls) || !imageUrls.length) return;
        urls = imageUrls.slice();
        index = Math.max(0, Math.min(startIndex || 0, urls.length - 1));
        reviewActive = true;
        render();
        applyOpenAnimation();
        attachCaptureHandlers();
    };
})();



















/* Click Counter (Stores as { Clicks: X, Year: Y }) */
async function insertNewClick(productID) {
    // Safety check - ensure supabase is available
    if (typeof supabase === 'undefined') {
        console.error("Supabase client not available for click tracking");
        return null;
    }

    const monthNames = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december"
    ];

    const now = new Date();
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    try {
        // 1️⃣ Fetch existing row
        const { data, error } = await supabase
            .from("checkout_click_counter")
            .select("*")
            .eq("product_id", productID)
            .single();

        if (error) {
            console.error("Error fetching data:", error.message);
            return null;
        }

        // 2️⃣ Get current month's data
        let monthData = data[currentMonth];
        let clicks = 0;
        let storedYear = currentYear;

        if (monthData && typeof monthData === "object") {
            // JSON format: { Clicks: 3, Year: 2025 }
            clicks = monthData.Clicks || 0;
            storedYear = monthData.Year || currentYear;
        } else if (typeof monthData === "number") {
            clicks = monthData;
        } else if (typeof monthData === "string") {
            // Parse old string formats
            try {
                const parsed = JSON.parse(monthData);
                if (typeof parsed === "object") {
                    clicks = parsed.Clicks || parsed.total || 0;
                    storedYear = parsed.Year || parsed.year || currentYear;
                } else {
                    clicks = parseInt(parsed, 10) || 0;
                }
            } catch {
                const match = monthData.match(/(d+)/);
                clicks = match ? parseInt(match[1], 10) : 0;
            }
        }

        // 3️⃣ Reset counter if year changed
        if (storedYear !== currentYear) {
            clicks = 0;
        }

        // 4️⃣ Increment click count
        const updatedClicks = clicks + 1;

        // 5️⃣ Create new JSON object with capitalized keys
        const newData = {
            Clicks: updatedClicks,
            Year: currentYear
        };

        // 6️⃣ Update Supabase
        const { error: updateError } = await supabase
            .from("checkout_click_counter")
            .update({ [currentMonth]: newData })
            .eq("product_id", productID);

        if (updateError) {
            console.error("Error updating value:", updateError.message);
            return null;
        }

        console.log(`✅ Click recorded: ${updatedClicks} total for ${currentMonth} ${currentYear}`);
        return newData;
    } catch (err) {
        console.error("insertNewClick error:", err);
        return null;
    }
}