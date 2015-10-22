/**
Copyright 2005, 2014 jQuery Foundation and other contributors,
https://jquery.org/

This software consists of voluntary contributions made by many
individuals. For exact contribution history, see the revision history
available at https://github.com/jquery/jquery

The following license applies to all parts of this software except as
documented below:

====

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

====

All files located in the node_modules and external directories are
externally maintained libraries used by this software which have their
own licenses; we recommend you read them, as their terms may differ from
the terms above.
**/

jQuery.extend = jQuery.fn.extend = function() {

  // Rule: requireMultipleVarDecl: "onyvar"
  // Rule: requirePaddingNewLinesBeforeLineComments
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[ 0 ] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Rule: validateQuoteMarks: ""
  if ( typeof target === "boolean" ) {

    // Rule: requireSpacesInAnonymousFunctionExpression: before curly
    // Rule: disallowSpacesInAnonymousFunctionExpression: before opening round brace
    $( "#foo" ).click( function() {
    } );
  }

  // Rule: disallowMultipleLineBreaks
  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {

    // Modified for Rule: requireCurlyBraces
    try {

      // Rule: requireSpacesInsideObjectBrackets
      target = { foo: "bar" };
    } catch ( e ) {
      throw e;
    }
  }

  // Rule: requireParenthesesAroundIIFE
  ( function() {

  } )();

  // Only deal with non-null/undefined values
  if ( ( options = arguments[ i ] ) != null ) {

    // Extend the base object
    for ( name in options ) {

      // Prevent never-ending loop
      if ( target === copy ) {

        // Rule: disallowSpaceAfterPrefixUnaryOperators
        ++i;

        // Rule: disallowSpaceBeforePostfixUnaryOperators
        i++;
        continue;
      }

      // Rule: requireOperatorBeforeLineBreak
      if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
          ( copyIsArray = jQuery.isArray( copy ) ) ) ) {

      // Don't bring in undefined values
      } else if ( copy !== undefined ) {

        // Rule: requireSpacesInsideArrayBrackets
        target[ name ] = copy;
      }
    }
  }

  // Return the modified object
  return target;
};

// Rule: maximumLineLength
// Long comment with a URL ................................................................. http://www.google.com
// Regex
var seventyeightchars = /............................................................................../;

// Rule: requireSpacesInFunctionExpression: before curly
var each = function( obj, callback, args ) {

  // Rule: commaBeforeLineBreak
  var value,
    i = 0,

    // Rule: requireDotNotation
    length = obj.length,

    // Rule: requireCamelCaseOrUpperCaseIdentifiers
    isArray = isArraylike( obj );

  if ( args ) {
    if ( isArray ) {
      for ( ; i < length; i++ ) {

        // Rule: requireSpaceBetweenArguments
        value = callback.apply( obj[ i ], args );

        // Rule: requireSpaceAfterBinaryOperators
        if ( value === false ) {
          break;
        }
      }

    // Rule: disallowKeywordsOnNewLine
    } else {
      for ( i in obj ) {
        value = callback.apply( obj[ i ], args );

        // Rule: requireSpacesInConditionalExpression
        if ( value === false ) {
          break;
        }
      }
    }
  }
};

// Rule: requireSpacesInNamedFunctionExpression: before curly
// Rule: disallowSpacesInNamedFunctionExpression: before opening round brace
function isArraylike( obj ) {
  var length = obj.length,
    type = jQuery.type( obj );

  // Rule: requireSpaceAfterKeywords
  if ( type === "function" || jQuery.isWindow( obj ) ) {
    return false;
  }

  if ( obj.nodeType === 1 && length ) {
    return true;
  }

  return type === "array" || length === 0 ||
    typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
