test("Test Parse Simple Expression", function() { 
	var result = parseExpression('(concat "hi" "ya")');
    equal( result[0], "concat"); 
    equal( result[1], "hi"); 
    equal( result[2], "ya"); 
});  

test("Test Parse Simple Expression With Paren", function() { 
	var result = parseExpression('(concat "hi()" "ya()")');
    equal( result[0], "concat"); 
    equal( result[1], "hi()"); 
    equal( result[2], "ya()"); 
});  

test("Test Define Function", function() { 
	var expression = '(defun test (x) (print x)) (test "hi")';
	var i = 0;
    evalLisp(expression, function(result){
    	i++;
    	if(result){
			equal("hi", result);
		}
	});

	equal(3, i);
});  

test("Test Function As Parameter", function() { 
	var expression = '(defun test (x) (lambda (y) (+ x y))) \
					  (defun add (z) (z 99)) \
					  (add (test 1))';
	var i = 0;
    evalLisp(expression, function(result){
    	i++;
    	if(result){
			equal("100", result);
		}
	});

	equal(3, i);
});  

test("Test Define Lambda Function", function() { 
	var expression = '(defun test (x y) (lambda (z) (+ z x y))) ((test 1 1) 1)';
	var i = 0;
    evalLisp(expression, function(result){
    	i++;
    	if(result){
			equal("3", result);
		}
	});

	equal(2, i);
});  

test("Test Parse JavaScript Expression", function() {
	var getScript = 
	"$.getScript('http://agorbatchev.typepad.com/pub/sh/3_0_83/scripts/shBrushJScript.js'\n \
	 type='text/javascript', \n \
		function(data, textStatus){ \n \
   			console.log(textStatus, data); \n \
	 }); \n \
	 </script>"
    var expression = "(concat \"" + getScript + "\")"; 
	
	evalLisp(expression, function(result){
		equal(getScript, result);
	});
}); 
