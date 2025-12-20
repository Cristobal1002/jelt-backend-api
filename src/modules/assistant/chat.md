
## ¿Qué hace el chatbot?

Con los tools el agente podrá responder cosas como:

* “📦 ¿Cuánto debería reordenar del artículo SKU-123 para no quedarme sin stock?”

  * → Llama `suggest_reorder_quantity` y te devuelve: stock actual, punto de reorden, lead time y cantidad sugerida.

* “🔍 Muéstrame los productos con bajo stock del proveedor ACME.”

  * → `filter_articles_by_category_or_supplier` con `supplierName: "ACME", lowStockOnly: true`.

* “📂 ¿Qué artículos de la categoría Tornillería están por agotarse?”

  * → `filter_articles_by_category_or_supplier` con `categoryName: "Tornillería", lowStockOnly: true`.

---
## Modelo de inventario a usar

Para cada artículo vamos a considerar:

* **Demanda promedio diaria**: `demand_daily_avg`
* **Desviación estándar diaria de la demanda**: `demand_daily_std`
* **Lead time en días**: `lead_time_days`
* **Nivel de servicio deseado**: `service_level` (ej. 0.95, 0.98, 0.99)
* **Stock actual**: `stock`
* (Opcional) **reorder_point actual**: `reorder_point` (por si ya lo guardas)

Cálculos:

```txt
demanda_esperada_LT = demand_daily_avg * lead_time_days
desviacion_LT        = demand_daily_std * sqrt(lead_time_days)
z                    = z(service_level)   // valor z de la normal estándar
stock_seguridad      = z * desviacion_LT

ROP_recomendado      = demanda_esperada_LT + stock_seguridad
cantidad_sugerida    = max(ROP_recomendado - stock_actual, 0)
```

Así el agente puede explicarle al usuario *por qué* recomienda cierta cantidad.

> ⚠️ Si tu tabla `Article` aún no tiene campos como `demand_daily_avg`, `demand_daily_std` o `service_level`, habría que agregarlos primero o, mientras tanto, usar valores por defecto.
---

## Qué va a poder responder ahora el agente

Ejemplos de preguntas que el chatbot entenderá mucho mejor:

* “¿Cuánto debería reordenar del producto SKU-ABC considerando su demanda y lead time?”
* “Explícame cómo calculaste el punto de reorden de este artículo.”
* “¿Qué stock de seguridad recomiendas para este artículo si quiero nivel de servicio del 98%?”

Si quieres, en el próximo paso podemos:

* Ajustar nombres de campos a tu modelo real (`Articles`), o
* Añadir un endpoint clásico REST que devuelva **estas mismas métricas** para usarlas en un dashboard de reabastecimiento, además del chatbot.
