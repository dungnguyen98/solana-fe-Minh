use anchor_lang::prelude::*;

declare_id!("3SunHKjBFnPm9XJn5qqeR9M4janhCexwfJkg5jBnRc2P");

#[program]
pub mod multisig {
    use super::*;

    // Initializes a new multisig account with a set of validators and a threshold.
    pub fn create_multisig(
        ctx: Context<CreateMultisig>,
        validators: Vec<Pubkey>,
        threshold: u64,
        nonce: u8,
        multisig_id: u128,
    ) -> Result<()> {
        assert_unique_validators(&validators)?;
        require!(
            threshold > 0 && threshold <= validators.len() as u64,
            InvalidThreshold
        );
        require!(!validators.is_empty(), InvalidValidatorsLen);
        //TODO: validate multisig_ID

        let multisig = &mut ctx.accounts.multisig;
        multisig.multisig_id = multisig_id;
        multisig.validators = validators;
        multisig.threshold = threshold;
        multisig.nonce = nonce;
        multisig.creator = *ctx.accounts.creator.key;
        multisig.validator_set_seqno = 0;

        emit!(MultisigCreated{
            multisig_id: multisig.multisig_id,
        });

        Ok(())
    }

    // Creates a new transaction account, automatically signed by the creator,
    // which must be one of the Validators of the multisig.
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        proposal_id: u128,
    ) -> Result<()> {

        let mut signers = Vec::new();
        signers.resize(ctx.accounts.multisig.validators.len(), false);

        let proposal = &mut ctx.accounts.proposal;
        proposal.proposal_id = proposal_id;
        proposal.signers = signers;
        proposal.multisig = ctx.accounts.multisig.key();
        proposal.did_execute = false;
        proposal.creator = *ctx.accounts.creator.key;
        proposal.validator_set_seqno = ctx.accounts.multisig.validator_set_seqno;
        proposal.status = ProposalStatus::Submitted;
        
        emit!(ProposalStatusChanged {
            proposal_id: proposal_id,
            status: ProposalStatus::Submitted 
        });

        Ok(())
    }

    // Approves a transaction on behalf of an Validator of the multisig.
    pub fn approve(ctx: Context<Approve>) -> Result<()> {
        let validator_index = ctx
            .accounts
            .multisig
            .validators
            .iter()
            .position(|a| a == ctx.accounts.validator.key)
            .ok_or(ErrorCode::InvalidValidator)?;

        ctx.accounts.proposal.signers[validator_index] = true;

        emit!(ProposalApprovedByValidators{
            validator: ctx.accounts.multisig.validators[validator_index],
            proposal_id: ctx.accounts.proposal.proposal_id,
        });

        Ok(())
    }

    // Set Validators and threshold at once.
    pub fn set_validators_and_change_threshold<'info>(
        ctx: Context<'_, '_, '_, 'info, Auth<'info>>,
        validators: Vec<Pubkey>,
        threshold: u64,
    ) -> Result<()> {
        set_validators(
            Context::new(
                ctx.program_id,
                ctx.accounts,
                ctx.remaining_accounts,
                ctx.bumps.clone(),
            ),
            validators,
        )?;
        change_threshold(ctx, threshold)
    }

    // Sets the Validators field on the multisig. The only way this can be invoked
    // is via a recursive call from execute_transaction -> set_validators.
    pub fn set_validators(ctx: Context<Auth>, validators: Vec<Pubkey>) -> Result<()> {
        assert_unique_validators(&validators)?;
        require!(!validators.is_empty(), InvalidValidatorsLen);

        let multisig = &mut ctx.accounts.multisig;

        if (validators.len() as u64) < multisig.threshold {
            multisig.threshold = validators.len() as u64;
        }

        multisig.validators = validators;
        multisig.validator_set_seqno += 1;

        Ok(())
    }

    // Changes the execution threshold of the multisig. The only way this can be
    // invoked is via a recursive call from execute_transaction ->
    // change_threshold.
    pub fn change_threshold(ctx: Context<Auth>, threshold: u64) -> Result<()> {
        require!(threshold > 0, InvalidThreshold);
        if threshold > ctx.accounts.multisig.validators.len() as u64 {
            return Err(ErrorCode::InvalidThreshold.into());
        }
        let multisig = &mut ctx.accounts.multisig;
        multisig.threshold = threshold;
        Ok(())
    }

    // Executes the given transaction if threshold Validators have signed it.
    pub fn execute_transaction(ctx: Context<ExecuteTransaction>) -> Result<()> {
        // Has this been executed already?
        if ctx.accounts.proposal.did_execute {
            return Err(ErrorCode::AlreadyExecuted.into());
        }

        // Do we have enough signers.
        let sig_count = ctx
            .accounts
            .proposal
            .signers
            .iter()
            .filter(|&did_sign| *did_sign)
            .count() as u64;
        if sig_count < ctx.accounts.multisig.threshold {
            return Err(ErrorCode::NotEnoughSigners.into());
        }

        // Burn the transaction to ensure one time use.
        ctx.accounts.proposal.did_execute = true;
        ctx.accounts.proposal.status = ProposalStatus::Approved;

        emit!(ProposalStatusChanged {
            proposal_id: ctx.accounts.proposal.proposal_id,
            status: ProposalStatus::Approved
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateMultisig<'info> {
    #[account(zero, signer)]
    multisig: Box<Account<'info, Multisig>>,
    creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    multisig: Box<Account<'info, Multisig>>,
    #[account(zero, signer)]
    proposal: Box<Account<'info, Proposal>>,
    creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct Approve<'info> {
    #[account(constraint = multisig.validator_set_seqno == proposal.validator_set_seqno)]
    multisig: Box<Account<'info, Multisig>>,
    #[account(mut, has_one = multisig)]
    proposal: Box<Account<'info, Proposal>>,
    // One of the multisig validators. Checked in the handler.
    validator: Signer<'info>,
}

#[derive(Accounts)]
pub struct Auth<'info> {
    #[account(mut)]
    multisig: Box<Account<'info, Multisig>>,
    #[account(
        seeds = [multisig.key().as_ref()],
        bump = multisig.nonce,
    )]
    multisig_signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteTransaction<'info> {
    #[account(constraint = multisig.validator_set_seqno == proposal.validator_set_seqno)]
    multisig: Box<Account<'info, Multisig>>,
    /// CHECK: multisig_signer is a PDA program signer. Data is never read or written to
    #[account(
        seeds = [multisig.key().as_ref()],
        bump = multisig.nonce,
    )]
    multisig_signer: UncheckedAccount<'info>,
    #[account(mut, has_one = multisig)]
    proposal: Box<Account<'info, Proposal>>,
}

#[account]
pub struct Multisig {
    pub multisig_id: u128, // Tag Id
    pub validators: Vec<Pubkey>,
    pub creator: Pubkey,
    pub threshold: u64,
    pub nonce: u8,
    pub validator_set_seqno: u32,
}

#[account]
pub struct Proposal {
    pub proposal_id: u128,
    pub status: ProposalStatus, // 0: submited, 1: approved, 2: rejected
    // The multisig account this transaction belongs to.
    pub multisig: Pubkey,
    pub creator: Pubkey,
    // signers[index] is true iff multisig.Validators[index] signed the transaction.
    pub signers: Vec<bool>,
    // Boolean ensuring one time execution.
    pub did_execute: bool,
    // Validator set sequence number.
    pub validator_set_seqno: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TransactionAccount {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

fn assert_unique_validators(validators: &[Pubkey]) -> Result<()> {
    for (i, validator) in validators.iter().enumerate() {
        require!(
            !validators.iter().skip(i + 1).any(|item| item == validator),
            UniqueValidators
        )
    }
    Ok(())
}

#[derive(Clone, AnchorDeserialize, AnchorSerialize)]
pub enum ProposalStatus {
    Submitted,
    Approved, 
}

#[event]
pub struct ProposalStatusChanged {
    pub proposal_id: u128,
    pub status: ProposalStatus, 
}

#[event]
pub struct ProposalApprovedByValidators {
    pub validator: Pubkey,
    pub proposal_id: u128,
}

#[event]
pub struct MultisigCreated {
    pub multisig_id: u128,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The given validator is not part of this multisig.")]
    InvalidValidator,
    #[msg("Validators length must be non zero.")]
    InvalidValidatorsLen,
    #[msg("Not enough Validators signed this transaction.")]
    NotEnoughSigners,
    #[msg("Cannot delete a transaction that has been signed by an Validator.")]
    TransactionAlreadySigned,
    #[msg("Overflow when adding.")]
    Overflow,
    #[msg("Cannot delete a transaction the Validator did not create.")]
    UnableToDelete,
    #[msg("The given transaction has already been executed.")]
    AlreadyExecuted,
    #[msg("Threshold must be less than or equal to the number of Validators.")]
    InvalidThreshold,
    #[msg("Validators must be unique")]
    UniqueValidators,
}