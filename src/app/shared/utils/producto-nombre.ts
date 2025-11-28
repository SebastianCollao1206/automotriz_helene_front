const STOPWORDS = new Set([
    'de', 'del', 'la', 'el', 'los', 'las', 'para', 'con', 'y', 'a', 'en', 'por', 'un', 'una'
]);


function normalizarPalabra(palabra: string): string {
    return palabra
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

export function construirNombreProducto(producto: any): string {
    const nombreCompleto = (
        producto.nombreProducto ||
        producto.nombre ||
        ''
    ).trim();

    if (!nombreCompleto) {
        return 'Producto sin nombre';
    }

    const palabras = nombreCompleto.split(/\s+/);

    const palabrasVistas = new Set<string>();
    const resultado: string[] = [];

    for (const palabra of palabras) {
        const palabraLimpia = palabra.trim();

        if (!palabraLimpia) continue;

        const palabraNormalizada = normalizarPalabra(palabraLimpia);

        if (STOPWORDS.has(palabraNormalizada) && resultado.length > 0) {
            continue;
        }

        if (palabrasVistas.has(palabraNormalizada)) {
            continue;
        }

        resultado.push(palabraLimpia);
        palabrasVistas.add(palabraNormalizada);
    }

    const nombreFinal = resultado.join(' ').trim();
    return nombreFinal || nombreCompleto;
}

export function validarNombreProducto(nombre: string): boolean {
    return !!nombre && nombre.trim().length > 0 && nombre !== 'Producto sin nombre';
}