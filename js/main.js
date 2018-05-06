Vue.use(VueResource);
var app = new Vue({
    el: '#app',
    data: {
        username: "Default",
        fullname: "Default",
        pageTitle: "",
        isLoading: true,
        isProcessing: false,
        isSets: false,
        editable: true,
        empty: false,
        pushOn: true,
        deleteEnabled: false,
        editEnabled: false,
        previousValue: "",
        previousTitle: "",
        userData: {},
        submitData: {},
        history: [],
    },
    beforeMount:function(){
        $.getJSON('/userData', function (data) {
            app.username = String(data.UserName);
            app.fullname = String(data.FullName);
        });
        $.getJSON('/workouts', function (data) {
            app.userData = data;
            app.itemList = app.userData.List;
            app.isLoading = false;
            app.pageTitle = app.userData.Title;
            app.isEmpty();
            console.log(app.itemList);
        });
    }.bind(this),
    methods: {
        requestWorkOuts() {
            app.userData = {};
            app.isSets = false;
            $.getJSON('/workouts', function (data) {
                console.log("requested Shiz");
                app.userData = data;
                app.pageTitle = app.userData.Title;
                app.isEmpty();
            });
        },
        getSubItems(item) {
            if (item.isProcessing != undefined) {
                return
            }
            app.previousValue = app.userData.Value;
            app.previousTitle = app.userData.Title;
            app.isLoading = true;
            app.userData = {};
            if (app.pushOn) {
                app.history.push(item);
            }
            let prefix = item.Value[0];
            sendData = {Title: item.Title, Id: item.Value};
            if (prefix == 'w') {
                app.isSets = false;
                $.getJSON('/exercises', sendData, function (data) {
                    app.userData = data;
                    app.pageTitle = app.userData.Title;
                    app.isEmpty();
                });
            }
            else if (prefix == 'e') {
                app.isSets = true;
                $.getJSON('/sets', sendData, function (data) {
                    app.userData = data;
                    app.pageTitle = app.userData.Title;
                    app.isEmpty();
                });
            }
            app.isLoading = false;
        },
        swapEditable() {
            app.editable = !app.editable;
        },
        isEmpty() {
            if ((jQuery.isEmptyObject(app.userData) || app.userData.List == null || app.userData.List.length <= 0)) {
                app.empty = true;
            } else {
                app.empty = false;
            }
        },
        backUpOne() {
            if (app.history.length <= 1) {
                app.requestWorkOuts();
                app.history.pop();
            } else {
                app.history.pop();
                let item = app.history[app.history.length-1];
                console.log("THIS IS THE ITEM");
                app.pushOn = false;
                app.getSubItems(item);
                app.pushOn = true;
            }
            console.log(app.history.length);
        },
        openNewDialog() {
            //Add Workout
            if (app.userData.Value.length <= 0) {
                app.submitData = {Name: "", Id: "HOME"};
                this.$refs.workoutDialog.show();
                return
            }
            else {
                let prefix = app.userData.Value[0];

                //Add Exercise
                if (prefix == 'w') {
                    app.submitData = {Name: "", Id: app.userData.Value};
                    this.$refs.exerciseDialog.show();
                }
                //Add Set
                else if (prefix == 'e') {
                    app.addSet();
                    /*
                    app.submitData = {Id: app.userData.Value};
                    app.submitSets()
                    */
                }
            }
            prefix = app.userData.Value[0];
        },
        submitWorkout() {
            if (app.submitData.Name == "") {
                app.submitData = {Name: "", Id: ""};
                return
            }
            app.userData.List.unshift({Title: app.submitData.Name, Id: "", isProcessing: true});
            this.$http.post("/workouts", app.submitData)
                .then(data => {
                    app.userData.List[0] = data.body;
                    console.log(data.body);
                    app.submitData = {Name: "", Id: ""};
                    app.isEmpty();
                }, error => {
                    if (error != null) {
                        console.log(error);
                        app.isEmpty();
                    }
                });
        },
        submitExercise() {
            if (app.submitData.Name == "") {
                app.submitData = {Name: "", Id: ""};
                return
            }
            let index = app.userData.List.length;
            app.userData.List.push({Title: app.submitData.Name, Id: "", isProcessing: true});
            this.$http.post("/exercises", app.submitData)
                .then(data => {
                    app.userData.List[index] = data.body;
                    console.log(data.body);
                    app.submitData = {Name: "", Id: ""};
                    app.isEmpty();
                }, error => {
                    if (error != null) {
                        console.log(error);
                        app.isEmpty();
                    }
                });
        },
        submitSet(item) {
            item.isProcessing = true;
            item.Done = true;
            let index = app.userData.List.indexOf(item);
            app.submitData = {Id: app.userData.Value, Update: false, setId: "", Reps: parseInt(item.Reps), Weight: parseInt(item.Weight), Done: true};
            this.$http.post("/sets", app.submitData)
                .then(data => {
                    app.userData.List[index] = data.body;
                    app.submitData = {};
                    console.log(data.body);
                    app.submitData = {Done: false, Id: "", Number: "", Reps: 0, Weight: 0 };
                    app.isEmpty();
                }, error => {
                    if (error != null) {
                        console.log(error);
                        app.isEmpty();
                    }
                });

        },
        /*
            type SubmitSet struct {
                Id string
                Update bool
                SetId string
                Reps int
                Weight float64
                Done bool
            }

         */
        editSet(item) {
            //item.Done = false;
        },
        addSet() {
            app.userData.List.push({Done: false, Id: "", Number: app.userData.List.length+1, Reps: 0, Weight: 0 });
            app.isEmpty();
        },
        clearDialog() {
            app.submitData = {}
        },
        deleteItem(item) {
            let tempItem;
            if (item.Id == undefined) {
                tempItem = {Id: item.Value};
            } else {
                tempItem = {Id: item.Id};
            }
            if (tempItem.Id[0] != 's') {
                console.log(tempItem.Id);
            }
            let tt = tempItem;
            this.$http.post("/delete", tempItem)
                .then(data => {
                    if (tt.Id[0] != 's') {
                        tempItem = {Title: app.previousTitle, Value: app.previousValue};
                    }
                    else {
                        tempItem = {Title: app.userData.Title, Value: app.userData.Value};
                    }
                    app.backUpOne();
                    app.pushOn = false;
                    console.log(tempItem);
                    app.getSubItems(tempItem);
                    app.pushOn = true;
                });
        },
        toggleDeleteEnable() {
            app.deleteEnabled = !app.deleteEnabled;
        },
    }
});