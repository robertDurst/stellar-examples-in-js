var StellarSdk = require('stellar-sdk')
var hashs = require('hash.js')
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

const addHashXSigner = async (val, secretKey) => {
    let buffer = new Buffer(val, "hex");
    let hash = hashs.sha256().update(buffer).digest('hex');

    try {
        var keypair = StellarSdk.Keypair.fromSecret(secretKey);
        let account = await server.loadAccount(keypair.publicKey());

        var transaction = new StellarSdk.TransactionBuilder(account)
            .addOperation(StellarSdk.Operation.setOptions({
                signer: {
                    sha256Hash: hash,
                    weight: 1
                }
            }))
            .build();
            
        transaction.sign(keypair);
        await server.submitTransaction(transaction);
        console.log("Submitted successfully");
    } catch (err) {
        console.log("Submission error:", err.data.extras);
    }
}

const sendTxWithHashXSigner = async (val, secretKey) => {
    try {
        var keypair = StellarSdk.Keypair.fromSecret(secretKey);
        let account = await server.loadAccount(keypair.publicKey());

        // Just an example tx, obviously can be anything.
        // Also, this signer is not removed, so once you
        // publish this, BEWARE!!!
        var transaction = new StellarSdk.TransactionBuilder(account)
            .addOperation(StellarSdk.Operation.payment({
                destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
                asset: StellarSdk.Asset.native(),
                amount: "1"
            }))
            .build();
            
        transaction.signHashX(val);

        await server.submitTransaction(transaction);
        console.log("Submitted successfully");
    } catch (err) {
        console.log("Submission error:", err.data.extras);
    }
}