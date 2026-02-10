#!/bin/bash

# Growth Card VPS Setup Script for Ubuntu 25.10
# Run this script on your VPS as root (or with sudo)

set -e # Exit on error

echo "🚀 Starting VPS Setup for Growth Card..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# 2. Install Git and Basic Tools
echo "🛠 Installing Git and Curl..."
sudo apt-get install -y git curl ca-certificates curl gnupg

# 3. Install Docker
echo "🐳 Installing Docker..."
# Add Docker's official GPG key:
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Enable Docker Service
echo "🔌 Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# 5. Verify Installation
echo "✅ Verifying installation..."
docker --version
docker compose version
git --version

echo "🎉 Setup Complete! You are ready to clone the repository."
