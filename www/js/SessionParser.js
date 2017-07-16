var SessionParserException = function(message) {
    this.message = message;
    this.name = 'ERROR::SessionParserException : ';
};
    
var SessionParser = function(typeOfStorage)
{
    //Checking type of storage (Session or Local)
    var isSession = null;
    try
    {
        if(typeOfStorage === 'session')
        {
            isSession = true;
        }
        else if(typeOfStorage === 'local')
        {
            isSession = false;
        }
        else
        {
            throw new SessionParserException('Invalid definition of SessionParser object!');
        }
    }
    catch (e) 
    {
        console.log(e.name,e.message); // pass exception object to err handler
    }
    
    //Converting the storage to Array variable
    var sessionToArray = function(sessionName)
    {
        if(isSession)
        {
            var json_data = JSON.parse(sessionStorage.getItem(sessionName));
            return json_data;
        }
        else
        {
            var json_data = JSON.parse(localStorage.getItem(sessionName));
            return json_data;
        }
    };
    
    //Converting array to json string then assign to Session or Local Storage
    var arrayToSession = function(sessionName,data)
    {
        var json_data = JSON.stringify(data);
        
        if(isSession)
        {
            sessionStorage.setItem(sessionName,json_data);
        }
        else
        {
            localStorage.setItem(sessionName,json_data);
        }
    };
    
    //SessionParser Functions
    return {
        init : function(sessionName,dataObject){
            arrayToSession(sessionName,dataObject);
        },
        set : function(sessionName,value){
            if(isSession)
            {
                sessionStorage.setItem(sessionName,value);
            }
            else
            {
                localStorage.setItem(sessionName,value);
            }
        },
        isset : function(sessionName)
        {
            if(isSession)
            {
                var sessionNameFocus = sessionStorage.getItem(sessionName);
            }
            else
            {
                var sessionNameFocus = localStorage.getItem(sessionName);
            }
            
            if (sessionNameFocus === undefined || sessionNameFocus === null || sessionNameFocus.length === 0)
            {
                return false;
            }
            else
            {
                return true;
            }
        },
        unset : function(sessionName){
            if(isSession)
            {
                sessionStorage.removeItem(sessionName);
            }
            else
            {
                localStorage.removeItem(sessionName);
            }
        },
        getData : function(sessionName)
        {
            var data = sessionToArray(sessionName);
            return data;
        },
        setData : function(sessionName,data)
        {
            arrayToSession(sessionName,data);
        },
        setKey : function(sessionName,key,value)
        {
            var data = sessionToArray(sessionName);
            data[key] = value;
            arrayToSession(sessionName,data);
        },
        getKey : function(sessionName,key)
        {
            var data = sessionToArray(sessionName);
            return data[key];
        },
        getKeyStringified : function(sessionName,key)
        {
            var data = sessionToArray(sessionName);
            return JSON.stringify(data[key]);
        },
        removeKey : function(sessionName,key)
        {
            var session_data = sessionToArray(sessionName);
            
            //Converting String index to series of Object indexes
            var key_array = key.split("->");
            var key_string = 'session_data';
            for(ctr = 0; ctr < key_array.length; ctr++)
            {
                key_string += "['"+key_array[ctr]+"']";
            }
            //Executing delete statement for a specific item
            var string_command = 'delete '+key_string;
            eval(string_command);
            
            arrayToSession(sessionName,session_data);
        },
        removeField : function(sessionName,field)
        {
            var session_data = sessionToArray(sessionName);
            session_data.splice(field, 1);
            arrayToSession(sessionName,session_data)
        },
        pushToKey : function(sessionName,key,dataObject)
        {
            try
            {
                var data = sessionToArray(sessionName);

                if(data[key].constructor === Array)
                {
                    data[key].push(dataObject);
                    arrayToSession(sessionName,data);
                }
                else
                {
                    throw new SessionParserException('Session key must be defined as Array in order to use pushToKey() function!');
                }
            }
            catch (e) 
            {
                console.log(e.name,e.message); // pass exception object to err handler
            }
        },
        appendToKey : function(sessionName,key,dataString)
        {
            try
            {
                var data = sessionToArray(sessionName);
                
                if (typeof data[key] === 'string' || data[key] instanceof String)
                {
                    data[key]+=dataString;
                    arrayToSession(sessionName,data);
                }
                else
                {
                    throw new SessionParserException('Session key must be defined as String in order to use appendToKey() function!');
                }
            }
            catch (e) 
            {
                console.log(e.name,e.message); // pass exception object to err handler
            }
        },
        cleanArray : function(sessionName,key)
        {
            var dataObject = sessionToArray(sessionName);
            
            var array_clean = [];
            for(ctr = 0; ctr < dataObject[key].length; ctr++)
            {
                if(dataObject[key][ctr] != null)
                {
                    array_clean.push(dataObject[key][ctr]);
                }
            }
            
            dataObject[key] = array_clean;
            arrayToSession(sessionName,dataObject);
        }
    };
};

//Global variable for SessionParser
var sp = new SessionParser('session');
var ls = new SessionParser('local');
