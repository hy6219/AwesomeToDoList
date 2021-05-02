const form1 = document.querySelector(".js-userForm"),
     user = form1.querySelector("input"),
     form2 = document.querySelector(".js-toDo"),
     toDo = form2.querySelector("input");
const clock = document.querySelector(".js-clock");
const prtName = document.querySelector(".js-name");
const weather = document.querySelector(".js-weather");
const weatherIcon = document.createElement("img");
const API_key="9c679461b7e83bc4574e6e2e8f361c31";
const colors =["rgb(0, 206, 201)", "rgb(162, 155, 254)","rgb(253, 121, 168)","rgb(116, 185, 255)","rgb(85, 239, 196)"];

const PEN = document.querySelector(".pending").querySelector("ul");
const FIN = document.querySelector(".finished").querySelector("ul");
/**할일을 pending, finished로 나누어 구분! */
let pendingTasks=[];
let finTasks=[];//array

document.body.style.backgroundColor=colors[Math.floor(Math.random()*(colors.length))-1];
clock.style.fontSize="60px";


function time(){
    const time = new Date();
    const h    = time.getHours();
    const m    = time.getMinutes();
    const s    = time.getSeconds();
    const prtTime = `${(h<10 ? `0${h}`:h)}:${(m < 10 ? `0${m}`:m)}:${(s < 10 ? `0${s}`:s)}`;
    clock.innerText = prtTime;
}

function saveName(text){
    localStorage.setItem("user",text);
}
function askForName(){
    //비워져 있는 경우는 언제든지 이벤트리스너에 의해서 동작!
    form1.addEventListener("submit",handleSubmit);
}
//name 저장한 것을 application 객체에서 확인하기 위함
function loadName(){
    const cur=localStorage.getItem("user");
    if(cur){
        paintName(cur);
    }else{
        askForName();
    }
}

function paintName(text){
    prtName.style.color="black";
    prtName.innerText=`Hello ${text}!`;
}

//handler for name
function handleSubmit(event){
    event.preventDefault();
    const userName = user.value;
   // console.log(userName);
    paintName(userName);
    saveName(userName);
}
/**
 * 날씨
 */
function saveCoords(obj){
  //  console.log(obj);
    localStorage.setItem("coords",JSON.stringify(obj));
}
function askGeo(){
    navigator.geolocation.getCurrentPosition(handleGeoSuccess,handleGeoErr);
}
function handleGeoSuccess(position){
    const  latitude = position.coords.latitude;//경도
    const  longitude = position.coords.longitude;//위도
    const obj ={
        latitude,
        longitude
    };
    saveCoords(obj);
    getWeather(latitude,longitude);
}

function handleGeoErr(err){
    console.log(`geo ${err}`);
}
function getWeather(lat,lon){
  // console.log(lat,lon);
    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`)
    .then(function(response){
        return response.json();
    })
    .then(function(json){
        const city = json.name;
        let temp = json.main.temp;
        let wIcon = json.weather[0].icon;
        
        weather.innerText=`${city} ${temp} ℃`;
        weatherIcon.src=`http://openweathermap.org/img/wn/${wIcon}.png`;
        weather.appendChild(weatherIcon);
    });
}

function loadCoords(){
    const loaded= localStorage.getItem("coords");
    if(loaded!==null){
        const parsed = JSON.parse(loaded);
        getWeather(parsed.latitude,parsed.longitude);
    }else{
        askGeo();
    }
}
/**
 * To do
 */


//할일 객체
function getTaskObj(text){
    //할일로 객체 생성하거나 관리하기
    const obj = {
        id:String(Date.now()),
        text
    };
    return obj; 
}
/**
 * let pendingTasks, finTasks;
 */
function savePendingTask(task){
    pendingTasks.push(task);
}
function saveCurrent(){
    //https://stackoverflow.com/questions/55879297/typeerrorcannot-read-property-push-of-null
    localStorage.setItem("pending",JSON.stringify(pendingTasks)) || [];
    localStorage.setItem("finished",JSON.stringify(finTasks)) || [];
}
//객체 찾기
//등록한 곳에 있는지
function findInPending(id){
    const obj = pendingTasks.find(function(task){
        return task.id==id;
    }) || {};
    return obj;
}

//끝난 곳에 있는지
function findInFinished(id){
    const obj = finTasks.find(function(task){
        return task.id==id;
    })|| {};
    return obj;
}

//제거
function removeFromPending(id){
    //아이디 불일치인 부분만 리턴하여 저장해주기
    pendingTasks=pendingTasks.filter(function(task){
        return task.id!==id;
    })|| [];
}

function removeFromFin(id){
    //아이디 불일치인 부분만 리턴하여 저장해주기
    finTasks=finTasks.filter(function(task){
        return task.id!==id;
    })|| [];
}

//어디서 발생한 지에 따라 제거!
function handleDelete(event){
    //li요소를 지워야 하므로!
    const li    =  event.target.parentNode;
    li.parentNode.removeChild(li);
    removeFromFin(li.id);
    removeFromPending(li.id);
    saveCurrent();
}


//해야할 일에 추가하기
function addToPending(task){
    pendingTasks.push(task);
}

//한 일에 추가하기
function addToFin(task){
    finTasks.push(task);
}
//finish눌렀을 때
function handleFinshed(event){
    const li = event.target.parentNode;
    li.parentNode.removeChild(li);
    const task =findInPending(li.id);
    
    removeFromPending(li.id);
    addToFin(task);//id값 일치하면 해당객체(find결과) 추가
    paintToFin(task);
    saveCurrent();
}
//finish->pending
function handleGoBack(event){
    const li = event.target.parentNode;
    li.parentNode.removeChild(li);
    const task= findInFinished(li.id);
    removeFromFin(li.id);
    addToPending(task);
    paintToPending(task);
    saveCurrent();
}

//pending에 painting
function paintToPending(task){
    const li = document.createElement("li");
    const span = document.createElement("span");
    const delBtn =document.createElement("button");
    const comBtn = document.createElement("button");

    const text = task.text;
    span.innerText = text;
    delBtn.classList.add("del");
    delBtn.innerText="❌";
    delBtn.addEventListener("click",handleDelete);
    comBtn.classList.add("com");
    comBtn.innerText="✅";
    comBtn.addEventListener("click",handleFinshed);
    li.id=task.id;
    li.appendChild(span);
    li.appendChild(delBtn);
    li.appendChild(comBtn);

    PEN.appendChild(li);

}
//finished에 painting
function paintToFin(task){
    const li = document.createElement("li");
    const span = document.createElement("span");
    const delBtn =document.createElement("button");
    const backBtn = document.createElement("button");
    
    const text = task.text;
    span.innerText = text;
    delBtn.classList.add("del");
    delBtn.innerText="❌";
    delBtn.addEventListener("click",handleDelete);
    backBtn.classList.add("back");
    backBtn.innerText="↩";
    backBtn.addEventListener("click",handleGoBack);

    li.id=task.id;
    li.appendChild(span);
    li.appendChild(delBtn);
    li.appendChild(backBtn);

    FIN.appendChild(li);

}



function loadToDos(){
    pendingTasks= JSON.parse(localStorage.getItem("pending"))|| [];
    finTasks= JSON.parse(localStorage.getItem("finished"))|| [];
}

function handleToDoSubmit(event){
    event.preventDefault();
    const val = toDo.value;
    const obj = getTaskObj(val) || {};
    toDo.value="";
    //console.log(obj.text);
    paintToPending(obj);
    savePendingTask(obj);
    saveCurrent();
}
//배열이 비어있는 것처럼 간주하지 않도록하기!
function cogTasks(){
    pendingTasks.forEach(function(task){
        paintToPending(task);
    });
    finTasks.forEach(function(task){
        paintToFin(task);
    });
}
function init(){
    setInterval(time,1000);
    loadCoords();
    loadName();
    loadToDos();
    form2.addEventListener("submit",handleToDoSubmit);
    cogTasks();
}
init();
