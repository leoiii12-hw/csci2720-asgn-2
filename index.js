/*
CHOI Man Kin
1155077469
*/
function addComment(input, callback) {
    var commentEl = $("#comments").append(`
        <div class="media mb-3" data-input="${encodeURI(JSON.stringify(input))}" data-level="0">
            <svg class="mr-3" height="100" width="100">
                <circle cx="50" cy="50" r="40" fill="${input.inputColor}">
            </svg>
            <div class="media-body">
                <h5>${input.inputSubject || 'No Subject'}</h5>
                <h6>${input.inputName || 'No Name'}</h6>
                <p>${input.inputComment || 'Empty'}</p>
                <a href="#" class="reply-btn">Reply</a>
                <p style="font-size:0.5em">${JSON.stringify(input.inputData) || ''}</p>
            </div>
        </div>
    `);

    // On reply
    setTimeout(function () {
        $('.reply-btn').off('click');

        $('.reply-btn').click(function (event) {
            removeAllReplyForms();
            addReplyForm($(event.target));
        });

        if (callback) callback();
    });

    return commentEl;
}

function addReply(el, input, level, callback) {
    var replyEl = el
        .append(`
            <div class="media mb-1" data-input="${encodeURI(JSON.stringify(input))}" data-level="${level}">
                <svg class="mr-3" height="100" width="100">
                    <circle cx="50" cy="50" r="40" fill="${input.inputColor}">
                </svg>
                <div class="media-body">
                    <h5>${input.inputSubject || 'No Subject'}</h5>
                    <h6>${input.inputName || 'No Name'}</h6>
                    <p>${input.inputComment || 'Empty'}</p>
                    <a href="#" class="reply-btn">Reply</a>
                    <p style="font-size:0.5em">${JSON.stringify(input.inputData) || ''}</p>
                </div>
            </div>
        `);

    // On reply
    setTimeout(function () {
        $('.reply-btn').off('click');

        $('.reply-btn').click(function (event) {
            removeAllReplyForms();
            addReplyForm($(event.target));
        });

        if (callback) callback();
    });

    return replyEl;
}

function removeAllReplyForms() {
    $('#add-reply-form').remove();
}

function addReplyForm(el) {
    el
        .parent()
        .append(`
            <form id="add-reply-form" class="mt-3">

                <div class="form-group">
                    <input class="form-control" type="text" name="inputName" id="inputName" placeholder="Name">
                </div>

                <div class="form-group">
                    <input class="form-control" type="text" name="inputSubject" id="inputSubject" placeholder="Subject">
                </div>

                <div class="form-group">
                    <textarea class="form-control" name="inputComment" id="inputComment" rows="3" placeholder="Comment"></textarea>
                </div>

                <div class="form-group">
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="inputColor" id="inputRed" value="red" checked>
                        <label class="form-check-label" for="inputRed">Red</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="inputColor" id="inputGreen" value="green">
                        <label class="form-check-label" for="inputGreen">Green</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="inputColor" id="inputYellow" value="yellow">
                        <label class="form-check-label" for="inputYellow">Yellow</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="inputColor" id="inputBlue" value="blue">
                        <label class="form-check-label" for="inputBlue">Blue</label>
                    </div>
                </div>

                <button type="submit" btn btn-primary">Add reply</button>

            </form>
        `);

    // On submit reply
    setTimeout(function () {
        $('#add-reply-form').off('submit');

        $('#add-reply-form').on('submit', function (event) {
            event.preventDefault();

            var reply = {};

            var formValues = $(this).serializeArray();
            for (let formValue of formValues) {
                reply[formValue.name] = formValue.value;
            }

            var form = $(event.target);

            addReply(form.parent(), reply, parseInt(form.parent().parent().data('level')) + 1, function () {
                save(0);
            });

            form.remove();
        });
    });
}

$(document).ready(function () {
    // On submit comment form
    $("#add-comment-form").on('submit', function (event) {
        event.preventDefault();

        var comment = {};

        var formValues = $(this).serializeArray();
        for (let formValue of formValues) {
            comment[formValue.name] = formValue.value;
        }
        event.target.reset();

        addComment(comment, function () {
            save();
        });
    });

    // Load comments
    $.get("http://appsrv.cse.cuhk.edu.hk/~mkchoi6/readcomments.php", function (comments) {
        for (var comment of JSON.parse(comments)) {
            var commentEl = addComment(toInput(comment));

            addReplies(commentEl, comment);
        }
    });
});

function addReplies(el, commentOrReply, level) {
    if (!level) level = 1;

    for (var reply of commentOrReply.replies) {
        var replyEl = addReply(el.find("> .media > .media-body").last(), toInput(reply), level);

        if (reply.replies) {
            addReplies(replyEl, reply, level + 1);
        }
    }
}

function save() {
    $.post('http://appsrv.cse.cuhk.edu.hk/~mkchoi6/writecomments.php', { contents: getSerializedComments() }, function (data) {
        console.log(data);
    });

    console.log(getSerializedComments());
}

function getSerializedComments() {
    var comments = [];

    var inputEls = $('[data-input]');
    var inputs = [];
    var levels = [];

    for (var i = 0; i < inputEls.length; i++) {
        var el = $(inputEls[i]);

        var curInput = fromInput(JSON.parse(decodeURI(el.data('input'))));
        var curLevel = parseInt(el.data('level'));

        if (curLevel == 0) {
            comments.push(curInput);
        }

        // Level deeper than last
        else if (curLevel > levels[i - 1]) {
            inputs[i - 1].replies.push(curInput);
        }

        // Level same as last
        else if (curLevel == levels[i - 1]) {
            var parentIndex = levels.lastIndexOf(curLevel - 1);

            inputs[parentIndex].replies.push(curInput);
        }

        // Level shallower than last
        else if (curLevel < levels[i - 1]) {
            var parentIndex = levels.lastIndexOf(curLevel - 1);

            inputs[parentIndex].replies.push(curInput);
        }

        inputs[i] = curInput;
        levels[i] = curLevel;
    }

    return JSON.stringify(comments);
}

function toInput(commentOrReply) {
    return {
        inputName: commentOrReply.name,
        inputSubject: commentOrReply.subject,
        inputComment: commentOrReply.content,
        inputColor: commentOrReply.color,
        inputData: commentOrReply.data
    };
}

function fromInput(input) {
    return {
        subject: input.inputSubject,
        name: input.inputName,
        content: input.inputComment,
        color: input.inputColor,
        replies: []
    };
}