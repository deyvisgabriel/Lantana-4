/* ==========================================================================
   LANTANA CAFÉ BISTRÓ — Datos editables del sitio
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para:
   - cambiar precios (price: null  =>  se muestra "Precio a confirmar")
   - reemplazar fotografías (img.src puede ser una URL o una ruta local,
     p. ej. "assets/fotos/vasco.webp")
   - actualizar redes sociales, número de WhatsApp o testimonios.
   ========================================================================== */

/** Construye una URL optimizada (WebP/AVIF automático) para fotos de Unsplash.
 *  Si usas fotos propias, escribe directamente la ruta: "assets/fotos/x.webp". */
function unsplash(id) {
  return "https://images.unsplash.com/photo-" + id;
}

window.LANTANA = {
  // Número sin "+" ni espacios (formato wa.me)
  whatsapp: "59168023040",
  whatsappDisplay: "+591 68023040",

  // TODO: confirmar los usuarios reales de Instagram y TikTok
  instagram: "https://www.instagram.com/lantanacafebistro/",
  tiktok: "https://www.tiktok.com/@lantanacafebistro",

  zones: ["Zona Norte", "Zona Centro"],

  messages: {
    general: "Hola Lantana Café Bistró. Quisiera realizar un pedido. ¿Podrían ayudarme con la disponibilidad?",
    reservar: "Hola Lantana Café Bistró. Quisiera reservar un pedido para una fecha determinada. ¿Qué disponibilidad tienen?",
    toppings: "Hola Lantana Café Bistró. Quisiera consultar las combinaciones de cheesecake con toppings.",
  },

  categories: [
    { id: "todos", label: "Todos" },
    { id: "cheesecakes", label: "Cheesecakes" },
    { id: "tortas", label: "Tortas" },
    { id: "clasicos", label: "Para el café" },
  ],

  toppings: [
    { id: "frutilla", name: "Frutilla", note: "Fresca y delicada", price: null, img: unsplash("1464965911861-746a04b4bca6"), alt: "Frutillas frescas para topping de cheesecake" },
    { id: "maracuya", name: "Maracuyá", note: "Tropical y vibrante", price: null, img: unsplash("1747644208239-6cf92b710129"), alt: "Maracuyá abierto para topping de cheesecake" },
    { id: "frutos-del-bosque", name: "Frutos del bosque", note: "Intenso y equilibrado", price: null, img: unsplash("1610441009633-b6ca9c6d4be2"), alt: "Frutos del bosque frescos para topping" },
    { id: "chocolate", name: "Chocolate", note: "Profundo y sedoso", price: null, img: unsplash("1551578657-a7e74acb0135"), alt: "Chocolate para topping de cheesecake" },
  ],

  products: [
    {
      id: "cheesecake-vasco",
      name: "Cheesecake Vasco",
      category: "cheesecakes",
      badge: "El favorito",
      description: "Exterior intensamente caramelizado y un interior suave, cremoso y delicado.",
      img: unsplash("1759303380841-55c09244fd2b"),
      alt: "Porción de cheesecake vasco con superficie caramelizada, Santa Cruz",
      options: [
        { id: "porcion", label: "Porción", price: 35 },
        { id: "entero", label: "Entero", price: 350 },
      ],
      toppings: true,
      cta: "Quiero probarlo",
    },
    {
      id: "cheesecake-new-york",
      name: "Cheesecake New York",
      category: "cheesecakes",
      description: "Cremoso, elegante y perfectamente equilibrado. Un clásico que nunca falla.",
      img: unsplash("1708175313856-8573b2bf8a3a"),
      alt: "Porción de cheesecake New York cremoso en plato",
      options: [
        { id: "porcion", label: "Porción", price: 35 },
        { id: "entero", label: "Entero", price: 300 },
      ],
      toppings: true,
      cta: "Pedir por WhatsApp",
    },
    {
      id: "cheesecake-oreo",
      name: "Cheesecake Oreo",
      category: "cheesecakes",
      description: "La combinación perfecta entre la cremosidad del cheesecake y el sabor irresistible de Oreo.",
      img: unsplash("1623548694299-c3eb13a26c5b"),
      alt: "Porción de cheesecake de galleta Oreo",
      options: [
        { id: "porcion", label: "Porción", price: 35 },
        { id: "entero", label: "Entero", price: 300 },
      ],
      toppings: true,
      cta: "Pedir por WhatsApp",
    },
    {
      id: "torta-bruce-bruce",
      name: "Torta Bruce Bruce",
      category: "tortas",
      badge: "Para chocolate lovers",
      description: "Chocolate intenso, capas irresistibles y una textura creada para verdaderos amantes del chocolate.",
      img: unsplash("1517427294546-5aa121f68e8a"),
      alt: "Porción de torta de chocolate Bruce Bruce con capas",
      options: [
        { id: "porcion", label: "Porción", price: 35 },
        { id: "entera", label: "Torta entera", price: 300 },
      ],
      cta: "Quiero chocolate",
    },
    {
      id: "mini-cheesecakes",
      name: "Mini Cheesecakes",
      category: "cheesecakes",
      badge: "Ideal para regalar",
      description: "Todo el sabor de Lantana en formato individual. Perfectos para compartir, regalar, reuniones o celebraciones.",
      note: "Consulta nuestras presentaciones y disponibilidad.",
      img: unsplash("1600383708782-42a91f5ac449"),
      alt: "Mini cheesecakes individuales con frutos rojos",
      options: [{ id: "caja", label: "Presentación a elegir", price: null }],
      toppings: true,
      cta: "Consultar mini cheesecakes",
      message: "Hola Lantana Café Bistró. Quisiera información sobre los mini cheesecakes.",
    },
    {
      id: "brownie",
      name: "Brownie",
      category: "clasicos",
      description: "Intenso, húmedo y chocolatoso. Ideal para acompañar el café o simplemente darse un gusto.",
      img: unsplash("1606313564200-e75d5e30476c"),
      alt: "Brownies de chocolate húmedos con chocolate derretido",
      // Precio editable: reemplaza null por el valor en Bs (p. ej. 20)
      options: [{ id: "unidad", label: "Unidad", price: null }],
      cta: "Pedir por WhatsApp",
    },
    {
      id: "cunape",
      name: "Cuñapé",
      category: "clasicos",
      badge: "Clásico cruceño",
      description: "Un clásico cruceño preparado para disfrutar caliente, suave por dentro y con ese irresistible sabor a queso.",
      img: unsplash("1559141680-d0bd7bc5af84"),
      alt: "Cuñapés cruceños recién horneados en Santa Cruz",
      // Precio editable: reemplaza null por el valor en Bs
      options: [{ id: "unidad", label: "Unidad", price: null }],
      cta: "Pedir por WhatsApp",
    },
  ],

  /* Testimonios de DEMOSTRACIÓN. Reemplazar por reseñas reales y luego
     cambiar `testimonialsAreDemo` a false para quitar el aviso. */
  testimonialsAreDemo: true,
  testimonials: [
    { quote: "El cheesecake estaba increíblemente cremoso y llegó perfectamente presentado.", author: "Cliente de ejemplo", detail: "Zona Norte" },
    { quote: "Pedimos para compartir en familia y fue un éxito.", author: "Cliente de ejemplo", detail: "Zona Centro" },
    { quote: "La presentación es preciosa y el sabor todavía mejor.", author: "Cliente de ejemplo", detail: "Zona Norte" },
    { quote: "Perfecto para regalar o llevar a una reunión.", author: "Cliente de ejemplo", detail: "Zona Centro" },
  ],
};
