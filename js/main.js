$(function() {
	$(document).foundation()

	$('#mainToolbar').delegate('a', 'click', function() {
		var action = _.find($('i', this).get(0).classList, function(cls) {
			return !cls.indexOf('fa-')
		}).substr(3)

		switch (action) {
			case 'undo':
			break
			case 'repeat':
			break
			case 'random':
			break
			case 'pause':
			break
			case 'play':
			break
			case 'question':
			break
		}
			
	})

	//test
	for (var i=0; i<5; i++) {
		for (var j=0; j<5; j++) {
			var tileTemplate = _.template($('#tileTemplate').html())
			$(tileTemplate())
				.appendTo('#gameViewport')
				.css({
					'top': 20-i*0.3+'em',
					'left': 5+j*5+i*0.3+'em'
				})
		}
	}
})
