import { readFileSync } from 'fs';
import { EncryptMethod, Field, Fields, FIXParser, Message, Messages, OrderTypes, Side, TimeInForce } from 'free-fx';
const dotenv = await import('dotenv');
dotenv.config();
import currencyEmitter from './index.js';

const requestSymbolsList = [{ symbol: 'FX.EURUSD', id: '1' }, { symbol: 'FX.GBPUSD', id: '2' }, { symbol: 'FX.AUDUSD', id: '3' }, { symbol: 'FX.NZDUSD', id: '4' }, { symbol: 'FX.USDJPY', id: '5' }, { symbol: 'FX.USDCHF', id: '6' }, { symbol: 'FX.USDCAD', id: '7' }, { symbol: 'FX.USDRUB', id: '8' }, { symbol: 'FX.USDHKD', id: '9' }]



const fixParser = new FIXParser();
const SENDER = process.env.FIX_SENDER;
const TARGET = process.env.FIX_TARGET;
const Password = process.env.FIX_PASSWORD;



let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10000000; // Maximum number of reconnect attempts
const RECONNECT_INTERVAL = 100; // Initial reconnect interval in milliseconds

export function fixClient() {
    let EUR = { symbol: 'EURUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
    let GBP = { symbol: 'GBPUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
    let AUD = { symbol: 'AUDUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
    let NZD = { symbol: 'NZDUSD', bid: undefined, ask: undefined, lastUpdateTime: undefined };

    let CAD = { symbol: 'USDCAD', bid: undefined, ask: undefined, lastUpdateTime: undefined };
    let JPY = { symbol: 'USDJPY', bid: undefined, ask: undefined, lastUpdateTime: undefined };
    let CHF = { symbol: 'USDCHF', bid: undefined, ask: undefined, lastUpdateTime: undefined };
    let RUB = { symbol: 'USDRUB', bid: undefined, ask: undefined, lastUpdateTime: undefined };
    let HKD = { symbol: 'USDHKD', bid: undefined, ask: undefined, lastUpdateTime: undefined };



    const CONNECT_PARAMS = {
        host: 'platform.unity.finance',
        port: 21001,
        protocol: 'tls-tcp',
        ConnectionType: 'initiator',
        sender: SENDER,
        target: TARGET,
        fixVersion: 'FIX.4.4',
        tlsUseSNI: false,
        logging: false,
        onOpen: () => {
            console.log('Establishing connection with endpoint for prices.');
            sendLogon();
            reconnectAttempts = 0;
        },
        onMessage: async (message) => {
            const msg = message.encode('|');
            const parsedJSON = parseFixMessage(msg);
            if (parsedJSON['35'] === 'A') {
                console.log('connection Established and logon completed.');
                console.log('Now Requesting for Market Data');
                requestMarketData();
            } else if (parsedJSON['35'] === 'W') {
                const { symbol, bidPrice, askPrice } = updateBidAskPricesAndSymbol(msg);
                const currentTime = Date.now();
                // console.log(symbol)
                switch (symbol) {
                    case 'EURUSD':
                        EUR.bid = bidPrice;
                        EUR.ask = askPrice;
                        EUR.lastUpdateTime = currentTime;
                        currencyEmitter.emit('currencyUpdate', EUR);
                        break;
                    case 'GBPUSD':
                        GBP.bid = bidPrice;
                        GBP.ask = askPrice;
                        GBP.lastUpdateTime = currentTime;
                        currencyEmitter.emit('currencyUpdate', GBP);
                        break;
                    case 'AUDUSD':
                        AUD.bid = bidPrice;
                        AUD.ask = askPrice;
                        AUD.lastUpdateTime = currentTime;
                        currencyEmitter.emit('currencyUpdate', AUD);
                        break;
                    case 'NZDUSD':
                        NZD.bid = bidPrice;
                        NZD.ask = askPrice;
                        NZD.lastUpdateTime = currentTime;
                        currencyEmitter.emit('currencyUpdate', NZD);
                        break;
                    case 'USDCAD':
                        CAD.bid = (1 / bidPrice);
                        CAD.ask = (1 / askPrice);
                        CAD.lastUpdateTime = currentTime;
                        currencyEmitter.emit('currencyUpdate', CAD);
                        break;
                    case 'USDJPY':
                        JPY.bid = (1 / bidPrice);
                        JPY.ask = (1 / askPrice);
                        JPY.lastUpdateTime = currentTime;
                        currencyEmitter.emit('currencyUpdate', JPY);
                        break;
                    case 'USDCHF':
                        CHF.bid = (1 / bidPrice);
                        CHF.ask = (1 / askPrice);
                        CHF.lastUpdateTime = currentTime;
                        currencyEmitter.emit('currencyUpdate', CHF);
                        break;
                    case 'USDRUB':
                        RUB.bid = (1 / bidPrice);
                        RUB.ask = (1 / askPrice);
                        RUB.lastUpdateTime = currentTime;
                        currencyEmitter.emit('currencyUpdate', RUB);
                        break;
                    case 'USDHKD':
                        HKD.bid = (1 / bidPrice);
                        HKD.ask = (1 / askPrice);
                        HKD.lastUpdateTime = currentTime;
                        currencyEmitter.emit('currencyUpdate', HKD);
                        break;
                    default:
                        console.log('Unknown symbol:', symbol);
                }
            }
        },
        onClose: () => handleDisconnect(CONNECT_PARAMS),
    };
    fixParser.connect(CONNECT_PARAMS);
}



const sendLogon = () => {
    const logon = fixParser.createMessage(
        new Field(Fields.MsgType, Messages.Logon),
        new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
        new Field(Fields.SenderCompID, SENDER),
        new Field(Fields.SendingTime, fixParser.getTimestamp()),
        new Field(Fields.TargetCompID, TARGET),
        new Field(Fields.EncryptMethod, EncryptMethod.None),
        new Field(Fields.ResetSeqNumFlag, 'Y'),
        new Field(Fields.Password, Password),
        new Field(Fields.HeartBtInt, 30),
    );
    fixParser.send(logon);
};



const requestMarketData = () => {
    requestSymbolsList.forEach(element => {
        console.log(element.symbol);
        const MD = fixParser.createMessage(
            new Field(Fields.MsgType, Messages.MarketDataRequest),
            new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
            new Field(Fields.SenderCompID, SENDER),
            new Field(Fields.SendingTime, fixParser.getTimestamp()),
            new Field(Fields.TargetCompID, TARGET),
            new Field(Fields.MDReqID, element.id),
            new Field(Fields.SubscriptionRequestType, '1'),
            new Field(Fields.MarketDepth, '1'),
            new Field(Fields.MDUpdateType, '0'),
            new Field(Fields.NoRelatedSym, '1'),
            new Field(Fields.Symbol, element.symbol),
            new Field(Fields.NoMDEntryTypes, '2'),
            new Field(Fields.MDEntryType, '0'),
            new Field(Fields.MDEntryType, '1'),
        );
        fixParser.send(MD);
    });
};



function parseFixMessage(fixMessage) {
    const fields = fixMessage.split('|');
    const result = {};

    fields.forEach(field => {
        const [tag, value] = field.split('=');
        result[tag] = value;
    });

    return result;
}

function checkInstrument(symbol) {
    let _type = symbol.split(".")
    for (let i = 0; i < _type.length; i++) {

        if (_type[i] == 'CFD' || _type[i] == 'FX' || _type[i] == 'FU') {
            return true;
        }
    }
    return false;
}

const handleDisconnect = (CONNECT_PARAMS) => {
    console.log('Disconnected');
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
            console.log('Reconnecting...');
            try {
                fixParser.connect(CONNECT_PARAMS);
                reconnectAttempts++;
            } catch (error) {
                console.error('Reconnect failed:', error);
            }
        }, RECONNECT_INTERVAL * Math.pow(2, reconnectAttempts));
    } else {
        console.log('Max reconnect attempts reached. Stopping reconnection attempts.');
    }
};

function updateBidAskPricesAndSymbol(fixMessage) {
    // Split the FIX message by the delimiter "|"
    const entries = fixMessage.split('|');

    // Initialize variables to hold bid and ask prices, and the symbol
    let bidPrice = null;
    let askPrice = null;
    let symbol = null;

    // Loop through each entry in the FIX message
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        // Split the entry by "=" to get the tag and its value
        const [tag, value] = entry.split('=');

        // Check if the tag is Symbol (55)
        if (tag === '55') {
            symbol = value.split('.')[1];
        }
        // Check if the tag is MDEntryType (269)
        else if (tag === '269') {
            // The next entry should be the MDEntryPx (270) with the price
            const nextEntry = entries[i + 1];
            if (nextEntry) {
                const [nextTag, nextValue] = nextEntry.split('=');

                // If MDEntryType is 0 (Bid), update bidPrice
                if (value === '0' && nextTag === '270') {
                    bidPrice = nextValue;
                }
                // If MDEntryType is 1 (Ask), update askPrice
                else if (value === '1' && nextTag === '270') {
                    askPrice = nextValue;
                }
            }
        }
    }

    // Return the bid and ask prices, and the symbol
    return { symbol, bidPrice, askPrice };
}

//EXEC BLOCK

// fixClient();