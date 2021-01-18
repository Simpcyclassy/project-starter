import { ConnectionOptions } from "mongoose";

export interface MongoConfig {
  mongodb_url: string;
  mongodb_username: string;
  mongodb_password: string;
}

export const defaultMongoOpts = (): ConnectionOptions => {
  return { useCreateIndex: true, useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true };
};

export const secureMongoOpts = (config: MongoConfig): ConnectionOptions => {
  return {
    ...defaultMongoOpts,
    user: config.mongodb_username,
    pass: config.mongodb_password
  };
};

export function createConfig(appEnv: boolean, config: MongoConfig) {
  return appEnv ? secureMongoOpts(config) : defaultMongoOpts;
}
