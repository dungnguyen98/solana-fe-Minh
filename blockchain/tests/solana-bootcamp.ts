import * as anchor from "@project-serum/anchor";
const assert = require("assert");

describe("multisig", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Multisig;

  console.log('PROGRAM', program)

  it("Tests the multisig program", async () => {
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
    const ownerD = anchor.web3.Keypair.generate();
    const owners = [ownerA.publicKey, ownerB.publicKey, ownerC.publicKey];

    const threshold = new anchor.BN(2);

    await program.rpc.createMultisig(owners, threshold, nonce, multisigId, {
      accounts: {
        multisig: multisig.publicKey,
        creator:  provider.wallet.publicKey
      },
      instructions: [
        await program.account.multisig.createInstruction(
          multisig,
          multisigSize
        ),
      ],
      signers: [multisig],
    });

    let multisigAccount = await program.account.multisig.fetch(
      multisig.publicKey
    );

    // assert.strictEqual(multisigAccount.nonce, nonce);
    // assert.ok(multisigAccount.threshold.eq(new anchor.BN(2)));
    // assert.deepStrictEqual(multisigAccount.owners, owners);
    assert.ok(multisigAccount.validatorSetSeqno === 0);

    const pid = program.programId;
    const accounts = [
      {
        pubkey: multisig.publicKey,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: multisigSigner,
        isWritable: false,
        isSigner: true,
      },
    ];
    const validators = [ownerA.publicKey, ownerB.publicKey, ownerD.publicKey];
    const data = program.coder.instruction.encode("set_validators", {
      validators: validators,
    });

    const proposal = anchor.web3.Keypair.generate();
    const txSize = 1000; // Big enough
    await program.rpc.createProposal(multisigId, {
      accounts: {
        multisig: multisig.publicKey,
        proposal: proposal.publicKey,
        creator:  ownerA.publicKey
      },
      instructions: [
        await program.account.proposal.createInstruction(
          proposal,
          txSize
        ),
      ],
      signers: [proposal, ownerA],
    });

    // const txAccount = await program.account.proposal.fetch(
    //   proposal.publicKey
    // );

    // assert.ok(txAccount.programId.equals(pid));
    // assert.deepStrictEqual(txAccount.accounts, accounts);
    // assert.deepStrictEqual(txAccount.data, data);
    // assert.ok(txAccount.multisig.equals(multisig.publicKey));
    // assert.deepStrictEqual(txAccount.didExecute, false);
    // assert.ok(txAccount.ownerSetSeqno === 0);

    // Other owner approves transactoin.
    await program.rpc.approve({
      accounts: {
        multisig: multisig.publicKey,
        proposal: proposal.publicKey,
        validator: ownerB.publicKey,
      },
      signers: [ownerB],
    });

    await program.rpc.approve({
      accounts: {
        multisig: multisig.publicKey,
        proposal: proposal.publicKey,
        validator: ownerC.publicKey,
      },
      signers: [ownerC],
    });

    // Now that we've reached the threshold, send the transactoin.
    await program.rpc.executeTransaction({
      accounts: {
        multisig: multisig.publicKey,
        multisigSigner,
        proposal: proposal.publicKey,
      },
      remainingAccounts: program.instruction.setValidators
        .accounts({
          multisig: multisig.publicKey,
          multisigSigner,
        })
        // Change the signer status on the vendor signer since it's signed by the program, not the client.
        .map((meta) =>
          meta.pubkey.equals(multisigSigner)
            ? { ...meta, isSigner: false }
            : meta
        )
        .concat({
          pubkey: program.programId,
          isWritable: false,
          isSigner: false,
        }),
    });

    // multisigAccount = await program.account.multisig.fetch(multisig.publicKey);

    // assert.strictEqual(multisigAccount.nonce, nonce);
    // assert.ok(multisigAccount.threshold.eq(new anchor.BN(2)));
    // assert.deepStrictEqual(multisigAccount.validators, validators);
    // assert.ok(multisigAccount.ownerSetSeqno === 1);
  });

  // it("Assert Unique Owners", async () => {
  //   const multisig = anchor.web3.Keypair.generate();
  //   const [_multisigSigner, nonce] =
  //     await anchor.web3.PublicKey.findProgramAddress(
  //       [multisig.publicKey.toBuffer()],
  //       program.programId
  //     );
  //   const multisigSize = 200; // Big enough.

  //   const ownerA = anchor.web3.Keypair.generate();
  //   const ownerB = anchor.web3.Keypair.generate();
  //   const owners = [ownerA.publicKey, ownerB.publicKey, ownerA.publicKey];

  //   const threshold = new anchor.BN(2);
  //   try {
  //     await program.rpc.createMultisig(owners, threshold, nonce, {
  //       accounts: {
  //         multisig: multisig.publicKey,
  //         rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //       },
  //       instructions: [
  //         await program.account.multisig.createInstruction(
  //           multisig,
  //           multisigSize
  //         ),
  //       ],
  //       signers: [multisig],
  //     });
  //     assert.fail();
  //   } catch (err) {
  //     const error = err.error;
  //     assert.strictEqual(error.errorCode.number, 6008);
  //     assert.strictEqual(error.errorMessage, "Owners must be unique");
  //   }
  // });
});