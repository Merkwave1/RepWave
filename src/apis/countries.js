// src/apis/countries.js
// MOCK VERSION — reads from localStorage, no backend required

function getMock(key, fallback) {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : fallback;
  } catch { return fallback; }
}

export const getAllCountries = async () => {
  return getMock('appCountriesWithGovernorates', []);
};

export const getAllCountriesWithGovernorates = async () => {
  return getMock('appCountriesWithGovernorates', []);
};

export const addCountry = async (countryData) => {
  const countries = getMock('appCountriesWithGovernorates', []);
  const newCountry = { countries_id: Date.now(), governorates: [], ...countryData };
  countries.push(newCountry);
  localStorage.setItem('appCountriesWithGovernorates', JSON.stringify(countries));
  return newCountry;
};

export const updateCountry = async (id, countryData) => {
  const countries = getMock('appCountriesWithGovernorates', []);
  const idx = countries.findIndex(c => c.countries_id === id);
  if (idx !== -1) {
    countries[idx] = { ...countries[idx], ...countryData };
    localStorage.setItem('appCountriesWithGovernorates', JSON.stringify(countries));
    return countries[idx];
  }
  throw new Error('Country not found.');
};

export const deleteCountry = async (id) => {
  const countries = getMock('appCountriesWithGovernorates', []);
  const filtered = countries.filter(c => c.countries_id !== id);
  localStorage.setItem('appCountriesWithGovernorates', JSON.stringify(filtered));
  return { status: 'success' };
};

