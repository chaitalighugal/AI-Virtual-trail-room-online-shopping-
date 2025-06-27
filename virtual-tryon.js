// Virtual Try-On JavaScript
class VirtualTryOn {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.bodyDetectionCanvas = document.getElementById('body-detection-canvas');
        this.bodyDetectionCtx = this.bodyDetectionCanvas.getContext('2d');
        this.overlay = document.getElementById('clothing-overlay');
        this.stream = null;
        this.currentCamera = 'user'; // 'user' for front camera, 'environment' for back
        this.screenshots = [];
        this.currentOverlay = null;
        
        // AI-powered features
        this.bodyDetectionEnabled = false;
        this.bodyMeasurements = {
            height: null,
            chest: null,
            waist: null,
            bodyType: null
        };
        this.bodyKeypoints = [];
        this.aiRecommendations = [];
        this.detectionInterval = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeControls();
        this.initializeAI();
    }

    initializeElements() {
        // Get all necessary DOM elements
        this.startCameraBtn = document.getElementById('start-camera-btn');
        this.stopCameraBtn = document.getElementById('stop-camera-btn');
        this.screenshotBtn = document.getElementById('screenshot-btn');
        this.switchCameraBtn = document.getElementById('switch-camera-btn');
        this.imageUpload = document.getElementById('photo-upload');
        this.loadingMessage = document.getElementById('loading-message');
        this.loadingText = document.getElementById('loading-text');
        this.aiProcessingMessage = document.getElementById('ai-processing-message');
        this.aiProcessingText = document.getElementById('ai-processing-text');
        this.errorMessage = document.getElementById('error-message');
        this.successMessage = document.getElementById('success-message');
        this.errorText = document.getElementById('error-text');
        this.successText = document.getElementById('success-text');
        this.screenshotsGrid = document.getElementById('screenshots-grid');
        this.clearScreenshotsBtn = document.getElementById('clear-screenshots');
        this.downloadAllBtn = document.getElementById('download-all');
        this.opacitySlider = document.getElementById('overlay-opacity');
        this.sizeSlider = document.getElementById('overlay-size');
        this.opacityValue = document.getElementById('opacity-value');
        this.sizeValue = document.getElementById('size-value');
        this.resetOverlayBtn = document.getElementById('reset-overlay');
        this.removeOverlayBtn = document.getElementById('remove-overlay');
        
        // AI-specific elements
        this.enableBodyDetectionBtn = document.getElementById('enable-body-detection-btn');
        this.getAiSuggestionsBtn = document.getElementById('get-ai-suggestions-btn');
        this.autoSizeFitBtn = document.getElementById('auto-size-fit');
        this.saveFitBtn = document.getElementById('save-fit');
        this.positionXSlider = document.getElementById('position-x');
        this.positionYSlider = document.getElementById('position-y');
        this.positionXValue = document.getElementById('position-x-value');
        this.positionYValue = document.getElementById('position-y-value');
        this.measurementDisplay = document.getElementById('measurement-display');
        this.heightValue = document.getElementById('height-value');
        this.chestValue = document.getElementById('chest-value');
        this.waistValue = document.getElementById('waist-value');
        this.bodyTypeValue = document.getElementById('body-type-value');
        this.aiRecommendationsSection = document.getElementById('ai-recommendations-section');
        this.recommendationCards = document.getElementById('ai-recommendations-list');
    }

    bindEvents() {
        // Camera controls
        this.startCameraBtn.addEventListener('click', () => this.startCamera());
        this.stopCameraBtn.addEventListener('click', () => this.stopCamera());
        this.screenshotBtn.addEventListener('click', () => this.takeScreenshot());
        this.switchCameraBtn.addEventListener('click', () => this.switchCamera());
        
        // AI controls
        this.enableBodyDetectionBtn.addEventListener('click', () => this.toggleBodyDetection());
        this.getAiSuggestionsBtn.addEventListener('click', () => this.generateAIRecommendations());
        this.autoSizeFitBtn.addEventListener('click', () => this.autoSizeFit());
        this.saveFitBtn.addEventListener('click', () => this.saveFit());
        
        // Image upload
        this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Category tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchCategory(e.target.dataset.category));
        });
        
        // Try-on buttons
        document.querySelectorAll('.try-on-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.tryOnItem(e.target.dataset.item));
        });
        
        // Overlay controls
        this.opacitySlider.addEventListener('input', (e) => this.updateOpacity(e.target.value));
        this.sizeSlider.addEventListener('input', (e) => this.updateSize(e.target.value));
        this.positionXSlider.addEventListener('input', (e) => this.updatePositionX(e.target.value));
        this.positionYSlider.addEventListener('input', (e) => this.updatePositionY(e.target.value));
        this.resetOverlayBtn.addEventListener('click', () => this.resetOverlay());
        this.removeOverlayBtn.addEventListener('click', () => this.removeOverlay());
        
        // Screenshot controls
        this.clearScreenshotsBtn.addEventListener('click', () => this.clearScreenshots());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAllScreenshots());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    initializeControls() {
        // Set initial values
        this.updateOpacity(this.opacitySlider.value);
        this.updateSize(this.sizeSlider.value);
        this.updatePositionX(this.positionXSlider.value);
        this.updatePositionY(this.positionYSlider.value);
        
        // Show default category
        this.switchCategory('tops');
    }
    
    initializeAI() {
        // Initialize AI-powered features
        this.showSuccess('AI Virtual Mirror ready! Start camera to begin body detection.');
    }

    async startCamera() {
        try {
            this.showLoading('Initializing AI mirror...');
            
            const constraints = {
                video: {
                    facingMode: this.currentCamera,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.bodyDetectionCanvas.width = this.video.videoWidth;
                this.bodyDetectionCanvas.height = this.video.videoHeight;
                this.hideMessages();
                this.showSuccess('AI Mirror started! Enable body detection for smart features.');
                this.updateCameraControls(true);
            };
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showError(this.getCameraErrorMessage(error));
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.video.srcObject = null;
            this.updateCameraControls(false);
            this.showSuccess('Camera stopped');
        }
    }

    async switchCamera() {
        if (this.stream) {
            this.currentCamera = this.currentCamera === 'user' ? 'environment' : 'user';
            this.stopCamera();
            await this.startCamera();
        }
    }

    updateCameraControls(cameraActive) {
        this.startCameraBtn.style.display = cameraActive ? 'none' : 'inline-block';
        this.stopCameraBtn.style.display = cameraActive ? 'inline-block' : 'none';
        this.screenshotBtn.style.display = cameraActive ? 'inline-block' : 'none';
        this.switchCameraBtn.style.display = cameraActive ? 'inline-block' : 'none';
        this.enableBodyDetectionBtn.style.display = cameraActive ? 'inline-block' : 'none';
        this.getAiSuggestionsBtn.style.display = cameraActive ? 'inline-block' : 'none';
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.video.style.display = 'none';
                this.canvas.style.display = 'block';
                
                const img = new Image();
                img.onload = () => {
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;
                    this.ctx.drawImage(img, 0, 0);
                    this.updateCameraControls(false);
                    this.screenshotBtn.style.display = 'inline-block';
                    this.showSuccess('Image uploaded successfully!');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    switchCategory(category) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Show/hide clothing items
        document.querySelectorAll('.clothing-item').forEach(item => {
            if (item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    tryOnItem(itemId) {
        // Remove previous selection
        document.querySelectorAll('.clothing-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to current item
        const selectedItem = document.querySelector(`[data-item="${itemId}"]`).closest('.clothing-item');
        selectedItem.classList.add('selected');
        
        // Create overlay (using placeholder since we don't have actual overlay images)
        this.createOverlay(itemId);
        this.currentOverlay = itemId;
        
        this.showSuccess(`Trying on ${itemId.replace('-', ' ')}!`);
    }

    createOverlay(itemId) {
        this.overlay.style.display = 'block';
        
        // Map item IDs to their overlay images
        const overlayImages = {
            'red-tshirt': 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Red+T-Shirt',
            'blue-shirt': 'https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Blue+Shirt',
            'blue-jeans': 'https://via.placeholder.com/300x500/45B7D1/FFFFFF?text=Jeans',
            'red-dress': 'dress1.svg',
            'pink-dress': 'dress2.svg',
            'corset-dress': 'dress3.svg',
            'sunglasses': 'https://via.placeholder.com/200x100/F39C12/FFFFFF?text=Sunglasses'
        };
        
        const overlayUrl = overlayImages[itemId];
        if (overlayUrl) {
            this.overlay.src = overlayUrl;
            this.overlay.style.opacity = this.opacitySlider.value / 100;
            this.overlay.style.transform = `scale(${this.sizeSlider.value / 100})`;
            
            // Position the overlay
            const xOffset = this.positionXSlider.value;
            const yOffset = this.positionYSlider.value;
            this.overlay.style.left = `calc(50% + ${xOffset}px)`;
            this.overlay.style.top = `calc(50% + ${yOffset}px)`;
        } else {
            // Fallback: create a colored rectangle as placeholder
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#667eea';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(itemId.replace('-', ' ').toUpperCase(), canvas.width/2, canvas.height/2);
            
            this.overlay.src = canvas.toDataURL();
         }
        this.resetOverlay();
    }

    updateOpacity(value) {
        this.opacityValue.textContent = value + '%';
        if (this.overlay.style.display === 'block') {
            this.overlay.style.opacity = value / 100;
        }
    }

    updateSize(value) {
        this.sizeValue.textContent = value + '%';
        if (this.overlay.style.display === 'block') {
            this.updateOverlayTransform();
        }
    }
    
    updatePositionX(value) {
        this.positionXValue.textContent = value;
        if (this.overlay.style.display === 'block') {
            this.updateOverlayTransform();
        }
    }
    
    updatePositionY(value) {
        this.positionYValue.textContent = value;
        if (this.overlay.style.display === 'block') {
            this.updateOverlayTransform();
        }
    }
    
    updateOverlayTransform() {
        const scale = this.sizeSlider.value / 100;
        const translateX = -50 + parseInt(this.positionXSlider.value);
        const translateY = -50 + parseInt(this.positionYSlider.value);
        this.overlay.style.transform = `translate(${translateX}%, ${translateY}%) scale(${scale})`;
    }

    resetOverlay() {
        this.opacitySlider.value = 80;
        this.sizeSlider.value = 100;
        this.positionXSlider.value = 0;
        this.positionYSlider.value = 0;
        this.updateOpacity(80);
        this.updateSize(100);
        this.updatePositionX(0);
        this.updatePositionY(0);
    }

    removeOverlay() {
        this.overlay.style.display = 'none';
        this.currentOverlay = null;
        
        // Remove selection from all items
        document.querySelectorAll('.clothing-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        this.showSuccess('Overlay removed');
    }

    takeScreenshot() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (this.video.style.display !== 'none' && this.stream) {
            // Screenshot from video
            canvas.width = this.video.videoWidth;
            canvas.height = this.video.videoHeight;
            ctx.drawImage(this.video, 0, 0);
        } else {
            // Screenshot from uploaded image
            canvas.width = this.canvas.width;
            canvas.height = this.canvas.height;
            ctx.drawImage(this.canvas, 0, 0);
        }
        
        // Add overlay if present
        if (this.overlay.style.display === 'block') {
            const overlayImg = new Image();
            overlayImg.onload = () => {
                const overlayWidth = overlayImg.width * (this.sizeSlider.value / 100);
                const overlayHeight = overlayImg.height * (this.sizeSlider.value / 100);
                const x = (canvas.width - overlayWidth) / 2;
                const y = (canvas.height - overlayHeight) / 2;
                
                ctx.globalAlpha = this.opacitySlider.value / 100;
                ctx.drawImage(overlayImg, x, y, overlayWidth, overlayHeight);
                ctx.globalAlpha = 1;
                
                this.saveScreenshot(canvas.toDataURL());
            };
            overlayImg.src = this.overlay.src;
        } else {
            this.saveScreenshot(canvas.toDataURL());
        }
    }

    saveScreenshot(dataUrl) {
        const timestamp = new Date().toLocaleString();
        const screenshot = {
            id: Date.now(),
            dataUrl: dataUrl,
            timestamp: timestamp,
            overlay: this.currentOverlay
        };
        
        this.screenshots.push(screenshot);
        this.updateScreenshotsGrid();
        this.showSuccess('Screenshot saved!');
    }

    updateScreenshotsGrid() {
        const grid = this.screenshotsGrid;
        
        if (this.screenshots.length === 0) {
            grid.innerHTML = `
                <div class="no-screenshots">
                    <i class="fas fa-camera fa-2x"></i>
                    <p>No screenshots yet. Take some photos to see them here!</p>
                </div>
            `;
            this.clearScreenshotsBtn.style.display = 'none';
            this.downloadAllBtn.style.display = 'none';
        } else {
            grid.innerHTML = this.screenshots.map(screenshot => `
                <div class="screenshot-item" data-id="${screenshot.id}">
                    <img src="${screenshot.dataUrl}" alt="Screenshot">
                    <button class="delete-btn" onclick="virtualTryOn.deleteScreenshot(${screenshot.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
            
            this.clearScreenshotsBtn.style.display = 'inline-block';
            this.downloadAllBtn.style.display = 'inline-block';
        }
    }

    deleteScreenshot(id) {
        this.screenshots = this.screenshots.filter(screenshot => screenshot.id !== id);
        this.updateScreenshotsGrid();
        this.showSuccess('Screenshot deleted');
    }

    clearScreenshots() {
        if (confirm('Are you sure you want to delete all screenshots?')) {
            this.screenshots = [];
            this.updateScreenshotsGrid();
            this.showSuccess('All screenshots cleared');
        }
    }

    downloadAllScreenshots() {
        if (this.screenshots.length === 0) return;
        
        this.screenshots.forEach((screenshot, index) => {
            const link = document.createElement('a');
            link.download = `virtualfit-screenshot-${index + 1}.png`;
            link.href = screenshot.dataUrl;
            link.click();
        });
        
        this.showSuccess(`Downloaded ${this.screenshots.length} screenshots`);
    }

    handleKeyboard(event) {
        switch(event.key) {
            case ' ': // Spacebar
                event.preventDefault();
                if (this.stream || this.canvas.style.display === 'block') {
                    this.takeScreenshot();
                }
                break;
            case 'Escape':
                this.removeOverlay();
                break;
            case 'c':
            case 'C':
                if (event.ctrlKey) {
                    event.preventDefault();
                    if (!this.stream) {
                        this.startCamera();
                    }
                }
                break;
        }
    }

    getCameraErrorMessage(error) {
        switch(error.name) {
            case 'NotAllowedError':
                return 'Camera access denied. Please allow camera permissions and try again.';
            case 'NotFoundError':
                return 'No camera found. Please connect a camera and try again.';
            case 'NotSupportedError':
                return 'Camera not supported by this browser.';
            case 'NotReadableError':
                return 'Camera is being used by another application.';
            default:
                return 'Failed to access camera. Please try again.';
        }
    }

    showLoading(message) {
        this.hideMessages();
        this.loadingMessage.style.display = 'block';
        if (this.loadingText) {
            this.loadingText.textContent = message;
        }
    }
    
    showAIProcessing(message) {
        this.hideMessages();
        this.aiProcessingMessage.style.display = 'block';
        if (this.aiProcessingText) {
            this.aiProcessingText.textContent = message;
        }
    }

    showError(message) {
        this.hideMessages();
        this.errorMessage.style.display = 'block';
        this.errorText.textContent = message;
        setTimeout(() => this.hideMessages(), 5000);
    }

    showSuccess(message) {
        this.hideMessages();
        this.successMessage.style.display = 'block';
        this.successText.textContent = message;
        setTimeout(() => this.hideMessages(), 3000);
    }

    hideMessages() {
        this.loadingMessage.style.display = 'none';
        this.aiProcessingMessage.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.successMessage.style.display = 'none';
    }
}

    // AI-Powered Body Detection Methods
    toggleBodyDetection() {
        if (!this.bodyDetectionEnabled) {
            this.startBodyDetection();
        } else {
            this.stopBodyDetection();
        }
    }
    
    startBodyDetection() {
        if (!this.stream) {
            this.showError('Please start the camera first!');
            return;
        }
        
        this.bodyDetectionEnabled = true;
        this.enableBodyDetectionBtn.innerHTML = '<i class="fas fa-user-times"></i> Disable Body Detection';
        this.showAIProcessing('Starting AI body analysis...');
        
        // Simulate body detection with mock data
        this.detectionInterval = setInterval(() => {
            this.performBodyDetection();
        }, 1000);
        
        setTimeout(() => {
            this.hideMessages();
            this.showSuccess('Body detection active! AI analyzing your measurements.');
            this.measurementDisplay.style.display = 'block';
        }, 2000);
    }
    
    stopBodyDetection() {
        this.bodyDetectionEnabled = false;
        this.enableBodyDetectionBtn.innerHTML = '<i class="fas fa-user-check"></i> Enable Body Detection';
        
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        this.bodyDetectionCtx.clearRect(0, 0, this.bodyDetectionCanvas.width, this.bodyDetectionCanvas.height);
        this.measurementDisplay.style.display = 'none';
        this.showSuccess('Body detection stopped.');
    }
    
    performBodyDetection() {
        // Simulate AI body detection with realistic mock data
        this.bodyKeypoints = this.generateMockBodyKeypoints();
        this.bodyMeasurements = this.calculateBodyMeasurements();
        
        this.drawBodyKeypoints();
        this.updateMeasurementDisplay();
    }
    
    generateMockBodyKeypoints() {
        // Generate realistic body keypoints for demonstration
        const centerX = this.bodyDetectionCanvas.width / 2;
        const centerY = this.bodyDetectionCanvas.height / 2;
        
        return {
            nose: { x: centerX, y: centerY - 120 },
            leftShoulder: { x: centerX - 60, y: centerY - 80 },
            rightShoulder: { x: centerX + 60, y: centerY - 80 },
            leftElbow: { x: centerX - 80, y: centerY - 20 },
            rightElbow: { x: centerX + 80, y: centerY - 20 },
            leftWrist: { x: centerX - 90, y: centerY + 40 },
            rightWrist: { x: centerX + 90, y: centerY + 40 },
            leftHip: { x: centerX - 40, y: centerY + 60 },
            rightHip: { x: centerX + 40, y: centerY + 60 },
            leftKnee: { x: centerX - 45, y: centerY + 140 },
            rightKnee: { x: centerX + 45, y: centerY + 140 },
            leftAnkle: { x: centerX - 50, y: centerY + 220 },
            rightAnkle: { x: centerX + 50, y: centerY + 220 }
        };
    }
    
    calculateBodyMeasurements() {
        // Calculate measurements based on keypoints
        const keypoints = this.bodyKeypoints;
        
        // Simulate realistic measurements
        const height = Math.round(165 + Math.random() * 20); // 165-185 cm
        const chest = Math.round(85 + Math.random() * 15); // 85-100 cm
        const waist = Math.round(70 + Math.random() * 15); // 70-85 cm
        
        // Determine body type based on measurements
        let bodyType = 'Average';
        const waistToChestRatio = waist / chest;
        
        if (waistToChestRatio < 0.75) {
            bodyType = 'Athletic';
        } else if (waistToChestRatio > 0.85) {
            bodyType = 'Apple';
        } else {
            bodyType = 'Pear';
        }
        
        return {
            height: height,
            chest: chest,
            waist: waist,
            bodyType: bodyType
        };
    }
    
    drawBodyKeypoints() {
        this.bodyDetectionCtx.clearRect(0, 0, this.bodyDetectionCanvas.width, this.bodyDetectionCanvas.height);
        
        const keypoints = this.bodyKeypoints;
        
        // Draw skeleton connections
        this.bodyDetectionCtx.strokeStyle = '#00ff00';
        this.bodyDetectionCtx.lineWidth = 2;
        this.bodyDetectionCtx.beginPath();
        
        // Draw body outline
        const connections = [
            ['leftShoulder', 'rightShoulder'],
            ['leftShoulder', 'leftElbow'],
            ['leftElbow', 'leftWrist'],
            ['rightShoulder', 'rightElbow'],
            ['rightElbow', 'rightWrist'],
            ['leftShoulder', 'leftHip'],
            ['rightShoulder', 'rightHip'],
            ['leftHip', 'rightHip'],
            ['leftHip', 'leftKnee'],
            ['leftKnee', 'leftAnkle'],
            ['rightHip', 'rightKnee'],
            ['rightKnee', 'rightAnkle']
        ];
        
        connections.forEach(([start, end]) => {
            if (keypoints[start] && keypoints[end]) {
                this.bodyDetectionCtx.moveTo(keypoints[start].x, keypoints[start].y);
                this.bodyDetectionCtx.lineTo(keypoints[end].x, keypoints[end].y);
            }
        });
        
        this.bodyDetectionCtx.stroke();
        
        // Draw keypoints
        this.bodyDetectionCtx.fillStyle = '#ff0000';
        Object.values(keypoints).forEach(point => {
            this.bodyDetectionCtx.beginPath();
            this.bodyDetectionCtx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            this.bodyDetectionCtx.fill();
        });
    }
    
    updateMeasurementDisplay() {
        this.heightValue.textContent = `${this.bodyMeasurements.height} cm`;
        this.chestValue.textContent = `${this.bodyMeasurements.chest} cm`;
        this.waistValue.textContent = `${this.bodyMeasurements.waist} cm`;
        this.bodyTypeValue.textContent = this.bodyMeasurements.bodyType;
    }
    
    generateAIRecommendations() {
        if (!this.bodyDetectionEnabled) {
            this.showError('Please enable body detection first to get AI recommendations!');
            return;
        }
        
        this.showAIProcessing('AI analyzing your body type and generating personalized recommendations...');
        
        setTimeout(() => {
            this.aiRecommendations = this.createPersonalizedRecommendations();
            this.displayAIRecommendations();
            this.hideMessages();
            this.showSuccess('AI recommendations generated based on your body type!');
        }, 3000);
    }
    
    createPersonalizedRecommendations() {
        const bodyType = this.bodyMeasurements.bodyType;
        const recommendations = [];
        
        switch (bodyType) {
            case 'Athletic':
                recommendations.push(
                    { item: 'blue-shirt', reason: 'Fitted shirts complement your athletic build', confidence: 95 },
                    { item: 'black-hoodie', reason: 'Structured hoodies enhance your shoulder line', confidence: 88 },
                    { item: 'blue-jeans', reason: 'Straight-cut jeans balance your proportions', confidence: 92 }
                );
                break;
            case 'Apple':
                recommendations.push(
                    { item: 'summer-dress', reason: 'A-line dresses create a flattering silhouette', confidence: 90 },
                    { item: 'red-tshirt', reason: 'V-neck styles elongate your torso', confidence: 85 },
                    { item: 'black-pants', reason: 'High-waisted pants define your waistline', confidence: 87 }
                );
                break;
            case 'Pear':
                recommendations.push(
                    { item: 'blue-shirt', reason: 'Structured tops balance your lower body', confidence: 93 },
                    { item: 'evening-dress', reason: 'Empire waist dresses flatter your figure', confidence: 89 },
                    { item: 'black-hoodie', reason: 'Detailed tops draw attention upward', confidence: 86 }
                );
                break;
            default:
                recommendations.push(
                    { item: 'red-tshirt', reason: 'Classic fit works well with your proportions', confidence: 85 },
                    { item: 'blue-jeans', reason: 'Versatile style suits your body type', confidence: 88 },
                    { item: 'summer-dress', reason: 'Balanced silhouette complements your figure', confidence: 90 }
                );
        }
        
        return recommendations;
    }
    
    displayAIRecommendations() {
        this.aiRecommendationsSection.style.display = 'block';
        
        const cardsHTML = this.aiRecommendations.map(rec => `
            <div class="recommendation-card" data-item="${rec.item}">
                <div class="rec-header">
                    <i class="fas fa-brain"></i>
                    <span class="confidence">${rec.confidence}% Match</span>
                </div>
                <div class="rec-item">
                    <i class="fas fa-tshirt fa-2x"></i>
                    <h4>${rec.item.replace('-', ' ').toUpperCase()}</h4>
                </div>
                <p class="rec-reason">${rec.reason}</p>
                <button class="try-rec-btn" onclick="virtualTryOn.tryOnItem('${rec.item}')">
                    <i class="fas fa-eye"></i> Try This On
                </button>
            </div>
        `).join('');
        
        this.recommendationCards.innerHTML = cardsHTML;
    }
    
    autoSizeFit() {
        if (!this.bodyDetectionEnabled || !this.currentOverlay) {
            this.showError('Please enable body detection and select an item first!');
            return;
        }
        
        this.showAIProcessing('AI calculating optimal fit...');
        
        setTimeout(() => {
            // Calculate optimal size based on body measurements
            const optimalSize = this.calculateOptimalSize();
            const optimalPosition = this.calculateOptimalPosition();
            
            // Apply AI-calculated adjustments
            this.sizeSlider.value = optimalSize;
            this.positionXSlider.value = optimalPosition.x;
            this.positionYSlider.value = optimalPosition.y;
            
            this.updateSize(optimalSize);
            this.updatePositionX(optimalPosition.x);
            this.updatePositionY(optimalPosition.y);
            
            this.hideMessages();
            this.showSuccess('AI auto-fit applied! Perfect size and position calculated.');
        }, 2000);
    }
    
    calculateOptimalSize() {
        // Calculate size based on body measurements
        const chestSize = this.bodyMeasurements.chest;
        let optimalSize = 100;
        
        if (chestSize < 90) {
            optimalSize = 85; // Smaller size for smaller chest
        } else if (chestSize > 95) {
            optimalSize = 115; // Larger size for larger chest
        }
        
        return Math.max(50, Math.min(150, optimalSize));
    }
    
    calculateOptimalPosition() {
        // Calculate position based on body keypoints
        const bodyType = this.bodyMeasurements.bodyType;
        let positionX = 0;
        let positionY = 0;
        
        switch (bodyType) {
            case 'Athletic':
                positionY = -5; // Slightly higher for athletic build
                break;
            case 'Apple':
                positionY = 5; // Slightly lower for apple shape
                break;
            case 'Pear':
                positionY = -3; // Slightly higher for pear shape
                break;
        }
        
        return { x: positionX, y: positionY };
    }
    
    saveFit() {
        if (!this.currentOverlay) {
            this.showError('Please select an item to save the fit!');
            return;
        }
        
        const fitData = {
            item: this.currentOverlay,
            size: this.sizeSlider.value,
            opacity: this.opacitySlider.value,
            positionX: this.positionXSlider.value,
            positionY: this.positionYSlider.value,
            bodyMeasurements: this.bodyMeasurements,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        const savedFits = JSON.parse(localStorage.getItem('virtualfit-saved-fits') || '[]');
        savedFits.push(fitData);
        localStorage.setItem('virtualfit-saved-fits', JSON.stringify(savedFits));
        
        this.showSuccess('Fit saved! You can load this configuration later.');
    }
}

// Initialize the virtual try-on when the page loads
let virtualTryOn;

document.addEventListener('DOMContentLoaded', () => {
    virtualTryOn = new VirtualTryOn();
    
    // Check for camera support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        virtualTryOn.showError('Camera not supported by this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
    }
    
    console.log('AI-Powered Virtual Try-On initialized successfully!');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && virtualTryOn && virtualTryOn.stream) {
        // Optionally pause camera when page is hidden
        console.log('Page hidden, camera still running');
    } else if (!document.hidden && virtualTryOn) {
        console.log('Page visible');
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (virtualTryOn && virtualTryOn.stream) {
        virtualTryOn.stopCamera();
    }
});