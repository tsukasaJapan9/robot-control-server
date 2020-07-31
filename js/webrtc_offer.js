'use strict;'

//--------------------------------------------------
// for debug
//--------------------------------------------------
let log = msg => {
    document.getElementById('div').innerHTML += msg + '<br>'
};

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
        // offerを送る
        await fetch(`https://webrtc-sdp-exchanger.appspot.com/sessions/${session_id}`, {
            method: "POST",
            mode: "cors",
            headers: new Headers({"Content-Type": "application/json; charset=utf-8"}),
            body: JSON.stringify({session_description: pc.localDescription, session_id: session_id}),
        })

        log("send offer")

        sdp = await fetch(`https://webrtc-sdp-exchanger.appspot.com/sessions/${session_id}/answer`, {
            method: "GET",
            mode: "cors",
            headers: new Headers({"Content-Type": "application/json; charset=utf-8"}),
        }).then((response) => {
            return response.json()
        }).then((json) => {
            return json.session_description
        })

        log("get answer")

        // リモートとローカルのSDPを設定
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        log("success to start session")
    } catch(error) {
        throw new Error("start session error")
    }
};

//--------------------------------------------------
// main
//--------------------------------------------------
async function main() {
    let pc = new RTCPeerConnection({
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
    });
    
    // local videoの準備
    const video = document.getElementById('localVideo');
    stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
    video.srcObject = stream 

    // remote videoの受信準備
    pc.ontrack = (event) => {
        const remoteVideo = document.getElementById("remoteVideo");
        console.log(event)
        remoteVideo.srcObject = event.streams[0];
    };

    // videoをstreamに設定
    for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
    }

    // datachannel open
    let dataChannel = pc.createDataChannel('foo');
    dataChannel.onclose = () => console.log('dataChannel has closed');
    dataChannel.onopen = () => {
        console.log('dataChannel has opened');
        document.getElementById('sendCommand').disabled = "";
    };
    dataChannel.onmessage = e => log(`Message from DataChannel '${dataChannel.label}' payload '${e.data}'`);

    // data channelの受信コールバックの設定
    pc.ondatachannel = event => {
        const dc = event.channel
        dc.onmessage = ev => {
            console.log(`peer: [${ev.data}]`)
        }
    }

    // 各種statusの監視
    pc.oniceconnectionstatechange = (e) => {
        log('ice connection state: ' + pc.iceConnectionState);
    };

    pc.onnegotiationneeded = (e) => {
        log('negotiation needed: ' + pc.iceConnectionState);
    };

    pc.onconnectionstatechange = (e) => {
        log('connection state: ' + pc.connectionState);
    };

    pc.onicecandidate = event => {
        if (event.candidate === null) {
            document.getElementById('startSession').disabled = "";
        }
    };

    // 送受信設定
    pc.addTransceiver('audio');
    pc.addTransceiver('video');

    // これを先にやっとく必要がある
    offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    // data channelに送信
    document.getElementById("sendCommand").onclick = () => {
        let message = document.getElementById('command').value
        if (message === '') {
            return
        }
        dataChannel.send(message + '\n');
        document.getElementById('command').value = "";
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
