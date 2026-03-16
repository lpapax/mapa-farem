// frontend/src/data/emailTemplates.js
// Czech email templates for MapaFarem.cz farm outreach

export const emailTemplates = {

  coldEmail: {
    subject: 'Vaše farma je na MapaFarem.cz — zkontrolujte svůj profil',
    text: (farm) => `Dobrý den,

rádi bychom vás informovali, že vaše farma ${farm.name} je uvedena na MapaFarem.cz — největší mapě lokálních farem v České republice.

Váš profil si můžete prohlédnout zde:
${farm.profileUrl}

Na MapaFarem.cz každý měsíc hledají lokální produkty tisíce zákazníků z celé ČR. Chcete aby váš profil byl úplný a přitahoval více zákazníků?

Přihlaste se zdarma a doplňte:
• Aktuální nabídku produktů
• Fotografie farmy
• Otevírací dobu a kontakt
• Možnosti dovozu nebo výdejního místa

Přihlásit se zdarma: https://mapafarem.cz/prihlaseni

S pozdravem,
Tým MapaFarem.cz

---
Tuto zprávu jste obdrželi, protože vaše farma je uvedena ve veřejném registru zemědělských subjektů ČR.
Pokud si nepřejete dostávat naše zprávy, odpovězte prosím na tento email s předmětem "Odhlásit".`,
  },

  premiumUpsell: {
    subject: 'Získejte 10× více zákazníků — prémiový profil pro vaši farmu',
    text: (farm) => `Dobrý den,

vaše farma ${farm.name} má profil na MapaFarem.cz. Víte, že farmáři s prémiovým profilem získávají v průměru 10× více poptávek?

Co získáte s prémiovým profilem:
✓ Zvýrazněná pozice ve výsledcích vyhledávání
✓ Neomezená galerie fotografií (až 20 fotek)
✓ Přímé objednávky přes platformu
✓ Sezónní nabídky a akce
✓ Odznak "Ověřená farma"
✓ Analytika návštěvnosti profilu

Cena: 299 Kč / měsíc (první měsíc ZDARMA)

Váš profil: ${farm.profileUrl}

Aktivovat prémiový profil: https://mapafarem.cz/cenik

Máte otázky? Odpovězte na tento email — rádi pomůžeme.

S pozdravem,
Tým MapaFarem.cz

---
Pokud si nepřejete dostávat naše zprávy: https://mapafarem.cz/odhlasit?email=${encodeURIComponent(farm.email || '')}`,
  },

  followUp: {
    subject: 'Ještě jeden tip pro vaši farmu na MapaFarem.cz',
    text: (farm) => `Dobrý den,

před pár dny jsme vám psali o vašem profilu farmy ${farm.name} na MapaFarem.cz.

Chtěli jsme se podělit o jeden praktický tip, který farmáři nejvíce oceňují:

💡 Tip: Farmáři, kteří přidají alespoň 3 fotografie a aktuální nabídku produktů, dostávají o 340 % více poptávek než ti s prázdným profilem.

Přidání fotografií zabere jen 5 minut:
${farm.profileUrl}

Pokud máte jakékoliv dotazy ohledně vašeho profilu, stačí odpovědět na tento email.

Přejeme hodně zákazníků,
Tým MapaFarem.cz

---
Odhlásit se z komunikace: https://mapafarem.cz/odhlasit?email=${encodeURIComponent(farm.email || '')}`,
  },

};

export default emailTemplates;
