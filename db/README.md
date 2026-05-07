# Database Configuration

### Install psql (postgres client)

```bash
# For >=Ubuntu 25.10 
sudo apt install postgres-client
# For Ubuntu 26.04
sudo apt install postgresql-client
```

### Install latest docker 
(Debian/Ubuntu derivatives) taken from the official docker docs
```bash

# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Create the docker group and add your user:

Create the docker group.
```bash
sudo groupadd docker
``` 
Add your user to the docker group.
```bash
sudo usermod -aG docker $USER
```
Log out and log back in so that your group membership is re-evaluated.
If you're running Linux in a virtual machine, it may be necessary to restart the virtual machine for changes to take effect.
You can also run the following command to activate the changes to groups:
```bash
newgrp docker
```


### Build and setup the postgres container  
NOTE: Make sure you've setup your env file correctly
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
