#!/bin/bash

# Download Flutter SDK if missing
if [ ! -d "flutter" ]; then
    git clone https://github.com/flutter/flutter.git -b stable
fi

# Add Flutter to PATH
export PATH="$PATH:`pwd`/flutter/bin"

# Build strictly for web and sensibly inject environment variables if present
BUILD_FLAGS=""
if [ -n "$SUPABASE_URL" ]; then
    BUILD_FLAGS="$BUILD_FLAGS --dart-define=SUPABASE_URL=$SUPABASE_URL"
fi
if [ -n "$SUPABASE_ANON_KEY" ]; then
    BUILD_FLAGS="$BUILD_FLAGS --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
fi

flutter build web --no-tree-shake-icons $BUILD_FLAGS
