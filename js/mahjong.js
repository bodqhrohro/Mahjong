define(function(require) {
	return {
		BING: "qwertyuio",
		TIAO: "zxcvbnm,.",
		WAN: "asdfghjkl",
		WIND: "1234",
		DRAGON: "567",
		FLOWER: "=[]\\",
		SEASON: "p;/`",
		TILE_NONE: 0,
		TILE_PRESENT: 1,
		TILE_YSHIFTED: 2,
		TILE_XSHIFTED: 3,
		TILE_XYSHIFTED: 4,

		_history: [],
		
		_isFree: function(node) {
			return this._isTop(node) && !this._isLocked(node)
		},
		_isLocked: function(node) {
			var coords = $(node).data('coords')
			return coords.x &&
				coords.x < this.map[0][0].length-1 && (
					this.map[coords.z][coords.y][coords.x-1].present || coords.y && (
						this.map[coords.z][coords.y-1][coords.x-1].present == this.TILE_YSHIFTED ||
						this.map[coords.z][coords.y-1][coords.x-1].present == this.TILE_XYSHIFTED
					)
				) && (
					this.map[coords.z][coords.y][coords.x+1].present || coords.y && (
						this.map[coords.z][coords.y-1][coords.x+1].present == this.TILE_YSHIFTED ||
						this.map[coords.z][coords.y-1][coords.x+1].present == this.TILE_XYSHIFTED
					)
				)
		},
		_isTop: function(node) {
			var coords = $(node).data('coords')
			if (coords.z+1 < this.map.length) {
				var topLayer = this.map[coords.z+1]
				return (
					topLayer[coords.y][coords.x].present || (
						coords.y && (
							topLayer[coords.y-1][coords.x].present == this.TILE_YSHIFTED ||
							topLayer[coords.y-1][coords.x].present == this.TILE_XYSHIFTED
						)
					) || (
						coords.x && (
							topLayer[coords.y][coords.x-1].present == this.TILE_XSHIFTED ||
							topLayer[coords.y][coords.x-1].present == this.TILE_XYSHIFTED
						)
					) || (
						coords.x && coords.y &&
						topLayer[coords.y-1][coords.x-1].present == this.TILE_XYSHIFTED
					)
				) ? false : true
			} else {
				return true
			}
		},
		//depends on font!
		_match: function(value1, value2) {
			return value1 == value2 ||
				this.FLOWER.indexOf(value1) > -1 && this.FLOWER.indexOf(value2) > -1 ||
				this.SEASON.indexOf(value1) > -1 && this.SEASON.indexOf(value2) > -1
		},
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
		//depends on font!
		shuffle: function() {
			var tiles4 = this.BING + this.WAN + this.TIAO + this.WIND + this.DRAGON
			var tiles1 = this.FLOWER + this.SEASON

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
		init: function() {
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

							cell.node = $tile.get(0)
						}
					})
				})
			})

			$(this.container).delegate('.mahjong-tile', 'click', function() {
				if (!mahjong._isFree(this)) {
					return false
				}

				$(this).addClass('selected')

				if (mahjong._firstSelected) {
					var $node1 = $(mahjong._firstSelected)
					,   $node2 = $(this)
					,   coords1 = $node1.data('coords')
					,   coords2 = $node2.data('coords')
					,   cell1 = mahjong.map[coords1.z][coords1.y][coords1.x]
					,   cell2 = mahjong.map[coords2.z][coords2.y][coords2.x]

					if (mahjong._match(cell1.value, cell2.value)) {
						$node1.hide()
						$node2.hide()
						mahjong._history.push(cell1.present)
						mahjong._history.push(cell2.present)
						cell1.present = mahjong.TILE_NONE
						cell2.present = mahjong.TILE_NONE
					} else {
						$(this).removeClass('selected')
						$(mahjong._firstSelected).removeClass('selected')
						delete mahjong._firstSelected
					}
				} else {
					mahjong._firstSelected = this
				}
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
})
