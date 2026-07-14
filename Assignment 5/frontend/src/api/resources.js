import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:9000/api/resources',
});

export const fetchResources = () => API.get('/');
export const fetchResourceById = (id) => API.get(`/${id}`);
export const createResource = (data) => API.post('/', data);
export const updateResource = (id, data) => API.put(`/${id}`, data);
export const deleteResource = (id) => API.delete(`/${id}`);
