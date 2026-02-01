var admin_default = {
  app: {
    id: "admin",
    basePath: "/admin",
    nameKey: "menu.access"
  },
  routes: [
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
        { labelKey: "menu.platform", icon: "Setting" },
        { labelKey: "menu.platform.domains", icon: "Grid" }
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
        { labelKey: "menu.platform", icon: "Setting" },
        { labelKey: "menu.platform.modules", icon: "Box" }
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
        { labelKey: "menu.platform", icon: "Setting" },
        { labelKey: "menu.platform.plugins", icon: "Tools" }
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
        { labelKey: "menu.org", icon: "OfficeBuilding" },
        { labelKey: "menu.org.tenants", icon: "House" }
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
        { labelKey: "menu.org", icon: "OfficeBuilding" },
        { labelKey: "menu.org.departments", icon: "FolderOpened" }
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
        { labelKey: "menu.org", icon: "OfficeBuilding" },
        { labelKey: "menu.org.users", icon: "User" }
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
        { labelKey: "menu.org", icon: "OfficeBuilding" },
        { labelKey: "menu.org.departments", icon: "FolderOpened" },
        { labelKey: "menu.org.dept_role_bind", icon: "Key" }
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
        { labelKey: "menu.access", icon: "Lock" },
        { labelKey: "menu.access.relations", icon: "Connection" },
        { labelKey: "menu.access.user_assign", icon: "User" },
        { labelKey: "menu.access.user_role_bind", icon: "Key" }
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
        { labelKey: "menu.access", icon: "Lock" },
        { labelKey: "menu.access.config", icon: "Setting" },
        { labelKey: "menu.access.resources", icon: "Files" }
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
        { labelKey: "menu.access", icon: "Lock" },
        { labelKey: "menu.access.config", icon: "Setting" },
        { labelKey: "menu.access.actions", icon: "Operation" }
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
        { labelKey: "menu.access", icon: "Lock" },
        { labelKey: "menu.access.config", icon: "Setting" },
        { labelKey: "menu.access.permissions", icon: "Key" }
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
        { labelKey: "menu.access", icon: "Lock" },
        { labelKey: "menu.access.config", icon: "Setting" },
        { labelKey: "menu.access.roles", icon: "UserFilled" }
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
        { labelKey: "menu.access", icon: "Lock" },
        { labelKey: "menu.access.config", icon: "Setting" },
        { labelKey: "menu.access.roles", icon: "UserFilled" },
        { labelKey: "menu.access.role_perm_bind", icon: "Key" }
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
        { labelKey: "menu.access", icon: "Lock" },
        { labelKey: "menu.access.relations", icon: "Connection" },
        { labelKey: "menu.access.perm_compose", icon: "Collection" }
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
        { labelKey: "menu.access", icon: "Lock" },
        { labelKey: "menu.access.relations", icon: "Connection" },
        { labelKey: "menu.access.role_assign", icon: "User" },
        { labelKey: "menu.access.role_permission_bind", icon: "Key" }
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
        { labelKey: "menu.navigation", icon: "Menu" },
        { labelKey: "menu.navigation.menus", icon: "List" }
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
        { labelKey: "menu.navigation", icon: "Menu" },
        { labelKey: "menu.navigation.menus", icon: "List" },
        { labelKey: "menu.navigation.menu_perm_bind", icon: "Key" }
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
        { labelKey: "menu.navigation", icon: "Menu" },
        { labelKey: "menu.navigation.menu_preview", icon: "View" }
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
        { labelKey: "menu.ops", icon: "Monitor" },
        { labelKey: "menu.ops.logs", icon: "Document" },
        { labelKey: "menu.ops.operation_log", icon: "List" }
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
        { labelKey: "menu.ops", icon: "Monitor" },
        { labelKey: "menu.ops.logs", icon: "Document" },
        { labelKey: "menu.ops.request_log", icon: "List" }
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
        { labelKey: "menu.ops", icon: "Monitor" },
        { labelKey: "menu.ops.api_list", icon: "Document" }
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
        { labelKey: "menu.ops", icon: "Monitor" },
        { labelKey: "menu.ops.baseline", icon: "Check" }
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
        { labelKey: "menu.ops", icon: "Monitor" },
        { labelKey: "menu.ops.simulator", icon: "Cpu" }
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
        { labelKey: "menu.strategy", icon: "TrendCharts" },
        { labelKey: "menu.strategy.management", icon: "Setting" }
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
        { labelKey: "menu.strategy", icon: "TrendCharts" },
        { labelKey: "menu.strategy.designer", icon: "Edit" }
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
        { labelKey: "menu.strategy", icon: "TrendCharts" },
        { labelKey: "menu.strategy.monitor", icon: "Monitor" }
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
        { labelKey: "menu.governance", icon: "Files" },
        { labelKey: "menu.data.files", icon: "Document" },
        { labelKey: "menu.data.files.templates", icon: "Files" }
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
        { labelKey: "menu.governance", icon: "Setting" },
        { labelKey: "menu.data.dictionary", icon: "Collection" },
        { labelKey: "menu.data.dictionary.fields", icon: "Document" }
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
        { labelKey: "menu.governance", icon: "Setting" },
        { labelKey: "menu.data.dictionary", icon: "Collection" },
        { labelKey: "menu.data.dictionary.values", icon: "List" }
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
        { labelKey: "menu.test_features", icon: "Tools" },
        { labelKey: "menu.test_features.components", icon: "Grid" }
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
        { labelKey: "menu.test_features", icon: "Tools" },
        { labelKey: "menu.test_features.api_test_center", icon: "Document" }
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
        { labelKey: "menu.test_features", icon: "Tools" },
        { labelKey: "menu.test_features.inventory_ticket_print", icon: "Printer" }
      ]
    }
  ],
  menus: [
    {
      index: "platform",
      labelKey: "menu.platform",
      children: [
        { index: "/platform/domains", labelKey: "menu.platform.domains" },
        { index: "/platform/modules", labelKey: "menu.platform.modules" },
        { index: "/platform/plugins", labelKey: "menu.platform.plugins" }
      ]
    },
    {
      index: "org",
      labelKey: "menu.org",
      children: [
        { index: "/org/tenants", labelKey: "menu.org.tenants" },
        { index: "/org/departments", labelKey: "menu.org.departments" },
        { index: "/org/users", labelKey: "menu.org.users" }
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
            { index: "/access/resources", labelKey: "menu.access.resources" },
            { index: "/access/actions", labelKey: "menu.access.actions" },
            { index: "/access/permissions", labelKey: "menu.access.permissions" },
            { index: "/access/roles", labelKey: "menu.access.roles" }
          ]
        },
        {
          index: "access-relations",
          labelKey: "menu.access.relations",
          children: [
            { index: "/access/perm-compose", labelKey: "menu.access.perm_compose" },
            {
              index: "access-user",
              labelKey: "menu.access.user_assign",
              children: [
                { index: "/org/users/users-roles", labelKey: "menu.access.user_role_bind" }
              ]
            },
            {
              index: "access-role-assign",
              labelKey: "menu.access.role_assign",
              children: [
                { index: "/access/role-permission-bind", labelKey: "menu.access.role_permission_bind" }
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
        { index: "/navigation/menus", labelKey: "menu.navigation.menus" },
        { index: "/navigation/menus/preview", labelKey: "menu.navigation.menu_preview" }
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
            { index: "/ops/logs/operation", labelKey: "menu.ops.operation_log" },
            { index: "/ops/logs/request", labelKey: "menu.ops.request_log" }
          ]
        },
        { index: "/ops/api-list", labelKey: "menu.ops.api_list" },
        { index: "/ops/baseline", labelKey: "menu.ops.baseline" },
        { index: "/ops/simulator", labelKey: "menu.ops.simulator" }
      ]
    },
    {
      index: "strategy",
      labelKey: "menu.strategy",
      children: [
        { index: "/strategy/management", labelKey: "menu.strategy.management" },
        { index: "/strategy/designer", labelKey: "menu.strategy.designer" },
        { index: "/strategy/monitor", labelKey: "menu.strategy.monitor" }
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
            { index: "/governance/files/templates", labelKey: "menu.data.files.templates" }
          ]
        },
        {
          index: "governance-dictionary",
          labelKey: "menu.data.dictionary",
          children: [
            { index: "/governance/dictionary/fields", labelKey: "menu.data.dictionary.fields" },
            { index: "/governance/dictionary/values", labelKey: "menu.data.dictionary.values" }
          ]
        }
      ]
    },
    {
      index: "test-features",
      labelKey: "menu.test_features",
      children: [
        { index: "/test/components", labelKey: "menu.test_features.components" },
        { index: "/test/api-test-center", labelKey: "menu.test_features.api_test_center" },
        { index: "/test/inventory-ticket-print", labelKey: "menu.test_features.inventory_ticket_print" }
      ]
    }
  ]
};
var logistics_default = {
  app: {
    id: "logistics",
    basePath: "/logistics",
    nameKey: "menu.logistics.overview"
  },
  routes: [
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
        { labelKey: "menu.logistics.procurementModule", icon: "ShoppingCart" }
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
        { labelKey: "menu.logistics.procurementModule", icon: "ShoppingCart" },
        { labelKey: "menu.logistics.procurement.auxiliary", icon: "Collection" }
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
        { labelKey: "menu.logistics.procurementModule", icon: "ShoppingCart" },
        { labelKey: "menu.logistics.procurement.packaging", icon: "CollectionTag" }
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
        { labelKey: "menu.logistics.procurementModule", icon: "ShoppingCart" },
        { labelKey: "menu.logistics.procurement.supplier", icon: "User" }
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
        { labelKey: "menu.logistics.warehouseModule", icon: "FolderOpened" }
      ]
    },
    {
      path: "/warehouse/material",
      labelKey: "menu.logistics.warehouse.material",
      tab: {
        enabled: false
      },
      breadcrumbs: [
        { labelKey: "menu.logistics.warehouseModule", icon: "FolderOpened" },
        { labelKey: "menu.logistics.warehouse.material", icon: "Files" }
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
        { labelKey: "menu.logistics.warehouseModule", icon: "FolderOpened" },
        { labelKey: "menu.logistics.warehouse.material", icon: "Files" },
        { labelKey: "menu.logistics.warehouse.material.list", icon: "List" }
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
        { labelKey: "menu.logistics.customsModule", icon: "MapLocation" }
      ]
    },
    {
      path: "/inventory",
      labelKey: "menu.logistics.inventoryManagement",
      tab: {
        enabled: false
      },
      breadcrumbs: [
        { labelKey: "menu.logistics.inventoryManagement", icon: "Odometer" }
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
        { labelKey: "menu.logistics.inventoryManagement", icon: "Odometer" },
        { labelKey: "menu.logistics.inventoryManagement.storageLocation", icon: "Location" }
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
        { labelKey: "menu.logistics.inventoryManagement", icon: "Odometer" },
        { labelKey: "menu.logistics.inventoryManagement.info", icon: "Document" }
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
        { labelKey: "menu.logistics.inventoryManagement", icon: "Odometer" },
        { labelKey: "menu.logistics.inventoryManagement.detail", icon: "Histogram" }
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
        { labelKey: "menu.logistics.inventoryManagement", icon: "Odometer" },
        { labelKey: "menu.logistics.inventoryManagement.result", icon: "List" }
      ]
    }
  ],
  menus: [
    {
      index: "/procurement",
      labelKey: "menu.logistics.procurementModule",
      icon: "svg:cart",
      children: [
        { index: "/procurement/auxiliary", labelKey: "menu.logistics.procurement.auxiliary" },
        { index: "/procurement/packaging", labelKey: "menu.logistics.procurement.packaging" },
        { index: "/procurement/supplier", labelKey: "menu.logistics.procurement.supplier" }
      ]
    },
    {
      index: "/warehouse",
      labelKey: "menu.logistics.warehouseModule",
      icon: "svg:folder",
      children: [
        { index: "/warehouse/material/list", labelKey: "menu.logistics.warehouse.material" }
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
        { index: "/inventory/storage-location", labelKey: "menu.logistics.inventoryManagement.storageLocation" },
        { index: "/inventory/info", labelKey: "menu.logistics.inventoryManagement.info" },
        { index: "/inventory/detail", labelKey: "menu.logistics.inventoryManagement.detail" },
        { index: "/inventory/result", labelKey: "menu.logistics.inventoryManagement.result" }
      ]
    }
  ]
};
var system_default = {
  app: {
    id: "system",
    basePath: "/",
    nameKey: "menu.system.home"
  },
  routes: [
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
        { labelKey: "menu.data", icon: "Folder" },
        { labelKey: "menu.data.files", icon: "Document" },
        { labelKey: "menu.data.files.list", icon: "List" }
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
        { labelKey: "menu.data", icon: "Folder" },
        { labelKey: "menu.data.files", icon: "Document" },
        { labelKey: "menu.data.files.template", icon: "Files" }
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
        { labelKey: "menu.data", icon: "Folder" },
        { labelKey: "menu.data.files", icon: "Document" },
        { labelKey: "menu.data.files.preview", icon: "View" }
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
        { labelKey: "menu.inventory", icon: "Odometer" },
        { labelKey: "menu.inventory.dataSource", icon: "Files" },
        { labelKey: "menu.inventory.dataSource.bom", icon: "List" }
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
        { labelKey: "menu.inventory", icon: "Odometer" },
        { labelKey: "menu.inventory.dataSource", icon: "Files" },
        { labelKey: "menu.inventory.dataSource.list", icon: "List" }
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
        { labelKey: "menu.inventory", icon: "Odometer" },
        { labelKey: "menu.inventory.dataSource", icon: "Files" },
        { labelKey: "menu.inventory.dataSource.ticket", icon: "Tickets" }
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
        { labelKey: "menu.inventory", icon: "Odometer" },
        { labelKey: "menu.inventory.process", icon: "Operation" }
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
        { labelKey: "menu.inventory", icon: "Odometer" },
        { labelKey: "menu.inventory.result", icon: "List" }
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
        { labelKey: "menu.inventory", icon: "Odometer" },
        { labelKey: "menu.inventory.confirm", icon: "Check" }
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
        { labelKey: "menu.data", icon: "Folder" },
        { labelKey: "menu.data.dictionary", icon: "Collection" },
        { labelKey: "menu.data.dictionary.file_categories", icon: "FolderOpened" }
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
        { labelKey: "menu.data", icon: "Folder" },
        { labelKey: "menu.data.recycle", icon: "Delete" }
      ]
    }
  ],
  menus: [
    {
      index: "data",
      labelKey: "menu.data",
      children: [
        {
          index: "data-files",
          labelKey: "menu.data.files",
          children: [
            { index: "/data/files/list", labelKey: "menu.data.files.list" },
            { index: "/data/files/template", labelKey: "menu.data.files.template" },
            { index: "/data/files/preview", labelKey: "menu.data.files.preview" }
          ]
        },
        {
          index: "data-dictionary",
          labelKey: "menu.data.dictionary",
          children: [
            { index: "/data/dictionary/file-categories", labelKey: "menu.data.dictionary.file_categories" }
          ]
        },
        { index: "/data/recycle", labelKey: "menu.data.recycle" }
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
            { index: "/inventory/dataSource/bom", labelKey: "menu.inventory.dataSource.bom" },
            { index: "/inventory/dataSource/list", labelKey: "menu.inventory.dataSource.list" },
            { index: "/inventory/dataSource/ticket", labelKey: "menu.inventory.dataSource.ticket" }
          ]
        },
        { index: "/inventory/process", labelKey: "menu.inventory.process", icon: "Operation" },
        { index: "/inventory/check", labelKey: "menu.inventory.result", icon: "List" },
        { index: "/inventory/confirm", labelKey: "menu.inventory.confirm", icon: "Check" }
      ]
    }
  ]
};
var quality_default = {
  app: {
    id: "quality",
    basePath: "/quality",
    nameKey: "menu.quality.overview"
  },
  routes: [
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
        { labelKey: "menu.quality.inspection", icon: "Check" }
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
        { labelKey: "menu.quality.reports", icon: "Document" }
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
        { labelKey: "menu.quality.defects", icon: "Warning" }
      ]
    }
  ],
  menus: []
};
var engineering_default = {
  app: {
    id: "engineering",
    basePath: "/engineering",
    nameKey: "menu.engineering.overview"
  },
  routes: [
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
        { labelKey: "menu.engineering.projects", icon: "Folder" }
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
        { labelKey: "menu.engineering.progress", icon: "TrendCharts" }
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
        { labelKey: "menu.engineering.monitoring", icon: "Monitor" }
      ]
    }
  ],
  menus: []
};
var production_default = {
  app: {
    id: "production",
    basePath: "/production",
    nameKey: "menu.production.overview"
  },
  routes: [
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
        { labelKey: "menu.production.plans", icon: "List" }
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
        { labelKey: "menu.production.schedule", icon: "Clock" }
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
        { labelKey: "menu.production.materials", icon: "Box" }
      ]
    }
  ],
  menus: []
};
var finance_default = {
  app: {
    id: "finance",
    basePath: "/finance",
    nameKey: "menu.finance.overview"
  },
  routes: [
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
        { labelKey: "menu.finance.receivables", icon: "Money" }
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
        { labelKey: "menu.finance.payables", icon: "CreditCard" }
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
        { labelKey: "menu.finance.reports", icon: "DataAnalysis" }
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
        { labelKey: "menu.finance.inventoryManagement", icon: "Box" }
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
        { labelKey: "menu.finance.inventoryManagement", icon: "Box" },
        { labelKey: "menu.finance.inventoryManagement.result", icon: "List" }
      ]
    }
  ],
  menus: [
    {
      index: "/inventory",
      labelKey: "menu.finance.inventoryManagement",
      children: [
        { index: "/inventory/result", labelKey: "menu.finance.inventoryManagement.result" }
      ]
    }
  ]
};
var operations_default = {
  app: {
    id: "operations",
    basePath: "/operations",
    nameKey: "menu.operations.name"
  },
  routes: [
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
        { labelKey: "menu.operations.name", icon: "Monitor" },
        { labelKey: "menu.operations.error", icon: "Warning" }
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
        { labelKey: "menu.operations.name", icon: "Monitor" },
        { labelKey: "menu.operations.deploymentTest", icon: "Setting" }
      ]
    }
  ],
  menus: [
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
  ]
};
var docs_default = {
  app: {
    id: "docs",
    basePath: "/docs",
    nameKey: "menu.docs_center"
  },
  routes: [
    {
      path: "/",
      labelKey: "menu.docs_center",
      tab: {
        enabled: false
      },
      breadcrumbs: []
    }
  ],
  menus: []
};
var dashboard_default = {
  app: {
    id: "dashboard",
    basePath: "/dashboard",
    nameKey: "micro_app.dashboard.title"
  },
  routes: [
    {
      path: "/",
      labelKey: "micro_app.dashboard.title",
      tab: {
        enabled: false
      },
      breadcrumbs: []
    }
  ],
  menus: []
};
var personnel_default = {
  app: {
    id: "personnel",
    basePath: "/personnel",
    nameKey: "micro_app.personnel.title"
  },
  routes: [
    {
      path: "/",
      labelKey: "micro_app.personnel.title",
      tab: {
        enabled: false
      },
      breadcrumbs: []
    }
  ],
  menus: []
};
var manifestRegistry = {};
function registerManifest(app, manifest) {
  manifestRegistry[app] = manifest;
}
function getManifest(app) {
  return manifestRegistry[app];
}
var getAppBySubdomainFn = null;
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
function getManifestRoute(app, fullPath) {
  const manifest = getManifest(app);
  if (!manifest)
    return void 0;
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isProductionSubdomain = hostname.includes("bellis.com.cn") && hostname !== "bellis.com.cn";
  const appBySubdomain = getAppBySubdomain(hostname);
  const currentSubdomainApp = appBySubdomain?.id;
  if (isProductionSubdomain && currentSubdomainApp === app) {
    const normalized2 = fullPath === "/" ? "/" : fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
    return manifest.routes.find((route) => route.path === normalized2);
  }
  const basePath = manifest.app.basePath ?? `/${app}`;
  if (!fullPath.startsWith(basePath)) {
    return void 0;
  }
  const suffix = fullPath.slice(basePath.length) || "/";
  const normalized = suffix.startsWith("/") ? suffix : `/${suffix}`;
  return manifest.routes.find((route) => route.path === normalized);
}
function getManifestTabs(app) {
  const manifest = getManifest(app);
  if (!manifest)
    return [];
  const basePath = manifest.app.basePath ?? `/${app}`;
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
function getManifestMenus(app) {
  const manifest = getManifest(app);
  if (!manifest)
    return [];
  return manifest.menus ?? [];
}
function getAllManifests() {
  return { ...manifestRegistry };
}
registerManifest("admin", {
  app: {
    id: admin_default.app?.id ?? "admin",
    basePath: admin_default.app?.basePath ?? "/admin",
    nameKey: admin_default.app?.nameKey
  },
  routes: admin_default.routes ?? [],
  menus: admin_default.menus ?? [],
  raw: admin_default
});
registerManifest("logistics", {
  app: {
    id: logistics_default.app?.id ?? "logistics",
    basePath: logistics_default.app?.basePath ?? "/logistics",
    nameKey: logistics_default.app?.nameKey
  },
  routes: logistics_default.routes ?? [],
  menus: logistics_default.menus ?? [],
  raw: logistics_default
});
registerManifest("system", {
  app: {
    id: system_default.app?.id ?? "system",
    basePath: system_default.app?.basePath ?? "/",
    nameKey: system_default.app?.nameKey
  },
  routes: system_default.routes ?? [],
  menus: system_default.menus ?? [],
  raw: system_default
});
registerManifest("quality", {
  app: {
    id: quality_default.app?.id ?? "quality",
    basePath: quality_default.app?.basePath ?? "/quality",
    nameKey: quality_default.app?.nameKey
  },
  routes: quality_default.routes ?? [],
  menus: quality_default.menus ?? [],
  raw: quality_default
});
registerManifest("engineering", {
  app: {
    id: engineering_default.app?.id ?? "engineering",
    basePath: engineering_default.app?.basePath ?? "/engineering",
    nameKey: engineering_default.app?.nameKey
  },
  routes: engineering_default.routes ?? [],
  menus: engineering_default.menus ?? [],
  raw: engineering_default
});
registerManifest("production", {
  app: {
    id: production_default.app?.id ?? "production",
    basePath: production_default.app?.basePath ?? "/production",
    nameKey: production_default.app?.nameKey
  },
  routes: production_default.routes ?? [],
  menus: production_default.menus ?? [],
  raw: production_default
});
registerManifest("finance", {
  app: {
    id: finance_default.app?.id ?? "finance",
    basePath: finance_default.app?.basePath ?? "/finance",
    nameKey: finance_default.app?.nameKey
  },
  routes: finance_default.routes ?? [],
  menus: finance_default.menus ?? [],
  raw: finance_default
});
registerManifest("operations", {
  app: {
    id: operations_default.app?.id ?? "operations",
    basePath: operations_default.app?.basePath ?? "/operations",
    nameKey: operations_default.app?.nameKey
  },
  routes: operations_default.routes ?? [],
  menus: operations_default.menus ?? [],
  raw: operations_default
});
registerManifest("docs", {
  app: {
    id: docs_default.app?.id ?? "docs",
    basePath: docs_default.app?.basePath ?? "/docs",
    nameKey: docs_default.app?.nameKey
  },
  routes: docs_default.routes ?? [],
  menus: docs_default.menus ?? [],
  raw: docs_default
});
registerManifest("dashboard", {
  app: {
    id: dashboard_default.app?.id ?? "dashboard",
    basePath: dashboard_default.app?.basePath ?? "/dashboard",
    nameKey: dashboard_default.app?.nameKey
  },
  routes: dashboard_default.routes ?? [],
  menus: dashboard_default.menus ?? [],
  raw: dashboard_default
});
registerManifest("personnel", {
  app: {
    id: personnel_default.app?.id ?? "personnel",
    basePath: personnel_default.app?.basePath ?? "/personnel",
    nameKey: personnel_default.app?.nameKey
  },
  routes: personnel_default.routes ?? [],
  menus: personnel_default.menus ?? [],
  raw: personnel_default
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
