module.exports = {
  "plugins": ["node"],
  "extends": ["eslint:recommended", "plugin:node/recommended"],
  "rules": {
    "node/exports-style": ["error", "module.exports"],
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error", "log"]
      }
    ],
    "node/no-unsupported-features": ["error", {
        "version": 8,
        "ignores": []
    }]
  },
};
