#!/bin/bash

cd apps/bot

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "Bot doesn't exist"
  exit 1
fi
pnpm start