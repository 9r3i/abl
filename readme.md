# abl
app boot loader -- first handed loader


# sample
```html
<!DOCTYPE html><html lang="en-US" dir="ltr"><head>
  <meta http-equiv="content-type" content="text/html;charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
  <title>9r3i\abl</title>
  <meta name="keywords" content="9r3i, abl, app" />
  <meta name="description" content="ABL, https://github.com/9r3i/abl" />
  <meta name="robots" content="no follow,no index" />
  <meta name="author" content="9r3i" />
  <meta name="uri" content="https://github.com/9r3i" />
<script type="text/javascript" id="virtual.js"></script>
<script type="text/javascript">
  /* script */
</script>
<style type="text/css">
  /* style */
</style>
</head><body>
  <div class="index-splash" id="index-splash">
  <span id="splash-text">Connecting...</span>
  <progress id="splash-progress" max="100"></progress>
  </div>
</body></html>
```

## script
```js
/* anonymous async function */
(async function(){
  loopLoader();
  /* prepare abl config namespace and host */
  const ABL_NS='test';
  const ABL_HOST='https://raw.githubusercontent.com/9r3i/abl/master/test.app';
  
  /* prepare registered files */
  const REGISTERED_FILES={
    "abl.js": "https://raw.githubusercontent.com/9r3i/abl/master/abl.min.js",
  };
  /* virtual host file */
  const VIRTUAL_HOST="https://raw.githubusercontent.com/9r3i/virtual.js/master/virtual.min.js";

  /* standard virtual initialization -- do not change */
  let vname='virtual.js',
  vtag=document.getElementById(vname),
  vscript=localStorage.getItem('virtual/'+vname);
  if(!vscript){
    vscript=await fetch(VIRTUAL_HOST).then(r=>r.text());
    if(!vscript.match(/function\svirtual/)){
      alert('Error: Failed to load virtual.js');
      return;
    }
  }
  /* execute the virtual script */
  vtag.textContent=vscript;
  /* initialize virtual.js with registered files */
  const app=new virtual(REGISTERED_FILES);
  /* save virtual script */
  app.put(vname,vscript);
  /* load abl file */
  await app.load('abl.js');
  /* start the abl */
  new abl(ABL_NS,ABL_HOST);
  /* doing silent self update for virtual.js 
   * uncomment this if you wanna make virtual.js auto-update
   *
  app.files[vname]=VIRTUAL_HOST;
  await app.update(vname);
  /* end-of-script */
})();
/* loop loader */
function loopLoader(){
  let ll=document.getElementById('abl-loader'),
  pp=document.getElementById('splash-progress'),
  ss=document.getElementById('splash-text');
  if(ll&&pp&&ss){
    pp.value=parseInt(ll.style.width,10);
    ss.innerText=ll.style.width+' Loading...';
    if(pp.value>=100){return;}
  }
  return setTimeout(loopLoader,100);
}
```

## style
```css
body{
  margin:0px;
  padding:0px;
}
.index-splash{
  display:flex;
  align-items:center;
  justify-content:center;
  height:100vh;
  width:100vw;
  margin:0px;
  padding:0px;
  font-family:system-ui;
  background-color:#fff;
  background:linear-gradient(#fff 0%,#bdf 35%,#59d 100%);
}
.index-splash progress{
  font-size:24px;
}
.index-splash span{
  position:absolute;
  margin:-35px 0px 0px;
  font-size:13px;
  color:#333;
  animation:fade 2.3s infinite 0s;
}
@keyframes fade{
  0%{opacity:1;}
  50%{opacity:0.3;}
  100%{opacity:1;}
}
```
