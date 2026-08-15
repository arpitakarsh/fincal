import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Load the Next.js recommended config
const compatConfig = compat.extends("next/core-web-vitals");

// FIX for "TypeError: Converting circular structure to JSON"
// The eslint-plugin-react plugin (used inside next/core-web-vitals) has a circular 
// reference in its 'configs' object which crashes FlatCompat validators in ESLint 9.
// We strip the circular 'configs' property since the rules are already resolved by FlatCompat.
const patchedConfig = compatConfig.map((config) => {
  if (config.plugins && config.plugins.react) {
    // Clone the react plugin object to avoid mutating the original
    config.plugins.react = { ...config.plugins.react };
    // Delete the circular reference
    delete config.plugins.react.configs;
  }
  return config;
});

export default [
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**"]
  },
  ...patchedConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off"
    }
  }
];
