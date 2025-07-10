//API
import Axios from 'axios';

export const api = Axios.create({
  baseURL: 'https://edenbackend-production.up.railway.app',
});
