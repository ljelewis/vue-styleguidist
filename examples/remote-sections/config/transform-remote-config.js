const documentToHtmlString = require('@contentful/rich-text-html-renderer').documentToHtmlString
const { get, map, partial, matchesProperty, find } = require('lodash')

function getContentfulFieldValue(contentfulEntry, fieldPath) {
	return get(contentfulEntry, 'fields.' + fieldPath)
}

function extractContentfulEntrySections(contentfulEntry, relatedEntries) {
	return map(
		getContentfulFieldValue(contentfulEntry, 'sections'),
		partial(parseContentfulSection, relatedEntries)
	)
}

function parseContentfulSection(relatedEntries, sectionLinkObj) {
	const section = find(relatedEntries, matchesProperty('sys.id', get(sectionLinkObj, 'sys.id')))

	const fields = get(section, 'fields')

	if (fields.content) {
		fields.content = documentToHtmlString(fields.content)
	}

	return fields
}

module.exports = function transformRemoteConfig(response, config) {
	const instance = get(response, 'items.0')
	const relatedEntries = get(response, 'includes.Entry')

	return {
		title: getContentfulFieldValue(instance, 'title'),
		sections: extractContentfulEntrySections(instance, relatedEntries, config)
	}
}
