var bodyMovin = function () {

	var items = document.getElementsByClassName('bodymovin');

	for (var i = 0; i < items.length; i++){
		var item = new BodyMovin({
			element: items[i]
		});
	}

}