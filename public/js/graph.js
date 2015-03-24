var nodes = [];
var links = [];
var graph;

/**
 * Creates d3 forced graph
 * @param word
 * @param callback (optional)
 */
function drawGraph(word, callback) {
    clearGraph();
    prepareData(word);

    graph = document.querySelector('#graph');
    var height = graph.offsetHeight;
    var width = graph.offsetWidth;

    var svg = d3.select("#graph").append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .attr("pointer-event", "all")
        .append("svg:g")
            .call(d3.behavior.zoom().on("zoom", zoom))
        .append("svg:g");

    svg.append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr('fill', 'white');

    var link = svg.selectAll(".link");
    var node = svg.selectAll(".node");

    var linkLen = 100;

    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([width,height])
        .linkStrength(0.1)
        .friction(0.9)
        .linkDistance(linkLen)
        .charge(-400)
        .gravity(0.1)
        .theta(0.8)
        .alpha(0.1)
        .start();

    var drag = force.drag()
        .on("dragstart", dragstarted)
        .on("drag", dragged);

    node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(drag);

    node.append("circle")
        .attr("class", "node-circle")
        .attr("r", 12);

    node.append("text")
        .attr("x", 12)
        .attr("y", ".35em")
        .text(function(d) { return d.word; });

    link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });

    function zoom() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
    }

    function dragged(d) {
        d3.select(this).attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
    }

    if (typeof callback === "function") callback();
}

/**
 * We need to create nodes and links from data. Expected format of data below:
 * @param data - object like: {_id: String, links: [_word: string, sentences[numbers]}
 */
function prepareData(data) {
    //data it's a word linked with another words by sentences.
    //words = nodes, sentences = links

    //nodes need indexes
    //first node is word itself. _id field equals to word value
    nodes.push({
        index: 0,
        word: data._id
    });

    //dive into linked words
    data.links.forEach(function (elem, index) {
        //other words = other nodes
        nodes.push({
            index: index + 1,
            word: elem._word,
            sentences: elem._sentences
        });

        //link base word (in _id field) for current word
        links.push({
            source: 0,
            target: index + 1
        });

        //TODO: create links for all linked words. Check if these words has links between each other
    });
}

function clearGraph() {
    nodes = [];
    links = [];
    d3.select("svg").remove();
}