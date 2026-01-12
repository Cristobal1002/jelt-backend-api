import * as recovery from './auth.recovery.service.js';

export const authRecoveryService = {
  requestRecovery: recovery.requestRecovery,
  loginWithTempCode: recovery.loginWithTempCode,
};
