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
        $('.create-blotter').removeClass('hidden');
        $('.logout').removeClass('hidden');
    }
    else
    {
        $('.report-a-crime').removeClass('hidden');
        $('.login').removeClass('hidden');
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
            image : img
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
    $("#police-station .call-button").attr('href','tel:'+data.phone);
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