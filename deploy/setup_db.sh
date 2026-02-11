#!/bin/bash

# Exit on error
set -e

echo "Setting up PostgreSQL..."

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configure Database and User
# We switch to the postgres user to run psql commands
# We'll create a user 'growthcard' with password 'growthcard123' and db 'growthcard'
# You should change the password later!

DB_NAME="growthcard"
DB_USER="growthcard"
DB_PASS="M07ece00713Lc01Ninja"

echo "Creating database user '$DB_USER' and database '$DB_NAME'..."

sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" || echo "User might already exist"
sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" || echo "Database might already exist"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

echo "PostgreSQL Setup Complete!"
echo ""
echo "Please update your .env file with the following DATABASE_URL:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME\""
echo ""
