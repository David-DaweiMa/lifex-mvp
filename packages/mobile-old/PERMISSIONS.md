# LifeX App Permissions Guide

## Overview
This document outlines the permissions required by the LifeX mobile application and their purposes, as required for App Store submission.

## iOS Permissions

### Location Services
- **Permission**: `NSLocationWhenInUseUsageDescription`
- **Purpose**: Find nearby businesses and provide personalized recommendations
- **Usage**: Used only when the app is active to show location-based content
- **User Control**: Users can deny this permission and still use the app

### Camera Access
- **Permission**: `NSCameraUsageDescription`
- **Purpose**: Take photos for business reviews and profile pictures
- **Usage**: Only when user explicitly chooses to take a photo
- **User Control**: Users can deny this permission and use photo library instead

### Photo Library Access
- **Permission**: `NSPhotoLibraryUsageDescription`
- **Purpose**: Select and upload images for business reviews and profile pictures
- **Usage**: Only when user explicitly chooses to select photos
- **User Control**: Users can deny this permission and still use the app

### Microphone Access
- **Permission**: `NSMicrophoneUsageDescription`
- **Purpose**: Voice features and video recording capabilities
- **Usage**: Only for future voice features (currently not implemented)
- **User Control**: Users can deny this permission

## Android Permissions

### Network Access
- **Permissions**: `INTERNET`, `ACCESS_NETWORK_STATE`
- **Purpose**: Connect to LifeX servers and check network connectivity
- **Required**: Yes (app cannot function without network)

### Location Services
- **Permissions**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- **Purpose**: Find nearby businesses and provide personalized recommendations
- **Usage**: Used only when the app is active
- **User Control**: Users can deny this permission

### Camera and Media
- **Permissions**: `CAMERA`, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`
- **Purpose**: Take photos, access media library, and save images
- **Usage**: Only when user explicitly chooses to use camera or media
- **User Control**: Users can deny these permissions

### Audio Recording
- **Permission**: `RECORD_AUDIO`
- **Purpose**: Voice features and video recording
- **Usage**: Only for future voice features (currently not implemented)
- **User Control**: Users can deny this permission

### Notifications
- **Permission**: `POST_NOTIFICATIONS` (Android 13+)
- **Purpose**: Send push notifications for app updates and business recommendations
- **Usage**: Only for important app notifications
- **User Control**: Users can deny this permission

### System Permissions
- **Permissions**: `VIBRATE`, `WAKE_LOCK`, `RECEIVE_BOOT_COMPLETED`
- **Purpose**: App functionality, notifications, and background processing
- **Required**: Yes (for core app functionality)

## Privacy Compliance

### Data Collection
- **Location Data**: Used only for app functionality (finding nearby businesses)
- **Photos/Videos**: Used only for app functionality (reviews and profiles)
- **User Information**: Name, email, and preferences for account management
- **No Tracking**: App does not track users across other apps or websites

### Data Storage
- **Local Storage**: User preferences and cached data
- **Server Storage**: User account information and business data
- **No Third-Party Sharing**: Data is not shared with third parties

### User Rights
- **Access**: Users can view their data through the app
- **Correction**: Users can update their information
- **Deletion**: Users can delete their account and data
- **Portability**: Users can export their data

## Contact Information
For privacy-related questions:
- Email: privacy@lifex.co.nz
- Website: https://www.lifex.co.nz
- Address: Auckland, New Zealand

## Last Updated
December 19, 2024

