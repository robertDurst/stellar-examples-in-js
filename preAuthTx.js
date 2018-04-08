var StellarSdk = require('stellar-sdk')
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

const addPreAuthSigner = async (secretKey) => {
    try {
        var keypair = StellarSdk.Keypair.fromSecret(secretKey);

        // Get an account object
        let account = await server.loadAccount(keypair.publicKey());

        // Increment this account object's sequence number
        account.incrementSequenceNumber()

        // Create a valid transaction with the incremented sequence number.
        // Notice that we don't have to sign this tx because once it is
        // added as a signer to the account it is valid.
        // This tx can obviously be anything.
        // Once this tx is submitted, the signer is removed.
        var preAuthTx = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.payment({
            destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
            asset: StellarSdk.Asset.native(),
            amount: "1"
        }))
        .build()
        
        // Get the account object again.
        // This time don't increment the sequence number.
        account = await server.loadAccount(keypair.publicKey());

        // Set the preAuthTx as a signer on the account
        var transaction = new StellarSdk.TransactionBuilder(account)
                .addOperation(StellarSdk.Operation.setOptions({
                    signer: {
                        preAuthTx: preAuthTx.hash(),
                        weight: 1
                      }
                }))
                .build()
                
                transaction.sign(keypair)
        

        await server.submitTransaction(transaction);

        // Return the preAuthTx.
        // This tx is ready to go and as long as the sequence number is
        // still valid, can be propgated at any time.
        return preAuthTx;
    } catch (err) {
        console.log(err.data ? err.data.extras : err)
    }
};
