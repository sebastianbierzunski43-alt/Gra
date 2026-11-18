
(() => {
  const SUPABASE_URL = "https://jmzziupnoxmvahtkmchz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_BZwA65yDsvBHD5FB_yzy1Q_x2AxfZtD";
  const REGISTER_URL = "https://sebastianbierzunski43-alt.github.io/Quorek-ID/";

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.onload = startQuorekID;
  document.head.appendChild(script);

  function startQuorekID() {
    const db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage
        }
      }
    );

    const menu = document.getElementById("menu");
    if (!menu) return;

    const style = document.createElement("style");
    style.textContent = `
      #qid-button {
        position: fixed;
        top: 30px;
        right: 15px;
        z-index: 999999;
        background: #17172b;
        color: white;
        border: 1px solid #7772ff;
        border-radius: 12px;
        padding: 11px 18px;
        font-weight: bold;
        cursor: pointer;
        font-size: 15px;
      }

      #qid-overlay {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 1000000;
        background: #000a;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
      }

      #qid-box {
        box-sizing: border-box;
        width: min(360px, 92vw);
        background: #191927;
        color: white;
        padding: 25px;
        border: 2px solid #7772ff;
        border-radius: 18px;
        position: relative;
      }

      #qid-box input {
        box-sizing: border-box;
        width: 100%;
        padding: 12px;
        margin: 7px 0;
        border: 1px solid #44445c;
        border-radius: 9px;
        background: #29293b;
        color: white;
      }

      #qid-box button,
      #qid-box a {
        display: block;
        box-sizing: border-box;
        width: 100%;
        padding: 12px;
        margin-top: 10px;
        border: 0;
        border-radius: 9px;
        text-align: center;
        cursor: pointer;
        font-weight: bold;
        text-decoration: none;
      }

      #qid-login { background: #7772ff; color: white; }
      #qid-register { background: #303047; color: white; }
      #qid-logout { background: #b83248; color: white; }

      #qid-close {
        position: absolute;
        top: 8px;
        right: 10px;
        width: auto !important;
        background: transparent;
        color: white;
        font-size: 22px;
        padding: 5px !important;
      }

      #qid-message {
        color: #ccc;
        font-size: 13px;
      }
    `;
    document.head.appendChild(style);

    const button = document.createElement("button");
    button.id = "qid-button";
    button.textContent = "♛ Q ID";
    document.body.appendChild(button);

    function updateVisibility() {
      button.style.display = menu.classList.contains("on")
        ? "block"
        : "none";
    }

    const observer = new MutationObserver(updateVisibility);
    observer.observe(menu, {
      attributes: true,
      attributeFilter: ["class"]
    });

    updateVisibility();

    const overlay = document.createElement("div");
    overlay.id = "qid-overlay";
    overlay.innerHTML = `
      <div id="qid-box">
        <button id="qid-close" aria-label="Zamknij">×</button>
        <h2>♛ QUOREK ID</h2>
        <p>Jedno konto. Wszystkie gry.</p>
        <input id="qid-email" type="email" placeholder="Adres e-mail">
        <input id="qid-password" type="password" placeholder="Hasło">
        <button id="qid-login">ZALOGUJ SIĘ</button>
        <p id="qid-message"></p>
        <p>Nie masz jeszcze konta?</p>
        <a id="qid-register" href="${REGISTER_URL}" target="_blank" rel="noopener">UTWÓRZ KONTO</a>
      </div>
    `;
    document.body.appendChild(overlay);

    function closeOverlay() {
      overlay.style.display = "none";
    }

    function bindClose() {
      const close = document.getElementById("qid-close");
      if (close) close.onclick = closeOverlay;
    }

    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
    }

    async function showProfile(user) {
      const { data: profile, error } = await db
        .from("profiles")
        .select("username, avatar")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const box = document.getElementById("qid-box");

      box.innerHTML = `
        <button id="qid-close" aria-label="Zamknij">×</button>
        <h2>♛ QUOREK ID</h2>
        <div style="font-size:42px;text-align:center">
          ${escapeHTML(profile.avatar || "👑")}
        </div>
        <h3 style="text-align:center">
          Witaj, ${escapeHTML(profile.username)}!
        </h3>
        <p style="text-align:center">Połączono z QUOREK ID.</p>
        <p id="qid-message"></p>
        <button id="qid-logout">WYLOGUJ</button>
      `;

      bindClose();

      document.getElementById("qid-logout").onclick = async () => {
        const logout = document.getElementById("qid-logout");
        const message = document.getElementById("qid-message");

        logout.disabled = true;
        message.textContent = "Wylogowywanie...";

        const { error } = await db.auth.signOut();

        if (error) {
          message.textContent = error.message;
          logout.disabled = false;
          return;
        }

        closeOverlay();
        showLogin();
      };
    }

    function showLogin() {
      const box = document.getElementById("qid-box");

      box.innerHTML = `
        <button id="qid-close" aria-label="Zamknij">×</button>
        <h2>♛ QUOREK ID</h2>
        <p>Jedno konto. Wszystkie gry.</p>
        <input id="qid-email" type="email" placeholder="Adres e-mail">
        <input id="qid-password" type="password" placeholder="Hasło">
        <button id="qid-login">ZALOGUJ SIĘ</button>
        <p id="qid-message"></p>
        <p>Nie masz jeszcze konta?</p>
        <a id="qid-register" href="${REGISTER_URL}" target="_blank" rel="noopener">UTWÓRZ KONTO</a>
      `;

      bindClose();

      document.getElementById("qid-login").onclick = async () => {
        const email = document.getElementById("qid-email").value.trim();
        const password = document.getElementById("qid-password").value;
        const message = document.getElementById("qid-message");
        const login = document.getElementById("qid-login");

        if (!email || !password) {
          message.textContent = "Wpisz e-mail i hasło.";
          return;
        }

        login.disabled = true;
        message.textContent = "Logowanie...";

        const { data, error } = await db.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          message.textContent = error.message;
          login.disabled = false;
          return;
        }

        try {
          await showProfile(data.user);
        } catch (e) {
          message.textContent = e.message;
          login.disabled = false;
        }
      };
    }

    button.onclick = async () => {
      overlay.style.display = "flex";

      const box = document.getElementById("qid-box");
      box.innerHTML = `
        <button id="qid-close" aria-label="Zamknij">×</button>
        <h2>♛ QUOREK ID</h2>
        <p id="qid-message">Sprawdzanie konta...</p>
      `;
      bindClose();

      const { data, error } = await db.auth.getSession();

      if (error) {
        showLogin();
        document.getElementById("qid-message").textContent = error.message;
        return;
      }

      if (data.session) {
        try {
          await showProfile(data.session.user);
        } catch (e) {
          showLogin();
          document.getElementById("qid-message").textContent = e.message;
        }
      } else {
        showLogin();
      }
    };

    overlay.onclick = event => {
      if (event.target === overlay) closeOverlay();
    };

    db.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        showLogin();
      }
    });
  }
})();
