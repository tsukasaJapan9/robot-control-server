'use strict;'


//--------------------------------------------------
// handling button event
//--------------------------------------------------
const waitForButtonClick = button => {
    return new Promise(resolve => {
        button.addEventListener("click", () => {
            resolve()
        }, {once: true})
    })
}

//--------------------------------------------------
// WebRTC
//--------------------------------------------------
async function startSession(pc) {
    const session_id = document.getElementById("session_id").value;
    
    try {
        // サーバが投げてくるofferを受け取る
        response = await fetch(`https://webrtc-sdp-exchanger.appspot.com/sessions/${session_id}/offer`, {
            method: "GET",
            mode: "cors",
            headers: new Headers({"Content-Type": "application/json; charset=utf-8"}),
        }).then((response) => {
            return response.json()
        })
    
        console.log(response.session_description)

        // リモートとローカルのSDPを設定
        await pc.setRemoteDescription(new RTCSessionDescription(response.session_description))
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        // answerを相手に送る
        await fetch(`https://webrtc-sdp-exchanger.appspot.com/sessions/${session_id}`, {
            method: "POST",
            mode: "cors",
            headers: new Headers({"Content-Type": "application/json; charset=utf-8"}),
            body: JSON.stringify({session_description: answer, session_id: session_id}),
        })
        console.log("success to start session")
    } catch(error) {
        throw new Error("start session error")
    }
};

//--------------------------------------------------
// main
//--------------------------------------------------
async function main() {
    let log = msg => {
        document.getElementById('div').innerHTML += msg + '<br>'
    };
    
    let pc = new RTCPeerConnection({
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
    });
    
    // videoの準備
    const video = document.getElementById('localVideo');
    stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    video.srcObject = stream 

    // videoをstreamに設定
    for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
    }

    // data channelの受信コールバックの設定
    pc.ondatachannel = event => {
        const dc = event.channel
        dc.onmessage = ev => {
            console.log(`peer: [${ev.data}]`)
        }
    }

    // startSessionボタンが押されたらsession開始
    const startButton = document.getElementById("startSession")
    await waitForButtonClick(startButton)
    try {
        await startSession(pc)
    } catch (error) {
        console.log(error)
    }
}

main();

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
