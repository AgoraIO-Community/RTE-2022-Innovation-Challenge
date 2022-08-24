import axios from 'axios';

const request = axios.create({
    baseURL: 'https://api.netless.link/',
    timeout: 2000,
    headers: { 'X-Custom-Header': 'foobar' }
});

export default request;