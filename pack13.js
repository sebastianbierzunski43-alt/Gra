
(() => {
  const SUPABASE_URL = "https://jmzziupnoxmvahtkmchz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_BZwA65yDsvBHD5FB_yzy1Q_x2AxfZtD";

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.onload = startQuorekID;
  document.head.appendChild(script);

  function startQuorekID() {
    const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const panel = document.createElement("div");
    panel.id = "quorek-id-panel";
    panel.innerHTML = `
      <div style="background:#202020;color:white;padding:20px;border:1px solid #555;border-radius:16px;width:280px;font-family:Arial">
        <h2 style="margin-top:0">♛ QUOREK ID</h2>
        <p>Jedno konto. Wszystkie gry.</p>
        <input id="qid-email" type="email" placeholder="E-mail" style="width:100%;padding:10px;margin:5px 0;box-sizing:border-box">
        <input id="qid-password" type="password" placeholder="Hasło" style="width:100%;padding:10px;margin:5px 0;box-sizing:border-box">
        <button id="qid-login" style="width:100%;padding:10px;margin-top:8px">ZALOGUJ SIĘ</button>
        <p id="qid-message" style="font-size:13px;color:#ccc"></p>
        <div id="qid-player"></div>
      </div>
    `;

    Object.assign(panel.style, {
      position: "fixed",
      top: "15px",
      right: "15px",
      zIndex: "999999"
    });

    document.body.appendChild(panel);

    const message = document.getElementById("qid-message");

    document.getElementById("qid-login").onclick = async () => {
      const email = document.getElementById("qid-email").value.trim();
      const password = document.getElementById("qid-password").value;

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

      document.getElementById("qid-player").innerHTML = `
        <hr>
        <h3>Witaj, ${escapeHTML(profile.username)}!</h3>
        <p>Połączono z QUOREK ID</p>
        <button id="qid-logout" style="width:100%;padding:10px">WYLOGUJ</button>
      `;

      message.textContent = "Zalogowano pomyślnie!";
      document.getElementById("qid-login").style.display = "none";
      document.getElementById("qid-email").style.display = "none";
      document.getElementById("qid-password").style.display = "none";

      document.getElementById("qid-logout").onclick = async () => {
        await db.auth.signOut();
        location.reload();
      };
    };

    function escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
      })[char]);
    }
  }
})();
