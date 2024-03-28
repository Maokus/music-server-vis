
// ----- DEFINE NETWORK VARIABLES -----

var network;
var nodes = new vis.DataSet();
var edges = new vis.DataSet();
var gephiImported;

// ----- GRAB ELEMENTS AND ASSIGN INPUT LISTENERS -----

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

// The text fields for displaying info on selected node or edge
var clickedTitleElement = document.getElementById("clickedInfoTitle");
var clickedInformationElement = document.getElementById("clickedInfoBody");

// Nodename search

var lastNodeQuery = "";
var nodeResponseIndex = 0;
var enterPressed = false; // This ensures that if a person presses enter to search it will not repeat search

var lastEdgeQuery = ["",""];
var edgeResponseIndex = 0;

var nodeNameTextInput = document.getElementById("nodename")
nodeNameTextInput.addEventListener('blur', (blurEvent)=>{
  if(!enterPressed){
    processSearchQuery(blurEvent.target.value);
  }
  enterPressed=false;
})
nodeNameTextInput.addEventListener('keydown', e => {
    if(e.key === 'Enter'){
      processSearchQuery(e.target.value)
      enterPressed=true;
    }else if(e.key==="Escape"){
      e.target.value = "";
      e.target.blur();
    }
})

function processSearchQuery(query){
  if(!query){
    return;
  }
  
  querySplitted = query.split("+");
  if(querySplitted.length==2){
    setEdgeSelectionByNames(querySplitted[0].trim(), querySplitted[1].trim())
  }else{
    setNodeSelectionByName(query)
  }
}

function setEdgeSelectionByNames(nodeName1, nodeName2){
  var possibleEdges = [];

  matchingNodes1 = searchNodes(nodeName1);
  //Dont continue if no matches
  if(!matchingNodes1){
    return;
  }

  matchingNodes2 = searchNodes(nodeName2);

  for(mn1 in matchingNodes1){
    for(mn2 in matchingNodes2){
      possibleEdges.push([matchingNodes1[mn1].id,matchingNodes2[mn2].id].sort());
    }
  }
  
  candidateEdges = edges.get({
    filter: function (item) {
      idsList = [item.from, item.to].sort();
      for(pe in possibleEdges){
        if(possibleEdges[pe][0]==idsList[0] && possibleEdges[pe][1]==idsList[1]){
          return 1;
        }
      }
      return 0;
    }
  });

  if(candidateEdges.length == 0){
    network.fit();
    return;
  }

  if(lastEdgeQuery[0]==nodeName1 && lastEdgeQuery[1] == nodeName2){
    edgeResponseIndex = (edgeResponseIndex+1)%candidateEdges.length;
  }else{
    edgeResponseIndex=0;
  }

  console.log(candidateEdges);
  selectedEdge = candidateEdges[edgeResponseIndex]
  
  network.setSelection({edges:[selectedEdge.id]});
  updateEdgeInformationByid(selectedEdge.id);
  network.fit({nodes:[selectedEdge.to, selectedEdge.from]})

  lastEdgeQuery = [nodeName1, nodeName2];
  
}

function setNodeSelectionByName(nodeName){

  // If string is empty
  if(!nodeName){
    return;
  }

  // Get nodes with substrings that match
  var matchingNodes = searchNodes(nodeName);

  // If there is at least one match
  if(matchingNodes){
    // If it is a repeat search, go to the next option. 
    if(nodeName!=lastNodeQuery){
      nodeResponseIndex=0;
    }else{
      nodeResponseIndex = (nodeResponseIndex+1)%matchingNodes.length;
    }
    var nodeId = matchingNodes[nodeResponseIndex].id;

    // Do the selection

    network.setSelection({nodes:[nodeId]})
    network.focus(nodeId, {scale: 1.5,locked: true,})
    updateNodeInformationByid(nodeId);
    
    console.log('matchingNodes', matchingNodes[nodeResponseIndex].id);
    lastNodeQuery = nodeName
  }
}

function searchNodes(nodeName){
  return nodes.get({
    filter: function (item) {
      return item.label.toLowerCase().includes(nodeName.toLowerCase().trim());
    }
  });
}

// ----- NETWORK SETUP -----

loadJSON("noded_out_5.json", redrawAll, function (err) {
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

network.on("click", function (params) {
  // PROCESS NETWORK CLICKS

  if (params.nodes.length > 0) {
    // IF NODE IS CLICKED
    updateNodeInformationByid(params.nodes[0]); 
  }else if(params.edges.length>0){
    // IF EDGE IS CLICKED
    updateEdgeInformationByid(params.edges[0]);
  }
});

// This function updates the node information panel on the right side of the screen. 
function updateNodeInformationByid(nodeId){
  console.log(nodeId);
  var data = nodes.get(nodeId); 
  clickedTitleElement.innerText = "Node Information";

  // DISPLAY INFORMATION IN RIGHT PANEL DEPENDING ON NERDSPEAK
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
}

// This function updates the edge information panel on the right side of the screen. 
function updateEdgeInformationByid(edgeId){
  var data = edges.get(edgeId); 
  clickedTitleElement.innerText = "Edge Information";
  clickedInformationElement.innerHTML = 
    `<p>${data.attributes.from_label} and ${data.attributes.to_label} share ${data.attributes.size} members</p>`;
  console.log(data);
}

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
