// frontend/src/data/emailTemplates.js
// Beautiful HTML email templates for MapaFarem.cz

const BASE_STYLE = `
  body { margin:0; padding:0; background:#F5EDE0; font-family:'Helvetica Neue',Arial,sans-serif; }
  .wrap { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; }
  .header { background:#1A2D18; padding:28px 40px; text-align:center; }
  .header-logo { font-size:32px; }
  .header-title { color:#F5EDE0; font-size:22px; font-weight:700; margin-top:8px; }
  .header-sub { color:rgba(245,237,224,.6); font-size:13px; margin-top:4px; }
  .body { padding:36px 40px; }
  .greeting { font-size:18px; font-weight:700; color:#2C1810; margin-bottom:16px; }
  p { font-size:15px; color:#4A3728; line-height:1.7; margin:0 0 16px; }
  .highlight-box { background:#F0E8D6; border-left:4px solid #C8973A; border-radius:6px; padding:16px 20px; margin:24px 0; }
  .highlight-box strong { color:#1A2D18; font-size:16px; }
  .feature-list { list-style:none; padding:0; margin:0 0 24px; }
  .feature-list li { padding:8px 0; color:#4A3728; font-size:14px; border-bottom:1px solid #F0E8D6; }
  .feature-list li:last-child { border:none; }
  .feature-list li::before { content:'✓  '; color:#3A5728; font-weight:700; }
  .cta-button { display:inline-block; background:#3A5728; color:#fff !important; text-decoration:none; padding:14px 36px; border-radius:50px; font-size:15px; font-weight:700; margin:8px 0 24px; }
  .stat-row { display:flex; gap:12px; margin:20px 0; }
  .stat-box { flex:1; background:#F0E8D6; border-radius:8px; padding:16px; text-align:center; }
  .stat-num { font-size:28px; font-weight:700; color:#C8973A; }
  .stat-label { font-size:12px; color:#7A5C4A; margin-top:4px; }
  .footer { background:#F0E8D6; padding:20px 40px; text-align:center; }
  .footer p { font-size:12px; color:#9A7A6A; margin:4px 0; }
  .footer a { color:#3A5728; }
`;

const htmlWrap = (content, preheader = '') => `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${BASE_STYLE}</style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;color:#F5EDE0;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EDE0;padding:24px 0;">
    <tr><td align="center">
      <div class="wrap">${content}</div>
    </td></tr>
  </table>
</body>
</html>`;

export const emailTemplates = {

  // ── WELCOME ──────────────────────────────────────────────────────────────
  welcome: {
    subject: 'Vítejte na MapaFarem.cz! Váš profil je připraven 🌾',
    html: (farm) => htmlWrap(`
      <div class="header">
        <div class="header-logo">🌾</div>
        <div class="header-title">MapaFarem.cz</div>
        <div class="header-sub">Největší mapa lokálních farem v ČR</div>
      </div>
      <div class="body">
        <div class="greeting">Vítejte, ${farm.name}! 👋</div>
        <p>Vaše farma byla úspěšně zaregistrována a je nyní viditelná pro tisíce zákazníků na MapaFarem.cz.</p>
        <div class="highlight-box">
          <strong>Váš profil je živý!</strong><br>
          <a href="${farm.profileUrl}" style="color:#3A5728;">${farm.profileUrl}</a>
        </div>
        <p>Abyste dostávali co nejvíce poptávek, doporučujeme doplnit:</p>
        <ul class="feature-list">
          <li>Fotografie farmy a produktů</li>
          <li>Aktuální nabídku sezónních produktů</li>
          <li>Otevírací dobu a kontaktní informace</li>
          <li>Popis farmy a váš příběh</li>
        </ul>
        <a href="https://mapafarem.cz/dashboard" class="cta-button">Dokončit profil →</a>
        <p style="font-size:13px;color:#9A7A6A;">Máte otázky? Odpovězte na tento email — jsme tu pro vás.</p>
      </div>
      <div class="footer">
        <p>© 2026 MapaFarem.cz · <a href="https://mapafarem.cz/o-nas">O nás</a> · <a href="https://mapafarem.cz/odhlasit">Odhlásit</a></p>
      </div>
    `, `Váš profil na MapaFarem.cz je živý — doplňte ho a získejte více zákazníků`),

    text: (farm) => `Vítejte na MapaFarem.cz, ${farm.name}!

Váš profil je živý: ${farm.profileUrl}

Doporučujeme doplnit fotografie, produkty a otevírací dobu.

Dokončit profil: https://mapafarem.cz/dashboard

MapaFarem.cz · Odhlásit: https://mapafarem.cz/odhlasit`,
  },

  // ── PROFILE REMINDER ─────────────────────────────────────────────────────
  profileReminder: {
    subject: 'Váš profil je dokončen z 80% — jeden krok chybí 📝',
    html: (farm) => htmlWrap(`
      <div class="header">
        <div class="header-logo">📝</div>
        <div class="header-title">Dokončete svůj profil</div>
        <div class="header-sub">Farmáři s kompletním profilem získávají 3× více poptávek</div>
      </div>
      <div class="body">
        <div class="greeting">Dobrý den, ${farm.name},</div>
        <p>Váš profil na MapaFarem.cz je téměř hotový — zbývá jeden krok.</p>
        <div style="background:#F0E8D6;border-radius:8px;padding:16px 20px;margin:20px 0;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="font-weight:700;color:#2C1810;">Dokončení profilu</span>
            <span style="font-weight:700;color:#C8973A;">80%</span>
          </div>
          <div style="background:#ddd;border-radius:50px;height:10px;">
            <div style="background:#3A5728;width:80%;height:10px;border-radius:50px;"></div>
          </div>
        </div>
        <p>Chybí jen: <strong>Fotografie farmy</strong></p>
        <p>Profily s fotografiemi mají o <strong>340 % více zobrazení</strong> než profily bez fotek.</p>
        <a href="https://mapafarem.cz/dashboard" class="cta-button">Přidat fotografie →</a>
      </div>
      <div class="footer">
        <p>© 2026 MapaFarem.cz · <a href="https://mapafarem.cz/odhlasit">Odhlásit</a></p>
      </div>
    `, `Váš profil je z 80% dokončen — přidejte fotografie a získejte 3× více poptávek`),

    text: (farm) => `Dobrý den, ${farm.name},

váš profil na MapaFarem.cz je z 80% dokončen. Chybí fotografie farmy.

Přidat fotografie: https://mapafarem.cz/dashboard

MapaFarem.cz`,
  },

  // ── MONTHLY STATS ────────────────────────────────────────────────────────
  monthlyStats: {
    subject: (month) => `Statistiky vaší farmy za ${month} — přehled výkonu 📊`,
    html: (farm, stats = { views: 234, clicks: 18, favorites: 47, rating: 4.7 }) => htmlWrap(`
      <div class="header">
        <div class="header-logo">📊</div>
        <div class="header-title">Měsíční přehled</div>
        <div class="header-sub">${farm.name} · MapaFarem.cz</div>
      </div>
      <div class="body">
        <div class="greeting">Váš výkon tento měsíc</div>
        <p>Zde je přehled aktivity vašeho profilu za poslední měsíc:</p>
        <div class="stat-row">
          <div class="stat-box">
            <div class="stat-num">${stats.views}</div>
            <div class="stat-label">Zobrazení profilu</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">${stats.clicks}</div>
            <div class="stat-label">Kliky na web</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">${stats.favorites}</div>
            <div class="stat-label">Oblíbených</div>
          </div>
        </div>
        <div class="highlight-box">
          <strong>💡 Tip měsíce:</strong><br>
          Přidejte sezónní produkty do profilu — zákazníci je aktivně hledají.
        </div>
        <a href="https://mapafarem.cz/dashboard" class="cta-button">Zobrazit full statistiky →</a>
      </div>
      <div class="footer">
        <p>© 2026 MapaFarem.cz · Prémiový účet · <a href="https://mapafarem.cz/odhlasit">Odhlásit</a></p>
      </div>
    `, `Váše farma měla ${stats.views} zobrazení tento měsíc`),

    text: (farm, stats = { views: 234, clicks: 18 }) =>
      `Měsíční přehled — ${farm.name}\n\nZobrazení: ${stats.views}\nKliky: ${stats.clicks}\n\nFull statistiky: https://mapafarem.cz/dashboard`,
  },

  // ── SEASONAL TIPS NEWSLETTER ─────────────────────────────────────────────
  seasonalNewsletter: {
    subject: (season) => `Co je teď v sezóně — tipy pro ${season} 🌱`,
    html: (season = 'jaro', items = ['Jahody', 'Chřest', 'Špenát']) => htmlWrap(`
      <div class="header">
        <div class="header-logo">🌱</div>
        <div class="header-title">Sezónní průvodce</div>
        <div class="header-sub">Co nakupovat na farmách právě teď</div>
      </div>
      <div class="body">
        <div class="greeting">Sezónní tipy — ${season}</div>
        <p>Právě teď jsou na lokálních farmách v plné sezóně tyto produkty:</p>
        <ul class="feature-list">
          ${items.map(i => `<li>${i}</li>`).join('')}
        </ul>
        <div class="highlight-box">
          <strong>🗺️ Najděte farmy s těmito produkty v okolí:</strong><br>
          <a href="https://mapafarem.cz/mapa" style="color:#3A5728;">mapafarem.cz/mapa</a>
        </div>
        <a href="https://mapafarem.cz/sezona" class="cta-button">Zobrazit sezónní průvodce →</a>
        <p style="font-size:13px;color:#9A7A6A;">Tyto tipy dostáváte, protože jste odběratelem newsletteru MapaFarem.cz.</p>
      </div>
      <div class="footer">
        <p>© 2026 MapaFarem.cz · <a href="https://mapafarem.cz/odhlasit">Odhlásit newsletter</a></p>
      </div>
    `, `Sezónní tipy: ${items.slice(0,2).join(', ')} a další právě teď na farmách`),

    text: (season, items = []) =>
      `Sezónní tipy — ${season}\n\n${items.join(', ')}\n\nMapa farem: https://mapafarem.cz/mapa`,
  },

  // ── COLD OUTREACH (for farms already listed) ─────────────────────────────
  coldEmail: {
    subject: 'Vaše farma je na MapaFarem.cz — zkontrolujte svůj profil',
    text: (farm) => `Dobrý den,

vaše farma ${farm.name} je uvedena na MapaFarem.cz — největší mapě lokálních farem v ČR.

Váš profil: ${farm.profileUrl}

Přihlaste se zdarma a doplňte aktuální nabídku: https://mapafarem.cz/prihlaseni

MapaFarem.cz
Odhlásit: https://mapafarem.cz/odhlasit?email=${encodeURIComponent(farm.email || '')}`,
  },

  // ── PREMIUM UPSELL ───────────────────────────────────────────────────────
  premiumUpsell: {
    subject: 'Získejte 10× více zákazníků — prémiový profil pro vaši farmu',
    html: (farm) => htmlWrap(`
      <div class="header" style="background:linear-gradient(135deg,#1A2D18,#3A5728);">
        <div class="header-logo">⚡</div>
        <div class="header-title">Prémiový profil</div>
        <div class="header-sub">10× více zákazníků za 299 Kč/měsíc</div>
      </div>
      <div class="body">
        <div class="greeting">Dobrý den, ${farm.name},</div>
        <p>Farmáři s prémiovým profilem na MapaFarem.cz získávají v průměru <strong>10× více poptávek</strong>.</p>
        <ul class="feature-list">
          <li>Zvýrazněná pozice ve vyhledávání</li>
          <li>Neomezená galerie fotografií</li>
          <li>Přímé objednávky přes platformu</li>
          <li>Sezónní nabídky a akce</li>
          <li>Odznak "Ověřená farma"</li>
          <li>Měsíční analytika návštěvnosti</li>
        </ul>
        <div class="highlight-box">
          <strong>První měsíc ZDARMA</strong> — pak 299 Kč/měsíc. Zrušení kdykoliv.
        </div>
        <a href="https://mapafarem.cz/cenik" class="cta-button">Aktivovat prémium →</a>
      </div>
      <div class="footer">
        <p>© 2026 MapaFarem.cz · <a href="https://mapafarem.cz/odhlasit">Odhlásit</a></p>
      </div>
    `, `Prémiový profil: 10× více zákazníků za 299 Kč/měsíc — první měsíc zdarma`),

    text: (farm) => `Dobrý den, ${farm.name},\n\nPrémiový profil na MapaFarem.cz: 10× více zákazníků za 299 Kč/měsíc.\nPrvní měsíc zdarma.\n\nhttps://mapafarem.cz/cenik\n\nOdhlásit: https://mapafarem.cz/odhlasit`,
  },

};

export default emailTemplates;
