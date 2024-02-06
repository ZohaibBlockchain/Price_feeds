//Update 2.0-------
import express from 'express';
import EventEmitter from 'events';
import { fixClient } from './fixPriceClient.js';
class CurrencyEmitter extends EventEmitter {}
const currencyEmitter = new CurrencyEmitter();
// Initialize Express app
const app = express();
const port = 3000; // Port where the server will listen


let EUR = { symbol: 'EURUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
let GBP = { symbol: 'GBPUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
let CAD = { symbol: 'CADUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
let JPY = { symbol: 'JPYUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
let CHF = { symbol: 'CHFUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };


currencyEmitter.on('currencyUpdate', (data) => {
  if (data.symbol === 'EURUSD') {
    EUR = data;
    // console.log('Updated EUR data:', data);
  }
  if (data.symbol === 'GBPUSD') {
    GBP = data;
    // console.log('Updated EUR data:', data);
  }
  if (data.symbol === 'JPYUSD') {
    JPY = data;
    // console.log('Updated EUR data:', data);
  }
  if (data.symbol === 'CADUSD') {
    CAD = data;
    // console.log('Updated EUR data:', data);
  }
  if (data.symbol === 'CHFUSD') {
    CHF = data;
    // console.log('Updated EUR data:', data);
  }
});
export default currencyEmitter;


// Define REST API endpoint to get currency prices
app.get('/prices', (req, res) => {
  let currencies = [EUR, GBP, CAD, JPY, CHF];
    res.json(currencies);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Currency price server listening at http://localhost:${port}`);
});



fixClient();
//Update 2.0-------