google.load("visualization", "1", {packages:["corechart"]});

var drawChart = function () {
  
  // hourly trend
  var data = google.visualization.arrayToDataTable(trend);
  var options = {
    title: 'Last 24 Hours',
    legend: 'none'
  };
  var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
  chart.draw(data, options);
  
  // monthly trend
  var data2 = google.visualization.arrayToDataTable(trend2);
  var options2 = {
    title: 'Last Month'
  };
  var chart2 = new google.visualization.LineChart(document.getElementById('chart_div2'));
  chart2.draw(data2, options2);
  
};
