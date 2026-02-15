// src/utils/apiClient.js
// MOCK API CLIENT – NO BACKEND

const fakeDelay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const apiClient = {
  async get() {
    await fakeDelay();
    return { status: "success", data: [] };
  },

  async post() {
    await fakeDelay();
    return { status: "success", data: {} };
  },

  async postFormData() {
    await fakeDelay();
    return { status: "success", data: {} };
  },

  async put() {
    await fakeDelay();
    return { status: "success", data: {} };
  },

  async delete() {
    await fakeDelay();
    return { status: "success", data: {} };
  }
};
export function setGlobalAuthContext() {
  // no-op in mock mode
}

export function clearGlobalAuthContext() {
  // no-op
}