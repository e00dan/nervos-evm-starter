import { PolyjuiceAccounts, PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import Web3 from 'web3';
import { readFile } from 'fs/promises';

import CONFIG from '../src/config.js';

(async () => {
    const SimpleStorageJSON = JSON.parse(
        await readFile(
            new URL('../src/artifacts/contracts/SimpleStorage.sol/SimpleStorage.json', import.meta.url)
        )
    );

    const providerConfig = {
        web3Url: CONFIG.HTTP_RPC_URL
    };

    const provider = new PolyjuiceHttpProvider(providerConfig.web3Url, providerConfig);

    const polyjuiceAccounts = new PolyjuiceAccounts(providerConfig);

    const web3 = new Web3(provider);
    web3.eth.accounts = polyjuiceAccounts;
    web3.eth.Contract.setProvider(provider, web3.eth.accounts);

    const USER_ONE = web3.eth.accounts.wallet.add(CONFIG.USER_ONE_PRIVATE_KEY);

    const myContract = new web3.eth.Contract(SimpleStorageJSON.abi);
    const contractInstance = await myContract
        .deploy({
            data: SimpleStorageJSON.bytecode,
            arguments: []
        })
        .send({
            from: USER_ONE.address
        });

    console.log(`Deployed contract: ${contractInstance.options.address}`);
})();
