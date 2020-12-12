
var settings = getSettings();
var dictationService = new DictationService(new SoundService(), new Environment());

function init(fullText, sentenceDir){
	dictationService.removeSentences();
	dictationService.insertFullText(fullText);
	dictationService.populateAllSentenceContainers(sentenceDir);
}

// Initialise the page given a text element id.
function initFromElement(textElementId){
	var e = document.getElementById(textElementId);
	var fullText = e.innerText;
	var sentenceDir = e.getAttribute("data-folder");
	init(fullText, sentenceDir);
}

// Get the part after # in the url, and load that dictation.
// For example: paje.dk/dictation/#sommertid should load the dictation "sommertid".
function initFromUrl() {
    var loc = (window.location+"");
    var elems = loc.split("#");
    if (elems != null && elems.length == 2) {
	initFromElement(elems[1]);
	return true;
    }
    return false; // If no # was in the url, return false
}

document.addEventListener('DOMContentLoaded', function(){
    initMenu();
    
    // Try to init from url, otherwise, init "bday"
    if (!initFromUrl()) {
	initFromElement('soccer');
    }
}, false);
