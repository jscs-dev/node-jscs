// A. Parens, Braces, Linebreaks


// if/else/for/while/try always have spaces, braces and span multiple lines
// this encourages readability

// 2.A.1.1
// Use whitespace to promote readability

if ( condition ) {

}

while ( condition ) {

}

for ( ; i < length; i++ ) {

}

for ( prop in object ) {

}

if ( true ) {

} else {

}

// B. Assignments, Declarations, Functions ( Named, Expression, Constructor )

// 2.B.1.2
// Using only one `var` per scope (function) promotes readability
// and keeps your declaration list free of clutter (also saves a few keystrokes)

// or..
var
foo = "",
bar = "",
quux;

// 2.B.1.3
// var statements should always be in the beginning of their respective scope (function).

// Good
function foo() {
  var bar = "",
    qux;

  // all statements after the variables declarations.
}

// 2.B.1.4
// const and let, from ECMAScript 6, should likewise be at the top of their scope (block).

// Good
function foo() {
  let foo;
  if ( condition ) {
    let bar = "";

  }
}

// 2.B.2.1
// Named Function Declaration
function foo( arg1, argN ) {

}

// Usage
foo( arg1, argN );

// 2.B.2.2
// Named Function Declaration
function square( number ) {
  return number * number;
}

// Usage
square( 10 );

// Really contrived continuation passing style
function square( number, callback ) {
  callback( number * number );
}

square( 10, function( square ) {
  // callback statements
});

// 2.B.2.3
// Function Expression
function a() {
    var square = function( number ) {
      // Return something valuable and relevant
      return number * number;
    };
}

// Function Expression with Identifier
// This preferred form has the added value of being
// able to call itself and have an identity in stack traces:
function b() {
    var factorial = function factorial( number ) {
      if ( number < 2 ) {
        return 1;
      }

      return number * factorial( number - 1 );
    };
}

// 2.B.2.4
// Constructor Declaration
function FooBar( options ) {
  this.options = options;
}

// Usage
function c() {
    var fooBar = new FooBar({ a: "alpha" });
    fooBar.options;
    // { a: "alpha" }
}

// 2.C.1.1
// Functions with callbacks
foo(function() {
  // Note there is no extra space between the first paren
  // of the executing function call and the word "function"
});

// Function accepting an array, no space
foo([ "alpha", "beta" ]);

// 2.C.1.2
// Function accepting an object, no space
foo({
  a: "alpha",
  b: "beta"
});

// ** new rule **
// Single argument string literal, no space
foo("bar");

// ** new rule **
// Inner grouping parens, no space
if ( !("foo" in obj) ) {

}

// 5.1.1
// A Practical Module

(function( global ) {
  var Module = (function() {

    var data = "secret";

    return {
      // This is some boolean property
      bool: true,
      // Some string value
      string: "a string",
      // An array property
      array: [ 1, 2, 3, 4 ],
      // An object property
      object: {
        lang: "en-Us"
      },
      getData: function() {
        // get the current value of `data`
        return data;
      },
      setData: function( value ) {
        // set the value of `data` and return it
        return ( data = value );
      }
    };
  })();

  // Other things might happen here

  // expose our module to the global object
  global.Module = Module;

})( this );

// 5.2.1
// A Practical Constructor

(function( global ) {

  function Ctor( foo ) {

    this.foo = foo;

    return this;
  }

  Ctor.prototype.getFoo = function() {
    return this.foo;
  };

  Ctor.prototype.setFoo = function( val ) {
    return ( this.foo = val );
  };


  // To call constructor's without `new`, you might do this:
  var ctor = function( foo ) {
    return new Ctor( foo );
  };


  // expose our constructor to the global object
  global.ctor = ctor;

})( this );
