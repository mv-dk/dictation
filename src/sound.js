function SoundService() {

	this.playSound = function (settings, path, soundElement){
		this.playSoundFile(this.getSoundPath(settings, path, soundElement));
	};

	this.playSoundFile = function(soundFile) {
		if (soundFile == null || soundFile == undefined) { return; }

		var audio = new Audio(soundFile);
		audio.play();
	};

	/*
	  Play the sound file given by the
	  data-sound attribute in an element.
	 */// recordings/sentence/smipp.mp3
	this.getSoundPath = function (settings, subpath, soundElement) {
		var filename = decodeURI(soundElement.getAttribute("data-sound"));
		var path = filename + "." + settings.extension;

		if (subpath.length > 0) {
			path = subpath + "/" + path;
		}

		if (settings.soundDir != undefined &&
			settings.soundDir != null &&
			settings.soundDir != "") {
			path = settings.soundDir + "/" + path;
		}
		
		return path;
	};
	
};
