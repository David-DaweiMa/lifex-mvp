# LifeX App Version Management

## Current Version Information

### Version Number: 1.0.0
- **Major Version**: 1 (Initial release)
- **Minor Version**: 0 (No feature updates)
- **Patch Version**: 0 (No bug fixes)

### Build Numbers
- **iOS Build Number**: 1
- **Android Version Code**: 1

## Version Configuration Files

### 1. expo.json
```json
{
  "expo": {
    "version": "1.0.0",
    "buildNumber": "1",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

### 2. package.json
```json
{
  "version": "1.0.0"
}
```

### 3. Android build.gradle
```gradle
android {
    namespace "co.nz.lifex.app"
    defaultConfig {
        applicationId "co.nz.lifex.app"
        versionCode 1
        versionName "1.0.0"
    }
}
```

## Version Numbering Strategy

### Semantic Versioning (SemVer)
We follow semantic versioning format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes or major feature releases
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes that are backward compatible

### Build Number Strategy
- **iOS Build Number**: Increments with each App Store submission
- **Android Version Code**: Increments with each Play Store submission

## Release Process

### For New Releases
1. Update version number in all configuration files
2. Increment build numbers for both platforms
3. Update this document
4. Create release notes
5. Submit to app stores

### Version Update Checklist
- [ ] expo.json version
- [ ] expo.json buildNumber
- [ ] expo.json ios.buildNumber
- [ ] expo.json android.versionCode
- [ ] package.json version
- [ ] Android build.gradle versionName
- [ ] Android build.gradle versionCode
- [ ] Update VERSION.md
- [ ] Create release notes

## App Store Requirements

### iOS App Store
- **Version**: Must be higher than previous submission
- **Build Number**: Must be unique for each submission
- **Bundle Identifier**: co.nz.lifex.app

### Google Play Store
- **Version Name**: User-facing version (1.0.0)
- **Version Code**: Integer that must increase with each upload
- **Package Name**: co.nz.lifex.app

## Next Release Planning

### Version 1.0.1 (Patch Release)
- Bug fixes and minor improvements
- Build numbers: iOS 2, Android 2

### Version 1.1.0 (Minor Release)
- New features (e.g., AI image generation)
- Build numbers: iOS 3, Android 3

### Version 2.0.0 (Major Release)
- Breaking changes or major redesign
- Build numbers: iOS 4, Android 4

## Contact Information
For version-related questions:
- Email: dev@lifex.co.nz
- Website: https://www.lifex.co.nz

## Last Updated
December 19, 2024

