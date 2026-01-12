import { authRecoveryService } from './auth.recovery.facade.js';

const requestRecovery = async (req, res, next) => {
  try {
    const result = await authRecoveryService.requestRecovery(req.body);
    return res.ok(result, 'If the email exists, recovery instructions were sent');
  } catch (error) {
    return next(error);
  }
};

const loginTemp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authRecoveryService.loginWithTempCode({ email, password });
    return res.ok({ token, user }, 'Temporary login successful');
  } catch (error) {
    return next(error);
  }
};

export const authRecoveryController = {
  requestRecovery,
  loginTemp,
};
