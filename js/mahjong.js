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

		_hideCells: function(cell1, cell2) {
			$(cell1.node).fadeOut()
			$(cell2.node).fadeOut()
			cell1.present = -cell1.present
			cell2.present = -cell2.present
			this._history[this._historyPosition++] = cell1
			this._history[this._historyPosition++] = cell2
		},
		_history: [],
		_historyPosition: 0,
		
		_isFree: function(node) {
			return this._isTop(node) && !this._isLocked(node)
		},
		_isLocked: function(node) {
			var coords = $(node).data('coords')
			return coords.x &&
				coords.x < this.map[0][0].length-1 && (
					this.map[coords.z][coords.y][coords.x-1].present > 0 || coords.y && (
						this.map[coords.z][coords.y-1][coords.x-1].present == this.TILE_YSHIFTED ||
						this.map[coords.z][coords.y-1][coords.x-1].present == this.TILE_XYSHIFTED
					)
				) && (
					this.map[coords.z][coords.y][coords.x+1].present > 0 || coords.y && (
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
					topLayer[coords.y][coords.x].present > 0 || (
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
						if (cell && cell.present > 0) {
							sliceCount++
						}
					})

					slice = _.shuffle(tileSet.splice(0, sliceCount))
					i = 0

					this._walkRectangle(z, dim, function(cell) {
						if (cell && cell.present > 0) {
							cell.value = slice[i++]

							var $node = $(cell.node)
							var content = $node.find('.mahjong-tile-content')
							content.text(cell.value)

							if (this.BING.indexOf(cell.value) > -1) {
								$node.addClass('suit-bing')
							} else if (this.TIAO.indexOf(cell.value) > -1) {
								$node.addClass('suit-tiao')
							} else if (this.WAN.indexOf(cell.value) > -1) {
								$node.addClass('suit-wan')
							} else if (this.WIND.indexOf(cell.value) > -1) {
								$node.addClass('suit-wind')
							} else if (this.DRAGON.indexOf(cell.value) > -1) {
								$node.addClass('suit-dragon')
							} else if (this.FLOWER.indexOf(cell.value) > -1) {
								$node.addClass('suit-flower')
								content.addClass('foreign-glyph')
							} else if (this.SEASON.indexOf(cell.value) > -1) {
								$node.addClass('suit-season')
								content.addClass('foreign-glyph')
							}
							$node.addClass('map-level' + z%4)
						}
					}.bind(this))

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
						if (cell.present > 0) {
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
				$('.tile-error').removeClass('tile-error')

				if (!mahjong._isFree(this)) {
					$(this).addClass('tile-error')
					return false
				}

				$(this).addClass('selected')

				if (mahjong._firstSelected) {
					var coords1 = $(this).data('coords')
					,   coords2 = $(mahjong._firstSelected).data('coords')
					,   cell1 = mahjong.map[coords1.z][coords1.y][coords1.x]
					,   cell2 = mahjong.map[coords2.z][coords2.y][coords2.x]

					if (mahjong._match(cell1.value, cell2.value) && mahjong._firstSelected !== this) {
						mahjong._hideCells(cell1, cell2)
						mahjong._history.splice(mahjong._historyPosition, mahjong._history.length - mahjong._historyPosition)
					} else {
						$(this).addClass('tile-error')
						$(mahjong._firstSelected).addClass('tile-error')
					}

					$(this).removeClass('selected')
					$(mahjong._firstSelected).removeClass('selected')
					mahjong._firstSelected = null
				} else {
					mahjong._firstSelected = this
				}
			})
		},
		redo: function() {
			if (this._historyPosition < this._history.length) {
				this._hideCells(
					this._history[this._historyPosition],
					this._history[this._historyPosition+1]
				)
			}
		},
		setContainer: function(selector) {
			this.container = selector
		},
		scale: function(coef) {
			this.xscale = coef
			this.yscale = 1.4 * coef
		},
		undo: function() {
			if (this._historyPosition) {
				var cell
				_.times(2, function() {
					cell = this._history[--this._historyPosition]
					cell.present = -cell.present
					$(cell.node).fadeIn()
				}.bind(this))
			}
		}

	}
})
