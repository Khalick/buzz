#!/bin/bash

# Download Flutter SDK if missing
if [ ! -d "flutter" ]; then
    git clone https://github.com/flutter/flutter.git -b stable
fi

# Add Flutter to PATH
export PATH="$PATH:`pwd`/flutter/bin"

# Build strictly for web and inject environment variables
flutter build web --no-tree-shake-icons --dart-define=SUPABASE_URL=$SUPABASE_URL --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
