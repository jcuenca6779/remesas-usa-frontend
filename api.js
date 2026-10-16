(function () {
  const API_BASE =
    window.REMESAS_API_BASE ||
    "http://127.0.0.1:8000/api";

  const TOKEN_KEY = "remesasusa_admin_token";
  const SESSION_KEY = "remesasusa_visitor_session";

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  function getSessionId() {
    let value = localStorage.getItem(SESSION_KEY);
    if (!value) {
      value = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, value);
    }
    return value;
  }

  function queryString(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        search.set(key, String(value));
      }
    });
    const result = search.toString();
    return result ? `?${result}` : "";
  }

  function errorMessage(data, fallback = "Ha ocurrido un error.") {
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((item) => item.msg || "Dato inválido").join(". ");
    }
    return fallback;
  }

  async function request(path, { method = "GET", body, auth = false } = {}) {
    const headers = { Accept: "application/json" };

    if (auth) {
      const token = getToken();
      if (!token) {
        const error = new Error("Autenticación requerida");
        error.status = 401;
        throw error;
      }
      headers.Authorization = `Bearer ${token}`;
    }

    const options = { method, headers };

    if (body instanceof FormData) {
      options.body = body;
      delete headers.Accept;
    } else if (body !== undefined && body !== null) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(`${API_BASE}${path}`, options);
    } catch (networkError) {
      const error = new Error(
        "No se pudo conectar con el backend. Verifica que FastAPI esté ejecutándose en el puerto 8000."
      );
      error.cause = networkError;
      throw error;
    }

    if (response.status === 204) return null;

    const text = await response.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }

    if (!response.ok) {
      if (response.status === 401 && auth) {
        clearToken();
        window.dispatchEvent(new CustomEvent("remesas:unauthorized"));
      }
      const error = new Error(errorMessage(data, `Error ${response.status}`));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  function catalogPath(section) {
    return section === "perfume" ? "/perfumes" : "/products";
  }

  const api = {
    API_BASE,
    getToken,
    setToken,
    clearToken,
    getSessionId,

    async login(email, password) {
      const data = await request("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setToken(data.access_token);
      return data;
    },

    me() { return request("/auth/me", { auth: true }); },
    logout() { clearToken(); },

    listCatalog(section, params = {}) {
      return request(catalogPath(section) + queryString(params));
    },

    listAdminCatalog(section, params = {}) {
      return request(`${catalogPath(section)}/admin/all${queryString(params)}`, { auth: true });
    },

    createItem(section, data) {
      return request(catalogPath(section), { method: "POST", body: data, auth: true });
    },

    updateItem(section, id, data) {
      return request(`${catalogPath(section)}/${id}`, { method: "PUT", body: data, auth: true });
    },

    archiveItem(section, id) {
      return request(`${catalogPath(section)}/${id}`, { method: "DELETE", auth: true });
    },

    restoreItem(section, id) {
      return request(`${catalogPath(section)}/${id}/restore`, { method: "POST", auth: true });
    },

    uploadImage(section, id, file) {
      const form = new FormData();
      form.append("file", file);
      return request(`${catalogPath(section)}/${id}/image`, {
        method: "POST",
        body: form,
        auth: true,
      });
    },

    removeImage(section, id) {
      return request(`${catalogPath(section)}/${id}/image`, { method: "DELETE", auth: true });
    },

    listCategories(section) {
      return request(`/categories${queryString({ section })}`);
    },

    listAdminCategories(section) {
      return request(`/categories/admin/all${queryString({ section })}`, { auth: true });
    },

    createCategory(section, name) {
      return request("/categories", {
        method: "POST",
        body: { name, section },
        auth: true,
      });
    },

    updateCategory(id, data) {
      return request(`/categories/${id}`, { method: "PUT", body: data, auth: true });
    },

    archiveCategory(id) {
      return request(`/categories/${id}`, { method: "DELETE", auth: true });
    },

    restoreCategory(id) {
      return request(`/categories/${id}/restore`, { method: "POST", auth: true });
    },

    inventorySummary() {
      return request("/admin/inventory-summary", { auth: true });
    },

    analyticsDashboard(days = 30) {
      return request(`/analytics/admin/dashboard${queryString({ days })}`, { auth: true });
    },

    catalogAnalytics(section, days = 30) {
      return request(`/analytics/admin/catalog${queryString({ section, days })}`, { auth: true });
    },

    itemAnalytics(section, id, days = 30) {
      return request(`/analytics/admin/items/${id}${queryString({ section, days })}`, { auth: true });
    },

    track(event) {
      return request("/analytics/events", {
        method: "POST",
        body: { ...event, session_id: getSessionId() },
      }).catch(() => null);
    },
  };

  window.RemesasAPI = api;
})();
