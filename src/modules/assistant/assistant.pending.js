export const PENDING_ACTIONS = Object.freeze({
  CREATE_CATEGORY: 'create_category',
  CREATE_STOCKROOM: 'create_stockroom',
  CREATE_SUPPLIER: 'create_supplier',
});

export const PENDING_REQUIRED_FIELDS = Object.freeze({
  [PENDING_ACTIONS.CREATE_CATEGORY]: ['name'],
  [PENDING_ACTIONS.CREATE_STOCKROOM]: ['name'],
  [PENDING_ACTIONS.CREATE_SUPPLIER]: ['name', 'nit'],
});
