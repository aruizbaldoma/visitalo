/**
 * SEO itineraries data — single source of truth for /destination-en-X-dias and
 * /destination-in-X-days landing pages.
 *
 * Structure:
 *   destinations[slugId] = {
 *     es: { slug, ...content },
 *     en: { slug, ...content },
 *   }
 *
 * The DestinationItinerary page renders any of these by id + lang.
 */

const SITE_URL = "https://visitalo.es";

const buildUrls = (esSlug, enSlug) => ({
  esUrl: `${SITE_URL}/${esSlug}`,
  enUrl: `${SITE_URL}/${enSlug}`,
});

export const seoItineraries = {
  /* ───────── ROME ───────── */
  rome: {
    meta: { tripLength: "short", region: "europe", days: 3 },
    es: {
      slug: "roma-en-3-dias",
      lang: "es",
      ...buildUrls("roma-en-3-dias", "rome-in-3-days"),
      eyebrow: "Itinerario de Roma",
      destinationName: "Roma",
      durationLabel: "3 días",
      highlights: ["Coliseo y Foro al amanecer", "Vaticano sin colas", "Atardecer en Trastevere"],
      title: "Roma en 3 días: itinerario completo día a día | Visítalo",
      description:
        "Itinerario de Roma en 3 días con qué ver mañana, tarde y noche. Coliseo, Vaticano, Trastevere y más. Plan claro, sin liarte y listo para usar.",
      h1Line1: "Roma en 3 días:",
      h1Line2: "itinerario completo día a día.",
      intro: [
        "Roma es una ciudad que se vive con calma. En tres días no la ves entera (nadie lo hace), pero sí puedes salir con la sensación de haber comido bien, paseado mucho y visto lo imprescindible. Lo difícil no es elegir: es ordenar.",
        "Planificar un viaje cansa. Pestañas abiertas, foros de hace seis años, mapas que no encajan… Por eso hicimos este itinerario de **Roma en 3 días**: un plan que respira, con tres días repartidos en mañana, tarde y noche y los sitios que sí merecen la pena.",
        "Si quieres saltarte el lío, al final tienes la versión rápida: te montamos uno como este en segundos, adaptado a tu rollo.",
      ],
      days: [
        { title: "Centro histórico, Coliseo y primer paseo por Trastevere.", periods: [
          { label: "Mañana", text: "Empieza fuerte: Coliseo, Foro Romano y Palatino. Reserva la entrada con horario para no hacer cola. Después, baja andando hasta Piazza Venezia y respira un poco antes de seguir." },
          { label: "Tarde",  text: "Comida ligera por el centro y deja que la ciudad te lleve: Fontana di Trevi, Panteón, Piazza Navona. Es la parte más turística pero también la más cinematográfica. Para algo en una trattoria pequeña, no en la primera con menú en seis idiomas." },
          { label: "Noche",  text: "Cruza al otro lado del Tíber y cena en Trastevere. Calles empedradas, hiedra, terrazas. Es donde Roma deja de parecer postal y empieza a ser barrio. Termina con un paseo sin rumbo." },
        ]},
        { title: "Día Vaticano y atardecer en uno de los miradores de la ciudad.", periods: [
          { label: "Mañana", text: "Vaticano. Reserva con antelación, llega pronto y olvida el móvil un rato dentro de la Capilla Sixtina. Después, San Pedro: la cúpula, si subes, te regala una de las mejores vistas de Roma." },
          { label: "Tarde",  text: "Tras el Vaticano, cambia de ritmo. Castel Sant'Angelo y un paseo lento por Via dei Coronari hasta el Tíber. Aquí lo importante es no llenar la agenda: deja huecos para sentarte." },
          { label: "Noche",  text: "Atardecer en el Pincio o en el Giardino degli Aranci. Roma a contraluz, los pinos, las cúpulas. Cena por el barrio del Panteón y, si te queda cuerda, un último helado por Sant'Eustachio." },
        ]},
        { title: "Día más libre: cafés, miradores y un último paseo sin prisas.", periods: [
          { label: "Mañana", text: "Mercado de Campo de' Fiori para desayunar tranquilo y barrio judío (Ghetto Ebraico) después. Es uno de los rincones más bonitos y con mejor comida de la ciudad. Pide alcachofas a la judía." },
          { label: "Tarde",  text: "Villa Borghese para descansar entre árboles. Si te quedan ganas de museos, la Galleria Borghese tiene Berninis y Caravaggios que no se ven en libros. Reserva sí o sí." },
          { label: "Noche",  text: "Cierra el viaje en Monti, el barrio bohemio. Tiendas pequeñas, vinerías, gente local. Cena, brindis y plaza con escalinata. Roma despide bien." },
        ]},
      ],
      tips: {
        transport: "Lo de Roma se camina. Mucho. Lleva calzado cómodo y olvida el metro para los puntos del centro. Para distancias largas, el bus o un Uber te salvan. La tarjeta semanal de transporte compensa si vas a moverte fuera del centro.",
        whereToStay: "Trastevere si quieres ambiente. Monti si buscas algo bohemio. Centro histórico (Panteón / Navona) caro pero ahorra metros. Si vas justo, San Lorenzo o Termini funcionan.",
        bestTimes: "Las primeras horas son mágicas: el Coliseo y el Vaticano abren con menos gente. Reserva el atardecer para los miradores. Y la noche, para perderte por callejones — Roma de noche es otra ciudad.",
      },
      closingPara:
        "Con este plan tienes lo básico para que tu viaje a Roma fluya: un **itinerario Roma 3 días** realista, sin maratones imposibles ni listas infinitas de qué ver en Roma.",
    },
    en: {
      slug: "rome-in-3-days",
      lang: "en",
      ...buildUrls("roma-en-3-dias", "rome-in-3-days"),
      eyebrow: "Rome itinerary",
      destinationName: "Rome",
      durationLabel: "3 days",
      highlights: ["Colosseum & Forum at dawn", "Vatican without queues", "Sunset in Trastevere"],
      title: "Rome in 3 days: complete day-by-day itinerary | Visítalo",
      description:
        "Rome in 3 days itinerary with morning, afternoon and evening picks. Colosseum, Vatican, Trastevere and more. A clear plan, no fluff, ready to use.",
      h1Line1: "Rome in 3 days:",
      h1Line2: "a complete day-by-day itinerary.",
      intro: [
        "Rome doesn't reward rushing. In three days you won't see all of it — nobody really does — but you can absolutely leave the city feeling like you ate well, walked a lot and caught the spots that matter. The hard part isn't choosing. It's pacing.",
        "Planning a trip is exhausting. Tabs everywhere, six-year-old forum threads, maps that don't add up. So we put together this **Rome in 3 days** guide: a relaxed plan split into morning, afternoon and evening, with the things to do in Rome that are actually worth your time.",
        "And if you'd rather skip the work entirely, scroll to the bottom — we'll build you something like this in seconds, made for you.",
      ],
      days: [
        { title: "Historic center, Colosseum and a first walk through Trastevere.", periods: [
          { label: "Morning",   text: "Open strong: Colosseum, Roman Forum and Palatine Hill. Book a timed-entry ticket so you skip the queue. Walk down to Piazza Venezia after and let the city settle in before the next stop." },
          { label: "Afternoon", text: "Light lunch around the center, then drift: Trevi Fountain, Pantheon, Piazza Navona. Yes, it's the touristy bit, but also the most cinematic. Eat at a small trattoria — not the first one with menus in six languages." },
          { label: "Evening",   text: "Cross the Tiber and have dinner in Trastevere. Cobblestones, ivy, terraces. This is where Rome stops looking like a postcard and starts feeling like a neighborhood. Finish with a slow walk back." },
        ]},
        { title: "Vatican day with a sunset at one of the classic city viewpoints.", periods: [
          { label: "Morning",   text: "Vatican Museums. Book in advance, arrive early and put the phone away inside the Sistine Chapel. Then St. Peter's Basilica — if you climb the dome, you get one of the best views in town." },
          { label: "Afternoon", text: "Switch tempo after the Vatican. Castel Sant'Angelo, then a slow stroll along Via dei Coronari toward the river. Don't fill the agenda. Leave room to sit." },
          { label: "Evening",   text: "Catch sunset at the Pincio or the Giardino degli Aranci. Rome backlit, pines, domes. Dinner around the Pantheon and, if you've got the energy, one last gelato at Sant'Eustachio." },
        ]},
        { title: "Looser day: cafés, viewpoints and one last unhurried walk.", periods: [
          { label: "Morning",   text: "Breakfast around Campo de' Fiori, then the Jewish Ghetto. One of the prettiest pockets in the city and the food is exceptional. Order the Roman-Jewish artichokes." },
          { label: "Afternoon", text: "Villa Borghese for a slow recharge under the trees. Still want a museum? Galleria Borghese has Berninis and Caravaggios you won't see in books. Reservation is non-negotiable." },
          { label: "Evening",   text: "Close out in Monti, the bohemian quarter. Tiny shops, wine bars, locals. Dinner, a toast and the small staircase square. Rome knows how to say goodbye." },
        ]},
      ],
      tips: {
        transport: "Rome is a walking city. A lot. Bring proper shoes and forget the metro for the historic center — most things sit close together. For longer hops, buses or an Uber save you.",
        whereToStay: "Trastevere if you want street life. Monti for something more bohemian and quieter. Historic center (Pantheon / Navona) is pricier but saves your feet daily. Tighter budget? San Lorenzo or near Termini work well.",
        bestTimes: "Early hours hit different — the Colosseum and Vatican open with fewer people. Save sunset for the viewpoints. And keep the night for wandering. Rome after dark is a different city.",
      },
      closingPara:
        "That's the spine of a solid **Rome itinerary**: a real **3 days in Rome**, no impossible marathons and no endless lists of things to do in Rome.",
    },
  },

  /* ───────── PARIS (5 days) ───────── */
  paris: {
    meta: { tripLength: "medium", region: "europe", days: 5 },
    es: {
      slug: "paris-en-5-dias",
      lang: "es",
      ...buildUrls("paris-en-5-dias", "paris-in-5-days"),
      eyebrow: "Itinerario de París",
      destinationName: "París",
      durationLabel: "5 días",
      highlights: ["Eiffel desde Trocadero", "Marais y vida de barrio", "Versalles + Montmartre"],
      title: "París en 5 días: itinerario completo día a día | Visítalo",
      description:
        "Itinerario de París en 5 días: Torre Eiffel, Marais, Montmartre, Versalles y rincones que no salen en las guías. Plan claro, mañana, tarde y noche.",
      h1Line1: "París en 5 días:",
      h1Line2: "el plan completo, sin estrés.",
      intro: [
        "París cabe en cinco días si la ordenas bien. No es la ciudad de las listas infinitas, es la de los paseos largos y los cafés en terraza. Aquí encontrarás un **itinerario París 5 días** que va más allá de la postal.",
        "Planificar un viaje a París cansa: museos con cola, barrios que valen la pena y otros que solo valen la foto. Hemos cogido lo bueno y lo hemos repartido en mañana, tarde y noche para que el plan respire.",
        "Y si lo tuyo no es planificar, abajo tienes la versión rápida: te montamos uno como este en segundos.",
      ],
      days: [
        { title: "Centro clásico: Torre Eiffel, Trocadero y Sena.", periods: [
          { label: "Mañana", text: "Empieza con la Torre Eiffel desde Trocadero antes de las 11h. Foto sin gentío y luego paseo por los Jardines del Campo de Marte." },
          { label: "Tarde",  text: "Cruza el Sena hasta Les Invalides y baja andando por Saint-Germain. Café en Café de Flore o, mejor aún, en una pastelería de barrio sin nombre famoso." },
          { label: "Noche",  text: "Cena en Saint-Germain o en el Marais. La Torre Eiffel se enciende cada hora — pásate al Pont de Bir-Hakeim si quieres la foto sin filtros." },
        ]},
        { title: "Louvre, Tullerías y elegancia parisina.", periods: [
          { label: "Mañana", text: "Louvre con entrada reservada. No intentes verlo entero, elige 3 salas y vete. Salir tras dos horas es un acto de inteligencia." },
          { label: "Tarde",  text: "Jardines de las Tullerías, Place Vendôme y un paseo por la Rue Saint-Honoré. Comida ligera por la zona — un croissant decente en una boulangerie de verdad cambia el día." },
          { label: "Noche",  text: "Atardecer en el Pont des Arts o en el muelle del Sena con vino y queso del super. París por la noche es de las pocas ciudades que mejora caminándola sin destino." },
        ]},
        { title: "Marais, Bastilla y vida de barrio.", periods: [
          { label: "Mañana", text: "Marais. Place des Vosges, Hôtel de Ville y tiendas pequeñas. Brunch en Café Charlot o en cualquier sitio donde la cola sea local, no de Instagram." },
          { label: "Tarde",  text: "Pompidou si te van los museos, o un paseo por Canal Saint-Martin si prefieres aire. Helado en Berthillon (Île Saint-Louis) — sí, está en todas las guías, pero está bueno." },
          { label: "Noche",  text: "Bar de vinos en el Marais, cena tarde estilo francés y una última copa en Le Mary Celeste o un sitio de barrio." },
        ]},
        { title: "Versalles + Montmartre: día contraste.", periods: [
          { label: "Mañana", text: "Tren a Versalles temprano. Reserva entrada y empieza por los jardines (gratis, casi siempre vacíos a primera hora). Después el palacio." },
          { label: "Tarde",  text: "Vuelve a París al mediodía y come por Montmartre. Sube despacio: Place du Tertre y rincones empedrados, ignora los retratistas con prisa." },
          { label: "Noche",  text: "Sacré-Cœur al atardecer. Cena en una de las brasseries auténticas que hay alejadas del turismo (Pigalle bajo). Termina con un paseo por Abbesses." },
        ]},
        { title: "Día abierto: Latin Quarter, librerías y un último paseo.", periods: [
          { label: "Mañana", text: "Notre-Dame por fuera, Pont Neuf, Île de la Cité. Café junto al Sena y tiempo para no mirar el reloj." },
          { label: "Tarde",  text: "Latin Quarter: Shakespeare and Company, Jardin du Luxembourg para tirarse en una silla verde y leer media página de algo." },
          { label: "Noche",  text: "Cena en una bistrot pequeña, brindis final y un último paseo por los muelles del Sena. París es buena despidiéndose." },
        ]},
      ],
      tips: {
        transport: "El metro de París es eficiente y un pase Navigo Easy te ahorra calcular billetes. Pero la ciudad pide caminarse: muchos puntos top están más cerca de lo que parece.",
        whereToStay: "Le Marais para vida de barrio y autenticidad. Saint-Germain si te puedes permitir el lujo. 11ème arrondissement (Bastille) para ambiente joven. Evita la zona alrededor de Gare du Nord.",
        bestTimes: "Museos a primera hora con entrada online. Atardeceres siempre desde el Sena. Y guarda al menos una noche para callejear sin mapa: París a las 23h es otra ciudad.",
      },
      closingPara:
        "Con este **itinerario París** tienes los esenciales sin caer en la trampa del museo-tras-museo. Cinco días son suficientes para entender la ciudad — el resto es repetir.",
    },
    en: {
      slug: "paris-in-5-days",
      lang: "en",
      ...buildUrls("paris-en-5-dias", "paris-in-5-days"),
      eyebrow: "Paris itinerary",
      destinationName: "Paris",
      durationLabel: "5 days",
      highlights: ["Eiffel from Trocadero", "Marais & neighborhood life", "Versailles + Montmartre"],
      title: "Paris in 5 days: complete day-by-day itinerary | Visítalo",
      description:
        "Paris in 5 days itinerary: Eiffel Tower, Marais, Montmartre, Versailles and corners off the typical guide. A clear morning–afternoon–evening plan.",
      h1Line1: "Paris in 5 days:",
      h1Line2: "the full plan, no stress.",
      intro: [
        "Paris fits in five days if you pace it right. It's not the city of endless checklists — it's the one of long walks and café terraces. This **Paris itinerary** goes a step beyond the postcard.",
        "Planning a Paris trip is tiring: museums with queues, neighborhoods worth the visit and others worth only the photo. We took the good parts and split them across morning, afternoon and evening so the plan breathes.",
        "And if planning isn't your thing, scroll to the bottom — we'll build one like this in seconds, made for you.",
      ],
      days: [
        { title: "Classic core: Eiffel Tower, Trocadero and the Seine.", periods: [
          { label: "Morning",   text: "Start with the Eiffel Tower from Trocadero before 11am. Photo without crowds, then a slow walk through the Champ de Mars gardens." },
          { label: "Afternoon", text: "Cross the Seine to Les Invalides and walk down through Saint-Germain. Coffee at Café de Flore or — better — at any unbranded local bakery." },
          { label: "Evening",   text: "Dinner around Saint-Germain or the Marais. The Eiffel sparkles every hour — head to Pont de Bir-Hakeim for a quieter photo." },
        ]},
        { title: "Louvre, Tuileries and Parisian elegance.", periods: [
          { label: "Morning",   text: "Louvre with a timed ticket. Don't try to see it all — pick 3 rooms and leave. Walking out after two hours is an act of intelligence." },
          { label: "Afternoon", text: "Tuileries Gardens, Place Vendôme and a stroll down Rue Saint-Honoré. Light lunch around the area — a proper croissant from a real boulangerie genuinely changes the day." },
          { label: "Evening",   text: "Sunset at Pont des Arts or on the Seine quay with supermarket wine and cheese. Few cities walk this well at night." },
        ]},
        { title: "Marais, Bastille and neighborhood life.", periods: [
          { label: "Morning",   text: "Marais. Place des Vosges, Hôtel de Ville and small shops. Brunch at Café Charlot or wherever the queue is local, not Instagram." },
          { label: "Afternoon", text: "Pompidou if museums are your thing, or a walk along Canal Saint-Martin for fresh air. Ice cream at Berthillon — yes, it's in every guide, but yes, it's good." },
          { label: "Evening",   text: "Wine bar in the Marais, late French-style dinner and one last drink at Le Mary Celeste or somewhere local." },
        ]},
        { title: "Versailles + Montmartre: contrast day.", periods: [
          { label: "Morning",   text: "Early train to Versailles. Book ahead and start with the gardens (free, almost always empty early). Palace after." },
          { label: "Afternoon", text: "Back to Paris by midday and eat around Montmartre. Climb slowly: Place du Tertre and cobbled corners, ignore the rushed portrait artists." },
          { label: "Evening",   text: "Sacré-Cœur at sunset. Dinner at a real brasserie away from the tourist track (lower Pigalle). Finish wandering Abbesses." },
        ]},
        { title: "Open day: Latin Quarter, bookshops and one last walk.", periods: [
          { label: "Morning",   text: "Notre-Dame from outside, Pont Neuf, Île de la Cité. Coffee by the Seine and time without checking the clock." },
          { label: "Afternoon", text: "Latin Quarter: Shakespeare and Company, Jardin du Luxembourg to slump into a green chair and read half a page of something." },
          { label: "Evening",   text: "Dinner at a small bistrot, a final toast and one last walk along the Seine quays. Paris is good at goodbyes." },
        ]},
      ],
      tips: {
        transport: "The Paris metro is efficient and a Navigo Easy pass saves you on tickets. But the city begs to be walked — many top spots are closer than they look.",
        whereToStay: "Le Marais for street life and authenticity. Saint-Germain if you can splurge. 11th arrondissement (Bastille) for a younger vibe. Avoid the area around Gare du Nord.",
        bestTimes: "Museums at opening with online tickets. Sunsets always by the Seine. Keep at least one night for aimless wandering: Paris after 11pm is a different city.",
      },
      closingPara:
        "This **Paris in 5 days** plan covers the essentials without falling into the museum-after-museum trap. Five days are enough to understand the city — the rest is repetition.",
    },
  },

  /* ───────── LONDON (3 days) ───────── */
  london: {
    meta: { tripLength: "short", region: "europe", days: 3 },
    es: {
      slug: "londres-en-3-dias",
      lang: "es",
      ...buildUrls("londres-en-3-dias", "london-in-3-days"),
      eyebrow: "Itinerario de Londres",
      destinationName: "Londres",
      durationLabel: "3 días",
      highlights: ["Westminster y South Bank", "Notting Hill y mercados", "Shoreditch y vistas"],
      title: "Londres en 3 días: itinerario completo día a día | Visítalo",
      description:
        "Itinerario de Londres en 3 días: Westminster, museos, Camden, Shoreditch y los pubs que merecen la pena. Mañana, tarde y noche bien repartidas.",
      h1Line1: "Londres en 3 días:",
      h1Line2: "lo bueno, sin perder tiempo.",
      intro: [
        "Londres es enorme y caótico, pero en 3 días puedes verlo bien si vas con un plan. Este **itinerario Londres 3 días** mezcla lo clásico con barrios menos turísticos para que no te quedes solo con la postal.",
        "Planificar Londres es de las cosas más cansinas: el metro es propio, la ciudad cambia de ritmo cada dos calles y la lista de cosas eternamente. Aquí va lo justo, ordenado por mañana, tarde y noche.",
        "Si te apetece atajar, abajo tienes la opción de que te lo montemos en segundos.",
      ],
      days: [
        { title: "Westminster clásico, Soho y un primer pub.", periods: [
          { label: "Mañana", text: "Westminster Abbey, Big Ben, Parliament. Cruza Westminster Bridge para la foto y baja al South Bank a pie." },
          { label: "Tarde",  text: "Borough Market para comer (curry de Roti King si te queda fuerza para una cola) y subir hasta Trafalgar y Soho. National Gallery gratis si quieres meter cultura sin pagar." },
          { label: "Noche",  text: "Cena en Soho y un pub de verdad — The French House, The Coach. Cierra con un paseo por Covent Garden cuando ya está vacío de turistas." },
        ]},
        { title: "Museos, Notting Hill y mercados.", periods: [
          { label: "Mañana", text: "Elige tu museo: British Museum (gratis, lleno) o V&A (gratis, más tranquilo). 1.5h máximo, no más." },
          { label: "Tarde",  text: "Notting Hill: Portobello Road, casas de colores y un sitio para comer en cualquier callejón. Hyde Park para descansar." },
          { label: "Noche",  text: "Cena en Marylebone o Mayfair si quieres algo elegante. Si no, sube hasta Camden y cena fish and chips de los buenos." },
        ]},
        { title: "East London: Shoreditch, Brick Lane y vista al final.", periods: [
          { label: "Mañana", text: "Shoreditch y Brick Lane. Street art, mercado vintage y desayuno en Beigel Bake (24h, salt beef bagel sin discusión)." },
          { label: "Tarde",  text: "Sky Garden (gratis con reserva) o The Shard si quieres pagar la vista. Tower Bridge, Tower of London si llevas ganas de historia." },
          { label: "Noche",  text: "Última pinta en un pub histórico (The Mayflower, Ye Olde Cheshire Cheese). Londres se despide en una mesa de madera con cerveza." },
        ]},
      ],
      tips: {
        transport: "Oyster card o pago contactless con el móvil. El metro es lo más rápido pero algunas distancias son cortas a pie. Evita coger taxi en hora punta — Londres es un atasco con forma de ciudad.",
        whereToStay: "Soho/Covent Garden para no coger metro nunca. Shoreditch para vida nocturna y vibe joven. South Bank para calidad-precio cerca del centro. Evita zonas demasiado a las afueras.",
        bestTimes: "Museos en cuanto abren (gratis, así que se llenan). Mercados los sábados. Pubs entre semana — los fines de semana se llenan de oficinistas.",
      },
      closingPara:
        "Con este **qué ver en Londres** en 3 días tienes lo imprescindible y un par de extras locales. Si vuelves, profundizas. Si no, te quedas con lo bueno.",
    },
    en: {
      slug: "london-in-3-days",
      lang: "en",
      ...buildUrls("londres-en-3-dias", "london-in-3-days"),
      eyebrow: "London itinerary",
      destinationName: "London",
      durationLabel: "3 days",
      highlights: ["Westminster & South Bank", "Notting Hill & markets", "Shoreditch & views"],
      title: "London in 3 days: complete day-by-day itinerary | Visítalo",
      description:
        "London in 3 days itinerary: Westminster, museums, Camden, Shoreditch and pubs worth the visit. A clear morning–afternoon–evening plan.",
      h1Line1: "London in 3 days:",
      h1Line2: "the good stuff, no wasted time.",
      intro: [
        "London is huge and chaotic, but 3 days are enough if you have a plan. This **London itinerary** mixes the classics with less touristy neighborhoods so you don't leave with just the postcard.",
        "Planning London is genuinely tiring: the tube is its own thing, the city changes vibe every two streets and the to-do list never ends. Here's what really matters, split into morning, afternoon and evening.",
        "Want to skip the planning? Scroll to the bottom — we'll build it in seconds.",
      ],
      days: [
        { title: "Classic Westminster, Soho and a first proper pub.", periods: [
          { label: "Morning",   text: "Westminster Abbey, Big Ben, Parliament. Cross Westminster Bridge for the photo and walk down to the South Bank." },
          { label: "Afternoon", text: "Borough Market for lunch (Roti King curry if you'll queue) and up to Trafalgar and Soho. National Gallery is free for a culture hit." },
          { label: "Evening",   text: "Dinner in Soho and a real pub — The French House, The Coach. Close with Covent Garden once the tourists have gone." },
        ]},
        { title: "Museums, Notting Hill and markets.", periods: [
          { label: "Morning",   text: "Pick your museum: British Museum (free, packed) or V&A (free, calmer). 1.5h max, no more." },
          { label: "Afternoon", text: "Notting Hill: Portobello Road, pastel houses and lunch in any side street. Hyde Park to recharge." },
          { label: "Evening",   text: "Dinner in Marylebone or Mayfair for something polished. Otherwise head up to Camden for proper fish and chips." },
        ]},
        { title: "East London: Shoreditch, Brick Lane and a final view.", periods: [
          { label: "Morning",   text: "Shoreditch and Brick Lane. Street art, vintage market and breakfast at Beigel Bake (24h, salt beef bagel, no debate)." },
          { label: "Afternoon", text: "Sky Garden (free with booking) or The Shard if you'll pay for the view. Tower Bridge, Tower of London if you're up for history." },
          { label: "Evening",   text: "Last pint at a historic pub (The Mayflower, Ye Olde Cheshire Cheese). London says goodbye on a wooden table with beer." },
        ]},
      ],
      tips: {
        transport: "Oyster or contactless. Tube is fastest but some hops are short on foot. Don't grab a cab at rush hour — London is a traffic jam in city shape.",
        whereToStay: "Soho/Covent Garden if you don't want to take the tube. Shoreditch for nightlife. South Bank for value near the center. Skip anything too far out.",
        bestTimes: "Museums at opening (free = packed). Markets on Saturday. Pubs midweek — weekends are office crowds.",
      },
      closingPara:
        "This **3 days in London** plan covers the must-sees plus a couple of local extras. Come back to dig deeper.",
    },
  },

  /* ───────── TOKYO (14 days) ───────── */
  tokyo: {
    meta: { tripLength: "long", region: "asia", days: 14 },
    es: {
      slug: "tokio-en-14-dias",
      lang: "es",
      ...buildUrls("tokio-en-14-dias", "tokyo-in-14-days"),
      eyebrow: "Itinerario de Tokio",
      destinationName: "Tokio",
      durationLabel: "14 días",
      highlights: ["Shibuya, Harajuku y Shinjuku", "Kioto express + Nara", "Hakone con vistas al Fuji"],
      title: "Tokio en 14 días: itinerario completo día a día | Visítalo",
      description:
        "Itinerario de Tokio en 14 días: barrios, escapadas a Hakone y Kioto, comida real, vida nocturna y rincones que no salen en las guías.",
      h1Line1: "Tokio en 14 días:",
      h1Line2: "el viaje al detalle, sin agobios.",
      intro: [
        "Catorce días en Tokio son un lujo. No vas a verlo todo (nadie lo ve) pero sí puedes vivirlo bien: bajar la velocidad, comer mucho mejor que en cualquier guía y entender por qué la gente que va, vuelve.",
        "Planificar un viaje a Japón es de los más exigentes que hay. Trenes, reservas con meses, idioma, precios… Por eso este **itinerario Tokio 14 días** está partido en bloques claros, con escapadas para no quemarte en la ciudad.",
        "Si quieres saltarte el lío, abajo tienes la versión rápida.",
      ],
      days: [
        { dayLabel: "Días 1–3", title: "Aterrizaje y centro de Tokio.", periods: [
          { label: "Mañana", text: "Asakusa y Senso-ji para empezar suave. Café en un kissaten antiguo. Nada de prisa el primer día." },
          { label: "Tarde",  text: "Akihabara o Ueno según cuerpo. Parque de Ueno si quieres calma, Akiba si te flipa el caos." },
          { label: "Noche",  text: "Shinjuku con calma: Omoide Yokocho para cenar entre humo de yakitori y Golden Gai si te queda energía." },
        ]},
        { dayLabel: "Días 4–5", title: "Shibuya, Harajuku y vida cotidiana.", periods: [
          { label: "Mañana", text: "Cruce de Shibuya y subida al Shibuya Sky para ver la dimensión real de la ciudad. Brunch en Daikanyama." },
          { label: "Tarde",  text: "Harajuku, Takeshita Street y luego Omotesando para arquitectura. Yoyogi Park si hace bueno." },
          { label: "Noche",  text: "Izakaya por Ebisu o Nakameguro. Tokio se entiende en una mesa pequeña con cinco platos pequeños." },
        ]},
        { dayLabel: "Días 6–7", title: "Hakone + vistas al Fuji.", periods: [
          { label: "Mañana", text: "Tren a Hakone temprano. Pase Hakone Free Pass: ferry, teleférico y tren del valle del azufre." },
          { label: "Tarde",  text: "Onsen tradicional, kaiseki en ryokan. Si tienes suerte con el cielo, el Fuji se deja ver desde el lago Ashi." },
          { label: "Noche",  text: "Cena tradicional en el ryokan, baño de aguas termales y dormir como hace décadas." },
        ]},
        { dayLabel: "Días 8–10", title: "Kioto express (3 días).", periods: [
          { label: "Mañana", text: "Shinkansen Tokio–Kioto. Llegada y Fushimi Inari sin gente a primera hora del segundo día." },
          { label: "Tarde",  text: "Higashiyama, Kiyomizu-dera y un paseo lento por Gion. Café junto al canal Shirakawa." },
          { label: "Noche",  text: "Pontocho para cenar. Kioto de noche, con farolillos, es otra cosa." },
        ]},
        { dayLabel: "Días 11–12", title: "Día de Nara y vuelta a Tokio.", periods: [
          { label: "Mañana", text: "Día en Nara: ciervos, Todai-ji y mochi recién hecho en Nakatanidou." },
          { label: "Tarde",  text: "Vuelta a Kioto y tarde en Arashiyama. Bambúes, paseo en barco si te apetece." },
          { label: "Noche",  text: "Cena tranquila y noche en Kioto. Mañana toca Shinkansen otra vez." },
        ]},
        { dayLabel: "Días 13–14", title: "Vuelta a Tokio: lo que dejaste pendiente.", periods: [
          { label: "Mañana", text: "Tsukiji para desayunar (sí, el mercado exterior aún funciona). Sushi al filo del frío." },
          { label: "Tarde",  text: "Ginza para arquitectura y un capricho. Roppongi Hills para vista al atardecer." },
          { label: "Noche",  text: "Última cena donde te apetezca: ramen de Tonkotsu, sushi-ya pequeño o izakaya escondida. Brindis y a casa." },
        ]},
      ],
      tips: {
        transport: "JR Pass solo si haces tres trayectos largos o más; si no, sale más barato comprar billetes sueltos. La Suica/Pasmo es obligatoria. Camina mucho — los barrios se viven mejor a pie.",
        whereToStay: "Shinjuku para no perder un metro. Shibuya si vas a comer fuera mucho. Asakusa para calidad-precio. Evita Akihabara para dormir.",
        bestTimes: "Templos a primera hora. Restaurantes pequeños sin reserva si llegas a las 18h. Sábados: huye de Shibuya. Lluvia: museos.",
      },
      closingPara:
        "Con este **qué ver en Tokio** y la escapada Kioto/Hakone tienes el corazón de Japón en 14 días. Lo demás es repetir, y vale la pena.",
    },
    en: {
      slug: "tokyo-in-14-days",
      lang: "en",
      ...buildUrls("tokio-en-14-dias", "tokyo-in-14-days"),
      eyebrow: "Tokyo itinerary",
      destinationName: "Tokyo",
      durationLabel: "14 days",
      highlights: ["Shibuya, Harajuku & Shinjuku", "Kyoto express + Nara", "Hakone with Fuji views"],
      title: "Tokyo in 14 days: complete day-by-day itinerary | Visítalo",
      description:
        "Tokyo in 14 days itinerary: neighborhoods, side trips to Hakone and Kyoto, real food, nightlife and corners off the typical guide.",
      h1Line1: "Tokyo in 14 days:",
      h1Line2: "the deep trip, no rush.",
      intro: [
        "Fourteen days in Tokyo is a luxury. You won't see all of it — nobody does — but you can live it well: slow down, eat far better than any guide promises, and finally get why people who go always come back.",
        "Planning a Japan trip is one of the most demanding things out there. Trains, months-ahead reservations, language, prices… That's why this **Tokyo 14 days itinerary** is split into clear blocks with side trips so you don't burn out.",
        "Want to skip the planning? Scroll to the bottom.",
      ],
      days: [
        { dayLabel: "Days 1–3", title: "Landing and central Tokyo.", periods: [
          { label: "Morning",   text: "Asakusa and Senso-ji to ease in. Coffee at an old-school kissaten. No rush on day one." },
          { label: "Afternoon", text: "Akihabara or Ueno depending on energy. Ueno Park for calm, Akiba if you love the chaos." },
          { label: "Evening",   text: "Shinjuku slowly: Omoide Yokocho for dinner in yakitori smoke, Golden Gai if you've still got energy." },
        ]},
        { dayLabel: "Days 4–5", title: "Shibuya, Harajuku and everyday life.", periods: [
          { label: "Morning",   text: "Shibuya Crossing and up Shibuya Sky to see the city's real scale. Brunch in Daikanyama." },
          { label: "Afternoon", text: "Harajuku, Takeshita Street, then Omotesando for architecture. Yoyogi Park if the sun's out." },
          { label: "Evening",   text: "Izakaya in Ebisu or Nakameguro. Tokyo makes sense on a tiny table with five small plates." },
        ]},
        { dayLabel: "Days 6–7", title: "Hakone + Fuji views.", periods: [
          { label: "Morning",   text: "Early train to Hakone. Hakone Free Pass: ferry, ropeway and the sulfur valley train." },
          { label: "Afternoon", text: "Traditional onsen, kaiseki at a ryokan. If the sky is on your side, Fuji shows up from Lake Ashi." },
          { label: "Evening",   text: "Ryokan dinner, hot spring soak and sleep like decades ago." },
        ]},
        { dayLabel: "Days 8–10", title: "Kyoto express (3 days).", periods: [
          { label: "Morning",   text: "Shinkansen Tokyo–Kyoto. Arrival, then Fushimi Inari empty at first light on day two." },
          { label: "Afternoon", text: "Higashiyama, Kiyomizu-dera and a slow walk through Gion. Coffee by the Shirakawa canal." },
          { label: "Evening",   text: "Pontocho for dinner. Kyoto at night with the lanterns is something else." },
        ]},
        { dayLabel: "Days 11–12", title: "Nara day and back to Tokyo.", periods: [
          { label: "Morning",   text: "Day in Nara: deer, Todai-ji and fresh mochi at Nakatanidou." },
          { label: "Afternoon", text: "Back to Kyoto and an afternoon in Arashiyama. Bamboo and boat ride if you fancy." },
          { label: "Evening",   text: "Quiet dinner and night in Kyoto. Tomorrow: Shinkansen again." },
        ]},
        { dayLabel: "Days 13–14", title: "Back to Tokyo, the unfinished list.", periods: [
          { label: "Morning",   text: "Tsukiji for breakfast (yes, the outer market still rocks). Sushi on the edge of cold." },
          { label: "Afternoon", text: "Ginza for architecture and a small splurge. Roppongi Hills for sunset views." },
          { label: "Evening",   text: "Final dinner wherever calls — Tonkotsu ramen, tiny sushi-ya, hidden izakaya. Toast and home." },
        ]},
      ],
      tips: {
        transport: "JR Pass only if you do 3+ long trips; otherwise singles are cheaper. Suica/Pasmo is mandatory. Walk a lot — neighborhoods reveal themselves on foot.",
        whereToStay: "Shinjuku to avoid the metro. Shibuya if you eat out constantly. Asakusa for value. Skip Akihabara for sleep.",
        bestTimes: "Temples at opening. Tiny no-reservation restaurants right at 6pm. Saturdays: avoid Shibuya. Rain: museums.",
      },
      closingPara:
        "This **Tokyo itinerary** plus the Kyoto/Hakone side trip is Japan's heart in 14 days. The rest is repetition — and very much worth it.",
    },
  },

  /* ───────── BANGKOK (12 days) ───────── */
  bangkok: {
    meta: { tripLength: "long", region: "asia", days: 12 },
    es: {
      slug: "bangkok-en-12-dias",
      lang: "es",
      ...buildUrls("bangkok-en-12-dias", "bangkok-in-12-days"),
      eyebrow: "Itinerario de Bangkok",
      destinationName: "Bangkok",
      durationLabel: "12 días",
      highlights: ["Templos y Wat Arun", "Ayutthaya + Khao Yai", "Vida nocturna en Thonglor"],
      title: "Bangkok en 12 días: itinerario completo día a día | Visítalo",
      description:
        "Itinerario de Bangkok en 12 días con escapadas a Ayutthaya y Khao Yai. Templos, comida callejera, mercados nocturnos y planes que respiran.",
      h1Line1: "Bangkok en 12 días:",
      h1Line2: "el viaje sin prisa, con mucha vida.",
      intro: [
        "Doce días en Bangkok suena largo, pero la ciudad da para mucho — y para hacer escapadas. Mercados nocturnos, templos, comida callejera, y todo a un ritmo que (aviso) acaba enganchando.",
        "Planificar Tailandia cansa: el calor, los mercados, las distancias entre barrios, las estafas básicas. Aquí va un **itinerario Bangkok 12 días** repartido en bloques con escapadas a Ayutthaya y Khao Yai para no aburrirte.",
        "Si lo quieres más fácil, abajo te lo montamos en segundos.",
      ],
      days: [
        { dayLabel: "Días 1–2", title: "Aterrizaje, Wat Pho y primer khao soi.", periods: [
          { label: "Mañana", text: "Llegada y caída suave: Lumpini Park, café decente en Sathorn y respirar humedad." },
          { label: "Tarde",  text: "Gran Palacio + Wat Pho. Cuidado con timos a la entrada — solo informaciones oficiales." },
          { label: "Noche",  text: "Cena en un street food de barrio (Soi Polo Fried Chicken si tienes hambre real). Primera Chang fría." },
        ]},
        { dayLabel: "Días 3–5", title: "Templos, Chinatown y mercados.", periods: [
          { label: "Mañana", text: "Wat Arun al amanecer cruzando en barco. Foto sin mochileros si vas pronto." },
          { label: "Tarde",  text: "Chinatown (Yaowarat) — el mejor street food de la ciudad. Pad thai, mango sticky rice y todo lo que pidas." },
          { label: "Noche",  text: "Rooftop al atardecer (Octave o Vertigo). Bangkok vista desde arriba justifica la paliza del día." },
        ]},
        { dayLabel: "Días 6–7", title: "Escapada a Ayutthaya.", periods: [
          { label: "Mañana", text: "Tren o minibus a Ayutthaya. Ruinas, templos y bicicleta entre piedras viejas." },
          { label: "Tarde",  text: "Wat Mahathat y la cabeza de Buda en raíces. Un puesto local para comer y descanso." },
          { label: "Noche",  text: "Vuelta a Bangkok o noche en Ayutthaya — barata y tranquila." },
        ]},
        { dayLabel: "Días 8–9", title: "Khao Yai (parque nacional).", periods: [
          { label: "Mañana", text: "Salida temprano hacia Khao Yai (3h). Trekking suave, cascadas, monos y gibones." },
          { label: "Tarde",  text: "Bodega tailandesa (sí, existen y están bien) o café-granja. Pernocta en una casa de campo." },
          { label: "Noche",  text: "Cena al aire libre, cielo estrellado y silencio. Reset total." },
        ]},
        { dayLabel: "Días 10–11", title: "Vuelta a Bangkok, masajes y vida nocturna.", periods: [
          { label: "Mañana", text: "Mañana de spa tailandés en serio (Health Land o algo similar). Reset físico." },
          { label: "Tarde",  text: "Mercado de Chatuchak (sábado/domingo). Maratón de compras y comida — lleva agua." },
          { label: "Noche",  text: "Khao San Road si quieres ver el caos turístico. Soi 11 o Thonglor para algo más adulto." },
        ]},
        { dayLabel: "Día 12", title: "Día abierto + despedida.", periods: [
          { label: "Mañana", text: "Mercado flotante (Damnoen Saduak) si no lo viste. Salida muy temprano para evitar tour buses." },
          { label: "Tarde",  text: "Última comida en un sitio que descubriste tú. Aquí no hay reglas." },
          { label: "Noche",  text: "Cóctel final y aeropuerto. Bangkok te despide caliente, ruidosa y un poco enganchosa." },
        ]},
      ],
      tips: {
        transport: "BTS y MRT para moverte rápido. Grab (taxi) para lo demás — barato y sin discusiones de tarifa. Tuk-tuks solo por experiencia, casi nunca son rentables.",
        whereToStay: "Sukhumvit (Asok, Phrom Phong) para calidad-precio y BTS. Silom para vida nocturna. Riverside para algo elegante. Evita Khao San si vas a estar más de 2 noches.",
        bestTimes: "Templos al amanecer (sin gente, sin calor). Markets nocturnos sobre las 19h. Comida callejera a la hora que veas a locales — siempre hay alguien comiendo.",
      },
      closingPara:
        "Con este **qué ver en Bangkok** + las dos escapadas tienes Tailandia en 12 días sin maratones. Si quieres más, te montamos uno con playas o norte.",
    },
    en: {
      slug: "bangkok-in-12-days",
      lang: "en",
      ...buildUrls("bangkok-en-12-dias", "bangkok-in-12-days"),
      eyebrow: "Bangkok itinerary",
      destinationName: "Bangkok",
      durationLabel: "12 days",
      highlights: ["Temples & Wat Arun", "Ayutthaya + Khao Yai", "Thonglor nightlife"],
      title: "Bangkok in 12 days: complete day-by-day itinerary | Visítalo",
      description:
        "Bangkok in 12 days itinerary with side trips to Ayutthaya and Khao Yai. Temples, street food, night markets and a plan that breathes.",
      h1Line1: "Bangkok in 12 days:",
      h1Line2: "the unhurried, very alive trip.",
      intro: [
        "Twelve days in Bangkok sounds long, but the city — plus a couple of side trips — fills it easily. Night markets, temples, street food, all at a pace that (fair warning) becomes addictive.",
        "Planning Thailand is exhausting: the heat, the markets, the cross-city distances, the standard scams. This **Bangkok 12 days** plan splits into blocks with Ayutthaya and Khao Yai breaks so you don't burn out.",
        "Want it easier? Scroll down — we'll build it in seconds.",
      ],
      days: [
        { dayLabel: "Days 1–2", title: "Landing, Wat Pho and first khao soi.", periods: [
          { label: "Morning",   text: "Land and ease in: Lumpini Park, decent coffee in Sathorn, breathe the humidity." },
          { label: "Afternoon", text: "Grand Palace + Wat Pho. Watch out for entrance scams — official info only." },
          { label: "Evening",   text: "Dinner at a real local street food spot (Soi Polo Fried Chicken if you're starving). First cold Chang." },
        ]},
        { dayLabel: "Days 3–5", title: "Temples, Chinatown and markets.", periods: [
          { label: "Morning",   text: "Wat Arun at sunrise crossing by boat. Photo without backpackers if you go early." },
          { label: "Afternoon", text: "Chinatown (Yaowarat) — the best street food in town. Pad thai, mango sticky rice, anything you point at." },
          { label: "Evening",   text: "Sunset rooftop (Octave or Vertigo). Bangkok from above justifies the day's heat." },
        ]},
        { dayLabel: "Days 6–7", title: "Ayutthaya side trip.", periods: [
          { label: "Morning",   text: "Train or minivan to Ayutthaya. Ruins, temples and a bike between old stones." },
          { label: "Afternoon", text: "Wat Mahathat and the Buddha head in tree roots. A local stall for lunch and a long break." },
          { label: "Evening",   text: "Back to Bangkok or stay overnight in Ayutthaya — cheap and calm." },
        ]},
        { dayLabel: "Days 8–9", title: "Khao Yai (national park).", periods: [
          { label: "Morning",   text: "Early start for Khao Yai (3h). Easy trekking, waterfalls, monkeys and gibbons." },
          { label: "Afternoon", text: "Thai vineyard (yes, they exist and they're good) or farm café. Stay overnight at a country house." },
          { label: "Evening",   text: "Outdoor dinner, star-filled sky and silence. Full reset." },
        ]},
        { dayLabel: "Days 10–11", title: "Back to Bangkok, massages and nightlife.", periods: [
          { label: "Morning",   text: "Proper Thai spa morning (Health Land or similar). Body reset." },
          { label: "Afternoon", text: "Chatuchak Market (weekend). Shopping and eating marathon — carry water." },
          { label: "Evening",   text: "Khao San Road if you want the tourist chaos. Soi 11 or Thonglor for something more adult." },
        ]},
        { dayLabel: "Day 12", title: "Open day + goodbye.", periods: [
          { label: "Morning",   text: "Floating market (Damnoen Saduak) if you haven't yet. Very early to dodge tour buses." },
          { label: "Afternoon", text: "Last meal at a place you discovered yourself. No rules here." },
          { label: "Evening",   text: "Final cocktail and airport. Bangkok waves you off hot, loud and a little addictive." },
        ]},
      ],
      tips: {
        transport: "BTS and MRT for quick moves. Grab (taxi) for the rest — cheap and no fare arguments. Tuk-tuks only for the experience, rarely worth it.",
        whereToStay: "Sukhumvit (Asok, Phrom Phong) for value near BTS. Silom for nightlife. Riverside for upscale. Skip Khao San for stays over 2 nights.",
        bestTimes: "Temples at sunrise (empty, cool). Night markets around 7pm. Street food whenever locals are eating — there's always someone.",
      },
      closingPara:
        "This **things to do in Bangkok** + the two side trips give you Thailand in 12 days without marathons.",
    },
  },

  /* ───────── BARCELONA (3 days) ───────── */
  barcelona: {
    meta: { tripLength: "short", region: "europe", days: 3 },
    es: {
      slug: "barcelona-en-3-dias",
      lang: "es",
      ...buildUrls("barcelona-en-3-dias", "barcelona-in-3-days"),
      eyebrow: "Itinerario de Barcelona",
      destinationName: "Barcelona",
      durationLabel: "3 días",
      highlights: ["Sagrada Familia y Gràcia", "Atardecer en los Búnquers", "Tapas en El Born"],
      title: "Barcelona en 3 días: itinerario completo día a día | Visítalo",
      description:
        "Itinerario de Barcelona en 3 días: Sagrada Familia, Gòtic, El Born, Gràcia, playa y atardecer en los Búnquers. Plan claro y sin caer en las turistadas.",
      h1Line1: "Barcelona en 3 días:",
      h1Line2: "el plan que te quita las turistadas.",
      intro: [
        "Barcelona se puede ver en 3 días si la organizas bien. Pero también se puede arruinar con tres errores: cenar en Las Ramblas, hacer La Pedrera con cola y no salir del Gòtic. Aquí ninguno de los tres.",
        "Este **itinerario Barcelona 3 días** mete lo imprescindible (Sagrada Familia, Gaudí, mar) y lo combina con barrios menos turísticos para que la ciudad te sepa de verdad.",
        "Si quieres ir directo, abajo tienes la versión rápida.",
      ],
      days: [
        { title: "Sagrada Familia, Gràcia y primer atardecer.", periods: [
          { label: "Mañana", text: "Sagrada Familia con entrada online a primera hora. Después, paseo por el Eixample hasta el Passeig de Gràcia y Casa Batlló por fuera (ahorras y la foto está)." },
          { label: "Tarde",  text: "Sube a Gràcia. Plaza del Sol, comida en una plaza pequeña, sin turismo. Helado en Eyescream." },
          { label: "Noche",  text: "Atardecer en los Búnquers del Carmel — vista 360º de la ciudad. Cena bajando, en alguna bodega de barrio." },
        ]},
        { title: "Gòtic, Born, playa y vermut.", periods: [
          { label: "Mañana", text: "Catedral del Mar y barrio del Born. Mercat del Born, Picasso si te tira. Café en Caelum." },
          { label: "Tarde",  text: "Playa de la Barceloneta. No para bañarse en mayo, sí para pasear. Vermut en una bodega clásica de la zona." },
          { label: "Noche",  text: "Tapas en el Born. Bar Cañete, Bormuth — los sitios buenos llenan, ve antes de las 21h." },
        ]},
        { title: "Park Güell, El Raval y un último paseo.", periods: [
          { label: "Mañana", text: "Park Güell con entrada anticipada. La parte gratuita del parque también merece — vistas locas sin pagar." },
          { label: "Tarde",  text: "Raval, MACBA, calle del Carme. Comida en un Boqueria que no sea de la portada." },
          { label: "Noche",  text: "Cena en Poble-sec (Carrer de Blai, pinchos a tope). Última copa en una vermutería de Sant Antoni y a casa." },
        ]},
      ],
      tips: {
        transport: "T-Casual de 10 viajes en metro/bus. La ciudad se camina muy bien — el Gòtic, Born y Raval están pegados. Bicicleta de Bicing si llevas tarjeta española.",
        whereToStay: "Eixample para comodidad. El Born para vida nocturna. Gràcia para vibe local. Evita Las Ramblas para dormir.",
        bestTimes: "Sagrada Familia y Park Güell siempre con entrada online a primera hora. Comida tarde estilo Barcelona (14:30h). Atardecer en miradores.",
      },
      closingPara:
        "Tres días son suficientes para enamorarte de Barcelona si la haces bien. Esquiva las trampas turísticas y la ciudad te paga con creces.",
    },
    en: {
      slug: "barcelona-in-3-days",
      lang: "en",
      ...buildUrls("barcelona-en-3-dias", "barcelona-in-3-days"),
      eyebrow: "Barcelona itinerary",
      destinationName: "Barcelona",
      durationLabel: "3 days",
      highlights: ["Sagrada Familia & Gràcia", "Sunset at the Bunkers", "Tapas in El Born"],
      title: "Barcelona in 3 days: complete day-by-day itinerary | Visítalo",
      description:
        "Barcelona in 3 days itinerary: Sagrada Familia, Gothic Quarter, El Born, Gràcia, beach and sunset at the Bunkers. Clear plan, no tourist traps.",
      h1Line1: "Barcelona in 3 days:",
      h1Line2: "the plan without the tourist traps.",
      intro: [
        "Barcelona works in 3 days if you plan it well. It can also be ruined with three classic mistakes: dinner on Las Ramblas, La Pedrera with the queue, and never leaving the Gothic. None of those here.",
        "This **Barcelona itinerary** covers the must-sees (Sagrada Familia, Gaudí, sea) and mixes them with less touristy neighborhoods so the city tastes real.",
        "Want the shortcut? Scroll down.",
      ],
      days: [
        { title: "Sagrada Familia, Gràcia and a first sunset.", periods: [
          { label: "Morning",   text: "Sagrada Familia with an online ticket at opening. Walk through Eixample to Passeig de Gràcia, Casa Batlló from outside (saves money, photo is the same)." },
          { label: "Afternoon", text: "Up to Gràcia. Plaza del Sol, lunch in a small square, zero tourism. Ice cream at Eyescream." },
          { label: "Evening",   text: "Sunset at the Bunkers del Carmel — 360º view. Dinner walking down at a neighborhood bodega." },
        ]},
        { title: "Gothic, Born, beach and vermouth.", periods: [
          { label: "Morning",   text: "Santa María del Mar and the Born. Born Market, Picasso if it's your thing. Coffee at Caelum." },
          { label: "Afternoon", text: "Barceloneta beach. Not for swimming in May, fine for walking. Vermouth at a classic bodega around there." },
          { label: "Evening",   text: "Tapas in the Born. Bar Cañete, Bormuth — they fill fast, go before 9pm." },
        ]},
        { title: "Park Güell, El Raval and a final walk.", periods: [
          { label: "Morning",   text: "Park Güell with an advance ticket. The free part of the park also delivers — wild views, no fee." },
          { label: "Afternoon", text: "Raval, MACBA, Carrer del Carme. Lunch at a non-headline Boqueria stall." },
          { label: "Evening",   text: "Dinner in Poble-sec (Carrer de Blai, pinchos paradise). Final drink at a vermouth bar in Sant Antoni and home." },
        ]},
      ],
      tips: {
        transport: "T-Casual 10-ride pass for metro/bus. The city walks beautifully — Gothic, Born and Raval are stitched together. Bicing bikes if you have a Spanish card.",
        whereToStay: "Eixample for comfort. El Born for nightlife. Gràcia for local vibe. Skip Las Ramblas for sleep.",
        bestTimes: "Sagrada Familia and Park Güell with an online ticket at opening. Late Barcelona-style lunches (2:30pm). Sunsets at viewpoints.",
      },
      closingPara:
        "Three days are enough to fall for Barcelona if you do it right. Dodge the tourist traps and the city pays you back.",
    },
  },

  /* ───────── LISBON (3 days) ───────── */
  lisbon: {
    meta: { tripLength: "short", region: "europe", days: 3 },
    es: {
      slug: "lisboa-en-3-dias",
      lang: "es",
      ...buildUrls("lisboa-en-3-dias", "lisbon-in-3-days"),
      eyebrow: "Itinerario de Lisboa",
      destinationName: "Lisboa",
      durationLabel: "3 días",
      highlights: ["Alfama y miradores", "Belém y Tajo", "Sintra de medio día"],
      title: "Lisboa en 3 días: itinerario completo día a día | Visítalo",
      description:
        "Itinerario de Lisboa en 3 días: Alfama, Belém, miradores, fado, pasteles y un escape a Sintra. Plan claro y mañana, tarde y noche bien repartidas.",
      h1Line1: "Lisboa en 3 días:",
      h1Line2: "el viaje que te conquista despacio.",
      intro: [
        "Lisboa no se ve, se camina y se sube. En 3 días puedes verla bien si te olvidas del 'lo tengo que hacer todo'. Aquí va un **itinerario Lisboa 3 días** centrado en lo que sí merece y un escape a Sintra.",
        "Planificar viajes a Lisboa es engañoso: parece pequeña, pero las cuestas y los tranvías te roban tiempo. Mejor hacer poco y disfrutarlo.",
        "Si quieres atajar, abajo tienes la opción de plan automático.",
      ],
      days: [
        { title: "Alfama, miradores y primer fado.", periods: [
          { label: "Mañana", text: "Empieza por el Castelo de São Jorge a primera hora. Bajada por Alfama y café en una pastelería sin nombre." },
          { label: "Tarde",  text: "Mirador de Santa Luzia, Sé de Lisboa, Praça do Comércio. Pastel de nata en Manteigaria (mejor que Belém, no me odies)." },
          { label: "Noche",  text: "Fado en una taberna pequeña de Alfama. Cena tranquila, sin show. El fado de verdad no necesita escenario." },
        ]},
        { title: "Belém, Tajo y atardecer en LX Factory.", periods: [
          { label: "Mañana", text: "Tranvía 15 hasta Belém. Mosteiro dos Jerónimos, Torre de Belém, Padrão. Pastel de nata clásico en Pastéis de Belém (cola pero merece)." },
          { label: "Tarde",  text: "MAAT y un paseo por la orilla del Tajo. Comida ligera." },
          { label: "Noche",  text: "Atardecer en LX Factory o en el Mirador de Santa Catarina. Cena por Cais do Sodré." },
        ]},
        { title: "Sintra como escapada de medio día + Bairro Alto.", periods: [
          { label: "Mañana", text: "Tren a Sintra a primera hora. Quinta da Regaleira y, si te queda fuelle, Palacio da Pena." },
          { label: "Tarde",  text: "Vuelta a Lisboa al mediodía. Comida tarde por Bairro Alto." },
          { label: "Noche",  text: "Cena en Príncipe Real (zona elegante) y copas finales en Bairro Alto. Lisboa de noche es alegre sin ser ruidosa." },
        ]},
      ],
      tips: {
        transport: "Tranvía 28 (turístico, pero la ruta es bonita). Para subir cuestas, los elevadores. Metro útil para llegar al aeropuerto. Tarjeta Viva Viagem.",
        whereToStay: "Príncipe Real para algo elegante. Bairro Alto si quieres marcha y aceptas ruido. Alfama para sentirte en el corazón. Evita la Baixa pura — dormir incómodo.",
        bestTimes: "Castelo y Sintra a primera hora. Pastel de nata a media tarde. Atardeceres siempre desde un mirador o desde el Tajo.",
      },
      closingPara:
        "Tres días bien usados son suficientes para entender por qué Lisboa engancha. La saudade es real.",
    },
    en: {
      slug: "lisbon-in-3-days",
      lang: "en",
      ...buildUrls("lisboa-en-3-dias", "lisbon-in-3-days"),
      eyebrow: "Lisbon itinerary",
      destinationName: "Lisbon",
      durationLabel: "3 days",
      highlights: ["Alfama & viewpoints", "Belém & the Tagus", "Sintra half-day trip"],
      title: "Lisbon in 3 days: complete day-by-day itinerary | Visítalo",
      description:
        "Lisbon in 3 days itinerary: Alfama, Belém, viewpoints, fado, pastries and a Sintra escape. Clear morning–afternoon–evening plan.",
      h1Line1: "Lisbon in 3 days:",
      h1Line2: "the trip that wins you over slowly.",
      intro: [
        "Lisbon isn't seen, it's walked and climbed. In 3 days you can see it well if you drop the 'must-do-everything' mindset. This **Lisbon itinerary** focuses on what actually delivers, plus a Sintra escape.",
        "Planning Lisbon is deceiving: it looks small, but the hills and trams eat your time. Better do less and enjoy it more.",
        "Want a shortcut? Scroll down for the automatic plan.",
      ],
      days: [
        { title: "Alfama, viewpoints and a first fado.", periods: [
          { label: "Morning",   text: "Start at Castelo de São Jorge early. Walk down through Alfama and coffee at a no-name pastelaria." },
          { label: "Afternoon", text: "Miradouro de Santa Luzia, Sé Cathedral, Praça do Comércio. Pastel de nata at Manteigaria (better than Belém — don't hate me)." },
          { label: "Evening",   text: "Fado at a small Alfama tavern. Quiet dinner, no show. Real fado doesn't need a stage." },
        ]},
        { title: "Belém, Tagus and sunset at LX Factory.", periods: [
          { label: "Morning",   text: "Tram 15 to Belém. Jerónimos Monastery, Torre de Belém, Padrão. Classic pastel de nata at Pastéis de Belém (queue, worth it)." },
          { label: "Afternoon", text: "MAAT and a walk along the Tagus. Light lunch." },
          { label: "Evening",   text: "Sunset at LX Factory or Miradouro de Santa Catarina. Dinner around Cais do Sodré." },
        ]},
        { title: "Sintra half-day escape + Bairro Alto.", periods: [
          { label: "Morning",   text: "Early train to Sintra. Quinta da Regaleira and — if you have legs left — Palácio da Pena." },
          { label: "Afternoon", text: "Back to Lisbon midday. Late lunch around Bairro Alto." },
          { label: "Evening",   text: "Dinner in Príncipe Real (smart area) and final drinks in Bairro Alto. Lisbon at night is happy without being loud." },
        ]},
      ],
      tips: {
        transport: "Tram 28 (touristy, but the route is pretty). For hills, the elevadors. Metro is useful for the airport. Viva Viagem card.",
        whereToStay: "Príncipe Real for elegant. Bairro Alto if you want noise and accept it. Alfama to feel the soul. Skip pure Baixa — uncomfortable for sleep.",
        bestTimes: "Castelo and Sintra at opening. Pastel de nata mid-afternoon. Sunsets always from a viewpoint or the Tagus.",
      },
      closingPara:
        "Three well-used days are enough to understand why Lisbon hooks people. Saudade is real.",
    },
  },

  /* ───────── AMSTERDAM (4 days) ───────── */
  amsterdam: {
    meta: { tripLength: "medium", region: "europe", days: 4 },
    es: {
      slug: "amsterdam-en-4-dias",
      lang: "es",
      ...buildUrls("amsterdam-en-4-dias", "amsterdam-in-4-days"),
      eyebrow: "Itinerario de Ámsterdam",
      destinationName: "Ámsterdam",
      durationLabel: "4 días",
      highlights: ["Canales y Jordaan", "Museos icónicos", "Noord y Zaanse Schans"],
      title: "Ámsterdam en 4 días: itinerario completo día a día | Visítalo",
      description:
        "Itinerario de Ámsterdam en 4 días: canales, Van Gogh, Jordaan, Noord, escape a Zaanse Schans y vida local sin acabar en Damrak.",
      h1Line1: "Ámsterdam en 4 días:",
      h1Line2: "más allá de los canales y las cervezas.",
      intro: [
        "Ámsterdam es de las pocas capitales donde 4 días dan para pasar de turista a casi local. Bici, canales, museos potentes y barrios donde no hay grupos con paraguas guía.",
        "Planificar Ámsterdam tiene trampa: lo turístico es muy turístico. Por eso este **itinerario Ámsterdam 4 días** mete lo imprescindible y luego te saca a Noord, Jordaan y un escape a Zaanse Schans.",
        "Si te apetece atajar, abajo tienes el plan automático.",
      ],
      days: [
        { title: "Centro clásico y primer canal.", periods: [
          { label: "Mañana", text: "Begijnhof y Dam. Café en Singel. Subida al campanario de la Westerkerk si te animas (vistas)." },
          { label: "Tarde",  text: "Casa de Anne Frank con entrada online (sí o sí). Paseo lento por Jordaan." },
          { label: "Noche",  text: "Cena en Jordaan. Brown café para la primera birra (Café Chris, Café Papeneiland). Sin Damrak ni Red Light, please." },
        ]},
        { title: "Museos y Vondelpark.", periods: [
          { label: "Mañana", text: "Rijksmuseum o Van Gogh con entrada online. Elige uno, no los dos seguidos — la cabeza pesa." },
          { label: "Tarde",  text: "Vondelpark. Cervezita en una terraza, alquila bici si todavía no la tienes." },
          { label: "Noche",  text: "De Pijp para cenar. Albert Cuyp Market si pillas día y BBQ holandés en cualquier sitio que te llame." },
        ]},
        { title: "Noord (la otra Ámsterdam).", periods: [
          { label: "Mañana", text: "Ferry gratis a Noord. NDSM Werf, A'DAM Lookout para vistas. Ámsterdam alternativo y fotogénico." },
          { label: "Tarde",  text: "Pasea por la zona de IJ. Café flotante o un break de comida moderna en un food hall." },
          { label: "Noche",  text: "Vuelta al centro al atardecer cruzando el IJ. Cena en Oost o Indische Buurt." },
        ]},
        { title: "Escape: Zaanse Schans + última noche.", periods: [
          { label: "Mañana", text: "Tren a Zaanse Schans (20 min). Molinos, queso y postal holandesa." },
          { label: "Tarde",  text: "Vuelta a Ámsterdam. Última compra en alguna tienda de barrio o bicicletazo por canales sur." },
          { label: "Noche",  text: "Cena en un sitio donde hayas estado y te haya gustado — Ámsterdam premia repetir." },
        ]},
      ],
      tips: {
        transport: "Bicicleta sí o sí. Tarjeta OV-chipkaart para tranvía/metro. Ferry a Noord es gratis. Camina mucho — los canales solo se entienden andando.",
        whereToStay: "Jordaan para auténtico. De Pijp para comer y vida joven. Centro si no quieres complicarte (caro). Evita zonas pegadas a Centraal y al Red Light.",
        bestTimes: "Museos primera hora. Vondelpark a mediodía con sol. Noord al atardecer. Brown cafés a partir de las 17h.",
      },
      closingPara:
        "En 4 días Ámsterdam te quita la imagen de capital de canales y postal y te enseña su parte interesante. La que engancha de verdad.",
    },
    en: {
      slug: "amsterdam-in-4-days",
      lang: "en",
      ...buildUrls("amsterdam-en-4-dias", "amsterdam-in-4-days"),
      eyebrow: "Amsterdam itinerary",
      destinationName: "Amsterdam",
      durationLabel: "4 days",
      highlights: ["Canals & Jordaan", "Iconic museums", "Noord & Zaanse Schans"],
      title: "Amsterdam in 4 days: complete day-by-day itinerary | Visítalo",
      description:
        "Amsterdam in 4 days itinerary: canals, Van Gogh, Jordaan, Noord, a Zaanse Schans escape and local life away from Damrak.",
      h1Line1: "Amsterdam in 4 days:",
      h1Line2: "beyond canals and beers.",
      intro: [
        "Amsterdam is one of the few capitals where 4 days take you from tourist to almost-local. Bikes, canals, big museums and neighborhoods without umbrella-tour groups.",
        "Planning Amsterdam has a catch: touristy is very touristy. So this **Amsterdam itinerary** covers the must-sees and then sends you to Noord, Jordaan and a Zaanse Schans escape.",
        "Want a shortcut? Scroll down.",
      ],
      days: [
        { title: "Classic center and first canal.", periods: [
          { label: "Morning",   text: "Begijnhof and Dam. Coffee at Singel. Westerkerk tower if you fancy the views." },
          { label: "Afternoon", text: "Anne Frank House with an online ticket (mandatory). Slow walk through Jordaan." },
          { label: "Evening",   text: "Dinner in Jordaan. Brown café for the first beer (Café Chris, Café Papeneiland). No Damrak, no Red Light, please." },
        ]},
        { title: "Museums and Vondelpark.", periods: [
          { label: "Morning",   text: "Rijksmuseum or Van Gogh with an online ticket. Pick one, not both back-to-back — your brain will quit." },
          { label: "Afternoon", text: "Vondelpark. Beer on a terrace, rent a bike if you haven't yet." },
          { label: "Evening",   text: "De Pijp for dinner. Albert Cuyp Market if it's open and Dutch BBQ wherever calls." },
        ]},
        { title: "Noord (the other Amsterdam).", periods: [
          { label: "Morning",   text: "Free ferry to Noord. NDSM Werf, A'DAM Lookout for views. Alternative, photogenic Amsterdam." },
          { label: "Afternoon", text: "Walk along the IJ. Floating café or modern food hall lunch." },
          { label: "Evening",   text: "Back to the center at sunset crossing the IJ. Dinner in Oost or Indische Buurt." },
        ]},
        { title: "Escape: Zaanse Schans + final night.", periods: [
          { label: "Morning",   text: "Train to Zaanse Schans (20 min). Windmills, cheese, full Dutch postcard." },
          { label: "Afternoon", text: "Back to Amsterdam. Final shop in some local store or bike along the southern canals." },
          { label: "Evening",   text: "Dinner at a place you've already loved — Amsterdam rewards repetition." },
        ]},
      ],
      tips: {
        transport: "Bike, no excuses. OV-chipkaart for trams/metro. The Noord ferry is free. Walk a lot — canals only make sense on foot.",
        whereToStay: "Jordaan for authentic. De Pijp for food and a younger crowd. Center if you don't want to think (pricey). Avoid Centraal-adjacent and the Red Light.",
        bestTimes: "Museums first thing. Vondelpark at midday with sun. Noord at sunset. Brown cafés from 5pm.",
      },
      closingPara:
        "In 4 days Amsterdam drops the canal-postcard image and shows its interesting side. The one that actually hooks you.",
    },
  },

  /* ───────── NEW YORK (7 days) ───────── */
  newYork: {
    meta: { tripLength: "medium", region: "americas", days: 7 },
    es: {
      slug: "nueva-york-en-7-dias",
      lang: "es",
      ...buildUrls("nueva-york-en-7-dias", "new-york-in-7-days"),
      eyebrow: "Itinerario de Nueva York",
      destinationName: "Nueva York",
      durationLabel: "7 días",
      highlights: ["Midtown y Central Park", "Brooklyn y Queens reales", "Jazz en West Village"],
      title: "Nueva York en 7 días: itinerario completo día a día | Visítalo",
      description:
        "Itinerario de Nueva York en 7 días: Manhattan, Brooklyn, Queens, museos, comida potente y vida real fuera de Times Square.",
      h1Line1: "Nueva York en 7 días:",
      h1Line2: "el viaje que sí merece la espera.",
      intro: [
        "Nueva York en 7 días es la cantidad justa para verla bien sin acabar agotado. La ciudad cambia de barrio cada calle, y en una semana puedes pasar de Manhattan a Brooklyn, comer mejor en Queens y dejarte un día solo para hacer nada — que también es plan.",
        "Planificar Nueva York pone nervioso: musical, museos, miradores, restaurantes con cola… Aquí va un **itinerario Nueva York 7 días** repartido por barrios, no por checklist.",
        "Si lo quieres en automático, abajo tienes el atajo.",
      ],
      days: [
        { title: "Midtown clásico para entrar bien.", periods: [
          { label: "Mañana", text: "Top of the Rock o Edge para vista (mejor que el Empire State, opinión de muchos). Después, paseo por la 5ª." },
          { label: "Tarde",  text: "Central Park: Bow Bridge, Bethesda, paseo sin ruta fija. Comida en algún food hall del centro." },
          { label: "Noche",  text: "Times Square solo para verlo (15 min) y cena en Hell's Kitchen, mucho mejor zona." },
        ]},
        { title: "Museos y Upper East.", periods: [
          { label: "Mañana", text: "MET o MoMA, no los dos. 2.5h máximo, no más." },
          { label: "Tarde",  text: "Upper East Side: Madison Avenue, Frick Collection si te van los museos pequeños." },
          { label: "Noche",  text: "Bar de cócteles en Upper East o vuelta a Midtown para un Broadway." },
        ]},
        { title: "Downtown y Memorial.", periods: [
          { label: "Mañana", text: "9/11 Memorial + Museo. Reserva con tiempo. Es duro pero importante." },
          { label: "Tarde",  text: "Tribeca, Chinatown, Little Italy. Comida en Mott Street." },
          { label: "Noche",  text: "Cócteles en LES (Lower East Side), bares pequeños y sin filtro." },
        ]},
        { title: "Brooklyn (todo el día).", periods: [
          { label: "Mañana", text: "Cruzar Brooklyn Bridge a primera hora — sí, aún merece. Brunch en DUMBO." },
          { label: "Tarde",  text: "Williamsburg: Smorgasburg si es sábado, paseo por Bedford Avenue, tienda de discos." },
          { label: "Noche",  text: "Cena en Williamsburg o Greenpoint. NY mejor que Manhattan, sin discusión." },
        ]},
        { title: "Queens (la sorpresa).", periods: [
          { label: "Mañana", text: "Long Island City: MoMA PS1, café junto al East River con skyline de Manhattan." },
          { label: "Tarde",  text: "Astoria: griegos, comida real y barrio que no parece NY." },
          { label: "Noche",  text: "Cervecería de barrio o vuelta a Manhattan al atardecer cruzando el puente." },
        ]},
        { title: "High Line y vida en West Village.", periods: [
          { label: "Mañana", text: "High Line desde Hudson Yards (subiéndote a The Vessel desde fuera). Camina toda la línea." },
          { label: "Tarde",  text: "Chelsea Market y luego West Village. Brownstones, calles en V — la zona más bonita de la ciudad." },
          { label: "Noche",  text: "Jazz en Smalls o Village Vanguard. NY de la peli." },
        ]},
        { title: "Día abierto.", periods: [
          { label: "Mañana", text: "Vuelve al sitio que te flipó. Aquí no se discute, NY perdona la repetición." },
          { label: "Tarde",  text: "Compras pendientes, museo que te dejaste o ferry gratis a Staten Island (vistas a la Estatua sin pagar)." },
          { label: "Noche",  text: "Última cena. Si quieres tirar la casa, una pizza Joe's te despide igual de bien que un steakhouse." },
        ]},
      ],
      tips: {
        transport: "MetroCard o OMNY contactless. Caminar mucho. Uber/Lyft solo si llueve o tarde noche. Evita el taxi clásico fuera de Manhattan.",
        whereToStay: "Midtown para no perder un metro. Lower East Side / East Village para vibe. Williamsburg si quieres sentirte local pero pierdes 30 min al centro.",
        bestTimes: "Miradores al atardecer. Brunch fines de semana. Broadway entre semana. Museos abiertos 7-7.",
      },
      closingPara:
        "Una semana en Nueva York te deja con la sensación de que falta más. La buena noticia: todo el mundo vuelve.",
    },
    en: {
      slug: "new-york-in-7-days",
      lang: "en",
      ...buildUrls("nueva-york-en-7-dias", "new-york-in-7-days"),
      eyebrow: "New York itinerary",
      destinationName: "New York",
      durationLabel: "7 days",
      highlights: ["Midtown & Central Park", "Real Brooklyn & Queens", "Jazz in West Village"],
      title: "New York in 7 days: complete day-by-day itinerary | Visítalo",
      description:
        "New York in 7 days itinerary: Manhattan, Brooklyn, Queens, museums, big-flavor food and real life away from Times Square.",
      h1Line1: "New York in 7 days:",
      h1Line2: "the trip that earns the wait.",
      intro: [
        "Seven days in New York is the sweet spot to see it well without leaving destroyed. The city changes neighborhood every block, and in a week you can go from Manhattan to Brooklyn, eat better in Queens and leave one day for nothing — also a plan.",
        "Planning New York rattles nerves: musicals, museums, viewpoints, restaurants with queues… Here's a **New York itinerary** organized by neighborhood, not by checklist.",
        "Want it on auto? Scroll down.",
      ],
      days: [
        { title: "Classic Midtown to break in.", periods: [
          { label: "Morning",   text: "Top of the Rock or Edge (better than the Empire State for many). Then a walk down 5th." },
          { label: "Afternoon", text: "Central Park: Bow Bridge, Bethesda, no set route. Lunch in a Midtown food hall." },
          { label: "Evening",   text: "Times Square just to see it (15 min) and dinner in Hell's Kitchen, much better turf." },
        ]},
        { title: "Museums and Upper East.", periods: [
          { label: "Morning",   text: "MET or MoMA, not both. 2.5h max, no more." },
          { label: "Afternoon", text: "Upper East Side: Madison Avenue, Frick Collection if small museums are your thing." },
          { label: "Evening",   text: "Cocktail bar Upper East or back to Midtown for a Broadway show." },
        ]},
        { title: "Downtown and Memorial.", periods: [
          { label: "Morning",   text: "9/11 Memorial + Museum. Book ahead. Heavy but important." },
          { label: "Afternoon", text: "Tribeca, Chinatown, Little Italy. Lunch on Mott Street." },
          { label: "Evening",   text: "Cocktails in LES (Lower East Side), small unfiltered bars." },
        ]},
        { title: "Brooklyn (full day).", periods: [
          { label: "Morning",   text: "Cross Brooklyn Bridge early — still worth it. Brunch in DUMBO." },
          { label: "Afternoon", text: "Williamsburg: Smorgasburg on Saturdays, Bedford Avenue, record shop." },
          { label: "Evening",   text: "Dinner in Williamsburg or Greenpoint. Better than Manhattan, no debate." },
        ]},
        { title: "Queens (the surprise).", periods: [
          { label: "Morning",   text: "Long Island City: MoMA PS1, coffee on the East River with the Manhattan skyline." },
          { label: "Afternoon", text: "Astoria: Greek food, real life, a neighborhood that doesn't feel NY." },
          { label: "Evening",   text: "Local brewery or back to Manhattan at sunset crossing the bridge." },
        ]},
        { title: "High Line and West Village life.", periods: [
          { label: "Morning",   text: "High Line from Hudson Yards (peek at The Vessel from outside). Walk the entire line." },
          { label: "Afternoon", text: "Chelsea Market and then West Village. Brownstones, V-streets — the prettiest part of town." },
          { label: "Evening",   text: "Jazz at Smalls or Village Vanguard. Movie New York." },
        ]},
        { title: "Open day.", periods: [
          { label: "Morning",   text: "Go back to the place that wowed you. NY forgives repetition." },
          { label: "Afternoon", text: "Pending shopping, that museum you skipped, or a free Staten Island ferry (Statue views, no fee)." },
          { label: "Evening",   text: "Last dinner. Splurge or a Joe's slice — both send you off properly." },
        ]},
      ],
      tips: {
        transport: "MetroCard or OMNY contactless. Walk a lot. Uber/Lyft only when raining or late. Yellow cabs outside Manhattan rarely worth it.",
        whereToStay: "Midtown to skip the metro. LES / East Village for vibe. Williamsburg for local feel but losing 30 min to the center.",
        bestTimes: "Viewpoints at sunset. Brunch on weekends. Broadway midweek. Museums 7am-7pm window.",
      },
      closingPara:
        "A week in New York leaves you wanting more. Good news: everybody comes back.",
    },
  },

  /* ───────── BALI (14 days) ───────── */
  bali: {
    meta: { tripLength: "long", region: "asia", days: 14 },
    es: {
      slug: "bali-en-14-dias",
      lang: "es",
      ...buildUrls("bali-en-14-dias", "bali-in-14-days"),
      eyebrow: "Itinerario de Bali",
      destinationName: "Bali",
      durationLabel: "14 días",
      highlights: ["Ubud y arroceras", "Nusa Penida + Uluwatu", "Sidemen sin gente"],
      title: "Bali en 14 días: itinerario completo día a día | Visítalo",
      description:
        "Itinerario de Bali en 14 días: Ubud, Canggu, Uluwatu, Nusa Penida, Gili y arroceras. Plan claro y vida balinesa de verdad, no solo Insta.",
      h1Line1: "Bali en 14 días:",
      h1Line2: "el viaje que se vive lento.",
      intro: [
        "Bali en 14 días es perfecto para ver la isla sin caer en el modo agenda. Hay tiempo para Ubud, costa oeste, este, una islita pequeña y reset de cuerpo entero.",
        "Planificar Bali es complicado: distancias engañosas, tráfico, tour buses por todas partes. Por eso este **itinerario Bali 14 días** divide la isla en zonas y mete dos noches mínimo en cada base.",
        "Si te apetece atajar, abajo te montamos uno como este en segundos.",
      ],
      days: [
        { dayLabel: "Días 1–3", title: "Aterrizaje suave en Canggu.", periods: [
          { label: "Mañana", text: "Llegar y respirar. Surf principiante en Batu Bolong, café en alguna brunch shop sin nombre escandaloso." },
          { label: "Tarde",  text: "Atardecer en La Brisa o Old Man's. Cena cerca del mar. Bali sin prisa." },
          { label: "Noche",  text: "Beach club si te apetece, masaje si no. Hay versión para los dos." },
        ]},
        { dayLabel: "Días 4–7", title: "Ubud — la Bali del interior.", periods: [
          { label: "Mañana", text: "Tegallalang (arroceras) muy temprano. Cascada Tibumana o Tukad Cepung el día siguiente." },
          { label: "Tarde",  text: "Templo Saraswati en Ubud, Monkey Forest, paseo por la calle Dewi Sita." },
          { label: "Noche",  text: "Cena en Locavore-style (cocina balinesa moderna) o un warung familiar. Yoga al amanecer del día siguiente." },
        ]},
        { dayLabel: "Día 8", title: "Mount Batur (sunrise hike).", periods: [
          { label: "Mañana", text: "Salida 02:00, llegar arriba al amanecer. Café en la cima viendo el volcán despertar." },
          { label: "Tarde",  text: "Vuelta a Ubud, masaje de las piernas y tarde tranquila." },
          { label: "Noche",  text: "Cena suave y a dormir pronto. Te lo has ganado." },
        ]},
        { dayLabel: "Días 9–10", title: "Nusa Penida (la dura y bonita).", periods: [
          { label: "Mañana", text: "Ferry a Penida desde Sanur. Kelingking Beach (la del T-Rex) muy temprano." },
          { label: "Tarde",  text: "Diamond Beach, Atuh Beach. Caminos terribles, paisajes brutales." },
          { label: "Noche",  text: "Hotel sencillo en la isla, cena con vistas. Penida no es para lujo, es para naturaleza." },
        ]},
        { dayLabel: "Días 11–12", title: "Uluwatu (la costa surfera).", periods: [
          { label: "Mañana", text: "Vuelta a Bali grande. Padang Padang, Bingin, paseo por acantilados." },
          { label: "Tarde",  text: "Templo de Uluwatu y kecak fire dance al atardecer (sí, es turístico, pero merece)." },
          { label: "Noche",  text: "Sundowner en Single Fin (Uluwatu) o cena en un warung escondido. Surfistas, sal y rojos." },
        ]},
        { dayLabel: "Días 13–14", title: "Sidemen + última noche cualquiera.", periods: [
          { label: "Mañana", text: "Sidemen para el último escape natural — arrozales sin gente, pueblos vivos." },
          { label: "Tarde",  text: "Trekking suave o nada. Aquí ganas el día sin hacer." },
          { label: "Noche",  text: "Última cena con vistas a las montañas. Ya está pasando." },
        ]},
      ],
      tips: {
        transport: "Scooter sí o sí (con experiencia). Si no, GoJek y Grab para todo. Conductor privado por día (~25-35€) compensa para tours.",
        whereToStay: "Ubud para naturaleza, Canggu para surf y café, Uluwatu para acantilados, Sidemen para silencio. Evita Kuta a menos que solo busques vida nocturna barata.",
        bestTimes: "Templos al amanecer. Cascadas a media mañana. Atardeceres en la costa oeste. Tráfico denso entre 16-19h, planéalo.",
      },
      closingPara:
        "Catorce días en Bali son justo lo que la isla pide para no irte con la sensación de no haberla visto.",
    },
    en: {
      slug: "bali-in-14-days",
      lang: "en",
      ...buildUrls("bali-en-14-dias", "bali-in-14-days"),
      eyebrow: "Bali itinerary",
      destinationName: "Bali",
      durationLabel: "14 days",
      highlights: ["Ubud & rice terraces", "Nusa Penida + Uluwatu", "Empty Sidemen"],
      title: "Bali in 14 days: complete day-by-day itinerary | Visítalo",
      description:
        "Bali in 14 days itinerary: Ubud, Canggu, Uluwatu, Nusa Penida and rice terraces. A clear plan and real Balinese life, not just Insta.",
      h1Line1: "Bali in 14 days:",
      h1Line2: "the trip lived slowly.",
      intro: [
        "14 days in Bali is the sweet spot to see the island without going into checklist mode. There's time for Ubud, west coast, east, a small island and a full body reset.",
        "Planning Bali is tricky: deceiving distances, traffic, tour buses everywhere. So this **Bali 14 days itinerary** breaks the island into zones with at least two nights at each base.",
        "Want a shortcut? Scroll down — we'll build it for you.",
      ],
      days: [
        { dayLabel: "Days 1–3", title: "Gentle landing in Canggu.", periods: [
          { label: "Morning",   text: "Land and breathe. Beginner surf at Batu Bolong, coffee at any unbranded brunch shop." },
          { label: "Afternoon", text: "Sunset at La Brisa or Old Man's. Dinner near the sea. Bali, no rush." },
          { label: "Evening",   text: "Beach club if you want it, massage if not. There's a version for both." },
        ]},
        { dayLabel: "Days 4–7", title: "Ubud — inland Bali.", periods: [
          { label: "Morning",   text: "Tegallalang rice terraces very early. Tibumana waterfall or Tukad Cepung the next day." },
          { label: "Afternoon", text: "Saraswati Temple in Ubud, Monkey Forest, slow walk down Dewi Sita street." },
          { label: "Evening",   text: "Locavore-style modern Balinese dinner or a family warung. Sunrise yoga next morning." },
        ]},
        { dayLabel: "Day 8", title: "Mount Batur (sunrise hike).", periods: [
          { label: "Morning",   text: "Leave 2am, summit by sunrise. Coffee at the top watching the volcano wake up." },
          { label: "Afternoon", text: "Back to Ubud, leg massage and quiet afternoon." },
          { label: "Evening",   text: "Light dinner and early bed. Earned it." },
        ]},
        { dayLabel: "Days 9–10", title: "Nusa Penida (rough and beautiful).", periods: [
          { label: "Morning",   text: "Ferry to Penida from Sanur. Kelingking Beach (the T-Rex one) very early." },
          { label: "Afternoon", text: "Diamond Beach, Atuh Beach. Bad roads, brutal landscapes." },
          { label: "Evening",   text: "Simple stay on the island, dinner with views. Penida is for nature, not luxury." },
        ]},
        { dayLabel: "Days 11–12", title: "Uluwatu (surf coast).", periods: [
          { label: "Morning",   text: "Back to mainland Bali. Padang Padang, Bingin, cliff walks." },
          { label: "Afternoon", text: "Uluwatu Temple and the kecak fire dance at sunset (touristy, still worth it)." },
          { label: "Evening",   text: "Sundowner at Single Fin (Uluwatu) or dinner at a hidden warung. Surfers, salt and red skies." },
        ]},
        { dayLabel: "Days 13–14", title: "Sidemen + last open night.", periods: [
          { label: "Morning",   text: "Sidemen for one last natural escape — empty rice terraces and living villages." },
          { label: "Afternoon", text: "Easy trek or nothing at all. Here you win the day by doing less." },
          { label: "Evening",   text: "Last dinner with mountain views. It's happening." },
        ]},
      ],
      tips: {
        transport: "Scooter if experienced. Otherwise GoJek and Grab for everything. Private driver per day (~$30-40) is worth it for tours.",
        whereToStay: "Ubud for nature, Canggu for surf and coffee, Uluwatu for cliffs, Sidemen for silence. Skip Kuta unless you want cheap nightlife only.",
        bestTimes: "Temples at sunrise. Waterfalls mid-morning. Sunsets on the west coast. Traffic is dense 4-7pm, plan around it.",
      },
      closingPara:
        "Fourteen days in Bali is exactly what the island asks so you don't leave feeling you missed it.",
    },
  },
};

// Flat lookup by slug (used by the page component)
export const seoItinerariesBySlug = (() => {
  const out = {};
  for (const id of Object.keys(seoItineraries)) {
    out[seoItineraries[id].es.slug] = { ...seoItineraries[id].es, _id: id };
    out[seoItineraries[id].en.slug] = { ...seoItineraries[id].en, _id: id };
  }
  return out;
})();

/**
 * Returns up to `limit` related destinations for the given destination id.
 * Priority:
 *   1. Same tripLength + same region (perfect match)
 *   2. Same tripLength (any region)
 *   3. Same region (any tripLength)
 *   4. Anything else
 * Excludes the source destination itself.
 */
export const getRelatedDestinations = (sourceId, lang = "es", limit = 4) => {
  if (!seoItineraries[sourceId]) return [];
  const sourceMeta = seoItineraries[sourceId].meta;

  const all = Object.keys(seoItineraries)
    .filter((id) => id !== sourceId)
    .map((id) => {
      const meta = seoItineraries[id].meta;
      let score = 0;
      if (meta.tripLength === sourceMeta.tripLength) score += 2;
      if (meta.region === sourceMeta.region) score += 1;
      const data = seoItineraries[id][lang];
      return {
        id,
        score,
        slug: data.slug,
        destinationName: data.destinationName,
        durationLabel: data.durationLabel,
        days: meta.days,
        region: meta.region,
        tripLength: meta.tripLength,
      };
    })
    .sort((a, b) => b.score - a.score);

  return all.slice(0, limit);
};

/**
 * Returns the full list for the /destinos hub.
 */
export const getAllDestinations = (lang = "es") =>
  Object.keys(seoItineraries).map((id) => {
    const data = seoItineraries[id][lang];
    const meta = seoItineraries[id].meta;
    return {
      id,
      slug: data.slug,
      destinationName: data.destinationName,
      durationLabel: data.durationLabel,
      highlights: data.highlights || [],
      days: meta.days,
      region: meta.region,
      tripLength: meta.tripLength,
    };
  });
