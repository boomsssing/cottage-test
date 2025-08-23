# PayPal Integration Setup Guide

## Overview
This guide will help you set up PayPal payment processing for Brian Averna Cottage Cooking's seat booking system.

## Prerequisites
- A PayPal Business account
- Access to PayPal Developer Dashboard
- Your website domain

## Step 1: Create PayPal Developer Account

1. Go to [PayPal Developer Portal](https://developer.paypal.com/)
2. Sign in with your PayPal Business account
3. Navigate to "Apps & Credentials"

## Step 2: Create a PayPal App

1. Click "Create App"
2. Give your app a name (e.g., "Cottage Cooking Bookings")
3. Select "Business" account type
4. Choose "Web" as the platform
5. Click "Create App"

## Step 3: Get Your Client ID

1. After creating the app, you'll see your Client ID
2. Copy this Client ID - you'll need it for the next step

## Step 4: Configure PayPal Integration

1. Open the file `paypal-integration.js`
2. Find this line:
   ```javascript
   this.clientId = 'YOUR_PAYPAL_CLIENT_ID'; // Replace with your actual PayPal Client ID
   ```
3. Replace `'YOUR_PAYPAL_CLIENT_ID'` with your actual Client ID from Step 3

## Step 5: Configure Return URLs

1. In your PayPal Developer Dashboard, go to your app settings
2. Add these return URLs:
   - Success URL: `https://yourdomain.com/payment-success.html`
   - Cancel URL: `https://yourdomain.com/payment-cancelled.html`
3. Replace `yourdomain.com` with your actual domain

## Step 6: Test the Integration

### Sandbox Testing (Recommended First)
1. Use PayPal's sandbox environment for testing
2. Create sandbox buyer and seller accounts in PayPal Developer Dashboard
3. Test the complete booking flow with sandbox accounts

### Live Environment
1. Once testing is complete, switch to live environment
2. Update your Client ID to the live version
3. Test with real PayPal accounts

## Step 7: Monitor Payments

### User Dashboard
- Users can see payment status in their booking history
- Payment confirmations are automatically sent
- Booking status updates to "paid" after successful payment

### Admin Dashboard
- Admins can see payment status for all bookings
- Payment notifications appear in real-time
- Revenue tracking is automatically updated

## Features Included

### Payment Processing
- ✅ Secure PayPal payment processing
- ✅ Real-time payment status updates
- ✅ Automatic booking confirmation
- ✅ Payment error handling
- ✅ Cancellation support

### User Experience
- ✅ Real-time payment summary
- ✅ Clear payment instructions
- ✅ Success and cancellation pages
- ✅ Payment status in user dashboard

### Admin Features
- ✅ Payment status in admin dashboard
- ✅ Payment notifications
- ✅ Revenue tracking
- ✅ Booking management with payment info

## Security Considerations

1. **Client-Side Security**: The PayPal SDK handles sensitive payment data
2. **Server-Side Validation**: Consider adding server-side payment verification
3. **HTTPS Required**: Ensure your website uses HTTPS in production
4. **Webhook Integration**: For production, consider adding PayPal webhooks for additional security

## Troubleshooting

### Common Issues

1. **PayPal Button Not Appearing**
   - Check that your Client ID is correct
   - Ensure PayPal SDK is loading properly
   - Check browser console for errors

2. **Payment Not Processing**
   - Verify return URLs are configured correctly
   - Check PayPal account status
   - Ensure sufficient funds in test accounts

3. **Booking Not Updating**
   - Check localStorage for booking data
   - Verify payment success callback is working
   - Check admin dashboard for notifications

### Debug Mode

To enable debug logging, add this to your browser console:
```javascript
localStorage.setItem('paypalDebug', 'true');
```

## Support

For technical support:
- Email: brianwaverna@gmail.com
- Phone: (203) 545-9969

For PayPal-specific issues:
- PayPal Developer Support: https://developer.paypal.com/support/
- PayPal Business Support: https://www.paypal.com/us/smarthelp/contact-us

## File Structure

```
├── paypal-integration.js      # Main PayPal integration
├── payment-success.html       # Success page
├── payment-cancelled.html     # Cancellation page
├── index.html                 # Main booking form (updated)
├── script.js                  # Booking logic (updated)
├── user-dashboard.js          # User dashboard (updated)
├── admin.js                   # Admin dashboard (updated)
└── styles.css                 # Payment styling (updated)
```

## Next Steps

1. Complete PayPal account setup
2. Test in sandbox environment
3. Configure live environment
4. Monitor payments and user feedback
5. Consider additional features like:
   - Email payment confirmations
   - Payment analytics
   - Refund processing
   - Subscription payments

## Important Notes

- Keep your Client ID secure
- Regularly monitor payment logs
- Test thoroughly before going live
- Have a backup payment method ready
- Consider PCI compliance for additional security
