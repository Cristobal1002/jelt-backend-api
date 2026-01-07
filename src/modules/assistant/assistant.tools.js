export const assistantTools = [
  {
    type: 'function',
    name: 'get_article_stock_by_sku',
    description:
      'Obtiene información de stock de artículos por SKU. Úsalo cuando el usuario pregunte por la existencia o stock de un artículo específico por SKU.',
    parameters: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'SKU exacto del artículo',
        }
      },
      additionalProperties: false,
    },
    //strict: true,
  },
  {
    type: 'function',
    name: 'get_article_stock_by_name',
    description:
      'Obtiene información de stock de artículos por nombre. Úsalo cuando el usuario pregunte por la existencia o stock de un artículo específico por nombre.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Nombre (o parte del nombre) del artículo.',
        },
      },
      additionalProperties: false,
    },
    //strict: true,
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
    //strict: true,
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
    //strict: true,
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
    //strict: true,
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
    //strict: true,
  },
  {
    type: 'function',
    name: 'get_sales_summary',
    description:
      'Obtiene un resumen de ventas (unidades y transacciones) en un rango de fechas para un artículo y/o almacén. Úsalo para preguntas sobre ventas o consumo histórico.',
    parameters: {
      type: 'object',
      properties: {
        articleId: { type: 'string', description: 'Id del artículo (UUID).' },
        stockroomId: { type: 'string', description: 'Id del almacén (UUID).' },
        from: { type: 'string', description: 'Fecha ISO inicio (YYYY-MM-DD o ISO8601).', },
        to: { type: 'string', description: 'Fecha ISO fin (YYYY-MM-DD o ISO8601).', },
      },
      additionalProperties: false,
    },
    //strict: true,
  },
  {
    type: 'function',
    name: 'get_top_selling_articles',
    description:
      'Devuelve los artículos más vendidos en una ventana de tiempo (por defecto últimos 30 días). Útil para ranking de ventas.',
    parameters: {
      type: 'object',
      properties: {
        stockroomId: { type: 'string', description: 'Id del almacén (UUID). Opcional.' },
        days: { type: 'integer', description: 'Ventana en días (por defecto 30).', default: 30 },
        limit: { type: 'integer', description: 'Máximo de artículos.', default: 10 },
      },
      additionalProperties: false,
    },
    //strict: true,
  },
  {
    type: 'function',
    name: 'get_stock_movements',
    description:
      'Lista movimientos de inventario (IN/OUT/ADJUSTMENT) para auditoría y explicación de variaciones de stock.',
    parameters: {
      type: 'object',
      properties: {
        articleId: { type: 'string', description: 'Id del artículo (UUID).' },
        stockroomId: { type: 'string', description: 'Id del almacén (UUID).' },
        type: { type: 'string', enum: ['IN', 'OUT', 'ADJUSTMENT'], description: 'Tipo de movimiento.' },
        from: { type: 'string', description: 'Fecha ISO inicio (YYYY-MM-DD o ISO8601).' },
        to: { type: 'string', description: 'Fecha ISO fin (YYYY-MM-DD o ISO8601).' },
        limit: { type: 'integer', description: 'Máximo de registros.', default: 50 },
      },
      additionalProperties: false,
    },
    //strict: true,
  },
  {
    type: 'function',
    name: 'predict_stockout_date',
    description:
      'Estima la fecha de quiebre de stock usando el stock actual del artículo y el promedio diario de ventas en una ventana (por defecto 30 días).',
    parameters: {
      type: 'object',
      properties: {
        articleId: { type: 'string', description: 'Id del artículo (UUID). Requerido.' },
        stockroomId: { type: 'string', description: 'Id del almacén (UUID). Opcional.' },
        days: { type: 'integer', description: 'Ventana en días para calcular promedio.', default: 30 },
      },
      required: ['articleId'],
      additionalProperties: false,
    },
    //strict: true,
  },
  {
    type: 'function',
    name: 'create_category',
    description:
      'Crea una categoría. Úsala cuando el usuario pida crear/registrar una categoría y provea al menos el nombre. Si falta el nombre, pregunta antes de llamar la función.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre de la categoría.' },
        description: { type: 'string', description: 'Descripción (opcional).' },
      },
      required: ['name'],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: 'function',
    name: 'create_stockroom',
    description:
      'Crea un almacén/stockroom. Úsala cuando el usuario pida crear un almacén y provea al menos el nombre. Si falta el nombre, pregunta antes de llamar la función.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre del almacén.' },
        address: { type: 'string', description: 'Dirección (opcional).' },
      },
      required: ['name'],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: 'function',
    name: 'create_supplier',
    description:
      'Crea un proveedor. Úsala cuando el usuario pida crear/registrar un proveedor y provea nombre y NIT. Si falta alguno, pregunta antes de llamar la función.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre del proveedor.' },
        nit: { type: 'string', description: 'NIT único del proveedor.' },
        address: { type: 'string', description: 'Dirección (opcional).' },
        phone: { type: 'string', description: 'Teléfono (opcional).' },
      },
      required: ['name', 'nit'],
      additionalProperties: false,
    },
    strict: false,
  }
];
