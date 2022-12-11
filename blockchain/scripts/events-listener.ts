import * as anchor from "@project-serum/anchor";
// import * as solanaWeb3 from '@solana/web3.js';
// import * as jsonFile from "../target/idl/multisig.json";

(async (): Promise<void> => {
  // Configure the client to use the local cluster.

  // const contractAddress = '4erAxAzmewA4E4HfysNdU945Xt13vchW1yvuUjGfgr3X'; 
  // const endpoint = 'https://small-tiniest-gadget.solana-devnet.discover.quiknode.pro/53f5090dd1ffbc07961f1147e8028e56e2fe59ac/';
  const endpoint = 'http://localhost:8899';
  // const solanaConnection = new solanaWeb3.Connection(endpoint);

  anchor.setProvider(anchor.AnchorProvider.local(endpoint));
  const program = anchor.workspace.Multisig;
  // const program = jsonFile;

  let listener = null;

  console.log('START LISTENING...');

  let result = new Promise((resolve, _reject) => {
    listener = program.addEventListener("MultisigCreated", (event, slot) => {
      // resolve([event, slot]);

      console.log('MultisigCreated', event, slot);
      console.log('----------------------------');
    });
  });
  // await program.removeEventListener(listener);
  // console.log('RESULT', result);

  let listener1 = null;
  let result1 = new Promise((resolve, _reject) => {
    listener1 = program.addEventListener("ProposalStatusChanged", (event, slot) => {
      // resolve([event, slot]);

      console.log('ProposalStatusChanged', event, slot);
      console.log('----------------------------');
    });
  });
  // console.log('RESULT1', result1);

  let listener2 = null;
  let result2 = new Promise((resolve, _reject) => {
    listener2 = program.addEventListener("ProposalApprovedByValidators", (event, slot) => {
      // resolve([event, slot]);

      console.log('ProposalApprovedByValidators', event, slot);
      console.log('----------------------------');
    });
  });
  // console.log('RESULT2', result2);

  // let listener3 = null;
  // let result3 = await new Promise((resolve, _reject) => {
  //   listener3 = program.addEventListener("ProposalStatusChanged", (event, slot) => {
  //     resolve([event, slot]);
  //   });
  // });
  // console.log('RESULT3', result3);

})().catch(e => {
  process.exit(1);
});