import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

/**
 * Sección Fotos: cerrada al público por ahora. El código sigue entero (rutas, componentes, API y panel admin); esto solo
 * corta el acceso y los enlaces. Para reabrirla: true aquí y Secciones:Fotos en el appsettings del API (sitemap).
 */
export const FOTOS_HABILITADAS = false;

/** canMatch de /fotos: con la sección cerrada, cualquier enlace viejo cae a la portada. */
export const fotosHabilitadas: CanMatchFn = () => FOTOS_HABILITADAS || inject(Router).createUrlTree(['/']);
