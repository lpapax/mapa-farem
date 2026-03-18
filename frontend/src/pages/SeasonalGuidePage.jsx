// frontend/src/pages/SeasonalGuidePage.jsx
// Requires Supabase table: newsletter_subscribers (id uuid, email text unique, source text, created_at timestamptz default now())
import { useState } from 'react';
import { supabase } from '../supabase.js';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';

const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
const MONTHS_SHORT = ['Led','Úno','Bře','Dub','Kvě','Čvn','Čvc','Srp','Zář','Říj','Lis','Pro'];

const PRODUCTS_BY_MONTH = {
  1: [
    { name:'Kořenová zelenina', emoji:'🥕', photo:'1540420773420-3366772f4999', nutrition:'Vitamín A, Draslík', storage:'Vydrží 2–3 týdny v chladu', months:[10,11,12,1,2], mapFilter:'veggie',
      recipes:[
        { name:'Mrkvová polévka se zázvorem', time:'30 min', difficulty:'Snadné', servings:4,
          ingredients:['500 g mrkve','1 cibule','2 cm čerstvého zázvoru','400 ml kokosového mléka','500 ml zeleninového vývaru','sůl, pepř, olej'],
          steps:['Cibuli a zázvor nakrájejte nadrobno, orestujte na oleji 3 min.','Přidejte mrkev nakrájenou na kolečka, zalijte vývarem, vařte 20 min doměkka.','Rozmixujte tyčovým mixérem dohladka.','Vmíchejte kokosové mléko, dochutě solí a pepřem.','Podávejte s petrželkou a trochou kokosového mléka navrch.'] },
        { name:'Dušená kořenová zelenina s tymiánem', time:'40 min', difficulty:'Snadné', servings:4,
          ingredients:['200 g mrkve','200 g petržele','200 g celeru','30 g másla','čerstvý tymián','sůl, pepř'],
          steps:['Zeleninu oloupejte a nakrájejte na kostičky 2 cm.','Na pánvi rozehřejte máslo, přidejte zeleninu a orestujte 5 min.','Přidejte tymián, podlijte 100 ml vody, přikryjte a duste 25 min.','Odkryjte a nechte odpařit zbylou tekutinu 5 min.','Dochuťte solí a pepřem, podávejte jako přílohu k masu.'] }
      ]
    },
    { name:'Křen', emoji:'🌿', photo:'1592150621744-aca64f7b0b63', nutrition:'Vitamín C, Antibiotické látky', storage:'Vydrží 3 týdny v lednici', months:[1,2,3], mapFilter:'herbs',
      recipes:[
        { name:'Křenová omáčka ke svíčkové', time:'15 min', difficulty:'Snadné', servings:4,
          ingredients:['150 g čerstvého křenu','200 ml smetany ke šlehání','šťáva z ½ citronu','špetka cukru','sůl'],
          steps:['Křen oloupejte a nastrouhejte najemno.','Smetanu šlehejte do polotuha.','Vmíchejte křen, citronovou šťávu, cukr a sůl.','Nechte 10 min odležet v lednici aby se chutě spojily.','Podávejte studené jako doprovod k hovězímu masu nebo rybám.'] }
      ]
    },
    { name:'Zelí bílé', emoji:'🥬', photo:'1598170845058-32b9d6a5da37', nutrition:'Vitamín K, Vitamín C', storage:'Vydrží 1–2 týdny v lednici', months:[10,11,12,1,2], mapFilter:'veggie',
      recipes:[
        { name:'Domácí kysané zelí', time:'30 min + 14 dní', difficulty:'Střední', servings:8,
          ingredients:['1 kg bílého zelí','20 g soli','1 lžička kmínu','2 bobkové listy'],
          steps:['Zelí nakrájejte nadrobno, smíchejte se solí a kmínem.','Důkladně promačkejte rukama 10 min dokud nepustí šťávu.','Přidejte bobkový list a pevně umačkejte do sterilní sklenice.','Zelí musí být celé ponořené ve šťávě — přitlačte těžším předmětem.','Kvasit nechte při pokojové teplotě 1–2 týdny, denně zkontrolujte.'] }
      ]
    },
  ],
  2: [
    { name:'Pór', emoji:'🧅', photo:'1466193498717-c5b7cf4ccc55', nutrition:'Vitamín K, Mangan', storage:'Vydrží 1 týden v lednici', months:[11,12,1,2,3], mapFilter:'veggie',
      recipes:[
        { name:'Pórová polévka s brambory', time:'35 min', difficulty:'Snadné', servings:4,
          ingredients:['3 pórky','3 střední brambory','1 l zeleninového vývaru','100 ml smetany','máslo','sůl, pepř, muškátový oříšek'],
          steps:['Pór nakrájejte na kolečka, brambory na kostičky.','Na másle orestujte pór 5 min do měkka.','Přidejte brambory a zalijte vývarem, vařte 20 min.','Polovinu polévky rozmixujte a vraťte zpět pro krémovost.','Vmíchejte smetanu, dochuťte solí, pepřem a muškátovým oříškem.'] }
      ]
    },
    { name:'Zimní salát', emoji:'🥗', photo:'1512621776951-a57141f2eefd', nutrition:'Vitamín K, Folát', storage:'Vydrží 5 dní v lednici', months:[1,2,3], mapFilter:'veggie',
      recipes:[
        { name:'Zimní salát s hruškou a rokfortem', time:'15 min', difficulty:'Snadné', servings:2,
          ingredients:['100 g salátových listů','1 hruška','50 g rokfortu','30 g vlašských ořechů','2 lžíce olivového oleje','1 lžíce citronové šťávy','kapka medu, sůl'],
          steps:['Salátové listy omyjte a osušte papírovou utěrkou.','Hrušku nakrájejte na tenké plátky, rokfort rozdrobte.','Ořechy nasucho opečte na pánvičce 2 min do zlatova.','Připravte dresink: olivový olej + citronová šťáva + med + sůl.','Vše smíchejte, přelijte dresinkem a ihned podávejte.'] }
      ]
    },
  ],
  3: [
    { name:'Chřest zelený', emoji:'🌱', photo:'1565280654386-9f56e54b1bdf', nutrition:'Folát, Vitamín K', storage:'Vydrží 3–5 dní svisle ve vodě v lednici', months:[3,4,5,6], mapFilter:'veggie',
      recipes:[
        { name:'Pečený chřest s parmezánem', time:'20 min', difficulty:'Snadné', servings:2,
          ingredients:['500 g zeleného chřestu','3 lžíce olivového oleje','50 g parmezánu','šťáva z ½ citronu','sůl, pepř'],
          steps:['Troubu předehřejte na 220 °C.','Chřestu odlomte tuhé konce — přirozeně se zlomí na správném místě.','Rozložte na plech, pokapejte olejem, osolte a opepřete.','Pečte 12–15 min dokud nejsou špičky lehce křupavé.','Ihned nastrouhejte parmezán a pokapejte citronem.'] },
        { name:'Chřestové risotto', time:'40 min', difficulty:'Střední', servings:4,
          ingredients:['300 g rýže arborio','400 g chřestu','1 l horkého vývaru','1 cibule','100 ml bílého vína','50 g másla','50 g parmezánu'],
          steps:['Chřest nakrájejte, špičky odložte stranou.','Cibuli orestujte na másle, přidejte rýži a toastujte 2 min.','Zalijte vínem a míchejte do vstřebání, pak přidávejte vývar naběračku po naběračce.','Po 15 min vmíchejte kousky chřestu, pokračujte 5 min.','Stáhněte z ohně, vmíchejte máslo a parmezán, ozdobte špičkami.'] }
      ]
    },
    { name:'Ředkvičky', emoji:'🔴', photo:'1597362925123-77861d3fbac7', nutrition:'Vitamín C, Folát', storage:'Vydrží 1 týden v lednici', months:[3,4,5,6], mapFilter:'veggie',
      recipes:[
        { name:'Ředkvičky s farmářským máslem', time:'5 min', difficulty:'Snadné', servings:4,
          ingredients:['2 svazky ředkviček','60 g měkkého másla','vločková mořská sůl','čerstvý chléb'],
          steps:['Ředkvičky omyjte, nechte zelené natě pro dekoraci.','Máslo vyndejte z lednice 30 min předem aby bylo pomazatelné.','Na talíři vyložte ředkvičky vedle misky s máslem.','Chleba opečte v tostovači nebo na suché pánvi.','Každou ředkvičku namočte do másla, posypte solí a ukousněte s chlebem.'] }
      ]
    },
    { name:'Medvědí česnek', emoji:'🌿', photo:'1628689469838-524a4a973b8e', nutrition:'Allicin, Vitamín C', storage:'Vydrží 3 dny v lednici', months:[3,4,5], mapFilter:'herbs',
      recipes:[
        { name:'Pesto z medvědího česneku', time:'15 min', difficulty:'Snadné', servings:4,
          ingredients:['100 g medvědího česneku','50 g parmezánu','30 g piniových oříšků','100 ml olivového oleje','sůl, pepř','šťáva z ½ citronu'],
          steps:['Listy medvědího česneku opláchněte a dobře osušte.','Piniové ořechy nasucho opečte na pánvičce do zlatova, nechte vychladnout.','Vše vložte do mixéru s olejem a rozmixujte na hrubší pastu.','Vmíchejte nastrouhané parmezán, citron, sůl a pepř.','Přeložte do sklenice, přelijte tenkou vrstvou oleje — vydrží týden v lednici.'] }
      ]
    },
    { name:'Pažitka', emoji:'🌱', photo:'1618512496248-a07fe83aa8cb', nutrition:'Vitamín K, Vitamín A', storage:'Vydrží 1 týden v lednici', months:[3,4,5,6,7], mapFilter:'herbs',
      recipes:[
        { name:'Pažitkový tvaroh na topinkách', time:'10 min', difficulty:'Snadné', servings:2,
          ingredients:['200 g tvarohu','3 lžíce zakysané smetany','½ svazku pažitky','1 stroužek česneku','sůl','4 plátky chleba'],
          steps:['Tvaroh smíchejte se zakysanou smetanou do hladka.','Pažitku nasekejte najemno, česnek prolisujte.','Vmíchejte pažitku a česnek do tvarohu, dochuťte solí.','Chleba opečte v tostovači nebo na suché pánvi.','Natřete tvaroh na topinky, ozdobte pažitkou a podávejte.'] }
      ]
    },
  ],
  4: [
    { name:'Rebarbora', emoji:'🌿', photo:'1590165482129-1b8b27698780', nutrition:'Vitamín K, Vápník', storage:'Vydrží 1 týden v lednici', months:[4,5,6], mapFilter:'veggie',
      recipes:[
        { name:'Rebarborový koláč s drobenkou', time:'65 min', difficulty:'Střední', servings:8,
          ingredients:['400 g rebarbory','200 g mouky','150 g cukru','100 g másla','2 vejce','1 lžička prášku do pečiva','Drobenka: 80 g mouky, 60 g másla, 50 g cukru'],
          steps:['Troubu předehřejte na 180 °C, plech vyložte pečicím papírem.','Máslo s cukrem ušlehejte, přidejte vejce jedno po druhém.','Vmíchejte mouku s práškem do pečiva — těsto rozetřete do pekáče.','Rebarboru nakrájejte na 2 cm kousky a rovnoměrně rozložte na těsto.','Prsty propracujte drobenku z mouky, másla a cukru, posypte navrch a pečte 40 min.'] },
        { name:'Rebarborová marmeláda', time:'50 min', difficulty:'Snadné', servings:3,
          ingredients:['1 kg rebarbory','600 g zavařovacího cukru s pektinem','šťáva z 1 citronu'],
          steps:['Rebarboru nakrájejte na 1 cm kousky, smíchejte s cukrem a nechte 2 h odstát.','Přidejte citronovou šťávu, přiveďte k varu za míchání.','Vařte na středním plameni 30–40 min za stálého míchání.','Kapnutím na studený talíř zkontrolujte tuhnutí — kapka se nesmí rozlévat.','Nalijte do sterilních sklenic, okamžitě zavíčkujte a obraťte dnem vzhůru.'] }
      ]
    },
    { name:'Špenát', emoji:'🥬', photo:'1576045057995-568f588f82fb', nutrition:'Železo, Vitamín A', storage:'Vydrží 3–5 dní v lednici', months:[4,5,9,10], mapFilter:'veggie',
      recipes:[
        { name:'Špenátové knedlíčky s tvarohem', time:'45 min', difficulty:'Střední', servings:4,
          ingredients:['300 g čerstvého špenátu','250 g tvarohu','1 vejce','4 lžíce mouky','sůl, muškátový oříšek','30 g másla na podlití'],
          steps:['Špenát spařte vroucí vodou, silně vymačkejte a nasekejte najemno.','Smíchejte se tvarohem, vejcem, moukou, solí a muškátovým oříškem.','Z těsta tvarujte vlhkýma rukama knedlíčky velikosti vlašského ořechu.','Vařte v osolené vodě 8–10 min, vyndejte až po 2 min od vyplavání.','Podávejte přelité rozpuštěným máslem a strouhaným parmezánem.'] }
      ]
    },
  ],
  5: [
    { name:'Jahody', emoji:'🍓', photo:'1501746877-14128359f516', nutrition:'Vitamín C, Mangan', storage:'Vydrží 2–3 dny v lednici', months:[5,6,7], mapFilter:'veggie',
      recipes:[
        { name:'Jahodový dort s mascarpone', time:'90 min', difficulty:'Střední', servings:10,
          ingredients:['500 g jahod','200 g piškotů','500 ml smetany','200 g mascarpone','3 lžíce moučkového cukru','1 vanilkový cukr','100 ml jahodové šťávy'],
          steps:['Smetanu s mascarpone a cukrem ušlehejte do tuha.','Piškoty namočte do jahodové šťávy a vyložte dno dortové formy.','Rozetřete vrstvu krému, pokryjte plátky jahod.','Opakujte vrstvy 2–3×, zakončete krémem a celými jahodami.','Nechte tuhnout v lednici aspoň 4 hodiny nebo ideálně přes noc.'] },
        { name:'Jahodový džem', time:'45 min', difficulty:'Snadné', servings:4,
          ingredients:['1 kg jahod','600 g zavařovacího cukru s pektinem','šťáva z 1 citronu'],
          steps:['Jahody omyjte, odstraňte stopky, větší rozkrájejte na poloviny.','Smíchejte s cukrem a citronem v hrnci, nechte hodinu odstát.','Přiveďte k varu za stálého míchání, sbírejte pěnu.','Vařte 20–25 min. Ověřte tuhnutí kapkou na studený talíř.','Nalijte do horkých sklenic, zavíčkujte a obraťte dnem vzhůru.'] }
      ]
    },
    { name:'Chřest bílý', emoji:'🌿', photo:'1523741543316-beb7fc7023d8', nutrition:'Folát, Draslík', storage:'Vydrží 3 dny svisle ve vodě', months:[4,5,6], mapFilter:'veggie',
      recipes:[
        { name:'Bílý chřest s holandskou omáčkou', time:'35 min', difficulty:'Střední', servings:4,
          ingredients:['1 kg bílého chřestu','3 žloutky','150 g másla','šťáva z ½ citronu','sůl, špetka cukru','plátky šunky na podávání'],
          steps:['Chřest oloupejte od hlav dolů a odlomte dřevnaté konce.','Vařte v osolené mírně oslazené vodě 15–20 min doměkka.','Na holandskou omáčku rozšlehejte žloutky s citronem nad párou ve vodní lázni.','Pomalu vlévejte rozpuštěné máslo za stálého šlehání do husté omáčky.','Chřest podávejte s omáčkou a plátky šunky.'] }
      ]
    },
  ],
  6: [
    { name:'Maliny', emoji:'🍓', photo:'1498557850523-fd3d118b962e', nutrition:'Vitamín C, Mangan', storage:'Vydrží 2–3 dny v lednici', months:[6,7,8], mapFilter:'veggie',
      recipes:[
        { name:'Malinový sorbet', time:'20 min + 4 h mrazák', difficulty:'Snadné', servings:4,
          ingredients:['500 g malin','120 g cukru','100 ml vody','šťáva z 1 citronu'],
          steps:['Vodu a cukr svařte na sirup, nechte úplně vychladnout.','Maliny rozmixujte a proced přes síto pro hladkou texturu bez jadérek.','Smíchejte malinové pyré se sirupem a citronovou šťávou.','Nalijte do mělké nádoby a mrazte 4 hodiny — každou hodinu promíchejte vidličkou.','Servírujte v chladných sklenicích, ozdobte čerstvými maliny a mátou.'] }
      ]
    },
    { name:'Cukety', emoji:'🥒', photo:'1563565375-f3fdfdbefa83', nutrition:'Vitamín A, Draslík', storage:'Vydrží 1 týden v chladu', months:[6,7,8,9], mapFilter:'veggie',
      recipes:[
        { name:'Cuketové placičky se sýrem', time:'30 min', difficulty:'Snadné', servings:4,
          ingredients:['2 střední cukety','100 g strouhaného sýra eidamu','2 vejce','4 lžíce mouky','sůl, pepř, česnek','olej na smažení'],
          steps:['Cuketu nastrouhejte nahrubo, osolte a po 10 min vymačkejte přebytečnou vodu.','Smíchejte vejce, sýr, mouku, prolisovaný česnek a pepř.','Vmíchejte vyždímanou cuketu — těsto musí být husté, ne řídké.','Na oleji smažte lžící placičky 3 min z každé strany dozlatova.','Podávejte horké se zakysanou smetanou a čerstvým koprem.'] }
      ]
    },
    { name:'Med letní', emoji:'🍯', photo:'1558642452-9d2a7deb7f62', nutrition:'Enzymy, Antioxidanty', storage:'Vydrží roky v uzavřené nádobě', months:[6,7,8], mapFilter:'honey',
      recipes:[
        { name:'Medový dort', time:'75 min + přes noc', difficulty:'Střední', servings:12,
          ingredients:['200 g medu','250 g mouky','3 vejce','100 g másla','1 lžička sody','Krém: 500 ml smetany, 3 lžíce medu, 200 g mascarpone'],
          steps:['Med s máslem zahřejte, přidejte sodu — směs zpění, nechte vychladnout.','Vmíchejte vejce a mouku, těsto rozdělte na 6 dílů.','Každý díl rozválejte na tenký plát na pečicím papíru a pečte 5–7 min při 170 °C.','Smetanu s medem a mascarpone ušlehejte do tuha.','Střídejte pláty a krém, zakryjte fólií a nechte v lednici přes noc.'] }
      ]
    },
  ],
  7: [
    { name:'Broskve', emoji:'🍑', photo:'1595743825637-cdafc8ad4173', nutrition:'Vitamín C, Vitamín A', storage:'Vydrží 3–5 dní při pokojové teplotě', months:[7,8], mapFilter:'veggie',
      recipes:[
        { name:'Broskvový koláč s mandlemi', time:'60 min', difficulty:'Snadné', servings:8,
          ingredients:['4 broskve','200 g mouky','150 g cukru','100 g másla','2 vejce','50 g mandlových plátků','1 lžička prášku do pečiva'],
          steps:['Troubu předehřejte na 175 °C, formu vymažte a vysypte moukou.','Máslo s cukrem ušlehejte do světlé pěny, přidejte vejce jedno po druhém.','Vmíchejte mouku s práškem do pečiva a rozetřete do formy.','Broskve nakrájejte na plátky a vyložte na těsto do vějíře.','Posypte mandlovými plátky, pečte 35–40 min dozlatova.'] }
      ]
    },
    { name:'Kukuřice', emoji:'🌽', photo:'1551754655-cd27e38d2076', nutrition:'Vitamín B6, Hořčík', storage:'Spotřebujte do 1–2 dní', months:[7,8,9], mapFilter:'veggie',
      recipes:[
        { name:'Kukuřice na grilu s bylinkovým máslem', time:'25 min', difficulty:'Snadné', servings:4,
          ingredients:['4 klasy kukuřice','80 g másla','2 stroužky česneku','čerstvý tymián a petržel','sůl, uzená paprika'],
          steps:['Klasy kukuřice i se slupkou namočte do vody na 15 min.','Máslo smíchejte s nasekaným česnekem, bylinkami a paprikou.','Gril zahřejte na střední teplotu, klasy grilujte 15–20 min za otáčení.','Slupku odkryjte a klasy ještě grilujte 5 min pro karamelizaci.','Ihned potřete bylinkovým máslem a podávejte.'] }
      ]
    },
    { name:'Borůvky', emoji:'🫐', photo:'1425331085519-80c5e29540be', nutrition:'Vitamín K, Antioxidanty', storage:'Vydrží 5 dní v lednici', months:[7,8], mapFilter:'veggie',
      recipes:[
        { name:'Borůvkový cheesecake bez pečení', time:'30 min + 4 h chlazení', difficulty:'Střední', servings:8,
          ingredients:['300 g smetanového sýra cream cheese','200 ml šlehačky','100 g moučkového cukru','200 g piškotů','60 g másla','300 g borůvek','2 lžíce cukru na kompot'],
          steps:['Piškoty rozdrobte, smíchejte s rozpuštěným máslem a upěchujte na dno formy.','Smetanový sýr ušlehejte s cukrem, vmíchejte tuhá šlehačka.','Nalijte krém na piškotový základ a uhlaďte.','Borůvky rozvařte s 2 lžícemi cukru 5 min, nechte vychladnout a nalijte na krém.','Chlaďte aspoň 4 hodiny, nejlépe přes noc před podáváním.'] }
      ]
    },
  ],
  8: [
    { name:'Rajčata', emoji:'🍅', photo:'1546554137-cf5a96b4f58', nutrition:'Lykopen, Vitamín C', storage:'Neskladujte v lednici, vydrží 5 dní', months:[7,8,9], mapFilter:'veggie',
      recipes:[
        { name:'Rajčatová omáčka na těstoviny', time:'45 min', difficulty:'Snadné', servings:4,
          ingredients:['1 kg zralých rajčat','4 stroužky česneku','čerstvá bazalka','6 lžic olivového oleje','sůl, pepř, špetka cukru'],
          steps:['Rajčata zalijte vroucí vodou na 30 s, olououpejte a nakrájejte.','Česnek nakrájejte na plátky, orestujte na oleji 1 min — nesmí zhnědnout.','Přidejte rajčata, sůl a špetku cukru pro vyvážení kyselosti.','Vařte odkryté na středním ohni 30 min za míchání.','Vmíchejte celé listy bazalky, dochuťte a podávejte s al dente těstovinami.'] }
      ]
    },
    { name:'Papriky', emoji:'🫑', photo:'1601004890684-d8cbf643f5f2', nutrition:'Vitamín C, Vitamín B6', storage:'Vydrží 1 týden v lednici', months:[7,8,9], mapFilter:'veggie',
      recipes:[
        { name:'Plněné papriky s mletým masem', time:'75 min', difficulty:'Střední', servings:4,
          ingredients:['4 velké papriky','400 g mletého vepřového','150 g rýže','400 g rajčatového protlaku','1 cibule','sůl, pepř, česnek, majoránka'],
          steps:['Papriky omyjte, seřízněte víčko a vydlabejte semínka.','Rýži předvařte 8 min, cibuli s česnekem orestujte.','Smíchejte maso, rýži, cibuli, koření a třetinu protlaku.','Naplňte papriky masovou směsí a zakryjte odříznutými víčky.','Postavte do pekáče, zalijte zbylým protlakem, podlijte vodou, pečte 55 min při 180 °C.'] }
      ]
    },
    { name:'Melouny', emoji:'🍉', photo:'1563241527-3b773a95f242', nutrition:'Vitamín A, Draslík', storage:'Celý vydrží 1 týden, krájený 3 dny', months:[7,8,9], mapFilter:'veggie',
      recipes:[
        { name:'Melounový salát s fetou a mátou', time:'15 min', difficulty:'Snadné', servings:4,
          ingredients:['½ melounu','200 g feta sýra','hrst čerstvé máty','šťáva z 1 limetky','2 lžíce olivového oleje','mořská sůl'],
          steps:['Meloun oloupejte a nakrájejte na trojúhelníkové plátky nebo kostky.','Feta sýr rozdrobte nebo nakrájejte na kostičky.','Připravte dresink: limetková šťáva + olivový olej + špetka soli.','Meloun s fetou rozložte na talíř, pokapejte dresinkem.','Ozdobte čerstvou mátou a podávejte ihned vychlazené.'] }
      ]
    },
  ],
  9: [
    { name:'Dýně Hokkaido', emoji:'🎃', photo:'1570586437263-ab629fccc818', nutrition:'Beta-karoten, Vitamín E', storage:'Vydrží 3 měsíce v chladnu a temnu', months:[9,10,11], mapFilter:'veggie',
      recipes:[
        { name:'Krémová dýňová polévka', time:'45 min', difficulty:'Snadné', servings:6,
          ingredients:['1 kg dýně Hokkaido','1 velká cibule','3 stroužky česneku','1 l zeleninového vývaru','200 ml kokosového mléka','1 lžička zázvoru','sůl, pepř','dýňový olej a semínka na ozdobu'],
          steps:['Dýni nakrájejte (slupku Hokkaido nemusíte loupat), cibuli a česnek nasekejte.','Na oleji orestujte cibuli a česnek 3 min, přidejte zázvor.','Přidejte dýni, zalijte vývarem a vařte 25 min doměkka.','Rozmixujte tyčovým mixérem na hladký krém, vmíchejte kokosové mléko.','Dochuťte solí a pepřem, servírujte s dýňovým olejem, semínky a kváskovým chlebem.'] },
        { name:'Dýňový koláč se skořicí', time:'80 min', difficulty:'Střední', servings:10,
          ingredients:['400 g dýňového pyré','200 g mouky','150 g cukru','3 vejce','120 ml oleje','2 lžičky skořice','1 lžička zázvoru','1 lžička prášku do pečiva'],
          steps:['Troubu předehřejte na 175 °C, formu vymažte a vysypte moukou.','Vejce s cukrem ušlehejte do světlé pěny, přilijte olej.','Vmíchejte dýňové pyré a koření.','Přisypte mouku s práškem, promíchejte jen do spojení — nepřemíchávejte.','Nalijte do formy, pečte 55–65 min. Hotovost ověřte zapíchnutou špejlí.'] }
      ]
    },
    { name:'Lesní houby', emoji:'🍄', photo:'1504674900247-0877df9cc836', nutrition:'Vitamín D, Selen', storage:'Vydrží 3–5 dní v lednici', months:[8,9,10], mapFilter:'bio',
      recipes:[
        { name:'Houbová omáčka s tymiánem', time:'30 min', difficulty:'Snadné', servings:4,
          ingredients:['500 g lesních hub (hříbky, lišky)','1 cibule','2 stroužky česneku','200 ml smetany','čerstvý tymián a petržel','sůl, pepř','máslo'],
          steps:['Houby očistěte kartáčkem a nakrájejte na plátky.','Cibuli s česnekem orestujte na másle 3 min.','Přidejte houby, smažte na větším ohni 8–10 min aby se odpařila voda.','Přilijte smetanu, přidejte tymián, duste 5 min do zhoustnutí.','Dochuťte, posypte petrželkou, podávejte s knedlíkem nebo štoufky.'] }
      ]
    },
  ],
  10: [
    { name:'Jablka', emoji:'🍎', photo:'1516912481800-3ab9985c6e40', nutrition:'Vitamín C, Pektin', storage:'Vydrží 1–2 měsíce v chladnu a temnu', months:[9,10,11], mapFilter:'veggie',
      recipes:[
        { name:'Jablečný závin', time:'70 min', difficulty:'Střední', servings:8,
          ingredients:['6 jablek','závinové těsto (nebo listové)','2 lžíce cukru','1 lžička skořice','50 g rozinek','2 lžíce strouhanky','máslo na potření'],
          steps:['Jablka oloupejte, nakrájejte nadrobno, smíchejte s cukrem, skořicí a rozinkami.','Těsto rozvállejte na velký tenký plát na navlhčené utěrce.','Potřete máslem, posypte strouhankou (nasaje jablečnou šťávu).','Naneste jablečnou náplň podél jednoho okraje, zaviňte pomocí utěrky.','Přeložte na plech, potřete vajíčkem, pečte 35–40 min při 190 °C.'] }
      ]
    },
    { name:'Červená řepa', emoji:'🟣', photo:'1571704564760-6ac1e48f40a0', nutrition:'Folát, Draslík', storage:'Vydrží 2–3 týdny v lednici', months:[8,9,10,11], mapFilter:'veggie',
      recipes:[
        { name:'Pečená řepa s kozím sýrem a ořechy', time:'60 min', difficulty:'Snadné', servings:4,
          ingredients:['500 g červené řepy','100 g kozího sýra','50 g vlašských ořechů','2 lžíce medu','2 lžíce balzamikového octa','olivový olej','sůl, pepř','rukola'],
          steps:['Řepu zabalte jednotlivě do alobalu, pečte při 200 °C 45–55 min doměkka.','Po vychladnutí oloupejte — ideálně v gumových rukavicích.','Nakrájejte na plátky, připravte dresink z medu, balzamika a oleje.','Na talíři rozložte rukolu, plátky řepy, rozdrobený kozí sýr a opečené ořechy.','Přelijte dresinkem a okamžitě podávejte.'] }
      ]
    },
  ],
  11: [
    { name:'Zelí podzimní', emoji:'🥬', photo:'1544025162-d76538d5b834', nutrition:'Vitamín K, Vitamín C', storage:'Vydrží 2 týdny v lednici', months:[10,11,12], mapFilter:'veggie',
      recipes:[
        { name:'Svíčková na smetaně', time:'3 hod', difficulty:'Náročné', servings:6,
          ingredients:['1 kg hovězí svíčkové','300 g kořenové zeleniny (mrkev, petržel, celer)','200 ml smetany','500 ml vývaru','koření: bobkový list, nové koření, celý pepř','brusinkový džem, houskový knedlík'],
          steps:['Maso opepřete, orestujte ze všech stran na másle dozlatova.','Přidejte nakrájenou zeleninu a koření, podlijte vývarem.','Přikryjte a duste v troubě při 160 °C 2,5 hodiny, přilévejte vývar.','Omáčku sceďte, zeleninu rozmixujte a vmíchejte zpět, zahuštěte moukou.','Vmíchejte smetanu, dochuťte — podávejte s knedlíkem, červeným zelím a brusinkami.'] }
      ]
    },
    { name:'Vlašské ořechy', emoji:'🌰', photo:'1509440159596-0249088772ff', nutrition:'Omega-3, Vitamín E', storage:'Vydrží 6 měsíců ve vzduchotěsné nádobě', months:[10,11,12], mapFilter:'bio',
      recipes:[
        { name:'Ořechová roláda', time:'80 min + přes noc', difficulty:'Střední', servings:10,
          ingredients:['200 g vlašských ořechů','4 vejce','150 g cukru','1 lžíce mouky','Krém: 200 ml šlehačky, 3 lžíce ořechového másla, 50 g moučkového cukru'],
          steps:['Ořechy pomelte najemno, troubu předehřejte na 180 °C.','Bílky ušlehejte do tuha, žloutky s cukrem do světlé pěny.','Žloutkovou pěnu opatrně vmíchejte do bílků, přisypte ořechy a mouku.','Nalijte na plech s pečicím papírem, pečte 12–15 min — musí být pružný.','Ještě teplé zarolujte do navlhčeného ručníku, po vychlazení plňte krémem a chlaďte přes noc.'] }
      ]
    },
  ],
  12: [
    { name:'Jablečný mošt', emoji:'🍎', photo:'1576673442511-7e39b6545c87', nutrition:'Vitamín C, Antioxidanty', storage:'Vydrží 5 dní po otevření v lednici', months:[10,11,12], mapFilter:'wine',
      recipes:[
        { name:'Svařený mošt s kořením', time:'20 min', difficulty:'Snadné', servings:4,
          ingredients:['1 l čerstvého jablečného moštu','2 tyčinky skořice','4 hřebíčky','2 hvězdičky badyánu','kůra z ½ citronu','kůra z ½ pomeranče','1 lžíce medu'],
          steps:['Mošt nalijte do hrnce, přidejte koření a citrusovou kůru.','Zahřívejte na středním ohni 15 min — nepřivádějte k varu.','Přidejte med, promíchejte a nechte ještě 5 min louhovat.','Ocedte přes jemné síto.','Podávejte horké, ozdobte plátkem pomeranče a tyčinkou skořice.'] }
      ]
    },
    { name:'Kořenová zelenina na svíčkovou', emoji:'🥕', photo:'1488900128323-21503983a8c2', nutrition:'Vitamín A, C, K', storage:'Vydrží 1 týden v lednici', months:[10,11,12,1], mapFilter:'veggie',
      recipes:[
        { name:'Svíčková na smetaně', time:'240 min', difficulty:'Náročné', servings:6,
          ingredients:['1,2 kg hovězí svíčkové','250 g mrkve','150 g petržele','100 g celeru','200 ml smetany ke šlehání','100 ml červeného vína','sůl, pepř, bobkový list, nové koření','brusinkový džem a knedlíky'],
          steps:['Zeleninu nakrájejte, s kořením spolu zalijte vroucí vodou na 30 min.','Maso ze všech stran opečte na másle dozlatova, přeložte do pekáče.','Přidejte zeleninu s nálevem, přikryjte a duste v troubě 180 °C po 2,5 hodiny.','Výpek sceďte, zeleninu rozmixujte a vraťte do omáčky, zahuštěte moukou.','Vmíchejte smetanu a víno, dochuťte — podávejte s knedlíkem a brusinkami.'] }
      ]
    },
    { name:'Rozmarýn a zimní bylinky', emoji:'🌿', photo:'1515586000433-45406d8e6662', nutrition:'Antioxidanty, Vitamín C', storage:'Vydrží 2 týdny v lednici', months:[11,12,1,2], mapFilter:'herbs',
      recipes:[
        { name:'Bylinková sůl do kuchyně', time:'15 min + sušení', difficulty:'Snadné', servings:1,
          ingredients:['100 g hrubé mořské soli','2 větve rozmarýnu','4 větvičky tymiánu','2 snítky šalvěje','2 stroužky česneku'],
          steps:['Bylinky operte a velmi dobře osušte papírovou utěrkou.','Vše spolu se solí rozmixujte pulzačně na hrubší prášek.','Rozetřete na plech a nechte 1–2 hodiny oschnout při pokojové teplotě.','Přesypte do sklenice se šroubovacím víčkem.','Používejte místo klasické soli na maso, zeleninu nebo čerstvý chléb.'] }
      ]
    },
  ],
};

const C = {
  green: '#2D5016',
  gold: '#C8963E',
  cream: '#FAF7F2',
  text: '#1A1A1A',
  border: '#E8E0D0',
};

function ProductCard({ product, currentMonth, onRecipeClick, navigate }) {
  const [recipesOpen, setRecipesOpen] = useState(false);
  const recipeCount = product.recipes ? product.recipes.length : 0;

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Photo */}
      <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
        <img
          src={`https://images.unsplash.com/photo-${product.photo}?w=600&q=80&fit=crop&auto=format`}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => {
            e.target.style.display = 'none';
            e.target.parentNode.style.background = '#E8E0D0';
          }}
        />
        {/* Season dots overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0,0,0,0.55)',
          padding: '6px 12px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap' }}>Sezóna:</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              const inSeason = product.months.includes(m);
              const isCurrent = m === currentMonth;
              return (
                <div
                  key={m}
                  title={MONTHS[i]}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: isCurrent
                      ? C.gold
                      : inSeason
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(255,255,255,0.2)',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 20 }}>
        {/* Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>{product.emoji}</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
          }}>
            {product.name}
          </span>
        </div>

        {/* Nutrition badge */}
        <div style={{
          display: 'inline-block',
          background: '#EEF5E8',
          color: C.green,
          borderRadius: 9999,
          padding: '3px 12px',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          marginBottom: 10,
        }}>
          {product.nutrition}
        </div>

        {/* Storage tip */}
        <div style={{
          background: '#FAF7F2',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 13,
          color: '#555',
          fontFamily: "'Inter', sans-serif",
          marginBottom: 14,
        }}>
          🌡️ {product.storage}
        </div>

        {/* Buy button */}
        <button
          onClick={() => navigate(`/mapa?filter=${product.mapFilter}`)}
          style={{
            background: 'transparent',
            border: `1.5px solid ${C.gold}`,
            color: C.gold,
            borderRadius: 9999,
            padding: '7px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            marginBottom: recipeCount > 0 ? 14 : 0,
          }}
        >
          Kde koupit →
        </button>

        {/* Recipes toggle */}
        {recipeCount > 0 && (
          <div>
            <button
              onClick={() => setRecipesOpen(o => !o)}
              style={{
                display: 'block',
                width: '100%',
                background: 'none',
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                textAlign: 'left',
              }}
            >
              {recipesOpen ? '▲' : '▼'} Recepty ({recipeCount})
            </button>

            <AnimatePresence>
              {recipesOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {product.recipes.map(recipe => (
                      <button
                        key={recipe.name}
                        onClick={() => onRecipeClick(recipe, product)}
                        style={{
                          background: '#FAF7F2',
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          padding: '10px 12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                          {recipe.name}
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#888' }}>
                          <span>⏱ {recipe.time}</span>
                          <span>📊 {recipe.difficulty}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SeasonalGuidePage() {
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState(null);
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState(null);

  useSEO({
    title: `Sezónní kalendář — ${MONTHS[currentMonth - 1]}`,
    description: 'Co je teď v sezóně v ČR? Recepty, tipy na skladování a kde koupit čerstvé produkty od farmářů.',
  });

  const currentProducts = PRODUCTS_BY_MONTH[selectedMonth] || [];

  function handleRecipeClick(recipe, product) {
    setSelectedRecipe(recipe);
    setSelectedRecipeProduct(product);
  }

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!nlEmail.includes('@')) return;
    setNlStatus('loading');
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: nlEmail.trim().toLowerCase(), source: 'sezona' });
      if (error?.code === '23505') { setNlStatus('duplicate'); return; }
      if (error) throw error;
      setNlStatus('success');
      setNlEmail('');
    } catch { setNlStatus('error'); }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'Inter', sans-serif", color: C.text }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      {/* HEADER */}
      <header style={{
        background: C.green,
        padding: '48px 20px',
        textAlign: 'center',
      }}>
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 28 }}>🌾</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: C.cream,
          }}>
            MapaFarem.cz
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 900,
          color: C.cream,
          marginBottom: 12,
          lineHeight: 1.15,
        }}>
          Co je teď v sezóně — {MONTHS[currentMonth - 1]}
        </h1>

        <p style={{
          fontSize: 16,
          color: 'rgba(250,247,242,0.75)',
          maxWidth: 480,
          margin: '0 auto',
        }}>
          Vyberte měsíc a zjistěte, co právě dozrává
        </p>
      </header>

      {/* 12-MONTH CALENDAR GRID */}
      <div style={{ background: 'white', padding: '32px 20px' }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 8,
        }}>
          {MONTHS.map((name, i) => {
            const m = i + 1;
            const isCurrent = m === currentMonth;
            const isSelected = m === selectedMonth;
            const count = (PRODUCTS_BY_MONTH[m] || []).length;
            const label = MONTHS_SHORT[i];

            let bg, textColor, fontWeight;
            if (isCurrent && isSelected) {
              bg = C.green; textColor = 'white'; fontWeight = 700;
            } else if (isCurrent) {
              bg = C.green; textColor = 'white'; fontWeight = 700;
            } else if (isSelected) {
              bg = C.gold; textColor = 'white'; fontWeight = 700;
            } else {
              bg = C.cream; textColor = C.text; fontWeight = 400;
            }

            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                style={{
                  background: bg,
                  color: textColor,
                  fontWeight,
                  border: 'none',
                  borderRadius: 9999,
                  padding: '8px 4px',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span style={{
                    background: 'rgba(0,0,0,0.15)',
                    borderRadius: 9999,
                    fontSize: 10,
                    padding: '1px 6px',
                    color: textColor === 'white' ? 'rgba(255,255,255,0.85)' : '#888',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRODUCTS SECTION */}
      <div style={{ background: C.cream, padding: '40px 20px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            marginBottom: 28,
          }}>
            V {MONTHS[selectedMonth - 1]} sklízíme:
          </h2>

          {currentProducts.length === 0 ? (
            <p style={{ color: '#888', fontSize: 15 }}>Pro tento měsíc nemáme data.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
            }}>
              {currentProducts.map(product => (
                <ProductCard
                  key={product.name}
                  product={product}
                  currentMonth={selectedMonth}
                  onRecipeClick={handleRecipeClick}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PRESERVATION TIPS */}
      <div style={{ background: 'white', padding: '40px 20px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            marginBottom: 28,
          }}>
            Jak uchovat sezónní úrodu
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                icon: '🫙',
                title: 'Jak zavařit',
                text: 'Zahřejte sklenice na 150°C, naplňte horkou náplní, zavřete a obraťte dnem vzhůru.',
              },
              {
                icon: '❄️',
                title: 'Jak zmrazit',
                text: 'Zeleninu blanšírujte 2–3 minuty, schovejte do ledové vody, osušte a zmrazte.',
              },
              {
                icon: '☀️',
                title: 'Jak usušit',
                text: 'Nakrájejte na plátky 5mm, sušte v troubě na 60°C nebo v sušičce 6–8 hodin.',
              },
            ].map(({ icon, title, text }) => (
              <div
                key={title}
                style={{
                  background: C.cream,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  padding: '24px 20px',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: 10,
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEWSLETTER */}
      <div style={{
        background: C.green,
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          fontWeight: 700,
          color: C.cream,
          marginBottom: 20,
        }}>
          Sezónní tipy každý měsíc
        </h2>

        <form
          onSubmit={handleSubscribe}
          style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <input
            type="email"
            placeholder="váš@email.cz"
            value={nlEmail}
            onChange={e => setNlEmail(e.target.value)}
            required
            style={{
              padding: '12px 20px',
              borderRadius: 9999,
              border: 'none',
              fontSize: 15,
              fontFamily: "'Inter', sans-serif",
              width: 280,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={nlStatus === 'loading'}
            style={{
              background: C.gold,
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 700,
              cursor: nlStatus === 'loading' ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              opacity: nlStatus === 'loading' ? 0.7 : 1,
            }}
          >
            {nlStatus === 'loading' ? 'Přihlašuji...' : 'Přihlásit odběr'}
          </button>
        </form>
        {nlStatus === 'success' && (
          <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: '#4ADE80' }}>Přihlášeno! Těšte se na tipy z farem.</p>
        )}
        {nlStatus === 'duplicate' && (
          <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: C.gold }}>Tento e-mail je již přihlášen.</p>
        )}
        {nlStatus === 'error' && (
          <p style={{ marginTop: 14, fontSize: 15, fontWeight: 700, color: '#F87171' }}>Chyba, zkuste znovu.</p>
        )}
      </div>

      {/* RECIPE MODAL */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setSelectedRecipe(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: 32,
                maxWidth: 480,
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                marginBottom: 16,
                color: C.text,
              }}>
                {selectedRecipe.name}
              </h2>

              <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 14, color: '#555', flexWrap: 'wrap' }}>
                <span>⏱️ {selectedRecipe.time}</span>
                <span>📊 {selectedRecipe.difficulty}</span>
                {selectedRecipe.servings && <span>👥 {selectedRecipe.servings} porce</span>}
              </div>

              <div style={{ marginBottom: 20 }}>
                <strong style={{ fontFamily: "'Inter', sans-serif", fontSize: 14 }}>Ingredience:</strong>
                <ul style={{ margin: '8px 0 0 20px', fontSize: 14, lineHeight: 1.8, color: '#444' }}>
                  {selectedRecipe.ingredients.map(ing => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              </div>

              {selectedRecipe.steps?.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <strong style={{ fontFamily: "'Inter', sans-serif", fontSize: 14 }}>Postup:</strong>
                  <ol style={{ margin: '8px 0 0 20px', fontSize: 14, lineHeight: 1.8, color: '#444' }}>
                    {selectedRecipe.steps.map((step, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              <button
                onClick={() => navigate(`/mapa?filter=${selectedRecipeProduct?.mapFilter || ''}`)}
                style={{
                  background: C.gold,
                  color: 'white',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '10px 20px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                }}
              >
                Najít farmu s tímto produktem →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
