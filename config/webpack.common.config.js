// webpack5 assetsModuleType https://blog.csdn.net/lin_fightin/article/details/115140736?utm_term=webpack5%E9%85%8D%E7%BD%AE%E5%9B%BE%E7%89%87%E8%B5%84%E6%BA%90&utm_medium=distribute.pc_aggpage_search_result.none-task-blog-2~all~sobaiduweb~default-0-115140736&spm=3001.4430


const webpack = require('webpack');
// progress-bar-webpack-plugin
const WebpackBar = require('webpackbar');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = (env, argv, config) => {
    const {
        outputPath,
        publicPath,
        sourceMap,
        include,
        exclude,
        port,
        networkIp,
        globalLessData,
        pageTitle,
        assetsDir,
        setFileLocation,
        setAssetsPublicPath,
        isDev,
        getFullUrl,
        umdExternals,
        umdLibrary,
        umdFilename,
        extraScript = [],
    } = config;

    const isLib = env.lib === 'umd';

    const entryAndOutput = isLib
        ? {
            entry: getFullUrl('src/umd.ts'),
            output: {
                path: outputPath,
                libraryTarget: 'umd',
                library: umdLibrary,
                filename: `${umdFilename}.js`,
            },
            externals: umdExternals,
        }
        : {
            entry: getFullUrl('src/main.ts'),
            output: {
                path: outputPath,
                filename: setFileLocation('[name].[contenthash].js'),
                chunkFilename: setFileLocation('[name].[contenthash].chunk.js'),
                publicPath,
                // assetModuleFilename: setFileLocation('[name].[hash:7][ext]'),
            },
        };

    const miniCssExtractPluginConfig = isLib
        ? {
            filename: `${umdFilename}.css`,
            chunkFilename: `${umdFilename}.css`,
        }
        : {
            filename: setFileLocation('[name].[contenthash].css'),
            chunkFilename: setFileLocation('[id].[contenthash].css'),
        };

    const optimization = isLib
        ? {}
        : {
            // ??????
            // sideEffects: true,
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        name: 'vendors',
                        test: /[\\/]node_modules[\\/]/,
                        chunks: 'all',
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                },
            },
            // ????????????????????????????????????????????????????????? webpack ??? chunk ???????????????????????????????????????????????????
            removeAvailableModules: true,
            // chunk ??????????????? webpack ????????????????????? chunk
            removeEmptyChunks: true,
            // ??????????????????????????? chunk
            mergeDuplicateChunks: true,
        };

    return {
        ...entryAndOutput,
        // https://www.jianshu.com/p/10f2479995a4
        // TODO: browserslist ?????????????????????
        target: isDev ? 'web' : 'browserslist',
        // https://mp.weixin.qq.com/s/-y35QBSIx2jMvG5dNklcPQ
        devtool: isDev ? 'eval-source-map' : 'nosources-source-map',
        // ??????
        cache: {
            type: 'filesystem',
            // buildDependencies: {
            //     config: [__filename],
            // },
            // version: '1.0'
        },
        stats: {
            modules: false,
        },
        module: {
            rules: [
                // ts
                {
                    test: /\.(tsx|ts)$/,
                    include,
                    exclude,
                    use: [
                        {
                            loader: 'babel-loader',
                        },
                        // {
                        //     loader: 'html-loader',
                        //     options: {
                        //         esModule: false
                        //     }
                        // },
                        // {
                        //     loader: 'eslint-loader',
                        //     options: {
                        //         cache: true,
                        //         quiet: true,
                        //     },
                        // },
                    ],
                },
                // less cs
                (() => {
                    const use = [
                        // {
                        //     loader: MiniCssExtractPlugin.loader,
                        //     options: {}
                        // },
                        // ????????????????????? ???????????? style-loader
                        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap,
                                // modules: true,
                            },
                        },
                        {
                            loader: 'scoped-css-loader',
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap,
                            },
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                sourceMap,
                                lessOptions: {
                                    javascriptEnabled: true,
                                },
                            },
                        },
                    ];

                    globalLessData && use.push({
                        loader: 'style-resources-loader',
                        options: {
                            patterns: globalLessData,
                        },
                    });

                    return {
                        test: /\.(less|css)$/,
                        use,
                    };
                })(),
                // ??????
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    type: 'asset',
                    generator: {
                        filename: setFileLocation('[name].[hash:7][ext]'),
                        // dataUrl: (context) => {
                        //     console.log(context);
                        //     return context;
                        // },
                        publicPath: (pathData, assetInfo) => {
                            // console.log(pathData.runtime);
                            // console.log(pathData.filename);
                            /**
                             * ?????? build
                             * pathData.runtime ?????????????????????????????? child
                             * ???????????????????????? main
                             */
                            return pathData.runtime === 'child'
                                ? setAssetsPublicPath(setFileLocation('[name].[hash:7][ext]'), publicPath)
                                : publicPath;
                        },
                    },
                    parser: {
                        dataUrlCondition: {
                            // ?????? 5kb???????????????
                            maxSize: 1024 * 5,
                        },
                    },
                    // use: [
                    //     {
                    //         loader: 'url-loader',
                    //         options: {
                    //             // https://www.jianshu.com/p/c8d3b2a912c3
                    //             // ???file-loader????????????????????????????????????esModule????????????4.3.0??????????????????????????????????????????5.0.0?????????????????????????????????????????????true???
                    //             esModule: false,
                    //             // ?????? 5kb???????????????
                    //             limit: 5120,
                    //             name: setFileLocation('[name].[sha512:hash:base64:7].[ext]'),
                    //         }
                    //     },
                    // ]
                },
                // ??????
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: 'asset',
                    generator: {
                        filename: setFileLocation('[name].[hash:8][ext]'),
                        publicPath: setAssetsPublicPath(setFileLocation('[name].[hash:8][ext]'), publicPath),
                    },
                    parser: {
                        dataUrlCondition: {
                            // ?????? 50kb???????????????
                            maxSize: 1024 * 50,
                        },
                    },
                    // use: [
                    //     {
                    //         loader: 'file-loader',
                    //         options: {
                    //             name: setFileLocation('[name].[sha512:hash:base64:8].[ext]'),
                    //         }
                    //     }
                    // ]
                },
                // {
                //     test: /.html$/,
                //     loader: 'html-loader',
                //     options: {
                //         esModule: false,
                //         options: {
                //             attrs: ['img:src', ':style']
                //         }
                //     }
                // }
            ],
        },
        plugins: [
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: getFullUrl('public'),
                        to: outputPath,
                        noErrorOnMissing: true,
                        globOptions: {
                            ignore: [
                                '**/index.html',
                            ],
                        },
                    },
                ],
            }),
            new MiniCssExtractPlugin(miniCssExtractPluginConfig),
            new WebpackBar({
                name: '??????',
                basic: false,
                // profile: true
            }),
            new HtmlWebpackPlugin({
                template: getFullUrl('public/index.html'),
                title: pageTitle,
                inject: 'head',
                minify: false,
                extraScript,
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    CUSTOM_NODE_ENV: JSON.stringify(env.CUSTOM_NODE_ENV),
                },
            }),
            new ESLintPlugin({
                cache: true,
                quiet: true,
            }),
        ],
        optimization,
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.json'],
            alias: {
                '@': getFullUrl('src'),
            },
        },
    };
};


