function create_AmChartA(chartdiv, valueField,titleText,dataProvider) {
    console.log('her2e');
    return 1;
}

function create_AmChartStacked(chartdiv, valueField1,valueField2,titleText,dataProvider) {
    var chart = AmCharts.makeChart(chartdiv, {
            "type": "serial",
            "dataDateFormat": "YYYY-MM",
            "colors": ["#00A99D"],
            columnWidth: 0.5,
            fontFamily: "Times New Roman",
            "categoryField": "access_month",
              "dataProvider": dataProvider,
            "valueAxes": [{
                "id": "ValueAxis-1",
                minMaxMultiplier:1.1,
                labelsEnabled: false,
                "gridAlpha": 0,
                "axisAlpha": 0,
                minimum:0,
                 totalText: "[[total]]",
                "stackType": "regular",
                "title": ""
            }],
            "startDuration": 0, 
            "graphs": [{
                "balloonText": "[[category]]: [[value]]",
                "columnWidth": 0.57,
                "cornerRadiusTop": 4,
                "title": "",
                "type": "column",
                "valueAxis": "ValueAxis-1",
                "valueField": valueField1,
                "lineThickness": 0,
                "fontSize": 12,
                "columnWidth": 0.57,
                "fillAlphas": 1,
                "labelOffset": 0,
                "labelText": "[[value]]",
                fillColors : ["#00A99D" ],
                labelPosition:"middle"


            },
                      {
                "balloonText": "[[category]]: [[value]]",
                "columnWidth": 0.57,
                "cornerRadiusTop": 4,
                "title": "",
                "type": "column",
                "valueAxis": "ValueAxis-1",
                "valueField": valueField2,
                "lineThickness": 0,
                "fontSize": 12,
                "columnWidth": 0.57,
                "fillAlphas": 1,
                "labelOffset": 0,
                "labelText": "[[value]]",
                fillColors : ["#80A911" ]
              //  labelPosition:"middle",


            }],
            "export": {
                "enabled": true,
                "menu": [] //
            },


            "categoryAxis": {
                "labelsEnabled": true,
                "fontAlpha": 0.5,
                "axisAlpha": 0,
                "gridAlpha": 0,
                "fontSize": 18,
                minPeriod: "MM",
                "parseDates": true,
                markPeriodChange: false,

            },
            "titles": [{
                "id": "Title-1",
                "size": 36,
                "color": "#EE852E",
                "text": titleText
            }],
        });
return chart
}
function create_AmChartLine(chartdiv, valueField1,valueField2,titleText,dataProvider) {
    var chart = AmCharts.makeChart(chartdiv, {
            "type": "serial",
            "dataDateFormat": "YYYY-MM",
            "colors": ["#00A99D","#80A911"],
            columnWidth: 0.5,
            fontFamily: "Times New Roman",
            "categoryField": "access_month",
              "dataProvider": dataProvider,
            "valueAxes": [{
                "id": "ValueAxis-1",
                minMaxMultiplier:1.1,
                labelsEnabled: false,
                "gridAlpha": 0,
                zeroGridAlpha:1,
                "axisAlpha": 0,
                //minimum:0,
                "stackType": "regular",
                "title": ""
            }],
            "startDuration": 0,
            "graphs": [{
                "balloonText": "[[category]]: [[value]]",
                "columnWidth": 0.57,
                "cornerRadiusTop": 4,
                "title": "",
                "type": "line",
                "valueAxis": "ValueAxis-1",
                "valueField": valueField1,
                "lineThickness": 2,
                "fontSize": 18,
                "columnWidth": 0.57,
                "fillAlphas": 0,
                "labelOffset": 15,
                "labelText": "[[value]]",
                fillColors : ["#00A99D" ],
             //   labelPosition:"middle",


            },
                      {
                "balloonText": "[[category]]: [[value]]",
                "columnWidth": 0.57,
                "cornerRadiusTop": 4,
                "title": "",
                "type": "line",
                "valueAxis": "ValueAxis-1",
                "valueField": valueField2,
                "lineThickness": 2,
                "fontSize": 18,
                "columnWidth": 0.57,
                "fillAlphas": 0,
                "labelOffset": 15,
                "labelText": "[[value]]",
                fillColors : ["#80A911" ],
              //  labelPosition:"middle",


            },
                      ],
            "export": {
                "enabled": true,
                "menu": [] //
            },


            "categoryAxis": {
                "labelsEnabled": true,
                "fontAlpha": 0.5,
                "axisAlpha": 0,
                "gridAlpha": 0,
                "fontSize": 18,
                minPeriod: "MM",
                "parseDates": true,
                markPeriodChange: false,

            },
            "titles": [{
                "id": "Title-1",
                "size": 36,
                "color": "#EE852E",
                "text": titleText
            }],
        });
return chart
}
function create_AmChart(chartdiv, valueField,titleText,dataProvider) {
    var chart = AmCharts.makeChart(chartdiv, {
            "type": "serial",
            "dataDateFormat": "YYYY-MM",
            "colors": ["#00A99D"],
            columnWidth: 0.5,
            fontFamily: "Times New Roman",
            "categoryField": "access_month",
              "dataProvider": dataProvider,
            "valueAxes": [{
                "id": "ValueAxis-1",
                minMaxMultiplier:1.1,
                labelsEnabled: false,
                "gridAlpha": 0,
                "axisAlpha": 0,
                minimum:0,
                "stackType": "regular",
                "title": ""
            }],
            "startDuration": 0,
            "graphs": [{
                "balloonText": "[[category]]: [[value]]",
                "columnWidth": 0.57,
                "cornerRadiusTop": 4,
                "title": "",
                "type": "column",
                "valueAxis": "ValueAxis-1",
                "valueField": valueField,
                "lineThickness": 2,
                "fontSize": 18,
                "columnWidth": 0.57,
                "fillAlphas": 1,
                "labelOffset": 15,
                "labelText": "[[value]]",
                fillColors : ["#00A99D" ],
                labelPosition:"top",
                "type": "column",

            }],
            "export": {
                "enabled": true,
                "menu": [] //
            },


            "categoryAxis": {
                "labelsEnabled": true,
                "fontAlpha": 0.5,
                "axisAlpha": 0,
                "gridAlpha": 0,
                "fontSize": 18,
                minPeriod: "MM",
                "parseDates": true,
                markPeriodChange: false,

            },
            "titles": [{
                "id": "Title-1",
                "size": 36,
                "color": "#EE852E",
                "text": titleText
            }],
        });
return chart
}
function create_AmChartCompetitive(chartdiv, valueField,titleText,dataProvider) {
//var data2=dataProvider.sort(function(a, b) {    return parseFloat(b.facebook_public_likes_count_eom) - parseFloat(a.facebook_public_likes_count_eom);});
    var chart = AmCharts.makeChart(chartdiv, {
            "type": "serial",
            "colors": ["#00A99D"],
            columnWidth: 0.5,
            fontFamily: "Times New Roman",
            "categoryField": "name",
            "dataProvider":dataProvider,

            "valueAxes": [{
                "id": "ValueAxis-1",
                minMaxMultiplier:1.1,
                labelsEnabled: false,
                "gridAlpha": 0,
                "axisAlpha": 0,
                minimum:0,
                "stackType": "regular",
                "title": ""
            }],
            "startDuration": 0,
            "graphs": [{
                "balloonText": "[[category]]: [[value]]",
                "cornerRadiusTop": 4,
                bullet:"custom",
                bulletOffset:98,
                 "bulletSize": 54,
                bulletBorderThickness:10,
                customBulletField:"filename",
                bulletColor:"#FFFFFF",
                "title": "",
                "type": "column",
                "valueAxis": "ValueAxis-1",
                "valueField": valueField,
                "lineThickness": 0,
                "fontSize": 18,
                colorField:"barcolor",
                "columnWidth": 0.57,
                "fillAlphas": 1,
                "labelOffset": 15,
                "labelText": "[[value]]",
                fillColors : ["#00A99D" ],
                labelPosition:"top",
                "type": "column",

            }],
            "export": {
                "enabled": true,
                "menu": [] //
            },


            "categoryAxis": {
                "labelsEnabled": true,
                //labelRotation:90,
                "fontAlpha": 0.5,
                "axisAlpha": 0,
                "gridAlpha": 0,
                "fontSize": 14,
                "ignoreAxisWidth": true,
                "autoWrap": true

            },
            marginBottom:100,
            "titles": [{
                "id": "Title-1",
                "size": 36,
                "color": "#EE852E",
                "text": titleText
            }],
        });
return chart
}
function create_AmChartAgeDemographics(chartdiv, valueField1,valueField2,titleText,dataProvider) {
    var chart = AmCharts.makeChart(chartdiv, {
            "type": "serial",
            "colors": ["#00A99D"],
            columnWidth: 0.5,
            fontFamily: "Times New Roman", 
            "categoryField": "age_range",
                    marginBottom:100,
            "dataProvider": dataProvider,
            "valueAxes": [{
                "id": "ValueAxis-1",
                minMaxMultiplier:1.1,
                labelsEnabled: false,
                "gridAlpha": 0,
                "axisAlpha": 0,
                minimum:0,
                //"stackType": "regular",
                "title": ""
            }],
            "startDuration": 0,
            "graphs": [{
                "balloonText": "[[category]]: [[value]]",
                "columnWidth": 0.57,
                "cornerRadiusTop": 4,
                "title": "",
                "type": "column",
                "valueAxis": "ValueAxis-1",
                "valueField": valueField1,
                "lineThickness": 0,
                "fontSize": 14,
                "columnWidth": 0.57,
                "fillAlphas": 1,
                "labelOffset": 15,
                "labelText": "[[value]]",
                fillColors : ["#00A99D" ],
                labelPosition:"top",
                "type": "column",

            },

                      {
                "balloonText": "[[category]]: [[value]]",
                "columnWidth": 0.57,
                "cornerRadiusTop": 4,
                "title": "",
                "type": "column",
                "valueAxis": "ValueAxis-1",
                "valueField": valueField2,
                "lineThickness": 0,
                "fontSize": 14,
                "columnWidth": 0.57,
                "fillAlphas": 1,
                "labelOffset": 15,
                "labelText": "[[value]]",
                fillColors : ["#14DDB3" ],
                labelPosition:"top",
                "type": "column",

            }],
            "export": {
                "enabled": true,
                "menu": [] //
            },


       "categoryAxis": {
                "labelsEnabled": true,
                //labelRotation:90,
                "fontAlpha": 0.5,
                "axisAlpha": 0,
                "gridAlpha": 0,
                "fontSize": 14,
                "ignoreAxisWidth": true,
                "autoWrap": true

            },
            "titles": [{
                "id": "Title-1",
                "size": 36,
                "color": "#EE852E",
                "text": titleText
            }],
        });
return chart
}
