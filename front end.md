This file summarizes the frontend requirements and discussion for your Smart Secure Home Automation System.

# Smart Secure Home Automation System – Frontend Requirements

## 1. Login Page

**Fields:**
- Email (predefined, not user-registered)
- Password (predefined, not user-registered)
- Device ID (user must enter, validated against DB)

**Behavior:**
- No registration page.
- User must enter all three fields to log in.
- On successful login, user is taken to the dashboard.
- If login fails (wrong email, password, or device ID), show a clear error.
- **Forgot Password:** Option to reset password (triggers password reset flow).

---

## 2. Dashboard (Post-Login)

### a. User Profile Settings
- **Display:**  
  - Email (editable)
  - Device ID (displayed, not editable)
  - Device Info (displayed, not editable)
- **Change Password:**  
  - Old password (input)
  - New password (input)
  - Confirm new password (input)
  - Save button
  - On success: log out user, require login with new password

### b. Device Status
- Show device status:  
  - Online (green indicator, text)
  - Offline (red indicator, text)

### c. Alerts & Notifications
- **Email/SMS Alerts:**  
  - Notify user when device goes online or offline
- **Sound Notification:**  
  - Play a sound when device status changes (online/offline)

### d. Sign Out
- Button to log out user

---

## 3. Password Reset Flow

- On login page, “Forgot Password?” link
- User enters email and device ID
- System verifies and sends reset instructions (email/SMS)
- User sets new password via secure link or code

---

## 4. UI/UX Notes

- **No registration, no device editing:** All users and devices are pre-provisioned.
- **Device ID is always visible but never editable.**
- **Device info is visible but not editable.**
- **Profile settings are limited to email and password change.**
- **Alerts are only for device online/offline status.**
- **Sound notification is only for status changes.**
- **Sign out is always available.**

---

## 5. Questions for Confirmation

1. **Password Reset:** Should the reset be via email, SMS, or both? (Or just one?)
2. **Device Info:** What specific device info should be displayed (e.g., name, model, location)?
3. **Sound Notification:** Should the user be able to mute/unmute this, or is it always on?
4. **Email Editing:** Is email change instant, or does it require confirmation (e.g., via a code sent to the new email)?
5. **Alerts:** Are email/SMS alerts always on, or can the user toggle them? 