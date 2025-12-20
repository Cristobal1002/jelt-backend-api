export const assistantTools = [
  {
    type: 'function',
    name: 'get_article_stock',
    description:
      'Obtiene información de stock de artículos por SKU o nombre. Úsalo cuando el usuario pregunte por la existencia o stock de un artículo específico.',
    parameters: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'SKU exacto del artículo. Opcional si se usa nombre.',
        },
        name: {
          type: 'string',
          description: 'Nombre (o parte del nombre) del artículo.',
        },
      },
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_low_stock_articles',
    description:
      'Lista artículos con stock igual o por debajo del punto de reorden. Úsalo cuando el usuario pregunte por próximos productos a agotarse.',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          description: 'Máximo de artículos a devolver.',
          default: 20,
        },
        stockroomId: {
          type: 'string',
          description:
            'Id del almacén (UUID). Si no se envía, se consideran todos.',
        },
      },
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_stock_distribution',
    description:
      'Devuelve un resumen de la distribución de stock por almacén. Úsalo cuando el usuario pregunte por stock por ubicación, bodega o depósito.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'suggest_reorder_quantity',
    description:
        'Sugiere una cantidad de reorden para un artículo usando demanda promedio diaria, variabilidad de la demanda (desviación estándar), lead time y nivel de servicio para calcular demanda esperada en el lead time, stock de seguridad y punto de reorden recomendado.',
    parameters: {
        type: 'object',
        properties: {
        articleId: {
            type: 'string',
            description: 'Id del artículo (UUID).',
        },
        sku: {
            type: 'string',
            description: 'SKU del artículo. Opcional si se usa articleId.',
        },
        },
        required: [],
        additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'filter_articles_by_category_or_supplier',
    description:
      'Filtra artículos por categoría o proveedor. Puede usarse también para ver solo artículos con bajo stock.',
    parameters: {
      type: 'object',
      properties: {
        categoryId: {
          type: 'string',
          description: 'Id de la categoría (UUID).',
        },
        categoryName: {
          type: 'string',
          description:
            'Nombre (o parte del nombre) de la categoría. Se usa búsqueda aproximada.',
        },
        supplierId: {
          type: 'string',
          description: 'Id del proveedor (UUID).',
        },
        supplierName: {
          type: 'string',
          description:
            'Nombre (o parte del nombre) del proveedor. Se usa búsqueda aproximada.',
        },
        lowStockOnly: {
          type: 'boolean',
          description:
            'Si es true, se devuelven solo artículos con stock por debajo o igual al punto de reorden.',
          default: false,
        },
        limit: {
          type: 'integer',
          description: 'Máximo de artículos a devolver.',
          default: 50,
        },
      },
      additionalProperties: false,
    },
    strict: true,
  },
];
