import React from "react";
export default async function SendId(props){
    
    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id:props.id, myId:props.myId })
        })
        const data = await res.json();

        if (res.status === 201 || res.status === 200) {
            //DbMessage is set the data.messages because i want to use that object being broadcasted from socket i.e an object {type.....} like so same array content is sended;
            props.sendingMessage(data.messages); props.settingLength(data.messages.length - 1);
        }

        //If user havent till chat convo with the one he/she selected then we have set the DbMessage as null array[];
        if (res.status === 403) { props.sendingMessage([]) }

        //selected or given id of user isnt registered properly, so that we got this response.
        if (res.status === 400) { window.alert('user Doesnt Exist') }

        /* Scroll to last when user select Every new user */

        let last = document.getElementById('message').lastElementChild;
        console.log(last);
        last.setAttribute('id', 'last');
        document.getElementById('last').scrollIntoView(true);

        //If nothing works good then we are passing fail Error;
        if (!res.status === 200) {
            throw new Error('fail');
        }

    }
    catch (err) {
        console.log(err)
    }
return<></>
    
}