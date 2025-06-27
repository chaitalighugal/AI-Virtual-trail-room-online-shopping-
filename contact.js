// Contact Page JavaScript

// DOM Elements
const contactForm = document.getElementById('contact-form');
const successMessage = document.getElementById('success-message');
const submitBtn = document.querySelector('.submit-btn');
const messageTextarea = document.getElementById('message');
const characterCount = document.querySelector('.character-count');
const faqQuestions = document.querySelectorAll('.faq-question');
const chatBtn = document.querySelector('.chat-btn');
const socialLinks = document.querySelectorAll('.social-link');

// Form validation rules
const validationRules = {
    firstName: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-Z\s]+$/,
        message: 'First name must be at least 2 characters and contain only letters'
    },
    lastName: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-Z\s]+$/,
        message: 'Last name must be at least 2 characters and contain only letters'
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    phone: {
        required: false,
        pattern: /^[\+]?[1-9][\d]{0,15}$/,
        message: 'Please enter a valid phone number'
    },
    subject: {
        required: true,
        message: 'Please select a subject'
    },
    message: {
        required: true,
        minLength: 10,
        maxLength: 500,
        message: 'Message must be between 10 and 500 characters'
    },
    privacy: {
        required: true,
        message: 'You must agree to the privacy policy'
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
    setupFormValidation();
    setupFormSubmission();
    setupFAQ();
    setupInteractions();
    setupAccessibility();
});

// Initialize Contact Page
function initializeContactPage() {
    console.log('Contact page initialized');
    
    // Setup character counter
    if (messageTextarea && characterCount) {
        updateCharacterCount();
        messageTextarea.addEventListener('input', updateCharacterCount);
    }
    
    // Setup form auto-save (optional)
    setupFormAutoSave();
    
    // Track page view
    trackEvent('page_view', { page: 'contact' });
    
    // Setup intersection observer for animations
    if ('IntersectionObserver' in window) {
        setupAnimationObserver();
    }
}

// Setup Animation Observer
function setupAnimationObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe animated elements
    const animatedElements = document.querySelectorAll('.contact-method, .faq-item, .office-info');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
    });
}

// Setup Form Validation
function setupFormValidation() {
    const formInputs = contactForm.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
        
        // Remove error state on focus
        input.addEventListener('focus', () => {
            clearFieldError(input);
        });
    });
}

// Validate Field
function validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value.trim();
    const rules = validationRules[fieldName];
    
    if (!rules) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    // Required validation
    if (rules.required && !fieldValue) {
        isValid = false;
        errorMessage = `${getFieldLabel(fieldName)} is required`;
    }
    // Checkbox validation
    else if (field.type === 'checkbox' && rules.required && !field.checked) {
        isValid = false;
        errorMessage = rules.message;
    }
    // Pattern validation
    else if (fieldValue && rules.pattern && !rules.pattern.test(fieldValue)) {
        isValid = false;
        errorMessage = rules.message;
    }
    // Length validation
    else if (fieldValue) {
        if (rules.minLength && fieldValue.length < rules.minLength) {
            isValid = false;
            errorMessage = `${getFieldLabel(fieldName)} must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && fieldValue.length > rules.maxLength) {
            isValid = false;
            errorMessage = `${getFieldLabel(fieldName)} must be no more than ${rules.maxLength} characters`;
        }
    }
    
    // Show/hide error
    if (isValid) {
        clearFieldError(field);
    } else {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Show Field Error
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    // Add shake animation
    field.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        field.style.animation = '';
    }, 500);
}

// Clear Field Error
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.remove('error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

// Get Field Label
function getFieldLabel(fieldName) {
    const labels = {
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        phone: 'Phone',
        subject: 'Subject',
        message: 'Message',
        privacy: 'Privacy agreement'
    };
    return labels[fieldName] || fieldName;
}

// Update Character Count
function updateCharacterCount() {
    const currentLength = messageTextarea.value.length;
    const maxLength = 500;
    
    characterCount.textContent = `${currentLength}/${maxLength}`;
    
    // Change color based on usage
    if (currentLength > maxLength * 0.9) {
        characterCount.style.color = '#e74c3c';
    } else if (currentLength > maxLength * 0.7) {
        characterCount.style.color = '#f39c12';
    } else {
        characterCount.style.color = '#666';
    }
}

// Setup Form Submission
function setupFormSubmission() {
    contactForm.addEventListener('submit', handleFormSubmit);
}

// Handle Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const formInputs = contactForm.querySelectorAll('input, select, textarea');
    let isFormValid = true;
    
    formInputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Please fix the errors above', 'error');
        // Focus on first error field
        const firstError = contactForm.querySelector('.form-group.error input, .form-group.error select, .form-group.error textarea');
        if (firstError) {
            firstError.focus();
        }
        return;
    }
    
    // Show loading state
    setSubmitButtonLoading(true);
    
    try {
        // Simulate form submission
        await submitForm(new FormData(contactForm));
        
        // Show success
        showSuccessMessage();
        
        // Track successful submission
        trackEvent('form_submit', {
            form: 'contact',
            subject: contactForm.subject.value
        });
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('There was an error sending your message. Please try again.', 'error');
    } finally {
        setSubmitButtonLoading(false);
    }
}

// Submit Form (Simulated)
async function submitForm(formData) {
    // Simulate API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success (90% success rate)
            if (Math.random() > 0.1) {
                resolve({ success: true, message: 'Message sent successfully' });
            } else {
                reject(new Error('Server error'));
            }
        }, 2000);
    });
}

// Set Submit Button Loading
function setSubmitButtonLoading(loading) {
    if (loading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Show Success Message
function showSuccessMessage() {
    contactForm.style.display = 'none';
    successMessage.classList.add('show');
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Reset Form
function resetForm() {
    contactForm.reset();
    contactForm.style.display = 'block';
    successMessage.classList.remove('show');
    
    // Clear all errors
    const errorElements = contactForm.querySelectorAll('.form-group.error');
    errorElements.forEach(element => {
        element.classList.remove('error');
    });
    
    // Reset character count
    if (characterCount) {
        updateCharacterCount();
    }
    
    // Scroll to form
    contactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Setup Form Auto-Save
function setupFormAutoSave() {
    const formInputs = contactForm.querySelectorAll('input, select, textarea');
    
    // Load saved data
    loadFormData();
    
    // Save data on input
    formInputs.forEach(input => {
        input.addEventListener('input', debounce(saveFormData, 1000));
    });
    
    // Clear saved data on successful submission
    contactForm.addEventListener('submit', () => {
        setTimeout(() => {
            if (successMessage.classList.contains('show')) {
                clearSavedFormData();
            }
        }, 100);
    });
}

// Save Form Data
function saveFormData() {
    const formData = new FormData(contactForm);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    try {
        localStorage.setItem('contactFormData', JSON.stringify(data));
    } catch (error) {
        console.warn('Could not save form data:', error);
    }
}

// Load Form Data
function loadFormData() {
    try {
        const savedData = localStorage.getItem('contactFormData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            Object.keys(data).forEach(key => {
                const field = contactForm.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = data[key] === 'on';
                    } else {
                        field.value = data[key];
                    }
                }
            });
            
            // Update character count if message was loaded
            if (data.message && characterCount) {
                updateCharacterCount();
            }
        }
    } catch (error) {
        console.warn('Could not load form data:', error);
    }
}

// Clear Saved Form Data
function clearSavedFormData() {
    try {
        localStorage.removeItem('contactFormData');
    } catch (error) {
        console.warn('Could not clear form data:', error);
    }
}

// Setup FAQ
function setupFAQ() {
    faqQuestions.forEach(question => {
        question.addEventListener('click', toggleFAQ);
        
        // Keyboard support
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQ.call(question, e);
            }
        });
    });
}

// Toggle FAQ
function toggleFAQ(e) {
    const question = e.currentTarget;
    const faqItem = question.closest('.faq-item');
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    
    // Close all other FAQs
    faqQuestions.forEach(q => {
        if (q !== question) {
            q.setAttribute('aria-expanded', 'false');
            q.closest('.faq-item').classList.remove('active');
        }
    });
    
    // Toggle current FAQ
    question.setAttribute('aria-expanded', !isExpanded);
    faqItem.classList.toggle('active');
    
    // Track FAQ interaction
    trackEvent('faq_toggle', {
        question: question.querySelector('span').textContent,
        expanded: !isExpanded
    });
}

// Setup Interactions
function setupInteractions() {
    // Chat button
    if (chatBtn) {
        chatBtn.addEventListener('click', openLiveChat);
    }
    
    // Social links
    socialLinks.forEach(link => {
        link.addEventListener('click', handleSocialClick);
    });
    
    // Contact methods hover effects
    const contactMethods = document.querySelectorAll('.contact-method');
    contactMethods.forEach(method => {
        method.addEventListener('mouseenter', handleContactMethodHover);
    });
}

// Open Live Chat
function openLiveChat(e) {
    e.preventDefault();
    
    // Show chat modal
    showChatModal();
    
    trackEvent('chat_open', { source: 'contact_page' });
}

// Show Chat Modal
function showChatModal() {
    const modal = document.createElement('div');
    modal.className = 'chat-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Live Chat Support</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="chat-status">
                    <div class="status-indicator online"></div>
                    <span>Our support team is online</span>
                </div>
                <p>Start a conversation with our support team. We're here to help!</p>
                <div class="chat-options">
                    <button class="btn btn-primary" onclick="startChat('general')">
                        <i class="fas fa-comment"></i> General Support
                    </button>
                    <button class="btn btn-outline" onclick="startChat('technical')">
                        <i class="fas fa-cog"></i> Technical Help
                    </button>
                    <button class="btn btn-outline" onclick="startChat('billing')">
                        <i class="fas fa-credit-card"></i> Billing Question
                    </button>
                </div>
                <div class="chat-note">
                    <small>Average response time: 2 minutes</small>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        <style>
            .chat-modal {
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
            .chat-modal .modal-content {
                background: white;
                border-radius: 15px;
                max-width: 400px;
                width: 90%;
                animation: slideIn 0.3s ease;
            }
            .chat-modal .modal-header {
                padding: 20px 25px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .chat-modal .modal-header h3 {
                margin: 0;
                color: #333;
            }
            .chat-modal .close-modal {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            .chat-modal .modal-body {
                padding: 25px;
            }
            .chat-status {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                padding: 10px 15px;
                background: #f0f8f0;
                border-radius: 8px;
            }
            .status-indicator {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #27ae60;
                animation: pulse 2s infinite;
            }
            .chat-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin: 20px 0;
            }
            .chat-note {
                text-align: center;
                color: #666;
                margin-top: 15px;
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

// Start Chat
function startChat(type) {
    // Close modal
    const modal = document.querySelector('.chat-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
    
    // In a real application, this would open the chat widget
    showNotification(`Starting ${type} chat support...`, 'success');
    
    trackEvent('chat_start', { type: type });
}

// Handle Social Click
function handleSocialClick(e) {
    e.preventDefault();
    const platform = e.currentTarget.querySelector('i').className;
    
    // Add click animation
    e.currentTarget.style.transform = 'scale(0.9)';
    setTimeout(() => {
        e.currentTarget.style.transform = 'scale(1)';
    }, 150);
    
    // Show social modal or redirect
    showSocialModal(platform);
    
    trackEvent('social_click', { platform: platform, page: 'contact' });
}

// Show Social Modal
function showSocialModal(platform) {
    const platformName = platform.includes('facebook') ? 'Facebook' : 
                        platform.includes('twitter') ? 'Twitter' : 
                        platform.includes('instagram') ? 'Instagram' : 
                        platform.includes('linkedin') ? 'LinkedIn' : 
                        platform.includes('youtube') ? 'YouTube' : 'Social Media';
    
    showNotification(`Opening ${platformName}...`, 'info');
    
    // In a real application, this would redirect to the actual social media page
    setTimeout(() => {
        window.open('#', '_blank');
    }, 1000);
}

// Handle Contact Method Hover
function handleContactMethodHover(e) {
    const method = e.currentTarget;
    const icon = method.querySelector('.method-icon');
    
    // Add hover animation
    icon.style.transform = 'scale(1.1) rotate(5deg)';
    icon.style.transition = 'transform 0.3s ease';
    
    method.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1) rotate(0deg)';
    }, { once: true });
}

// Setup Accessibility
function setupAccessibility() {
    // Add ARIA labels
    const formElements = contactForm.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        const label = element.closest('.form-group').querySelector('label');
        if (label && !element.getAttribute('aria-label')) {
            element.setAttribute('aria-describedby', element.id + '-help');
        }
    });
    
    // Keyboard navigation for custom elements
    const interactiveElements = document.querySelectorAll('.contact-method, .social-link');
    interactiveElements.forEach(element => {
        if (!element.getAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });
}

// Map Functions
function openMap() {
    const address = '123 Fashion Street, New York, NY 10001';
    const encodedAddress = encodeURIComponent(address);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    window.open(mapUrl, '_blank');
    
    trackEvent('map_open', { address: address });
}

function scheduleVisit() {
    // Show scheduling modal
    showScheduleModal();
    
    trackEvent('schedule_visit_click');
}

// Show Schedule Modal
function showScheduleModal() {
    const modal = document.createElement('div');
    modal.className = 'schedule-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Schedule a Visit</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>We'd love to show you our technology in person! Please contact us to schedule your visit.</p>
                <div class="schedule-options">
                    <div class="option">
                        <h4>Call Us</h4>
                        <p>+1 (555) FASHION</p>
                        <small>Mon-Fri 9AM-6PM EST</small>
                    </div>
                    <div class="option">
                        <h4>Email Us</h4>
                        <p>visits@virtualtryon.com</p>
                        <small>We'll respond within 24 hours</small>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="window.location.href='tel:+1555FASHION'">
                        <i class="fas fa-phone"></i> Call Now
                    </button>
                    <button class="btn btn-outline" onclick="window.location.href='mailto:visits@virtualtryon.com'">
                        <i class="fas fa-envelope"></i> Send Email
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Reuse existing modal styles
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

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles
    const notificationStyles = `
        <style>
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 15px 20px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 1001;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid #667eea;
            }
            .notification-success {
                border-left-color: #27ae60;
            }
            .notification-error {
                border-left-color: #e74c3c;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification i {
                color: #667eea;
            }
            .notification-success i {
                color: #27ae60;
            }
            .notification-error i {
                color: #e74c3c;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        </style>
    `;
    
    if (!document.querySelector('style[data-notification]')) {
        const style = document.createElement('style');
        style.setAttribute('data-notification', 'true');
        style.innerHTML = notificationStyles;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

function trackEvent(eventName, properties = {}) {
    // Analytics tracking (placeholder)
    console.log(`Event: ${eventName}`, properties);
    
    // In a real application, you would send this to your analytics service
    // Example: analytics.track(eventName, properties);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.chat-modal, .schedule-modal');
        modals.forEach(modal => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        });
    }
});

// Add shake animation CSS
const shakeStyles = `
    <style>
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    </style>
`;
document.head.insertAdjacentHTML('beforeend', shakeStyles);

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Contact page error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Performance Monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Contact page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}

// Make functions globally available
window.resetForm = resetForm;
window.openMap = openMap;
window.scheduleVisit = scheduleVisit;
window.startChat = startChat;

console.log('Contact JavaScript loaded successfully');