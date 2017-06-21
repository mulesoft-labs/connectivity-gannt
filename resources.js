// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


var gantt_list = null; //real kiwi example https://github.com/jpestalardo/kiwi/blob/master/bin/resources/kiwi_gantt_example.json


var tasksList = [
    {"name": "A", "from": 10, "len" : 30, "res" : "R1", "type" : "T1"},
    {"name": "B", "from": 25, "len" : 40, "res" : "R2", "type" : "T1"},
    {"name": "C", "from": 30, "len" : 50, "res" : "R1", "type" : "T2"},
    {"name": "D", "from":  5, "len" : 10, "res" : "R2", "type" : "T2"},
    {"name": "E", "from": 45, "len" : 60, "res" : "R1", "type" : "T3"},
    {"name": "F", "from": 55, "len" : 62, "res" : "R3", "type" : "T3"},
    {"name": "G", "from": 20, "len" : 60, "res" : "R2", "type" : "T4"}
];

var token = null;

$(function() {
    showTasks(transform_gantt_to_task_list(gantt_list),  $("#resources"));
    //showTasks(tasksList,  $("#resources"));
});    

function transform_date(date_) {
    if (date_)
    { 
        var date_parts = date_.split("-");
        year =parseInt(date_parts[0]); 
        month = parseInt(date_parts[1])-1; 
        day = parseInt(date_parts[2]);
        var date = new Date(year,month, day);
        return date;
    }
    return date_;
}

function date_to_num(date_){
    var now = new Date();
    if (now >= date_) {
        return 0;
    } else {
        return Math.round((date_ - now)/1000/3600/24);
    }
}

function get_from(date_) {
    var now = new Date();
    if (!date_){
        return 0;
    }
    return date_to_num(date_);
}

function get_to_date(date_) {
    if (!date_) {
        return 115;
    }
    return date_to_num(date_);
}

function login(callback) {
    var user; 
    $.get('config.json', function(data) {
        user = data.kiwi_authentication;
    });
    
    $.post("https://ec2-54-163-68-108.compute-1.amazonaws.com/login-api",user, 
        function( data ) {
            token = data.response.user.authentication_token;
            callback();
        },
    "json");
}

function get_gannt_data() {
    $.get("https://ec2-54-163-68-108.compute-1.amazonaws.com/gantt", {'Authentication-Token': token}, function(data){
            tasksList =  transform_gantt_to_task_list(data);
            showTasks(tasksList, $("#resources"));
        },"json");
}

function show_gantt() {
    if (!token) {
        login(get_gannt_data);
    } else {
        get_gannt_data();
    }
}

function transform_gantt_to_task_list(gantt) {

    res = [];
    for (index in gantt) {
        r = {};
        row = gantt[index];
        r["from"] = get_from(transform_date(row.from_date));
        r["len"] = get_to_date(transform_date(row.to_date)) - r["from"];
        r["name"] = row.project_name + " - " +row.name  ;
        r["res"] = row.group;
        r["type"] = row.task_type;
        res.push(r);
    }
    return res;
}

function showTasks(tasks, canvas) {
    var vMargin = 5;
    var hMargin = 5;
    var barHeight = 30;
    var resourcesTop = 30;
    
    var resourcesNamesWidth = 50;
    var resourceNamesLeft   = hMargin;

    var canvasWidthIn = canvas.width() - 2*hMargin;
    var tasksWidthOut = canvasWidthIn - resourcesNamesWidth - 1;
    var tasksWidthIn  = tasksWidthOut - 2*hMargin;
    var tasksLeft     = hMargin + resourcesNamesWidth + 1;

    var rangeMin = Math.min.apply(null, tasks.map(function(task) {return task.from;}));
    var rangeMax = Math.max.apply(null, tasks.map(function(task) {return task.from+task.len;}));
    var range = rangeMax-rangeMin;

    var resources = new Set(tasks.map(function(task){ return task.res;}));

    var resourceTop = resourcesTop;
    resources.forEach(function(resource){
        var maxPos = 0;
        var lines = [];
        tasks
        .filter (function(task)        {return task.res==resource;})
        .sort   (function(task1, task2){return task1.from>task2.from})
        .forEach(function(task){
            var pos = lines.findIndex(function(lineTask){return lineTask.from+lineTask.len < task.from});
            if (pos==-1) pos = lines.length;
            lines[pos] = task;
            maxPos = Math.max(maxPos, pos+1);

            var taskTop    = resourceTop + pos * (vMargin+barHeight) + vMargin;
            var taskLeft   = tasksLeft + Math.round((task.from-rangeMin) * tasksWidthIn / range) + hMargin;
            var taskWidth  = Math.round((task.len) * tasksWidthIn / range);
            var taskHeight = barHeight;
            var taskDescription = task.name + " (" + task.from + " to " + (task.from+task.len) + ")";
            var taskColor = getTaskColor(task.type);
            var strDiv = '<div style="border-radius:10px; background:'+ taskColor +'; z-index: 2;' + positionString(taskTop, taskLeft, taskWidth, taskHeight) + 'display: table;" ><span style="display: table-cell; vertical-align: middle;">&nbsp;'+taskDescription+'</span></div>';
            canvas.append(strDiv);
        });
        var resourceHeight = maxPos * (vMargin+barHeight) + vMargin;
        var resourcesTasksDiv = '<div style="border-radius:10px; background:silver; z-index: 1;' + positionString(resourceTop, tasksLeft, tasksWidthOut, resourceHeight) + '" />';
        canvas.append(resourcesTasksDiv);

        var resourcesDiv = '<div style="border-radius:10px; background:silver; z-index: 1;' + positionString(resourceTop, resourceNamesLeft, resourcesNamesWidth, resourceHeight) + ' text-align:center;">'+ resource +'</div>';
        canvas.append(resourcesDiv);

        resourceTop += resourceHeight + 1;
    });

    // The entire block
    // var testDiv = '<div style="border-radius:10px; background:silver; z-index: 1;' + positionString(resourcesTop, resourceNamesLeft, canvasWidthIn, resourceTop) + ' text-align:center;" />';
    // canvas.append(testDiv);

    var header = 20;
    for(var i=rangeMin; i<=rangeMax; i+=5) {
        var lineLeft = tasksLeft + Math.round((i-rangeMin) * tasksWidthIn / range) + hMargin;
        var line = '<div style="border-left: 1px dotted black; z-index: 3;' + positionString(resourcesTop-header, lineLeft, 0, resourceTop-resourcesTop+header) + '"/>';
        canvas.append(line);
        var text = '<div style="z-index: 3;' + positionString(resourcesTop-header, lineLeft, 0, 0) + '">'+i+'</div>';
        canvas.append(text);
    }
    
}

function positionString(top, left, width, height) {
    return ' position:absolute; top:' + top + 'px; left:' + left + 'px; width:' + width + 'px; height:' + height + 'px;';
}

function getTaskColor(taskType) {
    switch(taskType) {
        case "mule-4-versions": return "aqua";
        case "first-versions": return "olive";
        case "T3": return "teal";
        case "sustaining-versions": return "purple";
    }
}