// Auto-hide Navbar on Scroll
let lastScrollTop = 0;
let navbar = null;

document.addEventListener('DOMContentLoaded', function() {
    navbar = document.querySelector('.navbar');
    let ticking = false;

    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Don't hide navbar at the very top of the page
        if (scrollTop <= 100) {
            navbar.classList.remove('hidden');
            navbar.classList.add('visible');
        } else if (scrollTop > lastScrollTop && scrollTop > 150) {
            // Scrolling down - hide navbar
            navbar.classList.add('hidden');
            navbar.classList.remove('visible');
        } else if (scrollTop < lastScrollTop) {
            // Scrolling up - show navbar
            navbar.classList.remove('hidden');
            navbar.classList.add('visible');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);
});

// Authentication System
class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuthState();
        this.setupAuthEventListeners();
    }

    checkAuthState() {
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        const authLink = document.getElementById('authLink');
        
        if (isLoggedIn) {
            const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            this.updateNavForLoggedInUser(userData); 
        } else {
            authLink.textContent = 'Sign In';
            authLink.onclick = () => this.openSignInModal();
        }
    }

    updateNavForLoggedInUser(userData) {
        const authLink = document.getElementById('authLink');
        const navMenu = authLink.parentElement.parentElement;
        
        // Replace sign in link with user dropdown menu
        authLink.parentElement.innerHTML = `
            <li class="user-menu-container">
                <div class="user-menu-trigger" onclick="toggleUserMenu()">
                    <div class="user-avatar">${userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'U'}</div>
                    <span class="user-name">${userData.firstName || 'User'}</span>
                    <span class="dropdown-arrow">▼</span>
                </div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-info-header">
                        <div class="user-avatar-large">${userData.firstName ? userData.firstName.charAt(0).toUpperCase() : 'U'}</div>
                        <div class="user-details">
                            <div class="user-full-name">${userData.firstName || ''} ${userData.lastName || ''}</div>
                            <div class="user-email">${userData.email || ''}</div>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="navigateToDashboard()" class="dropdown-item">
                        <span class="dropdown-icon">📊</span>
                        My Dashboard
                    </a>
                    <a href="#" onclick="navigateToBookings()" class="dropdown-item">
                        <span class="dropdown-icon">📅</span>
                        My Bookings
                    </a>
                    <a href="#" onclick="navigateToProfile()" class="dropdown-item">
                        <span class="dropdown-icon">👤</span>
                        My Profile
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="logout()" class="dropdown-item logout-item">
                        <span class="dropdown-icon">🚪</span>
                        Logout
                    </a>
                </div>
            </li>
        `;
    }

    setupAuthEventListeners() {
        // Sign In Form
        const signInForm = document.getElementById('signInForm');
        if (signInForm) {
            signInForm.addEventListener('submit', (e) => this.handleSignIn(e));
        }

        // Sign Up Form
        const signUpForm = document.getElementById('signUpForm');
        if (signUpForm) {
            signUpForm.addEventListener('submit', (e) => this.handleSignUp(e));
        }

        // Forgot Password Form
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }

        // Reset Password Form
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', (e) => this.handleResetPassword(e));
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('auth-modal')) {
                this.closeAuthModal();
            }
        });
    }

    openSignInModal() {
        document.getElementById('signInModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    openSignUpModal() {
        document.getElementById('signUpModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    openForgotPasswordModal() {
        document.getElementById('forgotPasswordModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        // Reset to step 1
        this.resetForgotPasswordSteps();
    }

    closeAuthModal() {
        document.getElementById('signInModal').style.display = 'none';
        document.getElementById('signUpModal').style.display = 'none';
        document.getElementById('forgotPasswordModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.clearAuthForms();
        this.resetForgotPasswordSteps();
    }

    resetForgotPasswordSteps() {
        document.getElementById('forgotPasswordStep1').style.display = 'block';
        document.getElementById('forgotPasswordStep2').style.display = 'none';
        document.getElementById('forgotPasswordStep3').style.display = 'none';
        document.getElementById('forgotPasswordForm').reset();
        document.getElementById('resetPasswordForm').reset();
    }

    clearAuthForms() {
        document.getElementById('signInForm').reset();
        document.getElementById('signUpForm').reset();
    }

    async handleSignIn(e) {
        e.preventDefault();
        
        const email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Successful login
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userLoginTime', Date.now().toString());
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            this.showMessage('Welcome back! Redirecting to your dashboard...', 'success');
            
            setTimeout(() => {
                window.location.href = 'user-dashboard.html';
            }, 1500);
        } else {
            this.showMessage('Invalid email or password. Please try again.', 'error');
        }
    }

    async handleSignUp(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('signUpFirstName').value,
            lastName: document.getElementById('signUpLastName').value,
            email: document.getElementById('signUpEmail').value,
            phone: document.getElementById('signUpPhone').value,
            password: document.getElementById('signUpPassword').value,
            confirmPassword: document.getElementById('signUpConfirmPassword').value,
            dietary: document.getElementById('signUpDietary').value,
            createdAt: new Date().toISOString(),
            experience: 'beginner'
        };

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === formData.email)) {
            this.showMessage('An account with this email already exists.', 'error');
            return;
        }

        // Add new user
        const newUser = { ...formData };
        delete newUser.confirmPassword; // Don't store confirm password
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto sign in the new user
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userLoginTime', Date.now().toString());
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        // Send admin notification about new member
        addAdminNotification({
            type: 'new_member',
            user: newUser,
            message: `New member: ${newUser.firstName} ${newUser.lastName} just signed up!`,
            timestamp: Date.now(),
            read: false
        });

        this.showMessage('Account created successfully! Redirecting to your dashboard...', 'success');
        
        setTimeout(() => {
            window.location.href = 'user-dashboard.html';
        }, 1500);
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail').value;
        
        // Find user by email
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);

        if (user) {
            // Show user info and move to step 2
            this.showUserPreview(user);
            document.getElementById('forgotPasswordStep1').style.display = 'none';
            document.getElementById('forgotPasswordStep2').style.display = 'block';
            
            // Store user for password reset
            this.resetUser = user;
        } else {
            this.showMessage('No account found with that email address. Please check and try again.', 'error');
        }
    }

    showUserPreview(user) {
        // Display user information
        const avatar = document.getElementById('previewAvatar');
        const name = document.getElementById('previewName');
        const email = document.getElementById('previewEmail');
        const date = document.getElementById('previewDate');
        const phone = document.getElementById('previewPhone');

        avatar.textContent = user.firstName ? user.firstName.charAt(0).toUpperCase() : '👤';
        name.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
        email.textContent = user.email;
        
        const createdDate = new Date(user.createdAt || Date.now());
        date.textContent = createdDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
        
        phone.textContent = user.phone || 'Not provided';
    }

    async handleResetPassword(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            this.showMessage('Passwords do not match. Please try again.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showMessage('Password must be at least 6 characters long.', 'error');
            return;
        }

        // Update user password
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === this.resetUser.email);
        
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            users[userIndex].passwordLastUpdated = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));

            // Move to success step
            document.getElementById('forgotPasswordStep2').style.display = 'none';
            document.getElementById('forgotPasswordStep3').style.display = 'block';

            // Add admin notification
            addAdminNotification({
                type: 'security',
                message: `${this.resetUser.firstName || 'User'} ${this.resetUser.lastName || ''} reset their password`,
                timestamp: Date.now(),
                read: false
            });

        } else {
            this.showMessage('An error occurred. Please try again.', 'error');
        }
    }

    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `auth-message ${type}`;
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
            max-width: 300px;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(message)) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 4000);
    }
}

// User menu functions
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
        
        // Close dropdown when clicking outside
        if (!isVisible) {
            setTimeout(() => {
                document.addEventListener('click', closeUserMenuOnOutsideClick);
            }, 100);
        }
    }
}

function closeUserMenuOnOutsideClick(e) {
    const dropdown = document.getElementById('userDropdown');
    const trigger = document.querySelector('.user-menu-trigger');
    
    if (dropdown && trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
        document.removeEventListener('click', closeUserMenuOnOutsideClick);
    }
}

function navigateToDashboard() {
    // Validate user session before navigation
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!isLoggedIn || !currentUser.email) {
        showUserMessage('❌ Session expired. Please log in again.', 'error');
        logout();
        return;
    }
    
    // Close the dropdown first
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    
    // Show navigation message
    showUserMessage('🏠 Navigating to your dashboard...', 'info');
    
    // Navigate to dashboard
    setTimeout(() => {
        window.location.href = 'user-dashboard.html';
    }, 500);
}

function navigateToBookings() {
    // Validate user session before navigation
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!isLoggedIn || !currentUser.email) {
        showUserMessage('❌ Session expired. Please log in again.', 'error');
        logout();
        return;
    }
    
    // Close the dropdown first
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    
    // Show navigation message
    showUserMessage('📅 Going to your bookings...', 'info');
    
    // Navigate to bookings section
    setTimeout(() => {
        window.location.href = 'user-dashboard.html#my-bookings';
    }, 500);
}

function navigateToProfile() {
    // Validate user session before navigation
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!isLoggedIn || !currentUser.email) {
        showUserMessage('❌ Session expired. Please log in again.', 'error');
        logout();
        return;
    }
    
    // Close the dropdown first
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    
    // Show navigation message
    showUserMessage('👤 Opening your profile...', 'info');
    
    // Navigate to profile section
    setTimeout(() => {
        window.location.href = 'user-dashboard.html#profile';
    }, 500);
}

function showUserMessage(text, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.user-nav-message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `user-nav-message ${type}`;
    message.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1002;
        font-size: 0.9rem;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
    `;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    // Auto-remove after 2 seconds
    setTimeout(() => {
        if (document.body.contains(message)) {
            message.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => message.remove(), 300);
        }
    }, 2000);
}

function logout() {
    // Get current user for logout message
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userName = currentUser.firstName || 'User';
    
    if (confirm('Are you sure you want to logout?')) {
        // Close the dropdown first
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
        
        // Clear all user session data consistently
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userLoginTime');
        localStorage.removeItem('currentUser');
        
        // Add logout notification for admin
        const logoutNotification = {
            type: 'logout',
            message: `${userName} logged out`,
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
        
        // Show logout message
        showUserMessage(`👋 Goodbye ${userName}! See you soon!`, 'success');
        
        // Redirect to main page and refresh to update nav
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Global auth functions for modal controls
function switchToSignUp() {
    document.getElementById('signInModal').style.display = 'none';
    document.getElementById('signUpModal').style.display = 'block';
}

function switchToSignIn() {
    document.getElementById('signUpModal').style.display = 'none';
    document.getElementById('signInModal').style.display = 'block';
}

function closeAuthModal() {
    if (window.authSystem) {
        window.authSystem.closeAuthModal();
    }
}

function showForgotPassword() {
    if (window.authSystem) {
        window.authSystem.closeAuthModal();
        setTimeout(() => {
            window.authSystem.openForgotPasswordModal();
        }, 100);
    }
}

function goBackToEmailStep() {
    document.getElementById('forgotPasswordStep2').style.display = 'none';
    document.getElementById('forgotPasswordStep1').style.display = 'block';
    document.getElementById('forgotEmail').focus();
}

function switchToSignInAfterReset() {
    if (window.authSystem) {
        window.authSystem.closeAuthModal();
        setTimeout(() => {
            window.authSystem.openSignInModal();
            // Pre-fill email if available
            if (window.authSystem.resetUser) {
                document.getElementById('signInEmail').value = window.authSystem.resetUser.email;
                document.getElementById('signInPassword').focus();
            }
        }, 100);
    }
}

// Helper functions for user integration
function generateTempPassword() {
    return Math.random().toString(36).slice(-8);
}

function addAdminNotification(notification) {
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    notifications.unshift(notification); // Add to beginning
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications.splice(50);
    }
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
}

// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Add active class styles for mobile menu
    const style = document.createElement('style');
    style.textContent = `
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize Auth System
    window.authSystem = new AuthSystem();
    
    // Form submission handler
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBookingSubmission();
        });
        
        // Add real-time payment summary updates
        const seatsSelect = document.getElementById('seats');
        if (seatsSelect) {
            seatsSelect.addEventListener('change', function() {
                const seats = parseInt(this.value) || 0;
                const totalAmount = seats * 85;
                updatePaymentSummary(seats, totalAmount);
            });
        }
    }
    
    // Initialize calendar
    const currentFilter = document.getElementById('categoryFilter')?.value || 'all';
    initializeCalendar(currentFilter);
    
    // Navigation link active state
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Skip the Admin link - let its onclick handler work
            if (href === '#' && this.hasAttribute('onclick')) {
                return; // Don't prevent default for Admin link
            }
            e.preventDefault();
            const targetId = href.substring(1);
            scrollToSection(targetId);
        });
    });
});

// USER-FRIENDLY Calendar with real-time updates
function initializeCalendar(categoryFilter = 'all') {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    
    // Get classes from localStorage with real-time sync
    const availableDates = getClassesFromStorage();
    const today = new Date();
    
    // Filter only future classes and sort by date
    let futureClasses = availableDates
        .filter(item => new Date(item.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Show ALL classes
    
    // Apply category filter if not 'all'
    if (categoryFilter !== 'all') {
        futureClasses = futureClasses.filter(item => {
            const className = item.class.toLowerCase();
            switch (categoryFilter) {
                case 'international':
                    return className.includes('winter soups') || className.includes('asian') || className.includes('mediterranean') || className.includes('french');
                case 'italian':
                    return className.includes('italian') || className.includes('pasta');
                case 'holiday':
                    return className.includes('thanksgiving') || className.includes('christmas') || className.includes('easter') || className.includes('new year') || className.includes('holiday');
                case 'appetizers':
                    return className.includes('appetizer') || className.includes('cheese') || className.includes('starter') || className.includes('party');
                case 'desserts':
                    return className.includes('dessert') || className.includes('chocolate') || className.includes('cake') || className.includes('fruit dessert');
                case 'bread':
                    return className.includes('bread') || className.includes('sourdough') || className.includes('artisan');
                case 'baking':
                    return className.includes('cookie') || className.includes('pastry') || className.includes('tart') || className.includes('savory baking');
                case 'seasonal':
                    return className.includes('spring') || className.includes('summer') || className.includes('fall') || className.includes('winter comfort');
                default:
                    return true;
            }
        });
    }
    
    let calendarHTML = `
        <div class="calendar-header">
            <h4 style="color: #2c5530; margin-bottom: 20px;">📅 Available Classes</h4>
            <p style="color: #666; font-size: 0.7rem; margin-bottom: 20px;">Book your seat today! Classes update in real-time.</p>
        </div>
        <div class="classes-list">
    `;
    
    if (futureClasses.length === 0) {
        calendarHTML += `
            <div class="no-classes" style="text-align: center; padding: 30px; color: #666;">
                <div style="font-size: 2rem; margin-bottom: 10px;">📝</div>
                <p>No upcoming classes scheduled.</p>
                <p style="font-size: 0.7rem;">Check back soon for new dates!</p>
            </div>
        `;
    } else {
        futureClasses.forEach((item, index) => {
            const date = new Date(item.date);
            const isToday = date.toDateString() === today.toDateString();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const seatColor = item.seats === 0 ? '#dc3545' : 
                             item.seats <= 2 ? '#fd7e14' : 
                             '#7a9a4d';
            
            const canBook = item.seats > 0;
            
            calendarHTML += `
                <div class="class-card-calendar" onclick="showClassDetails('${item.class.replace(/'/g, "\\'")}', '${item.date}', '${item.time}', '${item.description.replace(/'/g, "\\'")}', ${item.seats})">
                    ${isToday ? '<div style="position: absolute; top: -5px; right: -5px; background: #dc3545; color: white; padding: 2px 6px; border-radius: 8px; font-size: 0.6rem; font-weight: bold;">TODAY</div>' : ''}
                    
                    <div class="date-circle" style="background: ${seatColor};">
                        <div style="font-size: 0.6rem; line-height: 1;">${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                        <div style="font-size: 1rem; line-height: 1;">${date.getDate()}</div>
                    </div>
                    
                    <div class="class-info-compact">
                        <div class="class-title-compact">${item.class}</div>
                        <div class="class-date-compact">${dayName}, ${monthDay} ${item.time ? `at ${item.time}` : ''}</div>
                        ${item.description ? `<div class="class-description-compact" style="font-size: 0.65rem; color: #666; margin-top: 4px; line-height: 1.2;">${item.description.substring(0, 80)}${item.description.length > 80 ? '...' : ''}</div>` : ''}
                        <div class="class-availability-compact">
                            ${item.seats === 0 ? '🚫 FULL' : 
                              item.seats === 1 ? '⚠️ 1 SEAT LEFT' : 
                              item.seats <= 2 ? `⚠️ ${item.seats} SEATS LEFT` : 
                              `✅ ${item.seats} AVAILABLE`}
                        </div>
                        <div style="font-size: 0.6rem; color: #7a9a4d; margin-top: 8px; font-weight: 600;">Click for details →</div>
                    </div>
                </div>
            `;
        });
    }
    
    calendarHTML += `
        </div>
        <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8faf8; border-radius: 8px;">
            <p style="font-size: 0.7rem; color: #666; margin: 0;">💡 Classes are updated in real-time. Book quickly as seats fill up fast!</p>
        </div>
    `;
    
    calendar.innerHTML = calendarHTML;
    console.log('📅 Calendar updated with', futureClasses.length, 'available classes');
}

// Filter calendar by category
function filterCalendarByCategory() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    const selectedCategory = categoryFilter.value;
    console.log('🔍 Filtering calendar by category:', selectedCategory);
    
    // Reinitialize calendar with the selected filter
    initializeCalendar(selectedCategory);
}

// Show class details popup
function showClassDetails(className, date, time, description, seatsAvailable) {
    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Get price for class
    const classPricing = {
        'Classic Italian American I': '$125',
        'Classic Italian American II': '$135',
        'Classic Italian American III': '$145',
        'Pasta Sauces': '$95',
        'Fresh Scratch Pasta': '$115',
        'Thanksgiving Sides': '$105',
        'Holiday Appetizers': '$125',
        'Holiday Chocolate Desserts': '$85',
        'Easy Breads': '$95',
        'International Winter Soups': '$85'
    };
    
    const price = classPricing[className] || 'Contact for pricing';
    
    // Create and show popup
    const popup = document.createElement('div');
    popup.id = 'classDetailsPopup';
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    popup.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            position: relative;
        ">
            <button onclick="closeClassDetails()" style="
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
                padding: 5px;
            ">&times;</button>
            
            <div style="margin-bottom: 20px;">
                <h2 style="color: #2c5530; margin-bottom: 10px; font-size: 1.5rem;">${className}</h2>
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <span style="background: #7a9a4d; color: white; padding: 4px 12px; border-radius: 15px; font-size: 0.9rem; font-weight: 600;">${price}</span>
                    <span style="color: #666; font-size: 0.9rem;">📅 ${formattedDate}</span>
                    <span style="color: #666; font-size: 0.9rem;">⏰ ${time}</span>
                </div>
                <div style="color: ${seatsAvailable === 0 ? '#dc3545' : seatsAvailable <= 2 ? '#fd7e14' : '#7a9a4d'}; font-weight: 600; font-size: 0.9rem; margin-bottom: 20px;">
                    ${seatsAvailable === 0 ? '🚫 FULLY BOOKED' : 
                      seatsAvailable === 1 ? '⚠️ ONLY 1 SEAT LEFT!' : 
                      seatsAvailable <= 2 ? `⚠️ ONLY ${seatsAvailable} SEATS LEFT!` : 
                      `✅ ${seatsAvailable} SEATS AVAILABLE`}
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h3 style="color: #2c5530; margin-bottom: 12px; font-size: 1.1rem;">What You'll Learn & Create:</h3>
                <div style="background: #f8faf8; padding: 15px; border-radius: 8px; border-left: 4px solid #7a9a4d;">
                    <p style="margin: 0; line-height: 1.6; color: #333; font-size: 0.9rem;">${description.replace(/•/g, '<br/>•')}</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                ${seatsAvailable > 0 ? 
                    `<button id="bookClassBtn" data-class="${className}" data-date="${date}" style="
                        background: #7a9a4d;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        margin-right: 10px;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#5a7a3d'" onmouseout="this.style.background='#7a9a4d'">
                        📅 Book This Class
                    </button>` : 
                    `<div style="
                        background: #f8d7da;
                        color: #721c24;
                        padding: 12px 20px;
                        border-radius: 8px;
                        display: inline-block;
                        margin-right: 10px;
                    ">
                        🚫 This class is fully booked
                    </div>`
                }
                                    <button onclick="closeClassDetails()" style="
                        background: #e9ecef;
                        color: #333;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#d4dae1'" onmouseout="this.style.background='#e9ecef'">
                        Close
                    </button>

            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';
    
    // Add event listener to the book button
    setTimeout(() => {
        const bookButton = popup.querySelector('#bookClassBtn');
        if (bookButton) {
            bookButton.onclick = function() {
                const classData = this.getAttribute('data-class');
                const dateData = this.getAttribute('data-date');
                
                // Check if user is signed in
                const isLoggedIn = localStorage.getItem('userLoggedIn');
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                
                if (isLoggedIn && currentUser.email) {
                    // User is signed in - show payment options
                    showPaymentOptions(classData, dateData, currentUser);
                } else {
                    // User is not signed in - show sign-in prompt
                    showSignInPrompt(classData, dateData);
                }
            };
        }
    }, 100);
    
    // Add fadeIn animation
    if (!document.getElementById('popupStyles')) {
        const style = document.createElement('style');
        style.id = 'popupStyles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Close class details popup
function closeClassDetails() {
    const popup = document.getElementById('classDetailsPopup');
    if (popup) {
        popup.remove();
        document.body.style.overflow = 'auto';
    }
}

// Show sign-in prompt for non-logged in users
function showSignInPrompt(className, date) {
    closeClassDetails();
    
    const signInModal = document.createElement('div');
    signInModal.id = 'signInPromptModal';
    signInModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    signInModal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            position: relative;
        ">
            <button onclick="closeSignInPrompt()" style="
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
                padding: 5px;
            ">&times;</button>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c5530; margin-bottom: 10px; font-size: 1.5rem;">Sign In to Book</h2>
                <p style="color: #666; margin-bottom: 5px;"><strong>${className}</strong></p>
                <p style="color: #666; margin-bottom: 20px;">${formattedDate}</p>
                <p style="color: #2c5530; font-weight: 600; font-size: 1.1rem;">Class Price: $85</p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <p style="color: #666; margin-bottom: 20px;">
                    Please sign in to your account to book this class. This allows us to:
                </p>
                <ul style="text-align: left; color: #666; margin-bottom: 20px; padding-left: 20px;">
                    <li>Track your bookings in your dashboard</li>
                    <li>Send you class reminders</li>
                    <li>Manage your account easily</li>
                    <li>Provide better customer service</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button onclick="window.authSystem.openSignInModal(); closeSignInPrompt();" style="
                    background: #7a9a4d;
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#2c5530'" onmouseout="this.style.background='#7a9a4d'">
                    🔐 Sign In
                </button>
                
                <button onclick="window.authSystem.openSignUpModal(); closeSignInPrompt();" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#545b62'" onmouseout="this.style.background='#6c757d'">
                    📝 Create Account
                </button>
            </div>
            
            <div style="margin-top: 20px;">
                <p style="color: #666; font-size: 0.9rem;">
                    Don't worry - creating an account is quick and free!
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(signInModal);
    document.body.style.overflow = 'hidden';
}

// Close sign-in prompt modal
function closeSignInPrompt() {
    const modal = document.getElementById('signInPromptModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Show payment options modal
function showPaymentOptions(className, date, currentUser) {
    closeClassDetails();
    
    // Create payment options modal
    const paymentModal = document.createElement('div');
    paymentModal.id = 'paymentOptionsModal';
    paymentModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    paymentModal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            position: relative;
        ">
            <button onclick="closePaymentOptions()" style="
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
                padding: 5px;
            ">&times;</button>
            
            <div style="margin-bottom: 25px;">
                <h2 style="color: #2c5530; margin-bottom: 10px; font-size: 1.5rem;">Complete Your Booking</h2>
                <p style="color: #666; margin-bottom: 5px;"><strong>${className}</strong></p>
                <p style="color: #666; margin-bottom: 20px;">${formattedDate}</p>
                <p style="color: #2c5530; font-weight: 600; font-size: 1.1rem;">Class Price: $85</p>
                <p style="color: #666; font-size: 0.9rem; margin-top: 10px;">
                    Booking for: <strong>${currentUser.firstName} ${currentUser.lastName}</strong> (${currentUser.email})
                </p>
            </div>
            
            <div style="margin-bottom: 25px;">
                <p style="color: #666; margin-bottom: 20px;">Please complete your payment using one of the options below:</p>
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="https://www.paypal.me/BrianAverna" target="_blank" onclick="trackPaymentAttempt('paypal', '${className}', '${date}', '${currentUser.email}')" style="
                        background: #0070ba;
                        color: white;
                        text-decoration: none;
                        padding: 15px 25px;
                        border-radius: 8px;
                        font-weight: 600;
                        display: inline-block;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#005ea6'" onmouseout="this.style.background='#0070ba'">
                        💳 PayPal
                    </a>
                    
                    <a href="https://venmo.com/u/Brian-Averna" target="_blank" onclick="trackPaymentAttempt('venmo', '${className}', '${date}', '${currentUser.email}')" style="
                        background: #008cff;
                        color: white;
                        text-decoration: none;
                        padding: 15px 25px;
                        border-radius: 8px;
                        font-weight: 600;
                        display: inline-block;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#0077cc'" onmouseout="this.style.background='#008cff'">
                        📱 Venmo
                    </a>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #666; font-size: 0.9rem;">
                    <strong>Important:</strong> After payment, please email brianwaverna@gmail.com with your name, 
                    the class name, and date to confirm your booking. Your booking will be tracked in your dashboard.
                </p>
            </div>
            
            <button onclick="closePaymentOptions()" style="
                background: #e9ecef;
                color: #333;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='#d4dae1'" onmouseout="this.style.background='#e9ecef'">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(paymentModal);
    document.body.style.overflow = 'hidden';
}

// Close payment options modal
function closePaymentOptions() {
    const modal = document.getElementById('paymentOptionsModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Book this specific class (keeping for backward compatibility)
function bookThisClass(className, date) {
    closeClassDetails();
    
    // Auto-fill the booking form
    const classSelect = document.getElementById('className');
    const dateInput = document.getElementById('classDate');
    
    if (classSelect && dateInput) {
        // Map class names to form values
        const classMap = {
            'Classic Italian American I': 'classic-italian-1',
            'Classic Italian American II': 'classic-italian-2',
            'Classic Italian American III': 'classic-italian-3',
            'Pasta Sauces': 'pasta-sauces',
            'Fresh Scratch Pasta': 'fresh-pasta',
            'Thanksgiving Sides': 'thanksgiving',
            'Holiday Appetizers': 'holiday-appetizers',
            'Holiday Chocolate Desserts': 'holiday-desserts',
            'Easy Breads': 'easy-breads',
            'International Winter Soups': 'winter-soups'
        };
        
        const classValue = classMap[className];
        if (classValue) {
            classSelect.value = classValue;
            dateInput.value = date;
            
            // Scroll to booking form smoothly
            document.querySelector('.booking-form').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Highlight the form
            const form = document.querySelector('.booking-form');
            form.style.boxShadow = '0 0 20px rgba(122, 154, 77, 0.5)';
            form.style.transform = 'scale(1.02)';
            
            setTimeout(() => {
                form.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                form.style.transform = 'scale(1)';
            }, 2000);
            
            // Set default seat selection
            const seatsSelect = document.getElementById('seats');
            if (seatsSelect) {
                seatsSelect.value = '1';
                // Trigger the change event to update payment summary
                const event = new Event('change');
                seatsSelect.dispatchEvent(event);
            }
            
            // Show helpful message
            const message = document.createElement('div');
            message.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #7a9a4d; color: white; padding: 10px 15px; border-radius: 5px; z-index: 1001; font-size: 0.9rem; max-width: 300px;';
            message.innerHTML = `✅ <strong>${className}</strong> selected!<br/>Please fill in your details and click "Reserve My Seat" to continue.`;
            document.body.appendChild(message);
            
            setTimeout(() => message.remove(), 5000);
            
            // Focus on the first required field to guide the user
            setTimeout(() => {
                const nameInput = document.getElementById('name');
                if (nameInput) {
                    nameInput.focus();
                    nameInput.style.borderColor = '#7a9a4d';
                    nameInput.style.boxShadow = '0 0 5px rgba(122, 154, 77, 0.3)';
                    
                    setTimeout(() => {
                        nameInput.style.borderColor = '';
                        nameInput.style.boxShadow = '';
                    }, 3000);
                }
            }, 500);
        }
    }
}

// Quick booking function
function quickBook(className, date) {
    // Auto-fill the booking form
    const classSelect = document.getElementById('className');
    const dateInput = document.getElementById('classDate');
    
    if (classSelect && dateInput) {
        // Map class names to form values
        const classMap = {
            'Artisan Bread Making': 'bread',
            'Farm-to-Table Cooking': 'farm-to-table', 
            'Classic Desserts': 'desserts'
        };
        
        const classValue = Object.keys(classMap).find(key => className.includes(key.split(' ')[0]));
        if (classValue) {
            classSelect.value = classMap[classValue];
            dateInput.value = date;
            
            // Scroll to booking form smoothly
            document.querySelector('.booking-form').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Highlight the form
            const form = document.querySelector('.booking-form');
            form.style.boxShadow = '0 0 20px rgba(122, 154, 77, 0.5)';
            form.style.transform = 'scale(1.02)';
            
            setTimeout(() => {
                form.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                form.style.transform = 'scale(1)';
            }, 2000);
            
            // Show helpful message
            const message = document.createElement('div');
            message.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #7a9a4d; color: white; padding: 10px 15px; border-radius: 5px; z-index: 1001; font-size: 0.7rem;';
            message.textContent = `✅ ${className} selected! Complete your booking below.`;
            document.body.appendChild(message);
            
            setTimeout(() => message.remove(), 3000);
        }
    }
}

// REAL-TIME localStorage functions for calendar management
function getClassesFromStorage() {
    // Always get fresh data from localStorage
    const stored = localStorage.getItem('cottageClasses');
    if (stored) {
        const classes = JSON.parse(stored);
        console.log('📊 Loaded', classes.length, 'classes from storage');
        return classes;
    }
    
    // 2025 Culinary Class Schedule - EXACT from client specification
    const defaultClasses = [
        // Classic Italian American I - 9/20/25 6:00-9:00, 11/1/25 6:00-9:00
        { date: '2025-09-20', class: 'Classic Italian American I', seats: 8, id: 1, time: '6:00-9:00 PM', description: 'Sicilian Orange Salad • Three Cheese Garlic Bread • Tuscan White Bean Spread • Spaghetti with Fresh Pomodoro Sauce • Zabaglione' },
        { date: '2025-11-01', class: 'Classic Italian American I', seats: 8, id: 2, time: '6:00-9:00 PM', description: 'Sicilian Orange Salad • Three Cheese Garlic Bread • Tuscan White Bean Spread • Spaghetti with Fresh Pomodoro Sauce • Zabaglione' },
        
        // Classic Italian American II - 10/4/25 6:00-9:00, 11/8/25 6:00-9:00
        { date: '2025-10-04', class: 'Classic Italian American II', seats: 8, id: 3, time: '6:00-9:00 PM', description: 'Sausage Stuffed Mushrooms • Panzanella Salad • Homemade Pappardelle Alla Vodka • Chocolate Amaretto Soufflé' },
        { date: '2025-11-08', class: 'Classic Italian American II', seats: 8, id: 4, time: '6:00-9:00 PM', description: 'Sausage Stuffed Mushrooms • Panzanella Salad • Homemade Pappardelle Alla Vodka • Chocolate Amaretto Soufflé' },
        
        // Classic Italian American III - 10/10/25 7:00-10:00, 11/15 6:00-9:00
        { date: '2025-10-10', class: 'Classic Italian American III', seats: 8, id: 5, time: '7:00-10:00 PM', description: 'Pasta Fagioli Soup • Chicken Francese • Mushroom Risotto • Fried Sicilian Zeppole' },
        { date: '2025-11-15', class: 'Classic Italian American III', seats: 8, id: 6, time: '6:00-9:00 PM', description: 'Pasta Fagioli Soup • Chicken Francese • Mushroom Risotto • Fried Sicilian Zeppole' },
        
        // Pasta Sauces - 10/18/25 6:00-9:00, 11/7/25 6:00-9:00
        { date: '2025-10-18', class: 'Pasta Sauces', seats: 8, id: 7, time: '6:00-9:00 PM', description: 'Marinara • Amatriciana • Broccoli Aglio Olio • Lemon Alfredo • Tiramisu' },
        { date: '2025-11-07', class: 'Pasta Sauces', seats: 8, id: 8, time: '6:00-9:00 PM', description: 'Marinara • Amatriciana • Broccoli Aglio Olio • Lemon Alfredo • Tiramisu' },
        
        // Fresh Scratch Pasta - 9/26/25 6:00-9:00, 11/22/25 6:00-9:00
        { date: '2025-09-26', class: 'Fresh Scratch Pasta', seats: 8, id: 9, time: '6:00-9:00 PM', description: 'Gnocchi • Fettucine • Pappardelle • Tortellini • Fresh Pomodoro Sauce • Cannoli' },
        { date: '2025-11-22', class: 'Fresh Scratch Pasta', seats: 8, id: 10, time: '6:00-9:00 PM', description: 'Gnocchi • Fettucine • Pappardelle • Tortellini • Fresh Pomodoro Sauce • Cannoli' },
        
        // Thanksgiving Sides - 11/14/25 7:00-10:00, 11/21 7:00-9:00
        { date: '2025-11-14', class: 'Thanksgiving Sides', seats: 8, id: 11, time: '7:00-10:00 PM', description: 'Mascarpone Chive Mashed Potatoes • Bacon Balsamic Brussel Sprouts • Parker House Rolls • Butternut Squash Pecan Tarts • Amaretto Seared Mushrooms' },
        { date: '2025-11-21', class: 'Thanksgiving Sides', seats: 8, id: 12, time: '7:00-9:00 PM', description: 'Mascarpone Chive Mashed Potatoes • Bacon Balsamic Brussel Sprouts • Parker House Rolls • Butternut Squash Pecan Tarts • Amaretto Seared Mushrooms' },
        
        // Holiday Appetizers - 12/5/25 7:00-10:00, 12/13/25 7:00-10:00
        { date: '2025-12-05', class: 'Holiday Appetizers', seats: 8, id: 13, time: '7:00-10:00 PM', description: 'Miniature Beef Wellingtons • Sausage Mascarpone Stuffed Mushrooms • Fresh Hummus and Parmesan Pita Chips • Miniature Arancini Rice Balls • Sausage Spinach Pie' },
        { date: '2025-12-13', class: 'Holiday Appetizers', seats: 8, id: 14, time: '7:00-10:00 PM', description: 'Miniature Beef Wellingtons • Sausage Mascarpone Stuffed Mushrooms • Fresh Hummus and Parmesan Pita Chips • Miniature Arancini Rice Balls • Sausage Spinach Pie' },
        
        // Holiday Chocolate Desserts - 11/28/25 6:00-9:00, 12/6/25 6:00-9:00
        { date: '2025-11-28', class: 'Holiday Chocolate Desserts', seats: 8, id: 15, time: '6:00-9:00 PM', description: 'Chocolate Cranberry Paté • Chocolate Truffles • Christmas Blondies • Chocolate Chip Cookie Stuffed Fudge Brownies' },
        { date: '2025-12-06', class: 'Holiday Chocolate Desserts', seats: 8, id: 16, time: '6:00-9:00 PM', description: 'Chocolate Cranberry Paté • Chocolate Truffles • Christmas Blondies • Chocolate Chip Cookie Stuffed Fudge Brownies' },
        
        // Easy Breads - 9/27/25 1:00-4:00, 10/25/25 1:00-4:00, 12/12/25 7:00-10:00
        { date: '2025-09-27', class: 'Easy Breads', seats: 8, id: 17, time: '1:00-4:00 PM', description: 'Focaccia • Rustic French Boule • Ciabatta • Brazilian Cheese Rolls • Homemade Butter' },
        { date: '2025-10-25', class: 'Easy Breads', seats: 8, id: 18, time: '1:00-4:00 PM', description: 'Focaccia • Rustic French Boule • Ciabatta • Brazilian Cheese Rolls • Homemade Butter' },
        { date: '2025-12-12', class: 'Easy Breads', seats: 8, id: 19, time: '7:00-10:00 PM', description: 'Focaccia • Rustic French Boule • Ciabatta • Brazilian Cheese Rolls • Homemade Butter' },
        
        // International Winter Soups - 10/24/25 7:00-10:00, 12/20/25 6:00-9:00
        { date: '2025-10-24', class: 'International Winter Soups', seats: 8, id: 20, time: '7:00-10:00 PM', description: 'Chicken Matzoh Ball • Pasta Fagioli • Sopa De Pollo (Mexican Chicken Soup) • Hungarian Goulyas Soup • Beef Barley' },
        { date: '2025-12-20', class: 'International Winter Soups', seats: 8, id: 21, time: '6:00-9:00 PM', description: 'Chicken Matzoh Ball • Pasta Fagioli • Sopa De Pollo (Mexican Chicken Soup) • Hungarian Goulyas Soup • Beef Barley' }
    ];
    
    // Save defaults to localStorage
    saveClassesToStorage(defaultClasses);
    return defaultClasses;
}

function saveClassesToStorage(classes) {
    localStorage.setItem('cottageClasses', JSON.stringify(classes));
    // Trigger calendar refresh if on main page
    if (document.getElementById('calendar')) {
        const currentFilter = document.getElementById('categoryFilter')?.value || 'all';
        initializeCalendar(currentFilter);
    }
}

// ENHANCED: Listen for storage changes from admin panel
window.addEventListener('storage', function(e) {
    if (e.key === 'cottageClasses' || e.key === 'cottageClassesAdmin') {
        console.log('📺 Admin updated classes - refreshing customer view...');
        const currentFilter = document.getElementById('categoryFilter')?.value || 'all';
        initializeCalendar(currentFilter);
        
        // Show update notification to user
        showUpdateNotification();
    }
});

// Show notification when classes are updated
function showUpdateNotification() {
    // Remove existing notification
    const existing = document.getElementById('updateNotification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #7a9a4d;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        font-size: 0.7rem;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = '✨ Classes updated! Fresh availability shown below.';
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// REAL-TIME: Function to trigger calendar updates across tabs
function triggerCalendarUpdate() {
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('classesUpdated'));
    // Trigger storage event for cross-tab updates
    localStorage.setItem('lastUpdate', Date.now().toString());
    
    // Force immediate refresh of calendar
    setTimeout(() => {
        if (document.getElementById('calendar')) {
            console.log('🔄 Triggering real-time calendar update...');
            const currentFilter = document.getElementById('categoryFilter')?.value || 'all';
        initializeCalendar(currentFilter);
        }
    }, 50);
    
    // Also trigger a storage event manually for same-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'cottageClasses',
        newValue: localStorage.getItem('cottageClasses')
    }));
}

// Listen for calendar updates
window.addEventListener('classesUpdated', function() {
    if (document.getElementById('calendar')) {
        console.log('🔄 Classes updated event received - refreshing...');
        const currentFilter = document.getElementById('categoryFilter')?.value || 'all';
        initializeCalendar(currentFilter);
    }
});

// Force refresh calendar with new 2025 schedule
function refreshCalendarWithNewSchedule() {
    // Clear ALL existing calendar data to force reload
    localStorage.removeItem('cottageClasses');
    localStorage.removeItem('cottageClassesAdmin');
    localStorage.removeItem('lastUpdate');
    
    // Force reload of new schedule - this will load all 21 classes
    const newClasses = getClassesFromStorage();
    console.log('🔄 Calendar refreshed with complete 2025 schedule:', newClasses.length, 'classes');
    console.log('📋 Class types:', newClasses.map(c => c.class).filter((v, i, a) => a.indexOf(v) === i));
    
    // Trigger immediate update
    const currentFilter = document.getElementById('categoryFilter')?.value || 'all';
    initializeCalendar(currentFilter);
    
    // Show update notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #7a9a4d;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1001;
        font-size: 0.9rem;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    notification.innerHTML = `🗓️ Calendar Updated! All ${newClasses.length} classes loaded. Click any class for details!`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 4000);
}

// Auto-refresh calendar every 30 seconds to stay in sync
setInterval(() => {
    if (document.getElementById('calendar')) {
        const lastUpdate = localStorage.getItem('lastUpdate');
        if (lastUpdate) {
            const timeSince = Date.now() - parseInt(lastUpdate);
            if (timeSince < 30000) { // If updated within last 30 seconds
                console.log('🔄 Auto-refreshing calendar for recent updates...');
                const currentFilter = document.getElementById('categoryFilter')?.value || 'all';
        initializeCalendar(currentFilter);
            }
        }
    }
}, 30000);

// Initialize calendar with new schedule on page load
document.addEventListener('DOMContentLoaded', function() {
    // Force refresh with new schedule
    setTimeout(() => {
        refreshCalendarWithNewSchedule();
    }, 500);
});

// Handle booking form submission
function handleBookingSubmission() {
    const formData = {
        className: document.getElementById('className').value,
        classDate: document.getElementById('classDate').value,
        seats: document.getElementById('seats').value,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dietary: document.getElementById('dietary').value
    };
    
    // Basic validation
    if (!formData.className || !formData.classDate || !formData.seats || 
        !formData.name || !formData.email || !formData.phone) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Calculate total amount
    const totalAmount = parseInt(formData.seats) * 85;
    
    // Store booking data for PayPal processing
    const bookingData = {
        bookingId: Date.now(),
        ...formData,
        totalAmount: totalAmount
    };
    
    // Store in session storage for PayPal integration
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    
    // Update payment summary
    updatePaymentSummary(formData.seats, totalAmount);
    
    // Show PayPal button if not already shown
    if (window.paypalIntegration) {
        window.paypalIntegration.setupPayPalButtons();
    }
    
    // Prevent form submission - let PayPal handle the payment
    return false;
}

// Function to update payment summary
function updatePaymentSummary(seats, totalAmount) {
    const seatsElement = document.getElementById('paymentSeats');
    const totalElement = document.getElementById('paymentTotal');
    
    if (seatsElement) {
        seatsElement.textContent = seats;
    }
    
    if (totalElement) {
        totalElement.textContent = '$' + totalAmount.toFixed(2);
    }
}

// Function to handle successful payment completion
function handlePaymentSuccess(paymentData) {
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    if (!pendingBooking) return;
    
    const bookingData = JSON.parse(pendingBooking);
    
    // REAL UPDATE: Update seat count in localStorage AND admin system
    const classes = getClassesFromStorage();
    const adminClasses = JSON.parse(localStorage.getItem('cottageClassesAdmin') || '[]');
    
    // Find matching class in customer storage
    const classToUpdate = classes.find(cls => {
        const clsDate = new Date(cls.date).toISOString().split('T')[0];
        const formDate = new Date(bookingData.classDate).toISOString().split('T')[0];
        return clsDate === formDate && cls.class.toLowerCase().includes(getClassNameFromValue(bookingData.className));
    });
    
    // Find matching class in admin storage
    const adminClassToUpdate = adminClasses.find(cls => {
        const clsDate = new Date(cls.date).toISOString().split('T')[0];
        const formDate = new Date(bookingData.classDate).toISOString().split('T')[0];
        return clsDate === formDate && cls.name.toLowerCase().includes(getClassNameFromValue(bookingData.className));
    });
    
    if (classToUpdate && classToUpdate.seats >= parseInt(bookingData.seats)) {
        // Update customer storage
        classToUpdate.seats -= parseInt(bookingData.seats);
        
        // Update admin storage - increase booked seats
        if (adminClassToUpdate) {
            adminClassToUpdate.bookedSeats += parseInt(bookingData.seats);
            localStorage.setItem('cottageClassesAdmin', JSON.stringify(adminClasses));
        }
        
        // Save booking record with payment info
        const bookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
        const newBooking = {
            id: bookingData.bookingId,
            date: bookingData.classDate,
            customerName: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
            className: bookingData.className,
            seats: parseInt(bookingData.seats),
            dietary: bookingData.dietary,
            status: 'paid',
            bookingTime: new Date().toISOString(),
            payment: {
                paypalOrderId: paymentData.id,
                paymentStatus: 'completed',
                paymentAmount: paymentData.purchase_units[0].amount.value,
                paymentDate: new Date().toISOString(),
                payerId: paymentData.payer.payer_id,
                payerEmail: paymentData.payer.email_address
            }
        };
        bookings.push(newBooking);
        localStorage.setItem('cottageBookings', JSON.stringify(bookings));
        
        saveClassesToStorage(classes);
        triggerCalendarUpdate();
        
        // Enhanced booking confirmation with user integration
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Add admin notification for real-time updates
        addAdminNotification({
            type: 'payment',
            booking: newBooking,
            message: `Payment received from ${bookingData.name} for ${getFullClassName(bookingData.className)}`,
            timestamp: Date.now(),
            read: false
        });

        // Create user account if not logged in and doesn't exist
        if (!isLoggedIn && bookingData.email) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (!users.find(u => u.email === bookingData.email)) {
                const tempPassword = generateTempPassword();
                const newUser = {
                    firstName: formData.name.split(' ')[0],
                    lastName: formData.name.split(' ').slice(1).join(' ') || '',
                    email: formData.email,
                    phone: formData.phone,
                    dietary: formData.dietary,
                    password: tempPassword,
                    createdAt: new Date().toISOString(),
                    experience: 'beginner',
                    accountType: 'auto-created'
                };
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
                const successMessage = `✅ BOOKING CONFIRMED!\n\nThank you, ${formData.name}!\n${formData.seats} seat(s) booked for ${getFullClassName(formData.className)}\nDate: ${new Date(formData.classDate).toLocaleDateString()}\n\nWe've also created an account for you!\nEmail: ${formData.email}\nTemp Password: ${tempPassword}\n\n⚡ Calendar updated in real-time!`;
                alert(successMessage);
            } else {
                const successMessage = `✅ BOOKING CONFIRMED!\n\nThank you, ${formData.name}!\n${formData.seats} seat(s) booked for ${getFullClassName(formData.className)}\nDate: ${new Date(formData.classDate).toLocaleDateString()}\n\nConfirmation sent to: ${formData.email}\n\n⚡ Calendar updated in real-time!`;
                alert(successMessage);
            }
        } else {
            const successMessage = `✅ BOOKING CONFIRMED!\n\nThank you, ${formData.name}!\n${formData.seats} seat(s) booked for ${getFullClassName(formData.className)}\nDate: ${new Date(formData.classDate).toLocaleDateString()}\n\nView in your dashboard!\n\n⚡ Calendar updated in real-time!`;
            alert(successMessage);
            
            // Offer to go to dashboard
            setTimeout(() => {
                if (confirm('Would you like to view your booking in your dashboard?')) {
                    window.location.href = 'user-dashboard.html';
                }
            }, 1000);
        }
        
        // Reset form
        document.getElementById('bookingForm').reset();
        
        // Scroll back to calendar to show updated availability
        setTimeout(() => {
            document.getElementById('calendar').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 1000);
    } else {
        alert('❌ Sorry, not enough seats available for this class. Please try a different date or fewer seats.\n\n🔄 Check the calendar below for updated availability!');
        // Refresh calendar to show current availability
        const currentFilter = document.getElementById('categoryFilter')?.value || 'all';
        initializeCalendar(currentFilter);
    }
    
    // In a real application, this would also send data to a backend server
    console.log('Booking submission:', formData);
    
    // In a real app, you would:
    // 1. Send data to your backend API
    // 2. Process payment if required
    // 3. Send confirmation email
    // 4. Update calendar availability
    // 5. Add to booking management system
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Admin functions for updating classes (for future implementation)
const AdminPanel = {
    // These functions would be implemented when you add admin functionality
    addClass: function(classData) {
        // Add new class to calendar
        console.log('Adding class:', classData);
    },
    
    updateClass: function(classId, newData) {
        // Update existing class
        console.log('Updating class:', classId, newData);
    },
    
    removeClass: function(classId) {
        // Remove class from calendar
        console.log('Removing class:', classId);
    },
    
    updateMonthlySchedule: function(monthData) {
        // Update entire month's schedule
        console.log('Updating monthly schedule:', monthData);
    }
};

// Export admin functions for future use
// Helper functions
function getClassNameFromValue(value) {
    const mapping = {
        'classic-italian-1': 'classic italian american',
        'classic-italian-2': 'classic italian american',
        'classic-italian-3': 'classic italian american',
        'pasta-sauces': 'pasta sauces',
        'fresh-pasta': 'fresh scratch pasta',
        'thanksgiving': 'thanksgiving sides',
        'holiday-appetizers': 'holiday appetizers',
        'holiday-desserts': 'holiday chocolate desserts',
        'easy-breads': 'easy breads',
        'winter-soups': 'international winter soups',
        // Legacy mappings for backward compatibility
        'bread': 'bread making',
        'farm-to-table': 'farm-to-table',
        'desserts': 'desserts'
    };
    return mapping[value] || value;
}

function getFullClassName(value) {
    const mapping = {
        'classic-italian-1': 'Classic Italian American I',
        'classic-italian-2': 'Classic Italian American II',
        'classic-italian-3': 'Classic Italian American III',
        'pasta-sauces': 'Pasta Sauces',
        'fresh-pasta': 'Fresh Scratch Pasta',
        'thanksgiving': 'Thanksgiving Sides',
        'holiday-appetizers': 'Holiday Appetizers',
        'holiday-desserts': 'Holiday Chocolate Desserts',
        'easy-breads': 'Easy Breads',
        'winter-soups': 'International Winter Soups',
        // Legacy mappings for backward compatibility
        'bread': 'Artisan Bread Making',
        'farm-to-table': 'Farm-to-Table Cooking',
        'desserts': 'Classic Desserts'
    };
    return mapping[value] || value;
}

// =====================================================================
// INTEGRATED ADMIN FUNCTIONALITY
// =====================================================================

// Admin state variables
let adminCurrentMonth = new Date();
let adminClasses = [];

// Admin Section Navigation
function showAdminSection(sectionName) {
    // Hide all admin sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.admin-nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`admin-${sectionName}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Add active class to clicked button
    const targetButton = document.getElementById(`${sectionName.replace('-', '')}Btn`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Update content based on section
    if (sectionName === 'dashboard') {
        updateAdminDashboardStats();
    } else if (sectionName === 'manage-classes') {
        initializeAdminSchedule();
    } else if (sectionName === 'bookings') {
        updateAdminBookingsTable();
    }
}

// Admin functions are now handled by admin.js
// Removed duplicate functions to prevent conflicts

// Handle adding new class
function handleAdminAddClass(e) {
    e.preventDefault();
    
    const formData = {
        type: document.getElementById('classType').value,
        date: document.getElementById('classDate').value,
        time: document.getElementById('classTime').value,
        maxSeats: parseInt(document.getElementById('maxSeats').value),
        price: parseFloat(document.getElementById('price').value),
        notes: document.getElementById('notes').value
    };
    
    // Validation
    if (!formData.type || !formData.date || !formData.time || !formData.maxSeats || !formData.price) {
        showAdminMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    // Check if date is in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showAdminMessage('Please select a future date.', 'error');
        return;
    }
    
    // Get class name mapping
    const classNames = {
        'bread': 'Artisan Bread Making',
        'farm-to-table': 'Farm-to-Table Cooking',
        'desserts': 'Classic Desserts'
    };
    
    // Create new class
    const newClass = {
        id: Date.now(),
        type: formData.type,
        name: classNames[formData.type],
        date: formData.date,
        time: formData.time,
        maxSeats: formData.maxSeats,
        bookedSeats: 0,
        price: formData.price,
        notes: formData.notes
    };
    
    adminClasses.push(newClass);
    saveAdminClassesToStorage(adminClasses);
    
    // Update displays
    initializeAdminSchedule();
    updateAdminDashboardStats();
    
    showAdminMessage(`${newClass.name} class added for ${formatAdminDate(formData.date)}!`, 'success');
    
    // Reset form
    document.getElementById('addClassForm').reset();
}

// Admin dashboard stats
function updateAdminDashboardStats() {
    const now = new Date();
    const currentMonthStr = now.toISOString().substring(0, 7);
    
    const currentMonthClasses = adminClasses.filter(cls => 
        cls.date.startsWith(currentMonthStr)
    );
    
    const bookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
    const currentMonthBookings = bookings.filter(booking => 
        booking.date.startsWith(currentMonthStr)
    );
    
    const totalBookings = currentMonthClasses.reduce((sum, cls) => sum + cls.bookedSeats, 0);
    const totalSeats = currentMonthClasses.reduce((sum, cls) => sum + cls.maxSeats, 0);
    const availableSeats = totalSeats - totalBookings;
    const revenue = currentMonthClasses.reduce((sum, cls) => sum + (cls.bookedSeats * cls.price), 0);
    
    // Update stats
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('upcomingClasses').textContent = currentMonthClasses.length;
    document.getElementById('availableSeats').textContent = availableSeats;
    document.getElementById('monthlyRevenue').textContent = `$${revenue.toLocaleString()}`;
    
    // Update bookings table
    updateAdminBookingsTable(currentMonthBookings);
}

// Admin schedule
function initializeAdminSchedule() {
    const scheduleGrid = document.getElementById('adminScheduleGrid');
    const currentMonthSpan = document.getElementById('currentAdminMonth');
    
    if (!scheduleGrid || !currentMonthSpan) return;
    
    currentMonthSpan.textContent = adminCurrentMonth.toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    const firstDay = new Date(adminCurrentMonth.getFullYear(), adminCurrentMonth.getMonth(), 1);
    const lastDay = new Date(adminCurrentMonth.getFullYear(), adminCurrentMonth.getMonth() + 1, 0);
    
    let scheduleHTML = '';
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(adminCurrentMonth.getFullYear(), adminCurrentMonth.getMonth(), day);
        const dateString = currentDate.toISOString().split('T')[0];
        
        const dayClasses = adminClasses.filter(cls => cls.date === dateString);
        const hasClass = dayClasses.length > 0;
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        scheduleHTML += `
            <div class="schedule-item ${hasClass ? 'has-class' : ''}">
                <div class="schedule-date">${dayName}, ${day}</div>
        `;
        
        if (dayClasses.length > 0) {
            dayClasses.forEach(cls => {
                const availableSeats = cls.maxSeats - cls.bookedSeats;
                scheduleHTML += `
                    <div class="schedule-class">${cls.name}</div>
                    <div class="schedule-seats">${cls.time} - ${availableSeats} seats available</div>
                `;
            });
        } else {
            scheduleHTML += '<div class="schedule-class">No classes scheduled</div>';
        }
        
        scheduleHTML += '</div>';
    }
    
    scheduleGrid.innerHTML = scheduleHTML;
}

function changeAdminMonth(direction) {
    adminCurrentMonth.setMonth(adminCurrentMonth.getMonth() + direction);
    initializeAdminSchedule();
}

// Simplified class management - no modals needed

// Bookings table
function updateAdminBookingsTable(bookings = null) {
    if (!bookings) {
        bookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
    }
    
    const tableBody = document.getElementById('adminBookingsTableBody');
    if (!tableBody) return;
    
    if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">No bookings yet</td></tr>';
        return;
    }
    
    tableBody.innerHTML = bookings.slice(-10).reverse().map(booking => {
        const date = new Date(booking.date).toLocaleDateString();
        const className = getFullClassNameFromType(booking.className);
        return `
            <tr>
                <td>${date}</td>
                <td>${booking.customerName}</td>
                <td>${className}</td>
                <td>${booking.seats}</td>
                <td>${booking.email}<br/>${booking.phone}</td>
                <td><span class="status ${booking.status}">${booking.status}</span></td>
                <td>
                    <button class="action-btn" onclick="editAdminBooking('${booking.id}')">View</button>
                    <button class="action-btn cancel" onclick="cancelAdminBooking('${booking.id}')">Cancel</button>
                </td>
            </tr>
        `;
    }).join('');
}

function editAdminBooking(bookingId) {
    showAdminMessage('Booking details would open here.', 'info');
}

function cancelAdminBooking(bookingId) {
    if (confirm('Cancel this booking?')) {
        showAdminMessage('Booking cancelled.', 'info');
    }
}

// Utility functions
function formatAdminDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Admin functions are now handled by admin.js
// Removed duplicate functions to prevent conflicts

// Admin functionality is handled by admin.js
// Removed duplicate initialization to prevent conflicts

// Make user menu functions globally available
window.toggleUserMenu = toggleUserMenu;
window.logout = logout;
window.navigateToDashboard = navigateToDashboard;
window.navigateToBookings = navigateToBookings;
window.navigateToProfile = navigateToProfile;

// =====================================================================
// FOOD GALLERY FUNCTIONALITY
// =====================================================================

// Food gallery data - accurately describing Chef Brian's actual culinary creations
const foodGalleryData = [
    {
        id: 1,
        title: "Professional Kitchen Setup",
        description: "Chef Brian's professional kitchen workspace with stainless steel equipment and prep areas",
        category: "appetizers",
        src: "IMG_3627.jpg"
    },
    {
        id: 2,
        title: "Fresh Spaghetti with Rich Sauce",
        description: "Perfectly cooked spaghetti being lifted with a fork, showcasing Chef Brian's Italian pasta techniques",
        category: "pasta",
        src: "IMG_3628.jpg"
    },
    {
        id: 3,
        title: "Artisan Pizza Creation",
        description: "Chef Brian's handcrafted pizza with perfectly charred crust and melted cheese, demonstrating traditional pizza-making skills",
        category: "entrees",
        src: "IMG_3629.jpg"
    },
    {
        id: 4,
        title: "French Onion Soup",
        description: "Classic French onion soup with golden-brown melted cheese beautifully broiled on top in a ceramic crock",
        category: "appetizers",
        src: "IMG_3630.jpg"
    },
    {
        id: 5,
        title: "Artisan Cookies",
        description: "Perfectly baked artisan cookies with golden-brown color and uniform texture",
        category: "desserts",
        src: "IMG_3631.jpg"
    },
    {
        id: 6,
        title: "Colorful Bean and Vegetable Dish",
        description: "A vibrant dish featuring mixed beans and vegetables with rich colors and rustic presentation",
        category: "entrees",
        src: "IMG_3632.jpg"
    },

    {
        id: 8,
        title: "Layered Parfait or Trifle",
        description: "Beautiful layered dessert with colorful ingredients and cream, showcasing elegant dessert presentation",
        category: "desserts",
        src: "IMG_3634.jpg"
    },
    {
        id: 9,
        title: "Fresh Glazed Donuts",
        description: "Golden-brown glazed donuts with perfect texture and artisan quality",
        category: "desserts",
        src: "IMG_3635.jpg"
    },
    {
        id: 10,
        title: "Chocolate Cupcakes with Frosting",
        description: "Rich chocolate cupcakes topped with elaborate chocolate frosting and decorative elements",
        category: "desserts",
        src: "IMG_3636.jpg"
    },
    {
        id: 11,
        title: "Chef Brian with Artisan Pizza",
        description: "Chef Brian proudly displaying his handcrafted artisan pizza with perfect crust and toppings",
        category: "entrees",
        src: "IMG_3637.jpg"
    },
    {
        id: 12,
        title: "Sheet Pan Pizza Preparation",
        description: "Multiple sheet pans with pizza preparation showing Chef Brian's Italian cooking techniques and batch preparation methods",
        category: "pasta",
        src: "IMG_3638.jpg"
    },
    {
        id: 13,
        title: "Loaded Baked Potatoes",
        description: "Perfectly baked potatoes stuffed with creamy cheese, bacon, and toppings, professionally plated",
        category: "entrees",
        src: "IMG_3639.jpg"
    },
    {
        id: 14,
        title: "Baked Pasta Casserole",
        description: "A rich baked pasta casserole with golden-brown cheese topping and perfectly melted layers",
        category: "pasta",
        src: "IMG_3640.jpg"
    },
    {
        id: 15,
        title: "Creamy Soup with Herbs",
        description: "A creamy soup with fresh herb garnish and professional presentation",
        category: "appetizers",
        src: "IMG_3641.jpg"
    },
    {
        id: 16,
        title: "Pizza with Fresh Mozzarella",
        description: "Artisan pizza topped with fresh mozzarella and herbs, showcasing traditional Italian pizza-making techniques",
        category: "entrees",
        src: "IMG_3642.jpg"
    },
    {
        id: 17,
        title: "Charcuterie and Fruit Grazing Board",
        description: "Lavish charcuterie board featuring cheeses, cured meats, fresh fruits, and elegant presentation for events",
        category: "appetizers",
        src: "IMG_3643.jpg"
    },
    {
        id: 18,
        title: "Pasta with Green Pesto Sauce",
        description: "Wide pasta noodles coated in vibrant green pesto sauce with generous grated cheese topping",
        category: "pasta",
        src: "IMG_3644.jpg"
    },
    {
        id: 19,
        title: "Classic Burger Meal",
        description: "A juicy beef burger on a sesame bun, served with crispy french fries and an ear of corn generously coated in cheese",
        category: "entrees",
        src: "IMG_3645.jpg"
    },
    {
        id: 20,
        title: "Chicken Piccata Meal",
        description: "Pan-fried chicken cutlets with creamy caper sauce, served alongside fluffy mashed potatoes and sautéed green beans with bacon bits",
        category: "entrees",
        src: "IMG_3646.jpg"
    },
    {
        id: 21,
        title: "Perfectly Grilled Meat",
        description: "Expertly grilled meat with beautiful char marks and perfect doneness, showcasing advanced grilling techniques",
        category: "entrees",
        src: "IMG_3647.jpg"
    },
    {
        id: 22,
        title: "Colorful Autumn Vegetables",
        description: "A beautiful array of autumn vegetables prepared with herbs and seasonings, highlighting seasonal cooking",
        category: "appetizers",
        src: "IMG_3648.jpg"
    },
    {
        id: 23,
        title: "Savory Meat Preparation",
        description: "Carefully prepared meat dish with rich sauce and professional presentation, showing advanced protein cooking skills",
        category: "entrees",
        src: "IMG_3649.jpg"
    },
    {
        id: 24,
        title: "Elegant Canapé Selection",
        description: "Sophisticated small plates and canapés with refined garnishes, perfect for upscale entertaining",
        category: "appetizers",
        src: "IMG_3651.jpg"
    },
    {
        id: 25,
        title: "Professional Meatball Display",
        description: "Perfectly formed and cooked meatballs with consistent size and golden color, demonstrating classical technique",
        category: "entrees",
        src: "IMG_3652.jpg"
    },
    {
        id: 26,
        title: "Crispy Potato Pancakes",
        description: "Golden-brown potato pancakes served with sour cream and applesauce, showcasing traditional cooking techniques",
        category: "appetizers",
        src: "IMG_3653.jpg"
    },
    {
        id: 27,
        title: "Fresh Herb and Dumpling Soup",
        description: "A comforting soup with fresh herbs and handmade dumplings, showing expertise in traditional soup preparation",
        category: "appetizers",
        src: "IMG_3654.jpg"
    },

    {
        id: 29,
        title: "Golden Pasta Creation",
        description: "Beautifully prepared pasta dish with rich golden color and careful attention to texture and presentation",
        category: "pasta",
        src: "IMG_3656.jpg"
    },
    {
        id: 30,
        title: "Fresh Seafood and Vegetables",
        description: "A light preparation featuring fresh seafood with vegetables, emphasizing clean flavors and healthy cooking",
        category: "entrees",
        src: "IMG_3657.jpg"
    },
    {
        id: 31,
        title: "Herb-Crusted Protein",
        description: "Expertly prepared protein with herb crust, showing mastery of seasoning and cooking techniques",
        category: "entrees",
        src: "IMG_3658.jpg"
    },
    {
        id: 32,
        title: "Rustic Vegetable Medley",
        description: "A hearty vegetable preparation with rustic charm and careful attention to cooking methods and seasoning",
        category: "appetizers",
        src: "IMG_3659.jpg"
    },

    {
        id: 34,
        title: "Artisan Bread Collection",
        description: "A variety of handcrafted breads showing different techniques and grains, demonstrating breadmaking expertise",
        category: "bread",
        src: "IMG_3661.jpg"
    },
    {
        id: 35,
        title: "Classic Comfort Food",
        description: "A beautifully executed comfort food dish with rich flavors and home-style presentation elevated to restaurant quality",
        category: "entrees",
        src: "IMG_3662.jpg"
    },
    {
        id: 36,
        title: "Artisan Sourdough and Sesame Loaves",
        description: "Beautiful handcrafted artisan bread loaves with traditional scoring patterns and sesame seed topping, cooling on professional racks",
        category: "bread",
        src: "IMG_3663.jpg"
    },
    {
        id: 37,
        title: "Gourmet Meat Presentation",
        description: "Expertly prepared and plated meat dish with professional garnish and sauce work, showing fine dining techniques",
        category: "entrees",
        src: "IMG_3665.jpg"
    },
    {
        id: 38,
        title: "Creative Pasta Innovation",
        description: "An innovative pasta creation combining traditional techniques with modern presentation and unique flavor combinations",
        category: "pasta",
        src: "IMG_3666.jpg"
    },
    {
        id: 39,
        title: "Sophisticated Plated Entrée",
        description: "An elegantly plated main course with careful attention to color, texture, and professional presentation standards",
        category: "entrees",
        src: "IMG_3668.jpg"
    },
    {
        id: 40,
        title: "Light and Fresh Creation",
        description: "A delicate preparation emphasizing fresh ingredients and clean flavors with refined plating techniques",
        category: "appetizers",
        src: "IMG_3669.jpg"
    }
];

let currentCategory = 'all';
let lightboxIndex = 0;
let currentPhotos = [];

// Initialize food gallery
function initFoodGallery() {
    renderPhotoGrid();
}

// Show photos by category
function showCategory(category) {
    currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderPhotoGrid();
}

// Render photo grid
function renderPhotoGrid() {
    const grid = document.getElementById('photoGrid');
    if (!grid) return;
    
    // Filter photos by category
    currentPhotos = currentCategory === 'all' 
        ? foodGalleryData 
        : foodGalleryData.filter(photo => photo.category === currentCategory);
    
    grid.innerHTML = currentPhotos.map((photo, index) => `
        <div class="photo-item" onclick="openLightbox(${index})">
            <img src="${photo.src}" alt="${photo.title}" loading="lazy">
            <div class="photo-caption">
                <h4>${photo.title}</h4>
                <p>${photo.description}</p>
            </div>
        </div>
    `).join('');
}

// Lightbox functionality
function openLightbox(index) {
    lightboxIndex = index;
    const modal = document.getElementById('lightboxModal');
    const photo = currentPhotos[lightboxIndex];
    
    if (modal && photo) {
        document.getElementById('lightboxImage').src = photo.src;
        document.getElementById('lightboxTitle').textContent = photo.title;
        document.getElementById('lightboxDescription').textContent = photo.description;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function navigatePhoto(direction) {
    lightboxIndex += direction;
    
    if (lightboxIndex < 0) {
        lightboxIndex = currentPhotos.length - 1;
    } else if (lightboxIndex >= currentPhotos.length) {
        lightboxIndex = 0;
    }
    
    const photo = currentPhotos[lightboxIndex];
    if (photo) {
        document.getElementById('lightboxImage').src = photo.src;
        document.getElementById('lightboxTitle').textContent = photo.title;
        document.getElementById('lightboxDescription').textContent = photo.description;
    }
}

// Keyboard navigation for lightbox
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('lightboxModal');
    if (modal && modal.style.display === 'flex') {
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                navigatePhoto(-1);
                break;
            case 'ArrowRight':
                navigatePhoto(1);
                break;
        }
    }
});

// Close lightbox when clicking outside image
document.addEventListener('click', function(e) {
    const modal = document.getElementById('lightboxModal');
    if (e.target === modal) {
        closeLightbox();
    }
});

// Make gallery functions globally available
window.showCategory = showCategory;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.navigatePhoto = navigatePhoto;

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', initFoodGallery);

// =====================================================================
// VIDEO GALLERY FUNCTIONALITY
// =====================================================================

// Universal video player controls
function playVideo(videoId) {
    const video = document.getElementById(videoId);
    const overlay = video?.parentElement.querySelector('.video-overlay, .video-overlay-small');
    
    if (video) {
        // Pause all other videos first
        pauseAllVideos(videoId);
        
        if (video.paused) {
            video.play();
            if (overlay) overlay.style.opacity = '0';
            showVideoMessage(`🎬 Playing: ${getVideoTitle(videoId)}`, 'info');
        } else {
            video.pause();
            if (overlay) overlay.style.opacity = '1';
            showVideoMessage(`⏸️ Paused: ${getVideoTitle(videoId)}`, 'info');
        }
    }
}

// Legacy function for backward compatibility
function playMainVideo() {
    playVideo('mainVideo');
}

// Pause all videos except the specified one
function pauseAllVideos(exceptVideoId = null) {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (video.id !== exceptVideoId && !video.paused) {
            video.pause();
            const overlay = video.parentElement.querySelector('.video-overlay, .video-overlay-small');
            if (overlay) overlay.style.opacity = '1';
        }
    });
}

// Get video title for messages
function getVideoTitle(videoId) {
    const titles = {
        'mainVideo': 'Las Vegas Birthday Cake',
        'marinaraVideo': 'Making Marinara',
        'pestoVideo': 'Fresh Pesto',
        'saraleeVideo': 'Sara Lee Experience',
        'tonydanzaVideo': 'Tony Danza Show'
    };
    return titles[videoId] || 'Video';
}

// Toggle fullscreen video
function toggleFullscreen() {
    const video = document.getElementById('mainVideo');
    const container = document.querySelector('.video-container');
    
    if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
        
        showVideoMessage('🔳 Entered fullscreen mode', 'success');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        showVideoMessage('🔳 Exited fullscreen mode', 'info');
    }
}

// Share video functionality
function shareVideo() {
    const videoTitle = "World's Largest Birthday Cake - Las Vegas Centennial by Chef Brian Averna";
    const videoUrl = window.location.href + "#gallery";
    
    if (navigator.share) {
        navigator.share({
            title: videoTitle,
            text: "Check out this amazing culinary achievement by Chef Brian Averna - the World's Largest Birthday Cake!",
            url: videoUrl,
        }).then(() => {
            showVideoMessage('📤 Video shared successfully!', 'success');
        }).catch(() => {
            fallbackShare(videoTitle, videoUrl);
        });
    } else {
        fallbackShare(videoTitle, videoUrl);
    }
}

// Fallback share function
function fallbackShare(title, url) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showVideoMessage('🔗 Video link copied to clipboard!', 'success');
        }).catch(() => {
            showShareModal(title, url);
        });
    } else {
        showShareModal(title, url);
    }
}

// Show share modal
function showShareModal(title, url) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            text-align: center;
        ">
            <h3 style="color: #2c5530; margin-bottom: 20px;">Share This Video</h3>
            <p style="margin-bottom: 20px; color: #666;">${title}</p>
            <input type="text" value="${url}" readonly style="
                width: 100%;
                padding: 10px;
                border: 2px solid #7a9a4d;
                border-radius: 5px;
                margin-bottom: 20px;
                font-size: 0.9rem;
            " onclick="this.select()">
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="copyToClipboard('${url}'); closeShareModal();" style="
                    background: #7a9a4d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Copy Link</button>
                <button onclick="closeShareModal()" style="
                    background: #ccc;
                    color: #333;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.currentShareModal = modal;
}

// Close share modal
function closeShareModal() {
    if (window.currentShareModal) {
        window.currentShareModal.remove();
        window.currentShareModal = null;
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showVideoMessage('🔗 Link copied to clipboard!', 'success');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showVideoMessage('🔗 Link copied to clipboard!', 'success');
    }
}

// Download video functionality
function downloadVideo() {
    showVideoMessage('⬇️ Video download initiated...', 'info');
    
    // Create a temporary link to download the video
    const link = document.createElement('a');
    link.href = 'las vegas cake.mp4';
    link.download = 'Brian_Averna_Las_Vegas_Birthday_Cake.mp4';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
        showVideoMessage('📁 Check your downloads folder!', 'success');
    }, 1000);
}

// Show video message
function showVideoMessage(text, type = 'info') {
    // Remove existing video messages
    const existingMessages = document.querySelectorAll('.video-message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `video-message ${type}`;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        font-size: 0.9rem;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
    `;
    message.textContent = text;
    
    // Add animation styles if not already present
    if (!document.getElementById('videoMessageStyles')) {
        const style = document.createElement('style');
        style.id = 'videoMessageStyles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Enhanced video event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all video event listeners
    initializeAllVideos();
    
    // Initialize the food gallery
    initFoodGallery();
    
    // Gallery item click handlers (for future expansion)
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('p').textContent;
            showVideoMessage(`📱 ${title} - Coming soon!`, 'info');
        });
    });
});

// Initialize all video functionality
function initializeAllVideos() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        const overlay = video.parentElement.querySelector('.video-overlay, .video-overlay-small');
        
        if (video && overlay) {
            // Update overlay visibility based on video state
            video.addEventListener('play', () => {
                overlay.style.opacity = '0';
            });
            
            video.addEventListener('pause', () => {
                overlay.style.opacity = '1';
            });
            
            video.addEventListener('ended', () => {
                overlay.style.opacity = '1';
                showVideoMessage(`🎬 ${getVideoTitle(video.id)} finished! Thanks for watching!`, 'success');
            });
            
            // Click on video to toggle play/pause
            video.addEventListener('click', () => playVideo(video.id));
            
            // Keyboard controls for focused videos
            video.addEventListener('keydown', function(e) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    playVideo(video.id);
                } else if (e.code === 'KeyF' && video.id === 'mainVideo') {
                    e.preventDefault();
                    toggleFullscreen();
                }
            });
            
            // Add loading state handling
            video.addEventListener('loadstart', () => {
                showVideoMessage(`⏳ Loading ${getVideoTitle(video.id)}...`, 'info');
            });
            
            video.addEventListener('canplay', () => {
                showVideoMessage(`✅ ${getVideoTitle(video.id)} ready to play!`, 'success');
            });
            
            video.addEventListener('error', () => {
                showVideoMessage(`❌ Error loading ${getVideoTitle(video.id)}`, 'error');
            });
        }
    });
    
    // Add video performance optimization
    addVideoOptimizations();
}

// Add video performance optimizations
function addVideoOptimizations() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Preload metadata only for better performance
        video.preload = 'metadata';
        
        // Add intersection observer for lazy loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && video.preload !== 'auto') {
                    video.preload = 'auto';
                    observer.unobserve(video);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        observer.observe(video);
    });
}

// =====================================================================


// Export video functions for global access
window.playVideo = playVideo;
window.playMainVideo = playMainVideo;
window.pauseAllVideos = pauseAllVideos;
window.getVideoTitle = getVideoTitle;
window.initializeAllVideos = initializeAllVideos;
window.toggleFullscreen = toggleFullscreen;
window.shareVideo = shareVideo;
window.downloadVideo = downloadVideo;
window.closeShareModal = closeShareModal;

// Export calendar functions for global access
window.showClassDetails = showClassDetails;
window.closeClassDetails = closeClassDetails;
window.bookThisClass = bookThisClass;
window.showPaymentOptions = showPaymentOptions;
window.closePaymentOptions = closePaymentOptions;
window.showSignInPrompt = showSignInPrompt;
window.closeSignInPrompt = closeSignInPrompt;

// Track payment attempts and create pending bookings
function trackPaymentAttempt(paymentMethod, className, date, userEmail) {
    // Create a pending booking
    const pendingBooking = {
        id: Date.now(),
        className: className,
        date: date,
        userEmail: userEmail,
        paymentMethod: paymentMethod,
        status: 'pending_payment',
        bookingTime: new Date().toISOString(),
        paymentAttemptTime: new Date().toISOString()
    };
    
    // Save to user's bookings
    const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    userBookings.push(pendingBooking);
    localStorage.setItem('userBookings', JSON.stringify(userBookings));
    
    // Save to admin bookings
    const adminBookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
    adminBookings.push(pendingBooking);
    localStorage.setItem('cottageBookings', JSON.stringify(adminBookings));
    
    // Add admin notification
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const notification = {
        id: Date.now(),
        type: 'payment_attempt',
        title: 'Payment Attempt',
        message: `${userEmail} attempted payment via ${paymentMethod} for ${className}`,
        booking: pendingBooking,
        timestamp: Date.now(),
        read: false
    };
    adminNotifications.push(notification);
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    
    // Show success message
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1001;
        font-size: 0.9rem;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 300px;
    `;
    message.innerHTML = `
        ✅ Payment link opened!<br/>
        <small>Your booking is being tracked. Don't forget to email us after payment.</small>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 5000);
    
    // Close the payment modal
    closePaymentOptions();
}

window.trackPaymentAttempt = trackPaymentAttempt;



// =====================================================================
// EMBEDDED ADMIN LOGIN FUNCTIONALITY
// =====================================================================

// Show admin login modal
function showAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    modal.classList.remove('admin-login-hidden');
    
    // Clear form
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminLoginMessage').textContent = '';
    
    // Focus on username field
    setTimeout(() => {
        document.getElementById('adminUsername').focus();
    }, 100);
}

// Hide admin login modal
function hideAdminLogin() {
    const modal = document.getElementById('adminLoginModal');
    modal.classList.add('admin-login-hidden');
    
    // Clear form
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminLoginMessage').textContent = '';
}

// Handle admin login
function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const messageDiv = document.getElementById('adminLoginMessage');
    
    // Admin credentials (in a real app, this would be server-side)
    const validCredentials = {
        'admin': 'cottage2025'
    };
    
    if (validCredentials[username] && validCredentials[username] === password) {
        // Set admin session
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('loginTime', Date.now().toString());
        sessionStorage.setItem('adminUser', username);
        
        messageDiv.style.color = '#28a745';
        messageDiv.textContent = '✅ Login successful! Redirecting...';
        
        // Show success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1001;
            font-size: 0.9rem;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        notification.textContent = `🔧 Welcome ${username}! Opening admin panel...`;
        document.body.appendChild(notification);
        
        // Redirect to admin panel after delay
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        
    } else {
        messageDiv.style.color = '#dc3545';
        messageDiv.textContent = '❌ Invalid credentials. Please try again.';
        
        // Clear password field
        document.getElementById('adminPassword').value = '';
        
        // Clear error message after 3 seconds
        setTimeout(() => {
            messageDiv.textContent = '';
        }, 3000);
    }
}

// Export admin functions for global access
window.showAdminLogin = showAdminLogin;
window.hideAdminLogin = hideAdminLogin;
window.handleAdminLogin = handleAdminLogin;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminPanel };
}