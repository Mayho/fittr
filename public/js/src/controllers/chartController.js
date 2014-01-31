angular.module('fittr.controllers')

.controller('ChartController', function($q, $scope, $timeout, UserService){

  var stepsDatum = null;
  var milesDatum = null;
  var activeDatum = null;


  // Generation of initial chart data
  // The line charts need initial data in order from them to render correctly
  // during the time it takes to request the weekly tracker data from our API
  // ==========================================================================
  var buildDefaultData = function() {
    var data = [];
    var values = [];
    var today = new Date();
    var day = 86400000;
    var rand = function() {
      return Math.floor(Math.random() * 10000);
    };

    var buildForOneUser = function(user) {
    for (var i = 0; i < 7; i++) {
      var dayStats = [];
      dayStats[0] = today.getTime() - (i * day);
      dayStats[1] = rand();
      values.push(dayStats);
    }
    data.push({key: user, values: values});
      values = [];
    };

    buildForOneUser("User1");
    buildForOneUser("Me");
    return data;
  };


  $scope.statCategories = {
    'Steps': buildDefaultData(),
    'Miles': buildDefaultData(),
    'Active': buildDefaultData()
  };
  
  // Generation of comparison data
  // ==========================================================================
  $scope.$on('chartButtonClick', function() {
    getWeekly(($scope.user.user._id));
  });

  var alreadyCalled = false;

  var getWeekly = function(userId) {

    // console.log("backShown: ", backShown);
    // if (!backShown) { return; }
    if (alreadyCalled) { return; }

    UserService.getWeekly(userId)
      .then(function(data) {
        // console.log("7 days worth: ", data);
        stepsDatum = buildChartData(data, 'steps');
        milesDatum = buildChartData(data, 'distance');
        activeDatum = buildChartData(data, 'veryActiveMinutes');

        $scope.statCategories = {
          'Steps':stepsDatum,
          'Miles':milesDatum,
          'Active':activeDatum
        };
        alreadyCalled = true;
      }, function(status) {
        console.log("An error occured during the call to get" + status);
      });

  };

  var buildChartData = function(data, stat) {
    var date;
    // format user data
    var currentUser = [];
    for (var i = 0; i < data[0].stat.length; i++) {
      date = new Date(data[0].stat[i].date + "T12:00:00").getTime();
      currentUser.push([date, data[0].stat[i][stat]]);
    }

    var userData = {
      // 'key': data[0].username,
      'key': "You",
      'values': currentUser
    };

    // format compared user data
    var comparedUser = [];
    for (var j = 0; j < data[1].length; j++) {
      date = new Date(data[1][j].date + "T12:00:00").getTime();
      comparedUser.push([date, data[1][j][stat]]);
    }
    var comparedData = {
      'key': (data[1][0].user.username),
      'values': comparedUser
    };

    var chartOutputData = [userData, comparedData];
    // console.log(chartOutputData);
    return chartOutputData;
  };


  $scope.xAxisTickFormat = function() {
    return function(d) {
      return d3.time.format('%m/%e')(new Date(d));
    };
  };

});
