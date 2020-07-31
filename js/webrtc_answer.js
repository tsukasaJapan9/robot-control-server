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
        // サーバが投げてくるofferを受け取る
        sdp = await fetch(`https://webrtc-sdp-exchanger.appspot.com/sessions/${session_id}/offer`, {
            method: "GET",
            mode: "cors",
            headers: new Headers({"Content-Type": "application/json; charset=utf-8"}),
        }).then((response) => {
            return response.json()
        }).then((json) => {
            return json.session_description
        })
    
        log("get offer")

        // リモートとローカルのSDPを設定
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        // answerを相手に送る
        await fetch(`https://webrtc-sdp-exchanger.appspot.com/sessions/${session_id}`, {
            method: "POST",
            mode: "cors",
            headers: new Headers({"Content-Type": "application/json; charset=utf-8"}),
            body: JSON.stringify({session_description: answer, session_id: session_id}),
        })
        log("send answer")
        console.log("success to start session")
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
        if (event.track.kind == "video" && event.streams.length > 0) {
            console.log(event.streams)
            remoteVideo.srcObject = event.streams[0];
        }
    };
    
    // videoをstreamに設定
    for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
    }

    // datachannel open
    let dataChannel = pc.createDataChannel('foo2');
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