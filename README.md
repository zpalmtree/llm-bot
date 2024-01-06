# llm-bot

### Build model
* Make sure you have ollama setup
* `ollama create noromaid -f ./modelfiles/noromaid`
* `ollama create dolphin-mixtral-v2.5 -f ./modelfiles/dolphin-mixtral-v2.5`

### Run bot
* `cp lib/Config.ts.example lib/Config.ts`
* Fill out config
* `yarn install`
* `yarn build && yarn start`
