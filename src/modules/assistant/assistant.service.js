import { openaiClient, OPENAI_MODEL } from '../../config/openai.js';
import { assistantTools } from './assistant.tools.js';
import { assistantRepository } from './assistant.repository.js';

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
          lead_time_days: a.lead_time_days,
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

    default:
      return { error: `Tool not implemented: ${toolCall.name}` };
  }
};

const chat = async ({ userMessage, userId }) => {
  // 1. Primer llamado: modelo decide si usar tools
  let input = [
    { role: 'system', content: SYSTEM_INSTRUCTIONS },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  let response = await openaiClient.responses.create({
    model: OPENAI_MODEL,
    tools: assistantTools,
    input,
  });

  const toolCalls = response.output.filter(
    (item) => item.type === 'function_call'
  );

  // Si no pidió tools, devolvemos la respuesta directa del modelo
  if (!toolCalls.length) {
    return {
      reply: response.output_text,
      usedTools: [],
    };
  }

  // 2. Ejecutar tools y preparar segunda llamada
  const toolOutputs = [];

  for (const toolCall of toolCalls) {
    const output = await executeTool(toolCall);
    toolOutputs.push({
      type: 'function_call_output',
      call_id: toolCall.call_id,
      // la API espera string; usamos JSON.stringify
      output: JSON.stringify(output),
    });
  }

  // Agregamos al input original la salida de los tools
  input = [
    ...input,
    ...response.output, // lo que generó el modelo, incluyendo function_call
    ...toolOutputs,
  ];

  // 3. Segundo llamado: el modelo verbaliza la respuesta final
  response = await openaiClient.responses.create({
    model: OPENAI_MODEL,
    tools: assistantTools,
    instructions:
      'Responde en español usando la información devuelta por las funciones. Sé concreto y útil para el usuario.',
    input,
  });

  return {
    reply: response.output_text,
    usedTools: toolCalls.map((t) => t.name),
  };
};

export const assistantService = {
  chat,
};
