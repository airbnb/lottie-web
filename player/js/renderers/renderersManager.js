const renderers = {};

const registerRenderer = (key, value) => {
  renderers[key] = value;
};

function getRenderer(key) {
  return renderers[key];
}

function getRegisteredRenderer() {
  // Returns canvas by default for compatibility
  if (renderers.canvas) {
    return 'canvas';
  }
  // Returns any renderer that is registered
  for (const key in renderers) {
    if (renderers[key]) {
      return key;
    }
  }
  return '';
}

export {
  registerRenderer,
  getRenderer,
  getRegisteredRenderer,
};
