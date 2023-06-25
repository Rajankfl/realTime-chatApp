import React, { useEffect } from 'react';
import alertify from 'alertifyjs';
import "alertifyjs/build/alertify.min.js";
import "alertifyjs/build/css/alertify.min.css";
import { useHistory } from 'react-router';
export default function Logout() {
    const history= useHistory();
    const logout = async () => {
        try {
            const res = await fetch("/logout", {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            })
            if (res.status === 201) {
                history.push('/login', { replace: true })
            }
            if (res.status !== 201) {
                var closable = alertify.alert().setting('closable');
                alertify.alert()
                    .setting({
                        'label': 'Ok',
                        'message': 'This dialog is : ' + (closable ? ' ' : ' not ') + 'closable.',
                        'onok': function () { alertify.error('Failed to Logout'); }
                    }).show();
                alertify.dialog('alert').setHeader('<em> Chat App </em> ').set({ transition: 'flipy', message: 'Try Again Logging Out' }).show();
            }
        }
        catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        logout();
    }, [])
    return <></>;
}