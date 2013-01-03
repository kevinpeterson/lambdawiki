# This statically renders the page flow.

fs = require 'fs'
Mustache = try
	require 'mustache'
catch e
	{to_html: -> "<body><pre>% npm install mustache</pre> to use this demo."}

showdown = new (require('showdown').converter)()

template = fs.readFileSync "#{__dirname}/lambda.html.mu", 'utf8'

defaultContent = (name) -> """
(concat 
    "Welcome to a page called: #{name}! " 
    (concat "H<b>" "λ" "</b>" "ppy editing!"))
"""

render = (content, name, docName, res) ->
	markdown = showdown.makeHtml content
	html = Mustache.to_html template, {content, markdown, name, docName}
	res.writeHead 200, {'content-type': 'text/html'}
	res.end html

module.exports = (docName, model, res) ->
	name = docName
	docName = "lambda:" + docName

	model.getSnapshot docName, (error, data) ->
		if error is 'Document does not exist'
			model.create docName, 'text', ->
				content = defaultContent(name)
				model.applyOp docName, {op:[{i:content, p:0}], v:0}, ->
					render content, name, docName, res
		else
			render data.snapshot, name, docName, res

