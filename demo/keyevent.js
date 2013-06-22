

function playOrPause() {
    if (document.getElementById('video').paused) {
		document.getElementById('video').play();
    } else {
		document.getElementById('video').pause();
    }
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
        document.getElementById('video').currentTime -= 10;
        break;
    case 39: // right
        document.getElementById('video').currentTime += 10;
        break;
    case 38:  // up
        document.getElementById('video').volume += 0.05;
        break;
    case 40:  // down
        document.getElementById('video').volume -= 0.05;
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
    default:
        console.log('key code: ' + event.keyCode);
        return true;
    }
    event.preventDefault();
    return false;
}

