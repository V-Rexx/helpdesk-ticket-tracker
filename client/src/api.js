// One small helper for every API call: adds the token and turns errors into exceptions.
export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token) {
    // Token expired or invalid: log out and go to the login page.
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
