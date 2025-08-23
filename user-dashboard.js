// User Dashboard JavaScript - Real-time Data Management

// Auto-hide Navbar on Scroll for User Dashboard
let userLastScrollTop = 0;
let userNavbar = null;

document.addEventListener('DOMContentLoaded', function() {
    userNavbar = document.querySelector('.navbar');
    let userTicking = false;

    function updateUserNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Don't hide navbar at the very top of the page
        if (scrollTop <= 100) {
            userNavbar.classList.remove('hidden');
            userNavbar.classList.add('visible');
        } else if (scrollTop > userLastScrollTop && scrollTop > 150) {
            // Scrolling down - hide navbar
            userNavbar.classList.add('hidden');
            userNavbar.classList.remove('visible');
        } else if (scrollTop < userLastScrollTop) {
            // Scrolling up - show navbar
            userNavbar.classList.remove('hidden');
            userNavbar.classList.add('visible');
        }
        
        userLastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
        userTicking = false;
    }

    function requestUserTick() {
        if (!userTicking) {
            requestAnimationFrame(updateUserNavbar);
            userTicking = true;
        }
    }

    window.addEventListener('scroll', requestUserTick);
});

class UserDashboard {
    constructor() {
        this.currentUser = null;
        this.bookings = [];
        this.messages = [];
        this.init();
    }

    init() {
        // Check if user is logged in
        if (!this.checkAuth()) {
            window.location.href = 'index.html';
            return;
        }

        this.loadUserData();
        this.setupEventListeners();
        this.loadDashboardData();
        this.startRealTimeSync();
        this.handleHashNavigation();
    }

    checkAuth() {
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        const loginTime = localStorage.getItem('userLoginTime');
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours for users

        if (!isLoggedIn || !loginTime || (currentTime - loginTime) > sessionDuration) {
            this.logout();
            return false;
        }
        return true;
    }

    loadUserData() {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.currentUser = userData;
        
        if (userData.firstName) {
            document.getElementById('userName').textContent = userData.firstName;
            this.populateProfile();
        }
    }

    populateProfile() {
        const user = this.currentUser;
        document.getElementById('profileFirstName').value = user.firstName || '';
        document.getElementById('profileLastName').value = user.lastName || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profilePhone').value = user.phone || '';
        document.getElementById('profileDietary').value = user.dietary || '';
        document.getElementById('profileExperience').value = user.experience || 'beginner';
    }

    setupEventListeners() {
        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Profile form
        document.getElementById('profileForm').addEventListener('submit', (e) => this.saveProfile(e));

        // Message input
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        messageInput.addEventListener('input', this.autoResizeTextarea);

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    loadDashboardData() {
        // Initial data population – do not rebind events or start timers here
        this.loadBookings();
        this.loadMessages();
        this.updateStats();
    }

    // startRealTimeSync defined later (single source of truth)

    // Remove duplicate definition of setupEventListeners below

    autoResizeTextarea(e) {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    }

    loadBookings() {
        // Get all bookings from localStorage (consistent with main site)
        const allBookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
        
        // Filter bookings for current user
        this.bookings = allBookings.filter(booking => 
            booking.email === this.currentUser.email
        );

        this.renderBookings();
    }

    renderBookings() {
        const upcomingList = document.getElementById('upcomingBookingsList');
        const pastList = document.getElementById('pastBookingsList');
        
        const upcoming = this.bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate >= new Date() && booking.status !== 'cancelled';
        });

        const past = this.bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate < new Date() || booking.status === 'completed';
        });

        // Render upcoming bookings
        if (upcoming.length === 0) {
            upcomingList.innerHTML = `
                <div class="no-bookings">
                    <p>No upcoming bookings. <a href="index.html#calendar">Book a class now!</a></p>
                </div>
            `;
        } else {
            upcomingList.innerHTML = upcoming.map(booking => this.renderBookingItem(booking, true)).join('');
        }

        // Render past bookings
        if (past.length === 0) {
            pastList.innerHTML = `
                <div class="no-bookings">
                    <p>No past bookings yet.</p>
                </div>
            `;
        } else {
            pastList.innerHTML = past.map(booking => this.renderBookingItem(booking, false)).join('');
        }
    }

    renderBookingItem(booking, isUpcoming) {
        const date = new Date(booking.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const statusClass = booking.status || 'confirmed';
        let statusText = booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Confirmed';
        
        // Add payment status if available
        let paymentStatus = '';
        if (booking.payment) {
            if (booking.payment.paymentStatus === 'completed') {
                paymentStatus = '<span class="payment-status paid">✓ Paid</span>';
            } else if (booking.payment.paymentStatus === 'pending') {
                paymentStatus = '<span class="payment-status pending">⏳ Payment Pending</span>';
            }
        } else if (booking.status === 'paid') {
            paymentStatus = '<span class="payment-status paid">✓ Paid</span>';
        }

        const actions = isUpcoming ? `
            <div class="booking-actions">
                <button class="booking-btn secondary" onclick="userDashboard.modifyBooking('${booking.id}')">Modify</button>
                <button class="booking-btn danger" onclick="userDashboard.cancelBooking('${booking.id}')">Cancel</button>
                <button class="booking-btn primary" onclick="userDashboard.messageAboutBooking('${booking.id}')">Message Chef</button>
            </div>
        ` : `
            <div class="booking-actions">
                <button class="booking-btn primary" onclick="userDashboard.rateClass('${booking.id}')">Rate Class</button>
                <button class="booking-btn secondary" onclick="userDashboard.rebookClass('${booking.className}')">Book Again</button>
            </div>
        `;

        return `
            <div class="booking-item" data-booking-id="${booking.id}">
                <div class="booking-header">
                    <div class="booking-class">${booking.className}</div>
                    <div class="booking-status ${statusClass}">${statusText}</div>
                </div>
                ${paymentStatus ? `<div class="booking-payment-status">${paymentStatus}</div>` : ''}
                <div class="booking-details">
                    <div class="booking-detail">
                        <strong>Date:</strong> ${formattedDate}
                    </div>
                    <div class="booking-detail">
                        <strong>Seats:</strong> ${booking.seats} ${booking.seats == 1 ? 'person' : 'people'}
                    </div>
                    <div class="booking-detail">
                        <strong>Total:</strong> $${booking.total || 'TBD'}
                    </div>
                    <div class="booking-detail">
                        <strong>Booking ID:</strong> #${booking.id}
                    </div>
                </div>
                ${booking.dietary ? `
                    <div style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                        <strong>Dietary Notes:</strong> ${booking.dietary}
                    </div>
                ` : ''}
                ${actions}
            </div>
        `;
    }

    loadMessages() {
        // Load messages from localStorage
        const allMessages = JSON.parse(localStorage.getItem('userMessages') || '{}');
        this.messages = allMessages[this.currentUser.email] || [];
        
        // Mark admin messages as read when user views them
        this.markAdminMessagesAsRead();
        
        this.renderMessages();
    }

    markAdminMessagesAsRead() {
        let hasUnread = false;
        this.messages.forEach(msg => {
            if (msg.sender === 'admin' && !msg.read) {
                msg.read = true;
                hasUnread = true;
            }
        });

        if (hasUnread) {
            const allMessages = JSON.parse(localStorage.getItem('userMessages') || '{}');
            allMessages[this.currentUser.email] = this.messages;
            localStorage.setItem('userMessages', JSON.stringify(allMessages));
        }
    }

    renderMessages() {
        const chatMessages = document.getElementById('chatMessages');
        
        // Sort messages by timestamp
        const sortedMessages = [...this.messages].sort((a, b) => a.timestamp - b.timestamp);
        
        // Always show welcome message if no messages
        if (sortedMessages.length === 0) {
            chatMessages.innerHTML = `
                <div class="message admin-message">
                    <div class="message-avatar">👨‍🍳</div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">Chef Brian</span>
                            <span class="message-time">Welcome!</span>
                        </div>
                        <div class="message-text">Join us for a cooking class that features both technique and hands on learning when possible. I'm excited to help you on your culinary journey. Feel free to ask me any questions about our classes!</div>
                    </div>
                </div>
            `;
        } else {
            const messagesHTML = sortedMessages.map((msg, index) => {
                const time = this.formatMessageTime(msg.timestamp);
                const fullTime = new Date(msg.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const isUser = msg.sender === 'user';
                const avatar = isUser ? '👤' : '👨‍🍳';
                const senderName = isUser ? this.currentUser.firstName : 'Chef Brian';
                
                // Show date separator if this is a new day
                const showDateSeparator = this.shouldShowDateSeparator(msg, sortedMessages[index - 1]);
                
                return `
                    ${showDateSeparator ? `<div class="date-separator">${this.formatDateSeparator(msg.timestamp)}</div>` : ''}
                    <div class="message ${isUser ? 'user-message' : 'admin-message'}" data-message-id="${msg.id}">
                        <div class="message-avatar">${avatar}</div>
                        <div class="message-content">
                            <div class="message-header">
                                <span class="message-sender">${senderName}</span>
                                <span class="message-time" title="${fullTime}">${time}</span>
                            </div>
                            <div class="message-text">${msg.text}</div>
                            ${!isUser && msg.type ? `<div class="message-type">${this.formatMessageType(msg.type)}</div>` : ''}
                            ${isUser ? `<div class="message-status ${msg.read ? 'read' : 'sent'}"></div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            chatMessages.innerHTML = messagesHTML;
        }
        
        // Scroll to bottom smoothly
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (60 * 1000));
        const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
        const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    }

    shouldShowDateSeparator(currentMsg, previousMsg) {
        if (!previousMsg) return true;
        
        const currentDate = new Date(currentMsg.timestamp);
        const previousDate = new Date(previousMsg.timestamp);
        
        return currentDate.toDateString() !== previousDate.toDateString();
    }

    formatDateSeparator(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (24 * 60 * 60 * 1000));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    formatMessageType(type) {
        const types = {
            'welcome': '🎉 Welcome',
            'class_reminder': '⏰ Reminder',
            'general': '💬 Message',
            'feedback': '💭 Feedback',
            'promotional': '🎁 Special Offer'
        };
        return types[type] || '💬 Message';
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const text = messageInput.value.trim();
        
        if (!text) return;

        const message = {
            id: Date.now().toString(),
            sender: 'user',
            text: text,
            timestamp: Date.now(),
            read: false
        };

        this.messages.push(message);
        
        // Save to localStorage
        const allMessages = JSON.parse(localStorage.getItem('userMessages') || '{}');
        allMessages[this.currentUser.email] = this.messages;
        localStorage.setItem('userMessages', JSON.stringify(allMessages));

        // Add to admin notification queue
        this.addAdminNotification(message);

        // Clear input and re-render
        messageInput.value = '';
        messageInput.style.height = 'auto';
        this.renderMessages();
    }

    addAdminNotification(message) {
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        notifications.push({
            id: Date.now().toString(),
            type: 'message',
            user: this.currentUser,
            message: message,
            timestamp: Date.now(),
            read: false
        });
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    }

    // Removed simulateAdminResponse – admin will reply manually

    updateStats() {
        const totalBookings = this.bookings.length;
        const upcomingBookings = this.bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate >= new Date() && booking.status !== 'cancelled';
        }).length;
        const completedBookings = this.bookings.filter(booking => 
            booking.status === 'completed'
        ).length;
        const unreadMessages = this.messages.filter(msg => 
            msg.sender === 'admin' && !msg.read
        ).length;

        document.getElementById('userTotalBookings').textContent = totalBookings;
        document.getElementById('userUpcomingClasses').textContent = upcomingBookings;
        document.getElementById('userCompletedClasses').textContent = completedBookings;
        document.getElementById('userNewMessages').textContent = unreadMessages;
    }

    saveProfile(e) {
        e.preventDefault();
        
        const profileData = {
            ...this.currentUser,
            firstName: document.getElementById('profileFirstName').value,
            lastName: document.getElementById('profileLastName').value,
            phone: document.getElementById('profilePhone').value,
            dietary: document.getElementById('profileDietary').value,
            experience: document.getElementById('profileExperience').value
        };

        // Update current user
        this.currentUser = profileData;
        localStorage.setItem('currentUser', JSON.stringify(profileData));

        // Update user in users database
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(user => user.email === profileData.email);
        if (userIndex !== -1) {
            users[userIndex] = {...users[userIndex], ...profileData};
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Update name display
        document.getElementById('userName').textContent = profileData.firstName;

        // Show success message
        this.showMessage('Profile updated successfully!', 'success');
    }

    changePassword() {
        const currentPassword = prompt('Enter your current password:');
        if (!currentPassword) return;

        // Verify current password
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === this.currentUser.email);
        
        if (!user || user.password !== currentPassword) {
            this.showMessage('Current password is incorrect.', 'error');
            return;
        }

        const newPassword = prompt('Enter your new password (minimum 6 characters):');
        if (!newPassword || newPassword.length < 6) {
            this.showMessage('New password must be at least 6 characters long.', 'error');
            return;
        }

        const confirmPassword = prompt('Confirm your new password:');
        if (newPassword !== confirmPassword) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }

        // Update password
        const userIndex = users.findIndex(u => u.email === this.currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            users[userIndex].passwordLastUpdated = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));

            this.showMessage('Password updated successfully!', 'success');
            
            // Add admin notification
            this.addAdminNotification({
                type: 'security',
                message: `${this.currentUser.firstName} ${this.currentUser.lastName} changed their password`,
                timestamp: Date.now(),
                read: false
            });
        }
    }

    autoResizeTextarea(e) {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }

    startRealTimeSync() {
        // Check for updates every 5 seconds
        setInterval(() => {
            this.syncData();
        }, 5000);
    }

    syncData() {
        // Reload bookings and messages to get real-time updates
        this.loadBookings();
        this.loadMessages();
        this.updateStats();
    }

    handleHashNavigation() {
        // Handle direct navigation to specific sections via hash
        const hash = window.location.hash;
        if (hash) {
            // Small delay to ensure page is fully loaded
            setTimeout(() => {
                const targetSection = hash.substring(1); // Remove the #
                const element = document.getElementById(targetSection);
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                    
                    // Show navigation message
                    const sectionNames = {
                        'my-bookings': 'My Bookings',
                        'profile': 'My Profile',
                        'messages': 'Messages',
                        'dashboard': 'Dashboard'
                    };
                    
                    const sectionName = sectionNames[targetSection] || 'Section';
                    this.showMessage(`📍 Navigated to ${sectionName}`, 'info');
                }
            }, 100);
        }

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.handleHashNavigation();
        });
    }

    // Booking action methods
    modifyBooking(bookingId) {
        // In a real app, this would open a modal to modify the booking
        alert('Modify booking feature will be available soon. Please contact Chef Brian directly.');
    }

    cancelBooking(bookingId) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            const allBookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
            const bookingIndex = allBookings.findIndex(b => b.id === bookingId);
            
            if (bookingIndex !== -1) {
                allBookings[bookingIndex].status = 'cancelled';
                localStorage.setItem('cottageBookings', JSON.stringify(allBookings));
                
                // Add admin notification
                this.addAdminNotification({
                    text: `Booking #${bookingId} has been cancelled by the customer.`,
                    sender: 'system',
                    timestamp: Date.now()
                });
                
                this.loadBookings();
                this.showMessage('Booking cancelled successfully.', 'info');
            }
        }
    }

    messageAboutBooking(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
            const message = `Hi Chef Brian, I have a question about my upcoming ${booking.className} class on ${new Date(booking.date).toLocaleDateString()}. `;
            document.getElementById('messageInput').value = message;
            document.querySelector('#messages').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('messageInput').focus();
        }
    }

    rateClass(bookingId) {
        // In a real app, this would open a rating modal
        alert('Class rating feature will be available soon. Thank you for taking our classes!');
    }

    rebookClass(className) {
        window.location.href = 'index.html#calendar';
    }

    logout() {
        // Get current user for logout message
        const userName = this.currentUser.firstName || 'User';
        
        // Clear all user session data consistently
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userLoginTime');
        localStorage.removeItem('currentUser');
        
        // Add logout notification for admin
        const logoutNotification = {
            type: 'logout',
            message: `${userName} logged out from dashboard`,
            timestamp: Date.now(),
            read: false
        };
        
        try {
            const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
            notifications.unshift(logoutNotification);
            if (notifications.length > 50) {
                notifications.splice(50);
            }
            localStorage.setItem('adminNotifications', JSON.stringify(notifications));
        } catch (error) {
            console.log('Could not save logout notification');
        }
        
        // Show message and redirect
        this.showMessage(`👋 Goodbye ${userName}! Redirecting...`, 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    showMessage(text, type = 'info') {
        // Create and show a temporary message
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#e8f2e8' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#2c5530' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 15px 20px;
            border-radius: 8px;
            border: 1px solid ${type === 'success' ? '#7a9a4d' : type === 'error' ? '#dc3545' : '#17a2b8'};
            z-index: 1001;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => document.body.removeChild(message), 300);
        }, 3000);
    }
}

// Modal functions
function bookNewClass() {
    document.getElementById('bookClassModal').style.display = 'block';
}

function closeBookModal() {
    document.getElementById('bookClassModal').style.display = 'none';
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Initialize dashboard when page loads
let userDashboard;
document.addEventListener('DOMContentLoaded', function() {
    userDashboard = new UserDashboard();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('bookClassModal');
    if (event.target === modal) {
        closeBookModal();
    }
}
