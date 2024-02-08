//Update 2.0-------
import express from 'express';
import EventEmitter from 'events';
import { fixClient } from './fixPriceClient.js';
class CurrencyEmitter extends EventEmitter { }
const currencyEmitter = new CurrencyEmitter();
const dotenv = await import('dotenv');
dotenv.config();
// Initialize Express app
const app = express();

const port = process.env.REST_API_PORT;// Port where the server will listen


let EUR = { symbol: 'EURUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
let GBP = { symbol: 'GBPUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
let AUD = { symbol: 'AUDUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
let NZD = { symbol: 'NZDUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };

let CAD = { symbol: 'USDCAD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
let JPY = { symbol: 'USDJPY', bid: undefined, ask: undefined, lastUpdateTime: undefined };
let CHF = { symbol: 'USDCHF', bid: undefined, ask: undefined, lastUpdateTime: undefined };
let RUB = { symbol: 'USDRUB', bid: undefined, ask: undefined, lastUpdateTime: undefined };



currencyEmitter.on('currencyUpdate', (data) => {
  if (data.symbol === 'EURUSD') {
    EUR = data;
    console.log('Updated EURUSD data:', data);
  }
  if (data.symbol === 'GBPUSD') {
    GBP = data;
    console.log('Updated GBPUSD data:', data);
  }
  if (data.symbol === 'AUDUSD') {
    AUD = data;
    console.log('Updated AUDUSD data:', data);
  }
  if (data.symbol === 'NZDUSD') {
    NZD = data;
    console.log('Updated NZDUSD data:', data);
  }
  if (data.symbol === 'USDJPY') {
    JPY = data;
    console.log('Updated JPYUSD data:', data);
  }
  if (data.symbol === 'USDCAD') {
    CAD = data;
    console.log('Updated CADUSD data:', data);
  }
  if (data.symbol === 'USDCHF') {
    CHF = data;
    console.log('Updated CHFUSD data:', data);
  }
  if (data.symbol === 'USDRUB') {
    RUB = data;
    console.log('Updated RUBUSD data:', data);
  }
});
export default currencyEmitter;



// Define REST API endpoint to get currency prices
app.get('/prices', (req, res) => {
  const timestamp = Date.now();
  let currencies = [EUR, GBP, CAD, JPY, CHF, timestamp];
  res.json(currencies);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Currency price server listening at http://localhost:${port}`);
});



fixClient();
//Update 2.0-------