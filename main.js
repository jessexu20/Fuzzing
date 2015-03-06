var test = require('tap').test,
    //fuzzer = require('fuzzer'),
    Random = require('random-js')
    marqdown = require('./marqdown.js'),
    fs = require('fs'),
    //stackTrace = require('stack-trace')
    stackTrace = require('stacktrace-parser')
    ;

var fuzzer = 
{
    random : new Random(Random.engines.mt19937().seed(0)),
    
    seed: function (kernel)
    {
        fuzzer.random = new Random(Random.engines.mt19937().seed(kernel));
    },

    mutate:
    {
        string: function(val)
        {
            // MUTATE IMPLEMENTATION H	ERE
            var array = val.split('');

            if( fuzzer.random.bool(0.05) )
            {
                // REVERSE
				array=array.reverse();
				//Repeat
				
            }
			if( fuzzer.random.bool(0.25)){
				//remove random
				array=array.splice(fuzzer.random.integer(0,array.length),fuzzer.random.integer(0,array.length-1));
				//insert random
				var insertedArray=fuzzer.random.string(5).split('');
				// console.log(insertedArray);
				array=array.splice.apply(array, [fuzzer.random.integer(0,array.length), 0].concat(insertedArray));
			}
			
			

            return array.join('');
			
			
        }
	}
	

};

fuzzer.seed(0);

var failedTests = [];
var reducedTests = [];
var passedTests = 0;

function mutationTesting()
{
    var markDown; 
    // var markDown = fs.readFileSync('simple.md','utf-8');

    for (var i = 0; i < 1000; i++) {
		if(i%2==0)
			markDown= fs.readFileSync('test.md','utf-8');
		else markDown = fs.readFileSync('simple.md','utf-8');
        var mutuatedString = fuzzer.mutate.string(markDown);
		
        try
        {
            marqdown.render(mutuatedString);
            passedTests++;
        }
        catch(e)
        {
            failedTests.push( {input:mutuatedString, stack: e.stack} );
        }
    }

    // RESULTS OF FUZZING
	var reduced={};
    for( var i =0; i < failedTests.length; i++ )
    {
        var failed = failedTests[i];

        var trace = stackTrace.parse( failed.stack );
        var msg = failed.stack.split("\n")[0];
        console.log( msg, trace[0].methodName, trace[0].lineNumber );
		
		var key=msg+trace[0].methodName+trace[0].lineNumber;
		reduced[key]=failed.input;
    }
	for(var key in reduced)
		reducedTests.push(reduced[key]);

    console.log( "passed {0}, failed {1}, reduced {2}".format(passedTests, failedTests.length, reducedTests.length) );
	// console.log(reducedTests);
}

mutationTesting();

//test('markedMutation', function(t) {
//
//});


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}