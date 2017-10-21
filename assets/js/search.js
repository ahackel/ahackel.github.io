"use strict";

let searchBox = document.querySelector('.search');
let postItems = document.querySelectorAll('.post-item');

let searchString = window.location.search.split('=')[1];

if (searchString) {
	search(searchString);
}

function tokenize(s){
	return s.toLowerCase().replace(/\s/g, '-');
}

function search(s) {
	postItems.forEach(thumb => {
		let tokens = thumb.dataset.search.toLowerCase();
		let show = tokens.includes(tokenize(s));
		//console.log(searchBox.value, href, show)
		thumb.style.display = (show) ? 'block' : 'none';

	});
	if (msnry)
		msnry.layout();
}

searchBox.addEventListener('keyup', e => {
	search(searchBox.value);
}, false);

searchBox.addEventListener('blur', e => {
	window.location.search = "q=" + tokenize(searchBox.value);
}, false);
