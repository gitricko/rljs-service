# rljs-service
RL JS MicroService

### Dev Setup
- Clone github and change into the github directory
- Create conda environment: ```conda env create -f environment.yml```
- Enter conda environment:  ```conda activate rljs-service```
- Setting up npm packages: ```npm install```

### Running
- Enter conda environment:  ```conda activate rljs-service``` if you have not.
- Run Server with debugging & auto-reload/restart: ```npm run dev```
- Run Server in production mode: ```npm run prod```

### Testing
- Only waterworld example is integrated with server-side RL.DQNAgent (nodejs)
