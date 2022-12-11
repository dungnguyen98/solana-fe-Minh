import { BN, Program, ProgramAccount, Wallet, web3 } from "@project-serum/anchor";
import { getProvider } from "../utils/getProvider";
import idl from '../multisig.json';
import { Keypair, PublicKey } from "@solana/web3.js";
import { IdlTypes, TypeDef } from "@project-serum/anchor/dist/cjs/program/namespace/types";
import * as anchor from "@project-serum/anchor";

const programID = new PublicKey(idl.metadata.address);

export const fetchWallets = async (wallet: Wallet) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);

  try {
    /* interact with the program via rpc */
    return program.account.multisig.all()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const fetchTransactions = async (wallet: Wallet) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);

  try {
    /* interact with the program via rpc */
    return await program.account.proposal.all();
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const acceptTransaction = async (
  wallet: Wallet,
  tx: string,
  smartWallet: string,
  callBack?: () => void
) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);

  try {
    /* interact with the program via rpc */
    await program.rpc.approve({
      accounts: {
        smartWallet: new PublicKey(smartWallet),
        transaction: new PublicKey(tx),
        owner: wallet.publicKey,
      }
    })
    callBack && callBack()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const rejectTransaction = async (wallet: Wallet, tx: string, smartWallet: string, callBack?: () => void) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);

  try {
    /* interact with the program via rpc */
    await program.rpc.reject({
      accounts: {
        smartWallet: new PublicKey(smartWallet),
        transaction: new PublicKey(tx),
        owner: wallet.publicKey,
      }
    })
    callBack && callBack()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const executeTransaction = async (wallet: Wallet, tx: string, smartWallet: string, callBack?: () => void) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);

  try {
    /* interact with the program via rpc */
    await program.rpc.executeTransaction({
      accounts: {
        smartWallet: new PublicKey(smartWallet),
        transaction: new PublicKey(tx),
        owner: wallet.publicKey,
      }
    })
    callBack && callBack()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const createWallet = async (wallet: Wallet, owners: string[], threshold: number, callBack?: () => void) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);
  const multisig = anchor.web3.Keypair.generate();
  // const smartWallet = Keypair.fromSecretKey(Buffer.from(programKey));

  try {
    /* interact with the program via rpc */
    // await program.rpc.createSmartWallet(owners.map(o => new PublicKey(o)), new BN(threshold), {
    //   accounts: {
    //     smartWallet: smartWallet.publicKey,
    //     user: provider.wallet.publicKey,
    //     systemProgram: web3.SystemProgram.programId,
    //   },
    //   signers: [smartWallet]
    // })

    const [, nonce] =
    await anchor.web3.PublicKey.findProgramAddress(
      [multisig.publicKey.toBuffer()],
      program.programId
    );
    const multisigSize = 1000; // Big enough.
    const multisigId = new anchor.BN(1);
    const thres = new anchor.BN(1);

    // create multisig
    const tx = await program.rpc.createMultisig(owners.map(o => new PublicKey(o)), thres, nonce, multisigId, {
      accounts: {
        multisig: multisig.publicKey,
        creator: provider.wallet.publicKey
      },
      instructions: [
        await program.account.multisig.createInstruction(
          multisig,
          multisigSize
        ),
      ],
      signers: [multisig],
    });

    callBack && callBack()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}

export const createTransaction = async (wallet: Wallet, smartWallet: string, callBack?: () => void) => {
  if (!wallet) return
  const provider = await getProvider(wallet);
  const program = new Program(idl as any, programID, provider);
  const proposal = anchor.web3.Keypair.generate();
  const proposalId = new anchor.BN(1);
  try {
    // /* interact with the program via rpc */
    // await program.rpc.createProposal({
    //   accounts: {
    //     smartWallet:  new PublicKey(smartWallet),
    //     transaction: transaction.publicKey,
    //     proposer: provider.wallet.publicKey,
    //     systemProgram: web3.SystemProgram.programId,
    //   },
    //   signers: [transaction]
    // })

    
    const txSize = 1000; // Big enough
    await program.rpc.createProposal(proposalId, {
      accounts: {
        multisig: smartWallet,
        proposal: proposal.publicKey,
        creator:  provider.wallet.publicKey
      },
      instructions: [
        await program.account.proposal.createInstruction(
          proposal,
          txSize
        ),
      ],
      signers: [proposal],
    });

    callBack && callBack()
  } catch (err) {
    console.log("Transaction error: ", err);
  }
}