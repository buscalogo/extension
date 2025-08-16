module.exports = {
  env: {
    browser: true,
    es2022: true,
    webextensions: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    chrome: 'readonly',
    indexedDB: 'readonly',
    RTCPeerConnection: 'readonly',
    RTCSessionDescription: 'readonly',
    RTCIceCandidate: 'readonly',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
}
