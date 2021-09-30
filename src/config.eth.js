const Web3 = require('web3');
const WebsocketProvider = require('web3-providers-ws');

const CONFIG = {
    WS_RPC_URL: 'ws://127.0.0.1:8545',
    USER_ONE_PRIVATE_KEY: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
}

const provider = new WebsocketProvider(CONFIG.WS_RPC_URL);

const web3 = new Web3(provider);

const userOne = web3.eth.accounts.wallet.add(CONFIG.USER_ONE_PRIVATE_KEY);

module.exports = {
    ...CONFIG,
    provider,
    web3,
    userOne
};
