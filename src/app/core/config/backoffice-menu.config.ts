import {
  BackofficeMenuGroup
} from '../models/backoffice-menu.model';

export const BACKOFFICE_MENU: BackofficeMenuGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        label: 'Dashboard',
        icon: '🏠',
        route: '/backoffice',
        roles: ['Admin', 'Employee'],
        permission: 'analytics.read',
        exact: true
      }
    ]
  },
  {
    title: 'Administración',
    items: [
      { label: 'Usuarios', icon: '👤', route: '/backoffice/usuarios', roles: ['Admin'], permission: 'administration.users.read' },
      { label: 'Auditoría', icon: '🔍', route: '/backoffice/auditoria', roles: ['Admin'] },
      { label: 'Logs del sistema', icon: '🖥️', route: '/backoffice/logs', roles: ['Admin'] },
      { label: 'Procesos ETL', icon: '🔄', route: '/backoffice/etl', roles: ['Admin'] },
      { label: 'Analítica', icon: '📈', route: '/backoffice/analitica', roles: ['Admin'], permission: 'analytics.read' }
    ]
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Clientes', icon: '👥', route: '/backoffice/clientes', roles: ['Admin', 'Employee'], permission: 'commercial.customers.read' },
      { label: 'Instituciones', icon: '🏫', route: '/backoffice/instituciones', roles: ['Admin', 'Employee'], permission: 'commercial.customers.read' },
      { label: 'Planes y paquetes', icon: '🎁', route: '/backoffice/planes-paquetes', roles: ['Admin', 'Employee'], permission: 'commercial.plans.manage' },
      { label: 'Cotizaciones', icon: '🧾', route: '/backoffice/cotizaciones', roles: ['Admin', 'Employee'], permission: 'commercial.quotes.manage' },
      { label: 'Pedidos', icon: '📦', route: '/backoffice/pedidos', roles: ['Admin', 'Employee'], permission: 'commercial.orders.manage' },
      { label: 'Ventas', icon: '💰', route: '/backoffice/ventas', roles: ['Admin', 'Employee'], permission: 'commercial.sales.manage' },
      { label: 'Licencias', icon: '🔑', route: '/backoffice/licencias', roles: ['Admin', 'Employee'], permission: 'commercial.licenses.manage' }
    ]
  },
  {
    title: 'Producción e inventario',
    items: [
      { label: 'Productos', icon: '🐕', route: '/backoffice/productos', roles: ['Admin', 'Employee'], permission: 'inventory.read' },
      { label: 'Categorías', icon: '🏷️', route: '/backoffice/categorias', roles: ['Admin', 'Employee'], permission: 'inventory.read' },
      { label: 'Materia prima', icon: '🧰', route: '/backoffice/materia-prima', roles: ['Admin', 'Employee'], permission: 'inventory.read' },
      { label: 'Proveedores', icon: '🚚', route: '/backoffice/proveedores', roles: ['Admin', 'Employee'], permission: 'inventory.read' },
      { label: 'Compras', icon: '🛒', route: '/backoffice/compras', roles: ['Admin', 'Employee'], permission: 'inventory.manage' },
      { label: 'Recetas BOM', icon: '📋', route: '/backoffice/recetas', roles: ['Admin', 'Employee'], permission: 'production.read' },
      { label: 'Producción', icon: '⚙️', route: '/backoffice/produccion', roles: ['Admin', 'Employee'], permission: 'production.read' },
      { label: 'Merma', icon: '♻️', route: '/backoffice/merma', roles: ['Admin', 'Employee'], permission: 'production.read' }
    ]
  },
  {
    title: 'Atención y contenido',
    items: [
      { label: 'Soporte', icon: '🎧', route: '/backoffice/soporte', roles: ['Admin', 'Employee'], permission: 'support.read' },
      { label: 'Contacto', icon: '✉️', route: '/backoffice/contacto', roles: ['Admin', 'Employee'], permission: 'support.read' },
      { label: 'Comentarios', icon: '💬', route: '/backoffice/comentarios', roles: ['Admin', 'Employee'], permission: 'support.read' },
      { label: 'Documentación', icon: '📚', route: '/backoffice/documentacion', roles: ['Admin', 'Employee'], permission: 'content.manage' },
      { label: 'Notificaciones', icon: '🔔', route: '/backoffice/notificaciones', roles: ['Admin', 'Employee'] }
    ]
  }
];


