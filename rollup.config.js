import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import {version} from './package.json'

const injectVersion = (options = {}) => {
  return {
    name: 'inject-version',
    renderChunk: (code) => {
      return code.replace('[[BM_VERSION]]', version)
    },
  }
}

const addNavigatorValidation = (options = {}) => {
  return {
    name: 'add-navigator-validation',
    renderChunk: (code) => {
      return '(typeof navigator !== "undefined") && '  + code
    },
  }
}

const addDocumentValidation = (options = {}) => {
  return {
    name: 'add-document-validation',
    renderChunk: (code) => {
      return '(typeof document !== "undefined") && ' + code;
    },
  };
};

const noTreeShakingForStandalonePlugin = () => {
  return {
    name: 'no-treeshaking-for-standalone',
    transform(code) {
        // This is very fast but can produce lots of false positives.
        // Use a good regular expression or parse an AST and analyze scoping to improve as needed.
        if (code.indexOf('__[STANDALONE]__') >= 0) return {moduleSideEffects: 'no-treeshake'};
    }
  }
}

const destinationBuildFolder = 'build/player/';

const builds = [
  {
    input: 'player/js/modules/full.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie.min.js',
    esm: true,
  },
  {
    input: 'player/js/modules/full.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie.js',
    esm: false,
    skipTerser: true,
  },
  {
    input: 'player/js/modules/svg_light.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_light.min.js',
    esm: true,
  },
  {
    input: 'player/js/modules/svg_light.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_light.js',
    esm: false,
    skipTerser: true,
  },
  {
    input: 'player/js/modules/svg.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_svg.min.js',
    esm: true,
  },
  {
    input: 'player/js/modules/svg.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_svg.js',
    esm: false,
    skipTerser: true,
  },
  {
    input: 'player/js/modules/canvas.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_canvas.min.js',
    esm: true,
  },
  {
    input: 'player/js/modules/canvas_light.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_light_canvas.js',
    esm: false,
    skipTerser: true,
  },
  {
    input: 'player/js/modules/canvas_light.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_light_canvas.min.js',
    esm: true,
  },
  {
    input: 'player/js/modules/canvas.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_canvas.js',
    esm: false,
    skipTerser: true,
  },
  {
    input: 'player/js/modules/html_light.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_light_html.min.js',
    esm: true,
  },
  {
    input: 'player/js/modules/html_light.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_light_html.js',
    esm: false,
    skipTerser: true,
  },
  {
    input: 'player/js/modules/html.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_html.min.js',
    esm: true,
  },
  {
    input: 'player/js/modules/html.js',
    dest: `${destinationBuildFolder}`,
    file: 'lottie_html.js',
    esm: false,
    skipTerser: true,
  },
];

const plugins = [
  nodeResolve(),
  babel({
    babelHelpers: 'runtime',
    skipPreflightCheck: true,
  }),
  // noTreeShakingForStandalonePlugin(),
  injectVersion(),
  addNavigatorValidation(),
  addDocumentValidation(),
];
const pluginsWithTerser = [
  ...plugins,
  terser(),
]

const UMDModule = {
  output: {
    format: 'umd',
    name: 'lottie', // this is the name of the global object
    esModule: false,
    exports: 'default',
    sourcemap: false,
    compact: false,
  },
  treeshake: false,
};

const ESMModule = {
  plugins: [nodeResolve()],
  treeshake: false,
  output: [
    {
      format: 'esm',
      exports: 'named',
    },
    {
      format: 'cjs',
      exports: 'named',
    },
  ],
};

const exports = builds.reduce((acc, build) => {
  const builds = [];
  builds.push({
    ...UMDModule,
    plugins: !build.skipTerser ? pluginsWithTerser : plugins,
    input: build.input,
    output: {
      ...UMDModule.output,
      file: `${build.dest}${build.file}`,
    }
  });
  if (build.esm) {
    builds.push({
      ...ESMModule,
      input: build.input,
      output: [
        {
          ...ESMModule.output[0],
          file: 'dist/esm/' + build.file,
          file: `${destinationBuildFolder}esm/${build.file}`,
        },
        {
          ...ESMModule.output[1],
          file: `${destinationBuildFolder}cjs/${build.file}`,
        }
      ]
    });
  }
  
  acc = acc.concat(builds);
  return acc;
}, []);
export default exports;
