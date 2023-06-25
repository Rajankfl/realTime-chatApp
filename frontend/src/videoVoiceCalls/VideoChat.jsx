import React, { useEffect, useState } from 'react';
import '../styles/Videochat.css';
import { useHistory } from 'react-router-dom';
import Peer from 'peerjs';
import { io } from 'socket.io-client';
export default function (props) {

    const [stream, setStream] = useState(null);
    const history = useHistory();
    
    useEffect(() => {
        socket.current = io('ws://localhost:8900');
    }, []);

    const myPeer = new Peer(undefined, {
        host: '/',
        port: '3001'
    })


    const myVideo = document.getElementById('myVideo');
    myVideo.muted = true
    const peers = {}
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream)

        myPeer.on('call', call => {
            call.answer(stream)
            const video = document.getElementById('userVideo');
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })
        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream)
        })
    })
    myPeer.on('open', id => {
        socket.emit('join-room', ROOM_ID, id)
    })




    function addVideoStream(video, stream) {
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
            video.play()
        })
    }
    /*
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
  }*/
    return <>
        <section className="videoChat">
            <div className="communicator">
                <div className="communicate">
                    <video autoPlay id='userVideo'></video>
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
            <video autoPlay id='myVideo'></video>
        </div>
    </>;
}
