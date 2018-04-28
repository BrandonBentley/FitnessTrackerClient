
$(function () {
    $('form').submit(signUp);
    $("#remCheck").on('change', function() {
        if ($(this).is(':checked')) {
            $(this).attr('value', 'true');
        } else {
            $(this).attr('value', 'false');
        }
    });
});

function signUp(e) {
    e.preventDefault();
    let values = $('form').serializeArray();
    let dataObj = {};

    $(values).each(function(i, field){
        dataObj[field.name] = field.value;
    });
    console.log(dataObj);
    $.post('/signup', JSON.stringify(dataObj));
    console.log(JSON.stringify(dataObj));

}

function successFunc(e) {
    console.log("success");
    console.log(e);
}

