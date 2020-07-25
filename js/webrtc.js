'use strict;'

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

let session_id = document.getElementById("session_id").value;

window.startSession = () => {
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
