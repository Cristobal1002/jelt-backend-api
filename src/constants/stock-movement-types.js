export const STOCK_MOVEMENT_TYPES = Object.freeze({
  IN: 'IN',
  OUT: 'OUT',
  ADJUSTMENT: 'ADJUSTMENT',
});

export const normalizeMovementType = (value) => {
  const v = String(value ?? '').trim().toLowerCase();

  const map = {
    in: 'IN',
    out: 'OUT',
    adjustment: 'ADJUSTMENT',

    entrada: 'IN',
    ingreso: 'IN',
    salida: 'OUT',
    ajuste: 'ADJUSTMENT',
    ajust: 'ADJUSTMENT',
  };

  const normalized = map[v] ?? String(value ?? '').trim().toUpperCase();

  // si no es válido, devuelves null o dejas que valide más arriba
  return STOCK_MOVEMENT_TYPES_VALUES.includes(normalized) ? normalized : null;
};

export const STOCK_MOVEMENT_TYPES_VALUES = Object.values(STOCK_MOVEMENT_TYPES);
