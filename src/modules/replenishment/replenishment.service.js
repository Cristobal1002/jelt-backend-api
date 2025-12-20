import { assistantRepository } from '../assistant/assistant.repository.js';

const mapReorderSuggestionToDto = (result) => {
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
};

const getArticleReplenishmentById = async (articleId) => {
  const result = await assistantRepository.getReorderSuggestion({ articleId });
  if (!result) return null;
  return mapReorderSuggestionToDto(result);
};

const getArticleReplenishmentBySku = async (sku) => {
  const result = await assistantRepository.getReorderSuggestion({ sku });
  if (!result) return null;
  return mapReorderSuggestionToDto(result);
};

export const replenishmentService = {
  getArticleReplenishmentById,
  getArticleReplenishmentBySku,
};
