#!/bin/bash

# CAPTIONEER - Local Development Server Launcher
# ================================================

# Colors for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  CAPTIONEER - Batch Image Captioning Tool${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""
echo -e "  ${YELLOW}→${NC} Starting local server..."
echo -e "  ${YELLOW}→${NC} Browser will open automatically."
echo ""
echo -e "  ${GREEN}Press Ctrl+C to stop the server when done.${NC}"
echo ""
echo -e "${CYAN}============================================================${NC}"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Check for Python 3
if command -v python3 &> /dev/null; then
    python3 server.py
elif command -v python &> /dev/null; then
    python server.py
else
    echo ""
    echo -e "  ${RED}[ERROR] Python not found!${NC}"
    echo ""
    echo "  Please install Python 3.x:"
    echo "    macOS:  brew install python3"
    echo "    Ubuntu: sudo apt install python3"
    echo ""
    exit 1
fi
