function pingSite(e,t,s){let n=document.getElementById(s);function c(){fetch(e,{mode:"no-cors"}).then(e=>{n&&(n.className="rounded-circle bg-success status-bubble",n.title="Last successful check: "+new Date().toLocaleTimeString())}).catch(e=>{n&&(n.className="rounded-circle bg-danger status-bubble",n.title="Last failed check: "+new Date().toLocaleTimeString())})}setInterval(c,t),c()}document.addEventListener("DOMContentLoaded",()=>{if(document.getElementById("main-header")){let e=document.querySelectorAll(".ticker-item"),t=0;function s(){e[t].classList.remove("show"),setTimeout(()=>{e[t].classList.add("d-none"),e[t=(t+1)%e.length].classList.remove("d-none"),setTimeout(()=>{e[t].classList.add("show")},15)},500)}setInterval(s,3200)}}),document.addEventListener("DOMContentLoaded",()=>{if(document.getElementById("main-header")){let e=document.querySelectorAll(".ticker-item"),t=0;function s(){e[t].classList.remove("show"),setTimeout(()=>{e[t].classList.add("d-none"),e[t=(t+1)%e.length].classList.remove("d-none"),setTimeout(()=>{e[t].classList.add("show")},15)},500)}setInterval(s,3200)}});