import { Router } from '@angular/router';

export interface NavLink {
  label: string;
  icon: string;
  route: string;
  /** Activo solo si la URL coincide exacta (p. ej. "/" no debe quedar activo en todas las páginas). */
  exact?: boolean;
  /** Ruta a comparar para el estado activo cuando difiere del destino (p. ej. toda la sección /administracion). */
  matchRoute?: string;
  /** Si se indica, el enlace solo se muestra a ese rango. */
  rango?: 'Moderador' | 'Administrador';
  /** Se muestra como pestaña en la barra principal (el resto vive solo en el cajón móvil). */
  tab?: boolean;
}

// Fuente única de la navegación principal: la usan la barra de pestañas (main-menu) y el cajón móvil.
export const NAV_LINKS: NavLink[] = [
  { label: 'Posts', icon: 'ti-smart-home', route: '/', exact: true, tab: true },
  { label: 'TOPs', icon: 'ti-trophy', route: '/tops', tab: true },
  { label: 'Comunidades', icon: 'ti-users', route: '/comunidades', tab: true },
  { label: 'Fotos', icon: 'ti-camera', route: '/fotos', tab: true },
  { label: 'Buscador', icon: 'ti-search', route: '/buscar', exact: true },
  { label: 'Historial', icon: 'ti-history', route: '/mod-history' },
  { label: 'Moderación', icon: 'ti-tool', route: '/moderacion', rango: 'Moderador' },
  {
    label: 'Administración',
    icon: 'ti-adjustments',
    route: '/administracion/dashboard',
    matchRoute: '/administracion',
    rango: 'Administrador',
    tab: true,
  },
];

export function linksFor(rango: string | undefined, soloTabs = false): NavLink[] {
  return NAV_LINKS.filter((l) => (!l.rango || l.rango === rango) && (!soloTabs || l.tab));
}

export function isLinkActive(router: Router, link: NavLink): boolean {
  return router.isActive(link.matchRoute ?? link.route, {
    paths: link.exact ? 'exact' : 'subset',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });
}
