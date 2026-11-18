
(() => {
  const SUPABASE_URL = "https://jmzziupnoxmvahtkmchz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_BZwA65yDsvBHD5FB_yzy1Q_x2AxfZtD";
  const REGISTER_URL = "https://sebastianbierzunski43-alt.github.io/Quorek-ID/";

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.onload = startQuorekID;
  document.head.appendChild(script);

  function startQuorekID() {
    const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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

    button.onclick = () => {
      overlay.style.display = "flex";
    };

    document.getElementById("qid-close").onclick = () => {
      overlay.style.display = "none";
    };

    overlay.onclick = event => {
      if (event.target === overlay) {
        overlay.style.display = "none";
      }
    };

    document.getElementById("qid-login").onclick = async () => {
      const email = document.getElementById("qid-email").value.trim();
      const password = document.getElementById("qid-password").value;
      const message = document.getElementById("qid-message");

      message.textContent = "Logowanie...";

      const { data, error } = await db.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        message.textContent = error.message;
        return;
      }

      const { data: profile, error: profileError } = await db
        .from("profiles")
        .select("username, avatar")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        message.textContent = profileError.message;
        return;
      }

      const box = document.getElementById("qid-box");
      box.innerHTML = `
        <button id="qid-close" aria-label="Zamknij">×</button>
        <h2>♛ QUOREK ID</h2>
        <h3>Witaj, ${escapeHTML(profile.username)}!</h3>
        <p>Połączono z QUOREK ID.</p>
        <button id="qid-logout">WYLOGUJ</button>
      `;

      document.getElementById("qid-close").onclick = () => {
        overlay.style.display = "none";
      };

      document.getElementById("qid-logout").onclick = async () => {
        await db.auth.signOut();
        location.reload();
      };
    };

    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
    }
  }
})();
