'use strict;'

window.onload = function () {
    xhr = new XMLHttpRequest();

    // サーバからのデータ受信を行った際の動作
    xhr.onload = function (e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var answer = document.getElementById('answer');
            answer.value = xhr.responseText;
        }
    };

    document.getElementById('forward').onclick = () => {
        console.log("forward");
        post()
    };

    document.getElementById('backward').onclick = () => {
        console.log("bachward");
        post()
    };
};

function post() {
    xhr.open('POST', 'localhost:9999', true);
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    xhr.send("command=forward");
}