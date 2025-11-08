// PayPal Integration for Brian Averna Cottage Cooking
class PayPalIntegration {
    constructor() {
        this.clientId = 'YOUR_PAYPAL_CLIENT_ID'; // Replace with your actual PayPal Client ID
        this.currency = 'USD';
        this.init();
    }

    init() {
        // Load PayPal SDK
        this.loadPayPalSDK();
    }

    loadPayPalSDK() {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=${this.currency}`;
        script.onload = () => {
            this.setupPayPalButtons();
        };
        document.head.appendChild(script);
    }

    setupPayPalButtons() {
        // This will be called after PayPal SDK loads
        if (typeof paypal !== 'undefined') {
            this.createPayPalButton();
        }
    }

    createPayPalButton() {
        const paypalButtonContainer = document.getElementById('paypal-button-container');
        if (!paypalButtonContainer) return;

        paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'pay'
            },

            createOrder: (data, actions) => {
                return this.createOrder();
            },

            onApprove: (data, actions) => {
                return this.handlePaymentApproval(data, actions);
            },

            onError: (err) => {
                this.handlePaymentError(err);
            },

            onCancel: (data) => {
                this.handlePaymentCancel(data);
            }
        }).render('#paypal-button-container');
    }

    createOrder() {
        const bookingData = this.getCurrentBookingData();
        if (!bookingData) {
            throw new Error('No booking data available');
        }

        const totalAmount = bookingData.totalAmount;
        const className = bookingData.className;
        const seats = bookingData.seats;
        const isCustomAmount = bookingData.isCustomAmount;
        const customAmount = bookingData.customAmount;

        // Create description based on payment type
        let description;
        if (isCustomAmount) {
            description = `${className} - Custom Amount ($${customAmount.toFixed(2)})`;
        } else {
            description = `${className} - ${seats} seat(s)`;
        }

        return paypal.actions.order.create({
            purchase_units: [{
                amount: {
                    value: totalAmount.toFixed(2),
                    currency_code: this.currency
                },
                description: description,
                custom_id: bookingData.bookingId,
                soft_descriptor: 'Cottage Cooking'
            }],
            application_context: {
                shipping_preference: 'NO_SHIPPING',
                return_url: window.location.origin + '/payment-success.html',
                cancel_url: window.location.origin + '/payment-cancelled.html'
            }
        });
    }

    async handlePaymentApproval(data, actions) {
        try {
            // Show loading state
            this.showPaymentProcessing();

            // Capture the payment
            const order = await actions.order.capture();
            
            // Process successful payment
            await this.processSuccessfulPayment(order);
            
            // Redirect to success page
            this.redirectToSuccess(order);
            
        } catch (error) {
            console.error('Payment capture failed:', error);
            this.handlePaymentError(error);
        }
    }

    async processSuccessfulPayment(order) {
        const bookingData = this.getCurrentBookingData();
        if (!bookingData) return;

        // Update booking with payment information
        const paymentInfo = {
            paypalOrderId: order.id,
            paymentStatus: 'completed',
            paymentAmount: order.purchase_units[0].amount.value,
            paymentDate: new Date().toISOString(),
            payerId: order.payer.payer_id,
            payerEmail: order.payer.email_address
        };

        // Call the main payment success handler - this handles all booking logic
        console.log('🚨 PAYPAL: About to call handlePaymentSuccess function');
        console.log('🚨 PAYPAL: handlePaymentSuccess function exists:', typeof handlePaymentSuccess === 'function');
        
        if (typeof handlePaymentSuccess === 'function') {
            console.log('🚨 PAYPAL: Calling handlePaymentSuccess with order data:', order);
            handlePaymentSuccess(order);
            console.log('🚨 PAYPAL: handlePaymentSuccess completed');
        } else {
            console.error('❌ PAYPAL ERROR: handlePaymentSuccess function not found!');
        }
        
        // Note: handlePaymentSuccess already saves the booking, so we don't duplicate it here

        // Update user dashboard
        this.updateUserDashboard(bookingData, paymentInfo);

        // Update admin dashboard
        this.updateAdminDashboard(bookingData, paymentInfo);

        // Send confirmation email
        this.sendPaymentConfirmation(bookingData, paymentInfo);
    }

    updateBookingWithPayment(bookingId, paymentInfo) {
        const bookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].payment = paymentInfo;
            bookings[bookingIndex].status = 'paid';
            localStorage.setItem('cottageBookings', JSON.stringify(bookings));
        }
    }

    updateUserDashboard(bookingData, paymentInfo) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.email) {
            const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            const userBooking = {
                ...bookingData,
                payment: paymentInfo,
                status: 'paid',
                bookingDate: new Date().toISOString()
            };
            userBookings.push(userBooking);
            localStorage.setItem('userBookings', JSON.stringify(userBookings));
        }
    }

    updateAdminDashboard(bookingData, paymentInfo) {
        // Add payment notification to admin
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        const paymentNotification = {
            id: Date.now(),
            type: 'payment',
            title: 'Payment Received',
            message: `Payment of $${paymentInfo.paymentAmount} received for ${bookingData.className}`,
            booking: bookingData,
            payment: paymentInfo,
            timestamp: Date.now(),
            read: false
        };
        adminNotifications.push(paymentNotification);
        localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    }

    sendPaymentConfirmation(bookingData, paymentInfo) {
        // In a real implementation, this would send an email
        // For now, we'll just log it
        console.log('Payment confirmation sent:', {
            to: bookingData.email,
            subject: 'Payment Confirmed - Cottage Cooking Class',
            booking: bookingData,
            payment: paymentInfo
        });
    }

    getCurrentBookingData() {
        // Get booking data from session storage or form
        const sessionBooking = sessionStorage.getItem('pendingBooking');
        if (sessionBooking) {
            return JSON.parse(sessionBooking);
        }

        // Fallback to form data
        const form = document.getElementById('bookingForm');
        if (form) {
            const formData = new FormData(form);
            const useCustomAmount = document.getElementById('useCustomAmount').checked;
            let totalAmount;
            
            if (useCustomAmount) {
                const customAmount = parseFloat(document.getElementById('customAmount').value) || 0;
                totalAmount = customAmount;
            } else {
                totalAmount = 85 * parseInt(formData.get('seats'));
            }
            
            return {
                bookingId: Date.now(),
                className: formData.get('className'),
                classDate: formData.get('classDate'),
                seats: parseInt(formData.get('seats')),
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                dietary: formData.get('dietary'),
                totalAmount: totalAmount,
                isCustomAmount: useCustomAmount,
                customAmount: useCustomAmount ? parseFloat(document.getElementById('customAmount').value) : null
            };
        }

        return null;
    }

    handlePaymentError(error) {
        console.error('PayPal payment error:', error);
        this.hidePaymentProcessing();
        
        // Show error message to user
        const errorMessage = document.getElementById('payment-error-message');
        if (errorMessage) {
            errorMessage.textContent = 'Payment failed. Please try again or contact support.';
            errorMessage.classList.remove('payment-message-hidden');
        }

        // Log error for admin
        this.logPaymentError(error);
    }

    handlePaymentCancel(data) {
        console.log('Payment cancelled by user:', data);
        this.hidePaymentProcessing();
        
        // Show cancellation message
        const cancelMessage = document.getElementById('payment-cancel-message');
        if (cancelMessage) {
            cancelMessage.textContent = 'Payment was cancelled. You can try again or contact us for assistance.';
            cancelMessage.classList.remove('payment-message-hidden');
        }
    }

    showPaymentProcessing() {
        const processingDiv = document.getElementById('payment-processing');
        if (processingDiv) {
            processingDiv.classList.remove('payment-processing-hidden');
        }
    }

    hidePaymentProcessing() {
        const processingDiv = document.getElementById('payment-processing');
        if (processingDiv) {
            processingDiv.classList.add('payment-processing-hidden');
        }
    }

    redirectToSuccess(order) {
        // Store order info in session for success page
        sessionStorage.setItem('paymentSuccess', JSON.stringify(order));
        
        // Redirect to success page
        window.location.href = 'payment-success.html';
    }

    logPaymentError(error) {
        const errorLog = JSON.parse(localStorage.getItem('paymentErrors') || '[]');
        errorLog.push({
            timestamp: new Date().toISOString(),
            error: error.message || error,
            bookingData: this.getCurrentBookingData()
        });
        localStorage.setItem('paymentErrors', JSON.stringify(errorLog));
    }

    // Utility method to calculate total amount
    calculateTotal(seats, pricePerSeat = 85) {
        return seats * pricePerSeat;
    }

    // Method to validate booking before payment
    validateBooking(bookingData) {
        if (!bookingData.className || !bookingData.classDate || !bookingData.seats) {
            return { valid: false, error: 'Missing booking information' };
        }

        if (bookingData.seats <= 0) {
            return { valid: false, error: 'Invalid number of seats' };
        }

        // Check if seats are still available
        const classes = JSON.parse(localStorage.getItem('cottageClasses') || '[]');
        const targetClass = classes.find(cls => {
            const clsDate = new Date(cls.date).toISOString().split('T')[0];
            const bookingDate = new Date(bookingData.classDate).toISOString().split('T')[0];
            const dateMatches = clsDate === bookingDate;
            
            // Use exact class name matching (similar to script.js)
            const classMatches = cls.class === bookingData.className || 
                               cls.class.toLowerCase().includes(bookingData.className.toLowerCase());
            
            return dateMatches && classMatches;
        });

        if (!targetClass) {
            return { valid: false, error: 'Class not found' };
        }

        if (targetClass.seats < bookingData.seats) {
            return { valid: false, error: 'Not enough seats available' };
        }

        return { valid: true };
    }
}

// Initialize PayPal integration when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.paypalIntegration = new PayPalIntegration();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PayPalIntegration;
}