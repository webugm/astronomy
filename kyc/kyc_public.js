function getDb(){
  return window.sqlitePlugin.openDatabase({name: 'kyccar.db', location: 'default'});
  }

function networkInfo() {
   var networkState = navigator.connection.type;
   var states = {};

   states[Connection.UNKNOWN]  = 'Unknown connection';
   states[Connection.ETHERNET] = 'Ethernet connection';
   states[Connection.WIFI]     = 'WiFi connection';
   states[Connection.CELL_2G]  = 'Cell 2G connection';
   states[Connection.CELL_3G]  = 'Cell 3G connection';
   states[Connection.CELL_4G]  = 'Cell 4G connection';
   states[Connection.CELL]     = 'Cell generic connection';
   states[Connection.NONE]     = 'No network connection';
}

function checkInternet() {
    var networkState = navigator.connection.type;
    if(networkState == Connection.NONE) {
        // alert('You are now offline!');
        return false;
    } else {
       // alert('You are now online!'+networkState);
       return true;
    }
}

function toggleCon(e) {
  showPhoneStatus();
  if(e.type == "offline") {
    // navigator.notification.alert("現在無法連線....", function() {}, "Offline!");
  } else {
    // navigator.notification.alert("目前連線....", function() {}, "Online!");
    // setupButtonHandler();
  }
}

function showPhoneStatus() {
  var phone_info = "";
  var phone_status = "";
  if(navigator.network.connection.type == Connection.NONE) {
     phone_status = "連線狀態:" + "未連線" + "<br>";
    } else {
     phone_status = "連線狀態:" + navigator.network.connection.type + "<br>";
  }

  phone_info = "手機序號:" + device.uuid    + "<br>" +
               "手機平台:" + device.platform+ "<br>" +
               "手機版本:" + device.version + "<br>";
  $("#deviceProperties").html(phone_status + phone_info + selfPhoneNumber+transDate);
}

function onConfirm(buttonIndex) {
  if(buttonIndex == 1) {
    startTrans();
   }

 }

function showConfirm() {
  navigator.notification.confirm(
      '要轉入資料嗎?',  // message
      onConfirm,              // callback to invoke with index of button pressed
      '訊息視窗',            // title
      '確定,離開'          // buttonLabels
  );
}

function checkSdcar() {
  var _ready = { device: 1, dom: 1 };
  // http://stackoverflow.com/questions/7432815/jquery-wait-for-multiple-complete-events

  document.addEventListener("deviceready", function() {
      _ready.device = 1; checkSdcarInit();
  }, false);

  document.addEventListener("DOMContentLoaded", function() {
      _ready.dom = 1; checkSdcarInit();
  }, false);

  checkSdcarInit();

  function printListing(listing) {
      var len = listing.length;
      var msg = "/sdcard 內含以下總共 " + len + " 個目錄或檔案<br />\n";
      for(var i=0; i<len; ++i) {
         msg += listing[i].fullPath + "<br />\n";
      }
      // document.querySelector('#display').innerHTML = msg;
      $('#display').html(msg);
  }

  function readDir(fileSystem) {
      console.log("ls-sdcard: readDir");
      // var dirReader = fileSystem.root.createReader();
      window.resolveLocalFileSystemURL("file:///sdcard/", function(dir) {
    console.log("ls-sdcard: resolveLocalFileSystemURL processing dir = " + JSON.stringify(dir,null,4).replace(/\n/g, "\n[Console LOG]"));
    dir.createReader().readEntries(printListing);
      });
  }

  function checkSdcarInit() {
      if (! (_ready.device && _ready.dom)) return;
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, readDir);
  }
}

function transAddressToLatLng(s_address) {
  var latitude  = 0;
  var longitude = 0;
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( { 'address': s_address}, function(results, status) {
  if (status == google.maps.GeocoderStatus.OK) {
      var latitude  = results[0].geometry.location.lat();
      var longitude = results[0].geometry.location.lng();
      setTimeout(function(){
        initializeMap(latitude,longitude);
      },300);

      var height = $(window).height() - 70;
      var width = $(window).width();
      // alert(height);

      $("#map").height(height);
      $("#map").width(width);
      }
  });

}

function getCurrentLocation() {
  // navigator.geolocation.getCurrentPosition(getCurrentLocationSuccess, getCurrentLocationError);
  navigator.geolocation.getCurrentPosition(getCurrentLocationSuccess, getCurrentLocationError, {maximumAge:60000, timeout:5000, enableHighAccuracy:true});
}

function getCurrentLocationSuccess(position) {
  var latitude  = position.coords.latitude;
  var longitude = position.coords.longitude;
  setTimeout(function(){
    initializeMap(latitude,longitude);
  },300);

  var height = $(window).height() - 70;
  var width = $(window).width();
  $("#map").height(height);
  $("#map").width(width);

}

function getCurrentLocationError(error) {
  alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

function initializeMap(lat, lng) {
 　　var latlng = new google.maps.LatLng(lat, lng);
 　　var myOptions = {
          zoom: 16,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
    　　　};
 　var map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);
   var marker = new google.maps.Marker({map:map , position:latlng});
 };

//cordova plugin add cozzbie.plugin.phonecalltrap
function getIncomingPhoneNumber(){//
    PhoneCallTrap.onCall(function(obj) {
        var callObj = JSON.parse(obj);
        var state = callObj.state;
        var callingNumber = callObj.incomingNumber;
        switch (state) {
            case "RINGING":
                alert("Phone is ringing" + callingNumber);
                break;
            case "OFFHOOK":
                // alert("Phone is off-hook");
                break;
            case "IDLE":
                // alert("Phone is idle");
                break;
        }

    });
}
// Cordova plugin for getting an Android device's phone number
// cordova plugin add https://github.com/oneminutedistraction/phonenumber.git
// cordova plugin remove at.oneminutedistraction.phonenumber (To remove the plugin)
function getYourPhoneNumber(){
  window.plugins.phonenumber.get(getYourPhoneNumberSuccess, getYourPhoneNumberFailed);
}

function getYourPhoneNumberSuccess(phonenumber) {
    selfPhoneNumber = "手機號碼:0" + phonenumber.substr(4)+ "<br>";
}

function getYourPhoneNumberFailed(phonenumber) {
    selfPhoneNumber = "手機號碼:無法讀取" ;
}

function exitApp(){
  navigator.notification.confirm(
      '確定要離開嗎?',  // message
      exitApp2,              // callback to invoke with index of button pressed
      '訊息視窗',            // title
      '是,否'          // buttonLabels
  );

}

function exitApp2(buttonIndex){
  if(buttonIndex == 1){
    if (typeof cordova !== 'undefined') {
        if (navigator.app) {
          navigator.app.exitApp();
           }
        else if (navigator.device) {
          navigator.device.exitApp();
         }
     } else {
        window.close();
        $timeout(function () {
          self.showCloseMessage = true;  //since the browser can't be closed (otherwise this line would never run), ask the user to close the window
         });
     }
  }
}

function calculateDiff(s_time1 , s_time2){
  // var currentdate1 = new Date();
  // var currentdate2 = new Date();
  // var cal_time = calculateDiff(currentdate1 , currentdate2);
  var b_time = s_time1.getHours()+":"+s_time1.getMinutes()+":"+s_time1.getSeconds();
  var e_time = s_time2.getHours()+":"+s_time2.getMinutes()+":"+s_time2.getSeconds();
  var time1 = b_time.split(':'), time2 = e_time.split(':');
  var hours1 = parseInt(time1[0], 10),
      hours2 = parseInt(time2[0], 10),
      mins1 = parseInt(time1[1], 10),
      mins2 = parseInt(time2[1], 10),
      seconds1 = parseInt(time1[2], 10),
      seconds2 = parseInt(time2[2], 10);
  var hours = hours2 - hours1, mins = 0, seconds = 0;
  if(hours < 0) hours = 24 + hours;
  if(mins2 >= mins1) {
      mins = mins2 - mins1;
  }
  else {
      mins = (mins2 + 60) - mins1;
      hours--;
  }

  if (seconds2 >= seconds1) {
         seconds = seconds2 - seconds1;
  }
  else {
         seconds = (seconds2 + 60) - seconds1;
     mins--;
  }

  r_time = (hours !== 0) ? hours + "小時" : "";
  r_time +=(mins !== 0) ? mins + "分" : "";
  r_time +=(seconds !== 0) ? seconds + "秒" : "";
  return r_time;
 }

 function paddingLeft(str,lenght){
  if(str.length >= lenght)
  return str;
  else
  return paddingLeft("0" +str,lenght);
 }
 function paddingRight(str,lenght){
  if(str.length >= lenght)
  return str;
  else
  return paddingRight(str+"0",lenght);
 }

 function dcToChineseDateTime(p_datetime,p_type){
  var kyc_f_01 = p_datetime.split(" ");
  var kyc_f_ymd   = kyc_f_01[0]; // yy mm dd
  var kyc_f_time  = kyc_f_01[1]; // year

  var kyc_f_02 = kyc_f_ymd.split("-");
  var kyc_f_03 = kyc_f_time.split(":");

  var  ret_datetime = p_datetime ;
  switch (p_type) {
      case "民國日期":
           ret_datetime = kyc_f_02[0] - 1911+kyc_f_02[1]+kyc_f_02[2] + " " + kyc_f_03[0] + ":" + kyc_f_03[1];
      case "西元日期":


  }

  return ret_datetime;
 }

