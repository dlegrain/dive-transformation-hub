#!/bin/bash
# Kill anything on port 5129, then start the app

lsof -ti :5129 | xargs kill -9 2>/dev/null
sleep 0.3
cd "$(dirname "$0")"
open "http://localhost:5129" &
npx vite --port 5129
