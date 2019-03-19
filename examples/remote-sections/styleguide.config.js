const vueLoader = require('vue-loader')
const transformConfig = require('./config/transform-remote-config.js')

module.exports = {
	title: 'Vue Styleguidist remote sections',
	defaultExample: true,
	ribbon: {
		url: 'https://github.com/vue-styleguidist/vue-styleguidist'
	},
	version: '1.1.1',
	webpackConfig: {
		module: {
			rules: [
				{
					test: /\.vue$/,
					loader: 'vue-loader'
				},
				{
					test: /\.js?$/,
					exclude: /node_modules/,
					loader: 'babel-loader'
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				}
			]
		},

		plugins: [new vueLoader.VueLoaderPlugin()]
	},
	remote: {
		uriBase: 'https://cdn.contentful.com/spaces/hy3w99s1tfx2/environments/master/entries',
		uriParams: {
			access_token: '9a28ebc8b0a451a77600b8fac51987949faa46a29d6efe05a9197d0cd6efa83e',
			content_type: 'instance'
		},
		transformResponse: transformConfig
	},
	usageMode: 'expand',
	exampleMode: 'expand'
}
