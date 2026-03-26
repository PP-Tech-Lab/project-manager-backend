CREATE TABLE IF NOT EXISTS user_entity (
userId integer PRIMARY KEY,
username VARCHAR(20),
password VARCHAR(20),
email VARCHAR(35),
isActivated BOOLEAN,
verified BOOLEAN
);