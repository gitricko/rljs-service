# rljs-service
RL JS MicroService

### Dev Setup
- Clone github and change into the github directory
- Create conda environment: ```conda env create -f environment.yml```
- Enter conda environment:  ```conda activate rljs-service```
- Setting up npm packages: ```npm run build```

### Running
- Enter conda environment:  ```conda activate rljs-service``` if you have not.
- Run Server with debugging & auto-reload/restart: ```npm run dev```
    - In VSCode's debugging - use _Attach by Process ID_ to start debugging
- Run Server in production mode: ```npm run prod```

### Testing
- Only waterworld example is integrated with server-side RL.DQNAgent (nodejs)
    - Go to: http://localhost:3000/waterworld.html
    - Let it run for a few hours to see agent improves; OR
    - Click on _Load a Pretrained Agent_ button to see a train RL model
    - Check the scores on apples vs poison
