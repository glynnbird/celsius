google.load("visualization", "1", {packages:["corechart"]});

var drawChart = function () {
  
  // hourly trend
  var data = google.visualization.arrayToDataTable(trend);
  var options = {
    title: 'Last 48 Hours, by hour',
    legend: 'none',
    colors: ["green"]
  };
  var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
  chart.draw(data, options);
  
  // monthly trend
  var data2 = google.visualization.arrayToDataTable(trend2);
  var options2 = {
    title: 'Last Month, by day',
    colors: ["red","green","blue"]
  };
  var chart2 = new google.visualization.LineChart(document.getElementById('chart_div2'));
  chart2.draw(data2, options2);
  
  // yearly
  var data3 = google.visualization.arrayToDataTable(trend3);
  var options3 = {
    title: 'Last year, by month',
    colors: ["red","green","blue"]
  };
  var chart3 = new google.visualization.LineChart(document.getElementById('chart_div3'));
  chart3.draw(data3, options3);
  
};



$(document).ready(function () { 
  
  
  socket = io.connect(location.origin);
  socket.on('post', function (data) {
    // if the post doesn't already exist,
    //console.log(data.date, data.temperature);
    
    var rowcount = $('#myTable tr').length;
    var newRow = $('<tr><td>...'+data._id.substring(24)+'</td><td>'+data.date+'</td><td>'+data.temperature+'</td></tr>').hide();
    if(rowcount> 5) {
      $('#myTable tbody tr:first').fadeOut(1000, function() {
        $('#myTable tbody tr:first').remove();
        $('#myTable').append(newRow);
        newRow.fadeIn(1000);
       });
    } else {
      $('#myTable').append(newRow);
      newRow.fadeIn(1000);
    }

  });

});