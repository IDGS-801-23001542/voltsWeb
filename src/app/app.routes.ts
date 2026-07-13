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
      // =====================================================
      // DASHBOARD
      // =====================================================
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

      // =====================================================
      // ADMINISTRACIÓN
      // Solo Admin
      // =====================================================
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
            './features/backoffice/shared/placeholder/backoffice-placeholder'
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
            './features/backoffice/shared/placeholder/backoffice-placeholder'
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
            './features/backoffice/shared/placeholder/backoffice-placeholder'
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
            './features/backoffice/shared/placeholder/backoffice-placeholder'
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
            './features/backoffice/shared/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },

      // =====================================================
      // COMERCIAL
      // =====================================================
      {
        path: 'clientes',
        title: 'VOLTS | Clientes',
        data: {
          title: 'Clientes',
          description:
            'Administración de clientes individuales e instituciones.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/shared/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },
      {
        path: 'instituciones',
        title: 'VOLTS | Instituciones',
        loadComponent: () =>
          import(
            './features/backoffice/commercial/institutions/institutions'
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
            'Consulta, evaluación y seguimiento de cotizaciones.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/shared/placeholder/backoffice-placeholder'
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
            'Seguimiento de pedidos, inventario reservado y entregas.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/shared/placeholder/backoffice-placeholder'
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
            './features/backoffice/shared/placeholder/backoffice-placeholder'
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
            './features/backoffice/shared/placeholder/backoffice-placeholder'
          ).then(
            module => module.BackofficePlaceholder
          )
      },

      // =====================================================
      // PRODUCCIÓN E INVENTARIO
      // =====================================================
      {
        path: 'productos',
        title: 'VOLTS | Productos',
        loadComponent: () =>
          import(
            './features/backoffice/production-inventory/products/products'
          ).then(
            module => module.Products
          )
      },
      {
        path: 'categorias',
        title: 'VOLTS | Categorías',
        loadComponent: () =>
          import(
            './features/backoffice/production-inventory/categories/categories'
          ).then(
            module => module.Categories
          )
      },
      {
        path: 'materia-prima',
        title: 'VOLTS | Materia prima',
        loadComponent: () =>
          import(
            './features/backoffice/production-inventory/raw-materials/raw-materials'
          ).then(
            module => module.RawMaterials
          )
      },
      {
        path: 'proveedores',
        title: 'VOLTS | Proveedores',
        loadComponent: () =>
          import(
            './features/backoffice/production-inventory/suppliers/suppliers'
          ).then(
            module => module.Suppliers
          )
      },
      {
        path: 'compras',
        title: 'VOLTS | Compras',
        loadComponent: () =>
          import(
            './features/backoffice/production-inventory/purchases/purchases'
          ).then(
            module => module.Purchases
          )
      },
      {
        path: 'recetas',
        title: 'VOLTS | Recetas BOM',
        loadComponent: () =>
          import(
            './features/backoffice/production-inventory/recipes/recipes'
          ).then(
            module => module.Recipes
          )
      },
      {
        path: 'produccion',
        title: 'VOLTS | Producción',
        loadComponent: () =>
          import(
            './features/backoffice/production-inventory/production/production'
          ).then(
            module => module.Production
          )
      },
      {
        path: 'merma',
        title: 'VOLTS | Merma',
        loadComponent: () =>
          import(
            './features/backoffice/production-inventory/waste/waste'
          ).then(
            module => module.WasteManagement
          )
      },

      // =====================================================
      // ATENCIÓN Y CONTENIDO
      // =====================================================
      {
        path: 'soporte',
        title: 'VOLTS | Centro de soporte',
        loadComponent: () =>
          import(
            './features/backoffice/support-content/support/support'
          ).then(
            module => module.Support
          )
      },
      {
        path: 'contacto',
        title: 'VOLTS | Mensajes de contacto',
        loadComponent: () =>
          import(
            './features/backoffice/support-content/contact/contact-messages'
          ).then(
            module => module.ContactMessages
          )
      },
      {
        path: 'comentarios',
        title: 'VOLTS | Comentarios',
        loadComponent: () =>
          import(
            './features/backoffice/support-content/comments/comments'
          ).then(
            module => module.Comments
          )
      },
      {
        path: 'documentacion',
        title: 'VOLTS | Documentación',
        loadComponent: () =>
          import(
            './features/backoffice/support-content/documentation/documentation'
          ).then(
            module =>
              module.DocumentationManagement
          )
      },
       {
        path: 'actualizaciones',
        title: 'VOLTS | Actualizaciones',
        loadComponent: () =>
          import(
            './features/backoffice/support-content/updates/updates'
          ).then(
            module => module.Updates
          )
       },
      {
        path: 'notificaciones',
        title: 'VOLTS | Notificaciones',
        data: {
          title: 'Notificaciones',
          description:
            'Administración de avisos dirigidos a clientes, instituciones y personal.'
        },
        loadComponent: () =>
          import(
            './features/backoffice/shared/placeholder/backoffice-placeholder'
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
