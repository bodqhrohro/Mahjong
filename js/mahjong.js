define(function(require) {
	return {
		//depends on font!
		_walkRectangle: function(level, coords, callback) {
			var i = coords.top, j
			var ret = function() {
				try {
					callback(this.map[level][i][j])
				} catch(e) {
					callback(null)
				}
			}.bind(this)

			for (j=coords.left; j<coords.right; j++) ret()
			for (i=coords.top; i<coords.bottom; i++) ret()
			for (; j>coords.left; j--) ret()
			for (; i>coords.top; i--) ret()
		},
		fill: function() {
			var tiles4 = "qwertyuioasdfghjklzxcvbnm,.1234567"
			var tiles1 = "p;/`=[]\\"

			var tileSet = _.shuffle(
				tiles4 + tiles4
			).reduce(function(prev, cur) {
				return prev.concat(_.times(2, _.constant(cur)))
			}, [])

			_.shuffle(tiles1).forEach(function(item) {
				tileSet.splice(_.random(tileSet.length), 0, item)
			})

			var height = this.map[0].length
			,   width = this.map[0][0].length
			,   startx = Math.floor(width/2)
			,   starty = Math.floor(height/2)
			,   dim = {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0
			}, i, sliceCount, slice

			this.map.forEach(function(level, z) {
				dim.left = startx-1
				dim.right = startx
				dim.top = starty-1
				dim.bottom = starty

				do {
					sliceCount = 0

					this._walkRectangle(z, dim, function(cell) {
						if (cell && cell.present) {
							sliceCount++
						}
					})

					slice = _.shuffle(tileSet.splice(0, sliceCount))
					i = 0

					this._walkRectangle(z, dim, function(cell) {
						if (cell && cell.present) {
							cell.value = slice[i++]

							var content = $(cell.node).find('.mahjong-tile-content')
							content.text(cell.value)
							if (tiles1.indexOf(cell.value) > -1) {
								content.addClass('foreign-glyph')
							}
						}
					})

					if (!sliceCount) break

					dim.left--
					dim.top--
					dim.right++
					dim.bottom++
				} while (
					dim.left > -1 ||
					dim.top > -1 ||
					dim.right < width ||
					dim.bottom < height
				)
			}.bind(this))
		},
		shuffle: function() {
			var mahjong = this

			this.map = require('tile-field')()

			var tileTemplate = _.template($('#tileTemplate').html())

			this.map.forEach(function(level, z) {
				level.forEach(function(row, y) {
					row.forEach(function(cell, x) {
						if (cell.present) {
							var $tile = $(tileTemplate())
								.appendTo(mahjong.container)
								.css({
									'top': cell.y * mahjong.yscale + 'em',
									'left': cell.x * mahjong.xscale + 'em',
									'z-index': z
								})
								.data('coords', {
									x: x,
									y: y,
									z: z
								})
							$tile.find('.mahjong-tile-content')
								.html('A')

							cell.node = $tile.get(0)
						}
					})
				})
			})
			
			this.fill()
		},
		setContainer: function(selector) {
			this.container = selector
		},
		scale: function(coef) {
			this.xscale = coef
			this.yscale = 1.4 * coef
		}

	}
})
