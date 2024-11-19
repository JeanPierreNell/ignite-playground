// @ts-ignore
import IgniteClient from 'apache-ignite-client';
import { getSQL, initSQL, initTables, insertSQL } from './sql';

let igniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
let cacheConfiguration = IgniteClient.CacheConfiguration;
const objectType = IgniteClient.ObjectType;

let igniteClient = IgniteClient.IgniteClient;
let cache = IgniteClient.cache;

async function connectClient() {
    igniteClient = new IgniteClient(onStateChanged);
    try {
        igniteClientConfiguration = new igniteClientConfiguration(
            '127.0.0.1:10800', '127.0.0.1:10801', '127.0.0.1:10802');
        // Connect to Ignite node
        await igniteClient.connect(igniteClientConfiguration);
    }
    catch (err: any) {
        console.log(err.message);
    }
}

async function getOrCreateCacheByName() {
    let config = new cacheConfiguration().setSqlSchema('PUBLIC');
    config = await initSQL(config);

    cache = (await igniteClient.getOrCreateCache('myCache', config
    )).setKeyType(objectType.PRIMITIVE_TYPE.INTEGER);

    await initTables(cache);
}


// @ts-ignore
function onStateChanged(state, reason) {
    if (state === IgniteClient.STATE.CONNECTED) {
        console.log('Client is started');
    }
    else if (state === IgniteClient.STATE.CONNECTING) {
        console.log('Client is connecting');
    }
    else if (state === IgniteClient.STATE.DISCONNECTED) {
        console.log('Client is stopped');
        if (reason) {
            console.log(reason);
        }
    }
}

async function simplePut() {
    await cache.put(1, 'Hello World!');

    const returnedValue = await cache.get(1);
    console.log(returnedValue);
}

async function startServer() {
    await connectClient();
    await getOrCreateCacheByName();

    // simplePut();

    for (let i = 0; i < 15; i++) {
        const salary = Math.random() * 3000;
        const name = `User ${i.toString()}`;

        await insertSQL(cache, name, salary);
    }

    await getSQL(cache, 1000, 3000);
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

startServer();

