async function request(path, body) {
  const res = await fetch(`/api${path}`, body && {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (name) => request('/users', { name }),
  state: (userId) => request(`/users/${userId}/state`),
  addTask: (userId, title, deadline) => request('/tasks', { userId, title, deadline }),
  completeTask: (userId, taskId) => request(`/tasks/${taskId}/complete`, { userId }),
  buy: (userId, itemId) => request('/cafe/buy', { userId, itemId }),
  join: (userId, inviteCode) => request('/cafe/join', { userId, inviteCode }),
};
