// About Page JavaScript

// DOM Elements
const statNumbers = document.querySelectorAll('.stat-number');
const timelineItems = document.querySelectorAll('.timeline-item');
const teamMembers = document.querySelectorAll('.team-member');
const valueCards = document.querySelectorAll('.value-card');
const techFeatures = document.querySelectorAll('.tech-feature');
const ctaButtons = document.querySelectorAll('.cta-buttons .btn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeAboutPage();
    setupAnimations();
    setupInteractions();
    setupAccessibility();
});

// Initialize About Page
function initializeAboutPage() {
    console.log('About page initialized');
    
    // Setup intersection observer for animations
    if ('IntersectionObserver' in window) {
        setupIntersectionObserver();
    }
    
    // Setup counter animations
    setupCounterAnimations();
    
    // Setup timeline animations
    setupTimelineAnimations();
    
    // Track page view
    trackEvent('page_view', { page: 'about' });
}

// Setup Animations
function setupAnimations() {
    // Add entrance animations to elements
    const animatedElements = document.querySelectorAll('.visual-card, .team-member, .value-card, .tech-feature');
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        element.style.transitionDelay = `${index * 0.1}s`;
    });
}

// Setup Intersection Observer
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Trigger counter animation for stats
                if (entry.target.classList.contains('stat-item')) {
                    animateCounter(entry.target.querySelector('.stat-number'));
                }
                
                // Trigger timeline animation
                if (entry.target.classList.contains('timeline-item')) {
                    animateTimelineItem(entry.target);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const elementsToObserve = document.querySelectorAll('.visual-card, .stat-item, .team-member, .value-card, .tech-feature, .timeline-item');
    elementsToObserve.forEach(element => {
        observer.observe(element);
    });
}

// Setup Counter Animations
function setupCounterAnimations() {
    statNumbers.forEach(stat => {
        const finalValue = stat.textContent;
        stat.textContent = '0';
        stat.dataset.finalValue = finalValue;
    });
}

// Animate Counter
function animateCounter(element) {
    if (!element || element.dataset.animated) return;
    
    const finalValue = element.dataset.finalValue;
    const isPercentage = finalValue.includes('%');
    const isPlus = finalValue.includes('+');
    const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ''));
    
    let currentValue = 0;
    const increment = numericValue / 50; // 50 steps
    const duration = 2000; // 2 seconds
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        currentValue += increment;
        
        if (currentValue >= numericValue) {
            currentValue = numericValue;
            clearInterval(timer);
            element.dataset.animated = 'true';
        }
        
        let displayValue = Math.floor(currentValue);
        
        if (isPercentage) {
            element.textContent = displayValue + '%';
        } else if (isPlus) {
            if (displayValue >= 1000000) {
                element.textContent = (displayValue / 1000000).toFixed(1) + 'M+';
            } else if (displayValue >= 1000) {
                element.textContent = (displayValue / 1000).toFixed(0) + 'K+';
            } else {
                element.textContent = displayValue + '+';
            }
        } else {
            element.textContent = displayValue;
        }
    }, stepTime);
}

// Setup Timeline Animations
function setupTimelineAnimations() {
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'all 0.6s ease';
        item.style.transitionDelay = `${index * 0.2}s`;
    });
}

// Animate Timeline Item
function animateTimelineItem(element) {
    element.style.opacity = '1';
    element.style.transform = 'translateX(0)';
}

// Setup Interactions
function setupInteractions() {
    // Team member hover effects
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', handleTeamMemberHover);
        member.addEventListener('mouseleave', handleTeamMemberLeave);
    });
    
    // Value card interactions
    valueCards.forEach(card => {
        card.addEventListener('click', handleValueCardClick);
    });
    
    // Tech feature interactions
    techFeatures.forEach(feature => {
        feature.addEventListener('mouseenter', handleTechFeatureHover);
    });
    
    // CTA button interactions
    ctaButtons.forEach(button => {
        button.addEventListener('click', handleCtaClick);
    });
    
    // Social link interactions
    const socialLinks = document.querySelectorAll('.member-social a');
    socialLinks.forEach(link => {
        link.addEventListener('click', handleSocialClick);
    });
}

// Handle Team Member Hover
function handleTeamMemberHover(e) {
    const member = e.currentTarget;
    const photo = member.querySelector('.member-photo i');
    
    if (photo) {
        photo.style.transform = 'scale(1.1) rotate(5deg)';
        photo.style.transition = 'transform 0.3s ease';
    }
    
    // Add subtle background change
    member.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
}

// Handle Team Member Leave
function handleTeamMemberLeave(e) {
    const member = e.currentTarget;
    const photo = member.querySelector('.member-photo i');
    
    if (photo) {
        photo.style.transform = 'scale(1) rotate(0deg)';
    }
    
    member.style.background = 'white';
}

// Handle Value Card Click
function handleValueCardClick(e) {
    const card = e.currentTarget;
    const title = card.querySelector('h3').textContent;
    
    // Add click animation
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = 'scale(1)';
    }, 150);
    
    // Show more info modal (simplified)
    showValueModal(card);
    
    trackEvent('value_card_click', { value: title });
}

// Show Value Modal
function showValueModal(card) {
    const title = card.querySelector('h3').textContent;
    const description = card.querySelector('p').textContent;
    const icon = card.querySelector('.value-icon i').className;
    
    const modal = document.createElement('div');
    modal.className = 'value-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-icon">
                    <i class="${icon}"></i>
                </div>
                <h3>${title}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>${description}</p>
                <div class="modal-details">
                    <h4>How we implement this value:</h4>
                    <ul>
                        <li>Continuous improvement of our technology and processes</li>
                        <li>Regular feedback collection from our users</li>
                        <li>Transparent communication about our capabilities</li>
                        <li>Commitment to ethical business practices</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        <style>
            .value-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            .value-modal .modal-content {
                background: white;
                border-radius: 15px;
                max-width: 500px;
                width: 90%;
                max-height: 80%;
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            }
            .value-modal .modal-header {
                text-align: center;
                padding: 30px 20px 20px;
                border-bottom: 1px solid #eee;
                position: relative;
            }
            .value-modal .modal-icon {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 15px;
            }
            .value-modal .modal-icon i {
                font-size: 1.5rem;
                color: white;
            }
            .value-modal .close-modal {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            .value-modal .modal-body {
                padding: 20px 30px 30px;
            }
            .value-modal .modal-details {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
            .value-modal .modal-details h4 {
                color: #333;
                margin-bottom: 15px;
            }
            .value-modal .modal-details ul {
                list-style: none;
                padding: 0;
            }
            .value-modal .modal-details li {
                padding: 8px 0;
                padding-left: 25px;
                position: relative;
                color: #666;
            }
            .value-modal .modal-details li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #667eea;
                font-weight: bold;
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    document.body.appendChild(modal);
    
    // Setup modal events
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Handle Tech Feature Hover
function handleTechFeatureHover(e) {
    const feature = e.currentTarget;
    const icon = feature.querySelector('i');
    
    if (icon) {
        icon.style.transform = 'scale(1.2) rotate(10deg)';
        icon.style.transition = 'transform 0.3s ease';
    }
    
    feature.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
    
    setTimeout(() => {
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
        feature.style.background = 'white';
    }, 300);
}

// Handle CTA Click
function handleCtaClick(e) {
    const button = e.currentTarget;
    const href = button.getAttribute('href');
    const text = button.textContent.trim();
    
    // Add click animation
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
    
    trackEvent('cta_click', { 
        button: text,
        destination: href 
    });
}

// Handle Social Click
function handleSocialClick(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const platform = link.querySelector('i').className;
    
    // Add click animation
    link.style.transform = 'scale(0.9) rotate(10deg)';
    setTimeout(() => {
        link.style.transform = 'scale(1) rotate(0deg)';
    }, 200);
    
    // Show social share modal or redirect
    showSocialModal(platform);
    
    trackEvent('social_click', { platform: platform });
}

// Show Social Modal
function showSocialModal(platform) {
    const platformName = platform.includes('linkedin') ? 'LinkedIn' : 
                        platform.includes('twitter') ? 'Twitter' : 
                        platform.includes('github') ? 'GitHub' : 
                        platform.includes('dribbble') ? 'Dribbble' : 'Social Media';
    
    const modal = document.createElement('div');
    modal.className = 'social-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Connect with us on ${platformName}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>Follow us on ${platformName} for the latest updates, behind-the-scenes content, and fashion technology insights!</p>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="window.open('#', '_blank')">
                        <i class="${platform}"></i> Visit ${platformName}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles (reuse existing styles)
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // Setup modal events
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Setup Accessibility
function setupAccessibility() {
    // Add ARIA labels to interactive elements
    teamMembers.forEach((member, index) => {
        member.setAttribute('role', 'button');
        member.setAttribute('tabindex', '0');
        member.setAttribute('aria-label', `Team member ${index + 1}`);
        
        // Add keyboard support
        member.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                member.click();
            }
        });
    });
    
    // Add ARIA labels to value cards
    valueCards.forEach((card, index) => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        const title = card.querySelector('h3').textContent;
        card.setAttribute('aria-label', `Learn more about ${title}`);
        
        // Add keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
    
    // Add focus indicators
    const focusableElements = document.querySelectorAll('[tabindex="0"]');
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '3px solid #667eea';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = 'none';
        });
    });
}

// Utility Functions
function trackEvent(eventName, properties = {}) {
    // Analytics tracking (placeholder)
    console.log(`Event: ${eventName}`, properties);
    
    // In a real application, you would send this to your analytics service
    // Example: analytics.track(eventName, properties);
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.value-modal, .social-modal');
        modals.forEach(modal => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        });
    }
});

// Smooth scrolling for anchor links
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

// Error Handling
window.addEventListener('error', function(e) {
    console.error('About page error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Performance Monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('About page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}

console.log('About JavaScript loaded successfully');