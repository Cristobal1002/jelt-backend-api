import { getOpenAIClient, OPENAI_MODEL } from '../../config/openai.js';
import { assistantTools } from './assistant.tools.js';
import { assistantRepository } from './assistant.repository.js';
import { assistantConversationRepository } from './assistant.conversation.repository.js';
import { PENDING_REQUIRED_FIELDS } from './assistant.pending.js';
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

CONTEXTO Y FOLLOW-UPS
- Si tu mensaje anterior solicitó un dato obligatorio (por ejemplo: el nombre), y el usuario responde con un texto corto que parece ese valor, interprétalo como la respuesta y procede con la acción solicitada usando tools.

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

const MAX_TOOL_ITERATIONS = 3;

const isShortAnswer = (text) => {
  const t = String(text ?? '').trim();
  if (!t) return false;
  return t.split(/\s+/).length <= 4;
};

const computeMissingFields = (action, payload) => {
  const required = PENDING_REQUIRED_FIELDS[action] ?? [];
  return required.filter((k) => !payload?.[k] || String(payload[k]).trim().length === 0);
};

const buildMissingFieldsQuestion = (action, missing) => {
  if (action === 'create_category' && missing.includes('name')) {
    return '¿Cuál es el nombre de la categoría que deseas crear?';
  }
  if (action === 'create_stockroom' && missing.includes('name')) {
    return '¿Cuál es el nombre del almacén que deseas crear?';
  }
  if (action === 'create_supplier') {
    const needName = missing.includes('name');
    const needNit = missing.includes('nit');
    if (needName && needNit) return 'Para crear el proveedor necesito el nombre y el NIT. ¿Me los indicas?';
    if (needName) return '¿Cuál es el nombre del proveedor?';
    if (needNit) return '¿Cuál es el NIT del proveedor?';
  }
  return `Necesito estos datos para continuar: ${missing.join(', ')}.`;
};

const buildReplyFromTool = (action, toolResult) => {
  if (toolResult?.error) return `No pude completar la acción: ${toolResult.error}`;

  if (action === 'create_category') {
    const name = toolResult?.category?.name ?? 'la categoría';
    return `He creado la categoría "${name}".`;
  }
  if (action === 'create_stockroom') {
    const name = toolResult?.stockroom?.name ?? 'el almacén';
    return `He creado el almacén "${name}".`;
  }
  if (action === 'create_supplier') {
    const name = toolResult?.supplier?.name ?? 'el proveedor';
    const created = toolResult?.created;
    if (created === false) return `El proveedor "${name}" ya existía y quedó actualizado si aplicaba.`;
    return `He creado el proveedor "${name}".`;
  }
  return 'Listo.';
};

const mergePendingPayload = (pendingPayload, userMessage, pendingRequired) => {
  // Caso común: falta solo 1 campo (name) y el usuario responde con una frase (ej. "Inyectables")
  if (pendingRequired?.length === 1 && isShortAnswer(userMessage)) {
    const field = pendingRequired[0];
    return { ...(pendingPayload ?? {}), [field]: String(userMessage).trim() };
  }

  // Caso proveedor: el usuario puede responder "MED-001 900123456"
  if (pendingRequired?.length === 2 && isShortAnswer(userMessage)) {
    const parts = String(userMessage).trim().split(/\s+/);
    if (parts.length >= 2) {
      const nit = parts[parts.length - 1];
      const name = parts.slice(0, -1).join(' ');
      return { ...(pendingPayload ?? {}), name, nit };
    }
  }

  return null;
};

const detectCreateIntent = (text) => {
  const t = String(text ?? '').toLowerCase();

  // Categoría
  if (
    t.includes('crea una categoría') ||
    t.includes('crear una categoría') ||
    t.includes('crear categoría') ||
    t.includes('crea categoría') ||
    t.includes('registra una categoría') ||
    t.includes('registrar categoría')
  ) {
    return { action: 'create_category' };
  }

  // Stockroom / almacén
  if (
    t.includes('crea un almacén') ||
    t.includes('crear un almacén') ||
    t.includes('crear almacén') ||
    t.includes('crea un stockroom') ||
    t.includes('crear stockroom') ||
    t.includes('registra un almacén') ||
    t.includes('registrar almacén') || 
    t.includes('crea una bodega') ||
    t.includes('crear una bodega') ||
    t.includes('crear bodega') ||
    t.includes('registra una bodega') ||
    t.includes('registrar bodega')
  ) {
    return { action: 'create_stockroom' };
  }

  // Supplier / proveedor
  if (
    t.includes('crea un proveedor') ||
    t.includes('crear un proveedor') ||
    t.includes('crear proveedor') ||
    t.includes('registra un proveedor') ||
    t.includes('registrar proveedor') || 
    t.includes('registra proveedor')
  ) {
    return { action: 'create_supplier' };
  }

  return null;
};

const runLLMWithTools = async ({ client, input, userId }) => {
  const usedTools = new Set();

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await client.responses.create({
      model: OPENAI_MODEL,
      tools: assistantTools,
      input,
    });

    const toolCalls = (response.output || []).filter((x) => x.type === 'function_call');

    if (!toolCalls.length) {
      return { reply: response.output_text, usedTools: [...usedTools] };
    }

    const toolOutputs = [];
    for (const toolCall of toolCalls) {
      usedTools.add(toolCall.name);
      const args = safeParseArgs(toolCall);

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
    usedTools: [],
  };
};



const chat = async ({ userMessage, userId, conversationId }) => {
  const client = getOpenAIClient();
  if (!client) {
    return { reply: 'El asistente de IA está deshabilitado.', usedTools: [], conversationId: null };
  }

  if (!userId) {
    return { reply: 'No estás autenticado.', usedTools: [], conversationId: null };
  }

  // 1) Recupera o crea conversación
  const convo = await assistantConversationRepository.getOrCreateConversation({
    userId,
    conversationId,
  });

  if (!convo) {
    return { reply: 'Conversación no encontrada.', usedTools: [], conversationId: null };
  }

  const convoId = convo.id;

  // 2) Guarda mensaje de usuario
  await assistantConversationRepository.addMessage({
    conversationId: convoId,
    role: 'user',
    content: userMessage,
  });

  // 3) Si NO hay pending, intenta detectar intención de creación determinísticamente
  if (!convo.pending_action) {
    const intent = detectCreateIntent(userMessage);
    if (intent?.action) {
      const missing = PENDING_REQUIRED_FIELDS[intent.action] ?? [];
      await assistantConversationRepository.setPending(convoId, {
        action: intent.action,
        payload: {},
        required: missing,
      });

      const reply = buildMissingFieldsQuestion(intent.action, missing);

      await assistantConversationRepository.addMessage({
        conversationId: convoId,
        role: 'assistant',
        content: reply,
        usedTools: [],
      });

      return { reply, usedTools: [], conversationId: convoId };
    }
  }

  // 4) Si hay pending_action, intenta resolver follow-up de forma determinística
  if (convo.pending_action) {
    const merged = mergePendingPayload(convo.pending_payload, userMessage, convo.pending_required);
    if (merged) {
      const missing = computeMissingFields(convo.pending_action, merged);

      if (missing.length === 0) {
        
        // Ejecuta tool directamente (determinista) y limpia pending
        const toolCall = {
          name: convo.pending_action,
          arguments: JSON.stringify(merged),
        };

        const toolResult = await executeTool(toolCall, userId);

        await assistantConversationRepository.setPending(convoId, null);

        const reply = buildReplyFromTool(convo.pending_action, toolResult);

        await assistantConversationRepository.addMessage({
          conversationId: convoId,
          role: 'assistant',
          content: reply,
          usedTools: [convo.pending_action],
        });

        return { reply, usedTools: [convo.pending_action], conversationId: convoId };
      }

      // Aún faltan datos: actualiza pending y pregunta
      await assistantConversationRepository.setPending(convoId, {
        action: convo.pending_action,
        payload: merged,
        required: missing,
      });

      const reply = buildMissingFieldsQuestion(convo.pending_action, missing);

      await assistantConversationRepository.addMessage({
        conversationId: convoId,
        role: 'assistant',
        content: reply,
        usedTools: [],
      });

      return { reply, usedTools: [], conversationId: convoId };
    }
  }

  // 5) LLM con historial
  const history = await assistantConversationRepository.getRecentMessages(convoId);

  if (process.env.NODE_ENV !== 'production') {
    // Log de depuración para comprobar el contexto enviado al LLM
    console.debug(
      {
        conversationId: convoId,
        lastUserMessage: userMessage,
        historyCount: history.length,
        historyPreview: history.map(h => `${h.role}: ${h.content}`).slice(-4),
      },
      'assistant input context'
    );
  }
  
  // para evitar duplicados si history ya lo trae
  const last = history.at(-1);
  const historySafe = last?.role === 'user' && last.content === userMessage ? history.slice(0, -1) : history;

  const input = [
    { role: 'system', content: SYSTEM_INSTRUCTIONS },
    ...historySafe,
    { role: 'user', content: userMessage },
  ];

  const result = await runLLMWithTools({ client, input, userId });

  await assistantConversationRepository.addMessage({
    conversationId: convoId,
    role: 'assistant',
    content: result.reply,
    usedTools: result.usedTools,
  });

  return { ...result, conversationId: convoId };
};

export const assistantService = {
  chat,
};
