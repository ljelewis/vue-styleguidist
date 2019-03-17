#! /usr/bin/env node
const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')
const Turndown = require('turndown')

const StyleguidistError = require('react-styleguidist/scripts/utils/error')

const defaultConfig = {
	remote: {
		tempPath: './.tmp/'
	}
}

function makeRemoteUriFromConfig(config) {
	const uri = _.get(config, 'remote.uriBase')
	let queryString = null

	if (!uri) {
		throw new StyleguidistError('Remote config is missing uriBase')
	}

	queryString = _.join(
		_.map(_.get(config, 'remote.uriParams'), (value, key) => {
			return key + '=' + value
		}),
		'&'
	)

	return uri + (queryString ? '?' + queryString : '')
}

function transformResponse(apiResponse, config) {
	const transform = _.get(config, 'remote.transformResponse')
	if (_.isFunction(transform)) {
		return transform(apiResponse, config)
	}

	return apiResponse
}

function mergeConfig(remoteConfig, srcConfig) {
	return _.assign({}, srcConfig, remoteConfig)
}

function processConfigSections(config) {
	const sections = _.get(config, 'sections')
	let turndownService = null

	if (!sections) {
		return config
	}

	turndownService = getTurndownService()

	prepOutputDir(config)

	config.sections = processSections(sections, config, turndownService)

	return config
}

function processSections(sections, fullConfig, turndownService) {
	return _.map(sections, _.partial(processSection, _, fullConfig, turndownService))
}

function processSection(section, fullConfig, turndownService) {
	const tempRootPath = _.get(fullConfig, 'remote.tempPath')
	const outputMarkdownPath = tempRootPath + _.kebabCase(_.get(section, 'name')) + '.md'
	const markDownContent = turndownService.turndown(_.get(section, 'content'))

	fs.writeFileSync(outputMarkdownPath, markDownContent, 'utf8')

	return _.merge({}, section, {
		content: outputMarkdownPath
	})
}

function getTurndownService() {
	const turndownService = new Turndown()

	turndownService.addRule('transform-code', {
		filter: ['code'],
		replacement(content) {
			return '```\n' + content + '\n```'
		}
	})

	return turndownService
}

function prepOutputDir(config) {
	const tempOutputPath = _.get(config, 'remote.tempPath')

	if (!fs.existsSync(tempOutputPath)) {
		fs.mkdirSync(tempOutputPath, { recursive: true })
	}
}

module.exports = function(srcConfig) {
	const config = _.defaultsDeep({}, srcConfig, defaultConfig)
	let uri = null

	if (!srcConfig.remote) {
		return Promise.resolve(srcConfig)
	}

	uri = makeRemoteUriFromConfig(config)

	return axios
		.get(uri)
		.then(_.ary(_.partial(_.get, _, 'data'), 1))
		.then(_.partial(transformResponse, _, config))
		.then(_.partial(mergeConfig, _, config))
		.then(processConfigSections)
}
