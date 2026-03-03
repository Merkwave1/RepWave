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

export const getClientReports = async (tab = 'overview') => {
  await fakeDelay();

  // ── helpers ──────────────────────────────────────────────────────────────
  const readArr = (key) => {
    try {
      const r = JSON.parse(localStorage.getItem(key) || 'null');
      if (!r) return [];
      if (Array.isArray(r)) return r;
      if (Array.isArray(r.data)) return r.data;
      return [];
    } catch { return []; }
  };
  const clients      = readArr('appClients');
  const industries   = readArr('appClientIndustries');
  const areaTags     = readArr('appClientAreaTags');
  const total        = clients.length;
  const active       = clients.filter(c => c.clients_status === 'active');
  const pending      = clients.filter(c => c.clients_status === 'pending');
  const inactive     = clients.filter(c => c.clients_status === 'inactive');
  const now          = new Date();
  const thisMonth    = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const lastMonth    = (() => { const d = new Date(now); d.setMonth(d.getMonth()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })();
  const today        = now.toISOString().split('T')[0];
  const weekAgo      = (() => { const d = new Date(now); d.setDate(d.getDate()-7); return d.toISOString().split('T')[0]; })();
  const yearStart    = `${now.getFullYear()}-01-01`;
  const createdDate  = (c) => (c.clients_created_at||'').toString().split('T')[0] || '';
  const newThisMonth = clients.filter(c => createdDate(c).startsWith(thisMonth));
  const newLastMonth = clients.filter(c => createdDate(c).startsWith(lastMonth));
  const todayRegs    = clients.filter(c => createdDate(c) === today);
  const weekRegs     = clients.filter(c => createdDate(c) >= weekAgo);
  const yearRegs     = clients.filter(c => createdDate(c) >= yearStart);
  const withPhone    = clients.filter(c => c.clients_contact_phone_1);
  const withEmail    = clients.filter(c => c.clients_email);
  const complete     = clients.filter(c => c.clients_contact_phone_1 && c.clients_email && c.clients_address);

  // ── type analysis ────────────────────────────────────────────────────────
  const typeCounts = {};
  clients.forEach(c => { const t = c.clients_type || 'other'; typeCounts[t] = (typeCounts[t]||0) + 1; });
  const typeNames = { store: 'متاجر', distributor: 'موزعين', importer: 'مستوردين', factory: 'مصانع', vip: 'عملاء مميزين', other: 'أخرى' };
  const typeAnalysis = Object.entries(typeCounts).map(([slug, count]) => ({
    id: null, slug, name: typeNames[slug] || slug, count, percentage: total ? parseFloat(((count/total)*100).toFixed(1)) : 0,
  })).sort((a,b) => b.count - a.count);

  // ── per-tab ──────────────────────────────────────────────────────────────
  if (tab === 'overview') {
    return {
      total_clients: total,
      growth_rate: newLastMonth.length ? parseFloat((((newThisMonth.length - newLastMonth.length) / newLastMonth.length) * 100).toFixed(1)) : 0,
      active_clients: active.length,
      active_percentage: total ? parseFloat(((active.length/total)*100).toFixed(1)) : 0,
      new_this_month: newThisMonth.length,
      new_clients_last_month: newLastMonth.length,
      type_analysis: typeAnalysis,
      status_analysis: { inactive: inactive.length },
    };
  }

  if (tab === 'details') {
    return {
      total_clients: total,
      phone_count: withPhone.length,
      email_count: withEmail.length,
      complete_profile_count: complete.length,
      today_registrations: todayRegs.length,
      week_registrations: weekRegs.length,
      month_registrations: newThisMonth.length,
      year_registrations: yearRegs.length,
      active_clients: active.length,
      pending_clients: pending.length,
      inactive_clients: inactive.length,
    };
  }

  if (tab === 'documents') {
    const docs = readArr('appClientDocuments');
    const docTypes = {};
    docs.forEach(d => { const t = d.document_type || d.type || 'مستند'; docTypes[t] = (docTypes[t]||0) + 1; });
    const clientsWithDocs = new Set(docs.map(d => d.client_id || d.clients_id)).size;
    const docTypeArr = Object.entries(docTypes).map(([name, count]) => ({ type_name: name, count, percentage: docs.length ? parseFloat(((count/docs.length)*100).toFixed(1)) : 0 }));
    if (docs.length === 0) {
      // generate plausible data
      const fakeDocTypes = [
        { type_name: 'سجل تجاري', count: Math.round(total*0.6), percentage: 30 },
        { type_name: 'بطاقة ضريبية', count: Math.round(total*0.5), percentage: 25 },
        { type_name: 'عقد', count: Math.round(total*0.3), percentage: 15 },
        { type_name: 'هوية', count: Math.round(total*0.4), percentage: 20 },
        { type_name: 'أخرى', count: Math.round(total*0.2), percentage: 10 },
      ];
      const totalDocs = fakeDocTypes.reduce((s,d) => s + d.count, 0);
      return {
        total_documents: totalDocs,
        clients_with_documents: Math.round(total*0.7),
        clients_without_documents: Math.round(total*0.3),
        total_clients: total,
        today_uploads: Math.round(Math.random()*5),
        week_uploads: Math.round(Math.random()*20)+5,
        month_uploads: Math.round(Math.random()*80)+20,
        year_uploads: totalDocs,
        document_types: fakeDocTypes,
      };
    }
    return {
      total_documents: docs.length,
      clients_with_documents: clientsWithDocs,
      clients_without_documents: total - clientsWithDocs,
      total_clients: total,
      today_uploads: docs.filter(d => (d.created_at||'').toString().split('T')[0] === today).length,
      week_uploads: docs.filter(d => (d.created_at||'').toString().split('T')[0] >= weekAgo).length,
      month_uploads: docs.filter(d => (d.created_at||'').toString().split('T')[0] >= `${thisMonth}-01`).length,
      year_uploads: docs.filter(d => (d.created_at||'').toString().split('T')[0] >= yearStart).length,
      document_types: docTypeArr,
    };
  }

  if (tab === 'areas') {
    const cityCounts = {};
    clients.forEach(c => { if (c.clients_city) { cityCounts[c.clients_city] = (cityCounts[c.clients_city]||0) + 1; } });
    const topCities = Object.entries(cityCounts).map(([name, count]) => ({ city_name: name, client_count: count, percentage: total ? parseFloat(((count/total)*100).toFixed(1)) : 0 })).sort((a,b) => b.client_count - a.client_count);
    const tagCounts = {};
    clients.forEach(c => { if (c.clients_area_tag_id) { tagCounts[c.clients_area_tag_id] = (tagCounts[c.clients_area_tag_id]||0) + 1; } });
    const areaTagArr = Object.entries(tagCounts).map(([id, count]) => {
      const tag = areaTags.find(a => String(a.client_area_tag_id) === id);
      return { tag_name: tag?.client_area_tag_name || `منطقة #${id}`, usage_count: count, description: '', percentage: total ? parseFloat(((count/total)*100).toFixed(1)) : 0 };
    }).sort((a,b) => b.usage_count - a.usage_count);
    const withArea = clients.filter(c => c.clients_area_tag_id || c.clients_city).length;
    return {
      total_cities: Object.keys(cityCounts).length,
      total_areas: Object.keys(tagCounts).length,
      total_tags: areaTags.length,
      clients_with_areas: withArea,
      clients_without_areas: total - withArea,
      total_clients: total,
      avg_clients_per_area: Object.keys(tagCounts).length ? parseFloat((total / Object.keys(tagCounts).length).toFixed(1)) : 0,
      top_cities: topCities,
      area_tags: areaTagArr,
    };
  }

  if (tab === 'industries') {
    const indCounts = {};
    clients.forEach(c => { if (c.clients_industry_id) { indCounts[c.clients_industry_id] = (indCounts[c.clients_industry_id]||0) + 1; } });
    const indArr = Object.entries(indCounts).map(([id, count]) => {
      const ind = industries.find(i => String(i.client_industries_id) === id);
      return { industry_name: ind?.client_industries_name || `صناعة #${id}`, client_count: count, percentage: total ? parseFloat(((count/total)*100).toFixed(1)) : 0 };
    }).sort((a,b) => b.client_count - a.client_count);
    const withInd = clients.filter(c => c.clients_industry_id).length;
    return {
      total_industries: industries.length,
      clients_with_industries: withInd,
      clients_without_industries: total - withInd,
      total_clients: total,
      avg_clients_per_industry: industries.length ? parseFloat((total / industries.length).toFixed(1)) : 0,
      most_popular_industry: indArr.length ? indArr[0].industry_name : 'غير محدد',
      industry_distribution: indArr,
    };
  }

  if (tab === 'analytics') {
    const withCredit = clients.filter(c => c.clients_credit_limit > 0);
    const totalCredit = withCredit.reduce((s,c) => s + (c.clients_credit_limit||0), 0);
    return {
      total_clients: total,
      type_analysis: typeAnalysis,
      status_analysis: {
        active: active.length,
        active_percentage: total ? parseFloat(((active.length/total)*100).toFixed(1)) : 0,
        prospect: pending.length,
        prospect_percentage: total ? parseFloat(((pending.length/total)*100).toFixed(1)) : 0,
        inactive: inactive.length,
        inactive_percentage: total ? parseFloat(((inactive.length/total)*100).toFixed(1)) : 0,
      },
      growth_analysis: {
        this_month: newThisMonth.length,
        last_month: newLastMonth.length,
        growth_rate: newLastMonth.length ? parseFloat((((newThisMonth.length - newLastMonth.length) / newLastMonth.length) * 100).toFixed(1)) : 0,
      },
      credit_analysis: {
        clients_with_credit: withCredit.length,
        credit_coverage: total ? parseFloat(((withCredit.length/total)*100).toFixed(1)) : 0,
        total_credit_limit: parseFloat(totalCredit.toFixed(2)),
        avg_credit_limit: withCredit.length ? parseFloat((totalCredit / withCredit.length).toFixed(2)) : 0,
      },
      profile_completeness: {
        with_phone: withPhone.length,
        phone_coverage: total ? parseFloat(((withPhone.length/total)*100).toFixed(1)) : 0,
        with_email: withEmail.length,
        email_coverage: total ? parseFloat(((withEmail.length/total)*100).toFixed(1)) : 0,
        complete_profiles: complete.length,
        completeness_rate: total ? parseFloat(((complete.length/total)*100).toFixed(1)) : 0,
      },
    };
  }

  return {};
};
