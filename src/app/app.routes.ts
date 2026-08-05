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
import { institutionGuard } from './core/guards/institution.guard';

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
        loadComponent: () =>
          import(
            './features/backoffice/administration/users/users'
          ).then(
            module => module.Users
          )
      },
      {
        path: 'auditoria',
        title: 'VOLTS | Auditoría',
        canActivate: [
          adminGuard
        ],
        loadComponent: () =>
          import(
            './features/backoffice/administration/audit/audit'
          ).then(
            module => module.Audit
          )
      },
      {
        path: 'logs',
        title: 'VOLTS | Logs del sistema',
        canActivate: [
          adminGuard
        ],
        loadComponent: () =>
          import(
            './features/backoffice/administration/system-logs/system-logs'
          ).then(
            module => module.SystemLogs
          )
      },
      {
        path: 'etl',
        title: 'VOLTS | ETL',
        canActivate: [
          adminGuard
        ],
        loadComponent: () =>
          import(
            './features/backoffice/administration/etl/etl'
          ).then(
            module => module.Etl
          )
      },
      {
        path: 'analitica',
        title: 'VOLTS | Analítica',
        canActivate: [
          adminGuard
        ],
        loadComponent: () =>
          import(
            './features/backoffice/administration/analytics/analytics'
          ).then(
            module => module.Analytics
          )
      },


      // =====================================================
      // COMERCIAL
      // =====================================================
      {
        path: 'clientes',
        title: 'VOLTS | Clientes',
        loadComponent: () =>
          import(
            './features/backoffice/commercial/customers/customers'
          ).then(
            module => module.Customers
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
        path: 'planes-paquetes',
        title: 'VOLTS | Planes y paquetes',
        loadComponent: () =>
          import(
            './features/backoffice/commercial/plans-packages/plans-packages'
          ).then(
            module => module.PlansPackages
          )
      },
      {
        path: 'cotizaciones',
        title: 'VOLTS | Cotizaciones',
        loadComponent: () =>
          import(
            './features/backoffice/commercial/quotes/quotes'
          ).then(
            module => module.Quotes
          )
      },
      {
        path: 'pedidos',
        title: 'VOLTS | Pedidos',
        loadComponent: () =>
          import(
            './features/backoffice/commercial/orders/orders'
          ).then(
            module => module.Orders
          )
      },
      {
        path: 'ventas',
        title: 'VOLTS | Ventas',
        loadComponent: () =>
          import(
            './features/backoffice/commercial/sales/sales'
          ).then(
            module => module.Sales
          )
      },
      {
        path: 'licencias',
        title: 'VOLTS | Licencias',
        loadComponent: () =>
          import(
            './features/backoffice/commercial/licenses/licenses'
          ).then(
            module => module.Licenses
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
  path: 'notificaciones',
  title: 'VOLTS | Notificaciones',
  loadComponent: () =>
    import(
      './features/backoffice/support-content/notifications/notifications'
    ).then(
      module => module.Notifications
    )
}
    ]
  },

// =========================================================
// PORTAL DEL CLIENTE
// =========================================================
{
  path: 'cliente',
  canActivate: [
    authGuard,
    clientGuard
  ],
  children: [
    {
      path: '',
      title: 'VOLTS | Mi cuenta',
      loadComponent: () =>
        import(
          './features/client/client-dashboard/client-dashboard'
        ).then(
          module => module.ClientDashboard
        )
    },
    {
      path: 'compras',
      title: 'VOLTS | Mis compras',
      loadComponent: () =>
        import(
          './features/client/client-orders/client-orders'
        ).then(
          module =>
            module.ClientOrders
        )
    },
    {
      path: 'productos',
      title: 'VOLTS | Mis productos',
      loadComponent: () =>
        import(
          './features/client/client-products/client-products'
        ).then(
          module =>
            module.ClientProducts
        )
    },
    {
  path: 'cotizaciones',
  title: 'VOLTS | Mis cotizaciones',
  loadComponent: () =>
    import(
      './features/client/client-quotes/client-quotes'
    ).then(
      module => module.ClientQuotes
    )
    },
    {
      path: 'comentarios',
      title: 'VOLTS | Mis comentarios',
      loadComponent: () =>
        import('./features/client/client-comments/client-comments')
          .then(module => module.ClientComments)
    },
    {
      path: 'licencias',
      title: 'VOLTS | Mis licencias',
      loadComponent: () =>
        import(
          './features/client/client-licenses/client-licenses'
        ).then(
          module =>
            module.ClientLicenses
        )
    },
    {
      path: 'documentacion',
      title: 'VOLTS | Documentación',
      loadComponent: () =>
        import(
          './features/client/client-documentation/client-documentation'
        ).then(
          module =>
            module.ClientDocumentation
        )
    },
    {
      path: 'soporte', title: 'VOLTS | Soporte',
      loadComponent: () => import('./features/shared/portal-support/portal-support').then(module => module.PortalSupport)
    },
    {
      path: 'notificaciones', title: 'VOLTS | Notificaciones',
      loadComponent: () => import('./features/shared/portal-notifications/portal-notifications').then(module => module.PortalNotifications)
    },
    {
  path: 'perfil',
  title: 'VOLTS | Mi perfil',
  loadComponent: () =>
    import(
      './features/client/client-profile/client-profile'
    ).then(
      module =>
        module.ClientProfile
    )
},
    {
      path: '**',
      redirectTo: ''
    }
  ]
},


  // =========================================================
  // PORTAL INSTITUCIONAL
  // =========================================================
  {
    path: 'institucion', canActivate: [authGuard, institutionGuard],
    loadComponent: () => import('./layouts/institution-layout/institution-layout').then(m => m.InstitutionLayout),
    children: [
      { path: '', loadComponent: () => import('./features/institution/dashboard/dashboard').then(m => m.InstitutionDashboard) },
      { path: 'pedidos', loadComponent: () => import('./features/institution/orders/orders').then(m => m.InstitutionOrders) },
      { path: 'licencias', loadComponent: () => import('./features/institution/licenses/licenses').then(m => m.InstitutionLicenses) },
      { path: 'dispositivos', loadComponent: () => import('./features/institution/devices/devices').then(m => m.InstitutionDevices) },
      { path: 'personas', loadComponent: () => import('./features/institution/members/members').then(m => m.InstitutionMembers) },
      { path: 'grupos', loadComponent: () => import('./features/institution/groups/groups').then(m => m.InstitutionGroups) }
      ,{ path: 'recursos', loadComponent: () => import('./features/institution/resources/resources').then(m => m.InstitutionResources) },
      { path: 'soporte', loadComponent: () => import('./features/shared/portal-support/portal-support').then(m => m.PortalSupport) },
      { path: 'notificaciones', loadComponent: () => import('./features/shared/portal-notifications/portal-notifications').then(m => m.PortalNotifications) }
    ]
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


