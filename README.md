node-jscs [![Build Status](https://travis-ci.org/mdevils/node-jscs.png?branch=master)](https://travis-ci.org/mdevils/node-jscs)
=========

JSCS — JavaScript Code Style.

`jscs` is a code style checker. `jscs` can check cases, which are not implemeted in jshint,
but it does not duplicate `jshint` functionality, so you should use `jscs` and `jshint` together.

Installation
------------

`jscs` can be installed using `npm`:

```
npm install jscs
```

To run `jscs`, you can use the following command from the project root:

```
./node_modules/.bin/jscs path[ path[...]]
```

Configuration
-------------

`jscs` is configured using `.jscs.json` file, located in the project root.

Example configuration:

```javascript
{
    /*
        Option: require_curly_braces
        Requires curly braces after statements.

        Valid example:

        if (x) {
            x++;
        }

        Invalid example:

        if (x) x++;
    */
    "require_curly_braces": ["if", "else", "for", "while", "do"],

    /*
        Option: require_space_after_keywords
        Requires space after keyword.

        Valid example:

        return true;

        Invalid example:

        if(x) {
            x++;
        }
    */
    "require_space_after_keywords": ["if", "else", "for", "while", "do", "switch", "return"],

    /*
        Option: disallow_space_after_keywords
        Disallows space after keyword.

        Valid example:

        if(x > y) {
            y++;
        }
    */
    "disallow_space_after_keywords": ["if", "else", "for", "while", "do", "switch"],

    /*
        Option: disallow_multiple_var_decl
        Disallows multiple var declaration.

        Valid example:

        var x = 1;
        var y = 2;

        Invalid example:

        var x = 1,
            y = 2;
    */
    "disallow_multiple_var_decl": true,

    /*
        Option: require_multiple_var_decl
        Requires multiple var declaration.

        Valid example:

        var x = 1,
            y = 2;

        Invalid example:

        var x = 1;
        var y = 2;
    */
    "require_multiple_var_decl": true,

    /*
        Option: disallow_spaces_inside_object_brackets
        Disallows space after opening object curly brace and before closing.

        Valid example:

        var x = {a: 1};

        Invalid example:

        var x = { a: 1 };
    */
    "disallow_spaces_inside_object_brackets": true,

    /*
        Option: require_spaces_inside_object_brackets
        Possible values: "all" for strict mode, "all_but_nested" ignores closing brackets in a row.
        Disallows space after opening object curly brace and before closing.

        Valid example for mode "all":

        var x = { a: { b: 1 } };

        Valid example for mode "all_but_nested":

        var x = { a: { b: 1 }};

        Invalid example:

        var x = {a: 1};
    */
    "require_spaces_inside_object_brackets": "all",

    /*
        Option: disallow_quotes_for_keys
        Disallows quotes for object keys if possible.

        Valid example:

        var x = {a: 1};

        Invalid example:

        var x = {'a': 1};
    */
    "disallow_quotes_for_keys": true,

    /*
        Option: disallow_left_sticked_operators
        Disallows sticking operators to the left.

        Valid example:

        x = y ? 1 : 2;

        Invalid example:

        x = y? 1 : 2;
    */
    "disallow_left_sticked_operators": ["?", "+", "-", "/", "*", "=", "==", "===", "!=", "!==", ">", ">=", "<", "<="],

    /*
        Option: require_right_sticked_operators
        Requires sticking operators to the left.

        Valid example:

        x = !y;

        Invalid example:

        x = ! y;
    */
    "require_right_sticked_operators": ["!"],

    /*
        Option: disallow_right_sticked_operators
        Disallows sticking operators to the right.

        Valid example:

        x = y + 1;

        Invalid example:

        x = y +1;
    */
    "disallow_right_sticked_operators": ["?", "+", "/", "*", ":", "=", "==", "===", "!=", "!==", ">", ">=", "<", "<="],

    /*
        Option: disallow_right_sticked_operators
        Requires sticking operators to the right.

        Valid example:

        x = [1, 2];

        Invalid example:

        x = [1,2];
    */
    "require_left_sticked_operators": [","],

    /*
        Option: disallow_implicit_type_conversion
        Disallows implicit type conversion.

        Valid example:

        x = Boolean(y);
        x = Number(y);
        x = String(y);
        x = s.indexOf('.') !== -1;

        Invalid example:

        x = !!y;
        x = +y;
        x = '' + y;
        x = ~s.indexOf('.');
    */
    "disallow_implicit_type_conversion": ["numeric", "boolean", "binary", "string"],

    /*
        Option: disallow_keywords
        Disallows usage of specified keywords.

        Invalid example:

        with (x) {
            prop++;
        }
    */
    "disallow_keywords": ["with"],

    /*
        Option: disallow_muliple_line_breaks
        Disallows multiple blank lines in a row.

        Invalid example:

        var x = 1;


        x++;
    */
    "disallow_muliple_line_breaks": true,

    /*
        Option: disallow_keywords_on_new_line
        Disallows placing keywords on a new line.

        Valid example:

        if (x < 0) {
            x++;
        } else {
            x--;
        }

        Invalid example:

        if (x < 0) {
            x++;
        }
        else {
            x--;
        }
    */
    "disallow_keywords_on_new_line": ["else"],

    /*
        Option: require_keywords_on_new_line
        Requires placing keywords on a new line.

        Valid example:

        if (x < 0) {
            x++;
        }
        else {
            x--;
        }

        Invalid example:

        if (x < 0) {
            x++;
        } else {
            x--;
        }
    */
    "require_keywords_on_new_line": ["else"],

    /*
        Option: require_line_feed_at_file_end
        Requires placing line feed at file end.
    */
    "require_line_feed_at_file_end": true,

    /*
        Option: validate_jsdoc
        Enables jsdoc validation.

        Option: validate_jsdoc.check_param_names
        Ensures param names in jsdoc and in function declaration are equal.

        Option: validate_jsdoc.require_param_types
        Ensures params in jsdoc contains type.

        Option: validate_jsdoc.check_redundant_params
        Reports redundant params in jsdoc.
    */
    "validate_jsdoc": {
        "check_param_names": true,
        "check_redundant_params": true,
        "require_param_types": true
    },

    /*
        Option: exclude_files
        Disables style checking for specified paths.
    */
    "exclude_files": ["node_modules/**"]
}

