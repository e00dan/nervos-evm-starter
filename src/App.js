import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { AddressTranslator } from 'nervos-godwoken-integration';
import Web3 from 'web3';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';

import CONFIG from './config';
import SimpleStorageJSON from './artifacts/contracts/SimpleStorage.sol/SimpleStorage.json';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

async function createWeb3() {
  // Modern dapp browsers...
  if (window.ethereum) {
      const providerConfig = {
          web3Url: CONFIG.HTTP_RPC_URL
      };

      const provider = new PolyjuiceHttpProvider(CONFIG.HTTP_RPC_URL, providerConfig);
      const web3 = new Web3(provider || Web3.givenProvider);

      try {
          // Request account access if needed
          await window.ethereum.enable();
      } catch (error) {
          // User denied account access...
      }

      return web3;
  }

  console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  return null;
}

export default function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState();
  const [accounts, setAccounts] = useState();
  const [l2Balance, setL2Balance] = useState();
  const [existingContractIdInputValue, setExistingContractIdInputValue] = useState();
  const [storedValue, setStoredValue] = useState();
  const [polyjuiceAddress, setPolyjuiceAddress] = useState();
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const toastId = useRef(null);
  const [newStoredNumberInputValue, setNewStoredNumberInputValue] = useState();

  const defaultAccount = accounts?.[0];

//   async function getLayer2DepositAddress() {
//     const addressTranslator = new AddressTranslator();
//     const depositAddress = await addressTranslator.getLayer2DepositAddress(web3, defaultAccount);

//     console.log(`Layer 2 Deposit Address on Layer 1: \n${depositAddress.addressString}`);
//   }

  useEffect(() => {
      if (defaultAccount) {
          const addressTranslator = new AddressTranslator();
          setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(defaultAccount));
      } else {
          setPolyjuiceAddress(undefined);
      }
  }, [defaultAccount]);

  useEffect(() => {
      if (transactionInProgress && !toastId.current) {
          toastId.current = toast.info(
              'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
              {
                  position: 'top-right',
                  autoClose: false,
                  hideProgressBar: false,
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  closeButton: false
              }
          );
      } else if (!transactionInProgress && toastId.current) {
          toast.dismiss(toastId.current);
          toastId.current = null;
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionInProgress, toastId.current]);

  async function deployContract() {
      let _contract = new web3.eth.Contract(SimpleStorageJSON.abi);

      try {
          setTransactionInProgress(true);

          _contract = await _contract
            .deploy({
                data: SimpleStorageJSON.bytecode,
                arguments: []
            })
            .send({
                from: defaultAccount
            });

          setExistingContractAddress(_contract.options.address);
          toast(
              'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
              { type: 'success' }
          );
      } catch (error) {
          console.error(error);
          toast.error(
              'There was an error sending your transaction. Please check developer console.'
          );
      } finally {
          setTransactionInProgress(false);
      }
  }

  async function getStoredValue() {
      const value = await contract.methods.get().call();
      toast('Successfully read latest stored value.', { type: 'success' });

      setStoredValue(value);
  }

  async function setExistingContractAddress(contractAddress) {
      const _contract = new web3.eth.Contract(SimpleStorageJSON.abi, contractAddress);

      setContract(_contract);
      setStoredValue(undefined);
  }

  async function setNewStoredValue() {
      try {
          setTransactionInProgress(true);
          await contract.methods.set(newStoredNumberInputValue).send({
              from: defaultAccount
          });
          toast(
              'Successfully set latest stored value. You can refresh the read value now manually.',
              { type: 'success' }
          );
      } catch (error) {
          console.error(error);
          toast.error(
              'There was an error sending your transaction. Please check developer console.'
          );
      } finally {
          setTransactionInProgress(false);
      }
  }

  useEffect(() => {
      if (web3) {
          return;
      }

      (async () => {
          const _web3 = await createWeb3();
          setWeb3(_web3);

          const _accounts = [window.ethereum.selectedAddress];
          setAccounts(_accounts);
          console.log({ _accounts });

          if (_accounts && _accounts[0]) {
              // eslint-disable-next-line no-undef
              const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
              setL2Balance(_l2Balance);
          }
      })();
  });

  const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

  return (
      <div>
          Your ETH address: <b>{accounts?.[0]}</b>
          <br />
          <br />
          Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
          <br />
          <br />
          Nervos Layer 2 balance:{' '}
          <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
          <br />
          <br />
          Deployed contract address: <b>{contract?.options.address || '-'}</b> <br />
          <br />
          <hr />
          <p>
              The button below will deploy a SimpleStorage smart contract where you can store a
              number value. By default the initial stored value is equal to 123 (you can change
              that in the Solidity smart contract). After the contract is deployed you can either
              read stored value from smart contract or set a new one. You can do that using the
              interface below.
          </p>
          <button onClick={deployContract} disabled={!l2Balance}>
              Deploy contract
          </button>
          &nbsp;or&nbsp;
          <input
              placeholder="Existing contract id"
              onChange={e => setExistingContractIdInputValue(e.target.value)}
          />
          <button
              disabled={!existingContractIdInputValue || !l2Balance}
              onClick={() => setExistingContractAddress(existingContractIdInputValue)}
          >
              Use existing contract
          </button>
          <br />
          <br />
          <button onClick={getStoredValue} disabled={!contract}>
              Get stored value
          </button>
          {storedValue ? <>&nbsp;&nbsp;Stored value: {storedValue.toString()}</> : null}
          <br />
          <br />
          <input
              type="number"
              onChange={e => setNewStoredNumberInputValue(parseInt(e.target.value, 10))}
          />
          <button onClick={setNewStoredValue} disabled={!contract}>
              Set new stored value
          </button>
          <br />
          <br />
          <br />
          <br />
          <hr />
          The contract is deployed on Nervos Layer 2.
          <ToastContainer />
      </div>
  );
}