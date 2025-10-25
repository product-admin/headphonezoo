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

    const newComment = {
        review_date,
        reviewer_name,
        comment,
        email,
        stars,
    };

    try {
        // Safety check - ensure supabase is available
        if (typeof supabase === 'undefined') {
            throw new Error("Supabase client not available");
        }

        // Fetch existing array in that column (assume row with id = 1)
        const { data, error: fetchError } = await supabase.from("all_customers_comments").select("2594").eq("id", 1).single();

        if (fetchError) throw fetchError;

        const existingArray = data["2594"] || [];

        const updatedArray = [newComment, ...existingArray];

        // Update the column with the new array
        const { error: updateError } = await supabase
            .from("all_customers_comments")
            .update({ "3009": updatedArray })
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
        const { data, error } = await supabase.from("all_customers_comments").select("2594").eq("id", 1).single();

        if (error) throw error;

        const reviews = data["2594"] || [];

        let user_clint_rate_area = document.getElementById("user_clint_rate_area");
        user_clint_rate_area.innerHTML = "";

        reviews.forEach((item) => {
            const { review_date, reviewer_name, comment, stars } = item;

            if (!comment.trim()) return;

            const div = document.createElement("div");
            div.classList.add("user_card_rate_div", "animate-on-scroll", "from-bottom");
            // Build inner HTML. Place the verified badge inside the star div on the
            // right side so it lines up with the stars.
            const starsHtml = `<span class="star-icons">${"★".repeat(stars)}${"☆".repeat(5 - stars)}</span>`;
            const verifiedHtml = isReviewVerified(item) ? '<span class="verified-badge">Verified Buyer</span>' : '';
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
            `;
            user_clint_rate_area.appendChild(div);
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