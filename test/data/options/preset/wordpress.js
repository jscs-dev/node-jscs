// Objects
// Object declarations can be made on a single line if they are short (remember the line length guidelines).
// When an object declaration is too long to fit on one line, there must be one property per line.
// Property names only need to be quoted if they are reserved words or contain special characters:
map = {
	ready: 9,
	when: 4,
	'you are': 15
};

// Acceptable for small objects
map = { ready: 9, when: 4, 'you are': 15 };

// Arrays and Function Calls
// Always include extra spaces around elements and arguments:
array = [ a, b ];

foo( arg );

foo( 'string', object );

foo( options, object[ property ] );

foo( node, 'property', 2 );

// Exceptions:
// For consistency with our PHP standards, do not include a space around
// string literals or integers used as key values in array notation:
prop = object['default'];
firstArrayElement = arr[0];

// Function with a callback, object, or array as the sole argument:
// No space on either side of the argument
foo(function() {

	// Do stuff
});

foo({
	a: 'alpha',
	b: 'beta'
});

foo([
	'alpha',
	'beta'
]);

// Function with a callback, object, or array as the first argument:
// No space before the first argument
foo(function() {

	// Do stuff
}, options );

// Function with a callback, object, or array as the last argument:
// No space after after the last argument
foo( data, function() {

	// Do stuff
});

// Examples of Good Spacing
var i;

if ( condition ) {
	doSomething( 'with a string' );
} else if ( otherCondition ) {
	otherThing({
		key: value,
		otherKey: otherValue
	});
} else {
	somethingElse( true );
}

// Unlike jQuery, WordPress prefers a space after the ! negation operator.
// This is also done to conform to our PHP standards.
while ( ! condition ) {
	iterating++;
}

for ( i = 0; 100 > i; i++ ) {
	object[ array[ i ] ] = someFn( i );
	$( '.container' ).val( array[ i ] );
}

try {

	// Expressions
} catch ( e ) {

	// Expressions
}

// Semicolons
// Use them. Never rely on Automatic Semicolon Insertion (ASI).

// Indentation and line breaks add readability to complex statements.
// Tabs should be used for indentation.
// Even if the entire file is contained in a closure (i.e., an immediately invoked function),
// the contents of that function should be indented by one tab:
(function( $ ) {

	// Expressions indented

	function doSomething() {

		// Expressions indented
	}
})( jQuery );

// Blocks and Curly Braces
// if, else, for, while, and try blocks should always use braces, and always go on multiple lines.
// The opening brace should be on the same line as the function definition, the conditional, or the loop.
// The closing brace should be on the line directly following the last statement of the block.
if ( myFunction() ) {

	// Expressions
} else if ( ( a && b ) || c ) {

	// Expressions
} else {

	// Expressions
}

// Multi-line Statements
// When a statement is too long to fit on one line, line breaks must occur after an operator.
// Good
html = '<p>The sum of ' + a + ' and ' + b + ' plus ' + c +
		' is ' + ( a + b + c );

// Lines should be broken into logical groups if it improves readability,
// such as splitting each expression of a ternary operator onto its own line,
// even if both will fit on a single line.
// Acceptable
baz = ( true === conditionalStatement() ) ? 'thing 1' : 'thing 2';

// Better
baz = firstCondition( foo ) && secondCondition( bar ) ?
	qux( foo, bar ) :
	foo;

// When a conditional is too long to fit on one line,
// successive lines must be indented one extra level to distinguish them from the body.
if ( firstCondition() && secondCondition() &&
		thirdCondition() ) {
	doStuff();
}

// Chained Method Calls
// When a chain of method calls is too long to fit on one line, there must be one call per line,
// with the first call on a separate line from the object the methods are called on.
// If the method changes the context, an extra level of indentation must be used
elements
	.addClass( 'foo' )
	.children()
		.html( 'hello' )
	.end()
	.appendTo( 'body' );

// Assignments and Globals
// Declaring Variables With var
// Each function should begin with a single comma-delimited var statement that declares any local variables necessary.
// Assignments within the var statement should be listed on individual lines,
// while declarations can be grouped on a single line. Any additional lines should be indented with an additional tab.
// Good
function a() {
	var k, m, length,

		// Indent subsequent lines by one tab
		value = 'WordPress';
}

// Naming Conventions
// Variable and function names should be full words, using camel case with a lowercase first letter.
// Constructors intended for use with new should have a capital first letter (UpperCamelCase).

// Comments
// Comments come before the code to which they refer, and should always be preceded by a blank line.
// Capitalize the first letter of the comment, and include a period at the end when writing full sentences.
// There must be a single space between the comment token (//) and the comment text.
someStatement();

// Explanation of something complex on the next line
$( 'p' ).doSomething();

/*
This is a comment that is long enough to warrant being stretched
over the span of multiple lines.
*/

// Inline comments are allowed as an exception when used to annotate special arguments in formal parameter lists:
function foo( types, selector, data, fn, /* INTERNAL */ one ) {

	// Do stuff
}

// Equality
// Strict equality checks (===) must be used in favor of abstract equality checks (==).
// The only exception is when checking for both undefined and null by way of null.
// Check for both undefined and null values, for some important reason.
if ( null == undefOrNull ) {

	// Expressions
}

// Strings
// Use single-quotes for string literals:
'strings should be contained in single quotes';

// When a string contains single quotes, they need to be escaped with a backslash (\):
// Escape single quotes within strings:
'Note the backslash before the \'single quotes\'';

// Switch Statements
// Use a break for each case other than default.
// When allowing statements to “fall through,” note that explicitly.
// Indent case statements one tab within the switch.
switch ( event.keyCode ) {

	// ENTER and SPACE both trigger x()
	case $.ui.keyCode.ENTER:
	case $.ui.keyCode.SPACE:
		x();
		break;
	case $.ui.keyCode.ESCAPE:
		y();
		break;
	default:
		z();
}

// It is not recommended to return a value from within a switch statement:
// use the case blocks to set values, then return those values at the end.
function getKeyCode( keyCode ) {
	var result;

	switch ( event.keyCode ) {
		case $.ui.keyCode.ENTER:
		case $.ui.keyCode.SPACE:
			result = 'commit';
			break;
		case $.ui.keyCode.ESCAPE:
			result = 'exit';
			break;
		default:
			result = 'default';
	}

	return result;
}

// Creating arrays in JavaScript should be done using the shorthand [] constructor rather than the new Array() notation.
// You can initialize an array during construction:
myArray = [ 1, 'WordPress', 2, 'Blog' ];

myObj = {};
myObj = new ConstructorMethod();

// Object properties should be accessed via dot notation,
// unless the key is a variable, a reserved word, or a string that would not be a valid identifier:
prop = object.propertyName;
prop = object[ variableKey ];
prop = object['default'];
prop = object['key-with-hyphens'];

// Yoda Conditions
// For consistency with the PHP code standards, whenever you are comparing an object to a string,
// boolean, integer, or other constant or literal, the variable should always be put on the right hand side,
// and the constant or literal put on the left.
if ( true === myCondition ) {

	// Do stuff
}

// Iteration
// When iterating over a large collection using a for loop,
// it is recommended to store the loop’s max value as a variable rather than re-computing the maximum every time:
// Good & Efficient
function a() {
	var i, max;

	// getItemCount() gets called once
	for ( i = 0, max = getItemCount(); i < max; i++ ) {

		// Do stuff
	}
}
