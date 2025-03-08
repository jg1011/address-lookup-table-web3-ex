# Address Lookup Table Exposition

## Setup 

Initialise WSL and setup fresh environment with 

```
curl --proto '=https' --tlsv1.2 -sSfL https://raw.githubusercontent.com/solana-developers/solana-install/main/install.sh | bash
```

Make sure to set your config to devnet

```
solana config set --url devnet
```

This installs solana CLI, node, typescript (iirc), rust, anchor, etc... (basically, everything you need). Then clone the repo and navigate into working dir. 

Setup your own test secret1, secret2 and secret3 with 

```
solana-keygen new --outfile account-data/secret{i}.json
```

We can find the pubkeys for each address with 

```
solana address --keypair account-data/secret{i}.json
```

By convention, the address associated with secret1 is the signer. Airdrop some SOL to this account with 

```
solana airdrop <amount> <address> --url devnet
```

Sometimes this doesn't work. If it doesn't, use the [faucet](https://faucet.solana.com/). 

## Usage

To create the lookup table, uncomment the code underneath part 5 and run a lil 

```
tsc app.ts 
node app.js
```

Store the address printed out in the CLI, and replace the LOOKUP_TABLE_ADDRESS address with it. Then uncomment the addAddressesToTable call and replace addresses to add with the address corresponding to secret2 and secret3. Run a lil 

```
tsc app.ts
node app.js
```

and you'll have a lil lookup table :) nice and easy. 


