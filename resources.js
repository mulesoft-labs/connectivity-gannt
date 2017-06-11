// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var resources = ["Res1", "Res2", "Res3"]

var tasks = [
    {"name": "Task1",
     "from": 10,
     "len" : 30, // 40
     "res" : "Res1"}
     ,
    {"name": "Task2",
     "from": 25,
     "len" : 40, // 65
     "res" : "Res2"}
     ,
    {"name": "Task3",
     "from": 30,
     "len" : 50, // 80
     "res" : "Res1"}
     ,
    {"name": "Task4",
     "from": 5,
     "len" : 10, // 15
     "res" : "Res2"}
     ,
    {"name": "Task5",
     "from": 55,
     "len" : 60, // 115
     "res" : "Res1"}
     ,
    {"name": "Task5",
     "from": 55,
     "len" : 60, // 115
     "res" : "Res3"}
     ,
    {"name": "Task5",
     "from": 20,
     "len" : 60, // 80
     "res" : "Res2"}
];

$(function() {
    console.log( "ready!" );
    var divWidth = $("#resources").width();

    var min = Math.min.apply(null, tasks.map(function(task) {return task.from;}));
    var max = Math.max.apply(null, tasks.map(function(task) {return task.from+task.len;}));
    var range = max-min;
    console.log(min, max);

    // var taskCount = 0;
    // tasks.forEach(function(task){
    //     var taskTop = taskCount * 50;
    //     var taskLeft = Math.round((task.from-min) * divWidth / range);
    //     var taskWidth = Math.round((task.len) * divWidth / range);
    //     var taskHeight = 40;
    //     var strDiv = '<div style="background:red; position:absolute; top:' + taskTop + 'px; left:' + taskLeft + 'px; width:' + taskWidth + 'px; height:' + taskHeight + 'px;" />';
    //     console.log(strDiv);
    //     $("#resources").append(strDiv);
    //     taskCount++;
    // });

    var maxLines = 0;
    resources.forEach(function(resource){
        console.log(resource)
        var maxPos = 0;
        var lines = [];
        tasks
        .filter(function(task){return task.res==resource;})
        .sort(function(task1, task2){return task1.from>task2.from})
        .forEach(function(task){
            console.log(task)
            var pos = lines.findIndex(function(lineTask){return lineTask.from+lineTask.len < task.from});
            if (pos==-1) pos = lines.length;
            console.log(pos)
            lines[pos] = task;
            console.log(lines)
            maxPos = Math.max(maxPos, pos+1);

            var taskTop = (maxLines + pos) * 50 + 5;
            var taskLeft = Math.round((task.from-min) * divWidth / range);
            var taskWidth = Math.round((task.len) * divWidth / range);
            var taskHeight = 40;
            var strDiv = '<div style="background:red; position:absolute; z-index: 2; top:' + taskTop + 'px; left:' + taskLeft + 'px; width:' + taskWidth + 'px; height:' + taskHeight + 'px;" >'+task.name+'</div>';
            console.log(strDiv);
            $("#resources").append(strDiv);
        });
        var resourceTop = maxLines * 50;
        var resourceLeft = 0;
        var resourceWidth = divWidth;
        var resourceHeight = maxPos * 50;
        var strDiv = '<div style="border-style: solid; border-width: 2px; background:cyan; z-index: 1; position:absolute; top:' + resourceTop + 'px; left:' + resourceLeft + 'px; width:' + resourceWidth + 'px; height:' + resourceHeight + 'px;" />';
        $("#resources").append(strDiv);
        maxLines += maxPos;
    });

    console.log( $("#resources").width() );
});    
