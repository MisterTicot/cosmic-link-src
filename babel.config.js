module.exports = function (api) {
  api.cache(true)

  return {
    presets: ["@babel/preset-env"],
    plugins: [
      ["@babel/plugin-transform-runtime", { helpers: false }],
      "@babel/plugin-syntax-dynamic-import"
    ],
    sourceType: "unambiguous"
  }
}
