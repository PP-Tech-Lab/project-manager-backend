import Joi from 'joi';
import * as fs from 'fs';
import * as path from 'path';

const environment = process.env.NODE_ENV || 'development';
const envFileName = `.env.${environment}`;
const envFilePath = path.resolve(process.cwd(), envFileName);

const envSchema = Joi.object({
  PORT: Joi.number().default(4000),
  GMAIL_EMAIL: Joi.string().required(),
  GMAIL_APP_PASSWORD: Joi.string().required()
});

export const validateEnv = (config: Record<string, unknown>) => {
  if (!fs.existsSync(envFilePath)) throw new Error(`No "${envFileName}" file found`);

  const { error, value } = envSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true
  });

  if (error) {
    const missingVars = error.details.map(d => d.context!.key).join(', ');
    throw new Error(`\nMissing environment variable:  ${missingVars}`);
  }

  return value;
};
