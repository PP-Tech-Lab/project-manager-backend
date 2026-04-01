# Database Configuration

### Install psql (postgres client)

```bash
sudo apt install postgres-client
```

### Install docker 
(Debian/Ubuntu derivatives) taken from the official docker docs
```bash
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Build and setup the postgres container  
```bash
docker build -t project-manager-database .
source ../.env.{build}
docker run -e POSTGRES_PASSWORD=${DB_PASSWORD} -e POSTGRES_USER=${DB_USERNAME} -e POSTGRES_DB=${DB_USER_DATABASE} -p ${DB_PORT}:5432 -d project-manager-database
```

## Debugging
You can use the postgres client to debug and directly view queries, tables, etc.
```bash
psql -h 0.0.0.0 -p ${DB_PORT} -U ${DB_USERNAME} -d ${DB_USER_DATABASE}
```

Example users you can insert into the db for testing purposes
```sql
INSERT INTO user_entity (username, password) VALUES ('Alice', 'topsecret');
INSERT INTO user_entity (username, password) VALUES ('Bob', '123abc');
```
