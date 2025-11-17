import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'OYh0XsNK66Wlv3lcSrMrhkl2PrAFiYsf',
    socket: {
        host: 'redis-14213.c270.us-east-1-3.ec2.cloud.redislabs.com',
        port: 14213
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar

