import { getOpenAIClient, OPENAI_MODEL } from '../../config/openai.js';
import { assistantTools } from './assistant.tools.js';
import { assistantRepository } from './assistant.repository.js';
import { inventoryHistoryRepository } from '../inventory-history/inventory-history.repository.js';

const SYSTEM_INSTRUCTIONS = `
Eres un asistente especializado en inventario de la aplicación Jelt.
Tu objetivo es ayudar al usuario con:
- Consultar existencia de artículos (stock actual, almacén, categoría, proveedor).
- Identificar artículos con bajo stock o próximos a agotarse.
- Mostrar distribución de stock por almacén/ubicación.

Reglas:
- Si necesitas datos de stock, utiliza SIEMPRE las funciones disponibles (tools).
- Explica las respuestas en español claro y conciso.
- Si los datos devueltos por las funciones son muchos, resume los más relevantes.
`;

const safeParseArgs = (toolCall) => {
  if (!toolCall.arguments) return {};
  try { return JSON.parse(toolCall.arguments); }
  catch { return { __parseError: true, raw: toolCall.arguments }; }
};

const MAX_TOOL_ITERATIONS = 3;

const executeTool = async (toolCall) => {
  const args = toolCall.arguments ? JSON.parse(toolCall.arguments) : {};

  switch (toolCall.name) {
    case 'get_article_stock': {
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
      const rows = await assistantRepository.getStockDistributionByStockroom();
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

      const output = await executeTool({ ...toolCall, arguments: JSON.stringify(args) });
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
