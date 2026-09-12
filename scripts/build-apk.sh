#!/bin/bash
# Local APK build script using Capacitor and Gradle
set -e

echo "🚀 Building ShopBase AI Android APK..."

# 1. Build Vite frontend
echo "📦 Step 1: Compiling web assets with Vite..."
npm run build

# 2. Check Android platform
if [ ! -d "android" ]; then
    echo "📱 Step 2: Initializing Capacitor Android platform..."
    npx cap add android
fi

echo "🔄 Step 3: Syncing web bundle to Android..."
npx cap sync android

# 3. Assemble APK using Gradle
echo "⚙️ Step 4: Compiling APK with Gradle..."
cd android
chmod +x gradlew
./gradlew assembleDebug

echo "✅ SUCCESS! Debug APK created at: android/app/build/outputs/apk/debug/app-debug.apk"
