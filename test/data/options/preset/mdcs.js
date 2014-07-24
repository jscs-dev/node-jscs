
//"requireSpaceAfterKeywords": ["do", "while", "try", "catch" ]
//"requireCurlyBraces": ["while", "do", "try", "catch"],
var i = 0;
var l = 1000;

while ( i < l ) {

	try {

		i ++;

	} catch ( e ) {

		throw "this is a test"

	}

}
do {

	i ++;

} while ( i < l );

// "requirePaddingNewlinesInBlocks": true,
//"requireSpaceAfterKeywords": ["if", "else", "return" ],
//"requireSpacesInFunctionExpression": {
//    "beforeOpeningCurlyBrace": true
//},

if ( i < l ) {

	function test( object, geometry ) {

		return ;

	}

} else {

	function test( object, geometry ) {

		return null;

	}

}

//"requireSpaceAfterKeywords": ["for", "switch"]
//"requireSpaceBeforeBlockStatements": true
//"requireSpaceAfterPrefixUnaryOperators": ["++", "--"],
for ( var i = 0; i < l; i ++ ) {

	switch ( i ) {

		case 0: this.x = i --; break;
		case 1: this.y = ++ i; break;
		case 2: this.z = -- i; break;
		default: throw new Error( "index is out of range: " + index );

	}

}

//"requireSpacesInsideObjectBrackets": "all",
//"requireSpacesInsideArrayBrackets": "allButNested",
//"disallowSpaceBeforeBinaryOperators": [","]
var a = { test : { test2 : true },  test3 : { test4 : true } };
var b = [[ 1, 2 ], [ 3, 4 ], [ 5, 6 ]];

//"requireSpaceBeforeBinaryOperators": [ "+", "-", "/", "*", "=", "==", "===", "!=", "!==", ">", ">=", "<", "<=" ]
//"requireSpaceAfterBinaryOperators": [ "+", "-", "/", "*", "=", "==", "===", "!=", "!==", ">", ">=", "<", "<=" ]
//"requireSpacesInConditionalExpression": { "afterTest": true, "beforeConsequent": true, "afterConsequent": true, "beforeAlternate": true}
var c = (( d + e - f / g * h ) == i);
var j = k ? l : m;
//"requireLineFeedAtFileEnd": true,
