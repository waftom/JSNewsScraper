$('#comments').hide();

$.getJSON("/articles", function(data) {
    // For each one
    //$("#articles").append("<ol>");
    for (var i = 0; i < data.length; i++) {
        $("#articles").append("<p data-id='" + data[i]._id + "'><a href='" + data[i].link + "' target='_blank'>" + data[i].title + "</a><br /><span class='my_popup_open'>Comments</span></p>");
    }
    //$("#articles").append("</ol>");
});


// Whenever someone clicks a p tag
$(document).on("click", ".my_popup_open", function() {
    // Empty the comments from the note section

    $("#comments").empty();
    // Save the id from the p tag
    var thisId = $(this).parent().attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        // With that done, add the note information to the page
        .done(function(data) {
            $.ajax({
                    method: "GET",
                    url: "/comments/" + thisId
                })
                // With that done, add the note information to the page
                .done(function(data1) {
                    console.log(data);
                    // The title of the article
                    $("#comments").append("<h3>" + data.title + "</h3>");
                    $("#comments").append("<div class='hr'></div>");

                    console.log(data1);
                    var all_comments = '';
                    for(var i=0;i<data1.length;i++) {
                        all_comments += "<div data-comment='" + data1[i]._id + "'><span class='open_comment' data-c-title='" + data1[i].title + "' data-c-body='" + data1[i].body + "'>" + data1[i].title + "</span> <div class='delete' data-delete='" + data1[i]._id + "'>X</div></div>";
                    }
                    if(all_comments === '') {
                        all_comments = 'No comments yet.';
                    }
                    $("#comments").append("<div class='comments-list'>" + all_comments + "</div>");

                    $("#comments").append("<div class='hr'></div>");
                    // An input to enter a new title
                    $("#comments").append("<input id='titleinput' class='form-control' name='title' >");
                    // A textarea to add a new note body
                    $("#comments").append("<textarea id='bodyinput' class='form-control' name='body'></textarea>");
                    // A button to submit a new note, with the id of the article saved to it
                    $("#comments").append("<button data-id='" + data._id + "' class='btn btn-success' id='savecomment'>Save Comment</button>");

                    // If there's a note in the article
                    if (data.comment) {
                        // Place the title of the note in the title input
                        $("#titleinput").val(data.comment.title);
                        // Place the body of the note in the body textarea
                        $("#bodyinput").val(data.comment.body);
                    }

                    $("#comments").append("<button class='close-overlay btn btn-danger'>Close</button>");

                    $('#comments').css('left', $(window).width()/2 + 'px');
                    $('#comments').css('margin-left', '-' + ($('#comments').width()/2 + 80) + 'px');
                    $('#comments').show();
                });
        });
});

// When you click the savecomment button
$(document).on("click", "#savecomment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: $("#titleinput").val(),
                // Value taken from note textarea
                body: $("#bodyinput").val(),
                article: thisId
            }
        })
        // With that done
        .done(function(data) {
            $.ajax({
                    method: "GET",
                    url: "/comments/" + thisId
                })
                // With that done, add the note information to the page
                .done(function(data1) {
                    $('.comments-list').html("");
                    var all_comments = '';
                    for(var i=0;i<data1.length;i++) {
                        $('.comments-list').append("<div data-comment='" + data1[i]._id + "'><span class='open_comment' data-c-title='" + data1[i].title + "' data-c-body='" + data1[i].body + "'>" + data1[i].title + "</span> <div class='delete' data-delete='" + data1[i]._id + "'>X</div></div>");
                    }
                });
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});

// When you click the delete button
$(document).on("click", ".delete", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-delete");
    var _this = $(this);

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/delete/" + thisId,
            data: {}
        })
        // With that done
        .done(function(data) {
            // Log the response
            if(data == 'deleted') {
                _this.parent().empty();
                console.log('deleted!');
            }
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});

$(document).on("click", ".open_comment", function() {
    var thisTitle = $(this).attr("data-c-title");
    var thisBody = $(this).attr("data-c-body");

    $("#titleinput").val(thisTitle);
    $("#bodyinput").val(thisBody);
});

$(document).on("click", "#scrape_news", function() {
    $.ajax({
            method: "GET",
            url: "/scrape"
        }).done(function(data) {
            $("#articles").html("");
            $.getJSON("/articles", function(data) {
                // For each one
                //$("#articles").append("<ol>");
                for (var i = 0; i < data.length; i++) {
                    $("#articles").append("<p data-id='" + data[i]._id + "'><a href='" + data[i].link + "' target='_blank'>" + data[i].title + "</a><br /><span class='my_popup_open'>Comments</span></p>");
                }
                //$("#articles").append("</ol>");
            });
        });
});

$(document).on("click", ".close-overlay", function() {
    $('#comments').hide();
});

$(document).on("click", ".popupoff", function() {
    $('#comments').hide();
});
