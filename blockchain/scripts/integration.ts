import * as anchor from "@project-serum/anchor";

(async (): Promise<void> => {
  // Configure the client to use the local cluster.

  // const contractAddress = '2XiEhWahAGswjrvkGZRDotB5PEYKkjqQoRk8RqXMozko'; 
  const endpoint = 'https://small-tiniest-gadget.solana-devnet.discover.quiknode.pro/53f5090dd1ffbc07961f1147e8028e56e2fe59ac/';
  // const endpoint = 'http://localhost:8899';
  // const solanaConnection = new solanaWeb3.Connection(endpoint);

  anchor.setProvider(anchor.AnchorProvider.local(endpoint));
  const program = anchor.workspace.Multisig;

  const multisig = anchor.web3.Keypair.generate();
    const multisigId = new anchor.BN(1);
    const [multisigSigner, nonce] =
      await anchor.web3.PublicKey.findProgramAddress(
        [multisig.publicKey.toBuffer()],
        program.programId
      );
    const multisigSize = 1000; // Big enough.

    const ownerA = anchor.web3.Keypair.generate();
    const ownerB = anchor.web3.Keypair.generate();
    const ownerC = anchor.web3.Keypair.generate();
    const owners = [ownerA.publicKey, ownerB.publicKey, ownerC.publicKey];

    const threshold = new anchor.BN(2);

    // create multisig
    const tx = await program.rpc.createMultisig(owners, threshold, nonce, multisigId, {
      accounts: {
        multisig: multisig.publicKey,
        creator:  anchor.getProvider().publicKey
      },
      instructions: [
        await program.account.multisig.createInstruction(
          multisig,
          multisigSize
        ),
      ],
      signers: [multisig],
    });

    console.log('tx', tx)

    // // create proposal
    // const proposal = anchor.web3.Keypair.generate();
    // const txSize = 1000; // Big enough, cuz I'm lazy.
    // await program.rpc.createProposal(multisigId, {
    //   accounts: {
    //     multisig: multisig.publicKey,
    //     proposal: proposal.publicKey,
    //     creator: ownerA.publicKey,
    //   },
    //   instructions: [
    //     await program.account.proposal.createInstruction(
    //       proposal,
    //       txSize
    //     ),
    //   ],
    //   signers: [proposal, ownerA],
    // });

    // // Other owner approves transactoin.
    // await program.rpc.approve({
    //     accounts: {
    //       multisig: multisig.publicKey,
    //       proposal: proposal.publicKey,
    //       validator: ownerB.publicKey,
    //     },
    //     signers: [ownerB],
    //   });
  
    //   await program.rpc.approve({
    //     accounts: {
    //       multisig: multisig.publicKey,
    //       proposal: proposal.publicKey,
    //       validator: ownerC.publicKey,
    //     },
    //     signers: [ownerC],
    //   });
  
    //   // Now that we've reached the threshold, send the transactoin.
    //   await program.rpc.executeTransaction({
    //     accounts: {
    //       multisig: multisig.publicKey,
    //       multisigSigner,
    //       proposal: proposal.publicKey,
    //     },
    //     remainingAccounts: program.instruction.setValidators
    //       .accounts({
    //         multisig: multisig.publicKey,
    //         multisigSigner,
    //       })
    //       // Change the signer status on the vendor signer since it's signed by the program, not the client.
    //       .map((meta) =>
    //         meta.pubkey.equals(multisigSigner)
    //           ? { ...meta, isSigner: false }
    //           : meta
    //       )
    //       .concat({
    //         pubkey: program.programId,
    //         isWritable: false,
    //         isSigner: false,
    //       }),
    //   });

})().catch(e => {
  process.exit(1);
});