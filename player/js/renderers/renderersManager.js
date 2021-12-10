const renderers = {};

const registerRenderer = (key, value) => {
  renderers[key] = value;
};

function getRenderer(key) {
  return renderers[key];
}

export {
  registerRenderer,
  getRenderer,
};
