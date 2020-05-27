'use strict;'

window.onload = function () {
    xhr = new XMLHttpRequest();

    // サーバからのデータ受信を行った際の動作
    xhr.onload = function (e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // nothing to do
        }
    };

    document.getElementById('forward').onclick = () => {
        console.log("forward");
        post("forward");
    };

    document.getElementById('backward').onclick = () => {
        console.log("backward");
        post("backward");
    };

    document.getElementById('right').onclick = () => {
        console.log("right");
        post("right");
    };

    document.getElementById('left').onclick = () => {
        console.log("left");
        post("left");
    };

    function post(command) {
        // xhr.open('POST', 'http://localhost:9999/', true);
        xhr.open('POST', 'https://robot-control-server.herokuapp.com/', true);
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.send("command=" + command);
    }    
};