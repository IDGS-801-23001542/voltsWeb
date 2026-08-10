import {
  BackofficeMenuGroup
} from '../../../core/models//backoffice-menu.model';

export const BACKOFFICE_MENU: BackofficeMenuGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        label: 'Dashboard',
        icon: '🏠',
        route: '/backoffice',
        roles: ['Admin', 'Employee'],
        exact: true
      }
    ]
  },
  {
    title: 'Administración',
    items: [
      { label: 'Usuarios', icon: '👤', route: '/backoffice/usuarios', roles: ['Admin'] },
      { label: 'Auditoría', icon: '🔍', route: '/backoffice/auditoria', roles: ['Admin'] },
      { label: 'Logs del sistema', icon: '🖥️', route: '/backoffice/logs', roles: ['Admin'] },
      { label: 'Procesos ETL', icon: '🔄', route: '/backoffice/etl', roles: ['Admin'] },
      { label: 'Analítica', icon: '📈', route: '/backoffice/analitica', roles: ['Admin'] }
    ]
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Clientes', icon: '👥', route: '/backoffice/clientes', roles: ['Admin', 'Employee'] },
      { label: 'Instituciones', icon: '🏫', route: '/backoffice/instituciones', roles: ['Admin', 'Employee'] },
      { label: 'Planes y paquetes', icon: '🎁', route: '/backoffice/planes-paquetes', roles: ['Admin', 'Employee'] },
      { label: 'Cotizaciones', icon: '🧾', route: '/backoffice/cotizaciones', roles: ['Admin', 'Employee'] },
      { label: 'Pedidos', icon: '📦', route: '/backoffice/pedidos', roles: ['Admin', 'Employee'] },
      { label: 'Ventas', icon: '💰', route: '/backoffice/ventas', roles: ['Admin', 'Employee'] },
      { label: 'Licencias', icon: '🔑', route: '/backoffice/licencias', roles: ['Admin', 'Employee'] }
    ]
  },
  {
    title: 'Producción e inventario',
    items: [
      { label: 'Productos', icon: '🐕', route: '/backoffice/productos', roles: ['Admin', 'Employee'] },
      { label: 'Categorías', icon: '🏷️', route: '/backoffice/categorias', roles: ['Admin', 'Employee'] },
      { label: 'Materia prima', icon: '🧰', route: '/backoffice/materia-prima', roles: ['Admin', 'Employee'] },
      { label: 'Proveedores', icon: '🚚', route: '/backoffice/proveedores', roles: ['Admin', 'Employee'] },
      { label: 'Compras', icon: '🛒', route: '/backoffice/compras', roles: ['Admin', 'Employee'] },
      { label: 'Recetas BOM', icon: '📋', route: '/backoffice/recetas', roles: ['Admin', 'Employee'] },
      { label: 'Producción', icon: '⚙️', route: '/backoffice/produccion', roles: ['Admin', 'Employee'] },
      { label: 'Merma', icon: '♻️', route: '/backoffice/merma', roles: ['Admin', 'Employee'] }
    ]
  },
  {
    title: 'Atención y contenido',
    items: [
      { label: 'Soporte', icon: '🎧', route: '/backoffice/soporte', roles: ['Admin', 'Employee'] },
      { label: 'Contacto', icon: '✉️', route: '/backoffice/contacto', roles: ['Admin', 'Employee'] },
      { label: 'Comentarios', icon: '💬', route: '/backoffice/comentarios', roles: ['Admin', 'Employee'] },
      { label: 'Documentación', icon: '📚', route: '/backoffice/documentacion', roles: ['Admin', 'Employee'] },
      { label: 'Notificaciones', icon: '🔔', route: '/backoffice/notificaciones', roles: ['Admin', 'Employee'] }
    ]
  }
];
