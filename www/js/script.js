document.addEventListener('init', function(event) {
    
    $('.signin').on('click', function(e) {
        var username = $('#username').val();
        var password = $('#password').val();
        if(username.trim() == '')
        {
            message('Invalid username.');
        }
        else if(password.trim() == '')
        {
            message('Invalid password.');
        }
        else
        {
            signin(username,password);
        }
    });
    
    $('.signin-btn').click(function(){
       window.location.href = "signup.html"; 
    });
    
    $('.register-btn').click(function(){
        SignUp();
    });
    
    $('.update-account-btn').click(function(){
        UpdateAccount();
    });
    
    $(".add-crime").click(function(){
        var center = map.getCenter();
        var mode = $(this).attr('data-mode');
        var address = '';
        gmgeocoder.geocode({'latLng': center}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    if(results[0].formatted_address.length>64){
                        address = results[0].formatted_address.substring(0,64)+'...';
                        add_crime(center,address,mode);
                    }
                    else {
                        address = results[0].formatted_address;
                        add_crime(center,address,mode);
                    }
                }                   
            }
            else {
                address = "Geocoder not possible";
                add_crime(center,address,mode);
            }
        });
    });
    
    $("#submit-report").click(function(){
        SubmitReport();
    });
    
    $("#report-history-container").on("click",".report-history-item",function(){
        var key = $(this).attr('data-key');
        sp.set('current_crime_report_id',REPORT_HISTORY_LIST[key].id);
        sp.set('current_crime_report',JSON.stringify(REPORT_HISTORY_LIST[key]));
        fn.load("reporthistorydetail.html");
    });
    
    $("#comment-btn").click(function(){
        var comment = $("#comment-box").val();
        $("#comment-box").val('');
        if(comment.trim() != '')
        {
            postComment(comment);
        }
    });
    
    $("body").on("click",".call-button",function(){
        var number = $(this).attr('data-number');
        callStation(number);
    });
    
    $('.submit-blotter-btn').click(function(){
        var data = $("#blotter-data-form").serialize();
        var has_error = false;
        $(".incident-fields ons-input, .incident-fields ons-select, .incident-fields textarea").each(function(){
            if($(this).val().trim() == '')
            {
                $(this).addClass('has-error');
                ons.notification.alert("Please fill-out incident information fields");
                has_error = true;
                return false;
            }
            else
            {
                has_error = false;
                $(this).removeClass('has-error');
            }
        });
        
        if(!has_error)
        {
            $.ajax({
                url : config.url+'/submitBlotter',
                method : "POST",
                data : data,
                dataType : "json",
                beforeSend : function(){
                    loading();
                },
                success : function(data){
                    if(data.success)
                    {
                        dismissLoading();
                        ons.notification.alert({
                            message: 'Blotter successfully submitted.',
                            callback : function(){
                                window.location.reload();
                            }
                        });
                    }
                    else
                    {
                        dismissLoading();
                        ons.notification.alert("Error connecting to server.");
                    }
                },
                error : function(){
                    dismissLoading();
                    ons.notification.alert("Error connecting to server.");
                }
            });
        }
    });
    
});

var showDialog = function (id) {
  document
    .getElementById(id)
    .show();
};

var hideDialog = function (id) {
  document
    .getElementById(id)
    .hide();
};

var add_crime = function(latlong,address,mode)
{
//    modes:
//            1 - Create blotter
//            2 - Report Crime   

    var dialog = document.getElementById('report-form');

        if (dialog) {
          dialog.show();
          $('#report-address').html(address);
        }
        else {
          ons.createDialog('dialog.html')
            .then(function (dialog) {
              dialog.show();
              $('#report-address').html(address);
            });
        }
};

var selectedCrime = function(event) 
{
    sp.set('selected_crime',event.target.value);
}

var message = function(msg)
{
    dismissLoading();
    ons.notification.alert(msg);
};

var loading = function()
{
    $('.loader').slideToggle();
};

var dismissLoading = function()
{
    $('.loader').hide();
};

var checklogin = function()
{
    if(sp.isset('login'))
    {
        $('.logout').removeClass('hidden');
        if(sp.get('user_type') == 'c')
        {
            $('.report-a-crime').removeClass('hidden');
        }
        else
        {
            $('.create-blotter').removeClass('hidden');
        }
    }
};

var login = function()
{
    window.location.href = 'index.html';
};

var logout = function()
{
    sp.unset('login');
    window.location.href = 'index.html';
};

var signin = function(username,password)
{
    $.ajax({
        url : config.url+'/signin',
        method : "POST",
        data : {
            username : username,
            password : password
        },
        dataType : "json",
        beforeSend : function(){
            loading();
        },
        success : function(data){
            if(data.success)
            {
                sp.set("login","true");
                sp.set('user_id',data.id);
                sp.set('user_type',data.type);
                window.location.href = "main.html";
            }
            else
            {
                message(data.message);
            }
        },
        error : function(){
            message("Error connecting to server.");
        }
    });
};

var menuMode = function(menu)
{
    sp.set('menuMode',menu);
};

var upload_picture = function(){
    alert("uploading");
    var fileURI = sp.get('image_captured');
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.params = {}; // if we need to send parameters to the server request
    var ft = new FileTransfer();
    var filename = makeid();
    IMAGE_FILE_NAME = filename;
    ft.upload(fileURI, encodeURI("http://traffic-estimate.000webhostapp.com/uploadfromcam.php?filename="+filename), win, fail, options);
    sp.unset('image_captured');
};

var LoadPoliceStations = function()
{
    $.ajax({
        url : config.url+'/GetStations',
        method : "POST",
        data : null,
        dataType : "json",
        beforeSend : function(){
            loading();
        },
        success : function(data)
        {
            if(data.success)
            {
                STATION_LIST = data.list;
                $.each(data.list, function(key,value){
                    var pos = {
                      lat: parseFloat(value.g_lat),
                      lng: parseFloat(value.g_long)
                    };
                    
                    var STATION_PIN = {
                        url: 'img/map/station.svg', // url
                        scaledSize: new google.maps.Size(50, 50), // scaled size
                        origin: new google.maps.Point(0,0), // origin
                    };
                    
                    addMarker(pos,false,STATION_PIN,key);
                });
            }
            
            dismissLoading();
        },
        error : function(){
            message("Error connecting to server.");
        }
    });
};

var LoadBlotters = function()
{
    $.ajax({
        url : config.url+'/GetBlotters',
        method : "POST",
        data : null,
        dataType : "json",
        beforeSend : function(){
            loading();
        },
        success : function(data)
        {
            if(data.success)
            {
                BLOTTER_LIST = data.list;
                $.each(data.list, function(key,value){
                    var pos = {
                      lat: parseFloat(value.g_lat),
                      lng: parseFloat(value.g_long)
                    };
                    
                    var BLOTTER_PIN = {
                        url: 'img/map/crimepin.svg', // url
                        scaledSize: new google.maps.Size(50, 50), // scaled size
                        origin: new google.maps.Point(0,0), // origin
                    };
                    
                    addMarker(pos,false,BLOTTER_PIN,key);
                });
            }
            
            dismissLoading();
        },
        error : function(){
            message("Error connecting to server.");
        }
    });
};


var LoadWantedList = function()
{
    $.ajax({
        url : config.url+'/GetWanteds',
        method : "POST",
        data : null,
        dataType : "json",
        beforeSend : function(){
            loading();
        },
        success : function(data)
        {
            if(data.success)
            {
                WANTED_LIST = data.list;
                console.log(WANTED_LIST);
                $(".wanted-view-list").html("");
                $.each(data.list, function(key,value){
                    $(".wanted-view-list").append(mvc.LoadView('Wanted/WantedList',value));
                });
            }
            
            dismissLoading();
        },
        error : function(){
            message("Error connecting to server.");
        }
    });
};

var SubmitReport = function()
{
    var img = '';
    if(sp.isset('temp_cam_upload'))
    {
        img = sp.get('temp_cam_upload');
    }
    
    $.ajax({
        url : config.url+'/SubmitReport',
        method : "POST",
        data : {
            crime : $("#typeofcrime").val(),
            details : $("#report-detail").val(),
            g_lat : map.getCenter().lat(),
            g_long : map.getCenter().lng(),
            address : $("#report-address").html(),
            image : img,
            user_id : sp.get('user_id')
        },
        dataType : "json",
        beforeSend : function(){
            loading();
        },
        success : function(data)
        {
            if(data.success)
            {
                sp.unset('temp_cam_upload');
                message("Report successfully submitted.");
                hideDialog('report-form');
            }
            
            dismissLoading();
        },
        error : function(){
            message("Error connecting to server.");
        }
    });
};

var addMarker = function(location,draggable,icon,key) 
{
    var marker = new google.maps.Marker(
    {
      position: location,
      map: map,
      draggable: draggable,
      icon: icon,
      optimized: false
    });
    
    if(sp.get('menuMode') == 1)
    {
        google.maps.event.addListener(marker, 'click', function () 
        {
            showBlotterDialog(key);
        });
    }
    else if(sp.get('menuMode') == 4)
    {
        google.maps.event.addListener(marker, 'click', function () 
        {
            showStationDialog(key);
        });
    }
    
    return marker;
};

var showStationDialog = function(key)
{
    var dialog = document.getElementById('police-station');

    if (dialog) {
        dialog.show();
        RenderStationData(key);
    } else {
        ons.createDialog('policedialog.html')
                .then(function (dialog) {
                    dialog.show();
                    RenderStationData(key);
                });
    }
};

var showBlotterDialog = function(key)
{
    var dialog = document.getElementById('blotter-info');

    if (dialog) {
        dialog.show();
        RenderBlotterData(key);
    } else {
        ons.createDialog('blotterdialog.html')
                .then(function (dialog) {
                    dialog.show();
                    RenderBlotterData(key);
                });
    }
};

var RenderStationData = function(key)
{
    var data = STATION_LIST[key];
    $("#police-station .s-name").html(data.station);
    $("#police-station .s-address").html(data.address);
    $("#police-station .s-phone").html(data.phone);
    $("#police-station .call-button").attr('data-number',data.phone);
};

var RenderBlotterData = function(key)
{
    var data = BLOTTER_LIST[key];
    $("#blotter-info .b-incident").html(data.incident);
    $("#blotter-info .b-date").html("Date: "+data.date_of_incident);
    $("#blotter-info .b-time").html("Time: "+data.time_of_incident);
    $("#blotter-info .b-place").html(data.place_of_incident);
};

var SignUp = function()
{
    var lastname = $("#lastname").val();
    var firstname = $("#firstname").val();
    var address = $("#address").val();
    var mobile = $("#mobile").val();
    var username = $("#signup_username").val();
    var password = $("#signup_password").val();
    var cpassword = $("#signup_cpassword").val();

    if(lastname.trim() == '')
    {
        ons.notification.alert("Please fill-out last name.");
    }
    else if(firstname.trim() == '')
    {
        ons.notification.alert("Please fill-out first name.");
    }
    else if(mobile.trim() == '')
    {
        ons.notification.alert("Please fill-out mobile number.");
    }
    else if(mobile.length < 11)
    {
        ons.notification.alert("Invalid mobile number.");
    }
    else if(address.trim() == '')
    {
        ons.notification.alert("Please fill-out address.");
    }
    else if(username.trim() == '')
    {
        ons.notification.alert("Please fill-out username.");
    }
    else if(password.trim() == '')
    {
        ons.notification.alert("Please fill-out password.");
    }
    else if(password.trim().length < 6)
    {
        ons.notification.alert("Please fill-out password with atleast 6 characters.");
    }
    else if(password != cpassword)
    {
        ons.notification.alert("Password and Confirm password do not match.");
    }
    else
    {
        var data = {
            lastname : lastname,
            firstname : firstname,
            address : address,
            mobile : mobile,
            username : username,
            password : password
        };

        Register(data);
    }
};

var Register = function(data)
{
    $.ajax({
        url : config.url+'/Register',
        method : "POST",
        data : data,
        dataType : "json",
        beforeSend : function(){
            loading();
        },
        success : function(data){
            if(data.success)
            {
                sp.set('user_id',data.id);
                sp.set('user_type','c');
                sp.set("login","true");
                window.location.href = "main.html";
            }
            else
            {
                ons.notification.alert(data.message);
            }
            dismissLoading();
        },
        error : function(){
            ons.notification.alert("Error connecting to server.");
            dismissLoading();
        }
    });
};

var UpdateAccount = function()
{
    var lastname = $("#lastname").val();
    var firstname = $("#firstname").val();
    var address = $("#address").val();
    var mobile = $("#mobile").val();
    var username = $("#signup_username").val();
    var password = $("#signup_password").val();
    var cpassword = $("#signup_cpassword").val();

    if(lastname.trim() == '')
    {
        ons.notification.alert("Please fill-out last name.");
    }
    else if(firstname.trim() == '')
    {
        ons.notification.alert("Please fill-out first name.");
    }
    else if(mobile.trim() == '')
    {
        ons.notification.alert("Please fill-out mobile number.");
    }
    else if(mobile.length < 11)
    {
        ons.notification.alert("Invalid mobile number.");
    }
    else if(address.trim() == '')
    {
        ons.notification.alert("Please fill-out address.");
    }
    else if(username.trim() == '')
    {
        ons.notification.alert("Please fill-out username.");
    }
    else if(password != cpassword)
    {
        ons.notification.alert("Password and Confirm password do not match.");
    }
    else
    {
        var data = {
            id : sp.get("user_id"),
            lastname : lastname,
            firstname : firstname,
            address : address,
            mobile : mobile,
            username : username,
            password : password
        };

        UpdateAccountData(data);
    }
};

var UpdateAccountData = function(data)
{
    $.ajax({
        url : config.url+'/UpdateAccount',
        method : "POST",
        data : data,
        dataType : "json",
        beforeSend : function(){
            loading();
        },
        success : function(data){
            if(data.success)
            {
                ons.notification.alert("Account successfully updated.");
                $("#signup_password").val('');
                $("#signup_cpassword").val('');
            }
            else
            {
                ons.notification.alert(data.message);
            }
            dismissLoading();
        },
        error : function(){
            ons.notification.alert("Error connecting to server.");
            dismissLoading();
        }
    });
};

var LoadReportHistory = function()
{
    var id = sp.get('user_id');
    $.ajax({
        url : config.url+'/GetReportHistory',
        method : "POST",
        data : {
            id : id
        },
        dataType : "json",
        beforeSend : function(){
            loading();
        },
        success : function(data){
            if(data.success)
            {
                REPORT_HISTORY_LIST = data.list;
                var ListView = '';
                $.each(data.list,function(key,value){
                    value.key = key;
                    ListView += mvc.LoadView('CrimeReportHistory/ListItem',value);
                });
                $("#report-history-container").html(ListView);
            }
            else
            {
                ons.notification.alert(data.message);
            }
            dismissLoading();
        },
        error : function(){
            ons.notification.alert("Error connecting to server.");
            dismissLoading();
        }
    });
};

var LoadReportDetail = function()
{
    var reportDetailObject = JSON.parse(sp.get('current_crime_report'));
    if(reportDetailObject.image != '')
    {
        reportDetailObject.image_view = "<img style='max-width: 95%;margin: 0 auto;display: block;' src='"+reportDetailObject.image+"'>";
    }
    else
    {
        reportDetailObject.image_view = "<i>No image.</i>";
    }
    
    var reportDetailView = mvc.LoadView('CrimeReportHistory/ReportDetail',reportDetailObject);
    
    $("#report-detail-container").html(reportDetailView);
    
    RunCommentLoader();
};

var RunCommentLoader = function()
{
    if($("#report-comments").length > 0)
    {
        $.ajax({
            url : config.url+'/GetReportComments',
            method : "POST",
            data : {
                id : sp.get('current_crime_report_id')
            },
            dataType : "json",
            beforeSend : function(){
            },
            success : function(data){
                if(data.success)
                {
//                    console.log(data);
                    var ListView = '';
                    $.each(data.comments,function(key,value){
                        value.key = key;
                        ListView += mvc.LoadView('CrimeReportHistory/CommentItem',value);
                    });
                    $("#report-comments").html(ListView);
                    
                    setTimeout(RunCommentLoader(),5000);
                }
                else
                {
                    ons.notification.alert(data.message);
                }
            },
            error : function(){
                ons.notification.alert("Error connecting to server.");
            }
        });
    }
};

var postComment = function(comment)
{
    $.ajax({
        url : config.url+'/PostComment',
        method : "POST",
        data : {
            id : sp.get('current_crime_report_id'),
            comment : comment,
            user_id : sp.get('user_id')
        },
        dataType : "json",
        beforeSend : function(){
        },
        success : function(data){
            if(data.success)
            {
            }
            else
            {
            }
        },
        error : function(){
            ons.notification.alert("Error connecting to server.");
        }
    });
};


var callStation = function(number) 
{
    window.plugins.webintent.startActivity({
        action: window.plugins.webintent.ACTION_VIEW,
        url: "tel:"+number}
    );
};

var LoadBlotterYears = function()
{
    $.ajax({
        url : config.url+'/GetBlotterYears',
        method : "POST",
        data : null,
        dataType : "json",
        beforeSend : function(){
        },
        success : function(data){
            if(data.success)
            {
                $("#year_selector select").append(data.list);
                initializeCrimeAnalysis(parseInt(data.current_month));
            }
            else
            {
            }
        },
        error : function(){
            ons.notification.alert("Error connecting to server.");
        }
    });
};