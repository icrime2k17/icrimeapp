/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
window.pie = null;
var initializeCrimeAnalysis = function(current_month)
{
    $("#month_selector").val(current_month);
    $(".day-holder").hide();
    $(".week-holder").hide();
    $(".month-holder").show();
    $(".year-holder").show();
    
    $.ajax({
        url : config.url+'/GetCrimeAnalysisByMonth',
        method : 'POST',
        data : {
            month : $("#month_selector").val(),
            year : $("#year_selector").val()
        },
        dataType : "json",
        beforeSend : function(){
        },
        success : function(data){
            if(data.success)
            {
                var valid_pie = false;
                $.each(data.content,function(key,value){
                    var int_value = parseInt(value['value'])
                    data.content[key]['value'] = int_value;
                    if(int_value > 0)
                    {
                        valid_pie = true;
                    }
                });
                
                if(valid_pie)
                {
                    pie = new d3pie("myPie", {
                            header: {
                            },
                            size: {
                                canvasHeight: 300,
                                canvasWidth: 350
                            },
                            data: {
                                    content: data.content
                            }
                    });
                }
                else
                {
                   $(".no-data-found").css("display","block");
                }
            }
            else
            {
                ons.notification.alert("Error connecting to server.");
            }
        },
        error : function(){
            ons.notification.alert("Error connecting to server.");
        }
    });
    
    //sorting
    $("#sort_selector").change(function(){
        var sorter = $(this).val();
        if(sorter == 1)
        {
            $(".day-holder").show();
            $(".week-holder").hide();
            $(".month-holder").hide();
            $(".year-holder").hide();
        }
        else if(sorter == 2)
        {
            $(".week-holder").show();
            $(".day-holder").hide();
            $(".month-holder").hide();
            $(".year-holder").hide();
        }
        else if(sorter == 3)
        {
            $(".day-holder").hide();
            $(".week-holder").hide();
            $(".month-holder").show();
            $(".year-holder").show();
        }
        else if(sorter == 4)
        {
            $(".day-holder").hide();
            $(".week-holder").hide();
            $(".month-holder").hide();
            $(".year-holder").show();
        }
    });
    
    $("#show_results").click(function(){
        var sorter = $("#sort_selector").val();
        if(sorter == 1)
        {
            //day
            RenderPieByDay();
        }
        else if(sorter == 2)
        {
            //week
            RenderPieByWeek();
        }
        else if(sorter == 3)
        {
            //month
            RenderPieByMonth();
        }
        else if(sorter == 4)
        {
            //year
            RenderPieByYear();
        }
    });
};

var RenderPieByMonth = function()
{
    $.ajax({
        url : config.url+'/GetCrimeAnalysisByMonth',
        method : 'POST',
        data : {
            month : $("#month_selector").val(),
            year : $("#year_selector").val()
        },
        dataType : "json",
        beforeSend : function(){
        },
        success : function(data){
            if(data.success)
            {
                var valid_pie = false;
                $.each(data.content,function(key,value){
                    var int_value = parseInt(value['value']);
                    data.content[key]['value'] = int_value;
                    if(int_value > 0)
                    {
                        valid_pie = true;
                    }
                });
                
                if(valid_pie)
                {
                    $(".no-data-found").css("display","none");
                    $("#myPie").css("display","block");
                    if(pie == null)
                    {
                        window.pie = new d3pie("myPie", {
                                header: {
                                },
                                size: {
                                    canvasHeight: 300,
                                    canvasWidth: 350
                                },
                                data: {
                                        content: data.content
                                }
                        });
                    }
                    else
                    {
                        pie.updateProp("data.content", data.content);
                    }
                }
                else
                {
                   $(".no-data-found").css("display","block");
                   $("#myPie").css("display","none");
                }
            }
            else
            {
                ons.notification.alert("Error connecting to server.");
            }
        },
        error : function(){
            ons.notification.alert("Error connecting to server.");
        }
    });
};

var RenderPieByYear = function()
{
    $.ajax({
        url : config.url+'/GetCrimeAnalysisByYear',
        method : 'POST',
        data : {
            year : $("#year_selector").val()
        },
        dataType : "json",
        beforeSend : function(){
        },
        success : function(data){
            if(data.success)
            {
                var valid_pie = false;
                $.each(data.content,function(key,value){
                    var int_value = parseInt(value['value']);
                    data.content[key]['value'] = int_value;
                    if(int_value > 0)
                    {
                        valid_pie = true;
                    }
                });
                
                if(valid_pie)
                {
                    $(".no-data-found").css("display","none");
                    $("#myPie").css("display","block");
                    if(pie == null)
                    {
                        window.pie = new d3pie("myPie", {
                                header: {
                                },
                                size: {
                                    canvasHeight: 300,
                                    canvasWidth: 350
                                },
                                data: {
                                        content: data.content
                                }
                        });
                    }
                    else
                    {
                        pie.updateProp("data.content", data.content);
                    }
                }
                else
                {
                   $(".no-data-found").css("display","block");
                   $("#myPie").css("display","none");
                }
            }
            else
            {
                ons.notification.alert("Error connecting to server.");
            }
        },
        error : function(){
            ons.notification.alert("Error connecting to server.");
        }
    });
};

var RenderPieByWeek = function()
{
    $.ajax({
        url : config.url+'/GetCrimeAnalysisByWeek',
        method : 'POST',
        data : {
            week : $("#week_selector").val()
        },
        dataType : "json",
        beforeSend : function(){
        },
        success : function(data){
            if(data.success)
            {
                var valid_pie = false;
                $.each(data.content,function(key,value){
                    var int_value = parseInt(value['value']);
                    data.content[key]['value'] = int_value;
                    if(int_value > 0)
                    {
                        valid_pie = true;
                    }
                });
                
                if(valid_pie)
                {
                    $(".no-data-found").css("display","none");
                    $("#myPie").css("display","block");
                    if(pie == null)
                    {
                        window.pie = new d3pie("myPie", {
                                header: {
                                },
                                size: {
                                    canvasHeight: 300,
                                    canvasWidth: 350
                                },
                                data: {
                                        content: data.content
                                }
                        });
                    }
                    else
                    {
                        pie.updateProp("data.content", data.content);
                    }
                }
                else
                {
                   $(".no-data-found").css("display","block");
                   $("#myPie").css("display","none");
                }
            }
            else
            {
                ons.notification.alert("Error connecting to server.");
            }
        },
        error : function(){
            ons.notification.alert("Error connecting to server.");
        }
    });
};

var RenderPieByDay = function()
{
    $.ajax({
        url : config.url+'/GetCrimeAnalysisByDay',
        method : 'POST',
        data : {
            day : $("#day_selector").val()
        },
        dataType : "json",
        beforeSend : function(){
        },
        success : function(data){
            if(data.success)
            {
                var valid_pie = false;
                $.each(data.content,function(key,value){
                    var int_value = parseInt(value['value'])
                    data.content[key]['value'] = int_value;
                    if(int_value > 0)
                    {
                        valid_pie = true;
                    }
                });
                
                if(valid_pie)
                {
                    $(".no-data-found").css("display","none");
                    $("#myPie").css("display","block");
                    if(pie == null)
                    {
                        window.pie = new d3pie("myPie", {
                                header: {
                                },
                                size: {
                                    canvasHeight: 300,
                                    canvasWidth: 350
                                },
                                data: {
                                        content: data.content
                                }
                        });
                    }
                    else
                    {
                        pie.updateProp("data.content", data.content);
                    }
                }
                else
                {
                   $(".no-data-found").css("display","block");
                   $("#myPie").css("display","none");
                }
            }
            else
            {
                ons.notification.alert("Error connecting to server.");
            }
        },
        error : function(){
            ons.notification.alert("Error connecting to server.");
        }
    });
};