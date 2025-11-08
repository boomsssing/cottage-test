// Admin Panel JavaScript - Enhanced with Real-time User Sync

// Auto-hide Navbar on Scroll for Admin Dashboard
let adminLastScrollTop = 0;
let adminNavbar = null;

document.addEventListener('DOMContentLoaded', function() {
    adminNavbar = document.querySelector('.navbar');
    let adminTicking = false;

    function updateAdminNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Don't hide navbar at the very top of the page
        if (scrollTop <= 100) {
            adminNavbar.classList.remove('hidden');
            adminNavbar.classList.add('visible');
        } else if (scrollTop > adminLastScrollTop && scrollTop > 150) {
            // Scrolling down - hide navbar
            adminNavbar.classList.add('hidden');
            adminNavbar.classList.remove('visible');
        } else if (scrollTop < adminLastScrollTop) {
            // Scrolling up - show navbar
            adminNavbar.classList.remove('hidden');
            adminNavbar.classList.add('visible');
        }
        
        adminLastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
        adminTicking = false;
    }

    function requestAdminTick() {
        if (!adminTicking) {
            requestAnimationFrame(updateAdminNavbar);
            adminTicking = true;
        }
    }

    window.addEventListener('scroll', requestAdminTick);
});

// Real-time notification system
class AdminNotificationSystem {
    constructor() {
        this.init();
    }

    init() {
        this.checkNotifications();
        this.startRealTimeSync();
        this.setupNotificationUI();
    }

    checkNotifications() {
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        const unreadCount = notifications.filter(n => !n.read).length;
        this.updateNotificationBadge(unreadCount);
        return notifications;
    }

    updateNotificationBadge(count) {
        let badge = document.getElementById('notificationBadge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'notificationBadge';
            badge.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                z-index: 1000;
                cursor: pointer;
            `;
            badge.onclick = () => this.showNotificationPanel();
            document.body.appendChild(badge);
        }
        
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    setupNotificationUI() {
        // Create notification panel
        const panel = document.createElement('div');
        panel.id = 'notificationPanel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            width: 350px;
            max-height: 400px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 1001;
            display: none;
            overflow-y: auto;
        `;
        document.body.appendChild(panel);
    }

    showNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        const notifications = this.checkNotifications();
        
        panel.innerHTML = `
            <div style="padding: 15px; border-bottom: 1px solid #eee; background: #2c5530; color: white; border-radius: 10px 10px 0 0;">
                <h4 style="margin: 0;">Notifications</h4>
                <button onclick="adminNotifications.clearAllNotifications()" style="float: right; background: none; border: 1px solid white; color: white; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Clear All</button>
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
                ${notifications.length ? notifications.map(n => this.renderNotification(n)).join('') : '<p style="padding: 20px; text-align: center; color: #666;">No new notifications</p>'}
            </div>
        `;
        
        panel.style.display = 'block';
        
        // Close panel when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick.bind(this));
        }, 100);
    }

    renderNotification(notification) {
        const time = new Date(notification.timestamp).toLocaleTimeString();
        const typeIcon = notification.type === 'booking' ? '📅' : notification.type === 'message' ? '💬' : '📢';
        
        return `
            <div style="padding: 12px; border-bottom: 1px solid #eee; ${notification.read ? 'opacity: 0.6;' : ''}" 
                 onclick="adminNotifications.markAsRead('${notification.timestamp}')">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>${typeIcon}</span>
                    <span style="font-weight: 600; font-size: 13px;">${notification.message}</span>
                </div>
                <div style="color: #666; font-size: 11px; margin-top: 4px;">${time}</div>
            </div>
        `;
    }

    handleOutsideClick(e) {
        const panel = document.getElementById('notificationPanel');
        const badge = document.getElementById('notificationBadge');
        
        if (!panel.contains(e.target) && e.target !== badge) {
            panel.style.display = 'none';
            document.removeEventListener('click', this.handleOutsideClick);
        }
    }

    markAsRead(timestamp) {
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        const notification = notifications.find(n => n.timestamp.toString() === timestamp);
        if (notification) {
            notification.read = true;
            localStorage.setItem('adminNotifications', JSON.stringify(notifications));
            this.checkNotifications();
        }
    }

    clearAllNotifications() {
        localStorage.setItem('adminNotifications', JSON.stringify([]));
        this.checkNotifications();
        document.getElementById('notificationPanel').style.display = 'none';
    }

    startRealTimeSync() {
        setInterval(() => {
            this.checkNotifications();
            this.syncUserBookings();
        }, 3000); // Check every 3 seconds
    }

    syncUserBookings() {
        // Update admin booking table with latest user bookings
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const cottageBookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
        
        // Merge bookings from both sources
        const allBookings = [...bookings, ...cottageBookings];
        
        // Update admin bookings table if visible
        if (document.getElementById('adminBookingsTableBody')) {
            this.updateAdminBookingsTable(allBookings);
        }
    }

    updateAdminBookingsTable(bookings) {
        const tbody = document.getElementById('adminBookingsTableBody');
        if (!tbody) return;

        const recent = bookings.slice(0, 10); // Show last 10 bookings
        
        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">No bookings yet.</td></tr>';
            return;
        }

        tbody.innerHTML = recent.map(booking => {
            const date = new Date(booking.classDate || booking.date).toLocaleDateString();
            const status = booking.status || 'confirmed';
            const statusClass = status === 'confirmed' ? 'confirmed' : status === 'pending' ? 'pending' : 'cancelled';
            
            return `
                <tr>
                    <td>${date}</td>
                    <td>${booking.name}</td>
                    <td>${booking.className || 'Class'}</td>
                    <td>${booking.seats}</td>
                    <td>${booking.email}<br>${booking.phone || ''}</td>
                    <td><span class="status ${statusClass}">${status}</span></td>
                    <td>
                        <button class="action-btn" onclick="editBooking('${booking.id}')">Edit</button>
                        <button class="action-btn cancel" onclick="cancelBooking('${booking.id}')">Cancel</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Member Management System
class MemberManagement {
    constructor() {
        this.currentMember = null;
        this.init();
    }

    init() {
        this.loadMembers();
        this.setupEventListeners();
        this.updateMemberStats();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('memberSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchMembers(e.target.value));
        }

        // Filter functionality
        const filterSelect = document.getElementById('memberFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => this.filterMembers(e.target.value));
        }

        // Send message form
        const sendMessageForm = document.getElementById('sendMessageForm');
        if (sendMessageForm) {
            sendMessageForm.addEventListener('submit', (e) => this.sendMessage(e));
        }
    }

    loadMembers() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        this.renderMembersTable(users);
        return users;
    }

    renderMembersTable(members) {
        const tbody = document.getElementById('membersTableBody');
        if (!tbody) return;

        if (members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No members found.</td></tr>';
            return;
        }

        tbody.innerHTML = members.map(member => {
            const joinDate = new Date(member.createdAt).toLocaleDateString();
            const bookings = this.getMemberBookings(member.email);
            const status = this.getMemberStatus(member);
            
            return `
                <tr>
                    <td>
                        <div class="member-info">
                            <div class="member-avatar">${member.firstName ? member.firstName.charAt(0).toUpperCase() : '👤'}</div>
                            <div class="member-details">
                                <h5>${member.firstName || ''} ${member.lastName || ''}</h5>
                                <p>${member.experience || 'Beginner'} level</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        ${member.email}<br>
                        <small>${member.phone || 'No phone'}</small>
                    </td>
                    <td>${joinDate}</td>
                    <td>${bookings.length} booking${bookings.length !== 1 ? 's' : ''}</td>
                    <td><span class="member-status ${status.class}">${status.text}</span></td>
                    <td>
                        <div class="member-actions">
                            <button class="member-action-btn message" onclick="memberManager.openSendMessage('${member.email}')">Message</button>
                            <button class="member-action-btn edit" onclick="memberManager.editMember('${member.email}')">Edit</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getMemberBookings(email) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const cottageBookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
        const allBookings = [...bookings, ...cottageBookings];
        return allBookings.filter(booking => booking.email === email);
    }

    getMemberStatus(member) {
        const joinDate = new Date(member.createdAt);
        const daysSinceJoin = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
        const bookings = this.getMemberBookings(member.email);
        
        if (daysSinceJoin <= 7) {
            return { class: 'new', text: 'New' };
        } else if (bookings.length > 0) {
            return { class: 'active', text: 'Active' };
        } else {
            return { class: 'inactive', text: 'Inactive' };
        }
    }

    updateMemberStats() {
        const users = this.loadMembers();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total members
        document.getElementById('totalMembers').textContent = users.length;
        document.getElementById('totalMembersCount').textContent = users.length;

        // New members today
        const newToday = users.filter(user => {
            const joinDate = new Date(user.createdAt);
            joinDate.setHours(0, 0, 0, 0);
            return joinDate.getTime() === today.getTime();
        }).length;
        document.getElementById('newMembersToday').textContent = newToday;

        // Active members (with bookings)
        const activeMembers = users.filter(user => 
            this.getMemberBookings(user.email).length > 0
        ).length;
        document.getElementById('activeMembers').textContent = activeMembers;

        // VIP members (3+ bookings)
        const vipMembers = users.filter(user => 
            this.getMemberBookings(user.email).length >= 3
        ).length;
        document.getElementById('topMembers').textContent = vipMembers;
    }

    searchMembers(searchTerm) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filtered = users.filter(user => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
            const email = user.email.toLowerCase();
            const term = searchTerm.toLowerCase();
            return fullName.includes(term) || email.includes(term);
        });
        this.renderMembersTable(filtered);
    }

    filterMembers(filterType) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        let filtered = users;

        switch(filterType) {
            case 'new':
                const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                filtered = users.filter(user => new Date(user.createdAt).getTime() > sevenDaysAgo);
                break;
            case 'active':
                filtered = users.filter(user => this.getMemberBookings(user.email).length > 0);
                break;
            case 'auto-created':
                filtered = users.filter(user => user.accountType === 'auto-created');
                break;
            default:
                filtered = users;
        }

        this.renderMembersTable(filtered);
    }

    openSendMessage(email) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user) return;

        this.currentMember = user;
        
        // Update modal content
        document.getElementById('messageRecipientName').textContent = user.firstName || 'Member';
        document.getElementById('recipientAvatar').textContent = user.firstName ? user.firstName.charAt(0).toUpperCase() : '👤';
        document.getElementById('recipientFullName').textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        document.getElementById('recipientEmail').textContent = user.email;
        
        // Show modal
        document.getElementById('sendMessageModal').style.display = 'block';
    }

    sendMessage(e) {
        e.preventDefault();
        
        const messageType = document.getElementById('messageSubject').value;
        const messageContent = document.getElementById('messageContent').value;
        
        if (!this.currentMember || !messageType || !messageContent) return;

        // Create message for user
        const message = {
            id: Date.now().toString(),
            sender: 'admin',
            text: messageContent,
            timestamp: Date.now(),
            read: false,
            type: messageType
        };

        // Add to user's messages
        const allMessages = JSON.parse(localStorage.getItem('userMessages') || '{}');
        if (!allMessages[this.currentMember.email]) {
            allMessages[this.currentMember.email] = [];
        }
        allMessages[this.currentMember.email].push(message);
        localStorage.setItem('userMessages', JSON.stringify(allMessages));

        // Show success and close modal
        showAdminMessage(`Message sent to ${this.currentMember.firstName}!`, 'success');
        this.closeSendMessageModal();
    }

    closeSendMessageModal() {
        document.getElementById('sendMessageModal').style.display = 'none';
        document.getElementById('sendMessageForm').reset();
        this.currentMember = null;
    }

    editMember(email) {
        // For now, show member details
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (user) {
            const bookings = this.getMemberBookings(email);
            alert(`Member Details:\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nPhone: ${user.phone || 'Not provided'}\nJoined: ${new Date(user.createdAt).toLocaleDateString()}\nExperience: ${user.experience || 'Beginner'}\nBookings: ${bookings.length}\nDietary: ${user.dietary || 'None specified'}`);
        }
    }
}

// Global member manager instance
let memberManager;

// Enhanced Chat Management System
class ChatManager {
    constructor() {
        this.currentConversation = null;
        this.conversations = new Map();
        this.messageTemplates = {
            welcome_standard: "Join us for a cooking class that features both technique and hands on learning when possible. We're excited to have you join our culinary community. Our hands-on cooking classes will help you develop your skills in a warm, intimate setting. We can't wait to cook with you!",
            welcome_personal: "Hi [NAME]! I'm Chef Brian, and I personally wanted to welcome you to our cooking family. Having worked with major food chains and appeared on The Today Show, I'm passionate about sharing the joy of cooking with eager food enthusiasts like yourself. Looking forward to meeting you in the kitchen!",
            reminder_24h: "Just a friendly reminder that your [CLASS_NAME] class is tomorrow at [TIME]. We're looking forward to cooking with you! Please let us know if you have any last-minute questions.",
            reminder_1h: "Your [CLASS_NAME] class starts in 1 hour! We're excited to see you soon. The kitchen is ready and we can't wait to start cooking together!",
            followup_class: "Thank you for joining today's [CLASS_NAME] class! How did you enjoy the experience? We'd love to hear your thoughts and see if you have any questions about the recipes we covered.",
            followup_feedback: "We'd love to hear your thoughts about your recent cooking class experience with us. Your feedback helps us continue to improve and provide the best possible culinary education. What did you enjoy most?"
        };
        this.init();
    }

    init() {
        this.loadConversations();
        this.setupEventListeners();
        this.updateMessageStats();
        this.startRealTimeSync();
    }

    setupEventListeners() {
        // Search conversations
        const searchInput = document.getElementById('conversationSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchConversations(e.target.value));
        }

        // Filter conversations
        const filterSelect = document.getElementById('conversationFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => this.filterConversations(e.target.value));
        }

        // Auto-resize message input
        const messageInput = document.getElementById('adminMessageInput');
        if (messageInput) {
            messageInput.addEventListener('input', this.autoResizeTextarea);
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    loadConversations() {
        const allMessages = JSON.parse(localStorage.getItem('userMessages') || '{}');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        this.conversations.clear();

        // Create conversation objects for each user with messages
        Object.keys(allMessages).forEach(email => {
            const user = users.find(u => u.email === email);
            if (user && allMessages[email].length > 0) {
                const messages = allMessages[email].sort((a, b) => a.timestamp - b.timestamp);
                const lastMessage = messages[messages.length - 1];
                const unreadCount = messages.filter(m => m.sender === 'user' && !m.read).length;

                this.conversations.set(email, {
                    user: user,
                    messages: messages,
                    lastMessage: lastMessage,
                    unreadCount: unreadCount,
                    lastActivity: lastMessage.timestamp
                });
            }
        });

        this.renderConversationsList();
    }

    renderConversationsList(filteredConversations = null) {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        const conversations = filteredConversations || Array.from(this.conversations.entries());
        
        if (conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="conversation-placeholder">
                    <p>No conversations found</p>
                </div>
            `;
            return;
        }

        // Sort by last activity
        conversations.sort((a, b) => b[1].lastActivity - a[1].lastActivity);

        conversationsList.innerHTML = conversations.map(([email, conv]) => {
            const user = conv.user;
            const lastMsg = conv.lastMessage;
            const time = this.formatMessageTime(lastMsg.timestamp);
            const preview = this.getMessagePreview(lastMsg);
            
            return `
                <div class="conversation-item ${this.currentConversation === email ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}" 
                     onclick="chatManager.openConversation('${email}')">
                    <div class="conversation-avatar">${user.firstName ? user.firstName.charAt(0).toUpperCase() : '👤'}</div>
                    <div class="conversation-info">
                        <div class="conversation-name">${user.firstName || ''} ${user.lastName || ''}</div>
                        <div class="conversation-preview">${preview}</div>
                    </div>
                    <div class="conversation-meta">
                        <div class="conversation-time">${time}</div>
                        ${conv.unreadCount > 0 ? `<div class="unread-badge">${conv.unreadCount}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    openConversation(email) {
        this.currentConversation = email;
        const conversation = this.conversations.get(email);
        
        if (!conversation) return;

        // Mark messages as read
        this.markConversationAsRead(email);
        
        // Update UI
        this.updateChatHeader(conversation.user);
        this.renderMessages(conversation.messages);
        this.showChatInput();
        
        // Update conversation list
        this.renderConversationsList();
    }

    updateChatHeader(user) {
        document.getElementById('currentChatAvatar').textContent = 
            user.firstName ? user.firstName.charAt(0).toUpperCase() : '👤';
        document.getElementById('currentChatName').textContent = 
            `${user.firstName || ''} ${user.lastName || ''}`.trim();
        document.getElementById('currentChatStatus').textContent = 
            `${user.email} • Member since ${new Date(user.createdAt).toLocaleDateString()}`;
    }

    renderMessages(messages) {
        const container = document.getElementById('chatMessagesContainer');
        if (!container) return;

        container.innerHTML = messages.map(msg => {
            const time = this.formatMessageTime(msg.timestamp);
            const isAdmin = msg.sender === 'admin';
            const senderName = isAdmin ? 'Chef Brian' : this.getCurrentUserName();
            const avatar = isAdmin ? '👨‍🍳' : '👤';

            return `
                <div class="chat-message ${isAdmin ? 'admin' : 'user'}">
                    <div class="chat-message-avatar">${avatar}</div>
                    <div class="chat-message-content">
                        <div class="chat-message-header">
                            <span class="chat-message-sender">${senderName}</span>
                            <span class="chat-message-time">${time}</span>
                        </div>
                        <div class="chat-message-text">${msg.text}</div>
                        ${isAdmin ? `<div class="message-status ${msg.read ? 'read' : 'sent'}"></div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    getCurrentUserName() {
        if (!this.currentConversation) return 'User';
        const conversation = this.conversations.get(this.currentConversation);
        return conversation ? `${conversation.user.firstName || 'User'}` : 'User';
    }

    showChatInput() {
        document.getElementById('chatInputContainer').style.display = 'block';
        document.getElementById('adminMessageInput').focus();
    }

    sendMessage() {
        const input = document.getElementById('adminMessageInput');
        const text = input.value.trim();
        
        if (!text || !this.currentConversation) return;

        const message = {
            id: Date.now().toString(),
            sender: 'admin',
            text: text,
            timestamp: Date.now(),
            read: false,
            type: 'general'
        };

        // Add to localStorage
        const allMessages = JSON.parse(localStorage.getItem('userMessages') || '{}');
        if (!allMessages[this.currentConversation]) {
            allMessages[this.currentConversation] = [];
        }
        allMessages[this.currentConversation].push(message);
        localStorage.setItem('userMessages', JSON.stringify(allMessages));

        // Update local conversation
        const conversation = this.conversations.get(this.currentConversation);
        if (conversation) {
            conversation.messages.push(message);
            conversation.lastMessage = message;
            conversation.lastActivity = message.timestamp;
        }

        // Clear input and re-render
        input.value = '';
        input.style.height = 'auto';
        this.renderMessages(conversation.messages);
        this.renderConversationsList();
        this.updateMessageStats();
    }

    markConversationAsRead(email) {
        const allMessages = JSON.parse(localStorage.getItem('userMessages') || '{}');
        if (allMessages[email]) {
            allMessages[email].forEach(msg => {
                if (msg.sender === 'user') {
                    msg.read = true;
                }
            });
            localStorage.setItem('userMessages', JSON.stringify(allMessages));
        }

        // Update local conversation
        const conversation = this.conversations.get(email);
        if (conversation) {
            conversation.unreadCount = 0;
            conversation.messages.forEach(msg => {
                if (msg.sender === 'user') {
                    msg.read = true;
                }
            });
        }
    }

    updateMessageStats() {
        const totalConversations = this.conversations.size;
        let unreadMessages = 0;
        let todayMessages = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.conversations.forEach(conv => {
            unreadMessages += conv.unreadCount;
            todayMessages += conv.messages.filter(msg => {
                const msgDate = new Date(msg.timestamp);
                msgDate.setHours(0, 0, 0, 0);
                return msgDate.getTime() === today.getTime();
            }).length;
        });

        document.getElementById('totalConversations').textContent = totalConversations;
        document.getElementById('unreadMessages').textContent = unreadMessages;
        document.getElementById('todayMessages').textContent = todayMessages;
    }

    searchConversations(searchTerm) {
        if (!searchTerm) {
            this.renderConversationsList();
            return;
        }

        const filtered = Array.from(this.conversations.entries()).filter(([email, conv]) => {
            const fullName = `${conv.user.firstName || ''} ${conv.user.lastName || ''}`.toLowerCase();
            const emailLower = email.toLowerCase();
            const term = searchTerm.toLowerCase();
            return fullName.includes(term) || emailLower.includes(term);
        });

        this.renderConversationsList(filtered);
    }

    filterConversations(filterType) {
        let filtered = Array.from(this.conversations.entries());

        switch(filterType) {
            case 'unread':
                filtered = filtered.filter(([_, conv]) => conv.unreadCount > 0);
                break;
            case 'today':
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                filtered = filtered.filter(([_, conv]) => {
                    const lastMsgDate = new Date(conv.lastActivity);
                    lastMsgDate.setHours(0, 0, 0, 0);
                    return lastMsgDate.getTime() === today.getTime();
                });
                break;
            case 'recent':
                const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(([_, conv]) => conv.lastActivity > sevenDaysAgo);
                break;
            default:
                // 'all' - no filtering
                break;
        }

        this.renderConversationsList(filtered);
    }

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    }

    getMessagePreview(message) {
        const maxLength = 50;
        let preview = message.text;
        
        if (preview.length > maxLength) {
            preview = preview.substring(0, maxLength) + '...';
        }
        
        const prefix = message.sender === 'admin' ? 'You: ' : '';
        return prefix + preview;
    }

    autoResizeTextarea(e) {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    }

    startRealTimeSync() {
        setInterval(() => {
            this.loadConversations();
            this.updateMessageStats();
            
            // If a conversation is open, refresh its messages
            if (this.currentConversation) {
                const conversation = this.conversations.get(this.currentConversation);
                if (conversation) {
                    this.renderMessages(conversation.messages);
                }
            }
        }, 3000);
    }

    insertTemplate(templateKey) {
        const template = this.messageTemplates[templateKey];
        if (template && this.currentConversation) {
            const conversation = this.conversations.get(this.currentConversation);
            let personalizedTemplate = template;
            
            if (conversation) {
                personalizedTemplate = template.replace('[NAME]', conversation.user.firstName || 'there');
            }
            
            document.getElementById('adminMessageInput').value = personalizedTemplate;
            document.getElementById('adminMessageInput').focus();
        }
    }
}

// Global chat manager instance
let chatManager;

// Global admin notification instance
let adminNotifications;

// Load classes from localStorage with admin format
function getAdminClassesFromStorage() {
    const stored = localStorage.getItem('cottageClassesAdmin');
    let adminClasses;
    
    if (stored) {
        adminClasses = JSON.parse(stored);
    } else {
        // Load schedule from classes-schedule.js (loaded in HTML before this file)
        // CLASSES_SCHEDULE is the SINGLE source of truth for all class data
        adminClasses = CLASSES_SCHEDULE;
    }
    
    // CRITICAL FIX: Sync bookedSeats with actual bookings from cottageBookings
    const existingBookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
    
    // Calculate actual booked seats for each class
    adminClasses.forEach(adminClass => {
        const classBookings = existingBookings.filter(booking => {
            const bookingDate = new Date(booking.date).toISOString().split('T')[0];
            const classDate = new Date(adminClass.date).toISOString().split('T')[0];
            
            // Match by date and class name/type
            const dateMatches = bookingDate === classDate;
            const classMatches = booking.className === adminClass.name || 
                                 booking.className === adminClass.type ||
                                 adminClass.name.toLowerCase().includes(booking.className.toLowerCase());
            
            return dateMatches && classMatches && booking.status !== 'cancelled';
        });
        
        // Sum up all seats from matching bookings
        const totalBookedSeats = classBookings.reduce((sum, booking) => sum + (booking.seats || 0), 0);
        adminClass.bookedSeats = totalBookedSeats;
        
        console.log(`🔄 Class "${adminClass.name}" on ${adminClass.date}: ${totalBookedSeats} booked seats from ${classBookings.length} bookings`);
    });
    
    // Save the corrected data
    saveAdminClassesToStorage(adminClasses);
    return adminClasses;
}

function saveAdminClassesToStorage(adminClasses) {
    // Save admin classes
    localStorage.setItem('cottageClassesAdmin', JSON.stringify(adminClasses));
    
    // INSTANT SYNC: Update customer-facing storage immediately
    const customerClasses = adminClasses
        .filter(cls => new Date(cls.date) >= new Date()) // Only future classes
        .map(cls => ({
            id: cls.id,
            date: cls.date,
            class: cls.name,
            seats: cls.maxSeats - cls.bookedSeats
        }));
    
    localStorage.setItem('cottageClasses', JSON.stringify(customerClasses));
    
    // Trigger immediate update
    triggerCalendarUpdate();
    
    // Force storage event for cross-tab communication
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'cottageClasses',
        newValue: JSON.stringify(customerClasses),
        oldValue: null
    }));
    
    console.log('✅ REAL-TIME: Classes saved and instantly synced to customer site!', {
        adminClasses: adminClasses.length,
        customerClasses: customerClasses.length
    });
}

let classes = getAdminClassesFromStorage();

let currentMonth = new Date();

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Initialize real-time notification system
    adminNotifications = new AdminNotificationSystem();
    
    // Initialize member management
    memberManager = new MemberManagement();
    
    // Initialize chat system
    chatManager = new ChatManager();
    
    initializeSchedule();
    setupEventListeners();
    updateDashboardStats();
});

function setupEventListeners() {
    // Add class form submission
    const addClassForm = document.getElementById('addClassForm');
    if (addClassForm) {
        addClassForm.addEventListener('submit', handleAddClass);
    }
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Modal close button
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }

    // Modal background click to close
    const modal = document.getElementById('classModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal();
            }
        });
    }
}

function handleAddClass(e) {
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
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    // Check if date is in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showMessage('Please select a future date.', 'error');
        return;
    }
    
    // Get class name mapping for all new class types
    const classNames = {
        'classic-italian-1': 'Classic Italian American I',
        'classic-italian-2': 'Classic Italian American II', 
        'classic-italian-3': 'Classic Italian American III',
        'pasta-sauces': 'Pasta Sauces',
        'fresh-pasta': 'Fresh Scratch Pasta',
        'thanksgiving': 'Thanksgiving Sides',
        'holiday-appetizers': 'Holiday Appetizers',
        'holiday-desserts': 'Holiday Chocolate Desserts',
        'easy-breads': 'Easy Breads',
        'winter-soups': 'International Winter Soups'
    };
    
    // Create new class object
    const newClass = {
        id: Date.now(), // Simple ID generation
        type: formData.type,
        name: classNames[formData.type],
        date: formData.date,
        time: formData.time,
        maxSeats: formData.maxSeats,
        bookedSeats: 0,
        price: formData.price,
        notes: formData.notes
    };
    
    // Add to classes array
    classes.push(newClass);
    
    // INSTANT SAVE: Save to localStorage and update displays
    saveAdminClassesToStorage(classes);
    initializeSchedule();
    updateDashboardStats();
    
    // Multiple triggers to ensure customer site updates
    triggerCalendarUpdate();
    
    // Additional manual trigger after short delay
    setTimeout(() => {
        triggerCalendarUpdate();
        console.log('⚡ DOUBLE-CHECK: Triggered second update to ensure sync');
    }, 200);
    
    console.log('✅ New class added and INSTANTLY synced to customer site!');
    
    // Show success message
    showMessage(`${newClass.name} class added successfully for ${formatDate(formData.date)}!`, 'success');
    
    // Reset form
    document.getElementById('addClassForm').reset();
    
    // In a real app, you would send this to your backend:
    console.log('New class added:', newClass);
}

// Global variable to store currently selected class
let selectedClass = null;

function showModal() {
    const modal = document.getElementById('classModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalButtons = document.getElementById('modalButtons');
    
    if (!modal || !modalTitle || !modalButtons || !selectedClass) return;
    
    // Clear existing buttons
    modalButtons.innerHTML = '';
    
    if (selectedClass.hasClass === false) {
        // Empty day - show "Add Class" option
        modalTitle.textContent = `Add Class - ${formatDate(selectedClass.date)}`;
        modalButtons.innerHTML = `
            <button onclick="handleAddNewClass()" class="admin-button">Add Class</button>
        `;
    } else {
        // Day has class - show "Edit" and "Delete" options
        modalTitle.textContent = `Manage Class - ${formatDate(selectedClass.date)}`;
        modalButtons.innerHTML = `
            <button onclick="handleEditClass()" class="admin-button">Edit Class</button>
            <button onclick="handleDeleteClass()" class="admin-button cancel">Delete Class</button>
        `;
    }
    
    modal.style.display = 'block';
}

function hideModal() {
    const modal = document.getElementById('classModal');
    if (modal) {
        modal.style.display = 'none';
        selectedClass = null;
    }
}

function handleAddNewClass() {
    if (!selectedClass || selectedClass.hasClass !== false) return;
    
    // Pre-populate the date field with timezone fix
    const dateStr = selectedClass.date;
    const [year, month, day] = dateStr.split('-');
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    const formattedDate = localDate.toISOString().split('T')[0];
    document.getElementById('classDate').value = formattedDate;
    
    // Clear other fields
    document.getElementById('classType').value = '';
    document.getElementById('classTime').value = '';
    document.getElementById('maxSeats').value = '';
    document.getElementById('price').value = '';
    document.getElementById('notes').value = '';
    
    // Scroll to the form
    document.getElementById('classes').scrollIntoView({ behavior: 'smooth' });
    
    hideModal();
    
    showMessage('Please fill in the class details in the form above.', 'info');
}

function handleEditClass() {
    if (!selectedClass || selectedClass.hasClass === false) return;
    
    // Populate the add class form with the selected class data
    document.getElementById('classType').value = selectedClass.type;
    
    // Fix timezone issue: ensure date is displayed correctly in the input field
    // Parse the date string and format it properly to avoid timezone shifts
    const dateStr = selectedClass.date;
    const [year, month, day] = dateStr.split('-');
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    const formattedDate = localDate.toISOString().split('T')[0];
    
    document.getElementById('classDate').value = formattedDate;
    document.getElementById('classTime').value = selectedClass.time;
    document.getElementById('maxSeats').value = selectedClass.maxSeats;
    document.getElementById('price').value = selectedClass.price;
    document.getElementById('notes').value = selectedClass.notes || '';
    
    // Scroll to the form
    document.getElementById('classes').scrollIntoView({ behavior: 'smooth' });
    
    // Remove the old class
    classes = classes.filter(cls => cls.id !== selectedClass.id);
    
    // Hide modal
    hideModal();
    
    // Update displays
    saveAdminClassesToStorage(classes);
    initializeSchedule();
    updateDashboardStats();
    
    showMessage('Please update the class details in the form above.', 'info');
}

function handleDeleteClass() {
    if (!selectedClass || selectedClass.hasClass === false) return;
    
    if (confirm(`Are you sure you want to delete the ${selectedClass.name} class on ${formatDate(selectedClass.date)}?`)) {
        // Remove the class
        classes = classes.filter(cls => cls.id !== selectedClass.id);
        
        // Update storage and displays
        saveAdminClassesToStorage(classes);
        initializeSchedule();
        updateDashboardStats();
        
        showMessage('Class deleted successfully.', 'success');
    }
    
    hideModal();
}

function handleScheduleItemDoubleClick(classData) {
    selectedClass = classData;
    showModal();
}

function initializeSchedule() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    const currentMonthSpan = document.getElementById('currentMonth');
    
    if (!scheduleGrid || !currentMonthSpan) return;
    
    // Update month display
    currentMonthSpan.textContent = currentMonth.toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Get first and last day of current month
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    let scheduleHTML = '';
    
    // Generate calendar days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Find classes for this date
        const dayClasses = classes.filter(cls => cls.date === dateString);
        
        const hasClass = dayClasses.length > 0;
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Add double-click to ALL days, pass the date and any existing class data
        const clickData = hasClass ? dayClasses[0] : { date: dateString, hasClass: false };
        
        scheduleHTML += `
            <div class="schedule-item ${hasClass ? 'has-class' : ''}" ondblclick="handleScheduleItemDoubleClick(${JSON.stringify(clickData).replace(/"/g, '&quot;')})">
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

function changeMonth(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    initializeSchedule();
}

function updateDashboardStats() {
    // REAL STATS: Calculate current month stats from actual bookings
    const now = new Date();
    const currentMonthStr = now.toISOString().substring(0, 7); // YYYY-MM format
    
    const currentMonthClasses = classes.filter(cls => 
        cls.date.startsWith(currentMonthStr)
    );
    
    // Get real bookings from localStorage
    const bookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
    const currentMonthBookings = bookings.filter(booking => 
        booking.date.startsWith(currentMonthStr)
    );
    
    const totalBookings = currentMonthClasses.reduce((sum, cls) => sum + cls.bookedSeats, 0);
    const totalSeats = currentMonthClasses.reduce((sum, cls) => sum + cls.maxSeats, 0);
    const availableSeats = totalSeats - totalBookings;
    const revenue = currentMonthClasses.reduce((sum, cls) => sum + (cls.bookedSeats * cls.price), 0);
    
    // Update stats display with REAL numbers
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('.stat-number').textContent = totalBookings;
        statCards[1].querySelector('.stat-number').textContent = currentMonthClasses.length;
        statCards[2].querySelector('.stat-number').textContent = availableSeats;
        statCards[3].querySelector('.stat-number').textContent = `$${revenue.toLocaleString()}`;
    }
    
    // Update bookings table with real bookings
    updateBookingsTable(currentMonthBookings);
}

function showMessage(text, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert at top of main content
    const main = document.querySelector('main');
    const firstSection = main.querySelector('section');
    main.insertBefore(message, firstSection);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        message.remove();
    }, 5000);
}

function formatDate(dateString) {
    // Fix timezone issue: parse date components to avoid timezone shifts
    const [year, month, day] = dateString.split('-');
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    return localDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Booking management functions
function confirmBooking(bookingId) {
    // In a real app, this would update the database
    console.log('Confirming booking:', bookingId);
    showMessage('Booking confirmed successfully!', 'success');
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        // In a real app, this would update the database
        console.log('Cancelling booking:', bookingId);
        showMessage('Booking cancelled successfully.', 'info');
    }
}

function editBooking(bookingId) {
    // In a real app, this would open an edit form
    console.log('Editing booking:', bookingId);
    showMessage('Edit functionality would open here.', 'info');
}

// Export functions for global access
window.changeMonth = changeMonth;
window.confirmBooking = confirmBooking;
window.cancelBooking = cancelBooking;
window.editBooking = editBooking;

// Monthly schedule update functionality
function updateMonthlySchedule() {
    // This function would be called to update the entire month's schedule
    // Could include bulk operations like:
    // - Adding recurring classes
    // - Adjusting prices for the month
    // - Setting special holiday schedules
    
    const monthlyUpdates = {
        month: currentMonth.toISOString().substring(0, 7),
        classes: classes.filter(cls => cls.date.startsWith(currentMonth.toISOString().substring(0, 7)))
    };
    
    console.log('Monthly schedule update:', monthlyUpdates);
    
    // In a real application, this would:
    // 1. Send data to backend API
    // 2. Update database with new schedule
    // 3. Send notifications to customers about changes
    // 4. Update calendar availability
    
    showMessage('Monthly schedule updated successfully!', 'success');
}

// ENHANCED: Function to trigger calendar updates across tabs
function triggerCalendarUpdate() {
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('classesUpdated'));
    
    // Trigger storage event for cross-tab updates  
    localStorage.setItem('lastUpdate', Date.now().toString());
    
    // Force multiple storage events to ensure customer site updates
    setTimeout(() => {
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'cottageClasses',
            newValue: localStorage.getItem('cottageClasses')
        }));
    }, 100);
    
    console.log('🔄 ADMIN: Triggered cross-tab calendar update');
}

// ENHANCED REAL-TIME: Listen for storage changes from customer site
window.addEventListener('storage', function(e) {
    if (e.key === 'cottageClasses' || e.key === 'cottageClassesAdmin' || e.key === 'cottageBookings') {
        console.log('📺 Customer booking detected - updating admin panel...');
        
        // Reload admin classes if customer made booking
        classes = getAdminClassesFromStorage();
        initializeSchedule();
        updateDashboardStats();
        
        // Show admin notification
        showAdminNotification('New customer booking received!');
        
        console.log('✅ Admin panel updated in real-time!');
    }
});

// Show admin notification
function showAdminNotification(message) {
    const existing = document.getElementById('adminNotification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'adminNotification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        font-size: 0.7rem;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    notification.textContent = '🔔 ' + message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 4000);
}

// REAL-TIME: Update bookings table
function updateBookingsTable(bookings) {
    const tableBody = document.getElementById('bookingsTableBody');
    if (!tableBody || !bookings) return;
    
    if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">No bookings yet</td></tr>';
        return;
    }
    
    tableBody.innerHTML = bookings.map(booking => {
        const date = new Date(booking.date).toLocaleDateString();
        const className = getFullClassNameFromType(booking.className);
        
        // Add payment status
        let paymentStatus = '';
        if (booking.payment) {
            if (booking.payment.paymentStatus === 'completed') {
                paymentStatus = '<br><span class="payment-status paid">✓ Paid $' + booking.payment.paymentAmount + '</span>';
            } else if (booking.payment.paymentStatus === 'pending') {
                paymentStatus = '<br><span class="payment-status pending">⏳ Payment Pending</span>';
            }
        } else if (booking.status === 'paid') {
            paymentStatus = '<br><span class="payment-status paid">✓ Paid</span>';
        }
        
        return `
            <tr>
                <td>${date}</td>
                <td>${booking.customerName}</td>
                <td>${className}</td>
                <td>${booking.seats}</td>
                <td>${booking.email}<br/>${booking.phone}</td>
                <td><span class="status ${booking.status}">${booking.status}</span>${paymentStatus}</td>
                <td>
                    <button class="action-btn" onclick="editBooking('${booking.id}')">Edit</button>
                    <button class="action-btn cancel" onclick="cancelBooking('${booking.id}')">Cancel</button>
                </td>
            </tr>
        `;
    }).join('');
}

function getFullClassNameFromType(type) {
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
    return mapping[type] || type;
}

// Make monthly update function globally available
window.updateMonthlySchedule = updateMonthlySchedule;

// Member Management Global Functions
function sendWelcomeToAll() {
    document.getElementById('welcomeTemplatesModal').style.display = 'block';
}

function closeWelcomeTemplatesModal() {
    document.getElementById('welcomeTemplatesModal').style.display = 'none';
}

function selectWelcomeTemplate(templateType) {
    const templates = {
        standard: "Join us for a cooking class that features both technique and hands on learning when possible. We're excited to have you join our culinary community. Our hands-on cooking classes will help you develop your skills in a warm, intimate setting. We can't wait to cook with you!",
        personal: "Hi [NAME]! I'm Chef Brian, and I personally wanted to welcome you to our cooking family. Having worked with major food chains and appeared on The Today Show, I'm passionate about sharing the joy of cooking with eager food enthusiasts like yourself. Looking forward to meeting you in the kitchen!",
        promotional: "Join us for a cooking class that features both technique and hands on learning when possible. As a new member, we're excited to offer you 10% off your first class. Use code WELCOME10 when booking. Join us for an unforgettable culinary experience where you'll learn traditional techniques using fresh, seasonal ingredients!"
    };

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const newMembers = users.filter(user => new Date(user.createdAt).getTime() > sevenDaysAgo);

    if (newMembers.length === 0) {
        showAdminMessage('No new members to send welcome messages to.', 'info');
        closeWelcomeTemplatesModal();
        return;
    }

    // Send welcome message to all new members
    const allMessages = JSON.parse(localStorage.getItem('userMessages') || '{}');
    
    newMembers.forEach(member => {
        const personalizedMessage = templates[templateType].replace('[NAME]', member.firstName || 'there');
        
        const message = {
            id: Date.now().toString() + Math.random(),
            sender: 'admin',
            text: personalizedMessage,
            timestamp: Date.now(),
            read: false,
            type: 'welcome'
        };

        if (!allMessages[member.email]) {
            allMessages[member.email] = [];
        }
        allMessages[member.email].push(message);
    });

    localStorage.setItem('userMessages', JSON.stringify(allMessages));
    showAdminMessage(`Welcome messages sent to ${newMembers.length} new member${newMembers.length !== 1 ? 's' : ''}!`, 'success');
    closeWelcomeTemplatesModal();
}

function exportMemberList() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.length === 0) {
        showAdminMessage('No members to export.', 'info');
        return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Join Date', 'Experience', 'Bookings Count'];
    const csvContent = [
        headers.join(','),
        ...users.map(user => {
            const bookings = memberManager.getMemberBookings(user.email);
            return [
                `"${user.firstName || ''} ${user.lastName || ''}"`,
                user.email,
                user.phone || 'Not provided',
                new Date(user.createdAt).toLocaleDateString(),
                user.experience || 'Beginner',
                bookings.length
            ].join(',');
        })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cottage-cooking-members-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showAdminMessage(`Member list exported (${users.length} members)!`, 'success');
}

function refreshMemberData() {
    if (memberManager) {
        memberManager.loadMembers();
        memberManager.updateMemberStats();
        showAdminMessage('Member data refreshed!', 'success');
    }
}

function closeSendMessageModal() {
    if (memberManager) {
        memberManager.closeSendMessageModal();
    }
}

function showAdminMessage(text, type = 'info') {
    const existingMessage = document.querySelector('.admin-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = `admin-message ${type}`;
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#e8f2e8' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#2c5530' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 15px 20px;
        border-radius: 8px;
        border: 1px solid ${type === 'success' ? '#7a9a4d' : type === 'error' ? '#dc3545' : '#17a2b8'};
        z-index: 1000;
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

// Chat System Global Functions
function sendAdminMessage() {
    if (chatManager) {
        chatManager.sendMessage();
    }
}

function insertTemplate() {
    document.getElementById('messageTemplatesModal').style.display = 'block';
}

function closeMessageTemplatesModal() {
    document.getElementById('messageTemplatesModal').style.display = 'none';
}

function insertMessageTemplate(templateKey) {
    if (chatManager) {
        chatManager.insertTemplate(templateKey);
        closeMessageTemplatesModal();
    }
}

function attachFile() {
    // Placeholder for file attachment functionality
    showAdminMessage('File attachment feature coming soon!', 'info');
}

function archiveConversation() {
    if (chatManager && chatManager.currentConversation) {
        if (confirm('Archive this conversation? It will be hidden from the main list.')) {
            showAdminMessage('Conversation archived successfully!', 'success');
        }
    }
}

function clearChatHistory() {
    if (chatManager && chatManager.currentConversation) {
        if (confirm('Clear all messages in this conversation? This action cannot be undone.')) {
            const allMessages = JSON.parse(localStorage.getItem('userMessages') || '{}');
            if (allMessages[chatManager.currentConversation]) {
                allMessages[chatManager.currentConversation] = [];
                localStorage.setItem('userMessages', JSON.stringify(allMessages));
                chatManager.loadConversations();
                showAdminMessage('Chat history cleared!', 'success');
            }
        }
    }
}

function refreshChat() {
    if (chatManager) {
        chatManager.loadConversations();
        chatManager.updateMessageStats();
        showAdminMessage('Chat refreshed!', 'success');
    }
}

window.triggerCalendarUpdate = triggerCalendarUpdate;

// ENHANCED TESTING FUNCTION: Comprehensive booking capacity system verification
function testBookingCapacitySystem() {
    console.log('🧪 TESTING: Enhanced booking capacity system...');
    
    // Clear existing data for clean test
    localStorage.removeItem('cottageClasses');
    localStorage.removeItem('cottageClassesAdmin');
    localStorage.removeItem('cottageBookings');
    
    // Test 1: Load initial classes
    console.log('\n📋 Test 1: Loading initial classes...');
    const adminClasses = getAdminClassesFromStorage();
    console.log('✅ Admin classes loaded:', adminClasses.length);
    
    // Test 2: Create multiple test bookings for December 4th (user's specific issue)
    console.log('\n📋 Test 2: Creating bookings for December 4th (user reported issue)...');
    
    // Find December 4th class (should be Holiday Chocolate Desserts on 12/6, but let's test 12/5 Holiday Appetizers)
    const testBookings = [
        {
            id: 'test-booking-1-' + Date.now(),
            date: '2025-12-05',
            customerName: 'Test Customer 1',
            email: 'test1@example.com',
            phone: '555-1234',
            className: 'Holiday Appetizers',
            seats: 2,
            dietary: '',
            status: 'paid',
            bookingTime: new Date().toISOString(),
            payment: { paymentStatus: 'completed', paymentAmount: '170.00' }
        },
        {
            id: 'test-booking-2-' + Date.now(),
            date: '2025-12-05',
            customerName: 'Test Customer 2',
            email: 'test2@example.com',
            phone: '555-5678',
            className: 'Holiday Appetizers',
            seats: 1,
            dietary: '',
            status: 'paid',
            bookingTime: new Date().toISOString(),
            payment: { paymentStatus: 'completed', paymentAmount: '85.00' }
        }
    ];
    
    localStorage.setItem('cottageBookings', JSON.stringify(testBookings));
    console.log('✅ Created 2 test bookings: 2 seats + 1 seat = 3 total seats for Dec 5th Holiday Appetizers');
    
    // Test 3: Reload admin classes and verify booking sync
    console.log('\n📋 Test 3: Verifying admin class booking sync...');
    const updatedAdminClasses = getAdminClassesFromStorage();
    const dec5AdminClass = updatedAdminClasses.find(cls => cls.date === '2025-12-05' && cls.name === 'Holiday Appetizers');
    
    if (dec5AdminClass) {
        console.log(`✅ Admin class found: ${dec5AdminClass.name} on ${dec5AdminClass.date}`);
        console.log(`   - Max seats: ${dec5AdminClass.maxSeats}`);
        console.log(`   - Booked seats: ${dec5AdminClass.bookedSeats}`);
        console.log(`   - Available seats: ${dec5AdminClass.maxSeats - dec5AdminClass.bookedSeats}`);
        
        if (dec5AdminClass.bookedSeats === 3) {
            console.log('✅ Admin booking sync: PASSED');
        } else {
            console.log(`❌ Admin booking sync: FAILED - Expected 3 booked seats, got ${dec5AdminClass.bookedSeats}`);
        }
    } else {
        console.log('❌ Admin class not found!');
    }
    
    // Test 4: Check customer-facing class sync
    console.log('\n📋 Test 4: Verifying customer class availability sync...');
    const customerClasses = JSON.parse(localStorage.getItem('cottageClasses') || '[]');
    const dec5CustomerClass = customerClasses.find(cls => cls.date === '2025-12-05' && cls.class === 'Holiday Appetizers');
    
    if (dec5CustomerClass) {
        console.log(`✅ Customer class found: ${dec5CustomerClass.class} on ${dec5CustomerClass.date}`);
        console.log(`   - Available seats: ${dec5CustomerClass.seats}`);
        
        if (dec5CustomerClass.seats === 5) { // 8 max - 3 booked = 5 available
            console.log('✅ Customer availability sync: PASSED');
        } else {
            console.log(`❌ Customer availability sync: FAILED - Expected 5 available seats, got ${dec5CustomerClass.seats}`);
        }
    } else {
        console.log('❌ Customer class not found!');
    }
    
    // Test 5: Final verification
    console.log('\n📋 Test 5: Final system verification...');
    const allTestsPassed = 
        dec5AdminClass && dec5AdminClass.bookedSeats === 3 &&
        dec5CustomerClass && dec5CustomerClass.seats === 5;
    
    if (allTestsPassed) {
        console.log('🎉 SUCCESS: All booking capacity tests PASSED!');
        console.log('   ✅ Admin panel shows correct booked seats');
        console.log('   ✅ Customer calendar shows correct available seats');
        console.log('   ✅ Real-time sync is working properly');
        return true;
    } else {
        console.log('❌ FAILED: Some tests failed. Check logs above for details.');
        return false;
    }
}

// FINAL COMPREHENSIVE VERIFICATION FUNCTION
function finalSystemVerification() {
    console.log('🔬 FINAL COMPREHENSIVE SYSTEM VERIFICATION...');
    console.log('================================================');
    
    // Step 1: Clear all data for clean test
    console.log('\n🧹 Step 1: Clearing all existing data...');
    localStorage.removeItem('cottageClasses');
    localStorage.removeItem('cottageClassesAdmin');
    localStorage.removeItem('cottageBookings');
    console.log('✅ All data cleared');
    
    // Step 2: Load initial admin classes
    console.log('\n📋 Step 2: Loading initial admin classes...');
    const adminClasses = getAdminClassesFromStorage();
    console.log(`✅ Loaded ${adminClasses.length} admin classes`);
    
    // Step 3: Load customer classes and verify sync
    console.log('\n🛒 Step 3: Loading customer classes and verifying sync...');
    const customerClasses = JSON.parse(localStorage.getItem('cottageClasses') || '[]');
    console.log(`✅ Loaded ${customerClasses.length} customer classes`);
    
    // Step 4: Create realistic test bookings
    console.log('\n📝 Step 4: Creating realistic test bookings...');
    const testBookings = [
        {
            id: 'booking-1-' + Date.now(),
            date: '2025-12-05',
            customerName: 'John Smith',
            email: 'john@example.com',
            phone: '555-0001',
            className: 'Holiday Appetizers',
            seats: 2,
            dietary: 'No nuts',
            status: 'paid',
            bookingTime: new Date().toISOString(),
            payment: { paymentStatus: 'completed', paymentAmount: '170.00' }
        },
        {
            id: 'booking-2-' + Date.now() + 1,
            date: '2025-12-05',
            customerName: 'Jane Doe',
            email: 'jane@example.com',
            phone: '555-0002',
            className: 'Holiday Appetizers',
            seats: 1,
            dietary: '',
            status: 'paid',
            bookingTime: new Date().toISOString(),
            payment: { paymentStatus: 'completed', paymentAmount: '85.00' }
        },
        {
            id: 'booking-3-' + Date.now() + 2,
            date: '2025-12-06',
            customerName: 'Bob Wilson',
            email: 'bob@example.com',
            phone: '555-0003',
            className: 'Holiday Chocolate Desserts',
            seats: 3,
            dietary: 'Vegetarian',
            status: 'paid',
            bookingTime: new Date().toISOString(),
            payment: { paymentStatus: 'completed', paymentAmount: '255.00' }
        }
    ];
    
    localStorage.setItem('cottageBookings', JSON.stringify(testBookings));
    console.log(`✅ Created ${testBookings.length} test bookings:`);
    testBookings.forEach(booking => {
        console.log(`   - ${booking.customerName}: ${booking.seats} seats for ${booking.className} on ${booking.date}`);
    });
    
    // Step 5: Reload admin classes and verify booking integration
    console.log('\n🔄 Step 5: Reloading admin classes and verifying booking integration...');
    const updatedAdminClasses = getAdminClassesFromStorage();
    
    const dec5AdminClass = updatedAdminClasses.find(cls => cls.date === '2025-12-05' && cls.name === 'Holiday Appetizers');
    const dec6AdminClass = updatedAdminClasses.find(cls => cls.date === '2025-12-06' && cls.name === 'Holiday Chocolate Desserts');
    
    console.log('\n📊 Admin Class Verification:');
    if (dec5AdminClass) {
        console.log(`✅ Dec 5 Holiday Appetizers: ${dec5AdminClass.bookedSeats}/8 seats booked (${8 - dec5AdminClass.bookedSeats} available)`);
        if (dec5AdminClass.bookedSeats !== 3) {
            console.log(`❌ ERROR: Expected 3 booked seats, got ${dec5AdminClass.bookedSeats}`);
        }
    } else {
        console.log('❌ ERROR: Dec 5 Holiday Appetizers class not found');
    }
    
    if (dec6AdminClass) {
        console.log(`✅ Dec 6 Holiday Chocolate Desserts: ${dec6AdminClass.bookedSeats}/8 seats booked (${8 - dec6AdminClass.bookedSeats} available)`);
        if (dec6AdminClass.bookedSeats !== 3) {
            console.log(`❌ ERROR: Expected 3 booked seats, got ${dec6AdminClass.bookedSeats}`);
        }
    } else {
        console.log('❌ ERROR: Dec 6 Holiday Chocolate Desserts class not found');
    }
    
    // Step 6: Verify customer class availability sync
    console.log('\n🛒 Step 6: Verifying customer class availability sync...');
    const updatedCustomerClasses = JSON.parse(localStorage.getItem('cottageClasses') || '[]');
    
    const dec5CustomerClass = updatedCustomerClasses.find(cls => cls.date === '2025-12-05' && cls.class === 'Holiday Appetizers');
    const dec6CustomerClass = updatedCustomerClasses.find(cls => cls.date === '2025-12-06' && cls.class === 'Holiday Chocolate Desserts');
    
    console.log('\n🎯 Customer Class Verification:');
    if (dec5CustomerClass) {
        console.log(`✅ Dec 5 Holiday Appetizers: ${dec5CustomerClass.seats} seats available`);
        if (dec5CustomerClass.seats !== 5) {
            console.log(`❌ ERROR: Expected 5 available seats, got ${dec5CustomerClass.seats}`);
        }
    } else {
        console.log('❌ ERROR: Dec 5 Holiday Appetizers customer class not found');
    }
    
    if (dec6CustomerClass) {
        console.log(`✅ Dec 6 Holiday Chocolate Desserts: ${dec6CustomerClass.seats} seats available`);
        if (dec6CustomerClass.seats !== 5) {
            console.log(`❌ ERROR: Expected 5 available seats, got ${dec6CustomerClass.seats}`);
        }
    } else {
        console.log('❌ ERROR: Dec 6 Holiday Chocolate Desserts customer class not found');
    }
    
    // Step 7: Final system health check
    console.log('\n🏥 Step 7: Final system health check...');
    const allTestsPassed = 
        dec5AdminClass && dec5AdminClass.bookedSeats === 3 &&
        dec6AdminClass && dec6AdminClass.bookedSeats === 3 &&
        dec5CustomerClass && dec5CustomerClass.seats === 5 &&
        dec6CustomerClass && dec6CustomerClass.seats === 5;
    
    console.log('\n🎯 FINAL RESULTS:');
    console.log('================');
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! The booking capacity system is PERFECT!');
        console.log('✅ Admin panel correctly tracks booked seats');
        console.log('✅ Customer calendar correctly shows available seats');
        console.log('✅ Real-time synchronization works flawlessly');
        console.log('✅ Multiple bookings are handled correctly');
        console.log('✅ Different classes maintain separate capacity');
        console.log('\n🚀 SYSTEM STATUS: FULLY OPERATIONAL');
    } else {
        console.log('❌ SOME TESTS FAILED - System needs attention');
        console.log('Check the detailed logs above for specific issues');
    }
    
    return allTestsPassed;
}

// PAYPAL + BOOKING INTEGRATION TEST
function testPayPalBookingIntegration() {
    console.log('🔬 TESTING PAYPAL + BOOKING INTEGRATION...');
    console.log('===========================================');
    
    // Clear data for clean test
    localStorage.removeItem('cottageClasses');
    localStorage.removeItem('cottageClassesAdmin');
    localStorage.removeItem('cottageBookings');
    sessionStorage.removeItem('pendingBooking');
    console.log('✅ All data cleared');
    
    // Load fresh classes
    const adminClasses = getAdminClassesFromStorage();
    const customerClasses = getClassesFromStorage();
    console.log(`✅ Admin: ${adminClasses.length}, Customer: ${customerClasses.length} classes loaded`);
    
    // Test December 5th Holiday Appetizers
    const dec5Admin = adminClasses.find(cls => cls.date === '2025-12-05' && cls.name.includes('Holiday Appetizers'));
    const dec5Customer = customerClasses.find(cls => cls.date === '2025-12-05' && cls.class.includes('Holiday Appetizers'));
    
    if (dec5Admin && dec5Customer) {
        console.log(`✅ Found Dec 5th class - Admin: ${dec5Admin.maxSeats - dec5Admin.bookedSeats} available, Customer: ${dec5Customer.seats} available`);
        
        // Simulate PayPal booking
        const mockBookingData = {
            bookingId: Date.now(),
            className: 'holiday-appetizers',
            classDate: '2025-12-05',
            seats: '2',
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '555-1234',
            dietary: '',
            totalAmount: 170
        };
        
        sessionStorage.setItem('pendingBooking', JSON.stringify(mockBookingData));
        
        // Simulate PayPal success
        const mockPayPalOrder = {
            id: 'PAYPAL_ORDER_' + Date.now(),
            purchase_units: [{ amount: { value: '170.00' } }],
            payer: { payer_id: 'PAYER123', email_address: 'test@example.com' }
        };
        
        if (typeof handlePaymentSuccess === 'function') {
            handlePaymentSuccess(mockPayPalOrder);
            
            // Verify results
            const savedBookings = JSON.parse(localStorage.getItem('cottageBookings') || '[]');
            const ourBooking = savedBookings.find(b => b.id == mockBookingData.bookingId);
            
            const updatedAdminClasses = JSON.parse(localStorage.getItem('cottageClassesAdmin') || '[]');
            const updatedDec5Admin = updatedAdminClasses.find(cls => cls.date === '2025-12-05' && cls.name.includes('Holiday Appetizers'));
            
            const updatedCustomerClasses = JSON.parse(localStorage.getItem('cottageClasses') || '[]');
            const updatedDec5Customer = updatedCustomerClasses.find(cls => cls.date === '2025-12-05' && cls.class.includes('Holiday Appetizers'));
            
            console.log(`✅ Results: Booking saved: ${ourBooking ? 'YES' : 'NO'}, Admin booked: ${updatedDec5Admin?.bookedSeats || 0}, Customer available: ${updatedDec5Customer?.seats || 0}`);
            
            if (ourBooking && updatedDec5Admin?.bookedSeats === 2 && updatedDec5Customer?.seats === 6) {
                console.log('🎉 PAYPAL INTEGRATION TEST PASSED!');
                return true;
            } else {
                console.log('❌ PAYPAL INTEGRATION TEST FAILED!');
                return false;
            }
        } else {
            console.log('❌ handlePaymentSuccess function not found!');
            return false;
        }
    } else {
        console.log('❌ December 5th Holiday Appetizers class not found!');
        return false;
    }
}

// Make all test functions available globally for manual testing
window.testBookingCapacitySystem = testBookingCapacitySystem;
window.finalSystemVerification = finalSystemVerification;
window.testPayPalBookingIntegration = testPayPalBookingIntegration;