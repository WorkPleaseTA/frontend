const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const fbjsRoot = path.resolve(__dirname, 'node_modules/fbjs');

// react-native-web (ESM dist) imports fbjs/lib/warning and fbjs/lib/invariant.
// Metro sometimes fails to resolve these from deep inside node_modules on web.
// Explicitly redirect all fbjs/* requests to the installed package.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('fbjs/')) {
    const subPath = moduleName.slice('fbjs/'.length);
    const candidate = path.join(fbjsRoot, subPath);
    const filePath = candidate.endsWith('.js') ? candidate : `${candidate}.js`;
    if (fs.existsSync(filePath)) {
      return { type: 'sourceFile', filePath };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
