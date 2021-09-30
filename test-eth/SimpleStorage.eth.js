const { expect } = require('chai');
const { readFile } = require('fs/promises');
const { web3, userOne } = require('../src/config.eth');

describe('SimpleStorage', function () {
    let contract;
    
    // eslint-disable-next-line no-undef
    before(async function () {
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
                from: userOne.address,
                gasLimit: 6000000
            });
    });

    it(`get() method initially returns "123"`, async function () {
        expect(await contract.methods.get().call()).to.equal('123');
    });

    it(`set() method can change state value`, async function () {
        const NEW_VALUE = '7742356';
        await contract.methods.set(NEW_VALUE).send({
            from: userOne.address,
            gasLimit: 6000000
        });

        expect(await contract.methods.get().call()).to.equal(NEW_VALUE);
    });

    it(`ValueChanged events can be captured via contract.events.allEvents`, async function () {
        await new Promise(resolve => {
            contract.events.allEvents({
                fromBlock: 0
            }, (error, event) => {
                expect(error).to.equal(null);
                expect(event.event).to.equal('ValueChanged');
                expect(event.removed).to.equal(false);
                expect(event.logIndex).to.equal(0);
                expect(event.transactionIndex).to.equal(0);
                expect(typeof event.returnValues).to.equal('object');
                expect(typeof event.raw).to.equal('object');

                resolve();
            });
        });
    });

    it(`ValueChanged events can be captured via contract.events.ValueChanged`, async function () {
        await new Promise(resolve => {
            contract.events.ValueChanged({
                fromBlock: 0
            }, (error, event) => {
                expect(error).to.equal(null);
                expect(event.event).to.equal('ValueChanged');
                expect(event.removed).to.equal(false);
                expect(event.logIndex).to.equal(0);
                expect(event.transactionIndex).to.equal(0);
                expect(typeof event.returnValues).to.equal('object');
                expect(typeof event.raw).to.equal('object');

                resolve();
            });
        });
    });

    it(`ValueChanged events can be captured via contract.getPastEvents`, async function () {
        const events = await contract.getPastEvents('ValueChanged', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        expect(events.length).to.equal(1);

        const event = events[0];

        expect(event.event).to.equal('ValueChanged');
        expect(event.removed).to.equal(false);
        expect(event.logIndex).to.equal(0);
        expect(event.transactionIndex).to.equal(0);
        expect(typeof event.returnValues).to.equal('object');
        expect(typeof event.raw).to.equal('object');
    });
});
