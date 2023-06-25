import React, { useEffect, useState } from 'react';
import '../styles/Videochat.css';
import { useHistory } from 'react-router-dom';
export default function (props) {
    const [stream, setStream] = useState(null);
    const history = useHistory();
    useEffect(async function () {
        const constraints = {
            video: { facingMode: "user" },
        };
        let video = document.querySelector('video');
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(stream);
        video.srcObject = stream;
    }, [])
    function callEnd() {
        stream.getTracks().forEach(async function (track) {
            await track.stop();
            history.goBack();
        });
    }
    return <>
        <section className="videoChat">
            <div className="communicator">
                <div className="communicate">
                    <h2>Waiting For Others To Join...</h2>
                    <p>Calling...</p>
                </div>
                <div className="icons">
                    <div className="videoIcon"><i className="bi bi-camera-video-fill"></i></div>
                    <div className="micIcon"><i className="bi bi-mic-fill"></i></div>
                    <div className="callEndIcon"><i className="bi bi-telephone-x-fill" style={{ color: "red" }} onClick={callEnd}></i></div>
                </div>
            </div>
        </section>
        <div className="myVideo">
            <video autoPlay ></video>
        </div>
    </>;
}
