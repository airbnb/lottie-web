document.addEventListener('DOMContentLoaded', function() {

	//bodyMovin();

	var bodyMovin = new BodyMovin({
		element: document.getElementsByClassName('bodymovin')[0],
		engine: 'svg',
		data: anim1,
		loop: false,
		autoplay: false
	});

	var buttons = document.getElementsByClassName('button');

	for (var i = 0; i < buttons.length; i++){
		buttons[i].addEventListener('click', onButtonClick);
	}
	

	function onButtonClick (e) {

		bodyMovin.destroy();

		bodyMovin = new BodyMovin({
			element: document.getElementsByClassName('bodymovin')[0],
			engine: 'svg',
			src: e.currentTarget.getAttribute('data-anim') + '/data.json'
		});

	}

}, false);