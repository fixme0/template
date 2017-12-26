let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let isProd = process.env.NODE_ENV == 'production';

const PATHS = {
  src: path.resolve(__dirname, 'src'),
  dist: path.resolve(__dirname, 'dist')
}

let cssProd = ExtractTextPlugin.extract({
  fallback: 'style-loader',
  publicPath: '../',
  use: [
    { 
      loader: 'css-loader',
      options: {
        sourceMap: true,
        minimize: true
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        parser: 'sugarss',
        plugins: [
          require('postcss-partial-import')(),
          require('postcss-nested')(),
          require('postcss-simple-vars')(),
          require('postcss-selector-matches')(),
          require('autoprefixer')({browsers: 'last 15 versions'}),
        ],
        sourceMap: true
      }
    }
  ]
});

let cssDev = [
  'style-loader',
  { 
    loader: 'css-loader',
    options: {
      sourceMap: true
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      parser: 'sugarss',
      plugins: [
        require('postcss-partial-import')(),
        require('postcss-nested')(),
        require('postcss-simple-vars')(),
        require('postcss-selector-matches')(),
        require('autoprefixer')({browsers: 'last 15 versions'}),
      ],
      sourceMap: true
    }
  }
];

let cssConfig = isProd ? cssProd : cssDev;

let config = {
  entry: {
    index: `${PATHS.src}/js/page/index.js`
  },
  output: {
    path: PATHS.dist,
    filename: 'js/[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: `${PATHS.src}/pug/page/index.pug`
    }),
    new CleanWebpackPlugin(PATHS.dist),
    new ExtractTextPlugin({
      filename: 'css/[name].css',
      disable: !isProd
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(isProd)
    })
  ],

  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true
            }
          }
        ],
        
       },
       {
        test: /\.sss$/,
        use: cssConfig
       },

       {
        test: /\.(png|jpg|gif|jpeg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'img/',
            }  
          }
        ]
       },

    ]
  },

  devServer: {
    overlay: true,
    port: 8001,
    compress: true,
    inline: true,
    hot: !isProd
  },

  devtool: !isProd ? 'source-map' : false
};

if(!isProd){
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(), 
    new webpack.NamedModulesPlugin() 
  );
}else {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }) 
  )
}




module.exports = config;