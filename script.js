// Premium JavaScript for enhanced interactivity

// Function to generate star rating HTML based on numeric rating
function generateStarRating(rating) {
    // For products with no rating (like coming soon), show empty stars
    if (rating === 0) {
        return '<i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>';
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }

    // Add half star if needed
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }

    return starsHTML;
}

// Function to generate product card HTML
function generateProductCard(product) {
    const starRating = generateStarRating(product.rating);
    const ratingDisplay = product.rating === 0 ? '' : `<span class="rating-count">(${product.rating})</span>`;
    const comingSoonOverlay = product.comingSoon ? `
        <div class="coming-soon-overlay">
            <div class="coming-soon-badge">
                <i class="fas fa-clock"></i>
                <span>Coming Soon</span>
            </div>
        </div>
    ` : '';

    return `
        <div class="product-card ${product.comingSoon ? 'coming-soon' : ''}" data-url="${product.url}">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.alt}" class="product-image">
                ${comingSoonOverlay}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    ${starRating}
                    ${ratingDisplay}
                </div>
            </div>
        </div>
    `;
}

// Function to render products for a section
function renderProducts(sectionKey, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (container && productsData[sectionKey]) {
        const productsHTML = productsData[sectionKey].map(product =>
            generateProductCard(product)
        ).join('');
        container.innerHTML = productsHTML;
    }
}

// Function to render all products
function renderAllProducts() {
    renderProducts('most-sold', '.most-sold .products-grid');
    renderProducts('newest', '.newest .products-grid');
    renderProducts('others', '.others .products-grid');
}

// Function to attach event listeners to product cards
function attachProductCardListeners() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        // Only attach click listeners to non-coming-soon products
        if (!card.classList.contains('coming-soon')) {
            card.addEventListener('click', function (e) {
                // Get the individual product URL from data attribute
                const productUrl = this.getAttribute('data-url');
                // Open the specific product page in a new tab
                window.open(productUrl, '_blank');
            });
        }
        // Coming soon products remain completely unclickable
    });
}


document.addEventListener('DOMContentLoaded', function () {
    // Render all products first
    renderAllProducts();

    // Attach event listeners to the dynamically generated cards
    attachProductCardListeners();

    // Enhanced header animation with stagger effect
    const header = document.querySelector('header');
    const logo = document.querySelector('.logo');
    const title = document.querySelector('.store-title');

    // Initial state
    header.style.transform = 'translateY(-20px)';
    header.style.opacity = '0';
    logo.style.transform = 'scale(0.8)';
    logo.style.opacity = '0';
    title.style.transform = 'translateY(10px)';
    title.style.opacity = '0';

    // Animate elements with stagger
    setTimeout(() => {
        header.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        header.style.transform = 'translateY(0)';
        header.style.opacity = '1';
    }, 200);

    setTimeout(() => {
        logo.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        logo.style.transform = 'scale(1)';
        logo.style.opacity = '1';
    }, 400);

    setTimeout(() => {
        title.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        title.style.transform = 'translateY(0)';
        title.style.opacity = '1';
    }, 600);

    // Add scroll-triggered animations for sections
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(section);
    });

    // Product search/filter
    const searchInput = document.getElementById('product-search-input-id');
    const clearBtn = document.getElementById('clear-search-btn');

    function showCard(card) {
        // If it was previously display:none, make it flow first
        if (window.getComputedStyle(card).display === 'none') {
            card.style.display = '';
        }
        // Start hidden state to enable fade-in
        card.classList.add('is-hidden');
        // Next frame, remove hidden to animate to visible
        requestAnimationFrame(() => {
            card.classList.remove('is-hidden');
        });
    }

    function hideCard(card) {
        // Add hidden class to fade out
        card.classList.add('is-hidden');
        // After transition completes, set display:none to remove from layout
        const onEnd = () => {
            // Ensure it is still intended to be hidden
            if (card.classList.contains('is-hidden')) {
                card.style.display = 'none';
            }
            card.removeEventListener('transitionend', onEnd);
        };
        card.addEventListener('transitionend', onEnd, { once: true });
    }

    function updateSectionTitlesVisibility() {
        const grids = document.querySelectorAll('.products-grid');
        grids.forEach(grid => {
            const cards = Array.from(grid.querySelectorAll('.product-card'));
            const visibleCount = cards.reduce((count, card) => {
                const display = window.getComputedStyle(card).display;
                return count + (display !== 'none' ? 1 : 0);
            }, 0);
            const titleEl = grid.previousElementSibling;
            if (titleEl && titleEl.classList && titleEl.classList.contains('section-title')) {
                titleEl.style.display = visibleCount > 0 ? '' : 'none';
            }
        });
    }

    function filterProductsByName(query) {
        const normalizedQuery = query.trim().toLowerCase();
        const cards = document.querySelectorAll('.product-card');
        if (!normalizedQuery) {
            cards.forEach(card => {
                showCard(card);
            });
            updateSectionTitlesVisibility();
            return;
        }
        cards.forEach(card => {
            const nameEl = card.querySelector('.product-name');
            const productName = nameEl ? nameEl.innerText.trim().toLowerCase() : '';
            const isMatch = productName.includes(normalizedQuery);
            if (isMatch) {
                showCard(card);
            } else {
                hideCard(card);
            }
        });
        updateSectionTitlesVisibility();
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterProductsByName(searchInput.value);
        });
    }

    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', () => {
            if (searchInput.value) {
                searchInput.value = '';
                filterProductsByName('');
                searchInput.focus();
            } else {
                searchInput.focus();
            }
        });
    }

    // Initial check to ensure titles reflect currently visible cards (e.g., after render)
    updateSectionTitlesVisibility();
});
