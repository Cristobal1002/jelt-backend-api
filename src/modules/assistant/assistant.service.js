import { getOpenAIClient, OPENAI_MODEL } from '../../config/openai.js';
import { assistantTools } from './assistant.tools.js';
import { assistantRepository } from './assistant.repository.js';
import { inventoryHistoryRepository } from '../inventory-history/inventory-history.repository.js';

const SYSTEM_INSTRUCTIONS = `
Eres un asistente especializado en inventario de la aplicación Jelt.
Ayudas a los usuarios a consultar y gestionar información de inventario
de forma segura y clara.

CAPACIDADES
Puedes ayudar al usuario con:
- Consultar existencia de artículos (stock, almacén, categoría, proveedor).
- Identificar artículos con bajo stock o próximos a agotarse.
- Mostrar distribución de stock por almacén.
- Crear entidades del inventario cuando el usuario lo solicite explícitamente:
  - Categorías
  - Almacenes / Stockrooms
  - Proveedores

REGLAS GENERALES (MUY IMPORTANTES)
- NO inventes datos.
- NO asumas valores que el usuario no haya proporcionado.
- Usa SIEMPRE las funciones disponibles (tools) para consultar o modificar datos reales.
- Nunca inventes IDs ni valores técnicos.
- Si falta información obligatoria para ejecutar una acción, PREGUNTA antes de usar una tool.
- Explica las respuestas en español claro, profesional y conciso.
- Si el resultado es muy grande, resume los datos más relevantes.

REGLAS PARA CREACIÓN DE ENTIDADES
Cuando el usuario pida crear o registrar algo, valida primero los campos obligatorios:

1) Categoría (create_category)
- Obligatorio: name
- Opcional: description
Si falta el nombre:
  Pregunta: "¿Cuál es el nombre de la categoría?"

2) Almacén / Stockroom (create_stockroom)
- Obligatorio: name
- Opcional: address
Si falta el nombre:
  Pregunta: "¿Cuál es el nombre del almacén?"

3) Proveedor (create_supplier)
- Obligatorio: name y nit
- Opcional: address, phone
Si falta alguno:
  Pregunta SOLO por los campos obligatorios faltantes.
  Ejemplo: "Para crear el proveedor necesito el nombre y el NIT. ¿Me los indicas?"

IMPORTANTE SOBRE LAS TOOLS
- Solo llama una tool cuando tengas TODOS los campos obligatorios.
- Usa únicamente los parámetros definidos en el schema de la tool.
- No agregues propiedades adicionales.
- Si el usuario no ha dado la información mínima requerida, primero pregunta.

SEGURIDAD Y CONTEXTO DE USUARIO
- Todos los datos de inventario pertenecen al usuario autenticado.
- No menciones ni expongas información técnica como id_user.
- Asume que categorías y almacenes pueden existir previamente y reutilízalos si corresponde.

FORMATO DE RESPUESTA
- Si se crea una entidad: confirma claramente qué se creó y muestra los datos principales.
- Si se consulta información: muestra resultados claros y fáciles de entender.
- Si necesitas datos adicionales: haz una pregunta breve, directa y específica.

Ejemplos de buenas respuestas:
- "He creado la categoría 'Analgésicos'."
- "Estos artículos tienen bajo stock:"
- "Para continuar necesito el nombre del almacén."
`;


const safeParseArgs = (toolCall) => {
  if (!toolCall.arguments) return {};
  try { return JSON.parse(toolCall.arguments); }
  catch { return { __parseError: true, raw: toolCall.arguments }; }
};

const MAX_TOOL_ITERATIONS = 3;

const executeTool = async (toolCall, userId) => {
  const args = toolCall.arguments ? JSON.parse(toolCall.arguments) : {};

  args.userId = userId;

  switch (toolCall.name) {
    case 'get_article_stock_by_sku': {
      const articles = await assistantRepository.findArticleBySkuOrName(args);
      return {
        items: articles.map((a) => ({
          id: a.id,
          sku: a.sku,
          name: a.name,
          stock: a.stock,
          reorder_point: a.reorder_point,
          lead_time: a.lead_time,
          stockroom: a.stockroom
            ? {
                id: a.stockroom.id,
                name: a.stockroom.name,
                address: a.stockroom.address,
              }
            : null,
          category: a.category
            ? { id: a.category.id, name: a.category.name }
            : null,
          supplier: a.supplier
            ? { id: a.supplier.id, name: a.supplier.name }
            : null,
        })),
      };
    }

    case 'get_article_stock_by_name': {
      const articles = await assistantRepository.findArticleBySkuOrName(args);
      return {
        items: articles.map((a) => ({
          id: a.id,
          sku: a.sku,
          name: a.name,
          stock: a.stock,
          reorder_point: a.reorder_point,
          lead_time: a.lead_time,
          stockroom: a.stockroom
            ? {
                id: a.stockroom.id,
                name: a.stockroom.name,
                address: a.stockroom.address,
              }
            : null,
          category: a.category
            ? { id: a.category.id, name: a.category.name }
            : null,
          supplier: a.supplier
            ? { id: a.supplier.id, name: a.supplier.name }
            : null,
        })),
      };
    }

    case 'get_low_stock_articles': {
      const articles = await assistantRepository.findLowStockArticles(args);
      return {
        items: articles.map((a) => ({
          id: a.id,
          sku: a.sku,
          name: a.name,
          stock: a.stock,
          reorder_point: a.reorder_point,
          id_stockroom: a.id_stockroom,
        })),
      };
    }

    case 'get_stock_distribution': {
      const rows = await assistantRepository.getStockDistributionByStockroom({ userId });
      return {
        stockrooms: rows.map((r) => ({
          stockroom_id: r.stockroom.id,
          stockroom_name: r.stockroom.name,
          total_stock: Number(r.get('total_stock')),
        })),
      };
    }

    case 'suggest_reorder_quantity': {
      const result = await assistantRepository.getReorderSuggestion(args);

      if (!result) {
        return {
          error: 'Artículo no encontrado para calcular sugerencia de reorden.',
        };
      }

      const {
        article,
        stock,
        demandDailyAvg,
        demandDailyStd,
        leadTimeDays,
        serviceLevel,
        z,
        expectedDemandLT,
        demandStdLT,
        safetyStock,
        currentReorderPoint,
        recommendedROP,
        suggestedQty,
      } = result;

      return {
        article: {
          id: article.id,
          sku: article.sku,
          name: article.name,
        },
        metrics: {
          stock_actual: stock,
          demanda_promedio_diaria: demandDailyAvg,
          desviacion_demanda_diaria: demandDailyStd,
          lead_time_dias: leadTimeDays,
          nivel_servicio: serviceLevel,
          z_score: z,
          demanda_esperada_en_lead_time: expectedDemandLT,
          desviacion_en_lead_time: demandStdLT,
          stock_seguridad: safetyStock,
          reorder_point_actual: currentReorderPoint,
          reorder_point_recomendado: recommendedROP,
          cantidad_reorden_sugerida: suggestedQty,
        },
      };
    }

    case 'filter_articles_by_category_or_supplier': {
      const articles =
        await assistantRepository.findArticlesByCategoryOrSupplier(args);

      return {
        items: articles.map((a) => ({
          id: a.id,
          sku: a.sku,
          name: a.name,
          stock: a.stock,
          reorder_point: a.reorder_point,
          category: a.category
            ? { id: a.category.id, name: a.category.name }
            : null,
          supplier: a.supplier
            ? { id: a.supplier.id, name: a.supplier.name }
            : null,
          stockroom: a.stockroom
            ? {
                id: a.stockroom.id,
                name: a.stockroom.name,
              }
            : null,
        })),
      };
    }

    case 'get_sales_summary': {
      const summary = await inventoryHistoryRepository.getSalesSummary(args);
      return summary;
    }

    case 'get_top_selling_articles': {
      const items = await inventoryHistoryRepository.getTopSellingArticles(args);
      return { items };
    }

    case 'get_stock_movements': {
      const data = await inventoryHistoryRepository.listMovements(args);
      return {
        count: data.count,
        items: data.rows.map((m) => ({
          id: m.id,
          type: m.type,
          quantity: m.quantity,
          moved_at: m.moved_at,
          reference: m.reference,
          article: m.article ? { id: m.article.id, sku: m.article.sku, name: m.article.name } : null,
          stockroom: m.stockroom ? { id: m.stockroom.id, name: m.stockroom.name } : null,
        })),
      };
    }

    case 'predict_stockout_date': {
      const res = await inventoryHistoryRepository.predictStockoutDate(args);
      return res;
    }

    case 'create_category': {
      if (!userId) return { error: 'Unauthorized: missing user context' };

      if (!args?.name) {
        return { error: 'Missing required fields: name' };
      }

      const { name, description } = args;
      const category = await assistantRepository.createCategoryForUser(userId, { name, description });
      return {
        created: true,
        category: { id: category.id, name: category.name, description: category.description ?? null },
      };
    }

    case 'create_stockroom': {
      if (!userId) return { error: 'Unauthorized: missing user context' };

      if (!args?.name) {
        return { error: 'Missing required fields: name' };
      }
      
      const { name, address } = args;
      const stockroom = await assistantRepository.createStockroomForUser(userId, { name, address });
      return {
        created: true,
        stockroom: { id: stockroom.id, name: stockroom.name, address: stockroom.address ?? null },
      };
    }

    case 'create_supplier': {

      if (!args?.name || !args?.nit) {
        return { error: 'Missing required fields: name, nit' };
      }

      const { name, nit, address, phone } = args;
      const result = await assistantRepository.createSupplier({ name, nit, address, phone });
      const supplier = result.supplier;
      return {
        created: result.created,
        supplier: {
          id: supplier.id,
          name: supplier.name,
          nit: supplier.nit,
          address: supplier.address ?? null,
          phone: supplier.phone ?? null,
        },
      };
    }

    default:
      return { error: `Tool not implemented: ${toolCall.name}` };
  }
};

const chat = async ({ userMessage, userId }) => {
  const client = getOpenAIClient();
  if (!client) {
    return { reply: 'El asistente de IA está deshabilitado.', usedTools: [] };
  }

  let input = [
    { role: 'system', content: SYSTEM_INSTRUCTIONS },
    { role: 'user', content: userMessage },
  ];

  const usedTools = new Set();

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await client.responses.create({ model: OPENAI_MODEL, tools: assistantTools, input });
    const toolCalls = (response.output || []).filter((x) => x.type === 'function_call');

    if (!toolCalls.length) {
      return { reply: response.output_text, usedTools: [...usedTools] };
    }

    const toolOutputs = [];
    for (const toolCall of toolCalls) {
      usedTools.add(toolCall.name);
      const args = safeParseArgs(toolCall);

      console.log('Executing tool:', toolCall.name, 'with args:', args);

      const output = await executeTool({ ...toolCall, arguments: JSON.stringify(args) }, userId);
      toolOutputs.push({
        type: 'function_call_output',
        call_id: toolCall.call_id,
        output: JSON.stringify(output),
      });
    }

    input = [...input, ...response.output, ...toolOutputs];
  }

  return {
    reply: 'No pude completar la respuesta con las herramientas disponibles. Intenta reformular tu pregunta.',
    usedTools: [...usedTools],
  };
};

export const assistantService = {
  chat,
};
