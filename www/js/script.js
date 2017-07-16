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
    
    $('.continue-as-regular-user').click(function(){
       window.location.href = "main.html"; 
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
});

var add_crime = function(latlong,address,mode)
{
//    modes:
//            1 - Create blotter
//            2 - Report Crime
            
    alert(address)
};

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