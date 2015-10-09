define(function() {
	return function() {
		// 0: none, 1: present, 2: y-shifted, 3: x-shifted, 4: xy-shifted
		var cellMap = [
			[
				[0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
				[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
				[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
				[2,1,1,1,1,1,1,1,1,1,1,1,1,2,2],
				[0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
				[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
				[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
				[0,1,1,1,1,1,1,1,1,1,1,1,1,0,0]
			], [
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
				[0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
				[0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
				[0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
				[0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
				[0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
			], [
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
				[0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
				[0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
				[0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
			], [
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
			], [
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,4,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
			]
		]

		return cellMap.map(function(level, z) {
			return level.map(function(row, y) {
				return row.map(function(cell, x) {
					return {
						x: x*2 + z*0.12 + (cell==3 || cell==4 ? 1 : 0),
						y: y*2 - z*0.12 + (cell==2 || cell==4 ? 1 : 0),
						present: cell,
						//suit: null,
						value: null,
						node: null
					}
				})
			})
		})
	}
})
