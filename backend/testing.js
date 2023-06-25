import fs from 'fs';
import got from 'got';
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const vgmUrl= 'https://www.vgmusic.com/music/console/nintendo/nes';

got(vgmUrl).then(response => {
    const dom = new JSDOM(response.body);
    dom.window.document.querySelectorAll('a').forEach(link => {
    console.log(link.href);
  });
}).catch(err => {
  console.log(err);
});