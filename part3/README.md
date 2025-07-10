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
```
### 3. Create the database and user

Inside the MySQL prompt, run the following:
```sql
DROP USER IF EXISTS 'hbnb_user'@'localhost';
CREATE USER 'hbnb_user'@'localhost' IDENTIFIED BY '1234';
ALTER USER 'hbnb_user'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON hbnb_db.* TO 'hbnb_user'@'localhost';
FLUSH PRIVILEGES;

```
## Initialize Database Schema
Once you've created the user and database:
### 4. Run SQL Schema Script
Use the SQL script to create all tables defined in hbnb_db.sql.
```bash
mysql -u root -p < hbnb_db.sql

```
### 5. Verify the Tables Were Created
```bash
mysql -u root -p -e "USE hbnb_db; SHOW TABLES;"

```
##  Database Viwever Setup

When setting up a new connection, use the following:

| Feature | HTTP     |
| :-------- | :------- |
| **Host** | `localhost` |
| **Port** | `3306` |
| **Username**| `hbhb_user` |
| **Password** | `1234 ` |
| **Database Name** | `hbnb_db` |

Make sure your MySQL server is running:

```bash
sudo systemctl start mysql
```