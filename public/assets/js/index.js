$(document).on("click", ".btnComment", event => {
    const id = $(event.target).attr("id")
    console.log(id)

    getNotes(id);
})

$(document).on("click", ".btnSaveNote", event => {
    // Grab the id associated with the article from the submit button
    const id = $(event.target).attr("data-id")
    console.log(id, $(`#title${id}`).val(), $(`#body${id}`).val())
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/note/" + id,
        data: {
            // Value taken from title input
            title: $(`#title${id}`).val(),
            // Value taken from note textarea
            body: $(`#body${id}`).val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            // console.log(data);
            // Empty the notes section
            // $("#notes").empty();
            getNotes(id);
        });

    // Also, remove the values entered in the input and textarea for note entry

    $(`#title${id}`).val(""),
        $(`#body${id}`).val("")

});


$(document).on("click", ".btnUpdateNote", event => {
    // Grab the id associated with the article from the submit button
    const id = $(event.target).attr("data-id")
    const artId = $(event.target).attr("data-artId")
    // console.log(id, $(`#title${id}`).val(), $(`#body${id}`).val())
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "PUT",
        url: "/note/" + id,
        data: {
            // Value taken from title input
            title: $(`#title${id}`).val(),
            // Value taken from note textarea
            body: $(`#body${id}`).val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            // console.log(data);
            // Empty the notes section
            // $("#notes").empty();
            getNotes(artId);
        });

    // Also, remove the values entered in the input and textarea for note entry

    $(`#title${id}`).val(""),
        $(`#body${id}`).val("")

});


$(document).on("click", ".btnDeleteNote", event => {
    // Grab the id associated with the article from the submit button
    const id = $(event.target).attr("data-id")
    const artId = $(event.target).attr("data-artId")
    // console.log(id, $(`#title${id}`).val(), $(`#body${id}`).val())
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "DELETE",
        url: `/note/${id}/${artId}`
    })
        // With that done
        .then(function (data) {
            // Log the response
            // console.log(data);
            // Empty the notes section
            // $("#notes").empty();
            getNotes(artId);
        });
});

$(document).on("click", ".newComment", event => {    
    const id = $(event.target).attr("data-id")
    $("#notes").empty();
    getNewNote(id);
    CreateNewCommentButton(id)
    // $(".newComment").hide()
});

$(document).on("click", ".btnCancel", event => {    
    const id = $(event.target).attr("data-id")
    getNotes(id)
});



function getNotes(id) {
    $.get(`/articles/${id}`, result => {
        $("#notes").empty();
        // location.reload();
        console.log(result.notes);
        if (result.notes && result.notes.length > 0) {
            result.notes.forEach(element => {
                let html = `
                    <button class="btn btn-link text-left text-primary" data-toggle="collapse"
                        data-target="#collapseNote${element._id}" aria-expanded="true" aria-controls="collapseNote${element._id}">
                        <div class="card-header" id="headingNote${element._id}">
                            <h5 class="mb-0">
                                ${element.title} </h5>
                        </div>
                    </button>
                    <div id="collapseNote${element._id}" class="collapse" aria-labelledby="headingNote${element._id}" data-parent="#accordion">
                        <div class="container-fluid">
                            <div class="row portfolioRow">
                                <div class="col-12">
                                    <form action="">
                                        <div class="form-group">
                                            <label for="">Title</label>
                                            <input type="text" class="form-control" name="" id="title${element._id}"
                                                aria-describedby="helpId" placeholder="" value="${element.title}" required>
                                            <br>
                                            <div class="form-group">
                                                <label for="">Comment</label>
                                                <textarea id="body${element._id}" class="form-control" name="" rows="3"
                                                    required>${element.body}</textarea>
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-end">
                                            <button data-id="${element._id}" data-artId="${id}" type="button" class="btn btn-primary btnUpdateNote">Update</button>
                                            &NonBreakingSpace;
                                            <button data-id="${element._id}" data-artId="${id}" type="button" class="btn btn-danger btnDeleteNote">Delete</button>
                                        </div>
                                        <br>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>                                                    
                `;
                $("#notes").prepend(html);
            });
            CreateNewCommentButton(id)
        }
        else {

            CreateNewCommentButton(id);
        }
        $('#modalNotes').modal('show');
    });
}

function CreateNewCommentButton(id) {
    const html = `<button data-id="${id}" type="button" class="btn btn-primary btn-sm newComment">New comment</button>`;
    $("#notes").append(html);
}

function getNewNote(id) {
    const html = `
            <div class="container-fluid">
                <div class="row portfolioRow">
                    <div class="col-12">
                        <form action="">
                            <div class="form-group">
                                <label for="">Title</label>
                                <input type="text" class="form-control" name="" id="title${id}"
                                    aria-describedby="helpId" placeholder="" required>
                                <br>
                                <div class="form-group">
                                    <label for="">Comment</label>
                                    <textarea id="body${id}" class="form-control" name="" rows="3"
                                        required></textarea>
                                </div>
                            </div>
                            <div class="d-flex justify-content-end">
                                <button data-id="${id}" type="submit" class="btn btn-primary btnSaveNote">Save</button>
                                &NonBreakingSpace;
                                <button data-id="${id}" type="submit" class="btn btn-secondary btnCancel">Cancel</button>
                            </div>
                            <br>
                        </form>
                    </div>
                </div>
            </div>
        `;
    $("#notes").append(html);
}