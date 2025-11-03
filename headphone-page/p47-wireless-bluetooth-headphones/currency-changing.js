/* ============================================
   CURRENCY CHANGING FUNCTIONALITY
   ============================================
   
   This file handles currency changes between different currencies.
   - Centralized currency configuration for easy management
   - Updates prices with fixed values for each currency
   - Updates delivery date range based on currency
   - Updates shipping answer in FAQ
   - Triggers DynamicNumbers with currency-specific storage
   - Prevents duplicate number changes on repeated clicks
   - Closes mobile navigation after currency selection
   - Shows professional success notification with smooth animations
   - Handles refund policy link click to scroll and expand FAQ
   
   ============================================ */

class CurrencyManager {
    constructor() {
        this.storageKey = 'currencyData';
        this.currencies = {
            'SGD': {
                name: 'Singapore Dollar',
                code: 'SGD',
                symbol: '$',
                displayName: 'Singapore',
                oldPrice: 33.89,
                newPrice: 19.12,
                discount: 42,
                deliveryRange: '7-9',
                displayFormat: (price) => `${this.currencies.SGD.symbol}${price.toFixed(2)}`
            },
            'AUD': {
                name: 'Australian Dollar',
                code: 'AUD',
                symbol: '$',
                displayName: 'Australia',
                oldPrice: 50.28,
                newPrice: 21.12,
                discount: 58,
                deliveryRange: '7-12',
                displayFormat: (price) => `${this.currencies.AUD.symbol}${price.toFixed(2)}`
            },
            'IDR': {
                name: 'Indonesian Rupiah',
                code: 'IDR',
                symbol: 'Rp',
                displayName: 'Indonesia',
                oldPrice: 78000,
                newPrice: 54120,
                discount: 63,
                deliveryRange: '4-8',
                displayFormat: (price) => `${price.toLocaleString('en-US')}`
            }
        };

        this.currentCurrency = this.getStoredCurrency() || 'SGD';
        this.init();
    }

    init() {
        // Listen for currency option clicks
        this.setupCurrencyListeners();

        // Apply initial currency settings
        this.applyCurrencySettings(this.currentCurrency);

        // Setup refund policy link handler
        this.setupRefundPolicyLink();
    }

    getStoredCurrency() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored).currency : null;
        } catch (e) {
            return null;
        }
    }

    getCurrentCurrency() {
        return this.currentCurrency;
    }

    storeCurrency(currency) {
        try {
            const data = { currency, lastChange: Date.now() };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not store currency data');
        }
    }

    setupCurrencyListeners() {
        // Desktop currency menu
        const currencyMenu = document.getElementById('currencyMenu');
        if (currencyMenu) {
            currencyMenu.addEventListener('click', (e) => {
                const option = e.target.closest('.currency-option');
                if (option) {
                    e.preventDefault();
                    const currencyCode = option.getAttribute('data-currency');
                    if (currencyCode && this.currencies[currencyCode]) {
                        this.handleCurrencyChange(currencyCode);
                    }
                }
            });
        }

        // Mobile currency menu
        const mobileCurrencyMenu = document.getElementById('mobileCurrencyMenu');
        if (mobileCurrencyMenu) {
            mobileCurrencyMenu.addEventListener('click', (e) => {
                const option = e.target.closest('.mobile-currency-option');
                if (option) {
                    e.preventDefault();
                    const currencyCode = option.getAttribute('data-currency');
                    if (currencyCode && this.currencies[currencyCode]) {
                        this.handleCurrencyChange(currencyCode);
                    }
                }
            });
        }
    }

    async handleCurrencyChange(newCurrency) {
        // Check if currency is actually changing
        if (this.currentCurrency === newCurrency) {
            return; // Already on this currency, do nothing
        }

        // Get the main container and mobile nav
        const container = document.getElementById('website-front-page-container');
        const mobileNav = document.getElementById('mobileNav');

        // Start fade out animation and hide mobile nav
        if (container) {
            container.classList.remove('fade-in');
            container.classList.add('fade-out');

            // Close mobile nav immediately when starting fade out
            if (mobileNav) {
                mobileNav.classList.remove('open');
                document.body.style.overflow = 'auto';
                const overlay = document.getElementById('overlay');
                if (overlay) overlay.classList.remove('active');
            }
        }

        // Wait for fade out to complete (1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Change the currency
        this.currentCurrency = newCurrency;
        this.storeCurrency(newCurrency);
        this.applyCurrencySettings(newCurrency);

        // Close dropdowns (already handled mobile nav)
        this.closeDropdowns();

        // Show success notification
        this.showCurrencyChangeNotification(newCurrency);

        // Start fade in animation
        if (container) {
            // Force reflow to ensure the browser registers the class change
            void container.offsetHeight;
            container.classList.remove('fade-out');
            container.classList.add('fade-in');
        }
    }

    closeDropdowns() {
        // Close desktop dropdown
        const currencyTrigger = document.getElementById('currencyTrigger');
        const currencyMenu = document.getElementById('currencyMenu');
        if (currencyTrigger && currencyMenu) {
            currencyTrigger.classList.remove('active');
            currencyMenu.classList.remove('show');
        }

        // Close mobile dropdown
        const mobileCurrencyTrigger = document.getElementById('mobileCurrencyTrigger');
        const mobileCurrencyMenu = document.getElementById('mobileCurrencyMenu');
        if (mobileCurrencyTrigger && mobileCurrencyMenu) {
            mobileCurrencyTrigger.classList.remove('active');
            mobileCurrencyMenu.classList.remove('show');
        }
    }

    closeMobileNav() {
        const mobileNav = document.getElementById('mobileNav');
        const overlay = document.getElementById('overlay');

        if (mobileNav && overlay) {
            mobileNav.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    showCurrencyChangeNotification(currency) {
        // Get currency name from configuration
        const currencyData = this.currencies[currency];
        if (!currencyData) return;

        const currencyName = currencyData.name;

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'currency-change-notification';
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 14px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.2px;
            width: fit-content;
            max-width: 280px;
            transform: translateX(calc(100% + 40px));
            opacity: 0;
            transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        // Add responsive media query styles
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .currency-change-notification {
                    top: 40px !important;
                    right: 10px !important;
                    max-width: calc(100% - 20px) !important;
                    min-width: auto !important;
                    padding: 12px 16px !important;
                    font-size: 13px !important;
                }
            }
            @media (max-width: 480px) {
                .currency-change-notification {
                    top: 50px !important;
                    right: 8px !important;
                    padding: 10px 14px !important;
                    font-size: 12px !important;
                    gap: 8px !important;
                }
                .currency-change-notification svg {
                    width: 20px !important;
                    height: 20px !important;
                }
            }
        `;
        document.head.appendChild(style);

        notification.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Currency Changed To ${currencyName}</span>
        `;

        document.body.appendChild(notification);

        // Trigger animation - slide in from right with slower movement
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                notification.style.transform = 'translateX(0)';
                notification.style.opacity = '1';
            });
        });

        // Auto-remove after 2.5 seconds with faster slide out animation
        setTimeout(() => {
            // Change transition to faster exit animation
            notification.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            notification.style.transform = 'translateX(calc(100% + 40px))';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    notification.remove();
                }
            }, 500);
        }, 2500);
    }

    applyCurrencySettings(currency) {
        this.updatePrices(currency);
        this.updateDeliveryDate(currency);
        this.updateCurrencyDisplay(currency);
        this.triggerDynamicNumbers(currency);
        this.updateShippingAnswer(currency);
    }

    updatePrices(currency) {
        const oldPriceElement = document.querySelector('.old-price');
        const newPriceElement = document.querySelector('.new-price');
        const currentCurrencyElement = document.querySelector('.current-currency');
        const discountBadge = document.querySelector('.discount-badge');

        const currencyData = this.currencies[currency];
        if (!currencyData) return;

        if (oldPriceElement) oldPriceElement.textContent = currencyData.displayFormat(currencyData.oldPrice);
        if (newPriceElement) newPriceElement.textContent = currencyData.displayFormat(currencyData.newPrice);
        if (currentCurrencyElement) currentCurrencyElement.textContent = currencyData.code;
        if (discountBadge) discountBadge.textContent = `${currencyData.discount}% OFF`;

        // Update sticky bar prices
        this.updateStickyBarPrices(currency);
    }

    updateStickyBarPrices(currency) {
        const stickyOldPrice = document.getElementById('stickyOldPrice');
        const stickyNewPrice = document.getElementById('stickyNewPrice');
        const stickyCurrency = document.getElementById('stickyCurrency');

        const oldPriceElement = document.querySelector('.old-price');
        const newPriceElement = document.querySelector('.new-price');
        const currentCurrencyElement = document.querySelector('.current-currency');

        if (stickyOldPrice && oldPriceElement) {
            stickyOldPrice.textContent = oldPriceElement.textContent;
        }
        if (stickyNewPrice && newPriceElement) {
            stickyNewPrice.textContent = newPriceElement.textContent;
        }
        if (stickyCurrency && currentCurrencyElement) {
            stickyCurrency.textContent = currentCurrencyElement.textContent;
        }
    }

    updateDeliveryDate(currency) {
        const deliveryTextElement = document.querySelector('#deliveryText');
        if (!deliveryTextElement) return;

        const currencyData = this.currencies[currency];
        if (!currencyData) return;

        // Get delivery range from currency data
        const deliveryRange = `${currencyData.deliveryRange} Days`;

        // Recalculate delivery dates
        const [minDays, maxDays] = this.extractDays(deliveryRange);
        const today = new Date();
        const minDate = this.addDays(today, minDays);
        const maxDate = this.addDays(today, maxDays);

        const deliveryText = this.formatDeliveryText(today, minDate, maxDate);
        deliveryTextElement.textContent = deliveryText;
    }

    extractDays(range) {
        const match = range.match(/(\d+)\s*-\s*(\d+)/);
        if (match) return [parseInt(match[1]), parseInt(match[2])];
        const single = range.match(/(\d+)/);
        return single ? [parseInt(single[1]), parseInt(single[1])] : [7, 9];
    }

    addDays(date, days) {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + days);
        return newDate;
    }

    formatDeliveryText(today, minDate, maxDate) {
        const sameMonth = minDate.getMonth() === maxDate.getMonth();
        const sameYear = minDate.getFullYear() === maxDate.getFullYear();

        const formatDate = (d) => {
            const day = d.getDate();
            const month = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();
            return `${day} ${month} ${year}`;
        };

        if (minDate.getTime() === maxDate.getTime()) {
            return `Estimated delivery by ${formatDate(minDate)}`;
        } else if (sameMonth && sameYear) {
            const month = minDate.toLocaleString('default', { month: 'short' });
            const year = minDate.getFullYear();
            return `Estimated delivery by ${minDate.getDate()}-${maxDate.getDate()} ${month} ${year}`;
        } else {
            return `Estimated delivery by ${formatDate(minDate)} - ${formatDate(maxDate)}`;
        }
    }

    updateCurrencyDisplay(currency) {
        // Update currency selector button text
        const currencyTrigger = document.getElementById('currencyTrigger');
        const mobileCurrencyTrigger = document.getElementById('mobileCurrencyTrigger');
        const currencyData = this.currencies[currency];

        if (!currencyData) return;

        if (currencyTrigger) {
            currencyTrigger.querySelector('span').textContent = currencyData.displayName;
        }

        if (mobileCurrencyTrigger) {
            mobileCurrencyTrigger.querySelector('span').textContent =
                `${currencyData.name} (${currencyData.code})`;
        }
    }

    // Generate a consistent random number based on a seed
    generateSeededRandom(seed, min, max) {
        // Create a simple hash from the seed
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        // Use the hash to generate a pseudo-random number between min and max
        const random = (Math.abs(hash) % 1000000) / 1000000; // 0-1
        return Math.floor(random * (max - min + 1)) + min;
    }

    // Get current 4-day period key based on date
    getCurrentPeriodKey() {
        // Use a fixed date (Nov 2, 2025) as reference
        const referenceDate = new Date('2025-11-02T00:00:00Z');
        const now = new Date();

        // Calculate days since reference date
        const diffTime = now - referenceDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Calculate 4-day periods since reference date
        return Math.floor(diffDays / 4);
    }

    triggerDynamicNumbers(currency) {
        const periodKey = this.getCurrentPeriodKey();

        // Generate consistent numbers based on period and currency
        const numbers = {
            lowStock: this.generateSeededRandom(`period_${periodKey}_${currency}_low`, 5, 15),
            reviews: this.generateSeededRandom(`period_${periodKey}_${currency}_reviews`, 90, 195),
            sales: this.generateSeededRandom(`period_${periodKey}_${currency}_sales`, 40, 180)
        };

        this.applyNumbers(numbers);
        this.updateSchemaReviewCount(numbers.reviews);
    }

    applyNumbers(numbers) {
        // Update sales number
        const salesSpan = document.querySelector('.sales-number');
        if (salesSpan) {
            salesSpan.textContent = numbers.sales;
        }

        // Update reviews number (keeping 4.9/5 rating static)
        const ratingSpan = document.querySelector('.rating-text');
        if (ratingSpan) {
            ratingSpan.textContent = `4.9/5 (${numbers.reviews} reviews)`;
        }

        // Update low stock number
        const lowStockSpan = document.querySelector('.low-stock');
        if (lowStockSpan) {
            lowStockSpan.textContent = numbers.lowStock;
        }
    }

    updateSchemaReviewCount(reviewCount) {
        // Update JSON-LD structured data - target the Product schema specifically
        const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (let schemaScript of schemaScripts) {
            try {
                const schemaData = JSON.parse(schemaScript.textContent);
                if (schemaData.aggregateRating && schemaData['@type'] === 'Product') {
                    schemaData.aggregateRating.reviewCount = reviewCount.toString();
                    schemaScript.textContent = JSON.stringify(schemaData);
                    break; // Update only the first Product schema found
                }
            } catch (e) {
                // Skip malformed JSON and continue to next script
                continue;
            }
        }
    }

    updateShippingAnswer(currency) {
        const shippingAnswer = document.getElementById('shippingAnswer');
        if (!shippingAnswer) return;

        // Get the currency data
        const currencyData = this.currencies[currency];
        if (!currencyData) return;

        // Get the delivery range from currency data and format it
        const [minDays, maxDays] = this.extractDays(currencyData.deliveryRange);
        const shippingTime = minDays === maxDays
            ? `${minDays} business days`
            : `${minDays}-${maxDays} business days`;

        shippingAnswer.textContent = `We offer free standard shipping which typically takes ${shippingTime}.`;
    }

    setupRefundPolicyLink() {
        const refundPolicyLink = document.querySelector('.refund-policy-link');
        if (!refundPolicyLink) return;

        refundPolicyLink.addEventListener('click', (e) => {
            e.preventDefault();

            // Find the return-policy element
            const returnPolicyElement = document.getElementById('return-policy');
            if (!returnPolicyElement) return;

            // Find the FAQ answer within the return-policy item
            const faqAnswer = returnPolicyElement.querySelector('.faq-answer');
            if (!faqAnswer) return;

            // Check if FAQ is currently hidden
            const isHidden = !returnPolicyElement.classList.contains('active');

            // Scroll to the element with offset for header
            const headerOffset = 80;
            const elementPosition = returnPolicyElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // If FAQ is hidden, show it after scroll
            if (isHidden) {
                setTimeout(() => {
                    // Close all FAQ items first
                    document.querySelectorAll('.faq-item').forEach(item => {
                        item.classList.remove('active');
                    });

                    // Open the return policy FAQ
                    returnPolicyElement.classList.add('active');
                }, 300); // Wait for scroll to start
            }
        });
    }
}

// Initialize Currency Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.currencyManager = new CurrencyManager();
});

