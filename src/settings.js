
function Settings(extension = "ogg", soundDir = "", oneDirPerDictation) {
	this.extension = extension;
	this.soundDir = soundDir;
	this.oneDirPerDictation = oneDirPerDictation;
}

function getSettings(){
	var settingsElement = document.getElementById("settings");
	var extension = settingsElement.getAttribute("data-extension");
	var soundDir = settingsElement.getAttribute("data-sound-dir");
	var oneDirPerDictation = settingsElement.getAttribute("data-one-dir-per-dictation");
	return new Settings(extension, soundDir, oneDirPerDictation);	
}
