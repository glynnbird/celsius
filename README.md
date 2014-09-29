# Celsius

This project demonstrates:

* using a Raspberry Pi as a data collection device
* * connecting a temperature sensor to the GPIO port
* * storing its data locally in CouchDb
* * replicating the data to Cloudant when it gets the chance
* using a simple Node.js Web App to query a view on Cloudant to get
* * latest temperature
* * last 2 day's readings by hour
* * last month's readings by day

## Recording the data

The DS18B20 sensor is connected to the GPIO like [https://www.modmypi.com/blog/ds18b20-one-wire-digital-temperature-sensor-and-the-raspberry-pi](this). Then a [https://gist.github.com/glynnbird/bb0f117baea8aca05639](simple Bash script) is used to query the senor and push a document into local CouchDB.

The resultant documents look like this:

```
{
  "_id": "00339bc7cacd3311af73855de6839478",
  "_rev": "1-0ef01b13ebf326d31b336389078d6953",
  "ts": 1411723490,
  "date": "2014-09-26 09:24:50 UTC",
  "temperature": 20.937,
  "sensor_id": "28-000006746cde"
}
```

## Querying the data

### Map/Reduce view

A map/reduce view is configured like so:

```
map: function(doc) {
       if (typeof doc.date == "string") {
         var bits = doc.date.split(" ");
         var datebits = bits[0].split("-");
         var timebits = bits[1].split(":");
         var year = parseInt(datebits[0],10);
         var month = parseInt(datebits[1],10);
         var day = parseInt(datebits[2],10);
         var hour = parseInt(timebits[0],10);
         var minute = parseInt(timebits[1],10); 
         emit([year, month, day, hour, minute], doc.temperature);
       }
}

reduce: "_stats"

```

which produces key/values like this

```
  [2014,9,28,23,45] ---> 20.2
```

The _stats reduce provides total, count, min & max values for the given range.

### Latest temperature

As the keys are in date order, we just need the latest key:

```
  /logger/_design/fetch/_view/byDate?reduce=false&descending=true&limit=1
```

### Previous 48 Hours, by hour

We need only supply a start key because we want all the data from 2 days ago until now, grouped by the hour element of the key:

```
   /logger/_design/fetch/_view/byDate?startkey=[2014,9,28,9]&group_level=4
```

### Previous Month, by day

Similarly we can summarise all of the last month's data with only a start key:

```
   /logger/_design/fetch/_view/byDate?startkey=[2014,8,28]&group_level=3
```
   

