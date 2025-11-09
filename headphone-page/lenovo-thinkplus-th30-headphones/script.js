
// Configuration - Set offer end date as a string (e.g., "29 Sept 2025")
const offerConfig = {
    endDateString: "30 Nov 2025"
};

let countdownEndDate;






// Initialize countdown end date from string
function initializeCountdown() {
    if (offerConfig.endDateString) {
        // Parse date string (supports formats like "29 Sept 2025" or "2025-09-29")
        countdownEndDate = new Date(offerConfig.endDateString);
        if (isNaN(countdownEndDate.getTime())) {
            // Fallback: try parsing as ISO
            countdownEndDate = new Date(Date.parse(offerConfig.endDateString));
        }
    } else {
        // Default: 24 hours from now
        countdownEndDate = new Date();
        countdownEndDate.setTime(countdownEndDate.getTime() + (24 * 60 * 60 * 1000));
    }
}

// Mobile menu functionality
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeNavBtn = document.getElementById('closeNavBtn');
const mobileNav = document.getElementById('mobileNav');
const overlay = document.getElementById('overlay');

function openMobileNav() {
    mobileNav.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
    mobileNav.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Mobile menu functionality - only add event listeners if elements exist
if (mobileMenuBtn && mobileNav && closeNavBtn && overlay) {
    mobileMenuBtn.addEventListener('click', openMobileNav);
    closeNavBtn.addEventListener('click', closeMobileNav);
    overlay.addEventListener('click', closeMobileNav);
}

// FAQ toggle functionality with smooth transitions
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        const isActive = item.classList.contains('active');

        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(faqItem => {
            faqItem.classList.remove('active');
        });

        // Open clicked item if it was closed
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Countdown timer with configurable offer period


function updateCountdown() {
    const now = new Date();
    const difference = countdownEndDate - now;
    const countdownText = document.querySelector('.countdown-text');
    const countdownElem = document.querySelector('.countdown');
    const endDateString = offerConfig.endDateString || countdownEndDate.toLocaleDateString();
    const offerEndDateSpan = document.getElementById('offerEndDate');
    const daysUnit = document.getElementById('daysUnit');
    const secondsUnit = document.getElementById('secondsUnit');

    // Show offer end date in red under timer
    if (offerEndDateSpan) {
        offerEndDateSpan.textContent = `Winter Offer Ends On: ${endDateString}`;
        offerEndDateSpan.style.color = '#e74c3c';
        offerEndDateSpan.style.fontWeight = 'bold';
    }

    if (difference <= 0) {
        // Show alarm message when timer expires
        if (countdownText) {
            countdownText.innerHTML = 'Special Offer is Ending Soon!';
            countdownText.style.color = '#e74c3c';
            countdownText.style.fontWeight = 'bold';
            countdownText.style.fontSize = '1.3rem';
        }
        if (countdownElem) countdownElem.style.animation = 'pulse 1s infinite';

        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');

        if (daysElement) daysElement.textContent = '00';
        if (hoursElement) hoursElement.textContent = '00';
        if (minutesElement) minutesElement.textContent = '00';
        if (secondsElement) secondsElement.textContent = '00';
        if (daysUnit) daysUnit.style.display = 'none';
        if (secondsUnit) secondsUnit.style.display = 'inline-block';
        return;
    }

    // Calculate time units
    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    if (days >= 1) {
        // Show days/hours/minutes, hide seconds
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');

        if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = '--';
        if (daysUnit) daysUnit.style.display = 'inline-block';
        if (secondsUnit) secondsUnit.style.display = 'none';
        countdownText.innerHTML = `Special offer ends in:`;
    } else {
        // Show hours/minutes/seconds, hide days
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');

        if (daysElement) daysElement.textContent = '00';
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
        if (daysUnit) daysUnit.style.display = 'none';
        if (secondsUnit) secondsUnit.style.display = 'inline-block';
        countdownText.innerHTML = `Special offer ends in:`;
    }
}

// Initialize countdown and start timer
initializeCountdown();
setInterval(updateCountdown, 1000);
updateCountdown();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Close mobile nav if open
            closeMobileNav();

            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Color variants configuration with availability status
const colorVariants = {
    black: {
        images: [
            'lenovo-thinkplus-th30-headphones/lenovo-thinkplus-th30-headphones/lenovo-thinkplus-th30-headphones-1.webp',
            'lenovo-thinkplus-th30-headphones/lenovo-thinkplus-th30-headphones/lenovo-thinkplus-th30-headphones-2.webp',
            'lenovo-thinkplus-th30-headphones/lenovo-thinkplus-th30-headphones/lenovo-thinkplus-th30-headphones-3.webp',
            'lenovo-thinkplus-th30-headphones/lenovo-thinkplus-th30-headphones/lenovo-thinkplus-th30-headphones-4.webp',
            'lenovo-thinkplus-th30-headphones/lenovo-thinkplus-th30-headphones/lenovo-thinkplus-th30-headphones-5.webp'
        ],
        available: true
    },
};

// Function to show color availability notification
function showColorNotification(message, isError = true) {
    const notification = document.createElement('div');
    notification.className = `color-notification ${isError ? 'error' : 'success'}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${isError ? '#fef2f2' : '#f0fdf4'};
        color: ${isError ? '#b91c1c' : '#166534'};
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
        border: 1px solid ${isError ? '#fecaca' : '#bbf7d0'};
    `;

    notification.innerHTML = `
        <ion-icon name="${isError ? 'warning' : 'checkmark-circle'}" style="font-size: 20px;"></ion-icon>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Trigger reflow
    void notification.offsetWidth;

    // Show notification
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(-50%) translateY(0)';

    // Auto-remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Function to update color selection UI
function updateColorSelectionUI() {
    const colorDropdown = document.querySelector('.color-dropdown');
    if (!colorDropdown) return;

    // Update dropdown options
    const options = colorDropdown.querySelectorAll('option');
    options.forEach(option => {
        const color = option.value.toLowerCase();
        const variant = colorVariants[color];
        if (variant) {
            // Store original text if not already stored
            if (!option.dataset.originalText) {
                option.dataset.originalText = option.textContent.replace(' (Sold Out)', '').trim();
            }

            option.disabled = !variant.available;

            // Set text based on availability
            if (!variant.available) {
                option.textContent = option.dataset.originalText + ' (Sold Out)';
            } else {
                option.textContent = option.dataset.originalText;
            }
        }
    });

    // Update color swatches if they exist
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        const color = swatch.dataset.color;
        if (color && colorVariants[color]) {
            if (!colorVariants[color].available) {
                swatch.classList.add('sold-out');
                swatch.title = 'Sold Out';
            } else {
                swatch.classList.remove('sold-out');
                swatch.title = '';
            }
        }
    });

    // Update low stock indicator if it exists
    updateLowStockIndicator();
}

// Function to update low stock indicator
function updateLowStockIndicator() {
    const inventoryAlert = document.querySelector('.inventory-alert');
    if (!inventoryAlert) return;

    const colorSelect = document.querySelector('.color-dropdown');
    const currentColor = colorSelect?.value?.toLowerCase() || 'black';

    // Get stock value from DOM element updated by automation system
    const lowStockSpan = document.querySelector('.low-stock');
    const currentStock = lowStockSpan ? parseInt(lowStockSpan.textContent) || 0 : 0;

    const icon = inventoryAlert.querySelector('ion-icon');
    const textSpan = inventoryAlert.querySelector('span');

    // Low stock
    icon.setAttribute('name', 'warning');
    icon.style.color = '#ea580c';
    textSpan.innerHTML = `Only <span class="low-stock" style="color: #ea580c; font-weight: bold;">${currentStock} left</span> in stock - order soon!`;
    inventoryAlert.style.background = '#fff7ed';
    inventoryAlert.style.borderColor = '#fed7aa';
}

// Image Gallery Functionality
class ImageGallery {
    constructor() {
        this.currentIndex = 0;
        this.currentColor = 'black';
        this.images = colorVariants[this.currentColor].images;

        this.mainImage = document.getElementById('mainImage');
        this.mainVideo = document.getElementById('mainVideo');
        this.modalVideo = document.getElementById('modalVideo');
        this.modalImage = document.getElementById('modalImage');
        this.thumbnails = document.querySelectorAll('.thumbnail');
        this.imageModal = document.getElementById('imageModal');
        this.modalClose = document.getElementById('modalClose');

        this.init();
    }

    init() {
        // Show video initially and hide image if video exists
        if (this.mainVideo) {
            this.isVideoVisible = true;
            this.mainImage.style.display = 'none';
            this.mainVideo.style.display = 'block';
            // Ensure autoplay muted for mobile browsers
            try {
                this.mainVideo.muted = true;
                const playPromise = this.mainVideo.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.catch(() => {/* ignore autoplay restrictions */ });
                }
            } catch (_) { }
        } else {
            this.isVideoVisible = false;
        }

        // Thumbnail click handlers
        this.thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                if (thumbnail.dataset.type === 'video') {
                    this.showVideo();
                    this.setActiveThumbnailVideo();
                } else {
                    const adjustedIndex = this.hasVideoThumb() ? index - 1 : index;
                    if (adjustedIndex >= 0) {
                        this.setActiveImage(adjustedIndex);
                    }
                }
            });
        });

        // Ensure initial thumbnail active states reflect initial video visibility
        this.updateThumbnails();

        // Gallery navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.previousImage();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextImage();
        });

        // Zoom button
        document.getElementById('zoomBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal navigation
        document.getElementById('modalPrevBtn').addEventListener('click', () => {
            this.previousImage();
            this.updateModalImage();
        });

        document.getElementById('modalNextBtn').addEventListener('click', () => {
            this.nextImage();
            this.updateModalImage();
        });

        // Modal close
        this.modalClose.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on overlay click
        this.imageModal.addEventListener('click', (e) => {
            if (e.target === this.imageModal) {
                this.closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.imageModal.classList.contains('active')) {
                switch (e.key) {
                    case 'Escape':
                        this.closeModal();
                        break;
                    case 'ArrowLeft':
                        this.previousImage();
                        this.updateModalImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        this.updateModalImage();
                        break;
                }
            }
        });

        // Touch/swipe support for mobile
        this.addTouchSupport();
        // Add swipe support for modal media as well
        this.addModalTouchSupport();
        // Enable horizontal wheel scroll for thumbnails for easier desktop navigation
        this.enableThumbnailWheelScroll();

        // Color selection functionality
        this.initColorSelection();

        // If user remains on video, loop playback when it ends
        if (this.mainVideo) {
            this.mainVideo.addEventListener('ended', () => {
                if (this.isVideoVisible) {
                    try { this.mainVideo.currentTime = 0; this.mainVideo.play(); } catch (_) { }
                }
            });
        }
    }

    hideVideoIfVisible() {
        if (this.mainVideo && this.isVideoVisible) {
            try { this.mainVideo.pause(); } catch (_) { }
            this.mainVideo.style.display = 'none';
            this.mainImage.style.display = 'block';
            this.isVideoVisible = false;
        }
    }

    showVideo() {
        if (!this.mainVideo) return;
        this.isVideoVisible = true;
        this.mainImage.style.display = 'none';
        this.mainVideo.style.display = 'block';
        try {
            this.mainVideo.muted = true;
            this.mainVideo.currentTime = 0;
            const p = this.mainVideo.play();
            if (p && typeof p.then === 'function') p.catch(() => { });
        } catch (_) { }
        // Reflect active state on thumbnails
        this.updateThumbnails();
    }

    hasVideoThumb() {
        return Array.from(this.thumbnails).some(t => t.dataset.type === 'video');
    }

    setActiveThumbnailVideo() {
        this.isVideoVisible = true;
        this.updateThumbnails();
    }

    initColorSelection() {
        const colorSelect = document.getElementById('colorSelect');
        if (colorSelect) {
            colorSelect.addEventListener('change', (e) => {
                this.changeColor(e.target.value);
            });
        }
    }

    changeColor(color) {
        this.currentColor = color;
        this.images = colorVariants[color].images;
        this.currentIndex = 0;
        this.hideVideoIfVisible();
        this.updateAllImages();
        this.updateThumbnails();
    }

    updateAllImages() {
        // Update main image
        this.mainImage.src = this.images[this.currentIndex];

        // Update modal image if modal is open
        if (this.imageModal.classList.contains('active')) {
            this.modalImage.src = this.images[this.currentIndex];
        }
    }

    updateThumbnails() {
        const hasVideo = this.hasVideoThumb();
        this.thumbnails.forEach((thumb, index) => {
            const isVideo = thumb.dataset.type === 'video';
            if (isVideo) {
                thumb.classList.toggle('active', !!this.isVideoVisible);
                return;
            }
            const imageIndex = hasVideo ? index - 1 : index;
            if (imageIndex < 0) return;
            const img = thumb.querySelector('img');
            if (img && this.images[imageIndex]) {
                img.src = this.images[imageIndex];
            }
            thumb.setAttribute('data-src', this.images[imageIndex] || '');
            thumb.classList.toggle('active', !this.isVideoVisible && imageIndex === this.currentIndex);
        });
    }

    setActiveImage(index) {
        this.hideVideoIfVisible();
        this.currentIndex = index;
        this.mainImage.src = this.images[index];

        // Update thumbnails to reflect correct active state (accounts for video thumb offset)
        this.updateThumbnails();

        // Update modal image if modal is open
        if (this.imageModal.classList.contains('active')) {
            this.modalImage.src = this.images[index];
        }

        // Add fade effect
        this.mainImage.style.opacity = '0';
        setTimeout(() => {
            this.mainImage.style.opacity = '1';
        }, 150);
    }

    nextImage() {
        // Cycle: video -> image0 -> ... -> lastImage -> video
        if (this.isVideoVisible) {
            this.hideVideoIfVisible();
            this.setActiveImage(0);
            this.updateThumbnails();
            return;
        }
        if (this.currentIndex === this.images.length - 1) {
            this.showVideo();
            return;
        }
        this.setActiveImage(this.currentIndex + 1);
        this.updateThumbnails();
    }

    previousImage() {
        // Cycle backwards: video <- image0 <- ... <- lastImage <- video
        if (this.isVideoVisible) {
            this.hideVideoIfVisible();
            this.setActiveImage(this.images.length - 1);
            this.updateThumbnails();
            return;
        }
        if (this.currentIndex === 0) {
            this.showVideo();
            return;
        }
        this.setActiveImage(this.currentIndex - 1);
        this.updateThumbnails();
    }

    openModal() {
        // If the current slide is the video, show and play the modal video; otherwise
        // show the modal image.
        if (this.isVideoVisible) {
            if (this.modalVideo) {
                this.modalImage.style.display = 'none';
                this.modalVideo.style.display = 'block';
                try { this.modalVideo.currentTime = 0; this.modalVideo.muted = true; this.modalVideo.play(); } catch (_) { }
            }
        } else {
            if (this.modalVideo) {
                try { this.modalVideo.pause(); } catch (_) { }
                this.modalVideo.style.display = 'none';
            }
            this.modalImage.style.display = 'block';
            this.modalImage.src = this.images[this.currentIndex];
        }
        this.imageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.imageModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        // Ensure modal video is paused and hidden when modal closes
        if (this.modalVideo) {
            try { this.modalVideo.pause(); } catch (_) { }
            this.modalVideo.style.display = 'none';
        }
        // Ensure modal image is shown again for next open
        if (this.modalImage) {
            this.modalImage.style.display = 'block';
        }
    }

    updateModalImage() {
        // When modal is open, update either the image or video depending on which
        // slide is active.
        if (this.imageModal.classList.contains('active')) {
            if (this.isVideoVisible) {
                if (this.modalVideo) {
                    this.modalImage.style.display = 'none';
                    this.modalVideo.style.display = 'block';
                    try { this.modalVideo.currentTime = 0; this.modalVideo.muted = true; this.modalVideo.play(); } catch (_) { }
                }
            } else {
                if (this.modalVideo) {
                    try { this.modalVideo.pause(); } catch (_) { }
                    this.modalVideo.style.display = 'none';
                }
                this.modalImage.style.display = 'block';
                this.modalImage.src = this.images[this.currentIndex];
            }
        }
    }

    addTouchSupport() {
        let startX = 0;
        let startY = 0;
        const attachSwipe = (el) => {
            if (!el) return;
            let sx = 0, sy = 0;
            el.addEventListener('touchstart', (e) => {
                sx = e.touches[0].clientX;
                sy = e.touches[0].clientY;
            }, { passive: true });
            el.addEventListener('touchend', (e) => {
                if (!sx) return;
                const ex = e.changedTouches[0].clientX;
                const ey = e.changedTouches[0].clientY;
                const dx = sx - ex;
                const dy = sy - ey;
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                    if (dx > 0) this.nextImage(); else this.previousImage();
                }
                sx = 0; sy = 0;
            }, { passive: true });
        };

        // Attach to both main image and main video so swiping either navigates
        attachSwipe(this.mainImage);
        attachSwipe(this.mainVideo);
    }

    // Add swipe support for modal image/video
    addModalTouchSupport() {
        const attachModalSwipe = (el) => {
            if (!el) return;
            let sx = 0, sy = 0;
            el.addEventListener('touchstart', (e) => {
                sx = e.touches[0].clientX;
                sy = e.touches[0].clientY;
            }, { passive: true });
            el.addEventListener('touchend', (e) => {
                if (!sx) return;
                const ex = e.changedTouches[0].clientX;
                const ey = e.changedTouches[0].clientY;
                const dx = sx - ex;
                const dy = sy - ey;
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                    if (dx > 0) {
                        this.nextImage();
                    } else {
                        this.previousImage();
                    }
                    // update modal view after navigation
                    this.updateModalImage();
                }
                sx = 0; sy = 0;
            }, { passive: true });
        };

        attachModalSwipe(this.modalImage);
        attachModalSwipe(this.modalVideo);
    }

    // Allow mouse wheel horizontal scrolling on thumbnail container
    enableThumbnailWheelScroll() {
        const container = document.querySelector('.thumbnail-container');
        if (!container) return;
        container.addEventListener('wheel', (e) => {
            // Only horizontal-scroll the container
            if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }
}


// Initialize image gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const imageGallery = new ImageGallery();

    // Initialize color selection
    const colorSelect = document.getElementById('colorSelect');
    if (colorSelect) {
        // Update UI based on initial selection
        updateColorSelectionUI();

        // Handle color change
        colorSelect.addEventListener('change', (e) => {
            const selectedColor = e.target.value.toLowerCase();
            const variant = colorVariants[selectedColor];

            if (variant) {
                if (!variant.available) {
                    // Show sold out notification and revert to previous selection
                    showColorNotification(`${selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)} Color Has Been Sold Out`);

                    // Find the first available color
                    const availableColor = Object.keys(colorVariants).find(color => colorVariants[color].available);
                    if (availableColor) {
                        e.target.value = availableColor;
                        // Update gallery to show the available color
                        imageGallery.changeColor(availableColor);
                    }
                    return;
                }

                // Update gallery with selected color
                imageGallery.changeColor(selectedColor);

                // Update UI and stock indicator
                updateColorSelectionUI();
                updateLowStockIndicator();
            }
        });
    }




    // Also update when currency changes in case it affects pricing/availability
    new ScrollAnimator(); // Initialize optimized scroll animations

    // Sync sticky bar prices and currency with main prices
    const oldPrice = document.querySelector('.old-price')?.textContent?.trim();
    const newPrice = document.querySelector('.new-price')?.textContent?.trim();
    const currentCurrency = document.querySelector('.current-currency')?.textContent?.trim();
    const stickyOld = document.getElementById('stickyOldPrice');
    const stickyNew = document.getElementById('stickyNewPrice');
    const stickyCurrency = document.getElementById('stickyCurrency');
    if (stickyOld && oldPrice) stickyOld.textContent = oldPrice;
    if (stickyNew && newPrice) stickyNew.textContent = newPrice;
    if (stickyCurrency && currentCurrency) stickyCurrency.textContent = currentCurrency;
});













/* Optimized Elements Animation On Scroll */
class ScrollAnimator {
    constructor() {
        this.animatedElements = document.querySelectorAll('.animate-on-scroll');
        this.triggerPoint = window.innerHeight * 0.9;
        this.isThrottled = false;
        this.init();
    }

    init() {
        // Use Intersection Observer for better performance
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback to scroll events with throttling
            this.setupScrollListener();
        }

        // Initial check
        this.checkAnimations();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        });

        this.animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    setupScrollListener() {
        const throttledCheck = () => {
            if (!this.isThrottled) {
                requestAnimationFrame(() => {
                    this.checkAnimations();
                    this.isThrottled = false;
                });
                this.isThrottled = true;
            }
        };

        window.addEventListener('scroll', throttledCheck, { passive: true });
        window.addEventListener('resize', throttledCheck, { passive: true });
    }

    checkAnimations() {
        this.triggerPoint = window.innerHeight * 0.9;

        this.animatedElements.forEach(el => {
            if (el.classList.contains('in-view')) return;

            const rect = el.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;

            if (midpoint < this.triggerPoint) {
                el.classList.add('in-view');
            }
        });
    }
}














/**
 * Currency Dropdown Functionality
 */
document.addEventListener('DOMContentLoaded', function () {
    // Desktop currency dropdown
    const currencyTrigger = document.getElementById('currencyTrigger');
    const currencyMenu = document.getElementById('currencyMenu');

    if (currencyTrigger && currencyMenu) {
        // Toggle dropdown on trigger click
        currencyTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isActive = this.classList.contains('active');

            // Close all other dropdowns
            document.querySelectorAll('.currency-trigger.active, .mobile-currency-trigger.active').forEach(trigger => {
                trigger.classList.remove('active');
                const menu = trigger.nextElementSibling;
                if (menu) {
                    menu.classList.remove('show');
                }
            });

            if (!isActive) {
                this.classList.add('active');
                currencyMenu.classList.add('show');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            currencyTrigger.classList.remove('active');
            currencyMenu.classList.remove('show');
        });

        // Close dropdown when pressing Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                currencyTrigger.classList.remove('active');
                currencyMenu.classList.remove('show');
            }
        });
    }

    // Mobile currency dropdown
    const mobileCurrencyTrigger = document.getElementById('mobileCurrencyTrigger');
    const mobileCurrencyMenu = document.getElementById('mobileCurrencyMenu');

    if (mobileCurrencyTrigger && mobileCurrencyMenu) {
        // Toggle dropdown on trigger click
        mobileCurrencyTrigger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isActive = this.classList.contains('active');

            // Close all other dropdowns
            document.querySelectorAll('.currency-trigger.active, .mobile-currency-trigger.active').forEach(trigger => {
                trigger.classList.remove('active');
                const menu = trigger.nextElementSibling;
                if (menu) {
                    menu.classList.remove('show');
                }
            });

            if (!isActive) {
                this.classList.add('active');
                mobileCurrencyMenu.classList.add('show');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            mobileCurrencyTrigger.classList.remove('active');
            mobileCurrencyMenu.classList.remove('show');
        });

        // Close dropdown when pressing Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                mobileCurrencyTrigger.classList.remove('active');
                mobileCurrencyMenu.classList.remove('show');
            }
        });
    }



    document.querySelector('.cta-button')?.addEventListener('click', handleBuyClickStandalone);
    document.getElementById('stickyBuyNowBtn')?.addEventListener('click', handleBuyClickStandalone);
    document.getElementById('mobile-sticky-btn')?.addEventListener('click', handleBuyClickStandalone);
});

















/**
 * Standalone Buy Now handler — uses force-single-add.php in WP root.
 * - Empties cart server-side, adds exactly 1 item, then redirects to checkout.
 * - Passes color as attribute_pa_color (WooCommerce format).
 */
function handleBuyClickStandalone() {
    // small helper for debugging (no-op if debugLog not defined)
    function dlog(...args) { try { (typeof debugLog === 'function' ? debugLog : console.log).apply(null, args); } catch (e) { console.log(...args); } }

    dlog('Standalone handler: Button clicked');

    const color = document.getElementById('colorSelect')?.value || '';
    const ctaBtn = document.querySelector('.cta-button');
    const stickyBtn = document.getElementById('stickyBuyNowBtn');
    const mobileStickyBtn = document.getElementById('mobile-sticky-btn');

    // Get all buy buttons that should show "Redirecting..."
    const allButtons = [ctaBtn, stickyBtn, mobileStickyBtn].filter(btn => btn !== null && btn !== undefined);

    // Currency-aware config (you already had this)
    const currentCurrency = window.currencyManager?.getCurrentCurrency?.() || 'SGD';
    const checkoutOrigins = {
        SGD: 'https://sg-checkout.headphonezoo.com',
        AUD: 'https://au-checkout.headphonezoo.com',
        IDR: 'https://id-checkout.headphonezoo.com'
    };

    const origin = checkoutOrigins[currentCurrency] || checkoutOrigins.SGD;
    const productId = window.currencyManager.getCurrentProductId();

    dlog('Standalone handler: currency=', currentCurrency, 'productId=', productId, 'origin=', origin, 'color=', color);

    // record click (non-blocking)
    if (typeof insertNewClick === 'function') {
        try { insertNewClick(productId).catch(err => dlog('insertNewClick error', err)); } catch (e) { dlog('insertNewClick threw', e); }
    }

    // disable all buttons and show "Redirecting..." text to prevent spam clicks
    allButtons.forEach(btn => {
        btn.disabled = true;
        // preserve original text in data attr so we can restore if needed
        if (!btn.dataset.origText) btn.dataset.origText = btn.textContent;
        btn.textContent = "Redirecting...";
    });

    // Build URL to force-single-add.php in WP root (use origin + file)
    const forceFile = '/force-single-add.php';
    let forceUrl;
    try {
        forceUrl = new URL(forceFile, origin).toString();
    } catch (e) {
        // fallback: if origin invalid, try simple concatenation
        forceUrl = origin.replace(/\/$/, '') + forceFile;
    }

    // Build query params (product + optional attribute + cache-buster)
    const params = new URLSearchParams();
    params.set('product', String(productId));
    params.set('t', String(Date.now())); // cache buster

    // If color present, send as WooCommerce attribute param (attribute_pa_<slug>)
    // Replace 'color' slug if your attribute slug is different
    if (color) {
        params.set('attribute_pa_color', color);
    }

    const finalUrl = `${forceUrl}?${params.toString()}`;

    dlog('Standalone handler: finalUrl=', finalUrl);

    // Navigate to WP endpoint in same tab (recommended). Use window.open(...) if you want new tab.
    try {
        window.location.href = finalUrl;
    } catch (err) {
        dlog('Navigation failed, falling back to direct checkout add-to-cart', err);

        // restore all button texts briefly
        allButtons.forEach(btn => {
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = btn.dataset.origText || 'Get One Now';
            }, 1500);
        });

        // fallback: open standard checkout add-to-cart (may increment qty)
        const fallback = origin.replace(/\/$/, '') + `/checkout/?add-to-cart=${encodeURIComponent(productId)}&quantity=1&t=${Date.now()}`;
        window.location.href = fallback;
    }
}