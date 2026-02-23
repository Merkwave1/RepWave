// src/apis/clients.js
// MOCK VERSION  reads/writes localStorage, no backend required

const fakeDelay = (ms = 200) => new Promise(r => setTimeout(r, ms));

function getMockClients() {
  try {
    const raw = localStorage.getItem('appClients');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : (parsed?.data || []);
  } catch { return []; }
}

function saveMockClients(clients) {
  localStorage.setItem('appClients', JSON.stringify(clients));
}

export const getAllClients = async () => {
  await fakeDelay();
  return getMockClients();
};

export const getClientDetails = async (clientId) => {
  await fakeDelay();
  const clients = getMockClients();
  const client = clients.find(c => String(c.clients_id) === String(clientId));
  if (!client) throw new Error(`Client with ID ${clientId} not found.`);
  return client;
};

export const getClientById = async (clientId) => {
  return getClientDetails(clientId);
};

export const addClient = async (clientData) => {
  await fakeDelay();
  const clients = getMockClients();
  const newId = clients.length > 0 ? Math.max(...clients.map(c => Number(c.clients_id) || 0)) + 1 : 1;
  const updates = clientData instanceof FormData ? Object.fromEntries(clientData.entries()) : clientData;
  const newClient = { clients_id: newId, ...updates };
  clients.push(newClient);
  saveMockClients(clients);
  return '?? ????? ?????? ?????!';
};

export const updateClient = async (clientId, clientData) => {
  await fakeDelay();
  const clients = getMockClients();
  const idx = clients.findIndex(c => String(c.clients_id) === String(clientId));
  if (idx === -1) throw new Error(`Client with ID ${clientId} not found.`);
  const updates = clientData instanceof FormData ? Object.fromEntries(clientData.entries()) : clientData;
  clients[idx] = { ...clients[idx], ...updates };
  saveMockClients(clients);
  return '?? ????? ?????? ?????!';
};

export const deleteClient = async (clientId) => {
  await fakeDelay();
  const clients = getMockClients();
  const filtered = clients.filter(c => String(c.clients_id) !== String(clientId));
  if (filtered.length === clients.length) throw new Error(`Client with ID ${clientId} not found.`);
  saveMockClients(filtered);
  return '?? ??? ?????? ?????!';
};

export const getClientReports = async () => {
  await fakeDelay();
  return {};
};
