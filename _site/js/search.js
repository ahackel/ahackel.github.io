"use strict";

let searchBox = document.querySelector('.search');
let thumbList = document.querySelector('.thumbnails');

let searchString = window.location.search.split('=')[1];

if (searchString) {
	search(searchString);
}

function tokenize(s){
	return s.toLowerCase().replace(/\s/g, '-');
}

function search(s) {
	Array.from(thumbList.children).forEach(thumb => {
		let tokens = thumb.dataset.search.toLowerCase();
		let show = tokens.includes(tokenize(s));
		//console.log(searchBox.value, href, show)
		thumb.style.display = (show) ? 'block' : 'none';
	});
}

searchBox.addEventListener('keyup', e => {
	search(searchBox.value);
}, false);

searchBox.addEventListener('blur', e => {
	window.location.search = "q=" + tokenize(searchBox.value);
}, false);
