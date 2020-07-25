'use strict;'

//--------------------------------------------------
// webRTC
//--------------------------------------------------
let pc = new RTCPeerConnection({
    iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
});

let log = msg => {
    document.getElementById('div').innerHTML += msg + '<br>'
};

async function main() {
    const video = document.getElementById('localVideo');
    stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    video.srcObject = stream 

    for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
    }

    pc.ondatachannel = event => {
        const dc = event.channel
        dc.onmessage = ev => {
            console.log(`peer: [${ev.data}]`)
        }
    }
}

main();

window.startSession = () => {
    let session_id = document.getElementById("session_id").value;
    // サーバが投げてくるofferを受け取る
    fetch(`https://webrtc-sdp-exchanger.appspot.com/sessions/${session_id}/offer`, {
        method: "GET",
        mode: "cors",
        headers: new Headers({"Content-Type": "application/json; charset=utf-8"}),
    }).then((response) => {
        console.log("step2");
        console.log(response);
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(new Error("invalid response"));
    }).then((json) => {
        console.log("catch session desc");
        try {
            console.log(json.session_description)
            pc.setRemoteDescription(new RTCSessionDescription(json.session_description));
            pc.createAnswer().then((d) => {
                pc.setLocalDescription(d)
                fetch(`https://webrtc-sdp-exchanger.appspot.com/sessions/${session_id}`, {
                    method: "POST",
                    mode: "cors",
                    headers: new Headers({"Content-Type": "application/json; charset=utf-8"}),
                    body: JSON.stringify({session_description: d, session_id: session_id}),
                }).then((response) => {
                    console.log("step3");
                    console.log(response);
                }).catch(err => console.error);
            }).catch(log);
        } catch (e) {
            alert(e);
        }
        document.getElementById('startSession').disabled = "true";
    }).catch(err => console.error);
};

//--------------------------------------------------
//Global変数
//--------------------------------------------------
//BlueJellyのインスタンス生成
var ble = new BlueJelly();


//--------------------------------------------------
//ロード時の処理
//--------------------------------------------------
window.onload = function () {
  //UUIDの設定
  //ble.setUUID("UUID1", "713d0000-503e-4c75-ba94-3148f18d941e", "713d0002-503e-4c75-ba94-3148f18d941e");  //BLEnano SimpleControl rx_uuid
  ble.setUUID("UUID2", "4fafc201-1fb5-459e-8fcc-c5c9c331914b", "beb5483e-36e1-4688-b7f5-ea07361b26a8");  //BLEnano SimpleControl tx_uuid
}


//--------------------------------------------------
//Scan後の処理
//--------------------------------------------------
ble.onScan = function (deviceName) {
  document.getElementById('device_name').innerHTML = deviceName;
  document.getElementById('status').innerHTML = "found device!";
}


//--------------------------------------------------
//ConnectGATT後の処理
//--------------------------------------------------
ble.onConnectGATT = function (uuid) {
  console.log('> connected GATT!');

  document.getElementById('uuid_name').innerHTML = uuid;
  document.getElementById('status').innerHTML = "connected GATT!";
}

//--------------------------------------------------
//Write後の処理
//--------------------------------------------------
ble.onWrite = function(uuid){
  document.getElementById('uuid_name').innerHTML = uuid;
  document.getElementById('status').innerHTML = "written data"
}


//-------------------------------------------------
//ボタンが押された時のイベント登録
//--------------------------------------------------
document.getElementById('write').addEventListener('click', function() {
    // ble.write('UUID2', document.getElementById('write_value').value);
    ble.write('UUID2', [0x31]);
});
