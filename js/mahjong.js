define(function(require) {
	return {
		shuffle: function() {
			var mahjong = this

			var tileField = require('tile-field')
			tileField = new tileField()

			var tileTemplate = _.template($('#tileTemplate').html())

			tileField.map.forEach(function(level, z) {
				level.forEach(function(row) {
					row.forEach(function(cell) {
						if (cell.present) {
							$(tileTemplate())
								.appendTo(mahjong.container)
								.css({
									'top': cell.y * mahjong.yscale + 'em',
									'left': cell.x * mahjong.xscale + 'em',
									'z-index': z
								})
						}
					})
				})
			})
		},
		setContainer: function(selector) {
			this.container = selector
		},
		scale: function(coef) {
			this.xscale = coef
			this.yscale = 1.4 * coef
		}

	}

	/*$(tileTemplate())
		.appendTo('#gameViewport')
		.css({
			'top': 20-i*0.3+'em',
			'left': 5+j*5+i*0.3+'em'
		})*/
})
