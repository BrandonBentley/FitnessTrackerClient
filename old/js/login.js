
$(function () {
    $('form').submit(signIn);
    $("#remCheck").on('change', function() {
        if ($(this).is(':checked')) {
            $(this).attr('value', 'true');
        } else {
            $(this).attr('value', 'false');
        }
    });
});

function signIn(e) {
    $(".loaderNotify").empty();
    $(".loaderNotify").append(circleSpinner);
    e.preventDefault();
    let values = $('form').serializeArray();
    let dataObj = {};

    $(values).each(function(i, field){
        dataObj[field.name] = field.value;
    });
    console.log(dataObj);
    $.post('/login', JSON.stringify(dataObj), loginPostReturn);
}

function loginPostReturn(data, responseCode, jo) {
    console.log(data.toString());
    console.log(responseCode.toString());
    console.log(jo);
    location.href = "/";
}

