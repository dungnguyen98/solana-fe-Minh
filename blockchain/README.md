### Events

```
#[event]
pub struct ProposalStatusChanged {
    pub proposal_id: u128,
    pub status: u8, // 1: Submmited, 2: SuccessApproved
} => Submit Proposal, Proposal Executed

#[event]
pub struct ProposalApprovedByValidators {
    pub validator: Pubkey,
    pub proposal_id: u128,
} => Approved by validators

#[event]
pub struct MultisigCreated {
    pub multisig_id: u128,
} => Tag created
```

### Deploy to devnet run: 

```anchor deploy --provider.cluster devnet```

### Devnet contract address: 

```2XiEhWahAGswjrvkGZRDotB5PEYKkjqQoRk8RqXMozko```


======================================

### Run event listen on local

#### Prerequisites:

- Install rust
    ```
    https://www.rust-lang.org/tools/install
    ```
- Install solana-cli
    ```
    https://solanacookbook.com/getting-started/installation.html#install-cli
    ```
- Install anchor-cli: 

    ```
    https://book.anchor-lang.com/getting_started/installation.html
    ```

#### Scripts:

- Build project
```
anchor build
```

- Run local RPC node
```
solana-test-validator
```

- Run event listener
```
anchor run events
```

- Run test script
```
anchor test --skip-local-validator
```

