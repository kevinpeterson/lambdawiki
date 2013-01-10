#λ(wiki) = LambdaWiki
##What is it?
LambdaWiki is a collaborative web environment (like a wiki) where pages are written in a LISP-like style. This wiki is updated at real time -- any edits from other users will be displayed as they come in on your screen.

To get started, browse the [API](https://github.com/kevinpeterson/lambdawiki/wiki/API) documentation and visit the [kitchen sink](https://github.com/kevinpeterson/lambdawiki/wiki/kitchensink) to see some examples.

[Try out the Demo](http://lambdawiki.kevinp.me)

##Why?
Functional programming help simplify editing wiki content. Functions can be defined to create HTML lists, forms, styled divs, etc. And, if you are a developer that loves to write code but hates writing documentation -- why not just make your documentation code too?

##Installation
    git clone https://github.com/kevinpeterson/lambdawiki.git

    npm install

    node server.js [-nodb] [-p]
    	-p: Port (5000 default)
    	-nodb: Don't persist changes (Redis is used by default if omitted)

A LambdaWiki should now be runnint at http://localhost:8000

##Usage
See the [API](https://github.com/kevinpeterson/lambdawiki/wiki/API) documentation and [some examples](https://github.com/kevinpeterson/lambdawiki/wiki/kitchensink).

##Demo
[Try it out here!](http://lambdawiki.kevinp.me)
Hλppy editing!

