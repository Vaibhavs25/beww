const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const config = getDefaultConfig(__dirname);
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'decode-uri-component') {
    return { type: 'sourceFile', filePath: path.resolve(__dirname, 'src/lib/decode-uri.cjs') };
  }
  return context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
