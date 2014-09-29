google.load("visualization", "1", {packages:["corechart"]});

var drawChart = function () {
  var data = google.visualization.arrayToDataTable(trend);

  var options = {
    title: 'Last 24 Hours',
    legend: 'none'
  };

  var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
  chart.draw(data, options);
};
