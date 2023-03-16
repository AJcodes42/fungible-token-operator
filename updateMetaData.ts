import { Transaction, Keypair, Connection, PublicKey } from "@solana/web3.js";
import { bundlrStorage, findMetadataPda, keypairIdentity, Metaplex, UploadMetadataInput } from '@metaplex-foundation/js';
import { DataV2, createCreateMetadataAccountV2Instruction,createUpdateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata';
import secret from './walletSecret.json'; // dummy private key

/**
 * Creating connection with solana network
 */
const endpoint = 'https://api.devnet.solana.com/'; 
const solanaConnection = new Connection(endpoint);

/**
 * Defining token metadata
 */
const MY_TOKEN_METADATA: UploadMetadataInput = {
    name: "HippoCoin",
    symbol: "HIPP0",
    description: "This is a hippo token!!!",
    image: "https://ipfs.io/ipfs/bafybeidljnhkf3oaoyux7gubcl6glv5sptqvbmqpg2dgmk7lkliai5g7de?filename=DALL%C2%B7E%202023-03-16%2017.26.56%20-%20Cute%20cartoon%20hippo%20looking%20in%20front.png" //add public URL to image you'd like to use
}

const ON_CHAIN_METADATA = {
    name: MY_TOKEN_METADATA.name, 
    symbol: MY_TOKEN_METADATA.symbol,
    uri: 'TO_UPDATE_LATER',
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null
} as DataV2;

/**
 * This method uploadMetaData and return arweave url
 * @param keypair 
 * @param tokenMetadata 
 * @returns 
 */
const uploadMetadata = async(keypair: Keypair, tokenMetadata: UploadMetadataInput):Promise<string> => {
    //create metaplex instance on devnet using this wallet
    const metaplex = Metaplex.make(solanaConnection)
        .use(keypairIdentity(keypair))
        .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: endpoint,
        timeout: 60000,
        }));
    
    //Upload to Arweave
    const { uri } = await metaplex.nfts().uploadMetadata(tokenMetadata);
    console.log(`Arweave URL: `, uri);
    return uri;
}

/**
 * This method create transaction for adding metadata
 * @param mintKeypair 
 * @param mintAuthority 
 * @returns 
 */
const addMetaDataTransaction = async (mintKeypair: PublicKey, mintAuthority: PublicKey)=>{
    const metadataPDA = await findMetadataPda(mintKeypair);

    const addMetaDataTransaction = new Transaction().add(
        createCreateMetadataAccountV2Instruction({
            metadata: metadataPDA, 
            mint: mintKeypair, 
            mintAuthority: mintAuthority,
            payer: mintAuthority,
            updateAuthority: mintAuthority,
          },
          { createMetadataAccountArgsV2: 
            { 
              data: ON_CHAIN_METADATA, 
              isMutable: true 
            } 
          }
        )
    );


    return addMetaDataTransaction;
}

/**
 * This method create metadata for updating metadata
 */
const updateMetaDataTransaction = async (mintKeypair: PublicKey, mintAuthority: PublicKey)=>{
    const metadataPDA = await findMetadataPda(mintKeypair);

    const updateMetaDataTransaction = new Transaction().add(
        createUpdateMetadataAccountV2Instruction(
            {
              metadata: metadataPDA,
              updateAuthority: mintKeypair,
            },
            {
              updateMetadataAccountArgsV2: {
                data: ON_CHAIN_METADATA,
                updateAuthority: mintKeypair,
                primarySaleHappened: true,
                isMutable: true,
              }
            }
        )
    );


    return updateMetaDataTransaction;
}

const main = async() => {
    console.log(`---STEP 1: Uploading MetaData---`);
    const bankWalletKeyPair = Keypair.fromSecretKey(new Uint8Array(secret));
    let metadataUri = await uploadMetadata(bankWalletKeyPair, MY_TOKEN_METADATA);
    ON_CHAIN_METADATA.uri = metadataUri;

    console.log(`---STEP 2: Creating Transaction---`);

    const MINT_ADDRESS = "9e5H7DWECb69zDifMHAnx2R7r1SWMAa3xHF9NYQr76gM"; // put correct mint address
    const mintKeypair = new PublicKey(MINT_ADDRESS);
    const addMetaDataTx:Transaction = await addMetaDataTransaction(
        mintKeypair,
        bankWalletKeyPair.publicKey
    );

    // const updateMetaDataTx:Transaction = await updateMetaDataTransaction(
    //     mintKeypair,
    //     bankWalletKeyPair.publicKey
    // );

    console.log(`---STEP 3: Executing Transaction---`);
    const transactionId =  await solanaConnection.sendTransaction(addMetaDataTx, [bankWalletKeyPair,bankWalletKeyPair]);
    console.log(`Transaction ID: `, transactionId);
    console.log(`View Transaction: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
}

main();