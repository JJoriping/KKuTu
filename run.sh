#!/bin/bash
# KKuTu Online Unified Startup Script

echo "Starting KKuTu Online (Web + Game Clusters)..."

# Ensure dependencies are installed in Server/lib
if [ ! -d "Server/lib/node_modules" ]; then
    echo "Dependencies not found in Server/lib. Running npm install..."
    cd Server/lib && npm install
    cd ../..
fi

# Run the headless startup script
node Server/start-headless.js
