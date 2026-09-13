const axios = require('axios');
const http = require('http');

async function test() {
  try {
    const axiosInstance = axios.create({
      baseURL: 'http://127.0.0.1:3001',
      withCredentials: true,
      httpAgent: new http.Agent({ keepAlive: true }),
    });

    const csrfRes = await axiosInstance.get('/api/auth/csrf-token');
    const cookies = csrfRes.headers['set-cookie'];
    const csrfToken = csrfRes.data.csrfToken;
    
    axiosInstance.defaults.headers.common['csrf-token'] = csrfToken;
    axiosInstance.defaults.headers.common['Cookie'] = cookies.join('; ');

    const loginRes = await axiosInstance.post('/api/auth/login', {
      identifier: 'testuser',
      password: 'password123'
    });
    console.log('Login:', loginRes.data);
    
    const sessionCookie = loginRes.headers['set-cookie'].find(c => c.startsWith('sessionId='));
    axiosInstance.defaults.headers.common['Cookie'] = cookies.join('; ') + '; ' + sessionCookie;

    try {
      const chatRes = await axiosInstance.post('/api/chat', { messages: [], contextFlight: null });
      console.log('Chat Success:', chatRes.data);
    } catch (err) {
      console.log('Chat Error:', err.response?.status, err.response?.data);
    }
  } catch (err) {
    console.error('Script Error:', err.response?.status, err.response?.data || err.message);
  }
}
test();
