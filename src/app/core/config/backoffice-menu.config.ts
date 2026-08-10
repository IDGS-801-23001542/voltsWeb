import {
  BackofficeMenuGroup
} from '../models/backoffice-menu.model';

export const BACKOFFICE_MENU: BackofficeMenuGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        label: 'Dashboard',
        icon: 'bi bi-house-door-fill',
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
      {
        label: 'Usuarios',
        icon: 'bi bi-person-fill',
        route: '/backoffice/usuarios',
        roles: ['Admin'],
        permission: 'administration.users.read'
      },
      {
        label: 'Auditoría',
        icon: 'bi bi-search',
        route: '/backoffice/auditoria',
        roles: ['Admin']
      },
      {
        label: 'Logs del sistema',
        icon: 'bi bi-display',
        route: '/backoffice/logs',
        roles: ['Admin']
      },
      {
        label: 'Procesos ETL',
        icon: 'bi bi-arrow-repeat',
        route: '/backoffice/etl',
        roles: ['Admin']
      },
      {
        label: 'Analítica',
        icon: 'bi bi-graph-up-arrow',
        route: '/backoffice/analitica',
        roles: ['Admin'],
        permission: 'analytics.read'
      }
    ]
  },
  {
    title: 'Comercial',
    items: [
      {
        label: 'Clientes',
        icon: 'bi bi-people-fill',
        route: '/backoffice/clientes',
        roles: ['Admin', 'Employee'],
        permission: 'commercial.customers.read'
      },
      {
        label: 'Instituciones',
        icon: 'bi bi-building',
        route: '/backoffice/instituciones',
        roles: ['Admin', 'Employee'],
        permission: 'commercial.customers.read'
      },
      {
        label: 'Planes y paquetes',
        icon: 'bi bi-box2-heart-fill',
        route: '/backoffice/planes-paquetes',
        roles: ['Admin', 'Employee'],
        permission: 'commercial.plans.manage'
      },
      {
        label: 'Cotizaciones',
        icon: 'bi bi-receipt',
        route: '/backoffice/cotizaciones',
        roles: ['Admin', 'Employee'],
        permission: 'commercial.quotes.manage'
      },
      {
        label: 'Pedidos',
        icon: 'bi bi-box-seam-fill',
        route: '/backoffice/pedidos',
        roles: ['Admin', 'Employee'],
        permission: 'commercial.orders.manage'
      },
      {
        label: 'Ventas',
        icon: 'bi bi-cash-coin',
        route: '/backoffice/ventas',
        roles: ['Admin', 'Employee'],
        permission: 'commercial.sales.manage'
      },
      {
        label: 'Licencias',
        icon: 'bi bi-key-fill',
        route: '/backoffice/licencias',
        roles: ['Admin', 'Employee'],
        permission: 'commercial.licenses.manage'
      }
    ]
  },
  {
    title: 'Producción e inventario',
    items: [
      {
        label: 'Productos',
        icon: 'bi bi-box-fill',
        route: '/backoffice/productos',
        roles: ['Admin', 'Employee'],
        permission: 'inventory.read'
      },
      {
        label: 'Categorías',
        icon: 'bi bi-tags-fill',
        route: '/backoffice/categorias',
        roles: ['Admin', 'Employee'],
        permission: 'inventory.read'
      },
      {
        label: 'Materia prima',
        icon: 'bi bi-tools',
        route: '/backoffice/materia-prima',
        roles: ['Admin', 'Employee'],
        permission: 'inventory.read'
      },
      {
        label: 'Proveedores',
        icon: 'bi bi-truck',
        route: '/backoffice/proveedores',
        roles: ['Admin', 'Employee'],
        permission: 'inventory.read'
      },
      {
        label: 'Compras',
        icon: 'bi bi-cart-fill',
        route: '/backoffice/compras',
        roles: ['Admin', 'Employee'],
        permission: 'inventory.manage'
      },
      {
        label: 'Recetas BOM',
        icon: 'bi bi-clipboard2-check-fill',
        route: '/backoffice/recetas',
        roles: ['Admin', 'Employee'],
        permission: 'production.read'
      },
      {
        label: 'Producción',
        icon: 'bi bi-gear-fill',
        route: '/backoffice/produccion',
        roles: ['Admin', 'Employee'],
        permission: 'production.read'
      },
      {
        label: 'Merma',
        icon: 'bi bi-recycle',
        route: '/backoffice/merma',
        roles: ['Admin', 'Employee'],
        permission: 'production.read'
      },

      // NUEVO, pero respetando tu menú original
      {
        label: 'Donaciones',
        icon: 'bi bi-flower1',
        route: '/backoffice/donaciones',
        roles: ['Admin', 'Employee'],
        permission: 'inventory.read'
      }
    ]
  },
  {
    title: 'Atención y contenido',
    items: [
      {
        label: 'Soporte',
        icon: 'bi bi-headset',
        route: '/backoffice/soporte',
        roles: ['Admin', 'Employee'],
        permission: 'support.read'
      },
      {
        label: 'Contacto',
        icon: 'bi bi-envelope-fill',
        route: '/backoffice/contacto',
        roles: ['Admin', 'Employee'],
        permission: 'support.read'
      },
      {
        label: 'Comentarios',
        icon: 'bi bi-chat-dots-fill',
        route: '/backoffice/comentarios',
        roles: ['Admin', 'Employee'],
        permission: 'support.read'
      },
      {
        label: 'Documentación',
        icon: 'bi bi-book-fill',
        route: '/backoffice/documentacion',
        roles: ['Admin', 'Employee'],
        permission: 'content.manage'
      },
      {
        label: 'Notificaciones',
        icon: 'bi bi-bell-fill',
        route: '/backoffice/notificaciones',
        roles: ['Admin', 'Employee']
      }
    ]
  }
];
