#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to print messages
print_message() {
  echo -e "${GREEN}[INFO] $1${NC}"
}

print_error() {
  echo -e "${RED}[ERROR] $1${NC}"
  exit 1
}

# Check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Install Node.js (if not installed)
install_node() {
  if ! command_exists node; then
    print_message "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    print_message "Node.js is already installed: $(node -v)"
  fi
}

# Install npm (comes with Node.js, but ensure it's available)
install_npm() {
  if ! command_exists npm; then
    print_error "npm not found after installing Node.js. Please install Node.js manually."
  else
    print_message "npm is already installed: $(npm -v)"
  fi
}

# Install dfx (DFINITY Canister SDK)
install_dfx() {
  if ! command_exists dfx; then
    print_message "Installing dfx (DFINITY Canister SDK)..."
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
  else
    print_message "dfx is already installed: $(dfx --version)"
  fi
}

# Install Firebase CLI
install_firebase() {
  if ! command_exists firebase; then
    print_message "Installing Firebase CLI..."
    npm install -g firebase-tools
  else
    print_message "Firebase CLI is already installed: $(firebase --version)"
  fi
}

# Install project dependencies
install_project_deps() {
  print_message "Installing project dependencies..."
  npm install
}

# Install backend server dependencies (for Stripe)
install_server_deps() {
  print_message "Installing backend server dependencies..."
  cd server
  npm install
  cd ..
}

# Main setup function
main() {
  print_message "Starting setup for nimbus.ai..."

  # Install Node.js and npm
  install_node
  install_npm

  # Install dfx
  install_dfx

  # Install Firebase CLI
  install_firebase

  # Install project dependencies
  install_project_deps

  # Install backend server dependencies
  if [ -d "server" ]; then
    install_server_deps
  else
    print_message "Backend server directory not found. Skipping server dependency installation."
  fi

  print_message "Setup complete! Follow the instructions in README.md to start the app."
}
