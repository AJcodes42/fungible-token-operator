# fungible-token-operator
It allows you to attach metadata to custom solana token and tranfer them to different wallet addresses.

Steps to use this

1) Clone this to your local
2) Give npm install
3) Put correct private key in walletSecret.json . Currently it is having dummy value.
4) If you want to attach metadata to your newly created custom solana token then refer updateMetaData.ts and update your mint address and metadata details in the file. Run it using ts-node updateMetaData.ts command in terminal/CLI.
5) If you want to transfer the custom solana token then refer trasnferToken.ts . Update destination wallet address, mint address and number of tokens you want to send in the file. Run it using ts-node transferToken.ts command in terminal/CLI.

Refer this article for more details:
https://ajaysingh.hashnode.dev/from-scratch-how-to-create-your-own-token-on-solana-with-solana-cli-and-typescript
