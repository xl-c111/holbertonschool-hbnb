# HBnB - Auth & DB
##  MySQL Setup & Configuration

This project uses MySQL for database storage. Follow the steps below to set up MySQL and configure access for your Flask app.

---

### 1. Start MySQL service

```bash
sudo systemctl start mysql
```
### 2. Log in as MySQL root user

```bash
mysql -u root -p
# Enter your root password when prompted
```
### 3. Create the database and user

Inside the MySQL prompt, run the following:
```
-- Create the database (if it doesn't exist)
CREATE DATABASE hbnb_db;

-- Create a new user
CREATE USER 'flaskuser'@'localhost' IDENTIFIED BY 'flaskpass';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON hbnb_db.* TO 'flaskuser'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

```

