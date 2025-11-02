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
        this.init();
    }

    init() {
        this.updateNumbers();
    }

    // Generate a consistent random number based on date and a seed
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

    // Get current period key (changes every 4 days)
    getCurrentPeriodKey() {
        // Use a fixed date string (YYYY-MM-DD) for consistent timezone handling
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // Gets YYYY-MM-DD in UTC
        
        // Calculate days since a fixed date (e.g., 2020-01-01) and divide by 4
        const fixedDate = new Date('2020-01-01T00:00:00Z');
        const diffTime = now - fixedDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const period = Math.floor(diffDays / 4); // Change every 4 days
        
        return `period_${period}`;
    }

    updateNumbers() {
        const periodKey = this.getCurrentPeriodKey();
        
        // Generate numbers based on the period key - this will be the same for all users in the same period
        const numbers = {
            lowStock: this.generateSeededRandom(periodKey + 'low', 5, 15),
            reviews: this.generateSeededRandom(periodKey + 'reviews', 90, 195),
            sales: this.generateSeededRandom(periodKey + 'sales', 40, 180)
        };

        this.applyNumbers(numbers);
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
            return `Estimated delivery by ${formatDate(minDate)}`;
        } else if (sameMonth && sameYear) {
            const month = minDate.toLocaleString('default', { month: 'short' });
            const year = minDate.getFullYear();
            return `Estimated delivery by ${minDate.getDate()}-${maxDate.getDate()} ${month} ${year}`;
        } else {
            return `Estimated delivery by ${formatDate(minDate)} - ${formatDate(maxDate)}`;
        }
    }
}







// Initialize Dynamic Numbers System when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DynamicNumbers();

    // Example: "7-9 Days" delivery
    new DeliveryDateCalculator("7-9 Days", "#deliveryText");
});