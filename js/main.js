define(function (require) {
	var mahjong = require('mahjong')

	$(function() {
		$(document).foundation()

		$('#mainToolbar').delegate('a', 'click', function() {
			var action = _.find($('i', this).get(0).classList, function(cls) {
				return !cls.indexOf('fa-')
			}).substr(3)

			switch (action) {
				case 'undo':
					mahjong.undo()
				break
				case 'repeat':
					mahjong.redo()
				break
				case 'random':
					mahjong.shuffle()
				break
				case 'pause':
					mahjong.pause(true)
					$(this).hide()
					$('#mainToolbar .fa-play').closest('a').show()
					$('#gameViewport').css('opacity', 0.1)
				break
				case 'play':
					mahjong.pause(false)
					$(this).hide()
					$('#mainToolbar .fa-pause').closest('a').show()
					$('#gameViewport').css('opacity', 1)
				break
				case 'question':
					mahjong.help()
				break
			}
				
		})
		
		mahjong.setContainer('#gameViewport')
		mahjong.scale(3)
		mahjong.init()
		mahjong.shuffle()

		$(mahjong.container).on('updateScore', function(e, data) {
			$('#scoreValue').text(data.score)
		})
	})
})
