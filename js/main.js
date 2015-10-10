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
				break
				case 'play':
				break
				case 'question':
				break
			}
				
		})
		
		mahjong.setContainer('#gameViewport')
		mahjong.scale(3)
		mahjong.init()
		mahjong.shuffle()
	})
})
