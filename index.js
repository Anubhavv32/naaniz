const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://demoapi-c2633.firebaseio.com"
});
const db = admin.firestore();
app.use(cors({ origin: true }));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

// create a product
app.post('/api/product', (req, res) => {
    (async () => {
        try {
        console.log(req.body)
          await db.collection('items').doc('/' + req.body.id + '/')
              .create({ productName: req.body.productName, productPrice: req.body.productPrice });
          return res.status(200).send('Response submitted');
        } catch (error) {
          console.log(error);
          return res.status(500).send(error);
        }
      })();
  });

// read a single product
app.get('/api/product/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('items').doc(req.params.id);
            let product = await document.get();
            let response = product.data();
            if(!response) return res.status(502).send('Product not found.');
            console.log(response, product.data(), '333');
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
        })();
    });

// read all
app.get('/api/product', (req, res) => {
    (async () => {
        try {
            let query = db.collection('items');
            let response = [];
            await query.get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            // console.log(docs);
            Array.isArray(docs) ? docs.map((doc)=> {
                const selectedProduct = {
                    id: doc.id,
                    productName: doc.data().productName,
                    productPrice: doc.data().productPrice,
                };
                response.push(selectedProduct);
            }) : null;
            return res.status(200).send(response);
            });
            
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
        })();
    });

// update
app.put('/api/product/:id', (req, res) => {
(async () => {
    try {
        const document = db.collection('items').doc(req.params.id);
        await document.update({
            productName: req.body.productName,
            productPrice: req.body.productPrice
        });
        return res.status(200).send('Product successfully updated');
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});

// delete
app.delete('/api/product/:id', (req, res) => {
(async () => {
    try {
        const document = db.collection('items').doc(req.params.id);
        await document.delete();
        return res.status(200).send('Product successfully deleted.');
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});

exports.app = functions.https.onRequest(app);