// app.js - Conexión Supabase y funciones principales
// Tecnilight Catálogo de Herrería

// ============================================
// CONFIGURACIÓN SUPABASE (REEMPLAZAR CON TUS CREDENCIALES)
// ============================================
const SUPABASE_URL = 'https://fbankbuoijugeycwncxz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYW5rYnVvaWp1Z2V5Y3duY3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MjM5ODUsImV4cCI6MjEwMTA5OTk4NX0.H6FTyOnqLczsC5sdVXNGSkSz0ZvZbki2GLyGzFUOdbs';

// Inicializar cliente Supabase (el CDN ya expone supabase globalmente)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// FUNCIONES DE PRODUCTOS
// ============================================

/**
 * Obtiene todos los productos con sus imágenes
 * @param {Object} filtros - { categoria, tamano, soloGaleria }
 * @returns {Promise<Array>}
 */
async function obtenerProductos(filtros = {}) {
    try {
        let query = supabaseClient
            .from('productos')
            .select(`
                *,
                categorias (nombre, slug),
                imagenes_producto (url_imagen, es_portada)
            `)
            .order('creado_en', { ascending: false });
        
        // Aplicar filtros
        if (filtros.categoria) {
            query = query.eq('categorias.slug', filtros.categoria);
        }
        if (filtros.tamano) {
            query = query.eq('tamano_etiqueta', filtros.tamano);
        }
        if (filtros.soloGaleria !== undefined) {
            query = query.eq('es_solo_galeria', filtros.soloGaleria);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error al obtener productos:', err);
        return [];
    }
}

/**
 * Obtiene un producto por su slug
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
async function obtenerProductoPorSlug(slug) {
    try {
         
        const { data, error } = await supabaseClient
            .from('productos')
            .select(`
                *,
                categorias (nombre, slug),
                imagenes_producto (url_imagen, es_portada)
            `)
            .eq('slug', slug)
            .single();
        
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error al obtener producto:', err);
        return null;
    }
}

/**
 * Obtiene todas las categorías
 * @returns {Promise<Array>}
 */
async function obtenerCategorias() {
    try {
        const { data, error } = await supabaseClient
            .from('categorias')
            .select('*')
            .order('nombre');
        
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error al obtener categorías:', err);
        return [];
    }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Formatea precio a formato MXN
 * @param {number} precio
 * @returns {string}
 */
function formatearPrecio(precio) {
    if (!precio || precio === 0) return 'Cotizar';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0
    }).format(precio);
}

/**
 * Genera enlace de WhatsApp para cotización
 * @param {Object} producto
 * @returns {string}
 */
function generarLinkWhatsApp(producto) {
    const telefono = '5211234567890'; // Reemplazar
    const mensaje = encodeURIComponent(
        `Hola, me interesa el producto: ${producto.nombre}\n` +
        `Categoría: ${producto.categorias?.nombre || 'N/A'}\n` +
        `¿Podrían darme más información?`
    );
    return `https://wa.me/${telefono}?text=${mensaje}`;
}

/**
 * Genera enlace de WhatsApp para producto personalizado
 * @param {Object} datos - { alto, ancho, largo, descripcion }
 * @returns {string}
 */
function generarLinkWhatsAppPersonalizado(datos) {
    const telefono = '5211234567890'; // Reemplazar
    const mensaje = encodeURIComponent(
        `Hola, quiero cotizar un producto personalizado:\n\n` +
        `📐 Dimensiones:\n` +
        `• Alto: ${datos.alto}m\n` +
        `• Ancho: ${datos.ancho}m\n` +
        `• Largo: ${datos.largo}m\n\n` +
        `📝 Descripción:\n${datos.descripcion}`
    );
    return `https://wa.me/${telefono}?text=${mensaje}`;
}

/**
 * Obtiene parámetro de URL (query string)
 * @param {string} nombre
 * @returns {string|null}
 */
function obtenerParametroURL(nombre) {
    const params = new URLSearchParams(window.location.search);
    return params.get(nombre);
}

/**
 * Crea una tarjeta de producto HTML
 * @param {Object} producto
 * @returns {string}
 */
function crearTarjetaProducto(producto) {
    const imagenPortada = producto.imagenes_producto?.find(img => img.es_portada)?.url_imagen 
        || producto.imagenes_producto?.[0]?.url_imagen 
        || 'assets/img/placeholder.jpg';
    
    const whatsappLink = generarLinkWhatsApp(producto);
    
    return `
        <article class="producto-card" data-categoria="${producto.categorias?.slug}" data-tamano="${producto.tamano_etiqueta}">
            <a href="producto.html?articulo=${producto.slug}" class="producto-link">
                <div class="producto-imagen">
                    <img src="${imagenPortada}" alt="${producto.nombre}" loading="lazy">
                    ${producto.es_solo_galeria ? '<span class="badge-galeria">Galería</span>' : ''}
                </div>
                <div class="producto-info">
                    <span class="producto-categoria">${producto.categorias?.nombre || 'General'}</span>
                    <h3 class="producto-nombre">${producto.nombre}</h3>
                    <div class="producto-meta">
                        ${producto.tamano_etiqueta ? `<span class="producto-tamano">${producto.tamano_etiqueta}</span>` : ''}
                    </div>
                </div>
            </a>
            <a href="${whatsappLink}" target="_blank" class="btn-whatsapp">
                <svg viewBox="0 0 24 24" width="18" height="18" style="margin-right: 8px;"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Cotizar
            </a>
        </article>
    `;
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Hacer funciones disponibles globalmente
window.TecnilightApp = {
    obtenerProductos,
    obtenerProductoPorSlug,
    obtenerCategorias,
    formatearPrecio,
    generarLinkWhatsApp,
    generarLinkWhatsAppPersonalizado,
    obtenerParametroURL,
    crearTarjetaProducto
};
