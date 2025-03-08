"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// 1 - Load dependencies 
var web3_js_1 = require("@solana/web3.js");
// 2 - Declare constants 
// Fetch secrets from ./account-data
var SECRET1 = [31, 154, 218, 49, 48, 146, 129, 135, 241, 147, 97, 254, 112, 21, 143, 172, 161, 109, 80, 151, 92, 59, 165, 3, 187, 76, 121, 225, 50, 172, 129, 117, 183, 19, 134, 102, 7, 80, 37, 82, 165, 148, 136, 101, 249, 213, 154, 85, 204, 123, 106, 83, 123, 223, 84, 31, 53, 153, 11, 129, 117, 53, 65, 122];
var SECRET2 = [92, 232, 200, 202, 211, 93, 178, 222, 160, 252, 38, 195, 150, 237, 173, 122, 254, 202, 222, 228, 52, 182, 183, 172, 96, 105, 229, 170, 203, 91, 158, 38, 33, 215, 125, 7, 175, 127, 125, 132, 97, 104, 222, 92, 145, 126, 178, 253, 107, 118, 252, 124, 74, 33, 140, 150, 92, 19, 104, 248, 30, 18, 228, 41];
// Get wallets from secrets
var SIGNER_WALLET = web3_js_1.Keypair.fromSecretKey(new Uint8Array(SECRET1));
var DESTINATION_WALLET = web3_js_1.Keypair.fromSecretKey(new Uint8Array(SECRET2));
// Initialise connection
var CONNECTION = new web3_js_1.Connection("https://api.devnet.solana.com");
// 3 - Build, sign and send v0 transactions to cluster & confirm. 
function createAndSendV0Tx(txInstructions) {
    return __awaiter(this, void 0, void 0, function () {
        var latestBlockhash, messageV0, transaction, txid, confirmation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, CONNECTION.getLatestBlockhash('finalized')];
                case 1:
                    latestBlockhash = _a.sent();
                    console.log("   ✅ - Fetched latest blockhash. Last valid height:", latestBlockhash.lastValidBlockHeight);
                    messageV0 = new web3_js_1.TransactionMessage({
                        payerKey: SIGNER_WALLET.publicKey,
                        recentBlockhash: latestBlockhash.blockhash,
                        instructions: txInstructions
                    }).compileToV0Message();
                    console.log("   ✅ - Compiled transaction message");
                    transaction = new web3_js_1.VersionedTransaction(messageV0);
                    // 3.3 - Sign transaction
                    transaction.sign([SIGNER_WALLET]);
                    console.log("   ✅ - Transaction Signed");
                    return [4 /*yield*/, CONNECTION.sendTransaction(transaction, { maxRetries: 5 })];
                case 2:
                    txid = _a.sent();
                    console.log("   ✅ - Transaction sent to network");
                    return [4 /*yield*/, confirmTransaction(CONNECTION, txid)];
                case 3:
                    confirmation = _a.sent();
                    if (confirmation.err) {
                        throw new Error("   ❌ - Transaction not confirmed.");
                    }
                    console.log('🎉 Transaction succesfully confirmed!', '\n', "https://explorer.solana.com/tx/".concat(txid, "?cluster=devnet"));
                    return [2 /*return*/];
            }
        });
    });
}
// 3.5 continued - Confirm transaction logic 
// Remark: Not really sure how this works, but it does lol. 
function confirmTransaction(connection_1, signature_1) {
    return __awaiter(this, arguments, void 0, function (connection, signature, desiredConfirmationStatus, timeout, pollInterval, searchTransactionHistory) {
        var start, statuses, status_1;
        if (desiredConfirmationStatus === void 0) { desiredConfirmationStatus = 'confirmed'; }
        if (timeout === void 0) { timeout = 30000; }
        if (pollInterval === void 0) { pollInterval = 1000; }
        if (searchTransactionHistory === void 0) { searchTransactionHistory = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    _a.label = 1;
                case 1:
                    if (!(Date.now() - start < timeout)) return [3 /*break*/, 6];
                    return [4 /*yield*/, connection.getSignatureStatuses([signature], { searchTransactionHistory: searchTransactionHistory })];
                case 2:
                    statuses = (_a.sent()).value;
                    if (!statuses || statuses.length === 0) {
                        throw new Error('Failed to get signature status');
                    }
                    status_1 = statuses[0];
                    if (!(status_1 === null)) return [3 /*break*/, 4];
                    // If status is null, the transaction is not yet known
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, pollInterval); })];
                case 3:
                    // If status is null, the transaction is not yet known
                    _a.sent();
                    return [3 /*break*/, 1];
                case 4:
                    if (status_1.err) {
                        throw new Error("Transaction failed: ".concat(JSON.stringify(status_1.err)));
                    }
                    if (status_1.confirmationStatus && status_1.confirmationStatus === desiredConfirmationStatus) {
                        return [2 /*return*/, status_1];
                    }
                    if (status_1.confirmationStatus === 'finalized') {
                        return [2 /*return*/, status_1];
                    }
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, pollInterval); })];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 6: throw new Error("Transaction confirmation timeout after ".concat(timeout, "ms"));
            }
        });
    });
}
// 4 - Create address lookup table
function createALT() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, lookupTableInst, lookupTableAddress, _b, _c;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _c = (_b = web3_js_1.AddressLookupTableProgram).createLookupTable;
                    _d = {
                        authority: SIGNER_WALLET.publicKey,
                        payer: SIGNER_WALLET.publicKey
                    };
                    return [4 /*yield*/, CONNECTION.getSlot()];
                case 1:
                    _a = _c.apply(_b, [(_d.recentSlot = _e.sent(),
                            _d)]), lookupTableInst = _a[0], lookupTableAddress = _a[1];
                    console.log("Lookup Table Address:", lookupTableAddress.toBase58());
                    // 4.2 - Send instruction to network
                    createAndSendV0Tx([lookupTableInst]);
                    return [2 /*return*/];
            }
        });
    });
}
// 5 - Run createALT() to get alt-address. Placeholder is stored in alt-address.json
var LOOKUP_TABLE_ADDRESS = new web3_js_1.PublicKey("EwidZyZb5kgYjPRcBindchDC2FZVMWTZoyeSfBYfh3dt");
// 6 - Add addresses to ALT
function addAddressesToTable(addresses) {
    return __awaiter(this, void 0, void 0, function () {
        var addAddressesInstruction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    addAddressesInstruction = web3_js_1.AddressLookupTableProgram.extendLookupTable({
                        payer: SIGNER_WALLET.publicKey,
                        authority: SIGNER_WALLET.publicKey,
                        lookupTable: LOOKUP_TABLE_ADDRESS,
                        addresses: addresses
                    });
                    // 6.2 - Send transaction to cluster
                    return [4 /*yield*/, createAndSendV0Tx([addAddressesInstruction])];
                case 1:
                    // 6.2 - Send transaction to cluster
                    _a.sent();
                    // 6.3 - Display lookup table addresses 
                    console.log("Lookup Table Entries: ", "https://explorer.solana.com/address/".concat(LOOKUP_TABLE_ADDRESS.toString(), "/entries?cluster=devnet"));
                    return [2 /*return*/];
            }
        });
    });
}
// Use solana-cli to get addresses from secrets, see README
var ADDRESS_TO_ADD_1 = new web3_js_1.PublicKey("3H72vD3cQ1prNYMvutbioiLyxEjCdt3JQyF8UyGamqW8");
var ADDRESS_TO_ADD_2 = new web3_js_1.PublicKey('33bisyw9cXs5HvKXDaftjwZzKCeHf7K4UThuAj6MFByY');
addAddressesToTable([ADDRESS_TO_ADD_1, ADDRESS_TO_ADD_2]);
