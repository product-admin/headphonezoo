/* ============================================
   CURRENCY CHANGING FUNCTIONALITY
   ============================================
   
   This file handles currency changes between SGD and AUD.
   - Updates prices with fixed values for each currency:
     * SGD: $31.87 → $19.12
     * AUD: $36.87 → $24.12
   - Updates delivery date range (7-9 days for SGD, 7-12 days for AUD)
   - Triggers DynamicNumbers with currency-specific storage
   - Prevents duplicate number changes on repeated clicks
   - Closes mobile navigation after currency selection
   
   ============================================ */

class CurrencyManager {
    constructor() {
        this.storageKey = 'currencyData';
        this.currentCurrency = this.getStoredCurrency() || 'SGD';
        this.init();
    }

    init() {
        // Listen for currency option clicks
        this.setupCurrencyListeners();

        // Apply initial currency settings
        this.applyCurrencySettings(this.currentCurrency);
    }

    getStoredCurrency() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored).currency : null;
        } catch (e) {
            return null;
        }
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
                    const text = option.textContent.trim();
                    if (text.includes('Australia') || text.includes('AUD')) {
                        this.handleCurrencyChange('AUD');
                    } else if (text.includes('Singapore') || text.includes('SGD')) {
                        this.handleCurrencyChange('SGD');
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
                    const text = option.textContent.trim();
                    if (text.includes('Australia') || text.includes('AUD')) {
                        this.handleCurrencyChange('AUD');
                    } else if (text.includes('Singapore') || text.includes('SGD')) {
                        this.handleCurrencyChange('SGD');
                    }
                }
            });
        }
    }

    handleCurrencyChange(newCurrency) {
        // Check if currency is actually changing
        if (this.currentCurrency === newCurrency) {
            return; // Already on this currency, do nothing
        }

        this.currentCurrency = newCurrency;
        this.storeCurrency(newCurrency);
        this.applyCurrencySettings(newCurrency);

        // Close dropdowns
        this.closeDropdowns();

        // Close mobile navigation if open
        this.closeMobileNav();
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

    applyCurrencySettings(currency) {
        this.updatePrices(currency);
        this.updateDeliveryDate(currency);
        this.updateCurrencyDisplay(currency);
        this.triggerDynamicNumbers(currency);
    }

    updatePrices(currency) {
        const oldPriceElement = document.querySelector('.old-price');
        const newPriceElement = document.querySelector('.new-price');
        const currentCurrencyElement = document.querySelector('.current-currency');

        // Define specific prices for each currency
        const prices = {
            SGD: {
                oldPrice: 31.87,
                newPrice: 19.12
            },
            AUD: {
                oldPrice: 36.87,
                newPrice: 24.12
            }
        };

        const currencyPrices = prices[currency];

        if (oldPriceElement) oldPriceElement.textContent = `$${currencyPrices.oldPrice.toFixed(2)}`;
        if (newPriceElement) newPriceElement.textContent = `$${currencyPrices.newPrice.toFixed(2)}`;
        if (currentCurrencyElement) currentCurrencyElement.textContent = currency;

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

        // Determine delivery range based on currency
        const deliveryRange = currency === 'AUD' ? '7-12 Days' : '7-9 Days';

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
            return `You will have it by ${formatDate(minDate)}`;
        } else if (sameMonth && sameYear) {
            const month = minDate.toLocaleString('default', { month: 'short' });
            const year = minDate.getFullYear();
            return `You will have it by ${minDate.getDate()}-${maxDate.getDate()} ${month} ${year}`;
        } else {
            return `You will have it by ${formatDate(minDate)} - ${formatDate(maxDate)}`;
        }
    }

    updateCurrencyDisplay(currency) {
        // Update currency selector button text
        const currencyTrigger = document.getElementById('currencyTrigger');
        const mobileCurrencyTrigger = document.getElementById('mobileCurrencyTrigger');

        if (currencyTrigger) {
            currencyTrigger.querySelector('span').textContent = currency === 'AUD' ? 'Australia' : 'Singapore';
        }

        if (mobileCurrencyTrigger) {
            mobileCurrencyTrigger.querySelector('span').textContent =
                currency === 'AUD' ? 'Australia Dollar (AUD)' : 'Singapore Dollar (SGD)';
        }
    }

    triggerDynamicNumbers(currency) {
        // Create currency-specific storage key
        const currencyStorageKey = `dynamicNumbersData_${currency}`;
        const storedData = this.getStoredNumbers(currencyStorageKey);
        const now = Date.now();
        const updateInterval = 4 * 24 * 60 * 60 * 1000; // 4 days

        // Check if we need to update numbers for this currency
        if (!storedData || (now - storedData.lastUpdate) >= updateInterval) {
            this.updateNumbersForCurrency(currency, currencyStorageKey);
        } else {
            this.applyStoredNumbers(storedData);
        }
    }

    getStoredNumbers(storageKey) {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    }

    storeNumbers(storageKey, data) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not store dynamic numbers data');
        }
    }

    generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    updateNumbersForCurrency(currency, storageKey) {
        const numbers = {
            lowStock: this.generateRandomNumber(5, 15),
            reviews: this.generateRandomNumber(90, 195),
            sales: this.generateRandomNumber(40, 180),
            lastUpdate: Date.now()
        };

        this.storeNumbers(storageKey, numbers);
        this.applyNumbers(numbers);

        // Also update the schema review count
        this.updateSchemaReviewCount(numbers.reviews);
    }

    applyStoredNumbers(data) {
        this.applyNumbers({
            lowStock: data.lowStock,
            reviews: data.reviews,
            sales: data.sales
        });
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
}

// Initialize Currency Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CurrencyManager();
});

