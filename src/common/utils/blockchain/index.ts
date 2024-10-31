// eslint-disable-next-line @typescript-eslint/no-var-requires

import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import math, { div } from './math';
import { Transaction } from './types';
import { TronWeb } from 'tronweb';
import { Network } from '@src/modules/database/schemas/user.schema';
import { ERCUSD_ADDRESS, ERCUSD_ABI } from './erc';
import { BSCUSD_ADDRESS, BSCUSD_ABI } from './bsc';
import { TRCUSD_ADDRESS, TRCUSD_ABI } from './trc';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

export * from './types';

export const BIG_TEN = new BigNumber(10);

// Add new RPC URLs for different networks
export const RPC_URLS = {
  [Network.BEP20]: 'https://binance.llamarpc.com',
  [Network.ERC20]: 'https://eth.llamarpc.com',
};

// Helper function to get the appropriate client
function getNetworkClient(network: Network) {
  return new Web3(RPC_URLS[network]);
}

export const contractConfig = {
  [Network.BEP20]: { address: BSCUSD_ADDRESS, abi: BSCUSD_ABI },
  [Network.ERC20]: { address: ERCUSD_ADDRESS, abi: ERCUSD_ABI },
  [Network.TRC20]: { address: TRCUSD_ADDRESS, abi: TRCUSD_ABI },
};

export function generateAddress() {
  const { address, privateKey } = ethers.Wallet.createRandom();

  return { address, key: privateKey };
}

export function privateToAddress(privKey: string, network: Network) {
  const web3 = getNetworkClient(network);
  const { address, privateKey } = web3.eth.accounts.privateKeyToAccount(privKey);
  return { address, key: privateKey };
}

export async function getBalance(address: string, network: Network) {
  try {
    if (network === Network.TRC20) {
      const tronWeb = new TronWeb({
        fullHost: process.env.TRON_FULL_NODE,
      });
      tronWeb.setAddress(address);
      const balanceSun = await tronWeb.trx.getBalance(address);
      return div(balanceSun, Math.pow(10, 6)).toNumber(); // TRX uses 6 decimals
    }

    const web3 = getNetworkClient(network);
    const balanceWei = await web3.eth.getBalance(address);
    return div(balanceWei, Math.pow(10, 18)).toNumber();
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
}

export async function getTokenBalance(
  address: string,
  scAddress: string,
  abi: AbiItem[],
  network: Network,
) {
  try {
    if (network === Network.TRC20) {
      const tronWeb = new TronWeb({
        fullHost: process.env.TRON_FULL_NODE,
      });
      tronWeb.setAddress(scAddress);
      const contract = await tronWeb.contract().at(scAddress);
      const decimals = await contract.decimals().call();
      const balance = await contract.balanceOf(address).call();
      return div(balance, BIG_TEN.pow(decimals).toFixed()).toNumber();
    }

    const web3 = getNetworkClient(network);
    const smartContract = new web3.eth.Contract(abi, scAddress);
    const decimals = await smartContract.methods.decimals().call();
    const balance = await smartContract.methods
      .balanceOf(web3.utils.toChecksumAddress(address))
      .call();
    return div(balance, Math.pow(10, decimals)).toNumber();
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
}

/**
 *
 * @param scAddress
 * @param abi
 * @param fromBlock
 * @param toBlock
 * @param fromAddress sender
 * @param toAddress receiver
 * @param network
 */
export async function getTokenTxs(
  network: Network,
  scAddress: string,
  abi: AbiItem[],
  fromBlock: number,
  toBlock: number,
  fromAddress?: string,
  toAddress?: string,
) {
  const web3 = getNetworkClient(network);
  const smartContract = new web3.eth.Contract(abi, scAddress);

  const decimals = await smartContract.methods.decimals().call();
  const datas = await smartContract.getPastEvents('Transfer', {
    filter: {
      isError: 0,
      txreceipt_status: 1,
      from: fromAddress,
      to: toAddress,
    },
    fromBlock,
    toBlock,
  });

  const result: Transaction[] = datas.map((item) => {
    const value = div(item.returnValues['value'], Math.pow(10, decimals)).toString();
    return {
      hash: item.transactionHash,
      blockNumber: item.blockNumber,
      from: item.returnValues['from'],
      to: item.returnValues['to'],
      value,
    };
  });

  return result;
}

export async function getTokenTxsTron(
  scAddress: string,
  minBlockTimestamp: number,
  maxBlockTimestamp: number,
  fromAddress?: string,
  toAddress?: string,
) {
  const tronWeb = new TronWeb({
    fullHost: process.env.TRON_FULL_NODE,
  });
  tronWeb.setAddress(scAddress);

  const smartContract = await tronWeb.contract().at(scAddress);

  // Get the decimals (assuming it's a TRC-20 token)
  const decimals = await smartContract.decimals().call();

  // Query transfer events from the smart contract (Tron doesn't use 'getPastEvents' directly)
  const events = await tronWeb.getEventResult(scAddress, {
    eventName: 'Transfer',
    onlyConfirmed: true,
    minBlockTimestamp,
    maxBlockTimestamp,
  });

  const filteredEvents = events.data?.filter((event) => {
    return (
      (fromAddress ? event.result.from === fromAddress : true) &&
      (toAddress ? event.result.to === toAddress : true)
    );
  });

  const result = filteredEvents.map((item) => {
    const value = new BigNumber(item.result.value)
      .div(BIG_TEN.pow(decimals))
      .toString();
    return {
      hash: item.transaction_id,
      blockNumber: item.block_number,
      from: TronWeb.address.fromHex(item.result.from),
      to: TronWeb.address.fromHex(item.result.to),
      value,
    };
  });

  return result;
}

export function decodeInput(input: string, network: Network) {
  const web3 = getNetworkClient(network);
  return web3.utils.toAscii(input);
}

export async function getLogs(
  address: string,
  fromBlock: number,
  toBlock: number,
  topics: string[],
  network: Network,
) {
  const web3 = getNetworkClient(network);
  return await web3.eth.getPastLogs({
    address: address,
    fromBlock: fromBlock,
    toBlock: toBlock,
    topics: topics,
  });
}

export function getLastBlock(network: Network): Promise<number> {
  const web3 = getNetworkClient(network);
  return web3.eth.getBlockNumber();
}

export function getTransactionInfo(tx_hash: string, network: Network) {
  const web3 = getNetworkClient(network);
  return web3.eth.getTransaction(tx_hash);
}

export function getTransaction(block: number, index: number, network: Network) {
  const web3 = getNetworkClient(network);
  return web3.eth.getTransactionFromBlock(block, index);
}

export async function getTransactions(block: number | string, network: Network) {
  const web3 = getNetworkClient(network);
  const result = await web3.eth.getBlock(block, true);
  if (result == null) {
    return [];
  }
  const txs: Transaction[] = result.transactions.map((item) => {
    const value = div(item.value, 1e18).toString();
    return {
      hash: item.hash,
      blockNumber: item.blockNumber,
      from: item.from,
      to: item.to,
      value,
    };
  });
  return txs;
}

export function getBlockInfo(block: number, network: Network) {
  const web3 = getNetworkClient(network);
  return web3.eth.getBlock(block);
}

export async function getConfirmations(hash: string, network: Network) {
  const web3 = getNetworkClient(network);
  const txReceipt = await web3.eth.getTransactionReceipt(hash);
  const latest = await getLastBlock(network);
  if (txReceipt == null) {
    return -1;
  }
  if (!txReceipt.status) {
    return 0;
  }
  return latest - txReceipt.blockNumber;
}

/**
 *
 * @returns Gas price in wei
 */
export function getGasPrice(network: Network) {
  const web3 = getNetworkClient(network);
  return web3.eth.getGasPrice();
}
/**
 *
 * @returns Gas price in wei
 */
export async function estimateGasPrice(
  gasLimit: number | string,
  maxFee: number,
  network: Network,
) {
  const gasPrice = await getGasPrice(network);
  const calculatedGasPrice = Math.floor(math.mul(gasPrice, 1.1).toNumber());
  const estimateFee = math.mul(calculatedGasPrice, gasLimit);
  const maxFeeWei = Web3.utils.toWei(maxFee.toString(), 'ether');
  if (estimateFee.toNumber() > Number(maxFeeWei)) {
    return parseInt(math.div(maxFeeWei, gasLimit.toString()).toString()).toString();
  }
  return gasPrice;
}

/**
 *
 * @returns Gas price in wei
 */
export async function estimateFee(gasLimit: number | string, network: Network) {
  const gasPrice = await getGasPrice(network);
  const calculatedGasPrice = Math.floor(math.mul(gasPrice, 1.1).toNumber());
  const estimateFee = math.mul(calculatedGasPrice, gasLimit).toString();
  return math.div(estimateFee, 1e18).toNumber();
}

// /**
//  * Prints a message
//  * @param fromAddress
//  * @param privateKey
//  * @param toAddress
//  * @param amount normal amount (exp: 1bnb)
//  * @param gasPrice gwei amount
//  * @param waitTx wait or not wait send tx success blockchain
//  * @param nonce tx index, default get from node
//  */
// export async function sendBNB(
//   fromAddress: string,
//   privateKey: string,
//   toAddress: string,
//   amount: number | string,
//   gasPrice?: number | string,
//   waitTx = true,
//   nonce?: number,
// ) {
//   let txNonce = nonce;
//   if (!txNonce) {
//     txNonce = await web3.eth.getTransactionCount(
//       web3.utils.toChecksumAddress(fromAddress),
//     );
//   }
//   const gasLimit = 21000;
//   const amountWei = math.mul(amount, 1e18).toString();
//   let gasPriceWei: string | number;
//   if (gasPrice == null) {
//     gasPriceWei = await estimateGasPrice(gasLimit, 0.01);
//   } else {
//     gasPriceWei = math.mul(gasPrice, 1e9).toString();
//   }

//   const signedTx = await web3.eth.accounts.signTransaction(
//     {
//       from: web3.utils.toChecksumAddress(fromAddress),
//       to: web3.utils.toChecksumAddress(toAddress),
//       value: amountWei,
//       nonce: txNonce,
//       gas: gasLimit,
//       gasPrice: gasPriceWei,
//     },
//     privateKey,
//   );
//   if (!signedTx || !signedTx.rawTransaction) return;

//   if (waitTx) {
//     await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
//   } else {
//     web3.eth.sendSignedTransaction(signedTx.rawTransaction, (err, hash) => {
//       if (err != null) {
//         console.error(err);
//       } else {
//         console.info(`Send tx success: ${hash}`);
//       }
//     });
//   }
//   return signedTx.rawTransaction;
// }

// /**
//  * Prints a message
//  * @param fromAddress
//  * @param privateKey
//  * @param contractAddress
//  * @param amount normal currency amount (exp: 1busd)
//  * @param toAddress
//  * @param gasLimit
//  * @param gasPrice gwei amount
//  * @param waitTx wait or not wait send tx success blockchain
//  * @param nonce tx index, default get from node
//  * @param abi contract abi
//  */
// export async function sendToken(
//   fromAddress: string,
//   privateKey: string,
//   contractAddress: string,
//   abi: AbiItem[],
//   toAddress: string,
//   amount: number | string,
//   gasLimit: number | string,
//   gasPrice?: number | string,
//   waitTx = true,
//   nonce?: number,
// ) {
//   let txNonce = nonce;
//   if (!txNonce) {
//     txNonce = await web3.eth.getTransactionCount(
//       web3.utils.toChecksumAddress(fromAddress),
//     );
//   }

//   const smartContract = new web3.eth.Contract(abi, contractAddress);

//   const decimals = await smartContract.methods.decimals().call();
//   const amountWei = math.mul(amount, Math.pow(10, decimals)).toFixed();
//   let gasPriceWei: string | number;
//   if (gasPrice == null) {
//     gasPriceWei = await estimateGasPrice(gasLimit, 0.01);
//   } else {
//     gasPriceWei = math.mul(gasPrice, 1e9).toFixed();
//   }

//   const txData = smartContract.methods
//     .transfer(web3.utils.toChecksumAddress(toAddress), amountWei)
//     .encodeABI();

//   const signedTx = await web3.eth.accounts.signTransaction(
//     {
//       nonce: txNonce,
//       from: web3.utils.toChecksumAddress(fromAddress),
//       to: web3.utils.toChecksumAddress(contractAddress),
//       value: 0,
//       gas: gasLimit,
//       gasPrice: gasPriceWei,
//       data: txData,
//     },
//     privateKey,
//   );
//   if (!signedTx || !signedTx.rawTransaction) return;

//   if (waitTx) {
//     await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
//   } else {
//     web3.eth.sendSignedTransaction(signedTx.rawTransaction, (err, hash) => {
//       if (err != null) {
//         console.error(err);
//       } else {
//         console.info(`Send tx success: ${hash}`);
//       }
//     });
//   }
//   return signedTx.transactionHash;
// }

interface ABIResponse {
  status: string;
  message: string;
  result: AbiItem[];
}

export async function getABI(address: string) {
  const response: ABIResponse = await fetch(
    `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}`,
  ).then((res) => res.json());
  if (response.status == '1') {
    return response.result;
  }
  throw Error(response.message || 'Request failed');
}

export function filterTxs(txs: Transaction[], from?: string, to?: string) {
  if (from != null || to != null) {
    return txs.filter((item) => {
      if (from != null && to != null) {
        return item.from === from && item.from === to;
      } else if (to != null) {
        return item.from === to;
      } else if (from != null) {
        return item.from === from;
      }
      return false;
    });
  }
  return txs;
}

// Modified sendToken function
export async function sendToken(
  network: Network,
  fromAddress: string,
  privateKey: string,
  contractAddress: string,
  abi: AbiItem[],
  toAddress: string,
  amount: number | string,
  gasLimit: number | string,
  gasPrice?: number | string,
  waitTx = true,
  nonce?: number,
) {
  if (network === Network.TRC20) {
    return sendTronToken(privateKey, contractAddress, toAddress, amount);
  }

  const web3 = getNetworkClient(network);
  let txNonce = nonce;
  if (!txNonce) {
    txNonce = await web3.eth.getTransactionCount(
      web3.utils.toChecksumAddress(fromAddress),
    );
  }

  const smartContract = new web3.eth.Contract(abi, contractAddress);

  const decimals = await smartContract.methods.decimals().call();
  const amountWei = math.mul(amount, Math.pow(10, decimals)).toFixed();
  let gasPriceWei: string | number;
  if (gasPrice == null) {
    gasPriceWei = await estimateGasPrice(gasLimit, 0.01, network);
  } else {
    gasPriceWei = math.mul(gasPrice, 1e9).toFixed();
  }

  const txData = smartContract.methods
    .transfer(web3.utils.toChecksumAddress(toAddress), amountWei)
    .encodeABI();

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      nonce: txNonce,
      from: web3.utils.toChecksumAddress(fromAddress),
      to: web3.utils.toChecksumAddress(contractAddress),
      value: 0,
      gas: gasLimit,
      gasPrice: gasPriceWei,
      data: txData,
    },
    privateKey,
  );
  if (!signedTx || !signedTx.rawTransaction) return;

  if (waitTx) {
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  } else {
    web3.eth.sendSignedTransaction(signedTx.rawTransaction, (err, hash) => {
      if (err != null) {
        console.error(err);
      } else {
        console.info(`Send tx success: ${hash}`);
      }
    });
  }
  return signedTx.transactionHash;
}

// New function for TRC20 tokens
async function sendTronToken(
  privateKey: string,
  contractAddress: string,
  toAddress: string,
  amount: number | string,
) {
  try {
    const tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_NODE,
      privateKey: removeHexPrefix(privateKey),
    });

    const contract = await tronWeb.contract().at(contractAddress);
    const decimals = await contract.decimals().call();
    const amountWei = new BigNumber(amount)
      .multipliedBy(BIG_TEN.pow(decimals))
      .toFixed();

    let result = await contract.transfer(toAddress, amountWei).send();
    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// Modified sendBNB function
export async function sendNativeCoin(
  network: Network,
  fromAddress: string,
  privateKey: string,
  toAddress: string,
  amount: number | string,
  gasPrice?: number | string,
  waitTx = true,
  nonce?: number,
) {
  if (network === Network.TRC20) {
    return sendTronNative(privateKey, toAddress, Number(amount));
  }

  const web3 = getNetworkClient(network);
  let txNonce = nonce;
  if (!txNonce) {
    txNonce = await web3.eth.getTransactionCount(
      web3.utils.toChecksumAddress(fromAddress),
    );
  }
  const gasLimit = 21000;
  const amountWei = math.mul(amount, 1e18).toString();
  let gasPriceWei: string | number;
  if (gasPrice == null) {
    gasPriceWei = await estimateGasPrice(gasLimit, 0.01, network);
  } else {
    gasPriceWei = math.mul(gasPrice, 1e9).toString();
  }

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      from: web3.utils.toChecksumAddress(fromAddress),
      to: web3.utils.toChecksumAddress(toAddress),
      value: amountWei,
      nonce: txNonce,
      gas: gasLimit,
      gasPrice: gasPriceWei,
    },
    privateKey,
  );
  if (!signedTx || !signedTx.rawTransaction) return;

  if (waitTx) {
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  } else {
    web3.eth.sendSignedTransaction(signedTx.rawTransaction, (err, hash) => {
      if (err != null) {
        console.error(err);
      } else {
        console.info(`Send tx success: ${hash}`);
      }
    });
  }
  return signedTx.rawTransaction;
}

// New function for sending native TRX
async function sendTronNative(
  privateKey: string,
  toAddress: string,
  amount: number,
) {
  try {
    const tronWeb = new TronWeb({
      fullHost: process.env.TRON_FULL_NODE,
      privateKey: removeHexPrefix(privateKey),
    });

    // Convert amount from TRX to Sun (1 TRX = 1,000,000 Sun)
    const amountSun = Number(tronWeb.toSun(amount));

    // Send TRX transaction
    const result = await tronWeb.trx.sendTransaction(toAddress, amountSun);

    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

export function removeHexPrefix(str: string) {
  return str.startsWith('0x') ? str.substring(2) : str;
}
