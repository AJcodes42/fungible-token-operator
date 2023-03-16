import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from "@solana/spl-token";
import { Connection, Keypair, ParsedAccountData, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import secret from './walletSecret.json'; // dummy private key

/**
 * Creating connection with solana network
 */
const endpoint = 'https://api.devnet.solana.com/';
const solanaConnection = new Connection(endpoint);

/**
 * Defining KeyPair and mint address
 */
const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(secret));
const MINT_ADDRESS = 'BQi3xCLLJferBFX9vr1g68cV8nKpBGLJ6825izTkNUF2'; //put correct mint address

/**
 * Method to fetch the number of decimals for the mint
 * @param mintAddress 
 * @returns 
 */
async function getNumberDecimals(mintAddress: string):Promise<number> {
    const info = await solanaConnection.getParsedAccountInfo(new PublicKey(MINT_ADDRESS));
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
    return result;
}

/**
 * Method to send tokens to destination_Wallet
 * @param destination_Wallet 
 * @param transfer_Amount 
 */
async function sendTokens(destination_Wallet: String, transfer_Amount: number) {

    console.log(`Sending ${transfer_Amount} ${(MINT_ADDRESS)} from ${(FROM_KEYPAIR.publicKey.toString())} to ${(destination_Wallet)}.`)
    //Step 1
    console.log(`1 - Getting Source Token Account`);
    let sourceAccount = await getOrCreateAssociatedTokenAccount(
        solanaConnection, 
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS),
        FROM_KEYPAIR.publicKey
    );
    console.log(`    Source Account: ${sourceAccount.address.toString()}`);

        //Step 2
        console.log(`2 - Getting Destination Token Account`);
        let destinationAccount = await getOrCreateAssociatedTokenAccount(
            solanaConnection, 
            FROM_KEYPAIR,
            new PublicKey(MINT_ADDRESS),
            new PublicKey(destination_Wallet)
        );
        console.log(`    Destination Account: ${destinationAccount.address.toString()}`);

            //Step 3
    console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS}`);
    const numberDecimals = await getNumberDecimals(MINT_ADDRESS);
    console.log(`    Number of Decimals: ${numberDecimals}`);

        //Step 4
        console.log(`4 - Creating and Sending Transaction`);
        const tx = new Transaction();
        tx.add(createTransferInstruction(
            sourceAccount.address,
            destinationAccount.address,
            FROM_KEYPAIR.publicKey,
            transfer_Amount * Math.pow(10, numberDecimals)
        ))

        const latestBlockHash = await solanaConnection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = await latestBlockHash.blockhash;    
        const signature = await sendAndConfirmTransaction(solanaConnection,tx,[FROM_KEYPAIR]);
        console.log(
            '\x1b[32m', //Green Text
            `   Transaction Success!🎉`,
            `\n    https://explorer.solana.com/tx/${signature}?cluster=devnet`
        );

}

sendTokens("9e5H7DWECb69zDifMHAnx2R7r1SWMAa3xHF9NYQr76gM", 10);