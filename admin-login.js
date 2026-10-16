(function () {
  const api = window.RemesasAPI;
  const form = document.getElementById("loginForm");
  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const errorBox = document.getElementById("loginError");
  const button = document.getElementById("loginButton");

  async function alreadyLogged() {
    if (!api.getToken()) return;
    try {
      await api.me();
      window.location.href = "admin.html";
    } catch {
      api.logout();
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.hidden = true;
    button.disabled = true;
    button.innerHTML = `<span class="button-spinner"></span> Ingresando...`;

    try {
      await api.login(email.value.trim(), password.value);
      const params = new URLSearchParams(location.search);
      const requested = params.get("next");
      const next = requested && requested.startsWith("admin") ? requested : "admin.html";
      window.location.href = next;
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.hidden = false;
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
    } finally {
      button.disabled = false;
      button.textContent = "Ingresar al panel";
    }
  });

  alreadyLogged();
})();
