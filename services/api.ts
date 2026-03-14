import axios from 'axios';

/**
 * Configuração do Axios para conexão com o banco local e produção.
 * Lê dinamicamente do .env.development ou .env.production
 */
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.2:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
