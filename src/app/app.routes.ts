import { Routes } from '@angular/router';

import {
  adminGuard
} from './core/guards/admin.guard';

import {
  authGuard
} from './core/guards/auth.guard';

import {
  backofficeGuard
} from './core/guards/backoffice.guard';

import {
  clientGuard
} from './core/guards/client.guard';

import {
  PublicLayout
} from './layouts/public-layout/public-layout';

export const routes: Routes = [
  // =========================================================
  // SITIO PÚBLICO
  // =========================================================
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        title: 'VOLTS | Inicio',
        loadComponent: () =>
          import(
            './features/public/home/home'
          ).then(
            module => module.Home
          )
      },
      {
        path: 'aprendizaje',
        title: 'VOLTS | Aprendizaje',
        loadComponent: () =>
          import(
            './features/public/learning/learning'
          ).then(
            module => module.Learning
          )
      },
      {
        path: 'cotizacion',
        title: 'VOLTS | Cotización',
        loadComponent: () =>
          import(
            './features/public/quote/quote'
          ).then(
            module => module.Quote
          )
      },
      {
        path: 'faq',
        title: 'VOLTS | Preguntas frecuentes',
        loadComponent: () =>
          import(
            './features/public/faq/faq'
          ).then(
            module => module.Faq
          )
      },
      {
        path: 'contacto',
        title: 'VOLTS | Contacto',
        loadComponent: () =>
          import(
            './features/public/contact/contact'
          ).then(
            module => module.Contact
          )
      }
    ]
  },

  // =========================================================
  // AUTENTICACIÓN
  // =========================================================
  {
    path: 'login',
    title: 'VOLTS | Iniciar sesión',
    loadComponent: () =>
      import(
        './features/auth/login/login'
      ).then(
        module => module.Login
      )
  },
  {
    path: 'crear-cuenta',
    title: 'VOLTS | Crear cuenta',
    loadComponent: () =>
      import(
        './features/auth/register/register'
      ).then(
        module => module.Register
      )
  },

  // =========================================================
  // BACKOFFICE COMPARTIDO
  // Admin y Employee usan el mismo layout.
  // =========================================================
  {
    path: 'backoffice',
    canActivate: [
      authGuard,
      backofficeGuard
    ],
    loadComponent: () =>
      import(
        './layouts/backoffice-layout/backoffice-layout'
      ).then(
        module => module.BackofficeLayout
      ),
    children: [
      // -------------------------------------------------------
      // DASHBOARD
      // -------------------------------------------------------
      {
        path: '',
        title: 'VOLTS | Dashboard',
        loadComponent: () =>
          import(
            './features/backoffice/dashboard/backoffice-dashboard'
          ).then(
            module => module.BackofficeDashboard
          )
      },

      // -------------------------------------------------------
      // COMERCIAL
      // -------------------------------------------------------
      {
        path: 'clientes',
        title: 'VOLTS | Clientes',
        data: {
          title: 'Clientes',
          description:
            'Administración de clientes individuales del ecosistema VOLTS.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'instituciones',
        title: 'VOLTS | Instituciones',
        loadComponent: () =>
          import(
            './features/backoffice/institutions/institutions'
          ).then(
            module => module.Institutions
          )
      },
      {
        path: 'cotizaciones',
        title: 'VOLTS | Cotizaciones',
        data: {
          title: 'Cotizaciones',
          description:
            'Consulta y seguimiento de solicitudes comerciales.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'pedidos',
        title: 'VOLTS | Pedidos',
        data: {
          title: 'Pedidos',
          description:
            'Seguimiento de pedidos y estados de entrega.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'ventas',
        title: 'VOLTS | Ventas',
        data: {
          title: 'Ventas',
          description:
            'Administración de ventas e ingresos del ecosistema.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'licencias',
        title: 'VOLTS | Licencias',
        data: {
          title: 'Licencias',
          description:
            'Gestión de licencias asociadas a productos VOLTS.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },

      // -------------------------------------------------------
      // PRODUCCIÓN E INVENTARIO
      // -------------------------------------------------------
      {
        path: 'productos',
        title: 'VOLTS | Productos',
        loadComponent: () =>
          import(
            './features/backoffice/products/products'
          ).then(
            module => module.Products
          )
      },
      {
        path: 'categorias',
        title: 'VOLTS | Categorías',
        loadComponent: () =>
          import(
            './features/backoffice/categories/categories'
          ).then(
            module => module.Categories
          )
      },
      {
        path: 'materia-prima',
        title: 'VOLTS | Materia prima',
        loadComponent: () =>
          import(
            './features/backoffice/raw-materials/raw-materials'
          ).then(
            module => module.RawMaterials
          )
      },
      {
        path: 'proveedores',
        title: 'VOLTS | Proveedores',
        loadComponent: () =>
          import(
            './features/backoffice/suppliers/suppliers'
          ).then(
            module => module.Suppliers
          )
      },
      {
        path: 'compras',
        title: 'VOLTS | Compras',
        loadComponent: () =>
          import(
            './features/backoffice/purchases/purchases'
          ).then(
            module => module.Purchases
          )
      },
      {
        path: 'recetas',
        title: 'VOLTS | Recetas BOM',
        loadComponent: () =>
          import(
            './features/backoffice/recipes/recipes'
          ).then(
            module => module.Recipes
          )
      },
      {
        path: 'produccion',
        title: 'VOLTS | Producción',
        loadComponent: () =>
          import(
            './features/backoffice/production/production'
          ).then(
            module => module.Production
          )
      },
      {
      path: 'merma',
      title: 'VOLTS | Merma',
      loadComponent: () =>
        import(
          './features/backoffice/waste/waste'
        ).then(
          module => module.WasteManagement
        )
     },

      // -------------------------------------------------------
      // ATENCIÓN Y CONTENIDO
      // -------------------------------------------------------
      {
        path: 'soporte',
        title: 'VOLTS | Soporte',
        data: {
          title: 'Centro de soporte',
          description:
            'Atención y seguimiento de tickets de clientes.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'contacto',
        title: 'VOLTS | Mensajes',
        data: {
          title: 'Mensajes de contacto',
          description:
            'Consulta de mensajes enviados desde el sitio público.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'comentarios',
        title: 'VOLTS | Comentarios',
        data: {
          title: 'Comentarios',
          description:
            'Administración de comentarios y retroalimentación.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'documentacion',
        title: 'VOLTS | Documentación',
        data: {
          title: 'Documentación',
          description:
            'Gestión de manuales, archivos y recursos educativos.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'actualizaciones',
        title: 'VOLTS | Actualizaciones',
        data: {
          title: 'Actualizaciones',
          description:
            'Noticias y versiones del ecosistema VOLTS.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'notificaciones',
        title: 'VOLTS | Notificaciones',
        data: {
          title: 'Notificaciones',
          description:
            'Administración de avisos para clientes y personal.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },

      // -------------------------------------------------------
      // ADMINISTRACIÓN: SOLO ADMIN
      // -------------------------------------------------------
      {
        path: 'usuarios',
        title: 'VOLTS | Usuarios',
        canActivate: [
          adminGuard
        ],
        data: {
          title: 'Usuarios',
          description:
            'Administración de cuentas, roles y estados de acceso.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'roles',
        title: 'VOLTS | Roles',
        canActivate: [
          adminGuard
        ],
        data: {
          title: 'Roles y permisos',
          description:
            'Configuración de roles y privilegios del sistema.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'auditoria',
        title: 'VOLTS | Auditoría',
        canActivate: [
          adminGuard
        ],
        data: {
          title: 'Auditoría',
          description:
            'Consulta del historial de operaciones administrativas.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'logs',
        title: 'VOLTS | Logs',
        canActivate: [
          adminGuard
        ],
        data: {
          title: 'Logs del sistema',
          description:
            'Consulta técnica de eventos y errores registrados.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'etl',
        title: 'VOLTS | ETL',
        canActivate: [
          adminGuard
        ],
        data: {
          title: 'Procesos ETL',
          description:
            'Supervisión de extracción y transformación de datos.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      }
    ]
  },

  // =========================================================
  // PORTAL DEL CLIENTE
  // =========================================================
  {
    path: 'cliente',
    title: 'VOLTS | Mi portal',
    canActivate: [
      authGuard,
      clientGuard
    ],
    loadComponent: () =>
      import(
        './features/client/client-dashboard'
      ).then(
        module => module.ClientDashboard
      )
  },

  // =========================================================
  // REDIRECCIONES DE COMPATIBILIDAD
  // =========================================================
  {
    path: 'admin',
    redirectTo: 'backoffice',
    pathMatch: 'full'
  },
  {
    path: 'empleado',
    redirectTo: 'backoffice',
    pathMatch: 'full'
  },

  // =========================================================
  // RUTA NO ENCONTRADA
  // =========================================================
  {
    path: '**',
    redirectTo: ''
  }
];
