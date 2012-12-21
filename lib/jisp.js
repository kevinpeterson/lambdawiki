//var program = process.argv[2];

var ops = {
	'-' : function(args, env){
		    var total = 0;
			for(var i in args){
				total -=  parseInt(executeExpression(args[i], env));
			}
			return total;
		},
	'+' : function(args, env){
		    var total = 0;
			for(var i in args){
				total +=  parseInt(executeExpression(args[i], env));
			}
			return total;
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
			var fn = function(params){
				for(var i in fnArgs){
					var arg = fnArgs[i];
					var value = params[i];
					env[arg] = value;
				}
				return executeExpression(fnBody.slice(), env);
			}
		    ops[fnName] = fn;
		},
	'echo' : function(args, env){
			for(var i in args){
				console.log(executeExpression(args[i], env));
			}	
			return null;
		}
}

var trim = String.prototype.trim || function(){
	return (this + '').replace(/^\s+|\s+$/g, '');
};

function evalLisp(program, callbck){
	return execute(parseExpressions(program), callbck);
}

function execute(expressions, callback){
	var env = {};
	for(var i in expressions){
		callback(executeExpression(expressions[i], env));
	}
}

function executeExpression(stack, env){
	if (!Array.isArray(stack)) return stack;
	if(env == null){
		throw new Error("Environment is NULL.");
	}
	
	var fn = null;
	var args = [];
	var fn = ops[stack.shift()];

	for(var i=0;i<stack.length;i++){
		var arg = stack[i];
		if(env[arg]){
			arg = env[arg];
		}
		args.push(arg);
	}

	return fn(args, env);
}

function parseExpressions(text){
	text = trim.call(text);

	var token = text.charAt(0);

	if (token != '(') {
		//throw new Error('unexepected token: ' + token);
	}

	var stack = [];
	var parens = 0;
	var expression = "";

	while(text.length > 0){
		var token = text.charAt(0);
		text = text.substring(1);

		if (token == '(') {
			parens++;
		} else if (token == ')'){
			parens--;
		} 

		expression += token;

		if (parens == '0'){
			stack.push(parseExpression(expression));
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