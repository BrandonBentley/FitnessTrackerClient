let userData;
let breadCrumb = [];
let breadCrumbCount = 0;
let editMode = false;

$(function () {
    result = $.getJSON("/json", function (data) {
        userData = data;
        displayContent();
        generateQuickItems();
    });
    if (result.fail()) {
        checkForWorkouts();
        console.log("failed");
    }
    initHandlers();
});

function displayContent() {
    clearElements();
    generateCards();
    applyHandlers();
    console.log("display refreshed");
}

function clearElements() {
    $('.noContent').remove();
    $('.workoutCard').remove();
    //$('.rightNavItem').remove();
}

function checkForWorkouts() {
    if (userData == null || true) {
        $(".cardCenter").append(
            `<div class="noContent">
                <!--<h2 class="text-secondary">No Workouts Yet :(</h2>-->
                    ${circleSpinner}
             </div>`
        );
    }
}

function initHandlers() {
    $('.breadcrumb-item').on("click", useBreadCrumb);
    $('.testButton').on("click", editOptions);
}

function applyHandlers() {
    $('.workoutCard').on("click", getNewData);

}

function generateCards() {
    for (let item of userData.List) {
        $(".cardCenter").append(
            `<div class="card workoutCard">
                    <div class="card-body workoutCardContent">
                        <p>${item.Title}</p>
                    </div>
                </div>`
        );
    }
}

function generateQuickItems() {
    for (item of userData.quickItems) {
        $(".RightOptionMenuList").append(
            `<li class="nav-item rightNavItem">
            <a class="nav-link text-secondary" href="#">${item.Title}</a>
         </li>`
        );
    }
}

function getNewData() {
    fadeAway();
    setTimeout(function() {
        clearElements();
        checkForWorkouts();
    }, 300);

    $.post("/json", '{"request": "workout"}', function(data, textStatus) {
        userData = data;
        displayContent();
        addBreadCrumb(userData.Value, userData.Title);
    }, "json");
    console.log(userData)

}

function fadeAway() {
    $('.noContent').toggleClass('reverseAnimation');
    $('.workoutCard').toggleClass('reverseAnimation');
}

function addBreadCrumb(value, title) {
    $(".breadcrumb").append(
        `
        <li class="breadcrumb-item"><a href="#" value="${value}">${title}</a></li>
        `
    );
}

function useBreadCrumb() {
    $(this).nextAll().remove();
}

function testHandler(e) {
    console.log("Icon Click");
    e.stopPropagation();
}

function editOptions() {
    if (editMode) {
        removeEditOptions();
    } else {
        addEditOptions();
    }
    editMode = !editMode;
}
function addEditOptions() {
    $('.workoutCardContent').append(
        `<div class="cardIconDiv">
            <span class="cardIcon oi oi-pencil text-secondary"></span>
            <span class="cardIcon oi oi-x text-secondary"></span>
        </div>`
    );
    $('.cardIconDiv').on("click", testHandler);
}

function removeEditOptions() {
    $('.cardIconDiv').remove();
}