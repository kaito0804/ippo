// next.config.mjs （ファイル名を .mjs にする必要があります）
export default {
  images: {
    domains: ['res.cloudinary.com'],
  },
};

webpack: (config) => {
  config.module.exprContextCritical = false;
  return config;
}
