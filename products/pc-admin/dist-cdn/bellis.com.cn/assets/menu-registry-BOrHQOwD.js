const app$a = {
  id: "admin",
  basePath: "/admin",
  nameKey: "menu.access"
};
const routes$a = [
  {
    path: "/",
    labelKey: "menu.home",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  },
  {
    path: "/platform/domains",
    labelKey: "menu.platform.domains",
    tab: {
      enabled: true,
      labelKey: "menu.platform.domains"
    },
    breadcrumbs: [
      {
        labelKey: "menu.platform",
        icon: "Setting"
      },
      {
        labelKey: "menu.platform.domains",
        icon: "Grid"
      }
    ]
  },
  {
    path: "/platform/modules",
    labelKey: "menu.platform.modules",
    tab: {
      enabled: true,
      labelKey: "menu.platform.modules"
    },
    breadcrumbs: [
      {
        labelKey: "menu.platform",
        icon: "Setting"
      },
      {
        labelKey: "menu.platform.modules",
        icon: "Box"
      }
    ]
  },
  {
    path: "/platform/plugins",
    labelKey: "menu.platform.plugins",
    tab: {
      enabled: true,
      labelKey: "menu.platform.plugins"
    },
    breadcrumbs: [
      {
        labelKey: "menu.platform",
        icon: "Setting"
      },
      {
        labelKey: "menu.platform.plugins",
        icon: "Tools"
      }
    ]
  },
  {
    path: "/org/tenants",
    labelKey: "menu.org.tenants",
    tab: {
      enabled: true,
      labelKey: "menu.org.tenants"
    },
    breadcrumbs: [
      {
        labelKey: "menu.org",
        icon: "OfficeBuilding"
      },
      {
        labelKey: "menu.org.tenants",
        icon: "House"
      }
    ]
  },
  {
    path: "/org/departments",
    labelKey: "menu.org.departments",
    tab: {
      enabled: true,
      labelKey: "menu.org.departments"
    },
    breadcrumbs: [
      {
        labelKey: "menu.org",
        icon: "OfficeBuilding"
      },
      {
        labelKey: "menu.org.departments",
        icon: "FolderOpened"
      }
    ]
  },
  {
    path: "/org/users",
    labelKey: "menu.org.users",
    tab: {
      enabled: true,
      labelKey: "menu.org.users"
    },
    breadcrumbs: [
      {
        labelKey: "menu.org",
        icon: "OfficeBuilding"
      },
      {
        labelKey: "menu.org.users",
        icon: "User"
      }
    ]
  },
  {
    path: "/org/departments/:id/roles",
    labelKey: "menu.org.dept_role_bind",
    tab: {
      enabled: true,
      labelKey: "menu.org.dept_role_bind"
    },
    breadcrumbs: [
      {
        labelKey: "menu.org",
        icon: "OfficeBuilding"
      },
      {
        labelKey: "menu.org.departments",
        icon: "FolderOpened"
      },
      {
        labelKey: "menu.org.dept_role_bind",
        icon: "Key"
      }
    ]
  },
  {
    path: "/org/users/users-roles",
    labelKey: "menu.access.user_role_bind",
    tab: {
      enabled: true,
      labelKey: "menu.access.user_role_bind"
    },
    breadcrumbs: [
      {
        labelKey: "menu.access",
        icon: "Lock"
      },
      {
        labelKey: "menu.access.relations",
        icon: "Connection"
      },
      {
        labelKey: "menu.access.user_assign",
        icon: "User"
      },
      {
        labelKey: "menu.access.user_role_bind",
        icon: "Key"
      }
    ]
  },
  {
    path: "/access/resources",
    labelKey: "menu.access.resources",
    tab: {
      enabled: true,
      labelKey: "menu.access.resources"
    },
    breadcrumbs: [
      {
        labelKey: "menu.access",
        icon: "Lock"
      },
      {
        labelKey: "menu.access.config",
        icon: "Setting"
      },
      {
        labelKey: "menu.access.resources",
        icon: "Files"
      }
    ]
  },
  {
    path: "/access/actions",
    labelKey: "menu.access.actions",
    tab: {
      enabled: true,
      labelKey: "menu.access.actions"
    },
    breadcrumbs: [
      {
        labelKey: "menu.access",
        icon: "Lock"
      },
      {
        labelKey: "menu.access.config",
        icon: "Setting"
      },
      {
        labelKey: "menu.access.actions",
        icon: "Operation"
      }
    ]
  },
  {
    path: "/access/permissions",
    labelKey: "menu.access.permissions",
    tab: {
      enabled: true,
      labelKey: "menu.access.permissions"
    },
    breadcrumbs: [
      {
        labelKey: "menu.access",
        icon: "Lock"
      },
      {
        labelKey: "menu.access.config",
        icon: "Setting"
      },
      {
        labelKey: "menu.access.permissions",
        icon: "Key"
      }
    ]
  },
  {
    path: "/access/roles",
    labelKey: "menu.access.roles",
    tab: {
      enabled: true,
      labelKey: "menu.access.roles"
    },
    breadcrumbs: [
      {
        labelKey: "menu.access",
        icon: "Lock"
      },
      {
        labelKey: "menu.access.config",
        icon: "Setting"
      },
      {
        labelKey: "menu.access.roles",
        icon: "UserFilled"
      }
    ]
  },
  {
    path: "/access/roles/:id/permissions",
    labelKey: "menu.access.role_perm_bind",
    tab: {
      enabled: true,
      labelKey: "menu.access.role_perm_bind"
    },
    breadcrumbs: [
      {
        labelKey: "menu.access",
        icon: "Lock"
      },
      {
        labelKey: "menu.access.config",
        icon: "Setting"
      },
      {
        labelKey: "menu.access.roles",
        icon: "UserFilled"
      },
      {
        labelKey: "menu.access.role_perm_bind",
        icon: "Key"
      }
    ]
  },
  {
    path: "/access/perm-compose",
    labelKey: "menu.access.perm_compose",
    tab: {
      enabled: true,
      labelKey: "menu.access.perm_compose"
    },
    breadcrumbs: [
      {
        labelKey: "menu.access",
        icon: "Lock"
      },
      {
        labelKey: "menu.access.relations",
        icon: "Connection"
      },
      {
        labelKey: "menu.access.perm_compose",
        icon: "Collection"
      }
    ]
  },
  {
    path: "/access/role-permission-bind",
    labelKey: "menu.access.role_permission_bind",
    tab: {
      enabled: true,
      labelKey: "menu.access.role_permission_bind"
    },
    breadcrumbs: [
      {
        labelKey: "menu.access",
        icon: "Lock"
      },
      {
        labelKey: "menu.access.relations",
        icon: "Connection"
      },
      {
        labelKey: "menu.access.role_assign",
        icon: "User"
      },
      {
        labelKey: "menu.access.role_permission_bind",
        icon: "Key"
      }
    ]
  },
  {
    path: "/navigation/menus",
    labelKey: "menu.navigation.menus",
    tab: {
      enabled: true,
      labelKey: "menu.navigation.menus"
    },
    breadcrumbs: [
      {
        labelKey: "menu.navigation",
        icon: "Menu"
      },
      {
        labelKey: "menu.navigation.menus",
        icon: "List"
      }
    ]
  },
  {
    path: "/navigation/menus/:id/permissions",
    labelKey: "menu.navigation.menu_perm_bind",
    tab: {
      enabled: true,
      labelKey: "menu.navigation.menu_perm_bind"
    },
    breadcrumbs: [
      {
        labelKey: "menu.navigation",
        icon: "Menu"
      },
      {
        labelKey: "menu.navigation.menus",
        icon: "List"
      },
      {
        labelKey: "menu.navigation.menu_perm_bind",
        icon: "Key"
      }
    ]
  },
  {
    path: "/navigation/menus/preview",
    labelKey: "menu.navigation.menu_preview",
    tab: {
      enabled: true,
      labelKey: "menu.navigation.menu_preview"
    },
    breadcrumbs: [
      {
        labelKey: "menu.navigation",
        icon: "Menu"
      },
      {
        labelKey: "menu.navigation.menu_preview",
        icon: "View"
      }
    ]
  },
  {
    path: "/ops/logs/operation",
    labelKey: "menu.ops.operation_log",
    tab: {
      enabled: true,
      labelKey: "menu.ops.operation_log"
    },
    breadcrumbs: [
      {
        labelKey: "menu.ops",
        icon: "Monitor"
      },
      {
        labelKey: "menu.ops.logs",
        icon: "Document"
      },
      {
        labelKey: "menu.ops.operation_log",
        icon: "List"
      }
    ]
  },
  {
    path: "/ops/logs/request",
    labelKey: "menu.ops.request_log",
    tab: {
      enabled: true,
      labelKey: "menu.ops.request_log"
    },
    breadcrumbs: [
      {
        labelKey: "menu.ops",
        icon: "Monitor"
      },
      {
        labelKey: "menu.ops.logs",
        icon: "Document"
      },
      {
        labelKey: "menu.ops.request_log",
        icon: "List"
      }
    ]
  },
  {
    path: "/ops/api-list",
    labelKey: "menu.ops.api_list",
    tab: {
      enabled: true,
      labelKey: "menu.ops.api_list"
    },
    breadcrumbs: [
      {
        labelKey: "menu.ops",
        icon: "Monitor"
      },
      {
        labelKey: "menu.ops.api_list",
        icon: "Document"
      }
    ]
  },
  {
    path: "/ops/baseline",
    labelKey: "menu.ops.baseline",
    tab: {
      enabled: true,
      labelKey: "menu.ops.baseline"
    },
    breadcrumbs: [
      {
        labelKey: "menu.ops",
        icon: "Monitor"
      },
      {
        labelKey: "menu.ops.baseline",
        icon: "Check"
      }
    ]
  },
  {
    path: "/ops/simulator",
    labelKey: "menu.ops.simulator",
    tab: {
      enabled: true,
      labelKey: "menu.ops.simulator"
    },
    breadcrumbs: [
      {
        labelKey: "menu.ops",
        icon: "Monitor"
      },
      {
        labelKey: "menu.ops.simulator",
        icon: "Cpu"
      }
    ]
  },
  {
    path: "/strategy/management",
    labelKey: "menu.strategy.management",
    tab: {
      enabled: true,
      labelKey: "menu.strategy.management"
    },
    breadcrumbs: [
      {
        labelKey: "menu.strategy",
        icon: "TrendCharts"
      },
      {
        labelKey: "menu.strategy.management",
        icon: "Setting"
      }
    ]
  },
  {
    path: "/strategy/designer",
    labelKey: "menu.strategy.designer",
    tab: {
      enabled: true,
      labelKey: "menu.strategy.designer"
    },
    breadcrumbs: [
      {
        labelKey: "menu.strategy",
        icon: "TrendCharts"
      },
      {
        labelKey: "menu.strategy.designer",
        icon: "Edit"
      }
    ]
  },
  {
    path: "/strategy/monitor",
    labelKey: "menu.strategy.monitor",
    tab: {
      enabled: true,
      labelKey: "menu.strategy.monitor"
    },
    breadcrumbs: [
      {
        labelKey: "menu.strategy",
        icon: "TrendCharts"
      },
      {
        labelKey: "menu.strategy.monitor",
        icon: "Monitor"
      }
    ]
  },
  {
    path: "/governance/files/templates",
    labelKey: "menu.data.files.templates",
    tab: {
      enabled: true,
      labelKey: "menu.data.files.templates"
    },
    breadcrumbs: [
      {
        labelKey: "menu.governance",
        icon: "Files"
      },
      {
        labelKey: "menu.data.files",
        icon: "Document"
      },
      {
        labelKey: "menu.data.files.templates",
        icon: "Files"
      }
    ]
  },
  {
    path: "/governance/dictionary/fields",
    labelKey: "menu.data.dictionary.fields",
    tab: {
      enabled: true,
      labelKey: "menu.data.dictionary.fields"
    },
    breadcrumbs: [
      {
        labelKey: "menu.governance",
        icon: "Setting"
      },
      {
        labelKey: "menu.data.dictionary",
        icon: "Collection"
      },
      {
        labelKey: "menu.data.dictionary.fields",
        icon: "Document"
      }
    ]
  },
  {
    path: "/governance/dictionary/values",
    labelKey: "menu.data.dictionary.values",
    tab: {
      enabled: true,
      labelKey: "menu.data.dictionary.values"
    },
    breadcrumbs: [
      {
        labelKey: "menu.governance",
        icon: "Setting"
      },
      {
        labelKey: "menu.data.dictionary",
        icon: "Collection"
      },
      {
        labelKey: "menu.data.dictionary.values",
        icon: "List"
      }
    ]
  },
  {
    path: "/test/components",
    labelKey: "menu.test_features.components",
    tab: {
      enabled: true,
      labelKey: "menu.test_features.components"
    },
    breadcrumbs: [
      {
        labelKey: "menu.test_features",
        icon: "Tools"
      },
      {
        labelKey: "menu.test_features.components",
        icon: "Grid"
      }
    ]
  },
  {
    path: "/test/api-test-center",
    labelKey: "menu.test_features.api_test_center",
    tab: {
      enabled: true,
      labelKey: "menu.test_features.api_test_center"
    },
    breadcrumbs: [
      {
        labelKey: "menu.test_features",
        icon: "Tools"
      },
      {
        labelKey: "menu.test_features.api_test_center",
        icon: "Document"
      }
    ]
  },
  {
    path: "/test/inventory-ticket-print",
    labelKey: "menu.test_features.inventory_ticket_print",
    tab: {
      enabled: true,
      labelKey: "menu.test_features.inventory_ticket_print"
    },
    breadcrumbs: [
      {
        labelKey: "menu.test_features",
        icon: "Tools"
      },
      {
        labelKey: "menu.test_features.inventory_ticket_print",
        icon: "Printer"
      }
    ]
  }
];
const menus$a = [
  {
    index: "platform",
    labelKey: "menu.platform",
    children: [
      {
        index: "/platform/domains",
        labelKey: "menu.platform.domains"
      },
      {
        index: "/platform/modules",
        labelKey: "menu.platform.modules"
      },
      {
        index: "/platform/plugins",
        labelKey: "menu.platform.plugins"
      }
    ]
  },
  {
    index: "org",
    labelKey: "menu.org",
    children: [
      {
        index: "/org/tenants",
        labelKey: "menu.org.tenants"
      },
      {
        index: "/org/departments",
        labelKey: "menu.org.departments"
      },
      {
        index: "/org/users",
        labelKey: "menu.org.users"
      }
    ]
  },
  {
    index: "access",
    labelKey: "menu.access",
    children: [
      {
        index: "access-config",
        labelKey: "menu.access.config",
        children: [
          {
            index: "/access/resources",
            labelKey: "menu.access.resources"
          },
          {
            index: "/access/actions",
            labelKey: "menu.access.actions"
          },
          {
            index: "/access/permissions",
            labelKey: "menu.access.permissions"
          },
          {
            index: "/access/roles",
            labelKey: "menu.access.roles"
          }
        ]
      },
      {
        index: "access-relations",
        labelKey: "menu.access.relations",
        children: [
          {
            index: "/access/perm-compose",
            labelKey: "menu.access.perm_compose"
          },
          {
            index: "access-user",
            labelKey: "menu.access.user_assign",
            children: [
              {
                index: "/org/users/users-roles",
                labelKey: "menu.access.user_role_bind"
              }
            ]
          },
          {
            index: "access-role-assign",
            labelKey: "menu.access.role_assign",
            children: [
              {
                index: "/access/role-permission-bind",
                labelKey: "menu.access.role_permission_bind"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    index: "navigation",
    labelKey: "menu.navigation",
    children: [
      {
        index: "/navigation/menus",
        labelKey: "menu.navigation.menus"
      },
      {
        index: "/navigation/menus/preview",
        labelKey: "menu.navigation.menu_preview"
      }
    ]
  },
  {
    index: "ops",
    labelKey: "menu.ops",
    children: [
      {
        index: "logs",
        labelKey: "menu.ops.logs",
        children: [
          {
            index: "/ops/logs/operation",
            labelKey: "menu.ops.operation_log"
          },
          {
            index: "/ops/logs/request",
            labelKey: "menu.ops.request_log"
          }
        ]
      },
      {
        index: "/ops/api-list",
        labelKey: "menu.ops.api_list"
      },
      {
        index: "/ops/baseline",
        labelKey: "menu.ops.baseline"
      },
      {
        index: "/ops/simulator",
        labelKey: "menu.ops.simulator"
      }
    ]
  },
  {
    index: "strategy",
    labelKey: "menu.strategy",
    children: [
      {
        index: "/strategy/management",
        labelKey: "menu.strategy.management"
      },
      {
        index: "/strategy/designer",
        labelKey: "menu.strategy.designer"
      },
      {
        index: "/strategy/monitor",
        labelKey: "menu.strategy.monitor"
      }
    ]
  },
  {
    index: "governance",
    labelKey: "menu.governance",
    children: [
      {
        index: "governance-files",
        labelKey: "menu.data.files",
        children: [
          {
            index: "/governance/files/templates",
            labelKey: "menu.data.files.templates"
          }
        ]
      },
      {
        index: "governance-dictionary",
        labelKey: "menu.data.dictionary",
        children: [
          {
            index: "/governance/dictionary/fields",
            labelKey: "menu.data.dictionary.fields"
          },
          {
            index: "/governance/dictionary/values",
            labelKey: "menu.data.dictionary.values"
          }
        ]
      }
    ]
  },
  {
    index: "test-features",
    labelKey: "menu.test_features",
    children: [
      {
        index: "/test/components",
        labelKey: "menu.test_features.components"
      },
      {
        index: "/test/api-test-center",
        labelKey: "menu.test_features.api_test_center"
      },
      {
        index: "/test/inventory-ticket-print",
        labelKey: "menu.test_features.inventory_ticket_print"
      }
    ]
  }
];
var adminManifestJson = {
  app: app$a,
  routes: routes$a,
  menus: menus$a
};
const app$9 = {
  id: "logistics",
  basePath: "/logistics",
  nameKey: "menu.logistics.overview"
};
const routes$9 = [
  {
    path: "/",
    labelKey: "menu.logistics.overview",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  },
  {
    path: "/procurement",
    labelKey: "menu.logistics.procurementModule",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.procurementModule"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.procurementModule",
        icon: "ShoppingCart"
      }
    ]
  },
  {
    path: "/procurement/auxiliary",
    labelKey: "menu.logistics.procurement.auxiliary",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.procurement.auxiliary"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.procurementModule",
        icon: "ShoppingCart"
      },
      {
        labelKey: "menu.logistics.procurement.auxiliary",
        icon: "Collection"
      }
    ]
  },
  {
    path: "/procurement/packaging",
    labelKey: "menu.logistics.procurement.packaging",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.procurement.packaging"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.procurementModule",
        icon: "ShoppingCart"
      },
      {
        labelKey: "menu.logistics.procurement.packaging",
        icon: "CollectionTag"
      }
    ]
  },
  {
    path: "/procurement/supplier",
    labelKey: "menu.logistics.procurement.supplier",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.procurement.supplier"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.procurementModule",
        icon: "ShoppingCart"
      },
      {
        labelKey: "menu.logistics.procurement.supplier",
        icon: "User"
      }
    ]
  },
  {
    path: "/warehouse",
    labelKey: "menu.logistics.warehouseModule",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.warehouseModule"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.warehouseModule",
        icon: "FolderOpened"
      }
    ]
  },
  {
    path: "/warehouse/material",
    labelKey: "menu.logistics.warehouse.material",
    tab: {
      enabled: false
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.warehouseModule",
        icon: "FolderOpened"
      },
      {
        labelKey: "menu.logistics.warehouse.material",
        icon: "Files"
      }
    ]
  },
  {
    path: "/warehouse/material/list",
    labelKey: "menu.logistics.warehouse.material.list",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.warehouse.material.list"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.warehouseModule",
        icon: "FolderOpened"
      },
      {
        labelKey: "menu.logistics.warehouse.material",
        icon: "Files"
      },
      {
        labelKey: "menu.logistics.warehouse.material.list",
        icon: "List"
      }
    ]
  },
  {
    path: "/customs",
    labelKey: "menu.logistics.customsModule",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.customsModule"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.customsModule",
        icon: "MapLocation"
      }
    ]
  },
  {
    path: "/inventory",
    labelKey: "menu.logistics.inventoryManagement",
    tab: {
      enabled: false
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.inventoryManagement",
        icon: "Odometer"
      }
    ]
  },
  {
    path: "/inventory/storage-location",
    labelKey: "menu.logistics.inventoryManagement.storageLocation",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.inventoryManagement.storageLocation"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.inventoryManagement",
        icon: "Odometer"
      },
      {
        labelKey: "menu.logistics.inventoryManagement.storageLocation",
        icon: "Location"
      }
    ]
  },
  {
    path: "/inventory/info",
    labelKey: "menu.logistics.inventoryManagement.info",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.inventoryManagement.info"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.inventoryManagement",
        icon: "Odometer"
      },
      {
        labelKey: "menu.logistics.inventoryManagement.info",
        icon: "Document"
      }
    ]
  },
  {
    path: "/inventory/detail",
    labelKey: "menu.logistics.inventoryManagement.detail",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.inventoryManagement.detail"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.inventoryManagement",
        icon: "Odometer"
      },
      {
        labelKey: "menu.logistics.inventoryManagement.detail",
        icon: "Histogram"
      }
    ]
  },
  {
    path: "/inventory/result",
    labelKey: "menu.logistics.inventoryManagement.result",
    tab: {
      enabled: true,
      labelKey: "menu.logistics.inventoryManagement.result"
    },
    breadcrumbs: [
      {
        labelKey: "menu.logistics.inventoryManagement",
        icon: "Odometer"
      },
      {
        labelKey: "menu.logistics.inventoryManagement.result",
        icon: "List"
      }
    ]
  }
];
const menus$9 = [
  {
    index: "/procurement",
    labelKey: "menu.logistics.procurementModule",
    icon: "svg:cart",
    children: [
      {
        index: "/procurement/auxiliary",
        labelKey: "menu.logistics.procurement.auxiliary"
      },
      {
        index: "/procurement/packaging",
        labelKey: "menu.logistics.procurement.packaging"
      },
      {
        index: "/procurement/supplier",
        labelKey: "menu.logistics.procurement.supplier"
      }
    ]
  },
  {
    index: "/warehouse",
    labelKey: "menu.logistics.warehouseModule",
    icon: "svg:folder",
    children: [
      {
        index: "/warehouse/material/list",
        labelKey: "menu.logistics.warehouse.material"
      }
    ]
  },
  {
    index: "/customs",
    labelKey: "menu.logistics.customsModule",
    icon: "svg:map"
  },
  {
    index: "/inventory",
    labelKey: "menu.logistics.inventoryManagement",
    icon: "Setting",
    children: [
      {
        index: "/inventory/storage-location",
        labelKey: "menu.logistics.inventoryManagement.storageLocation"
      },
      {
        index: "/inventory/info",
        labelKey: "menu.logistics.inventoryManagement.info"
      },
      {
        index: "/inventory/detail",
        labelKey: "menu.logistics.inventoryManagement.detail"
      },
      {
        index: "/inventory/result",
        labelKey: "menu.logistics.inventoryManagement.result"
      }
    ]
  }
];
var logisticsManifestJson = {
  app: app$9,
  routes: routes$9,
  menus: menus$9
};
const app$8 = {
  id: "system",
  basePath: "/",
  nameKey: "menu.system.home"
};
const routes$8 = [
  {
    path: "/",
    labelKey: "menu.system.home",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  },
  {
    path: "/data/files/list",
    labelKey: "menu.data.files.list",
    tab: {
      enabled: true,
      labelKey: "menu.data.files.list"
    },
    breadcrumbs: [
      {
        labelKey: "menu.data",
        icon: "Folder"
      },
      {
        labelKey: "menu.data.files",
        icon: "Document"
      },
      {
        labelKey: "menu.data.files.list",
        icon: "List"
      }
    ]
  },
  {
    path: "/data/files/template",
    labelKey: "menu.data.files.template",
    tab: {
      enabled: true,
      labelKey: "menu.data.files.template"
    },
    breadcrumbs: [
      {
        labelKey: "menu.data",
        icon: "Folder"
      },
      {
        labelKey: "menu.data.files",
        icon: "Document"
      },
      {
        labelKey: "menu.data.files.template",
        icon: "Files"
      }
    ]
  },
  {
    path: "/data/files/preview",
    labelKey: "menu.data.files.preview",
    tab: {
      enabled: true,
      labelKey: "menu.data.files.preview"
    },
    breadcrumbs: [
      {
        labelKey: "menu.data",
        icon: "Folder"
      },
      {
        labelKey: "menu.data.files",
        icon: "Document"
      },
      {
        labelKey: "menu.data.files.preview",
        icon: "View"
      }
    ]
  },
  {
    path: "/inventory/dataSource/bom",
    labelKey: "menu.inventory.dataSource.bom",
    tab: {
      enabled: true,
      labelKey: "menu.inventory.dataSource.bom"
    },
    breadcrumbs: [
      {
        labelKey: "menu.inventory",
        icon: "Odometer"
      },
      {
        labelKey: "menu.inventory.dataSource",
        icon: "Files"
      },
      {
        labelKey: "menu.inventory.dataSource.bom",
        icon: "List"
      }
    ]
  },
  {
    path: "/inventory/dataSource/list",
    labelKey: "menu.inventory.dataSource.list",
    tab: {
      enabled: true,
      labelKey: "menu.inventory.dataSource.list"
    },
    breadcrumbs: [
      {
        labelKey: "menu.inventory",
        icon: "Odometer"
      },
      {
        labelKey: "menu.inventory.dataSource",
        icon: "Files"
      },
      {
        labelKey: "menu.inventory.dataSource.list",
        icon: "List"
      }
    ]
  },
  {
    path: "/inventory/dataSource/ticket",
    labelKey: "menu.inventory.dataSource.ticket",
    tab: {
      enabled: true,
      labelKey: "menu.inventory.dataSource.ticket"
    },
    breadcrumbs: [
      {
        labelKey: "menu.inventory",
        icon: "Odometer"
      },
      {
        labelKey: "menu.inventory.dataSource",
        icon: "Files"
      },
      {
        labelKey: "menu.inventory.dataSource.ticket",
        icon: "Tickets"
      }
    ]
  },
  {
    path: "/inventory/process",
    labelKey: "menu.inventory.process",
    tab: {
      enabled: true,
      labelKey: "menu.inventory.process"
    },
    breadcrumbs: [
      {
        labelKey: "menu.inventory",
        icon: "Odometer"
      },
      {
        labelKey: "menu.inventory.process",
        icon: "Operation"
      }
    ]
  },
  {
    path: "/inventory/check",
    labelKey: "menu.inventory.result",
    tab: {
      enabled: true,
      labelKey: "menu.inventory.result"
    },
    breadcrumbs: [
      {
        labelKey: "menu.inventory",
        icon: "Odometer"
      },
      {
        labelKey: "menu.inventory.result",
        icon: "List"
      }
    ]
  },
  {
    path: "/inventory/confirm",
    labelKey: "menu.inventory.confirm",
    tab: {
      enabled: true,
      labelKey: "menu.inventory.confirm"
    },
    breadcrumbs: [
      {
        labelKey: "menu.inventory",
        icon: "Odometer"
      },
      {
        labelKey: "menu.inventory.confirm",
        icon: "Check"
      }
    ]
  },
  {
    path: "/data/dictionary/file-categories",
    labelKey: "menu.data.dictionary.file_categories",
    tab: {
      enabled: true,
      labelKey: "menu.data.dictionary.file_categories"
    },
    breadcrumbs: [
      {
        labelKey: "menu.data",
        icon: "Folder"
      },
      {
        labelKey: "menu.data.dictionary",
        icon: "Collection"
      },
      {
        labelKey: "menu.data.dictionary.file_categories",
        icon: "FolderOpened"
      }
    ]
  },
  {
    path: "/data/recycle",
    labelKey: "menu.data.recycle",
    tab: {
      enabled: true,
      labelKey: "menu.data.recycle"
    },
    breadcrumbs: [
      {
        labelKey: "menu.data",
        icon: "Folder"
      },
      {
        labelKey: "menu.data.recycle",
        icon: "Delete"
      }
    ]
  }
];
const menus$8 = [
  {
    index: "data",
    labelKey: "menu.data",
    children: [
      {
        index: "data-files",
        labelKey: "menu.data.files",
        children: [
          {
            index: "/data/files/list",
            labelKey: "menu.data.files.list"
          },
          {
            index: "/data/files/template",
            labelKey: "menu.data.files.template"
          },
          {
            index: "/data/files/preview",
            labelKey: "menu.data.files.preview"
          }
        ]
      },
      {
        index: "data-dictionary",
        labelKey: "menu.data.dictionary",
        children: [
          {
            index: "/data/dictionary/file-categories",
            labelKey: "menu.data.dictionary.file_categories"
          }
        ]
      },
      {
        index: "/data/recycle",
        labelKey: "menu.data.recycle"
      }
    ]
  },
  {
    index: "/inventory",
    labelKey: "menu.inventory",
    icon: "Odometer",
    children: [
      {
        index: "inventory-dataSource",
        labelKey: "menu.inventory.dataSource",
        children: [
          {
            index: "/inventory/dataSource/bom",
            labelKey: "menu.inventory.dataSource.bom"
          },
          {
            index: "/inventory/dataSource/list",
            labelKey: "menu.inventory.dataSource.list"
          },
          {
            index: "/inventory/dataSource/ticket",
            labelKey: "menu.inventory.dataSource.ticket"
          }
        ]
      },
      {
        index: "/inventory/process",
        labelKey: "menu.inventory.process",
        icon: "Operation"
      },
      {
        index: "/inventory/check",
        labelKey: "menu.inventory.result",
        icon: "List"
      },
      {
        index: "/inventory/confirm",
        labelKey: "menu.inventory.confirm",
        icon: "Check"
      }
    ]
  }
];
var systemManifestJson = {
  app: app$8,
  routes: routes$8,
  menus: menus$8
};
const app$7 = {
  id: "quality",
  basePath: "/quality",
  nameKey: "menu.quality.overview"
};
const routes$7 = [
  {
    path: "/",
    labelKey: "menu.quality.overview",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  },
  {
    path: "/inspection",
    labelKey: "menu.quality.inspection",
    tab: {
      enabled: true,
      labelKey: "menu.quality.inspection"
    },
    breadcrumbs: [
      {
        labelKey: "menu.quality.inspection",
        icon: "Check"
      }
    ]
  },
  {
    path: "/reports",
    labelKey: "menu.quality.reports",
    tab: {
      enabled: true,
      labelKey: "menu.quality.reports"
    },
    breadcrumbs: [
      {
        labelKey: "menu.quality.reports",
        icon: "Document"
      }
    ]
  },
  {
    path: "/defects",
    labelKey: "menu.quality.defects",
    tab: {
      enabled: true,
      labelKey: "menu.quality.defects"
    },
    breadcrumbs: [
      {
        labelKey: "menu.quality.defects",
        icon: "Warning"
      }
    ]
  }
];
const menus$7 = [];
var qualityManifestJson = {
  app: app$7,
  routes: routes$7,
  menus: menus$7
};
const app$6 = {
  id: "engineering",
  basePath: "/engineering",
  nameKey: "menu.engineering.overview"
};
const routes$6 = [
  {
    path: "/",
    labelKey: "menu.engineering.overview",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  },
  {
    path: "/projects",
    labelKey: "menu.engineering.projects",
    tab: {
      enabled: true,
      labelKey: "menu.engineering.projects"
    },
    breadcrumbs: [
      {
        labelKey: "menu.engineering.projects",
        icon: "Folder"
      }
    ]
  },
  {
    path: "/progress",
    labelKey: "menu.engineering.progress",
    tab: {
      enabled: true,
      labelKey: "menu.engineering.progress"
    },
    breadcrumbs: [
      {
        labelKey: "menu.engineering.progress",
        icon: "TrendCharts"
      }
    ]
  },
  {
    path: "/monitoring",
    labelKey: "menu.engineering.monitoring",
    tab: {
      enabled: true,
      labelKey: "menu.engineering.monitoring"
    },
    breadcrumbs: [
      {
        labelKey: "menu.engineering.monitoring",
        icon: "Monitor"
      }
    ]
  }
];
const menus$6 = [];
var engineeringManifestJson = {
  app: app$6,
  routes: routes$6,
  menus: menus$6
};
const app$5 = {
  id: "production",
  basePath: "/production",
  nameKey: "menu.production.overview"
};
const routes$5 = [
  {
    path: "/",
    labelKey: "menu.production.overview",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  },
  {
    path: "/plans",
    labelKey: "menu.production.plans",
    tab: {
      enabled: true,
      labelKey: "menu.production.plans"
    },
    breadcrumbs: [
      {
        labelKey: "menu.production.plans",
        icon: "List"
      }
    ]
  },
  {
    path: "/schedule",
    labelKey: "menu.production.schedule",
    tab: {
      enabled: true,
      labelKey: "menu.production.schedule"
    },
    breadcrumbs: [
      {
        labelKey: "menu.production.schedule",
        icon: "Clock"
      }
    ]
  },
  {
    path: "/materials",
    labelKey: "menu.production.materials",
    tab: {
      enabled: true,
      labelKey: "menu.production.materials"
    },
    breadcrumbs: [
      {
        labelKey: "menu.production.materials",
        icon: "Box"
      }
    ]
  }
];
const menus$5 = [];
var productionManifestJson = {
  app: app$5,
  routes: routes$5,
  menus: menus$5
};
const app$4 = {
  id: "finance",
  basePath: "/finance",
  nameKey: "menu.finance.overview"
};
const routes$4 = [
  {
    path: "/",
    labelKey: "menu.finance.overview",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  },
  {
    path: "/receivables",
    labelKey: "menu.finance.receivables",
    tab: {
      enabled: true,
      labelKey: "menu.finance.receivables"
    },
    breadcrumbs: [
      {
        labelKey: "menu.finance.receivables",
        icon: "Money"
      }
    ]
  },
  {
    path: "/payables",
    labelKey: "menu.finance.payables",
    tab: {
      enabled: true,
      labelKey: "menu.finance.payables"
    },
    breadcrumbs: [
      {
        labelKey: "menu.finance.payables",
        icon: "CreditCard"
      }
    ]
  },
  {
    path: "/reports",
    labelKey: "menu.finance.reports",
    tab: {
      enabled: true,
      labelKey: "menu.finance.reports"
    },
    breadcrumbs: [
      {
        labelKey: "menu.finance.reports",
        icon: "DataAnalysis"
      }
    ]
  },
  {
    path: "/inventory",
    labelKey: "menu.finance.inventoryManagement",
    tab: {
      enabled: true,
      labelKey: "menu.finance.inventoryManagement"
    },
    breadcrumbs: [
      {
        labelKey: "menu.finance.inventoryManagement",
        icon: "Box"
      }
    ]
  },
  {
    path: "/inventory/result",
    labelKey: "menu.finance.inventoryManagement.result",
    tab: {
      enabled: true,
      labelKey: "menu.finance.inventoryManagement.result"
    },
    breadcrumbs: [
      {
        labelKey: "menu.finance.inventoryManagement",
        icon: "Box"
      },
      {
        labelKey: "menu.finance.inventoryManagement.result",
        icon: "List"
      }
    ]
  }
];
const menus$4 = [
  {
    index: "/inventory",
    labelKey: "menu.finance.inventoryManagement",
    children: [
      {
        index: "/inventory/result",
        labelKey: "menu.finance.inventoryManagement.result"
      }
    ]
  }
];
var financeManifestJson = {
  app: app$4,
  routes: routes$4,
  menus: menus$4
};
const app$3 = {
  id: "operations",
  basePath: "/operations",
  nameKey: "menu.operations.name"
};
const routes$3 = [
  {
    path: "/",
    labelKey: "menu.operations.overview",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  },
  {
    path: "/ops/error",
    labelKey: "menu.operations.error",
    tab: {
      enabled: true,
      labelKey: "menu.operations.error"
    },
    breadcrumbs: [
      {
        labelKey: "menu.operations.name",
        icon: "Monitor"
      },
      {
        labelKey: "menu.operations.error",
        icon: "Warning"
      }
    ]
  },
  {
    path: "/ops/deployment-test",
    labelKey: "menu.operations.deploymentTest",
    tab: {
      enabled: true,
      labelKey: "menu.operations.deploymentTest"
    },
    breadcrumbs: [
      {
        labelKey: "menu.operations.name",
        icon: "Monitor"
      },
      {
        labelKey: "menu.operations.deploymentTest",
        icon: "Setting"
      }
    ]
  }
];
const menus$3 = [
  {
    index: "ops",
    labelKey: "menu.operations.name",
    icon: "Monitor",
    children: [
      {
        index: "/ops/error",
        labelKey: "menu.operations.error",
        icon: "Warning"
      },
      {
        index: "/ops/deployment-test",
        labelKey: "menu.operations.deploymentTest",
        icon: "Setting"
      }
    ]
  }
];
var operationsManifestJson = {
  app: app$3,
  routes: routes$3,
  menus: menus$3
};
const app$2 = {
  id: "docs",
  basePath: "/docs",
  nameKey: "menu.docs_center"
};
const routes$2 = [
  {
    path: "/",
    labelKey: "menu.docs_center",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  }
];
const menus$2 = [];
var docsManifestJson = {
  app: app$2,
  routes: routes$2,
  menus: menus$2
};
const app$1 = {
  id: "dashboard",
  basePath: "/dashboard",
  nameKey: "micro_app.dashboard.title"
};
const routes$1 = [
  {
    path: "/",
    labelKey: "micro_app.dashboard.title",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  }
];
const menus$1 = [];
var dashboardManifestJson = {
  app: app$1,
  routes: routes$1,
  menus: menus$1
};
const app = {
  id: "personnel",
  basePath: "/personnel",
  nameKey: "micro_app.personnel.title"
};
const routes = [
  {
    path: "/",
    labelKey: "micro_app.personnel.title",
    tab: {
      enabled: false
    },
    breadcrumbs: []
  }
];
const menus = [];
var personnelManifestJson = {
  app,
  routes,
  menus
};
const manifestRegistry = {};
function registerManifest(app2, manifest) {
  manifestRegistry[app2] = manifest;
}
function getManifest(app2) {
  return manifestRegistry[app2];
}
let getAppBySubdomainFn = null;
function setAppBySubdomainFn(fn) {
  getAppBySubdomainFn = fn;
}
function getAppBySubdomain(hostname) {
  if (typeof window === "undefined") {
    return void 0;
  }
  if (getAppBySubdomainFn) {
    return getAppBySubdomainFn(hostname);
  }
  return void 0;
}
function getManifestRoute(app2, fullPath) {
  const manifest = getManifest(app2);
  if (!manifest) return void 0;
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isProductionSubdomain = hostname.includes("bellis.com.cn") && hostname !== "bellis.com.cn";
  const appBySubdomain = getAppBySubdomain(hostname);
  const currentSubdomainApp = appBySubdomain?.id;
  if (isProductionSubdomain && currentSubdomainApp === app2) {
    const normalized2 = fullPath === "/" ? "/" : fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
    return manifest.routes.find((route) => route.path === normalized2);
  }
  const basePath = manifest.app.basePath ?? `/${app2}`;
  if (!fullPath.startsWith(basePath)) {
    return void 0;
  }
  const suffix = fullPath.slice(basePath.length) || "/";
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return manifest.routes.find((route) => route.path === normalized);
}
function getManifestTabs(app2) {
  const manifest = getManifest(app2);
  if (!manifest) return [];
  const basePath = manifest.app.basePath ?? `/${app2}`;
  return manifest.routes.filter((route) => route.tab?.enabled !== false).map((route) => {
    const fullPath = `${basePath}${route.path === "/" ? "" : route.path}`;
    const key = route.path.replace(/^\//, "") || "home";
    const labelKey = route.tab?.labelKey ?? route.labelKey;
    const label = route.tab?.label ?? route.label;
    return {
      key,
      path: fullPath,
      ...labelKey != null ? { labelKey } : {},
      ...label != null ? { label } : {}
    };
  });
}
function getManifestMenus(app2) {
  const manifest = getManifest(app2);
  if (!manifest) return [];
  return manifest.menus ?? [];
}
function getAllManifests() {
  return { ...manifestRegistry };
}
registerManifest("admin", {
  app: {
    id: adminManifestJson.app?.id ?? "admin",
    basePath: adminManifestJson.app?.basePath ?? "/admin",
    nameKey: adminManifestJson.app?.nameKey
  },
  routes: adminManifestJson.routes ?? [],
  menus: adminManifestJson.menus ?? [],
  raw: adminManifestJson
});
registerManifest("logistics", {
  app: {
    id: logisticsManifestJson.app?.id ?? "logistics",
    basePath: logisticsManifestJson.app?.basePath ?? "/logistics",
    nameKey: logisticsManifestJson.app?.nameKey
  },
  routes: logisticsManifestJson.routes ?? [],
  menus: logisticsManifestJson.menus ?? [],
  raw: logisticsManifestJson
});
registerManifest("system", {
  app: {
    id: systemManifestJson.app?.id ?? "system",
    basePath: systemManifestJson.app?.basePath ?? "/",
    nameKey: systemManifestJson.app?.nameKey
  },
  routes: systemManifestJson.routes ?? [],
  menus: systemManifestJson.menus ?? [],
  raw: systemManifestJson
});
registerManifest("quality", {
  app: {
    id: qualityManifestJson.app?.id ?? "quality",
    basePath: qualityManifestJson.app?.basePath ?? "/quality",
    nameKey: qualityManifestJson.app?.nameKey
  },
  routes: qualityManifestJson.routes ?? [],
  menus: qualityManifestJson.menus ?? [],
  raw: qualityManifestJson
});
registerManifest("engineering", {
  app: {
    id: engineeringManifestJson.app?.id ?? "engineering",
    basePath: engineeringManifestJson.app?.basePath ?? "/engineering",
    nameKey: engineeringManifestJson.app?.nameKey
  },
  routes: engineeringManifestJson.routes ?? [],
  menus: engineeringManifestJson.menus ?? [],
  raw: engineeringManifestJson
});
registerManifest("production", {
  app: {
    id: productionManifestJson.app?.id ?? "production",
    basePath: productionManifestJson.app?.basePath ?? "/production",
    nameKey: productionManifestJson.app?.nameKey
  },
  routes: productionManifestJson.routes ?? [],
  menus: productionManifestJson.menus ?? [],
  raw: productionManifestJson
});
registerManifest("finance", {
  app: {
    id: financeManifestJson.app?.id ?? "finance",
    basePath: financeManifestJson.app?.basePath ?? "/finance",
    nameKey: financeManifestJson.app?.nameKey
  },
  routes: financeManifestJson.routes ?? [],
  menus: financeManifestJson.menus ?? [],
  raw: financeManifestJson
});
registerManifest("operations", {
  app: {
    id: operationsManifestJson.app?.id ?? "operations",
    basePath: operationsManifestJson.app?.basePath ?? "/operations",
    nameKey: operationsManifestJson.app?.nameKey
  },
  routes: operationsManifestJson.routes ?? [],
  menus: operationsManifestJson.menus ?? [],
  raw: operationsManifestJson
});
registerManifest("docs", {
  app: {
    id: docsManifestJson.app?.id ?? "docs",
    basePath: docsManifestJson.app?.basePath ?? "/docs",
    nameKey: docsManifestJson.app?.nameKey
  },
  routes: docsManifestJson.routes ?? [],
  menus: docsManifestJson.menus ?? [],
  raw: docsManifestJson
});
registerManifest("dashboard", {
  app: {
    id: dashboardManifestJson.app?.id ?? "dashboard",
    basePath: dashboardManifestJson.app?.basePath ?? "/dashboard",
    nameKey: dashboardManifestJson.app?.nameKey
  },
  routes: dashboardManifestJson.routes ?? [],
  menus: dashboardManifestJson.menus ?? [],
  raw: dashboardManifestJson
});
registerManifest("personnel", {
  app: {
    id: personnelManifestJson.app?.id ?? "personnel",
    basePath: personnelManifestJson.app?.basePath ?? "/personnel",
    nameKey: personnelManifestJson.app?.nameKey
  },
  routes: personnelManifestJson.routes ?? [],
  menus: personnelManifestJson.menus ?? [],
  raw: personnelManifestJson
});
export {
  getAllManifests,
  getManifest,
  getManifestMenus,
  getManifestRoute,
  getManifestTabs,
  registerManifest,
  setAppBySubdomainFn
};
