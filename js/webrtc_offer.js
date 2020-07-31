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
    let session_id = "abc"

    fetch(`https://webrtc-sdp-exchanger.appspot.com/sessions/${session_id}`, {
        method: "POST",
        mode: "cors",
        headers: new Headers({"Content-Type": "application/json; charset=utf-8"}),
        body: JSON.stringify({session_description: pc.localDescription, session_id: session_id}),
    }).then((response) => {
        console.log(response);

        fetch(`https://webrtc-sdp-exchanger.appspot.com/sessions/${session_id}/answer`, {
            method: "GET",
            mode: "cors",
            headers: new Headers({"Content-Type": "application/json; charset=utf-8"}),
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(new Error("invalid response"));
        }).then((json) => {
            console.log("catch session desc");
            try {
                pc.setRemoteDescription(new RTCSessionDescription(json.session_description));
            } catch (e) {
                alert(e);
            }

            document.getElementById('startSession').disabled = "true";
        }).catch(err => console.error);

    }).catch(err => console.error);
};

//--------------------------------------------------
// main
//--------------------------------------------------
async function main() {
    let pc = new RTCPeerConnection({
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
    });
    
    pc.ontrack = (event) => {
        var el = document.createElement(event.track.kind);
        console.log(event)
        el.srcObject = event.streams[0];
        el.autoplay = true;
        el.controls = true;
        el.setAttribute('playsinline', '');
    
        document.getElementById('remoteVideos').appendChild(el)
    };
        
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
    
    // Offer to receive 1 audio, and 2 video tracks
    pc.addTransceiver('audio');
    pc.addTransceiver('video');
    pc.createOffer().then(d => pc.setLocalDescription(d)).catch(log);
    
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