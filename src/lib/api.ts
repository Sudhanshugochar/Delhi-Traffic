export async function fetchLiveTraffic() {
  const res = await fetch('/api/traffic/live');
  return res.json();
}

export async function postTraffic(data: any) {
  const res = await fetch('/api/traffic/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch('/api/traffic/analytics');
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch('/api/alerts');
  return res.json();
}

export async function acknowledgeAlert(id: string) {
  const res = await fetch('/api/alerts/' + id, { method: 'PATCH' });
  return res.json();
}

export async function signup(payload: any) {
  const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

export async function login(payload: any) {
  const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}
