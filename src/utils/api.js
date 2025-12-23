import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        console.log('Interceptor running. UserInfo:', userInfo); // DEBUG
        if (userInfo) {
            const token = JSON.parse(userInfo).token;
            console.log('Token found:', token); // DEBUG
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log('No userInfo found in localStorage'); // DEBUG
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
