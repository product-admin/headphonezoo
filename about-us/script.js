// Advanced JavaScript for HeadphoneZoo website

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initParallaxEffects();
    initParticleSystem();
    initNavbarEffects();
    initSmoothScrolling();
    initHoverEffects();
    initDynamicNavbarHeight();
    initProductCards();
});


// Parallax effects for hero section
function initParallaxEffects() {
    const heroParticles = document.querySelector('.hero-particles');
    const ctaParticles = document.querySelector('.cta-particles');

    if (heroParticles || ctaParticles) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;

            if (heroParticles) {
                heroParticles.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }

            if (ctaParticles) {
                ctaParticles.style.transform = `translateY(${scrolled * -parallaxSpeed}px)`;
            }
        });
    }
}

// Dynamic particle system
function initParticleSystem() {
    const heroBackground = document.querySelector('.hero-background');

    if (heroBackground) {
        // Create floating particles
        for (let i = 0; i < 20; i++) {
            createParticle(heroBackground);
        }
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';

    // Random properties
    const size = Math.random() * 4 + 2;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;

    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1});
        border-radius: 50%;
        left: ${startX}%;
        top: ${startY}%;
        animation: floatParticle ${duration}s ease-in-out infinite;
        animation-delay: ${delay}s;
        pointer-events: none;
    `;

    container.appendChild(particle);
}

// Add CSS for floating particles
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
        }
        25% {
            transform: translate(20px, -20px) rotate(90deg);
            opacity: 0.8;
        }
        50% {
            transform: translate(-10px, -40px) rotate(180deg);
            opacity: 0.5;
        }
        75% {
            transform: translate(-30px, -20px) rotate(270deg);
            opacity: 0.7;
        }
    }
`;
document.head.appendChild(style);

// Enhanced navbar effects
function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    const logo = document.querySelector('.logo-img');

    if (navbar) {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Add/remove scrolled class for styling
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
        });
    }

    // Logo rotation on hover
    if (logo) {
        logo.addEventListener('mouseenter', () => {
            logo.style.transform = 'rotate(360deg)';
        });

        logo.addEventListener('mouseleave', () => {
            logo.style.transform = 'rotate(0deg)';
        });
    }
}

// Dynamically set CSS variable for navbar height to avoid content being hidden under fixed header
function initDynamicNavbarHeight() {
    const navbar = document.querySelector('.navbar');
    const root = document.documentElement;

    if (!navbar || !root) return;

    const setHeight = () => {
        // Use offsetHeight to include borders, stays accurate across mobile UI changes
        const height = navbar.offsetHeight || 0;
        root.style.setProperty('--navbar-height', `${height}px`);
    };

    // Initial set after layout
    setHeight();

    // Recompute on resize and orientation changes
    window.addEventListener('resize', setHeight);
    window.addEventListener('orientationchange', setHeight);

    // Some mobile browsers adjust viewport after load; delay a re-measure
    setTimeout(setHeight, 250);
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Custom smooth scrolling function for buttons
function scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        // Add visual feedback to the clicked button
        const clickedButton = event.target;
        clickedButton.style.transform = 'scale(0.95)';
        clickedButton.style.opacity = '0.8';

        // Reset button style after a short delay
        setTimeout(() => {
            clickedButton.style.transform = '';
            clickedButton.style.opacity = '';
        }, 150);

        // Calculate the position to center the element on screen
        const elementRect = targetElement.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const middle = absoluteElementTop - (window.innerHeight / 2);

        // Smooth scroll to the calculated position
        window.scrollTo({
            top: middle,
            behavior: 'smooth'
        });

        // Add a subtle highlight effect to the target section
        setTimeout(() => {
            targetElement.style.transform = 'scale(1.02)';
            targetElement.style.transition = 'transform 0.3s ease';

            setTimeout(() => {
                targetElement.style.transform = '';
            }, 300);
        }, 800); // Wait for scroll to complete
    }
}


// Enhanced hover effects
function initHoverEffects() {
    // Feature cards 3D tilt effect
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Social cards ripple effect
    const socialCards = document.querySelectorAll('.social-card');

    socialCards.forEach(card => {
        card.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);


// Add navbar scrolled styles
const navbarStyle = document.createElement('style');
navbarStyle.textContent = `
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .navbar {
        transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
    }
`;
document.head.appendChild(navbarStyle);

// CTA button interactions
document.addEventListener('DOMContentLoaded', function () {
    const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');

    ctaButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            // Create click effect
            const effect = document.createElement('div');
            effect.className = 'button-effect';
            effect.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.2);
                border-radius: inherit;
                transform: scale(0);
                animation: buttonClick 0.3s ease-out;
                pointer-events: none;
                top: 0;
                left: 0;
            `;

            this.style.position = 'relative';
            this.appendChild(effect);

            setTimeout(() => {
                effect.remove();
            }, 300);
        });
    });
});

// Add button click animation
const buttonStyle = document.createElement('style');
buttonStyle.textContent = `
    @keyframes buttonClick {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(1);
            opacity: 0;
        }
    }
`;
document.head.appendChild(buttonStyle);

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
    // Scroll-based animations can be added here
}, 16)); // ~60fps

// Initialize product cards duplication for mobile
function initProductCards() {
    const productsGrid = document.querySelector('.products-grid');
    const productsScroller = document.querySelector('.products-scroller');

    if (productsGrid && productsScroller) {
        // Clone all product cards from grid to scroller
        const productCards = productsGrid.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const clonedCard = card.cloneNode(true);
            productsScroller.appendChild(clonedCard);
        });
    }
}

// Add loading animation
window.addEventListener('load', function () {
    document.body.classList.add('loaded');
});