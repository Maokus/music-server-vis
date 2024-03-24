/* 

Created by Markus Ang (Maokus) 

This little node script takes information available in the gephi file and puts it into the convenient
"attributes" field, which is readable by vis.js. Nifty!

*/

var fs = require('fs');

const data = JSON.parse(JSON.stringify(require("./gephi_export_5.json")));

for(var edge in data.edges){
    var edgeData = data.edges[edge];
    data.edges[edge].attributes.size = edgeData.size;

    var to_label = "";
    var from_label = "";

    for(node in data.nodes){
        if(parseInt(data.nodes[node].id)==parseInt(edgeData.source)){
            from_label = data.nodes[node].label;
            // console.log("identified from label as "+from_label)
        }
        if(parseInt(data.nodes[node].id)==parseInt(edgeData.target)){
            to_label = data.nodes[node].label;
            //console.log("identified to label as "+to_label);
        }
    }

    data.edges[edge].attributes.from_label = from_label;
    data.edges[edge].attributes.to_label = to_label;
}

//console.log(data.edges);
//console.log(data.nodes);

fs.writeFile("noded_out.json",JSON.stringify(data),"utf8",(resp)=>{console.log(resp)});
