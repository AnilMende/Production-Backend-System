import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        //Enable tls , required for rediss://
        tls: true,
        rejectUnauthorized : false,
        //set servername for SNI
        // Upstash uses shared infrastructure where multiple databases reside on one IP. 
        // Without the servername, the TLS handshake may fail to identify 
        // which database you're targeting, causing a timeout.
        servername: new URL(process.env.REDIS_URL).hostname,
        //increase timeout to allow for slower handshakes
        //The default 5-second window is often too short for a full TCP + TLS handshake 
        // when connecting to a remote serverless provider like Upstash.
        connectTimeout: 10000
        //use IPV4 to avoid common local IPV6 connection hangs
        //family: 4,
        //keep connection alive to prevent idle drops
        //keepAlive: 10000
    }
})

redisClient.on("error", (err) => {
    console.error("Redis error", err);
})

await redisClient.connect();

console.log('Connected to Redis')

export default redisClient;