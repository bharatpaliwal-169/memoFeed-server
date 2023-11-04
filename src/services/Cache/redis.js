// import { createClient } from 'redis';
// import { promisify } from 'util';


// const client = createClient({
//     password: process.env.REDIS_PASS,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT
//     }
// });

// // client.getAsync = promisify(client.get).bind(client);
// // client.setAsync = promisify(client.set).bind(client);

// client.on('error', err => console.log('Redis Client Error', err));
// // await client.connect();


// export default client;

import NodeCache from "node-cache"
const client = new NodeCache();

export default client;