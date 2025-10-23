/* ============================================
   AUTOMATIC NUMBER CHANGING FUNCTIONALITY
   ============================================

   This file contains all code related to automatically
   updating dynamic numbers on the page.

   Features:
   - Sales numbers (40-180 range)
   - Review counts (90-195 range)
   - Low stock numbers (5-15 range)
   - Updates every 4 days
   - Stores in browser localStorage

   ============================================ */

// Dynamic Numbers System - Updates every 4 days
class DynamicNumbers {
    constructor() {
        this.storageKey = 'dynamicNumbersData';
        this.updateInterval = 4 * 24 * 60 * 60 * 1000; // 4 days in milliseconds
        this.init();
    }

    init() {
        const storedData = this.getStoredData();
        const now = Date.now();

        // Check if we need to update numbers
        if (!storedData || (now - storedData.lastUpdate) >= this.updateInterval) {
            this.updateNumbers();
        } else {
            this.applyStoredNumbers(storedData);
        }
    }

    getStoredData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    }

    storeData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not store dynamic numbers data');
        }
    }

    generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    updateNumbers() {
        const numbers = {
            lowStock: this.generateRandomNumber(5, 15),
            reviews: this.generateRandomNumber(90, 195),
            sales: this.generateRandomNumber(40, 180),
            lastUpdate: Date.now()
        };

        this.storeData(numbers);
        this.applyNumbers(numbers);
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

        // Update JSON-LD schema with new review count
        this.updateSchemaReviewCount(numbers.reviews);
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




















/* ============================================
   AUTOMATIC DELIVERY DATE FUNCTIONALITY
   ============================================
   - Define your delivery window (e.g. "7-9 Days")
   - Automatically calculates expected delivery dates
   - Updates element with class or id "deliveryText"
   ============================================ */

class DeliveryDateCalculator {
    constructor(deliveryRange = "7-9 Days", selector = "#deliveryText") {
        this.deliveryRange = deliveryRange;
        this.selector = selector;
        this.init();
    }

    init() {
        const deliveryTextElement = document.querySelector(this.selector);
        if (!deliveryTextElement) return;

        const [minDays, maxDays] = this.extractDays(this.deliveryRange);
        const today = new Date();
        const minDate = this.addDays(today, minDays);
        const maxDate = this.addDays(today, maxDays);

        const deliveryText = this.formatDeliveryText(today, minDate, maxDate);
        deliveryTextElement.textContent = deliveryText;
    }

    extractDays(range) {
        const match = range.match(/(d+)s*-s*(d+)/);
        if (match) return [parseInt(match[1]), parseInt(match[2])];
        const single = range.match(/(d+)/);
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
}







// Initialize Dynamic Numbers System when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DynamicNumbers();

    // Example: "7-9 Days" delivery
    new DeliveryDateCalculator("7-9 Days", "#deliveryText");
});