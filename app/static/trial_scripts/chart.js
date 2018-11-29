 // Wrapping in nv.addGraph allows for '0 timeout render', stores rendered charts in nv.graphs, and may do more in the future... it's NOT required
 var chart;
 var data;
 var legendPosition = "top";

 var randomizeFillOpacity = function() {
     var rand = Math.random(0,1);
     for (var i = 0; i < 100; i++) { // modify sine amplitude
         data[4].values[i].y = Math.sin(i/(5 + rand)) * .4 * rand - .25;
     }
     data[4].fillOpacity = rand;
     chart.update();
 };

 var toggleLegend = function() {
     if (legendPosition == "top") {
         legendPosition = "bottom";
     } else {
         legendPosition = "top";
     }
     chart.legendPosition(legendPosition);
     chart.update();
 };

 nv.addGraph(function() {
     chart = nv.models.lineChart()
         .options({
             duration: 300,
             useInteractiveGuideline: true
         })
     ;

     // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
     chart.xAxis
         .axisLabel("Time (s)")
         .tickFormat(d3.format(',.1f'))
         .staggerLabels(true)
     ;

     chart.yAxis
         .axisLabel('Voltage (v)')
         .tickFormat(function(d) {
             if (d == null) {
                 return 'N/A';
             }
             return d3.format(',.2f')(d);
         })
     ;

     data = sinAndCos();

     d3.select('#chart1').append('svg')
         .datum(data)
         .call(chart);

     nv.utils.windowResize(chart.update);

     return chart;
 });

 function sinAndCos() {
     var x = [],
         y = [],
         z = []
         ;
         console.log(imu);

     for (var i = 0; i < imu.length; i++) {
         var current = imu[i];
         x.push({x: current.time_usec, y: current.x}); //the nulls are to show how defined works
         y.push({x: current.time_usec, y: current.y});
         z.push({x: current.time_usec, y: current.z});
        
     }

     return [
         {
            //  area: true,
             values: x,
             key: "Sine Wave",
             color: "#ff7f0e",
             strokeWidth: 4,
             classed: 'dashed'
         },
         {
             values: y,
             key: "Cosine Wave",
             color: "#2ca02c"
         },
         {
             values: z,
             key: "Random Points",
             color: "#2222ff"
         }
     ];
 }