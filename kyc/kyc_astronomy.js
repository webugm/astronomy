var imgSize = 0;
var upload_times = 0;
var upload_msg = "";
var ajax_msg = "";
var totalImg = 0;
var countImg = 0;
var request1 = "" ;
var pass_ofsn = 0;
var pass_ssn  = 0;
var url1 = "http://ck2.ugm.com.tw/modules/tad_form/app.php";
var urlUpload = "http://ck2.ugm.com.tw/uploads/tad_form/image/";
// var url1 = "http://ck2.ugm.com.tw/modules/tad_form/app_1060502_1.php";//
// var url1 = "http://michael1.cp35.secserverpros.com/app/myproject/m_function.php"
function showPhoneInfo() {
  var str1 = "";
  if(navigator.network.connection.type == Connection.NONE) {
     str1 = "未連線";
    } else {
      str1 = navigator.network.connection.type;
    }
  var str = "" ;

  str = "手機連線:" + str1 + "<br />" +
        "手機序號:" + device.uuid + "<br />" +
        "手機版本:" + device.version + "<br />" +
        "手機平台:" + device.platform+ "<br />"  +
        "手機Name:" + device.name;
  $("#deviceProperties").html(str);
  $("#serial2").val(device.uuid);
}

//拍照
function capturePhoto() {
    //拍照并获取Base64编码的图像（quality : 存储图像的质量，范围是[0,100]）
    navigator.camera.getPicture(onCapturePhotoSuccess, onCapturePhotoFail, { quality: 30,
                                destinationType: destinationType.FILE_URI,saveToPhotoAlbum:true }
                                );
}

//拍照成功
function onCapturePhotoSuccess(imageURI) {

    window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
            fileEntry.file(function(fileObj) {
                imgSize = fileObj.size;
                // alert("first imgSize=" + imgSize);
            });
        });

    setTimeout(function(){
      totalImg = $('ul#lv03 li').length;
    var str = '<li> <a href="#"> <img src="' + imageURI + '" class="' + 'img1" >';
    str += "<p>NO：" + ($('ul#lv03 li').length+1) + "</p></a>";
    str += '<a class="del" href="#">Delete</a></li>';
    $("#lv03").append(str);
    $("#lv03").enhanceWithin().listview("refresh");
    },500);
}

//拍照失败
function onCapturePhotoFail(message) {
  alert('拍照失敗: ' + message);
 }


 function getPhoto2() {
  // $("#lv03").empty();
  totalImg = 0 ; // $('ul#lv03 li').length;
  var wkcount = 0 ;
  $("ul#lv03 li").each(function() {
    wkcount ++;
    wkcsn  = $(this).attr('data-kyc-csn');
    if(wkcsn == "NONE"){
      totalImg ++;
      $(this).find("p").each(function () {
        $(this).text("NO:"+totalImg);
      });
    }
  });

  imgSize = 0;
  var max_pic = 5;
  var w_width = 800;
  var w_height = 640;
  var w_imagesCount = max_pic - wkcount;

  if(w_imagesCount > 0){
     window.imagePicker.getPictures(
         function(results) {
             for (var i = 0   ; i < results.length; i++) {
                   window.resolveLocalFileSystemURI(results[i], function(fileEntry) {
                     fileEntry.file(function(fileObj) {
                         imgSize = fileObj.size;
                     });
                   });
                 var str = "<li data-kyc-csn='NONE'>";
                 str += "<a href='#'>" ;
                 str += "<img src='" + results[i] + "' class='" + "img1' >";
                 str += "<p>NO：" + (i+1+totalImg) + "</p>";
                 str += "</a>";
                 str += "<a class='del' href='#'>Delete</a></li>";
                 $("#lv03").append(str);
             }
             $("#lv03").enhanceWithin().listview("refresh");
         }, function (error) {
             alert('Error: ' + error);
         }, {
             maximumImagesCount: w_imagesCount,
             width: w_width ,
             height: w_height
         }
     );
  } else {
    alert('照片合計不能超過:' +max_pic + "張");
  }
 }

function upload() {
  upload_msg = "";
  totalImg = 0 ; // $('ul#lv03 li').length;
  $("ul#lv03 li").each(function() {
    wkcsn  = $(this).attr('data-kyc-csn');
    if(wkcsn == "NONE"){
      totalImg ++;
    }
  });
  if(totalImg == 0){
    alert("請挑選照片");
    return false;
  }

  var wx_csn = $("#304sele option:selected").val(); // tad_form_kind value

  var options = new FileUploadOptions();
  $('#upload3LoadingIMG').show();
  $("ul#lv03 li").each(function() {
    wkcsn  = $(this).attr('data-kyc-csn');
    if(wkcsn == "NONE"){
      var upload_seq = "";
      $(this).find("p").each(function () {
        upload_seq = $(this).text();
      });
      // var src = $("img", this).prop("src");
      var src_file = $("img",this).attr('src'); // 上面也行
      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = src_file;
      //上傳参數
      var params = {};
      params.description = "上傳說明"; // $('#description').val();
      params.op = "upload"; // $('#op').val();
      params.upload_seq = upload_seq;
      params.ssn = pass_ssn;
      params.uname = $("#uname").val();
      params.pass = $("#pass").val();
      params.serial = $("#serial2").val()

      options.mimeType = "image/jpeg/jpg/png";
      options.params = params;
      options.chunkedMode = false;
      var ft = new FileTransfer();
      ft.upload(src_file, encodeURI(url1), uploadSuccess, uploadFail, options);
     }
  });

}

function uploadSuccess(r) {

  var data = jQuery.parseJSON( r.response );
  $.each( data, function( key, val ) {
      upload_times ++;
      if (key == "OK") {
      } else {
        upload_msg +=  val;
      }

      if(upload_times >= totalImg){
        if(upload_msg == "") {
          alert("上傳完畢!!");
        } else {
          alert(upload_msg);
        }
        upload_times = 0;
        $('#upload3LoadingIMG').hide();
      }
    });


}

function uploadFail(error) {
  $('#loadingIMG').hide();
  alert("上傳失败! Code = " + error.code);
}

function login_chk(){ //提交数据函数
  // checkInternet();
  if(form1.uname.value ==""){
    alert("請輸入使用者帳號!");
    form1.uname.select();
    return(false);
  }
  if(form1.pass.value ==""){
    alert("請輸入密碼!");
    form1.pass.select();
    return(false);
  }

   var pass0 = "op=login&uname="+$("#uname").val()+"&pass="+$("#pass").val()+"&serial="+$("#serial2").val();
  var str="";
  request1 =$.ajax({ //调用jquery的ajax方法
   type: "POST", //设置ajax方法提交数据的形式
   url: url1,    //把数据提交到app.php
   data: pass0,
    //输入框writer中的值作为提交的数据
   success: function(msg){ //提交成功后的回调，msg变量是ok.php输出的内容。
    var data1 = jQuery.parseJSON(msg);
    var ret_status = data1["responseStatus"];  // "FAIL" "SUCCESS"  "WARNING"
    var ret_msg    = data1["responseMessage"]; // message description
    var ret_content= data1["responseArray"];   // if  SUCCESS return content array

    if(ret_status=="SUCCESS"){
      data2 = jQuery.parseJSON(ret_content);
      $.each(data2, function(index1, item1) {
           var wkindex = paddingLeft(index1,3);
           data3 = jQuery.parseJSON(item1);
           var wktitle = data3["title"];
           var wkofsn = data3["ofsn"];
           var wkssn = 0;
           var wkfill_count = data3["fill_count"];
           var wkself = jQuery.parseJSON(data3["fill_arr"]).length;
           var p_ofsn = '\"' + wkofsn + '\"';
           var p_ssn = '\"' + wkssn + '\"';
           var p_summary = JSON.stringify(data3) ; // 問卷調查彙總表
           var wkstyle = "";
           var wkicon = "data-icon='forbidden'";
           if(data3["multi_data"] == 0 && wkfill_count > 0 ){ // 允許同一個人輸入多筆
              wkstyle = "style='display: none;' ";
           }
           if(wkself > 0){
              wkicon = "data-icon='plus'";
           }
           str += "<li id='" + wkofsn + "'" + " data-icon='false' >" ;
           str += "<a href='' class='lv01_a' >";
           str += "<img  src='kyc/images/add.png '" + wkstyle ;
           str += " onclick='getForm1(this," + p_ofsn + "," + p_ssn + "," + p_summary + " ,\"ADD\");'>";
           str += "<p class ='lv01_a_p'>" + wktitle + "</p>";
           str += "<span class='ui-li-count'>" + wkfill_count + "</span>";
           str += "</a>";
           str += "<a href='' " + wkicon + " data-kyc='" + wkindex + "' onclick='chgLv01(this);'>展開</a>";

           str += "</li>";

           if(wkself > 0){
             data4 = jQuery.parseJSON(data3["fill_arr"]);
            $.each(data4, function(index4, item4) {
              var p_ssn = '\"' + item4["ssn"] + '\"';
              var p_title = '\"' + wktitle + '\"';
              str += "<ul data-role='listview' class='aa aa" + wkindex + "' style='display:none;'>";
              str += "<li><fieldset data-role='controlgroup' data-type='horizontal'>";
              str += "<div class='lv01_ul2_divP' <p>" +item4["man_name"] + "／" ;
              str += dcToChineseDateTime(item4["fill_time"],"民國日期") + "</p></div>";
              str += "<div class='lv01_ul2_divImg'  data-role='controlgroup' ";
              str += "data-type='horizontal'> ";

              str += "<a href='' ";
              str += " onclick='getForm1(this," + p_ofsn + "," + p_ssn + "," + p_summary + " ,\"INQ\");'>";
              str += "<img src='kyc/images/browse.png' class='img2'></a>";

              str += "<a href='' ";
              str += " onclick='getForm1(this," + p_ofsn + "," + p_ssn + "," + p_summary + " ,\"EDIT\");'>";
              str += "<img src='kyc/images/edit.png' class='img2'></a>";

              str += "<a href='' ";
              str += " onclick='getForm2(this," + p_ofsn + "," + p_ssn + "," + p_summary + " ,\"UPLOAD\");'>";
              str += "<img src='kyc/images/upload.png' class='img2'></a>";

              str += "</fieldset>";
              str += "</div></li>";
              str += "</ul>";
             });
           }

      });
     $.mobile.changePage('#show1','slide'); // 顯示所有可輸入的表單
    }else{
      $("#showmsg").html(ret_msg);
      return(false);
    }
    },
    error: function (jqXHR, exception) {
       alert("連線錯誤：" + jqXHR);
    },
    beforeSend:function(){
               $('#loadingIMG').show();
               },
    complete:function(){

     setTimeout(function(){
      },500);

     $("#lv01").empty();
     $("#lv01").append(str);
     $('#loadingIMG').hide();
     $('#lv01').listview('refresh');

    }
   });
 }

 function chgLv01(el) {
       if($(el).attr('data-icon') == "forbidden"){
        return false;
       }
       var kyc_c1 =$(el).attr('data-kyc');
       if($(el).attr('data-icon') == "plus"){
          $(el).attr('data-icon','minus');
          $(el).removeClass("ui-icon-plus").addClass("ui-icon-minus").trigger("refresh");
          $(".aa"+kyc_c1).css("display", "block");
          $(el).attr('title','關閉');
       } else{
         $(el).attr('data-icon','plus');
         $(el).removeClass("ui-icon-minus").addClass("ui-icon-plus").trigger("refresh");
         $(".aa"+kyc_c1).css("display", "none");
         $(el).attr('title','展開');
       }

       return false;
 }
 var str2 ="";
function getForm1(el,pofsn,pssn,pp2,poptype){
  var txt = $(el).closest('li').text();
  var id = $(el).closest('li').attr('id');
  pass_ssn = pssn;

  if(poptype =="ADD"){ //
    var pass1 ="op=op_form&uname="+$("#uname").val()+"&pass="+$("#pass").val()+"&serial="+$("#serial2").val()+ "&ofsn=" + pp2["ofsn"];
    $('#btn20a').buttonMarkup({ icon: "plus" });
    $('#btn20a').text("新增");
  }
  if(poptype =="INQ"){ //
    var pass1 ="op=op_form&uname="+$("#uname").val()+"&pass="+$("#pass").val()+"&serial="+$("#serial2").val()+ "&ofsn=" + pp2["ofsn"]+ "&ssn=" + pssn;
    $('#btn20a').buttonMarkup({ icon: "search" });
    $('#btn20a').text("查詢");
  }
  if(poptype =="EDIT"){ //
    var pass1 ="op=op_form&uname="+$("#uname").val()+"&pass="+$("#pass").val()+"&serial="+$("#serial2").val()+ "&ofsn=" + pp2["ofsn"]+ "&ssn=" + pssn;
    $('#btn20a').buttonMarkup({ icon: "edit" });
    $('#btn20a').text("修改");
  }

  $('#201Label').html('<span style="color:#FF00FF;font-weight:bold;">問卷名稱：</span>' + pp2["title"] );

  $.ajax({ //调用jquery的ajax方法
    type: "POST", //设置ajax方法提交数据的形式
    url: url1,    //把数据提交到app.php
    data: pass1,
    //输入框writer中的值作为提交的数据
    success: function(smsg){ //提交成功后的回调，msg变量是ok.php输出的内容。
      var sdata0 = jQuery.parseJSON(smsg);
      var sret_status = sdata0["responseStatus"];  // "FAIL" "SUCCESS"  "WARNING"
      var sret_msg    = sdata0["responseMessage"]; // message description
      var sret_content= sdata0["responseArray"];   // if  SUCCESS return content array

      if(sret_status=="SUCCESS"){
        str21 = "";
        sdata1 = jQuery.parseJSON(sret_content);
        sdata21 = jQuery.parseJSON(sdata1["col"]);
        $.each(sdata21, function(sindex21, sitem21) {
          sdata = jQuery.parseJSON(sitem21);
          var wktitle = sdata["title"];
          var wkofsn  = sdata["ofsn"];
          var wkcsn   = sdata["csn"];
          var wkkind  = sdata["kind"];
          var wksize  = sdata["size"];
          var wkchk   = sdata["chk"];
          var wksort  = sdata["sort"];
          var wkvalok = sdata["valok"];
          var wkstr2 = getForm1Detail(wktitle , wkofsn , wkcsn , wkkind , wksize , wkchk , wksort, wkvalok);
          str21 += wkstr2;
        });
        setTimeout(function(){
        },500);
        $.mobile.changePage('#question2','slide');
      }else{
        $("#showmsg").html(sret_msg);
        return(false);
      }
    },
    error: function (jqXHR, exception) {
       alert("連線錯誤：" + jqXHR);
    },
    beforeSend:function(){
               $('#show1LoadingIMG').show();
               },
    complete:function(){
      setTimeout(function(){
      },500);

      $("#lv02 li").remove();
      $("#lv02").append(str21);
      $('#show1LoadingIMG').hide();
      $('#lv02').enhanceWithin().listview('refresh');

      }

   });
}

function getForm1Detail(pTitle , pOfsn , pCsn , pKind , pSize , pChk , pSort,pValok){
  pass_ofsn = pOfsn;
  var pStr1 = "<li data-kyc-kind='" + pKind + "' data-kyc-csn='" + pCsn + "' data-kyc-chk='" + pChk + "'>";
  var wkpp1 = pChk == 1 ? "<span style='color:red;font-weight:bold;'>(＊)</span>" : "";
  var wkpp2 = pKind == "checkbox" ? "<span style='color:blue;font-weight:bold;'>(複選)</span>" : "";

  var wkpcsn = paddingLeft(pCsn,3);
  switch (pKind) {
      case "radio":
          pStr1 += " <p>" + pTitle + wkpp1 + wkpp2 + "</p>";
          pStr1 += "<fieldset data-role='controlgroup' data-type='horizontal'>";
          var pSplit = pSize.split(";");
          $.each(pSplit, function( i, val ) {
            var wkseq = paddingLeft(i,2);
            var wkchecked = val == pValok ? "checked" : "";
            pStr1 += "<label>" + val + "<input type='radio'";
            pStr1 += " name='ra"+wkpcsn+"' "+ wkchecked;
            pStr1 += " id='ra"+wkpcsn+wkseq+"' value=" + val + "> </label>";
          });
          pStr1 += "</fieldset> </li>";
          break;
      case "checkbox":
          var pOkArray = pValok.split(";");
          pStr1 += " <p>" + pTitle + wkpp1 + wkpp2 + "</p>";
          pStr1 += "<fieldset data-role='controlgroup' data-type='horizontal'>";
          var pSplit = pSize.split(";");
          $.each(pSplit, function( i, val ) {
            var wkseq = paddingLeft(i,2);
            var wkchecked = $.inArray( val, pOkArray) != -1 ? "checked" : "";
            pStr1 += "<label>" + val + "<input type='checkbox' id='ch"+wkpcsn+wkseq+"' " +
            wkchecked +" ></label>";
          });
          pStr1 += "</fieldset> </li>";
          break;
      case "select":
          pStr1 += "<fieldset class='ui-field-contain'>";
          pStr1 += "<label for='sl" + wkpcsn + "'>" + " <p>" + pTitle + wkpp1 + wkpp2 + "</p>" + "</label>";
          pStr1 += "<select name='sl" + wkpcsn + "' id='sl" + wkpcsn + "'>";
          pStr1 += "<option value=''></option>";
          var pSplit = pSize.split(";");
          $.each(pSplit, function( i, val ) {
            var wkselected = val == pValok ? "selected" : "";
            pStr1 += "<option value='" + val + "' " + wkselected + ">" + val + "</option>";
          });
          pStr1 += "</select></fieldset> </li>";
          break;
      case "text":
          pStr1 += "<label for='fa"+ wkpcsn + "'>";
          pStr1 += " <p>" + pTitle + wkpp1 + wkpp2 + "</p>";
          pStr1 += "</label>";
          pStr1 += "<input maxlength=" + pSize + " type='text' name='fa" + wkpcsn + "' id='fa" +
                   wkpcsn + "' value=" + pValok + ">";
          pStr1 += "</li>";
          break;
      case "textarea":
          pStr1 += "<label for='tx"+ wkpcsn + "'>";
          pStr1 += " <p>" + pTitle + wkpp1 + wkpp2 + "</p>";
          pStr1 += "</label>";
          pStr1 += "<textarea  maxlength=" + pSize + " name='tx" + wkpcsn + "' id='tx" + wkpcsn + "'>" + pValok + "</textarea>";
          pStr1 += "</li>";
          break;
      default:
          pStr1 += "<p> 問卷類別有誤 </p>";
          pStr1 += "</li>";
  }

  return pStr1;
}

function getForm2(el,pofsn,pssn,pp2,poptype){
  // alert($(el).get(0).nodeName);  // tagname : A  自已
  // alert($(el).parent().get(0).nodeName); // 上層 tagname : DIV
  // alert($(el).parent().parent().get(0).nodeName); // 上上層 tagname : DIV 有問題
  // alert($(el).parent().parent().parent().get(0).nodeName); // 上上上層 tagname : LI
  pass_ssn = pssn;
  var txt = $(el).parent().parent().parent().text();
  var id = $(el).closest('li').attr('id');
  $('#301Label').html('<span style="color:#8B00FF;font-weight:bold;">問卷名稱：</span>' + pp2["title"] );

  var pass1 ="op=op_form&uname="+$("#uname").val()+"&pass="+$("#pass").val()+"&serial="+$("#serial2").val()+ "&ofsn=" + pp2["ofsn"]+ "&ssn=" + pssn;

  $.ajax({ //调用jquery的ajax方法
    type: "POST", //设置ajax方法提交数据的形式
    url: url1,    //把数据提交到app.php
    data: pass1,
    //输入框writer中的值作为提交的数据
    success: function(smsg){ //提交成功后的回调，msg变量是ok.php输出的内容。

      var sdata0 = jQuery.parseJSON(smsg);
      var sret_status = sdata0["responseStatus"];  // "FAIL" "SUCCESS"  "WARNING"
      var sret_msg    = sdata0["responseMessage"]; // message description
      var sret_content= sdata0["responseArray"];   // if  SUCCESS return content array
      // alert(sret_status+":"+sret_msg);
      if(sret_status=="SUCCESS"){

        str21 = "";
        sdata1 = jQuery.parseJSON(sret_content);

        var wk_pic_path = sdata1["breadcrumb"]; // 取得圖片已上傳位置

        $("#lv03").empty();

        sdata22 = jQuery.parseJSON(sdata1["upload_pic"]); // 取得已上傳圖片filename
        $.each(sdata22, function(sindex22, sitem22) {
          // alert(sindex22 + ":" + sitem22["file_name"] + ":" +  sitem22["description"]);
          var str = "<li data-kyc-csn='" + sitem22["files_sn"]   + "'>";
          str += "<a href='#'>" ;
          str += "<img src='" + urlUpload + sitem22["file_name"] + "' class='img1' >";
          str += "<p>" + sitem22["description"] + "</p>";
          str += "<p><span style='color:#8B00FF;font-weight:bold;'>已上傳</span> </p>";
          str += "</a>";
          str += "<a class='del' href='#'>Delete</a></li>";
          $("#lv03").append(str);
        });

        $('#lv03:visible').enhanceWithin().listview('refresh');

        sdata23 = jQuery.parseJSON(sdata1["form"]); // 取得問卷主檔

        // alert(sdata23["select_csn"]);// 回傳全部可供選擇的上傳路徑
        var wk_user = sdata23["uid_name"] ; //+ "／" + sdata23["email"];// 填報者 姓名 + email
        wksele =  "<fieldset class='ui-field-contain'>";
        wksele += "<label for='304csn'>選擇圖片上傳路徑</label>";
        wksele += "<select name='304csn' id='304csn'>";
        wksele += sdata23["select_csn"];// 回傳全部可供選擇的上傳路徑
        wksele += "</select>" + "</fieldset>";

        $('#302Label').html('<span style="color:#8B00FF;font-weight:bold;">　填報者：</span>' + wk_user);
        $('#303Label').html('<span style="color:#8B00FF;font-weight:bold;">已傳位置：</span>' + wk_pic_path );
        $('#304sele').html(wksele);

        setTimeout(function(){
        },500);
        $.mobile.changePage('#upload3','slide');
      }else{
        alert(sret_status+":"+sret_msg);
        return(false);
      }
    },
    error: function (jqXHR, exception) {
       alert("連線錯誤：" + jqXHR);
    },
    beforeSend:function(){
               $('#show1LoadingIMG').show();
               },
    complete:function(){

      }

   });
}

function register_check(){ //提交数据函数
  if(form2.uname2.value ==""){
    alert("請輸入使用者帳號!");
    form2.uname2.select();
    return(false);
  }
  if(form2.pass2.value ==""){
    alert("請輸入密碼!");
    form2.pass2.select();
    return(false);
  }

  // var url1 = "http://ck2.ugm.com.tw/modules/tad_form/app.php";
  $.ajax({ //调用jquery的ajax方法
   type: "POST", //设置ajax方法提交数据的形式
   url: url1,    //把数据提交到app.php
   data:"op=register&uname="+$("#uname2").val()+"&pass="+$("#pass2").val()+"&serial="+$("#serial2").val(),
   success: function(msg){ //提交成功后的回调，msg变量是ok.php输出的内容。
      var data1 = jQuery.parseJSON(msg);
      var ret_status = data1["responseStatus"];  // "FAIL" "SUCCESS"  "WARNING"
      var ret_msg    = data1["responseMessage"]; // message description
      var ret_content= data1["responseArray"];   // if  SUCCESS return content array
      if(ret_status=="SUCCESS"){
       $("#showmsg2").html(ret_msg);
      }else{
        $("#showmsg2").html(ret_msg);
        return(false);
      }
    },
    error: function (jqXHR, exception) {
        var msg = '';
        if (jqXHR.status === 0) {
            msg = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        alert(msg);
    },
    beforeSend:function(){
        $('#loadingIMG2').show();
       },
    complete:function(){
               $('#loadingIMG2').hide();
               }
   });
 }

 function setupSave(){ //儲存 系統設定參數
  localStorage.uname = $('#rUser').val();
  localStorage.pass = $('#rPass').val();
  $.mobile.changePage('#home','slide');
 }

 function setupRestore(){ //儲存 系統設定參數
  $('#uname').val(localStorage.uname);
  $('#pass').val(localStorage.pass);
  $('#rUser').val(localStorage.uname);
  $('#rPass').val(localStorage.pass);
 }

 function tadFormSave(){ //上傳輸入調查表資料
  var temp_ssn = pass_ssn;
  if($('#btn20a').text() =="新增"){
    temp_ssn = 0;
    var op_type = "ADD";
  } else {
    var op_type = "UPDATE";
  }
  var myJson = new Object();
  myJson.data1 = [];
  var wkval = "";
  var wkerr = "";
  $("#lv02>li").each(function(i, elem) {
    wkkind = $(this).attr('data-kyc-kind');
    wkcsn  = $(this).attr('data-kyc-csn');
    wkchk  = $(this).attr('data-kyc-chk');
    wktitle = $(this).find("p").text();
    var wkval = "";
    switch (wkkind) {
        case "radio":
             wkval = "";
             $(this).find("input[name*=ra]:checked").each(function(){
               wkval = $(this).val();
             });
             break;
        case "checkbox":
            wkval = "";
            $(this).find("input[id*=ch]:checked").each(function () {
               wkval += (wkval=="") ? $(this).parent().text() : ";"+$(this).parent().text();
            });
            break;
        case "select":
             wkval = "";
             $(this).find("select").each(function () {
               wkval = $(this).val();
             });
             break;
        case "text":
             wkval = "";
             $(this).find("input[name*=fa]").each(function () {
               wkval = $(this).val();
             });
             break;
        case "textarea":
             wkval = "";
             $(this).find("textarea").each(function () {
               wkval = $(this).val();
             });
             break;
    }
        if(wkchk == 1 && wkval == ""){
          wkerr += wktitle + "\n";
        }
        myJson.data1.push({
             ofsn:pass_ofsn,
             ssn: temp_ssn,
             csn: wkcsn,
             val: wkval
        });
  });

  if (wkerr != "") {
    wkerr = "以下為必填項目:\n" + wkerr;
    alert(wkerr);
    return false;
  } else {
    var jsonData = JSON.stringify(myJson);
    var pass0 = "op=op_insert&uname="+$("#uname").val()+"&pass="+$("#pass").val()+"&serial="+$("#serial2").val()+"&op_type="+op_type +"&jsonData=" + jsonData;
    $.ajax({ //调用jquery的ajax方法
      type: "POST", //设置ajax方法提交数据的形式
      url: url1,    //把数据提交到app.php
      data: pass0,
      //输入框writer中的值作为提交的数据
      success: function(smsg){ //提交成功后的回调，msg变量是ok.php输出的内容。
       var data1 = jQuery.parseJSON(smsg);
       var ret_status = data1["responseStatus"];  // "FAIL" "SUCCESS"  "WARNING"
       var ret_msg    = data1["responseMessage"]; // message description
        if(ret_status == "SUCCESS"){
          alert(ret_msg);
          $.mobile.changePage('#show1','slide');
        }else{
          alert("存檔錯誤");
          return(false);
        }
      },
      error: function (jqXHR, exception) {
         alert("連線錯誤：" + jqXHR);
      },
      beforeSend:function(){
        $('#question2LoadingIMG').show();
                 },
      complete:function(){
        $('#question2LoadingIMG').hide();
        }

     });
  }

 }
 function delWebPic(files_sn){
      var pass0 = "op=del_pic&uname="+$("#uname").val()+"&pass="+$("#pass").val()+"&serial="+$("#serial2").val()+"&files_sn="+ files_sn;
      $.ajax({ //调用jquery的ajax方法
       type: "POST", //设置ajax方法提交数据的形式
       url: url1,    //把数据提交到app.php
       data: pass0,
        //输入框writer中的值作为提交的数据
       success: function(msg){ //提交成功后的回调，msg变量是ok.php输出的内容。
        var data1 = jQuery.parseJSON(msg);
        var ret_status = data1["responseStatus"];  // "FAIL" "SUCCESS"  "WARNING"
        var ret_msg    = data1["responseMessage"]; // message description
        ajax_msg = ret_status;
        // return ret_status;
        },
        error: function (jqXHR, exception) {
           return "連線錯誤" ;
        },
        beforeSend:function(){
                   },
        complete:function(){
        }
       });
  }