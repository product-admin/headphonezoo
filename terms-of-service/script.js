// Populate dates if you want dynamic timestamps
(function () {
    const effective = document.getElementById("effective-date");
    const updated = document.getElementById("last-updated");
    if (effective && updated) {
        // Set to today's date if still placeholder
        if (effective.textContent === "2025-01-01") {
            const today = new Date();
            const iso = today.toISOString().slice(0, 10);
            updated.textContent = iso;
        }
    }
})();


// Smooth scroll for TOC: scroll the section's .section-title into the center of the viewport
// New click behavior: on small screens, close the TOC first (wait for transition) then scroll so the
// section's title is centered. This prevents layout shifts from the TOC animation moving the target.
document.querySelectorAll('.toc a[href^="#"]').forEach((link) => {
    link.addEventListener("click", async function (e) {
        e.preventDefault();
        const href = this.getAttribute("href");
        const targetSection = document.querySelector(href);
        let titleEl = null;
        if (targetSection) {
            titleEl = targetSection.querySelector('.section-title') || targetSection.querySelector('h2, h3');
        }

        const toc = document.querySelector('.toc');
        const tocLinksEl = document.querySelector('#toc-links');

        // Helper: perform the centered scroll
        const doScrollToTitle = (el) => {
            const rect = el.getBoundingClientRect();
            const targetY = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);
            window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        };

        // Helper: wait for transitionend for tocLinksEl or fallback timeout
        const waitForTocClose = (el, timeout = 400) => new Promise((resolve) => {
            if (!el) return resolve();
            let called = false;
            const onEnd = (ev) => {
                // listen for max-height or opacity change
                if (ev.propertyName === 'max-height' || ev.propertyName === 'opacity') {
                    if (!called) {
                        called = true;
                        el.removeEventListener('transitionend', onEnd);
                        resolve();
                    }
                }
            };
            el.addEventListener('transitionend', onEnd);
            // fallback
            setTimeout(() => {
                if (!called) {
                    called = true;
                    el.removeEventListener('transitionend', onEnd);
                    resolve();
                }
            }, timeout);
        });

        if (titleEl) {
            // If mobile and TOC is open, close it first and wait for transition to finish
            if (window.matchMedia('(max-width: 480px)').matches && toc && toc.classList.contains('open')) {
                toc.classList.remove('open');
                const toggleBtn = document.querySelector('.toc-toggle');
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.textContent = 'Show sections';
                }
                // Wait for TOC close animation to finish before scrolling
                await waitForTocClose(tocLinksEl, 420);
                // Small delay to ensure layout settled on some devices
                await new Promise((r) => setTimeout(r, 20));
                doScrollToTitle(titleEl);
            } else {
                // Desktop or already closed: just scroll
                doScrollToTitle(titleEl);
            }
            // Apply temporary visual highlight to the title after initiating scroll
            applyTocHighlight(titleEl);
        } else if (targetSection) {
            // Fallback: scroll section into center
            // If mobile and toc open, close first then scroll
            if (window.matchMedia('(max-width: 480px)').matches && toc && toc.classList.contains('open')) {
                toc.classList.remove('open');
                const toggleBtn = document.querySelector('.toc-toggle');
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.textContent = 'Show sections';
                }
                await waitForTocClose(tocLinksEl, 420);
                await new Promise((r) => setTimeout(r, 20));
            }
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // highlight the section container as fallback
            const fallbackTitle = targetSection.querySelector('h2, h3');
            if (fallbackTitle) applyTocHighlight(fallbackTitle);
        }
    });
});

// Helper: add/remove highlight class for a heading. If already highlighted, restart the animation.
function applyTocHighlight(el) {
    if (!el) return;
    const cls = 'toc-highlight';
    // Remove if present to allow re-triggering
    el.classList.remove(cls);
    // Force reflow then add
    // eslint-disable-next-line no-unused-expressions
    void el.offsetWidth;
    el.classList.add(cls);
    // Remove the class after the animation duration (plus small buffer)
    const removeAfter = 1700; // ms (animation 1500ms + buffer)
    setTimeout(() => {
        el.classList.remove(cls);
    }, removeAfter);
}

// Highlight current section in TOC on scroll
const tocLinks = Array.from(document.querySelectorAll(".toc a"));
const sections = tocLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);

// Highlight the TOC entry whose section title is nearest the center of the viewport
const onScroll = () => {
    const centerY = window.scrollY + window.innerHeight / 2;
    let nearest = null;
    let nearestDist = Infinity;
    for (const sec of sections) {
        const title = sec.querySelector('.section-title') || sec.querySelector('h2, h3');
        if (!title) continue;
        const titleY = window.scrollY + title.getBoundingClientRect().top + title.getBoundingClientRect().height / 2;
        const dist = Math.abs(centerY - titleY);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = sec;
        }
    }
    const activeId = nearest ? '#' + nearest.id : '';
    tocLinks.forEach((a) => {
        if (a.getAttribute('href') === activeId) a.classList.add('active');
        else a.classList.remove('active');
    });
};
document.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("load", onScroll);

// TOC toggle for small screens
const toc = document.querySelector(".toc");
const toggle = document.querySelector(".toc-toggle");
if (toc && toggle) {
    toggle.addEventListener("click", () => {
        const isOpen = toc.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.textContent = isOpen ? "Hide sections" : "Show sections";
    });
}