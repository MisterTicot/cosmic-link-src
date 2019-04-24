const config = {
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  }
}

const main = Object.assign({}, config, {
  entry: "./src/index.js",
  output: {
    path: __dirname + "/web",
    filename: "index.js",
    chunkFilename: "[name].js",
    library: "lib",
    libraryTarget: "var"
  }
})

const worker = Object.assign({}, config, {
  entry: "./src/worker.js",
  output: {
    path: __dirname + "/web",
    filename: "worker.js"
  }
})

module.exports = [main, worker]
