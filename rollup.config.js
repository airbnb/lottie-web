import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';

// const copyFile = (options = {}) => {
//   const { targets = [], hook = 'buildEnd' } = options
//   return {
//     name: 'copy-file',
//     // [hook]: async(test) => {
//     //   console.log('targets', targets.length)
//     //   console.log('options', options)
//     //   console.log('test', test)
//     // },
//     generateBundle: (options, bundle) => {
//       // console.log('PASO,. generateBundle', options, bundle)
//       console.log('PASO,. generateBundle', options, bundle.code)
//       // bundle.code = '()=>{}';
//     },
//     writeBundle: () => {
//       console.log('PASO,. writeBundle')
//     }
//   }
// } 

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
    babelHelpers: 'bundled',
  }),
]
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
};

const ESMModule = {
  plugins: [nodeResolve()],
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

const input = ['player/js/modules/full.js'];

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
/* export default [
  {
    // UMD
    input,
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: 'bundled',
      }),
      terser(),
    ],
    output: {
      file: `dist/${pkg.name}.min.js`,
      format: 'umd',
      name: 'lottie-web', // this is the name of the global object
      esModule: false,
      exports: 'named',
      sourcemap: true,
    },
  },
  // ESM and CJS
  {
    input,
    plugins: [nodeResolve()],
    output: [
      {
        dir: 'dist/esm',
        format: 'esm',
        exports: 'named',
        sourcemap: true,
      },
      {
        dir: 'dist/cjs',
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
    ],
  },
];
*/