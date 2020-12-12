function initMenu(){
	var menuElement = document.getElementById("menu");
	var dictationElements = document.getElementsByClassName("dictation");

	for (var i = 0; i < dictationElements.length; i++) {
		var de = dictationElements[i];
		addDictationLink(menuElement, de);
	}
}

function addDictationLink(menuElement, dictationElement){
	var listItemElement = document.createElement("li");
	var linkElement = document.createElement("a");
	linkElement.href="#"+dictationElement.id;
	linkElement.onclick = function () {
		initFromElement(dictationElement.id);
	};
	linkElement.innerText = dictationElement.getAttribute("data-title");
	listItemElement.appendChild(linkElement);
	menuElement.appendChild(listItemElement);
}

function toggleClass(elem,cls) {
	elem.classList.toggle(cls);
}


