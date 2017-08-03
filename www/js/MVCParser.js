String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}; 

window.MVCParser = function () {
    var private = {
        ViewsDirectory: './views/'
    };

    return{

        LoadView: function (path, data) {
            var ViewLayout = null;
            $.ajax({
                url: private.ViewsDirectory + path + '.html',
                success: function (result) {
                    ViewLayout = result;
                },
                async: false
            });
            
            if(typeof data !== "undefined")
            {
                for (var key in data)
                {
                    if (data.hasOwnProperty(key))
                    {
                        //                    console.log(key + " -> " + data[key]);
                        ViewLayout = ViewLayout.replaceAll('{' + key + '}', data[key]);
                    }
                }
            }
            
            return ViewLayout;
        }

    };
};

//global MVC parser
window.mvc = new MVCParser();