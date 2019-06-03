# rljs-service
RL JS MicroService

### Dev Setup
- Create conda environment: ```conda env create -f environment.yml```
- Install mongodb via conda inside your conda env
  - ```source activate rljs-service```
  - ```conda install mongodb```
- Setting up npm packages: ```npm install```
- Install ```nodemon``` for auto restart server when changes in files
  - ```npm install nodemon -g```

### Running
- Run mongoDB at background where db files are in ```./mongo_db```
  - ```mkdir ./mongo_db```
  - ```mongod --dbpath=./mongo_db --port=27772 ```
- Run Server with debugging & auto-reload/restart: ```PORT=3001 nodemon --inspect server.js```

### Testing
- Only waterworld example is integrated with server-side RL.DQNAgent (nodejs)
