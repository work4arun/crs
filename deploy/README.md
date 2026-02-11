# Deployment Guide

This directory contains scripts to deploy the GrowthCard application to a VPS (Ubuntu 25.01) without Docker.

## Files

- `setup_vps.sh`: Run this ONCE to install dependencies (Node.js, Nginx, PM2).
- `deploy.sh`: Run this to deploy updates (Pull, Build, Migrate, Restart).
- `ecosystem.config.js`: PM2 configuration file.
- `nginx.conf`: Nginx server block configuration.

## Instructions

1.  **SSH into your VPS**:
    ```bash
    ssh user@your-vps-ip
    ```

2.  **Clone the repository**:
    ```bash
    git clone <your-repo-url> growthcardv1
    cd growthcardv1
    ```

3.  **Run Setup Script**:
    ```bash
    chmod +x deploy/setup_vps.sh
    ./deploy/setup_vps.sh
    ```

4.  **Configure Environment Variables**:
    Create a `.env` file in the root directory:
    ```bash
    nano .env
    ```
    Paste your variables:
    ```env
    DATABASE_URL="postgresql://..."
    JWT_SECRET="correct-horse-battery-staple"
    # ... other vars
    ```

5.  **Run Deployment**:
    ```bash
    chmod +x deploy/deploy.sh
    ./deploy/deploy.sh
    ```

6.  **Configure Nginx**:
    Copy the config:
    ```bash
    sudo cp deploy/nginx.conf /etc/nginx/sites-available/growthcard
    sudo ln -s /etc/nginx/sites-available/growthcard /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    ```

7.  **Access App**:
    Open your browser and visit `http://<your-vps-ip>`.

8.  **create Super Admin**:
    To create the initial Super Admin user (Email: `rarunkumar@rathinam.in`, Password: `M07ece007@13Lc01`), run:
    ```bash
    # From project root
    npx ts-node apps/api/prisma/seed.ts
    ```
