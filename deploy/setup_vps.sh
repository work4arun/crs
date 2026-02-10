#!/bin/bash

# Exit on error
set -e

echo "Starting VPS Setup..."

# Update system
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 and Yarn globally
echo "Installing PM2 and Yarn..."
sudo npm install -g pm2 yarn

# Install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# Setup Firewall (UFW)
echo "Configuring Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "VPS Setup Complete!"
echo "Next steps:"
echo "1. Configure .env file in project root"
echo "2. Run deploy.sh"
echo "3. Configure Nginx"
