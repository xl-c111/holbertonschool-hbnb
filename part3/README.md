HBnB - Auth & DB



sudo systemctl start mysql       # start mysql service
mysql -u root -p                 # login using the MySQL root user and enter the passowrd


CREATE USER 'flaskuser'@'localhost' IDENTIFIED BY 'flaskpass';
GRANT ALL PRIVILEGES ON hbnb_db.* TO 'flaskuser'@'localhost';
FLUSH PRIVILEGES;
