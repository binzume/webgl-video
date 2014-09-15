

var repeat = false;

function playOrPause() {
    if (videoElement.paused) {
		videoElement.play();
    } else {
		videoElement.pause();
    }
}

function toggleRepeat() {
	repeat = !repeat;
	videoElement.loop = repeat;
	drawUiPanel("LOOP: "  + repeat);
}


var uiPanelTimer;

function cancelUiPanelTimer() {
	if (uiPanelTimer) {
		clearTimeout(uiPanelTimer);
	}
}

function hideUiPanel() {
	uiPanelVisible = false;
	canvasElement.style.cursor = 'none';
}

function hideUiPanelAfter(t) {
	cancelUiPanelTimer();
	uiPanelTimer = setTimeout(hideUiPanel ,t);
}

function drawUiPanel(text) {
	if (uiPanelTexture) {
		var canvas = document.getElementById("gluicanvas");
		var c = canvas.getContext("2d");
		c.clearRect(0, 0, 512, 512);
		c.fillStyle = "rgba(0, 0, 200, 0.5)";
		c.fillRect (100, 200, 300, 50);
		c.fillStyle = "#ffffff";
		c.fillText(text, 120, 230);
		updateTexture(uiPanelTexture, canvas);
	}

	uiPanelVisible = true;
	canvasElement.style.cursor = 'auto';
	hideUiPanelAfter(2000);
}

function formatMMSS(t) {
    var ss = Math.floor(t);
    var mm = Math.floor(ss / 60);
    ss -= mm * 60;
    return mm + ":" + (ss < 10 ? "0" : "") + ss;
}

function displayCurrentPosition() {
	drawUiPanel("Position: " + formatMMSS(videoElement.currentTime) + "  /  " + formatMMSS(videoElement.duration));
}

function displayCurrentState() {
	drawUiPanel("Vol: " +  Math.floor(videoElement.volume * 100) + "% SPEED: " +  Math.floor(videoElement.playbackRate * 10)/10);
}

  function onKeyDown(event) {
    switch (event.keyCode) {
    case 13: // enter
        fullScreen(true);
        break;
    case 27: // esc
        fullScreen(false);
        break;
    case 32: // space
        playOrPause();
        break;
    case 37: // left
        videoElement.currentTime -= (event.shiftKey ? 60 : 10);
        displayCurrentPosition();
        break;
    case 39: // right
        videoElement.currentTime += (event.shiftKey ? 60 : 10);
        displayCurrentPosition();
        break;
    case 38:  // up
        if (event.shiftKey) {
            videoElement.playbackRate += 0.1;
        } else {
            videoElement.volume += 0.05;
        }
        displayCurrentState();
        break;
    case 40:  // down
        if (event.shiftKey) {
            videoElement.playbackRate -= 0.1;
        } else {
            videoElement.volume -= 0.05;
        }
        displayCurrentState();
        break;
    case 87:  // W
    case 33:
          scaleR += 0.02;
          console.log('scaleR:' + scaleR);
          refresh();
        break;
    case 83:  // S
    case 34:
          scaleR -= 0.02;
          console.log('scaleR:' + scaleR);
          refresh();
        break;
    case 90:  // Z
    case 36:
          wrapx += 0.01;
          console.log('wrap:' + wrapx);
          refresh();
        break;
    case 88:  // X
    case 35:
          wrapx -= 0.01;
          if (wrapx<-0.5) wrapx = -0.5;
          console.log('wrap:' + wrapx);
          refresh();
        break;
    case 76:
		toggleRepeat();
        break;
    default:
        console.log('key code: ' + event.keyCode);
        return true;
    }
    event.preventDefault();
    return false;
}

