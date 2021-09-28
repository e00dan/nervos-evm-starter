const { expect } = require('chai');
const Web3 = require('web3');
const { PolyjuiceAccounts, PolyjuiceHttpProvider } = require('@polyjuice-provider/web3');
const { readFile } = require('fs/promises');
const CONFIG = require('../src/config');

describe('SimpleStorage', function () {
    let contract;
    let userOne;
    
    // eslint-disable-next-line no-undef
    before(async function () {
        const providerConfig = {
            web3Url: CONFIG.HTTP_RPC_URL
        };
    
        const provider = new PolyjuiceHttpProvider(providerConfig.web3Url, providerConfig);
    
        const polyjuiceAccounts = new PolyjuiceAccounts(providerConfig);
    
        const web3 = new Web3(provider);
        web3.eth.accounts = polyjuiceAccounts;
        web3.eth.Contract.setProvider(provider, web3.eth.accounts);
    
        userOne = web3.eth.accounts.wallet.add(CONFIG.USER_ONE_PRIVATE_KEY);

        const SimpleStorageJSON = JSON.parse(
            await readFile('./src/artifacts/contracts/SimpleStorage.sol/SimpleStorage.json')
        );

        const myContract = new web3.eth.Contract(SimpleStorageJSON.abi);
        contract = await myContract
            .deploy({
                data: SimpleStorageJSON.bytecode,
                arguments: []
            })
            .send({
                from: userOne.address
            });
    });

    it(`get() method initially returns "123"`, async function () {
        expect(await contract.methods.get().call()).to.equal('123');
    });

    it(`set() method can change state value`, async function () {
        const NEW_VALUE = '7742356';
        await contract.methods.set(NEW_VALUE).send({
            from: userOne.address
        });

        expect(await contract.methods.get().call()).to.equal(NEW_VALUE);
    });
});
