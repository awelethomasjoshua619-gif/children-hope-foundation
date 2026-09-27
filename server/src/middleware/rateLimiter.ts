import rateLimit from 'express-rate-limit';

const standard = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please slow down and try again shortly.' },
};

/** Login/register/me — generous enough for real users, tight on brute force. */
export const authLimiter = rateLimit({
  ...standard,
  windowMs: 15 * 60 * 1000,
  max: 20,
});

/** Donation init/verify — payments are low-frequency actions. */
export const donationLimiter = rateLimit({
  ...standard,
  windowMs: 10 * 60 * 1000,
  max: 30,
});

/** Contact form + everything else. */
export const apiLimiter = rateLimit({
  ...standard,
  windowMs: 15 * 60 * 1000,
  max: 300,
});
