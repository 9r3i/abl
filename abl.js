/* abl.js */
;function abl(ns,host){
this.version='2.0.0';
this.app={
  version:1,
  name:typeof ns==='string'?ns:'unknown',
  host:typeof host==='string'?host:'',
  key:null,
};
this.data={
  version:0,
  namespace:'',
  key:null,
  style:[],
  script:[],
  constant:{},
  module:[],
};
window.ABL_OBJECT=this;

/* initialize */
this.init=async function(){
  let isUpdated=false;
  /* get data from database */
  this.data=this.database();
  if(!this.data){
    /* fetch data from app.host */
    let res=await this.fetch(this.app.host);
    this.data=this.parseJSON(res);
    if(typeof this.data!=='object'||this.data===null){
      return this.error({
        status:'error',
        message:'Failed to load app.'
      });
    }
    this.database(this.data);
    isUpdated=true;
  }
  /* set app.version and app.key */
  this.app.version=parseInt(this.data.version,10);
  this.app.key=this.data.key;
  /* load the app */
  if(!this.load(this.data)){
    this.database(false);
    this.log(this.data);
    return this.error({
      status:'error',
      message:'Invalid app data.'
    });
  }
  /* start the app */
  if(typeof ABL_START==='string'){
    document.addEventListener("DOMContentLoaded",e=>{
      /* remove all elements */
      this.removeAllElements();
      /* load start script */
      this.loadScript(ABL_START);
    });
  }
  /* perform silent-update */
  if(!isUpdated){
    await this.silentUpdate();
  }
  /* return as self-object */
  return this;
};
/* reset */
this.reset=function(){
  this.database(false);
  new ABL(this.app.name,this.app.host);
};
/* silent update */
this.silentUpdate=async function(){
  let res=await this.fetch(this.app.host),
  ndata=this.parseJSON(res),
  message='No update required.';
  if(typeof ndata==='object'&&ndata!==null
    &&ndata.hasOwnProperty('version')
    &&typeof ndata.version==='number'
    &&ndata.version!==NaN
    &&ndata.version>this.data.version){
    this.database(ndata);
    message='Successfully updated.';
  }console.log(message);
};

/* --------------- helper --------------- */
/* console log */
this.log=function(e){
  this.splash(e);
  console.log(e);
};
/* error log */
this.error=function(e){
  let l=document.getElementById('abl-loader');
  if(l){l.parentNode.remove();}
  this.splash(e);
  console.error(e);
};
/* load data */
this.load=function(r){
  if(typeof r==='object'&&r!==null
    &&typeof r.version==='number'
    &&Array.isArray(r.style)
    &&Array.isArray(r.script)
    &&typeof r.constant==='object'
    &&r.constant!==null){
    if(Array.isArray(r.module)){
      for(let i in r.module){
        this.loadScript(r.module[i].toString(),true);
      }
    }
    for(let i in r.constant){
      window[i]=r.constant[i];
    }
    for(let i in r.style){
      this.loadStyle(r.style[i].toString());
    }
    for(let i in r.script){
      this.loadScript(r.script[i].toString());
    }return true;
  }return false;
};
/* get/set/remove data */
this.database=function(data){
  let k='abl-data-'+this.app.name;
  if(typeof data==='object'&&data!==null){
    return localStorage.setItem(k,JSON.stringify(data));
  }else if(data===false){
    return localStorage.removeItem(k);
  }let dt=localStorage.getItem(k);
  if(!dt){return false;}
  let res=false;
  try{res=JSON.parse(dt);}catch(e){}
  return res;
};
/* fetch */
this.fetch=async function(url){
  url=typeof url==='string'?url:'';
  let response=await fetch(url),
  _this=this,
  loaded=0,
  type='progress',
  total=parseInt(response.headers.get('content-length'),10),
  res=new Response(new ReadableStream({
    async start(controller){
      let reader=response.body.getReader();
      for(;;){
        let {done,value}=await reader.read();
        if(done){
          _this.loader(false);
          break;
        }
        loaded+=value.byteLength;
        _this.loader({loaded,total,type});
        controller.enqueue(value);
      }
      controller.close();
    },
  }));
  return await res.text();
};
/* default loader and progress bar */
this.loader=function(e){
  let i='abl-loader',
  m=null,
  l=document.getElementById(i);
  if(l&&e===false){
    l.parentNode.remove();
    return;
  }
  let q=Math.floor(e.loaded/e.total*0x64),
  p=(q.toString().match(/^\d+$/)?q:0)+'%',
  r={
    parent:m,
    progress:l,
    loaded:e.loaded,
    total:e.total,
    type:e.type,
    id:i,
    percent:p,
  };
  if(l){
    l.style.width=p;
    m=l.parentNode;
    r.parent=m;
    if(e.loaded==e.total){
      m.remove();
    }return r;
  }
  l=this.buildElement('div',null,{id:i}),
  m=this.buildElement('div',null,{},[l]);
  m.appendTo(document.body);
  r.parent=m;
  r.progress=l;
  l.style.width=p;
  l.style.height='5px';
  l.style.backgroundColor='#37b';
  l.style.boxShadow='0px 0px 3px #37b';
  l.style.position='fixed';
  l.style.zIndex='9999999';
  l.style.top='0px';
  l.style.left='0px';
  m.style.width='100%';
  m.style.height='5px';
  m.style.backgroundColor='#ccc';
  m.style.boxShadow='0px 0px 3px #bbb';
  m.style.position='fixed';
  m.style.zIndex='9999999';
  m.style.top='0px';
  m.style.left='0px';
  m.style.right='0px';
  return r;
};
/* splash message */
this.splash=function(e){
  let i='abl-splash',s='',
      n=document.getElementById(i);
  if(n){n.remove();}
  n=this.buildElement('div',null,{id:i});
  n.appendTo(document.body);
  n.style.maxWidth='80vw';
  n.style.height='auto';
  n.style.maxHeight='80vh';
  n.style.backgroundColor='rgba(51,51,51,0.8)';
  n.style.color='#fff';
  n.style.boxShadow='0px 0px 3px #fff';
  n.style.position='fixed';
  n.style.zIndex='999999999';
  n.style.top='10vh';
  n.style.left='-300vw';
  n.style.opacity='0.9';
  n.style.transition='all 0.3s ease 0s';
  n.style.overflow='hidden auto';
  n.style.whiteSpace='pre-wrap';
  n.style.textAlign='center';
  n.style.display='block';
  n.style.fontFamily='system-ui,monospace';
  n.style.fontSize='13px';
  n.style.margin='0px auto';
  n.style.padding='10px 20px';
  n.style.borderRadius='7px';
  n.style.border='1px solid #bbb';
  if(typeof e==='string'){
    s=e;
  }else if(typeof e==='object'&&e!==null
    &&e.hasOwnProperty('message')
    &&typeof e.message==='string'){
    s=(typeof e.status==='string'&&e.status=='error'
       &&!e.message.match(/^error/i)?'Error: ':'')
     +e.message;
  }else{
    s=JSON.stringify(e);
    n.style.textAlign='left';
    n.style.wordBreak='break-all';
    n.style.fontFamily='monospace';
    n.style.fontSize='11px';
  }
  n.innerText=s;
  let o=n.offsetWidth/2;
  setTimeout(()=>{
    if(n){n.style.left='calc(50vw - '+o+'px)';}
    setTimeout(()=>{
      if(n){n.style.top='-300vh';}
      setTimeout(()=>{
        if(n){n.remove();}
      },0x64);
    },0xbb8);
  },0x20);
  return n;
};

/* --------------- stand-alone --------------- */
/* remove all elements */
this.removeAllElements=function(){
  let ch=document.head.childNodes,i=ch.length;
  while(i--){document.head.removeChild(ch[i]);}
  let cb=document.body.childNodes,u=cb.length;
  while(u--){document.body.removeChild(cb[u]);}
};
/* build element */
this.buildElement=function(tag,text,attr,children,html,content){
  let div=document.createElement(typeof tag==='string'?tag:'div');
  div.appendTo=function(el){
    if(typeof el.appendChild==='function'){
      el.appendChild(this);
      return true;
    }return false;
  };
  if(typeof text==='string'){
    div.innerText=text;
  }
  if(typeof attr==='object'&&attr!==null){
    for(let i in attr){
      div.setAttribute(i,attr[i]);
    }
  }
  if(Array.isArray(children)){
    for(let i=0;i<children.length;i++){
      div.appendChild(children[i]);
    }
  }
  if(typeof html==='string'){
    div.innerHTML=html;
  }
  if(typeof content==='string'){
    div.textContent=content;
  }
  div.args={
    tag:tag,
    text:text,
    attr:attr,
    children:children,
    html:html,
    content:content,
  };
  return div;
};
/* load style from string */
this.loadStyle=function(s){
  let c=document.createElement('style');
  c.rel='stylesheet';
  c.media='screen';
  c.textContent=s;
  document.head.appendChild(c);
  return c;
};
/* load script and module from string */
this.loadScript=function(s,m){
  if(typeof s!=='string'){return;}
  let j=document.createElement('script');
  j.type=m?'module':'text/javascript';
  j.async=true;
  j.textContent=s;
  document.head.appendChild(j);
  return j;
};
/* array of number --> to string */
this.toString=function(a){
  if(null===a){return (0x10faa9).toString(0x24);}
  if(typeof a===(0x4ea3aa4c3df5).toString(0x24)){
    return (0x4ea3aa4c3df5).toString(0x24);
  }
  if(typeof a===(0x55f57d43).toString(0x24)
    ||typeof a===(0x67e4c42c).toString(0x24)
    ||typeof a===(0x5ec2b639f).toString(0x24)
    ||typeof a===(0x1213796ebd7).toString(0x24)
    ||typeof a===(0x297e2079).toString(0x24)
    ||typeof a===(0x686136a5).toString(0x24)){
    return a.toString(0x24);
  }
  let r=String.raw({raw:[]});
  if(typeof a===(0x57a71a6d).toString(0x24)){
    for(let i in a){
      if(typeof a[i]===(0x57a71a6d).toString(0x24)){
        for(let o in a[i]){
          r+=String.fromCharCode(a[i][o]);
        }continue;
      }r+=this.toString(a[i]);
    }
  }return r;
};
/* parse json string */
this.parseJSON=function(text){
  text=typeof text==='string'?text:'';
  let res=null;
  try{
    res=JSON.parse(text);
  }catch(e){
    res=null;
  }return res;
};
/* build http query recusively */
this.buildQuery=function(data,key){
  let ret=[],dkey=null;
  for(let d in data){
    dkey=key?key+'['+encodeURIComponent(d)+']'
        :encodeURIComponent(d);
    if(typeof data[d]=='object'&&data[d]!==null){
      ret.push(this.buildQuery(data[d],dkey));
    }else{
      ret.push(dkey+"="+encodeURIComponent(data[d]));
    }
  }return ret.join("&");
};

/* start to initialize */
return this.init();
};
