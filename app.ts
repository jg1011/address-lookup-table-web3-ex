// 1 - Load dependencies 
import { 
    AddressLookupTableProgram, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, 
    TransactionInstruction, TransactionMessage, VersionedTransaction, TransactionSignature, 
    TransactionConfirmationStatus, SignatureStatus } from '@solana/web3.js';

// 2 - Declare constants 

// Fetch secrets from ./account-data
const SECRET1 = [31,154,218,49,48,146,129,135,241,147,97,254,112,21,143,172,161,109,80,151,92,59,165,3,187,76,121,225,50,172,129,117,183,19,134,102,7,80,37,82,165,148,136,101,249,213,154,85,204,123,106,83,123,223,84,31,53,153,11,129,117,53,65,122];
const SECRET2 = [92,232,200,202,211,93,178,222,160,252,38,195,150,237,173,122,254,202,222,228,52,182,183,172,96,105,229,170,203,91,158,38,33,215,125,7,175,127,125,132,97,104,222,92,145,126,178,253,107,118,252,124,74,33,140,150,92,19,104,248,30,18,228,41];

// Get wallets from secrets
const SIGNER_WALLET = Keypair.fromSecretKey(new Uint8Array(SECRET1));
const DESTINATION_WALLET = Keypair.fromSecretKey(new Uint8Array(SECRET2));

// Initialise connection
const CONNECTION = new Connection(`https://api.devnet.solana.com`)

// 3 - Build, sign and send v0 transactions to cluster & confirm. 

async function createAndSendV0Tx(txInstructions: TransactionInstruction[]) {
    // 3.1 - Fetch latest blockhash
    let latestBlockhash = await CONNECTION.getLatestBlockhash('finalized');
    console.log("   ✅ - Fetched latest blockhash. Last valid height:", latestBlockhash.lastValidBlockHeight);

    // 3.2 - Build transaction message
    const messageV0 = new TransactionMessage({
        payerKey: SIGNER_WALLET.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: txInstructions
    }).compileToV0Message();
    console.log("   ✅ - Compiled transaction message");
    const transaction = new VersionedTransaction(messageV0);

    // 3.3 - Sign transaction
    transaction.sign([SIGNER_WALLET]);
    console.log("   ✅ - Transaction Signed");

    // 3.4 - Send transaction to cluster
    const txid = await CONNECTION.sendTransaction(transaction, { maxRetries: 5 });
    console.log("   ✅ - Transaction sent to network");

    // 3.5 - Confirm transaction 
    const confirmation = await confirmTransaction(CONNECTION, txid);
    if (confirmation.err) { throw new Error("   ❌ - Transaction not confirmed.") }
    console.log('🎉 Transaction succesfully confirmed!', '\n', `https://explorer.solana.com/tx/${txid}?cluster=devnet`);
}

// 3.5 continued - Confirm transaction logic 

// Remark: Not really sure how this works, but it does lol. 
async function confirmTransaction(
    connection: Connection,
    signature: TransactionSignature,
    desiredConfirmationStatus: TransactionConfirmationStatus = 'confirmed',
    timeout: number = 30000,
    pollInterval: number = 1000,
    searchTransactionHistory: boolean = false
): Promise<SignatureStatus> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        const { value: statuses } = await connection.getSignatureStatuses([signature], { searchTransactionHistory });

        if (!statuses || statuses.length === 0) {
            throw new Error('Failed to get signature status');
        }

        const status = statuses[0];

        if (status === null) {
            // If status is null, the transaction is not yet known
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            continue;
        }

        if (status.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
        }

        if (status.confirmationStatus && status.confirmationStatus === desiredConfirmationStatus) {
            return status;
        }

        if (status.confirmationStatus === 'finalized') {
            return status;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Transaction confirmation timeout after ${timeout}ms`);
}

// 4 - Create address lookup table

async function createALT() {
    // 4.1 - Get instruction and address w/ builtin function
    const [lookupTableInst, lookupTableAddress] =
        AddressLookupTableProgram.createLookupTable({
            authority: SIGNER_WALLET.publicKey,
            payer: SIGNER_WALLET.publicKey,
            recentSlot: await CONNECTION.getSlot(),
        });

    console.log("Lookup Table Address:", lookupTableAddress.toBase58());

    // 4.2 - Send instruction to network
    createAndSendV0Tx([lookupTableInst]);
}

// 5 - Create ALT and get address
    // createALT()
const LOOKUP_TABLE_ADDRESS = new PublicKey(`EwidZyZb5kgYjPRcBindchDC2FZVMWTZoyeSfBYfh3dt`)

// 6 - Add addresses to ALT

async function addAddressesToTable(addresses: Array<PublicKey>) {
    // 6.1 - Build transaction instruction
    const addAddressesInstruction = AddressLookupTableProgram.extendLookupTable({
        payer: SIGNER_WALLET.publicKey,
        authority: SIGNER_WALLET.publicKey,
        lookupTable: LOOKUP_TABLE_ADDRESS,
        addresses: addresses
    });
    // 6.2 - Send transaction to cluster
    await createAndSendV0Tx([addAddressesInstruction]);
    // 6.3 - Display lookup table addresses, doesn't work properly just use SolScan
    console.log(`Lookup Table Entries: `,`https://explorer.solana.com/address/${LOOKUP_TABLE_ADDRESS.toString()}/entries?cluster=devnet`)
}

// Use solana-cli to get addresses from secrets, see README 
// REPLACE THESE WITH YOUR OWN
const ADDRESS_TO_ADD_1 = new PublicKey(`3H72vD3cQ1prNYMvutbioiLyxEjCdt3JQyF8UyGamqW8`); 
const ADDRESS_TO_ADD_2 = new PublicKey('33bisyw9cXs5HvKXDaftjwZzKCeHf7K4UThuAj6MFByY'); 
    // addAddressesToTable([ADDRESS_TO_ADD_1, ADDRESS_TO_ADD_2]);



