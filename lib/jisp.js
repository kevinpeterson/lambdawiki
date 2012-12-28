//var program = process.argv[2];

var converter = new Showdown.converter();

var ops = {
	'-' : function(args, env){
		    var total = parseInt(executeExpression(args[0], env));
			for(var i=1;i<args.length;i++){
				total -=  parseInt(executeExpression(args[i], env));
			}
			return total;
		},
	'=' : function(args, env){
			var arg1 = executeExpression(args[0], env)
			var arg2 = executeExpression(args[1], env)
			return (arg1 == arg2);
		},
	'+' : function(args, env){
		    var total = 0;
			for(var i in args){
				total +=  parseInt(executeExpression(args[i], env));
			}
			return total;
		},
	'length' : function(args, env){
		    return executeExpression(args[0], env).content.length;
		},
	'dotPath' : function(args, env){
			var dotPath = executeExpression(args[0], env)
			var json = executeExpression(args[1], env)
		    return json[dotPath];
		},
	'subseq' : function(args, env){
			var start = executeExpression(args[0], env);

			if(args.length == 2){
				var list = executeExpression(args[1], env);
				return list.slice(start);
			} else if(args.length == 3){
				var end = executeExpression(args[1], env);
				var list = executeExpression(args[2], env).content;
				return new List(list.slice(start, end));
			}
		},
	'nth' : function(args, env){
			var pos = executeExpression(args[0], env);
		    var list = executeExpression(args[1], env).content;

		    return list[pos];
		},
	'list' : function(args, env){
		    var list = [];
			for(var i in args){
				list.push(executeExpression(args[i], env));
			}
			return new List(list);
		},
	'begin' : function(args, env){
			for(var i=0;i<args.length-1;i++){
				executeExpression(args[i], env);
			}
			return executeExpression(args[args.length-1], env);
		},
	'if' : function(args, env){
			var bool = executeExpression(args[0], env);
			if(bool == true){
				return executeExpression(args[1], env);
			} else {
				return executeExpression(args[2], env);
			}
		},
	'json' : function(args, env){
			var url = executeExpression(args[0], env);
			var fn = executeExpression(args[1], env);
			$.ajax({
			        async: true,
			        type: "GET",
			        contentType: "application/json; charset=utf-8",
			        dataType: "json",
			        url: url,
			        success: function(jsonData) {
			            fn(new Array(jsonData), env);
			        },
			        error: function(){
			        	//
			        }
			    });

		},
	'import' : function(args, env){
		    var str = "";
			for(var i in args){
				var importedPage = executeExpression(args[i], env);
				var jsonStringData;

				var url = './'+importedPage+'/code';

				$.ajax({
			        async: false,
			        type: "GET",
			        contentType: "application/json; charset=utf-8",
			        dataType: "json",
			        url: url,
			        success: function(jsonData) {
			            jsonStringData = jsonData.data;
			        },
			        error: function(){
			        	jsonStringData = null;
			        }
			    });
				str += jsonStringData;
			}

			if(jsonStringData){
				evalLisp(str, function(){});
			}

			return null;
		},
	'concat' : function(args, env){
		    var str = "";
			for(i in args){
				str += executeExpression(args[i], env);
			}
			return str;
		},
	'defun' : function(args, env){
			var fnName = args.shift();
			var fnArgs = args.shift();
			var fnBody = args.shift();
			var fn = function(params, env){
				for(var i in fnArgs){
					var arg = fnArgs[i];
					var value = executeExpression(params[i], env);
					env[arg] = value;
				}
				return executeExpression(fnBody.slice(), env);
			}
		    ops[fnName] = fn;
		},
	'markdown' : function(args, env){
			return converter.makeHtml(ops['concat'](args, env));
		},
	'print' : function(args, env){
			if(args.length == 1){
				env.out(null, executeExpression(args[0], env));
			} else if(args.length == 2){
				env.out(
					executeExpression(args[0], env),
					executeExpression(args[1], env));
			}
		}
}

function getLambda(args, env){
	var fnArgs = args.shift();
	var fnBody = args.shift();
	return function(params, env){
		for(var i in fnArgs){
			var arg = fnArgs[i];
			var value = executeExpression(params[i], env);
			env[arg] = value;
		}
		return executeExpression(fnBody.slice(), env);
	}
}

function List(content) {
    this.content = content;
}

var trim = String.prototype.trim || function(){
	return (this + '').replace(/^\s+|\s+$/g, '');
};

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function evalLisp(program, callbck){
	return execute(parseExpressions(program), callbck);
}

function execute(expressions, callback){
	var env = {out:callback};
	for(var i in expressions){
		callback(null, executeExpression(expressions[i], env));
	}
}

function executeExpression(stack, env){
	if (stack instanceof List){
		return stack;
	}

	if (!Array.isArray(stack)){
		if(stack in env){
			return env[stack];
		} else {
			return stack;
		}
	}

	stack = stack.slice();
	if(env == null){
		throw new Error("Environment is NULL.");
	}
	
	var fn = null;
	var args = [];
	var operator = executeExpression(stack.shift(),env);

	if(operator == 'lambda'){
		return getLambda(stack, env);
	} 

	var fn;
	if (typeof(operator) == "function"){
		fn = operator;
	} else {
		fn = ops[operator];
	}

	if(env[operator]){
		fn = env[operator];
	}

	if(!fn){
		return function(f, env){
			return f(stack, env);
		}
	}

	for(var i=0;i<stack.length;i++){
		var arg = stack[i];
		if(arg in env){
			arg = env[arg];
		}
		args.push(arg);
	}

	return fn(args, env);
}

function getArgName(arg){
	if(arg.indexOf('.') === -1){
		return arg;
	} else {
		return arg.substr(0, arg.indexOf('.'));
	}
}

function parseExpressions(text){
	text = trim.call(text);

	var token = text.charAt(0);

	if (token != '(') {
		//throw new Error('unexepected token: ' + token);
	}

	var inQuotes = false;

	var stack = [];
	var parens = 0;
	var expression = "";

	while(text.length > 0){
		var token = text.charAt(0);
		text = text.substring(1);

		if (token == '"') {
			inQuotes = !inQuotes;
		}

		if(!inQuotes){
			if (token == '(') {
				parens++;
			} else if (token == ')'){
				parens--;
			} 
		}

		expression += token;

		if (parens == '0'){
			if(!isBlank(expression)){
				stack.push(parseExpression(expression));
			}
			expression = "";
		}
		
	}

	return stack;
}

function parseExpression(text){
	text = trim.call(text);

	if (text.charAt(0) != '(') return text;

	var stack = [];
	var token;
	var tokens = '';
	var comment = false;
	var i = 0;
	var expr;

	while (i < text.length){
		token = text.charAt(i++);

		if (comment & token != '"'){
			tokens += token;
			continue;
		} 

		if (token == '(' || token == ')' || (token == ' ' && !comment)){
			if (expr && tokens.length){
				var n = +tokens;
				var stripped = tokens.replace(/^\"|\"$/g, "");
				expr.push(isNaN(n) ? stripped : n);
			}
			tokens = '';
		} else {
			if (token == '"') comment = !comment;
			if (!/\s/.test(token) || comment) tokens += token;
		}

		if (token == '('){

			var previous = expr;
			expr = [];

			if (previous){
				// push the previous expresion to the stack
				stack.push(previous);
				// if expr is not top-level, append the expression
				previous.push(expr);
			}

		} else if (token == ')'){

			// pop one from stack
			var pop = stack.pop();
			// stack is empty, so expr is the top-level expression
			if (!pop) return expr;
			expr = pop;

		}

	}

	//throw new Error('unbalanced parentheses');

};

//execute(parseExpressions(program));