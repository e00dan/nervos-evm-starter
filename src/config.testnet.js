const Web3 = require('web3');
const { PolyjuiceAccounts, PolyjuiceWebsocketProvider } = require('@polyjuice-provider/web3');

const CONFIG = {
    HTTP_RPC_URL: 'https://godwoken-testnet-web3-rpc.ckbapp.dev',
    WS_RPC_URL: 'ws://godwoken-testnet-web3-rpc.ckbapp.dev/ws',
    USER_ONE_PRIVATE_KEY: '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5'
}

const providerConfig = {
    web3Url: CONFIG.HTTP_RPC_URL
};

const provider = new PolyjuiceWebsocketProvider(CONFIG.WS_RPC_URL, providerConfig);
    
const polyjuiceAccounts = new PolyjuiceAccounts(providerConfig);

const web3 = new Web3(provider);
web3.eth.accounts = polyjuiceAccounts;
web3.eth.Contract.setProvider(provider, web3.eth.accounts);

const userOne = web3.eth.accounts.wallet.add(CONFIG.USER_ONE_PRIVATE_KEY);

module.exports = {
    ...CONFIG,
    provider,
    web3,
    userOne
};
