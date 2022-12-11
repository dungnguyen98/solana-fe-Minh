// import * as solanaWeb3 from '@solana/web3.js';

// (async (): Promise<void> => {
//     const contractAddress = '2XiEhWahAGswjrvkGZRDotB5PEYKkjqQoRk8RqXMozko'; 
//     // const endpoint = 'https://small-tiniest-gadget.solana-devnet.discover.quiknode.pro/53f5090dd1ffbc07961f1147e8028e56e2fe59ac/';
//     const endpoint = 'http://localhost:8899';
//     const solanaConnection = new solanaWeb3.Connection(endpoint);
//     const numTx = 100;
//     const pubKey = new solanaWeb3.PublicKey(contractAddress);
//     let transactionList = await solanaConnection.getSignaturesForAddress(pubKey, {limit:numTx});

//     transactionList.forEach(async (transaction, i) => {
//         // const date = new Date(transaction.blockTime*1000);
//         // console.log(`Transaction No: ${i+1}`);
//         // console.log(`Signature: ${transaction.signature}`);
//         // console.log(`Time: ${date}`);
//         // console.log(`Status: ${transaction.confirmationStatus}`);
//         // console.log(("-").repeat(20));

//         console.log(transaction)

//         // console.log(await solanaConnection.getBlock(transaction.slot));
//     });


// })().catch(e => {
//   process.exit(1);
// });