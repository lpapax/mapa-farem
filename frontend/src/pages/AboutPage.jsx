// frontend/src/pages/AboutPage.jsx
import { useNavigate } from 'react-router-dom';
import FARMS_DATA from '../data/farms.json';

const C = { cream:'#F5EDE0', terra:'#BF5B3D', green:'#3A5728', brown:'#2C1810', mid:'#7A4F3A' };

const VALUES = [
  { emoji:'🌱', title:'Lokálnost', desc:'Každá farma na naší mapě je ověřený místní producent — žádné supermarkety, žádné mezičlánky.' },
  { emoji:'🤝', title:'Poctivost', desc:'Věříme, že víš, co jíš. Farmáři sdílejí přesné informace o svých produktech a metodách.' },
  { emoji:'🇨🇿', title:'Česká republika', desc:'Pokrýváme všech 14 krajů. Ať jsi v Praze nebo v Beskydech, čerstvé jídlo je blíž než myslíš.' },
  { emoji:'♻️', title:'Udržitelnost', desc:'Podporujeme farmáře s BIO certifikátem, bezobalovým prodejem a šetrným hospodařením.' },
];

const TEAM = [
  { name:'Michal', role:'Zakladatel & vývoj', emoji:'👨‍💻', desc:'Student ze Zlínského kraje. Vybudoval MapaFarem od nuly — od prvního řádku kódu po poslední ověřenou farmu na mapě.' },
  { name:'1 695 farmářů', role:'Srdce projektu', emoji:'🌾', desc:'Každý farmář, který je na mapě, je součástí toho, čím MapaFarem je. Bez nich by to byla jen prázdná stránka.' },
  { name:'Zákazníci', role:'Komunita & motor růstu', emoji:'❤️', desc:'Lidé, kteří věří, že jídlo má mít původ, tvář a příběh. Každý nákup přímo od farmáře posouvá projekt dopředu.' },
];

function Leaf({ style }) {
  return (
    <svg viewBox="0 0 80 120" fill="none" style={{ ...style, pointerEvents:'none' }}>
      <path d="M40 10 C20 30 5 55 10 80 C15 105 35 115 40 110 C45 115 65 105 70 80 C75 55 60 30 40 10Z" fill="currentColor" opacity=".65"/>
      <path d="M40 10 L40 110" stroke="currentColor" strokeWidth="1.5" opacity=".4"/>
    </svg>
  );
}

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.cream, color:C.brown, overflowX:'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @media(max-width:768px){
          .about-two{grid-template-columns:1fr!important;}
          .values-grid{grid-template-columns:1fr 1fr!important;}
          .team-grid{grid-template-columns:1fr!important;}
        }
        @media(max-width:480px){
          .values-grid{grid-template-columns:1fr!important;}
          .about-nav{padding:0 16px!important;}
          .about-section{padding-left:16px!important;padding-right:16px!important;}
        }
      `}</style>

      {/* NAV */}
      <nav className="about-nav" style={{ position:'fixed',top:0,left:0,right:0,zIndex:300,background:'rgba(245,237,224,.96)',backdropFilter:'blur(14px)',borderBottom:'1px solid rgba(191,91,61,.1)',padding:'0 40px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div onClick={() => navigate('/')} style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}>
          <span style={{ fontSize:24 }}>🌾</span>
          <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:19,color:C.brown }}>
            Mapa<span style={{ color:C.terra }}>Farem</span>
          </div>
        </div>
        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
          <button onClick={() => navigate(-1)} style={{ padding:'8px 15px',background:'none',border:'none',fontSize:14,fontWeight:500,cursor:'pointer',color:'#555',fontFamily:"'DM Sans',sans-serif",borderRadius:8 }}>← Zpět</button>
          <button onClick={() => navigate('/mapa')} style={{ padding:'10px 22px',background:C.green,color:'white',border:'none',borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 3px 12px rgba(58,87,40,.28)' }}>
            Otevřít mapu
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop:64,minHeight:'60vh',display:'flex',alignItems:'center',background:C.cream,position:'relative',overflow:'hidden' }}>
        <Leaf style={{ position:'absolute',top:80,right:80,width:56,height:84,color:C.green,opacity:.2,transform:'rotate(-20deg)' }}/>
        <Leaf style={{ position:'absolute',bottom:40,left:30,width:40,height:60,color:C.terra,opacity:.18,transform:'rotate(35deg)' }}/>
        <div style={{ position:'absolute',top:-60,left:-80,width:320,height:320,borderRadius:'50%',background:`${C.terra}`,opacity:.05 }}/>

        <div className="about-section" style={{ maxWidth:1100,margin:'0 auto',padding:'72px 40px 60px',width:'100%' }}>
          <div className="about-two" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-flex',alignItems:'center',gap:8,background:'rgba(191,91,61,.1)',border:'1px solid rgba(191,91,61,.25)',padding:'5px 16px',borderRadius:50,fontSize:12,fontWeight:700,color:C.terra,marginBottom:22 }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:C.terra,display:'inline-block' }}/>
                Náš příběh
              </div>
              <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:900,lineHeight:1.12,color:C.brown,marginBottom:22 }}>
                Spojujeme farmáře<br/>
                <em style={{ color:C.green,fontStyle:'italic' }}>se zákazníky</em><br/>
                napříč Českem
              </h1>
              <p style={{ fontSize:16,color:'#6B4F3A',lineHeight:1.85,marginBottom:32,maxWidth:420 }}>
                MapaFarem.cz vznikl z přesvědčení, že každý by měl vědět, odkud pochází jeho jídlo. Propojujeme lokální farmáře s lidmi, kteří chtějí jíst poctivě — bez zbytečných mezičlánků.
              </p>
              <div style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
                <button onClick={() => navigate('/mapa')} style={{ padding:'14px 32px',background:C.green,color:'white',border:'none',borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 5px 20px rgba(58,87,40,.3)' }}>
                  Prozkoumat mapu
                </button>
                <button onClick={() => navigate('/pridat-farmu')} style={{ padding:'14px 32px',background:'transparent',color:C.green,border:`2px solid ${C.green}`,borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
                  Přidat farmu →
                </button>
              </div>
            </div>

            {/* Stats box */}
            <div style={{ background:'white',borderRadius:28,padding:'40px',boxShadow:'0 16px 56px rgba(44,24,16,.1)',border:'1px solid rgba(58,87,40,.06)' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:32 }}>
                {[
                  { n:FARMS_DATA.length.toLocaleString('cs-CZ'), l:'ověřených farem', icon:'🌾', color:C.green },
                  { n:'14', l:'krajů pokryto', icon:'📍', color:C.terra },
                  { n:'4.5★', l:'průměrné hodnocení', icon:'⭐', color:'#C5A028' },
                  { n:'Zdarma', l:'přidání farmy', icon:'🤝', color:C.mid },
                ].map(({ n, l, icon, color }) => (
                  <div key={l}>
                    <div style={{ fontSize:22,marginBottom:6 }}>{icon}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color,lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:13,color:'#999',marginTop:4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PŘÍBĚH */}
      <section className="about-section" style={{ padding:'80px 40px',background:'white' }}>
        <div style={{ maxWidth:760,margin:'0 auto',textAlign:'center' }}>
          <div style={{ fontSize:12,fontWeight:700,letterSpacing:3,color:C.terra,textTransform:'uppercase',marginBottom:12 }}>Jak jsme začali</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,color:C.brown,marginBottom:28 }}>Jeden problém, jedno řešení</h2>
          <div style={{ display:'flex',flexDirection:'column',gap:20,textAlign:'left' }}>
            {[
              'Bylo to jednoduché: chtěli jsme koupit čerstvá rajčata od farmáře. Jenže kde? Google mapy ukázaly supermarkety, ne farmy. Žádná ucelená databáze neexistovala.',
              'Tak jsme ji vytvořili. Začali jsme s farmami ve Zlínském kraji. Dnes máme přes 1 695 ověřených farem z celé České republiky — od malých zahrádkářů po velké BIO podniky.',
              'MapaFarem.cz není jen mapa. Je to komunita lidí, kteří věří, že jídlo má mít příběh, adresu a tvář farmáře za ním.',
            ].map((text, i) => (
              <div key={i} style={{ display:'flex',gap:16,alignItems:'flex-start' }}>
                <div style={{ width:28,height:28,borderRadius:'50%',background:`${C.green}15`,border:`1.5px solid ${C.green}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:C.green,flexShrink:0,marginTop:2 }}>{i+1}</div>
                <p style={{ fontSize:15,color:'#6B4F3A',lineHeight:1.85 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HODNOTY */}
      <section className="about-section" style={{ padding:'80px 40px',background:C.cream,position:'relative',overflow:'hidden' }}>
        <Leaf style={{ position:'absolute',bottom:40,right:60,width:60,height:90,color:C.green,opacity:.15,transform:'rotate(15deg)' }}/>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:52 }}>
            <div style={{ fontSize:12,fontWeight:700,letterSpacing:3,color:C.terra,textTransform:'uppercase',marginBottom:12 }}>Co nás řídí</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,color:C.brown }}>Naše hodnoty</h2>
          </div>
          <div className="values-grid" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24 }}>
            {VALUES.map((v,i) => (
              <div key={i} style={{ background:'white',borderRadius:20,padding:'28px 24px',boxShadow:'0 4px 20px rgba(44,24,16,.07)',border:'1px solid rgba(58,87,40,.06)' }}>
                <div style={{ fontSize:36,marginBottom:16 }}>{v.emoji}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.brown,marginBottom:10 }}>{v.title}</h3>
                <p style={{ fontSize:14,color:'#6B4F3A',lineHeight:1.75 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TÝM */}
      <section className="about-section" style={{ padding:'80px 40px',background:'white' }}>
        <div style={{ maxWidth:900,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:52 }}>
            <div style={{ fontSize:12,fontWeight:700,letterSpacing:3,color:C.terra,textTransform:'uppercase',marginBottom:12 }}>Kdo za tím stojí</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,color:C.brown }}>Náš tým</h2>
          </div>
          <div className="team-grid" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24 }}>
            {TEAM.map((m, i) => (
              <div key={i} style={{ textAlign:'center',padding:'36px 24px',borderRadius:20,background:C.cream,border:'1px solid rgba(58,87,40,.08)' }}>
                <div style={{ width:72,height:72,borderRadius:'50%',background:`${C.green}12`,border:`2px solid ${C.green}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 18px' }}>
                  {m.emoji}
                </div>
                <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.brown,marginBottom:4 }}>{m.name}</div>
                <div style={{ fontSize:12,fontWeight:700,color:C.terra,marginBottom:12,textTransform:'uppercase',letterSpacing:1 }}>{m.role}</div>
                <p style={{ fontSize:14,color:'#6B4F3A',lineHeight:1.7 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-section" style={{ padding:'80px 40px',background:C.cream }}>
        <div style={{ maxWidth:700,margin:'0 auto',textAlign:'center' }}>
          <div style={{ background:`linear-gradient(135deg, ${C.green} 0%, #4A7535 100%)`,borderRadius:28,padding:'52px 40px',color:'white',position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',border:'1px solid rgba(255,255,255,.08)' }}/>
            <div style={{ position:'absolute',bottom:-30,left:-30,width:130,height:130,borderRadius:'50%',border:'1px solid rgba(255,255,255,.06)' }}/>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:3,opacity:.7,textTransform:'uppercase',marginBottom:12 }}>Přidej se k nám</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,marginBottom:16,lineHeight:1.2 }}>
              Podpoř lokální<br/>zemědělství
            </h2>
            <p style={{ fontSize:15,opacity:.85,lineHeight:1.8,marginBottom:32,maxWidth:420,margin:'0 auto 32px' }}>
              Každý nákup přímo od farmáře znamená méně CO₂, méně chemie a více peněz pro lidi ve tvém okolí.
            </p>
            <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' }}>
              <button onClick={() => navigate('/mapa')} style={{ padding:'14px 32px',background:'white',color:C.green,border:'none',borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",boxShadow:'0 4px 16px rgba(0,0,0,.15)' }}>
                🗺️ Otevřít mapu
              </button>
              <button onClick={() => navigate('/pridat-farmu')} style={{ padding:'14px 32px',background:'transparent',color:'white',border:'2px solid rgba(255,255,255,.5)',borderRadius:50,fontWeight:700,fontSize:15,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
                + Přidat farmu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER mini */}
      <footer className="about-section" style={{ background:C.brown,padding:'28px 40px',textAlign:'center' }}>
        <p style={{ fontSize:12,color:'rgba(255,255,255,.3)' }}>© 2026 MapaFarem.cz · Podpora lokálního zemědělství v ČR 🌱</p>
      </footer>
    </div>
  );
}
