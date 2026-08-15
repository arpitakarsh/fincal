import nextVitals from "eslint-config-next/core-web-vitals";

/**
 * Next.js 15+ supports Flat Config natively.
 * We import the core-web-vitals config array directly and avoid using FlatCompat,
 * which causes circular JSON parsing errors with eslint-plugin-react.
 */
export default [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**"]
  },
  {
    rules: {
      "react/no-unescaped-entities": "off"
    }
  }
];
