( function ( global ) {
	var APP,
		hasOwn = Object.prototype.hasOwnProperty;

	function upHere() {}

	/**
	 * Example description.
	 *
	 * @class
	 *
	 * @constructor
	 * @param {string} id
	 * @param {Object} options
	 * @return {jQuery.Promise}
	 */
	APP.Example = function ( id, options ) {
		var name, inline, bar;

		this.total = upHere() + id;

		name = options.bar ? upHere( id ) : id;

		if ( options.quux ) {
			name += options.quux;
		}

		if ( bar &&
			bar.hasData() &&
			bar.getName() !== name &&
			!bar.isQuux()
		) {
			return;
		}

		inline = function named( items ) {
			try {
				return APP.loop( items );
			} catch ( e ) {
			}
			return null;
		};

		this.data = [
			typeof bar,
			inline()
		];
	};

	APP.loop = function ( items ) {
		var i, len, item, key,
			ret = {};

		for ( i = 0, len = items.length; i < len; i++ ) {
			if ( items[i] !== null ) {
				item = items[i];
				break;
			}
		}

		if ( !item ) {
			return;
		}

		for ( key in item ) {
			if ( hasOwn.call( item, key ) ) {
				ret[key] = new APP.Example( item[key] );
			}
		}

		return ret;
	};

	APP.fall = function ( code ) {
		switch ( code ) {
			case 200:
				break;
			default:
				return null;
		}
	};

	APP.example = new APP.Example( 'banana', {
		first: 'Who',
		second: 'What',
		third: 'I don\'t know'
	} );

	global.APP = APP;

}( this ) );
