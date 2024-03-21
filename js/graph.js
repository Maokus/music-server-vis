var network;

var nodes = new vis.DataSet();
var edges = new vis.DataSet();
var gephiImported;
var fixedCheckbox = document.getElementById("fixed");
fixedCheckbox.onchange = redrawAll;

var parseColorCheckbox = document.getElementById("parseColor");
parseColorCheckbox.onchange = redrawAll;

var nerdSpeakCheckbox = document.getElementById("nerdSpeak");
var nerdSpeak = false;
nerdSpeakCheckbox.onchange=(value)=>{nerdSpeak = nerdSpeakCheckbox.checked};

var dynamicConnCheckbox = document.getElementById("dynamicConn");
var dynamicConn = dynamicConnCheckbox.checked;
dynamicConnCheckbox.onchange=(value)=>{dynamicConn = dynamicConnCheckbox.checked; location.reload();};

var clickedTitleElement = document.getElementById("clickedTitle");
var clickedInformationElement = document.getElementById("clickedInformation");

var nodeIdElement = document.getElementById("nodeId");
var nodeModClassElement = document.getElementById("nodeModClass");
var nodeSizeElement = document.getElementById("nodeAttrSize");
var nodeDegreeElement = document.getElementById("nodeAttrWd");

var nodeContent = document.getElementById("nodeContent");

loadJSON("noded_out.json", redrawAll, function (err) {
  console.log(err);
});

var container = document.getElementById("mynetwork");
var data = {
  nodes: nodes,
  edges: edges,
};
var options = {
  nodes: {
    shape: "dot",
    font: {
      face: "Tahoma",
      color: "white",
      size:7,
    },
  },
  edges: {
    width: 0.15,
    smooth: {
      type: (dynamicConn?"dynamic":"continuous"),
      roundness: 1,
    },
  },
  interaction: {
    tooltipDelay: 200,
    hideEdgesOnDrag: false,
  },
  physics: {
    stabilization: false,
    barnesHut: {
      gravitationalConstant: -100,
      springConstant: 0.001,
      springLength: 300,
    },
    minVelocity: 0.01,
  },
};

network = new vis.Network(container, data, options);

function updateOptions(){
  options = {
    nodes: {
      shape: "dot",
      font: {
        face: "Tahoma",
        color: "white",
        size:7,
      },
    },
    edges: {
      width: 0.15,
      smooth: {
        type: (dynamicConn?"dynamic":"continuous"),
        roundness: 1,
      },
    },
    interaction: {
      tooltipDelay: 200,
      hideEdgesOnDrag: false,
    },
    physics: {
      stabilization: false,
      barnesHut: {
        gravitationalConstant: -100,
        springConstant: 0.001,
        springLength: 300,
      },
      minVelocity: 0.01,
    },
  };
  network.moveTo(options);
}

network.on("click", function (params) {
  if (params.nodes.length > 0) {
    var data = nodes.get(params.nodes[0]); 
    clickedTitleElement.innerText = "Node Information";

    if(nerdSpeak){
      clickedInformationElement.innerHTML = `<p>name: ${data["label"]}</p>`+
        `<p>size: ${data["attributes"]["size"]}</p>` +
        `<p>modularity class: ${data["attributes"]["Modularity Class"]}</p>` +
        `<p>degree: ${data["attributes"]["Degree"]}</p>` +
        `<p>weighted degree: ${data["attributes"]["Weighted Degree"]}</p>`;
    }else{
      clickedInformationElement.innerHTML = `<p>name: ${data["label"]}</p>`+
        `<p>size: ${data["attributes"]["size"]}</p>` +
        `<p>group: ${data["attributes"]["Modularity Class"]}</p>` +
        `<p>number of related servers: ${data["attributes"]["Degree"]}</p>` +
        `<p>number of related members: ${data["attributes"]["Weighted Degree"]}</p>`;
    }
    console.log(data);

  }else if(params.edges.length>0){
    var data = edges.get(params.edges[0]);
    clickedTitleElement.innerText = "Edge Information";
    clickedInformationElement.innerHTML = 
      `<p>${data.attributes.from_label} and ${data.attributes.to_label} share ${data.attributes.size} members</p>`;
    console.log(data);
  }
});

/**
 * This function fills the DataSets. These DataSets will update the network.
 */
function redrawAll(gephiJSON) {
  if (gephiJSON.nodes === undefined) {
    gephiJSON = gephiImported;
  } else {
    gephiImported = gephiJSON;
  }

  nodes.clear();
  edges.clear();

  var fixed = fixedCheckbox.checked;
  var parseColor = parseColorCheckbox.checked;

  var parsed = vis.parseGephiNetwork(gephiJSON, {
    fixed: fixed,
    parseColor: parseColor,
  });

  // add the parsed data to the DataSets.
  nodes.add(parsed.nodes);
  edges.add(parsed.edges);

  network.fit(); // zoom to fit
}
