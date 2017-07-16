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
});

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
                sessionStorage.setItem("login","true");
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