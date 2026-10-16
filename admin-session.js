(function () {
  const api = window.RemesasAPI;

  function loginUrl() {
    const current = location.pathname.split("/").pop() || "admin.html";
    return `admin-login.html?next=${encodeURIComponent(current)}`;
  }

  function goLogin() {
    api.logout();
    location.replace(loginUrl());
  }

  window.addEventListener("remesas:unauthorized", goLogin);

  async function initialize() {
    if (!api.getToken()) {
      goLogin();
      throw new Error("Sin sesión");
    }

    try {
      const admin = await api.me();
      document.querySelectorAll(".admin-user-copy b").forEach((element) => { element.textContent = admin.name; });
      document.querySelectorAll(".admin-user-copy span").forEach((element) => { element.textContent = admin.email; });

      const user = document.querySelector(".admin-user");
      if (user && !document.getElementById("logoutButton")) {
        const button = document.createElement("button");
        button.id = "logoutButton";
        button.className = "admin-logout-btn";
        button.innerHTML = `<span>↗</span> Cerrar sesión`;
        button.addEventListener("click", () => {
          api.logout();
          location.href = "admin-login.html";
        });
        user.appendChild(button);
      }
      return admin;
    } catch (error) {
      goLogin();
      throw error;
    }
  }

  window.AdminSession = { ready: initialize() };
})();
