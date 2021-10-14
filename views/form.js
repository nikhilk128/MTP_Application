$(document).ready(function(){
    $("queryform1").submit(function(e){
        e.preventDefault();
        var mytext = $("#q1tf1N").val();
        $.ajax({
            url : "/handler",
            data : {
                text : mytext
            },
            success : function(res){
                console.log("done");
            },
            error : function(err){
            }
        })
    })
});