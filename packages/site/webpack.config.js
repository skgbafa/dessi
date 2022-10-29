module.exports = {
  resolve: {
    fallback: {
      "crypto-browserify": require.resolve('crypto-browserify'),
    }
  },
}
