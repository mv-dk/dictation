HTMLCollection.prototype.forEach = function(lambda) {
    for (var i = 0; i < this.length; i++) {
	lambda(this[i]);
    }
};

HTMLCollection.prototype.forEachHaving = function(lambda, predicate) {
    for (var i = 0; i < this.length; i++) {
	if (predicate[i]) {
	    lambda(this[i]);
	}
    }
};

function DictationService(soundService, environment) {
    this.lastFocusedWordInput = null;

    this.wordToInput = function(word, id){
	var d = document.createElement("input");
	d.id = id;
	if (word === ".") {
	    d.setAttribute("data-sound", "punktum");
	} else if (word === ",") {
	    d.setAttribute("data-sound", "komma");
	} else if (word === "?") {
	    d.setAttribute("data-sound", "spørgsmålstegn")
	} else if (word === "!") {
	    d.setAttribute("data-sound", "udråbstegn")
	} else if (word === ":") {
	    d.setAttribute("data-sound", "kolon")
	} else if (word === ";") {
	    d.setAttribute("data-sound", "semikolon")
	} else {
	    if (word.indexOf("{") != -1 || word.indexOf("\\") != -1) {
		var soundFile = word
		    .replace(/.*{(.*?)}.*/g,"$1") // lazy (*?) as opposed to greedy (*). See note below.
		    .replace(/\\/g,""); // remove backslashes (used for escaping periods)
		d.setAttribute("data-sound", soundFile.toLowerCase());
	    } else {
		d.setAttribute("data-sound", word.toLowerCase());
	    }
	}
	d.className = "dictationWord";
	d.type = "text";
	var cleanWord = word
	    .replace(/{.*?}/g,"") // lazy (*?) as opposed to greedy (*). See note below.
	    .replace(/\\/g,""); // remove backslashes (used for escaping periods)
	
	if (environment.isIOS()) {
	    d.size = cleanWord.length > 1 ? cleanWord.length + 1 : 2;
	}
	else {
	    d.size = cleanWord.length > 1 ? cleanWord.length - 1 : 1;
	}
	
	var svc = this;
	d.onfocus = function() {
	    soundService.playSound(settings, "", this);
	    svc.lastFocusedWordInput = this;
	    //console.log("focus: " + this.id);
	};
	d.setAttribute("data-correctWord", word);
	d.setAttribute("autocapitalize","none"); // otherwise, iphones capitalize first letter
	d.setAttribute("autocorrect","off"); // prevent autocorrect on phones
	d.onkeypress = function(e) {
	    if (e.keyCode == 13/*enter*/ ||
		e.keyCode == 32/*space*/ ||
		e.keyCode == 64 /*?*/ ||
		e.keyCode == 33 /*!*/ ||
		e.keyCode == 58 /*:*/ ||
		e.keyCode == 59 /*;*/) {
		if (this.nextElementSibling.tagName === "INPUT") {
		    this.nextElementSibling.focus();
		} else {
		    this.nextElementSibling.nextElementSibling.click();
		    this.blur();
		}
	    }
	    console.log(e.keyCode);
	};
	return d;
    };
    // Lazy instead of greedy: This is needed in case of sentences having two pairs of { }. An example where it's wrong to have it greedy,
    // is the sentence "han øver sig{sig_pronoun} i at køre tog{tog_noun}".
    // If it was greedy, the regex would match "{sig_pronoun} i at køre tog{tog_noun}"
    // When it is lazy, it correctly matches "{sig_pronoun}" and "{tog_noun}"

    this.wordsToInputs = function(words, sentenceId){
	result = [];
	var i = 1;
	words.forEach(x => {
	    var d = this.wordToInput(x, sentenceId + "w"+(i++).toString().padStart(2,"0")); 
	    result.push(d);
	});
	return result;
    };

    this.getButtonElement = function(text){
	var button = document.createElement("input");
	button.type = "button";
	button.setAttribute("value", text);
	return button;
    };

    this.addPlayButton = function(container, sentenceId, sentenceDir){
	var playButton = this.getButtonElement("Sætning \u{1F508}");
	playButton.className = "playButton";
	playButton.setAttribute("data-sound", sentenceId);
	playButton.onclick = function(){soundService.playSound(settings, sentenceDir, this)};
	
	container.append(playButton);
    };

    this.addShowAnswerButton = function(container) {
	var svc = this;
	var showAnswerButton = this.getButtonElement("Se svar \u{1F441}");
	showAnswerButton.className = "sentenceAnswerButton";
	showAnswerButton.onclick = function(){
	    svc.colorizeInputFields(container, true);
	    svc.showAnswerSentence(container)
	};

	container.append(showAnswerButton);
    };

    this.addPlayWordButton = function(container) {
	var playWordButton = this.getButtonElement("Ord \u{1F508}");
	playWordButton.className = "playButton";
	var svc = this;
	playWordButton.onclick = function (){
	    soundService.playSound(settings, "", svc.lastFocusedWordInput);
	};
	container.append(playWordButton);
    };

    this.populateSentenceContainer = function(sentence, sentenceId, container, sentenceDir){
	this.addPlayButton(container, sentenceId, sentenceDir);
	this.addPlayWordButton(container);
	
	container.append(document.createElement("br"));
	
	this.wordsToInputs(
	    sentence
		.replace(/([^\\])([.,:;!?])/g, "$1 $2")
		.split(" ")
		.filter(x => x != ""),
	    sentenceId)
	    .forEach(w => container.appendChild(w));
	
	container.append(document.createElement("br"));
	this.addShowAnswerButton(container);

	var answerContainer = document.createElement("div")
	answerContainer.innerHTML="&nbsp;";
	container.append(answerContainer);
    };

    this.populateAllSentenceContainers = function(sentenceDir){
	var scs = document.getElementsByClassName("sentenceContainer");
	var svc = this;
	scs.forEach(sc => svc.populateSentenceContainer(
	    sc.getAttribute("data-sentence"),
	    sc.getAttribute("data-sentenceId"),
	    sc,
	    sentenceDir
	)); 
    }

    this.insertSentenceContainer = function(sentenceId, text){
	var sentencesDiv = document.getElementById("sentences");
	var newSentenceContainer = document.createElement("div");
	newSentenceContainer.className = "sentenceContainer";
	newSentenceContainer.setAttribute("data-sentenceId", sentenceId);
	newSentenceContainer.setAttribute("data-sentence", text);
	sentencesDiv.append(newSentenceContainer);
    };

    this.insertFullText = function(fullText) {
	var addText = dictationService.insertSentenceContainer;
	var i = 1;
	fullText
	    .replace(/([^\\][.!?:;])/g, '$1|')
	    .split('|')
	    .map(x => x.trim())
	    .filter(x => x.length > 0)
	    .forEach(x =>
		     addText("s"+(i++)
			     .toString()
			     .padStart(2,'0'),
			     x));

    };

    this.colorizeInputFields = function(sentenceElement, playSound){
	var se = sentenceElement;
	var sCorrectWords = [];
	var sAnswers = [];
	var i = 0;
	var j = 1;
	var wordInputs = [];
	for (j; j < se.children.length; j++) {
	    if (se.children[j].tagName === "INPUT" && se.children[j].type === "text") {
		wordInputs[i] = se.children[j];
		sAnswers[i] = wordInputs[i].value.trim();
		sCorrectWords[i] = wordInputs[i].getAttribute("data-correctWord").replace(/{.*?}/g,"");
		++i;
	    }
	}
	var anyWrong = false;
	for (i = 0; i < sCorrectWords.length; i++) {
	    if (sCorrectWords[i] === sAnswers[i]) {
		console.log("%s is correct", sAnswers[i]);
		wordInputs[i].classList.add("correctInput");
		wordInputs[i].classList.remove("wrongInput");
	    } else {
		console.log("%s is wrong (%s)", sAnswers[i], sCorrectWords[i]);
		wordInputs[i].classList.add("wrongInput");
		wordInputs[i].classList.remove("correctInput");
		anyWrong = true;
	    }
	}

	if (playSound) {
	    if (!anyWrong) {
		soundService.playSoundFile("snd_effect_success.mp3");
	    } else {
		soundService.playSoundFile("snd_effect_failure.mp3");
	    }
	}
    };

    this.forEachSentenceElement = function(f) {
	var scs = document.getElementsByClassName("sentenceContainer");
	scs.forEach(s => f(s));
    };

    this.colorizeAllInputFields = function(){
	console.log("evaluating")
	this.forEachSentenceElement(this.colorizeInputFields, false);
    };

    this.showAnswerSentence = function(sentenceElement){
	console.log(sentenceElement.toString());
	
	var correctSentence = sentenceElement.getAttribute("data-sentence");
	sentenceElement.lastElementChild.innerText = correctSentence.replace(/{.*?}/g,"").replace(/\\/g,"");
    };

    this.showAllAnswerSentences = function(){
	this.forEachSentenceElement(this.showAnswerSentence);
    };

    this.removeSentences = function(){
	var sentencesElement = document.getElementById("sentences");
	while (sentencesElement.firstChild) {
	    sentencesElement.removeChild(sentencesElement.firstChild);
	}
    };
};

