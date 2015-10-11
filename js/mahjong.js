define(function(require) {
	var i10n = require('../i10n/en')

	return {
		_SUITS: {
			bing: "qwertyuio",
			tiao: "zxcvbnm,.",
			wan: "asdfghjkl",
			wind: "1234",
			dragon: "567",
			flower: "=[]\\",
			season: "p;/`",
		},
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

			var score = this.score
			this._updateScore()

			this._history[this._historyPosition++] = {
				cell1: cell1,
				cell2: cell2,
				scoreBefore: score,
				scoreAfter: this.score
			}
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
		_match: function(value1, value2) {
			return value1 == value2 ||
				this._SUITS.flower.indexOf(value1) > -1 && this._SUITS.flower.indexOf(value2) > -1 ||
				this._SUITS.season.indexOf(value1) > -1 && this._SUITS.season.indexOf(value2) > -1
		},
		_prevTimestamp: 0,
		_syncNode: function(cell, cleanSuit) {
			var $node = $(cell.node)
			var content = $node.find('.mahjong-tile-content')
			content.text(cell.value)

			$.each(this._SUITS, function(suit, set) {
				if (cleanSuit) {
					$node.removeClass('suit-'+suit)
				}
				if (set.indexOf(cell.value) > -1) {
					$node.addClass('suit-'+suit)
					if (!cleanSuit) {
						return false
					}
				}
			})
		},
		_updateScore: function() {
			if (arguments.length) {
				this.score = arguments[0]
			} else {
				var timestamp = Date.now()
				var timediff = Math.floor((timestamp - this._prevTimestamp) / 1000)
				this.score += timediff > 30 ? 0 : 30 - timediff
				this._prevTimestamp = timestamp
			}

			$(this.container).trigger('updateScore', {score: this.score})
		},
		_walkDiamond: function(level, seed, callback) {
			var cornersReached = 0
			,   i, j , k
			,   height = this.map[0].length
			,   width = this.map[0][0].length

			var tryCell = function(i, j) {
				if (
					!i && !j ||
					!i && j==width-1 ||
					i==height-1 && !j ||
					i==height-1 && j==width-1
				) {
					cornersReached++
				}
				try {
					callback(this.map[level][i][j])
				} catch(e) {
					callback(null)
				}
			}.bind(this)

			tryCell(seed.y, seed.x)
			tryCell(seed.y, seed.x+1)
			for (k=1; cornersReached < 4; k++) {
				for (i = seed.y-k, j = seed.x; i < seed.y; i++, j--) {
					tryCell(i, j)
					tryCell(i, j + 2*(seed.x-j) + 1)
				}
				for (; j <= seed.x; i++, j++) {
					tryCell(i, j)
					tryCell(i, j + 2*(seed.x-j) + 1)
				}
			}
		},
		help: function() {
			var mahjong = this

			var freeCells = []
			this.map.forEach(function(level) {
				level.forEach(function(row) {
					row.forEach(function(cell) {
						if (cell.present > 0) {
							if (mahjong._isFree(cell.node)) {
								freeCells.push(cell)
							}
						}
					})
				})
			})

			var i,j, solutions = []
			for (i=0; i<freeCells.length-1; i++) {
				for (j=i+1; j<freeCells.length; j++) {
					if (mahjong._match(freeCells[i].value, freeCells[j].value)) {
						solutions.push([freeCells[i], freeCells[j]])
					}
				}
			}

			if (solutions.length) {
				var solution = solutions[_.random(solutions.length-1)]
				$(solution[0].node).addClass('tile-help')
				$(solution[1].node).addClass('tile-help')
			} else {
				if (confirm(i10n.gameover_f)) {
					this.shuffleVisible()
					this._updateScore(this.score - 100)
				}
			}
		},
		pause: function(on) {
			if (on) {
				this._pauseTimestamp = Date.now()
			} else {
				if (this._pauseTimestamp) {
					this._prevTimestamp += (Date.now()) - this._pauseTimestamp
				}
			}
		},
		score: 0,
		shuffle: function() {
			var tiles4 = this._SUITS.bing + this._SUITS.wan + this._SUITS.tiao + this._SUITS.wind + this._SUITS.dragon
			var tiles1 = this._SUITS.flower + this._SUITS.season

			var tileSet = _.shuffle(
				tiles4 + tiles4
			).reduce(function(prev, cur) {
				return prev.concat(_.times(2, _.constant(cur)))
			}, [])

			_.shuffle(tiles1).forEach(function(item) {
				tileSet.splice(_.random(tileSet.length-1), 0, item)
			})

			$.each(this._SUITS, function(suit) {
				$('.suit-'+suit).removeClass('suit-'+suit)
			})
			this._history.forEach(function(backup) {
				backup.cell1.present = -backup.cell1.present
				backup.cell2.present = -backup.cell2.present
				$(backup.cell1.node).show()
				$(backup.cell2.node).show()
			})
			this._history = []
			this._historyPosition = 0

			var height = this.map[0].length
			,   width = this.map[0][0].length
			,   startx = Math.floor(width/2)
			,   starty = Math.floor(height/2)
			,   i, sliceCount, slice, seed

			this.map.forEach(function(level, z) {
				sliceCount = 0
				seed = {
					/*x: _.random(width-1),
					y: _.random(height-1)*/
					x: startx,
					y: starty
				}

				this._walkDiamond(z, seed, function(cell) {
					if (cell && cell.present > 0) {
						sliceCount++
					}
				})

				slice = _.shuffle(tileSet.splice(0, sliceCount))
				i = 0

				this._walkDiamond(z, seed, function(cell) {
					if (cell && cell.present > 0) {
						cell.value = slice[i++]
						this._syncNode(cell, false)
					}
				}.bind(this))
			}.bind(this))

			this._prevTimestamp = Date.now()
			this.score = 0
		},
		shuffleVisible: function() {
			var visibleCells = []

			this.map.forEach(function(level, z) {
				level.forEach(function(row, y) {
					row.forEach(function(cell, x) {
						if (cell.present > 0) {
							visibleCells.push(cell)
						}
					})
				})
			})

			cellValues = visibleCells.map(function(cell) {
				return cell.value
			})
			cellValues = _.shuffle(cellValues)

			visibleCells.forEach(function(cell, index) {
				cell.value = cellValues[index]
				this._syncNode(cell, true)
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
								.addClass('map-level' + z%4)
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
				$('.tile-help').removeClass('tile-help')

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
				var backup = this._history[this._historyPosition]
				this._hideCells(
					backup.cell1,
					backup.cell2
				)
				this._updateScore(backup.scoreAfter)
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
				var backup = this._history[--this._historyPosition]

				backup.cell1.present = -backup.cell1.present
				backup.cell2.present = -backup.cell2.present
				$(backup.cell1.node).fadeIn()
				$(backup.cell2.node).fadeIn()

				this._updateScore(backup.scoreBefore)
			}
		}

	}
})
