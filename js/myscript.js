$(function () {


    $('.selectpicker').selectpicker({
        // style: 'btn-info',
        size: false,
        showTick: true
    });

    $("#expandDivClass").draggable({ cursor: "move" });
    $("#expandDivProperty").draggable({ cursor: "move" });
    // $("#expandDivProperty").on("click", "#close_popup", function () {
    //     $("#expandDivProperty").hide();
    // });
    // $(document).tooltip();
    $(".close_popup").on("click", function () {
        $(this).parent().parent().hide();
    })
});
var toggle = 0;
//Create an array logging what is connected to what
var linkedByIndex = {};
var userSelection = []
var pathname = window.location.hostname;
pathname = "192.41.170.50";
var apiurl = "http://" + pathname + ":5000/";
var querymode = true;
var locknode = false;
var link_subclass = true;
var link_intersection = true;
var link_property = true;
var query_node_subject = '', query_node_object = '', query_node_property = '', query_property_filter = '';
var database_name = '';
var classlist_arr = [];
function beautifyNumber(num) {
    return (new Intl.NumberFormat().format(num));
}
function checkInverseOfToggle() {
    if ($("#toggle_inverseof").prop("checked")) {
        $(".inverselist").show(100);
    }
    else
        $(".inverselist").hide(100);
}
$(document).ready(function () {

    $('#paginator').bootpag({
        total: 20,
        page: 1,
        maxVisible: 5
    }).on('page', function (event, num) {
        if (typeof num == "undefined") num = 1
        // $(".content2").html("Page " + num); // or some ajax content loading...        
        document.body.style.cursor = 'wait';
        console.log("before ajax")
        $.ajax({
            type: "POST",
            url: apiurl + "query",
            data: {
                's': query_node_subject,
                'p': query_node_property,
                't': query_node_object,
                'p_filter': JSON.stringify(query_property_filter),
                'database_name': database_name,
                'limit': 10,
                'offset': (num - 1) * 10
            }
        }).done(function (json) {
            console.log("ajax call")
            $("#resultTable tbody").html("");
            $.each(json["data"], function (key, d) {
                // console.log(htmlDecode(d.s_label.value),"--",d.s_label.value )
                $("#resultTable tbody").append(
                    function () {
                        if (typeof d.o === 'undefined' || !d.o) {
                            $("#resultTable thead tr").html("<td>" + query_node_subject + "</td>")
                            return "<tr>" +
                                "<td>" + htmlDecode(typeof d.s_label === 'undefined' ? (typeof d.s_name === 'undefined' ? d.s.value : d.s_name.value) : d.s_label.value) +
                                "<a href='" + d.s.value + "' class='result_link  glyphicon glyphicon-new-window' target='_new'></a>" +
                                isValidInput(d.s.value) +
                                "</td>" +
                                "</tr>";
                        }
                        else if (typeof d.p === 'undefined' || !d.p) {
                            if(query_node_object=='')
                            $("#resultTable thead tr").html("<td>" + query_node_subject + "</td><td>" + query_node_property + "</td>");
                            else
                            $("#resultTable thead tr").html("<td>" + query_node_subject + "</td><td>" + query_node_object + "</td>");
                            return "<tr>" +
                                "<td>" + htmlDecode(typeof d.s_label === 'undefined' ? (typeof d.s_name === 'undefined' ? d.s.value : d.s_name.value) : d.s_label.value) +
                                "<a href='" + d.s.value + "' class='result_link  glyphicon glyphicon-new-window' target='_new'></a>" +
                                isValidInput(d.s.value) +
                                "</td>" +
                                "<td>" + htmlDecode(typeof d.o_label === 'undefined' ? (typeof d.o_name === 'undefined' ? d.o.value : d.o_name.value) : d.o_label.value) +
                                // "<a href='" + d.o.value + "' class='result_link  glyphicon glyphicon-new-window' target='_new'></a>" +
                                isUrl(d.o.value) +
                                isValidInput(d.o.value) +
                                "</td>" +
                                "</tr>";
                        }
                        else {
                            $("#resultTable thead tr").html("<td>" + query_node_subject + "</td><td>" + query_node_property + "</td><td>" + query_node_object + "</td>");
                            return "<tr>" +
                                "<td>" + htmlDecode(typeof d.s_label === 'undefined' ? (typeof d.s_name === 'undefined' ? d.s.value : d.s_name.value) : d.s_label.value) +
                                "<a href='" + d.s.value + "' class='result_link glyphicon glyphicon-new-window' target='_new'></a>" +
                                isValidInput(d.s.value)
                                + "</td>" +
                                // "<td>" + htmlDecode(typeof d.p_label === 'undefined' ? (typeof d.p_name === 'undefined' ? d.p.value : d.p_name.value) : d.p_label.value) +
                                // "<a href='" + d.p.value + "' class='result_link  glyphicon glyphicon-new-window' target='_new'></a>" +
                                // "</td>" +
                                // "<td>" + htmlDecode(typeof d.o_label === 'undefined' ? (typeof d.o_name === 'undefined' ? d.o.value : d.o_name.value) : d.o_label.value) +
                                // isUrl(d.o.value) +
                                // isValidInput(d.o.value) +
                                // "</td>" +
                                "</tr>";
                        }
                    })
            });
            // $('#resultTable').DataTable({ "destroy": true });
            var body = $("html, body");
            document.body.style.cursor = 'default';
            body.stop().animate({ scrollTop: $('#queryResult').offset().top }, 500, 'swing', function () { });
        });

        // $(this).bootpag({ total: 10 });
    });

    $("#toggle_all_select").on("change", function () {
        if ($("#toggle_all_select").prop("checked")) {
            $(".nodeList").each(function () {
                var node = $(this).attr("data-uri");
                if ($.inArray(node, userSelection) == -1) {
                    addNode(node);
                }

                $(this).addClass("addedNode");
            })
            loadGraph(userSelection);
        }
    });

    $("#clear_all").on("click", function () {
        userSelection = [];
        loadGraph(userSelection);
        $(".addedNode").removeClass("addedNode");
        $("#toggle_all_select").prop("checked", false);
    });

    


    $("#toggle_inverseof").on("click", function () {
        checkInverseOfToggle();
    });
    $(".accordion").accordion({
        collapsible: true,
        heightStyle: "content"
    });
    $(".accordionHide").accordion({
        collapsible: true,
        heightStyle: "content",
        active: false
    });


    $("#dataset_name").on("change", function () {
        userSelection = [];
        $("#graphContainer>svg").remove();
        $("#expandDivProperty").hide();
        database_name = $("#dataset_name").val();
        loadClass();
        $("#toggle_all_select").prop("checked", false);
        $(".accordion").accordion("activate", 1);

    });
    $("#locknode").on("change", function () {
        $(".fixed").removeClass("fixed");
        if ($(this).is(":checked")) locknode = true;
        else {
            d3.selectAll("#graphContainer circle").each(function (d) {
                releasenode(d);
            });
            locknode = false;
        }
    });
    $("#querymode").on("change", function () {
        if ($(this).is(":checked")) querymode = true;
        else {
            // d3.selectAll("#mainGraph circle").each(function (d) {
            //     releasenode(d);
            // });
            querymode = false;
        }
    });

    $("#facet_property").on("change", "input:radio[name=propertylist]", function () {
        query_property_filter = []
        // $("input:checkbox[name=propertylist]:checked").each(function () {
        //     query_property_filter.push($(this).val());
        // });
        query_property_filter.push($(this).val());
        query()

    });

    $("#toggle_subclass").on("change", function () {
        if ($(this).is(":checked"))
            link_subclass = true;
        else link_subclass = false;
        loadGraph(userSelection);
    });

    $("#toggle_property").on("change", function () {
        if ($(this).is(":checked"))
            link_property = true;
        else link_property = false;
        loadGraph(userSelection);
    });

    $("#toggle_intersect").on("change", function () {
        if ($(this).is(":checked"))
            link_intersection = true;
        else link_intersection = false;
        loadGraph(userSelection);
    });


    expand = expand || {};

    $("#node_list").on("click", ".nodeList", function () {
        var node = $(this).attr("data-uri");
        if ($.inArray(node, userSelection) == -1) {
            addNode(node);
        }
        else {
            removeNode(node);
            $("#toggle_all_select").prop("checked", false)
        }

        $(this).toggleClass("addedNode");
        loadGraph(userSelection);
    })

});

function loadClass() {
    $.ajax({
        type: "POST",
        url: apiurl + "classlist",
        data: {
            'database_name': database_name
        }
    }).done(function (data) {
        $("#node_list *").remove();
        // $.get(apiurl + "classlist", function (data) {
        json = jQuery.parseJSON(JSON.stringify(data));
        var vocab_temp = []
        classlist_arr = []
        $(data).each(function () {
            classlist_arr[this.class] = beautifyNumber(this.count);
            $("#node_list").append("<div class='nodeList' data-uri='" + this.class + "' title='" + this.class + "'>" +
                // "<span class='nodeURI'> " + this.class.split(this.name)[0] + "</span>" +
                "<span class='nodeName'>" + this.name + "</span>" +
                "<span class='nodeCount'>" + beautifyNumber(this.count) + "</span></div>");
            vocab_temp.push(getUri(this.class))

        });
        var vocab = [];
        $("#namespaceList").html('');
        $.each(vocab_temp, function (i, el) {
            if ($.inArray(el, vocab) === -1) {
                $("#namespaceList").append("<div><a href='" + el + "' target='_blank'>" + el.split("//")[1] + "</a></div>");
                vocab.push(el);
            }
        });
        // console.log(vocab);
        // if (height < $("#menubar_left").height()) height = $("#menubar_left").height() //SVG height
    });

    $.ajax({
        type: "POST",
        url: apiurl + "stats",
        data: {
            'database_name': database_name
        }
    }).done(function (data) {
        $("#size").text(beautifyNumber(data[0].size))
        $("#c_size").text(beautifyNumber(data[0].c_size))
        $("#op_size").text(beautifyNumber(data[0].op_size))
        $("#dp_size").text(beautifyNumber(data[0].dp_size))
    });

}
function addNode(node) {
    if ($.inArray(node, userSelection) == -1) {
        userSelection.push(node);
        // userSelection = ["http://www.w3.org/ns/prov#Activity", "http://www.w3.org/ns/prov#Modify", "http://www.w3.org/2008/05/skos-xl#Label", "http://purl.org/ontology/bibo/DocumentPart", "http://purl.org/ontology/bibo/Document", "http://vocab.getty.edu/ontology#ScopeNote", "http://www.w3.org/ns/prov#Create", "http://vocab.getty.edu/ontology#Subject", "http://www.w3.org/2004/02/skos/core#Concept", "http://vocab.getty.edu/ontology#Concept", "http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement", "http://www.w3.org/ns/prov#Publish", "http://www.w3.org/1999/02/22-rdf-syntax-ns#List", "http://vocab.getty.edu/ontology#ObsoleteSubject", "http://purl.org/iso25964/skos-thes#ThesaurusArray", "http://www.w3.org/2004/02/skos/core#Collection", "http://vocab.getty.edu/ontology#GuideTerm", "http://www.w3.org/2004/02/skos/core#OrderedCollection", "http://xmlns.com/foaf/0.1/Agent", "http://vocab.getty.edu/ontology#Hierarchy"]

    }
}
function removeNode(node) {
    userSelection = jQuery.grep(userSelection, function (value) {
        return value != node;
    });
}


var width = $("#graphContainer").width(),     // svg width
    // svg height
    dr = 10,      // default point radius
    off = 15,    // cluster hull offset
    expand = {}, // expanded clusters
    data, net, force, hullg, hull, linkg, link, nodeg, node, thicklink, backup_data, nodeg_, linkg_, force_, link_, node_;
var height = $(window).height() 


var curve = d3.svg.line()
    .interpolate("cardinal-closed")
    .tension(.85);

var fill = d3.scale.category20();

function nodeid(n) {
    return n.size ? "_g_" + n.group : n.name + n.id;
}

function getlinkid(l) {
    var u = nodeid(l.source),
        v = nodeid(l.target);
    // return u < v ? u + "|" + v : v + "|" + u;
    return l.linkid + (u < v ? u + "|" + v : v + "|" + u);
}

function getGroup(n) { return n.group; }

// constructs the network to visualize
function network(data, prev, index, expand) {
    var gm = {},    // group map
        nm = {},    // node map
        lm = {},    // link map
        gn = {},    // previous group nodes
        gc = {},    // previous group centroids
        nodes = [], // output nodes
        links = [],
        visibility = []; // output links

    // process previous nodes for reuse or centroid calculation

    //need to figureout what this does
    // if (prev) {
    //   prev.nodes.forEach(function (n) {
    //     var i = index(n), o;
    //     if (n.size > 0) {
    //       gn[i] = n;
    //       n.size = 0;
    //     } else {
    //       o = gc[i] || (gc[i] = { x: 0, y: 0, count: 0 });
    //       o.x += n.x;
    //       o.y += n.y;
    //       o.count += 1;
    //     }
    //   });
    // }

    // determine nodes
    for (var k = 0; k < data.nodes.length; ++k) {
        var n = data.nodes[k],
            i = index(n),
            l = gm[i] || (gm[i] = gn[i]) || (gm[i] = {
                group: i, size: 0, nodes: [], name: n.name,
                equivalent: n.equivalent, intersect: n.intersect, subclass: n.subclass, class: n.class, id: n.id
            });

        if (expand[i]) {
            // the node should be directly visible
            // nm[n.name] = nodes.length;
            nm[n.class] = nodes.length;
            nodes.push(n);
            if (gn[i]) {
                // place new nodes at cluster location (plus jitter)
                n.x = gn[i].x + Math.random();
                n.y = gn[i].y + Math.random();
            }
        } else {
            // the node is part of a collapsed cluster
            if (l.size == 0) {
                // if new cluster, add to set and position at centroid of leaf nodes
                nm[i] = nodes.length;
                nodes.push(l);
                if (gc[i]) {
                    l.x = gc[i].x / gc[i].count;
                    l.y = gc[i].y / gc[i].count;
                }
            }
            l.nodes.push(n);
        }
        // always count group size as we also use it to tweak the force graph strengths/distances
        l.size += 1;
        n.group_data = l;
    }


    for (i in gm) { gm[i].link_count = 0; }

    // determine links
    for (k = 0; k < data.links.length; ++k) {
        var e = data.links[k],
            u = index(e.source),
            v = index(e.target);
        if (u != v) {
            gm[u].link_count++;
            gm[v].link_count++;
        }
        u = expand[u] ? nm[e.source.class] : nm[u];
        v = expand[v] ? nm[e.target.class] : nm[v];
        var i = u + "|" + v + "|" + e.bidirection;
        var l = lm[i] || (lm[i] = { source: u, target: v, size: 0, bidirection: e.bidirection, intersect: e.intersect, subclass: e.subclass, linkid: e.linkid });
        l.size += 1;
    }

    for (i in lm) { links.push(lm[i]); }

    return { nodes: nodes, links: links };
}


function convexHulls(nodes, index, offset) {
    var hulls = {};

    // create point sets
    for (var k = 0; k < nodes.length; ++k) {
        var n = nodes[k];
        if (n.size) continue;
        var i = index(n),
            l = hulls[i] || (hulls[i] = []);
        l.push([n.x - offset, n.y - offset]);
        l.push([n.x - offset, n.y + offset]);
        l.push([n.x + offset, n.y - offset]);
        l.push([n.x + offset, n.y + offset]);
    }

    // create convex hulls
    var hullset = [];
    for (i in hulls) {
        hullset.push({ group: i, path: d3.geom.hull(hulls[i]) });
    }

    return hullset;
}

function drawCluster(d) {
    return curve(d.path); // 0.8
}

// --------------------------------------------------------connectedNodes

var body = d3.select("#graphContainer");

var vis;
var vis_;

function mousemove() {
    // cursor.attr("transform", "translate(" + d3.mouse(this) + ")");
}


function loadGraph(userSelection) {

    $("#graphContainer>svg").remove();
    vis = body.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "mainGraph")
    // .call(d3.behavior.zoom().on("zoom", function () {
    //     svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
    // })).append("g")
    // .on("mousemove", mousemove);


    $.ajax({
        type: "POST",
        url: apiurl + "class",
        data: {
            'class': JSON.stringify(userSelection),
            'link_subclass': link_subclass,
            'link_intersection': link_intersection,
            'link_property': link_property,
            'database_name': database_name
        }
    }).done(function (json) {
        backup_data = json;
        data = json;
        console.log("---->");
        console.log(data.links);
        //this draws the line
        for (var i = 0; i < data.links.length; ++i) {
            o = data.links[i];
            o.source = data.nodes[o.source];
            o.target = data.nodes[o.target];
        }

        backup_data = data
        hullg = vis.append("g");
        linkg = vis.append("g");
        nodeg = vis.append("g");

        init();

        vis.attr("opacity", 1e-6)
            .transition()
            .duration(1000)
            .attr("opacity", 1);

    });
    var svg = d3.select("#mainGraph");
    
}

function init() {
    if (force) force.stop();

    net = network(data, net, getGroup, expand);
    // console.log(net.linsks)



    force = d3.layout.force()
        .nodes(net.nodes)
        .links(net.links)
        .size([width, height])
        .linkDistance(function (l, i) {
            var n1 = l.source, n2 = l.target;
            // larger distance for bigger groups:
            // both between single nodes and _other_ groups (where size of own node group still counts),
            // and between two group nodes.
            //
            // reduce distance for groups with very few outer links,
            // again both in expanded and grouped form, i.e. between individual nodes of a group and
            // nodes of another group or other group node or between two group nodes.
            //
            // The latter was done to keep the single-link groups ('blue', rose, ...) close.   
            // console.log(n1)
            if (l.subclass == 1 || l.intersect == 1)
                return 200;
            var d = 250 +
                Math.min(20 * Math.min((n1.size || (n1.group != n2.group ? n1.group_data.size : 0)),
                    (n2.size || (n1.group != n2.group ? n2.group_data.size : 0))),
                    -30 +
                    30 * Math.min((n1.link_count || (n1.group != n2.group ? n1.group_data.link_count : 0)),
                        (n2.link_count || (n1.group != n2.group ? n2.group_data.link_count : 0))),
                    100);
            // console.log(d);
            return d * 1.3;
            //return 150;
        })
        .linkStrength(function (l, i) {
            return 1;
        })
        .gravity(0.05)   // gravity+charge tweaked to ensure good 'grouped' view (e.g. green group not smack between blue&orange, ...
        .charge(-500)    // ... charge is important to turn single-linked groups to the outside
        .friction(0.5)   // friction adjusted to get dampened display: less bouncy bouncy ball [Swedish Chef, anyone?]
        .start();


    $("#graphContainer defs").remove();
    d3.select("#graphContainer svg").append("defs").selectAll(".marker")
        .data(force.links())
        .enter()
        .append("marker")
        .attr("class", "marker")
        .attr({
            'viewBox': '-4 -5 10 10',
            'refY': 0,
            'orient': 'auto',
            'markerWidth': 13,
            'markerHeight': 13,
            'xoverflow': 'visible',
            'markerUnits': 'userSpaceOnUse'
        })
        // .attr("orient", function (d) {
        //     if(d.source != d.target)
        //     return "auto";
        //     else
        //     return 92;
        //   })
        .attr("id", function (d) {
            return "arrowhead" + d.source.name.replace(/\s/g, '');
        })
        .attr("refX", function (d) {
            // return -(d.source.size ? d.source.size + dr : dr + 1) * 3 + 6;    // Add the marker's width    
            return -(dr + 1) * 3 + 6;
        })
        .append('svg:path')
        .attr('d', 'M0,0L10,-5L10,5Z')
        .attr('fill', '#000')
        .style('stroke', 'none');


    d3.select("#graphContainer svg").append("defs").selectAll(".marker")
        .data(force.links())
        .enter().append('marker')
        .attr("class", "marker")
        .attr({
            'viewBox': '3 -5 10 10',
            // 'refY': -3,
            // 'orient': 'auto',
            'markerWidth': 13,
            'markerHeight': 13,
            'xoverflow': 'visible',
            'markerUnits': 'userSpaceOnUse'
        })
        .attr("orient", function (d) {
            if (d.source != d.target)
                return "auto";
            else
                return 96;
        })
        .attr("id", function (d) {
            return "endarrowhead" + d.target.name.replace(/\s/g, '') + d.linkid;
        })
        .attr("refX", function (d) {
            // return (d.target.size ? d.target.size + dr : dr + 1) * 3 + 4;    // Add the marker's width  
            return (dr + 1) * 3 + 4;
        })
        .attr("refY", function (d) {
            if (d.subclass == 1)
                return -4;
            // else return -2.5;
        })
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#000')
        .style('stroke', 'none')


    hullg.selectAll("path.hull").remove();
    hull = hullg.selectAll("path.hull")
        .data(convexHulls(net.nodes, getGroup, off))
        .enter().append("path")
        .attr("class", "hull")
        .attr("d", drawCluster)
        .style("fill", function (d) { return fill(d.group); })
        .on("click", function (d) {
            expand[d.group] = false; init();
        });

    link = linkg.selectAll("path.link").data(net.links, getlinkid);
    link.exit().remove();

    link.enter().append("path")
        .attr("class",
        function (d) {
            if (d.intersect == 1) return "link intersectlink"
            else if (d.subclass == 1) return "link";
            else return "link solidline"
        })
        .attr('marker-start', function (d) {
            if (d.source == d.target) return false;
            if (d.bidirection == 1)
                return 'url(#arrowhead' + d.source.name.replace(/\s/g, '') + ')';
            else return false;
        })
        .attr('marker-end', function (d) {
            if (d.intersect == 1)
                return false;
            else
                return 'url(#endarrowhead' + d.target.name.replace(/\s/g, '') + d.linkid + ')';
        });

    thicklink = linkg.selectAll("path.thicklink").data(net.links, getlinkid);
    thicklink.exit().remove();
    thicklink.enter().append("path")
        .attr("class", "thicklink")
        .attr("display", function (d) {
            if (d.subclass == 1 || d.intersect == 1) return "none";
            return "block";
        })


    thicklink.filter(function (d) {
        return d.intersect != 1 && d.subclass != 1
    }).on("click", expandLink);

    node = nodeg.selectAll("g").data(net.nodes, nodeid);
    node.exit().remove();
    var newnode = node.enter().append("g").attr("class", "circle_wrapper")

    function equivalentClass() {
        // if ($(this).hasClass("intersectionNode")) return;
        d = d3.select(this).node().__data__;
        if (typeof d.group == "undefined") return;
        if (typeof expand[d.group] == "undefined" || expand[d.group] == false) expand[d.group] = !expand[d.group];
        if (d.size > 1) {
            init();
        }
        else if (querymode) {
            d = d3.select(this).node().__data__;
            query_property_filter = '';
            querySubject(d.class);
            $(".queryNode").removeClass("queryNode");
            $(this).addClass("queryNode")
           // return;
        }
    }
    newnode.append("circle")
        .attr("class", function (d) {
            var temp = d.class;
            circle_class = '';
            if (temp.indexOf("/rdf-schema") >= 0) {
                circle_class = "rdfclass";
            }
            else if (temp.indexOf("/owl#") >= 0) {
                circle_class = "owlclass";
            }
            if (d.intersect == 1)
                circle_class += ' class intersectionNode';
            if (d.equivalent == 1)
                circle_class += '  equivNode'
            return circle_class + " node" + (d.size ? "" : " leaf");
        })
        .attr("id", function (d) {
            return d.name + d.id
        })
        .attr("r", function (d) {
            if (d.intersect == 1) return 25;
            else
                // return (d.size ? d.size + dr : dr + 1) * 3 + 4; //size of circles
                return (dr + 1) * 3 + 4;
        })
        .style("cursor", function (d) {
            if (typeof expand[d.group] != "undefined" || expand[d.group] == true || d.size == 1) return "default";
            else return "pointer";
        })
        .style("fill", function (d) {
            if (d.equivalent == 1 && !$(this).hasClass("leaf"))
                return "#fff";

        })
        .on("dblclick", equivalentClass)
        // .on('mouseover', connectedNodes)
        .on('click', sparqlQuery);


    newnode.append("circle")
        .attr("class", function (d) {
            var temp = d.class;
            circle_class = '';
            if (temp.indexOf("/rdf-schema") >= 0) {
                circle_class = "rdfclass";
            }
            else if (temp.indexOf("/owl#") >= 0) {
                circle_class = "owlclass";
            }
            return circle_class + " node " + (d.size ? "" : " leaf");
        })
        .attr("r", function (d) {
            // return (d.size ? d.size + dr : dr + 1) * 3; //size of circles
            return (dr + 1) * 3;
        })
        // .style("fill", function (d) { 
        //     var temp = d.class
        //     if(temp.indexOf("/rdf-schema#") >=0){
        //         return fill("#c9c");
        //     }
        //     if(temp.indexOf("/owl#") >=0){
        //         return fill("#acf");
        //     }
        //     // return fill("#cc99cc");
        //  })
        .on("dblclick", equivalentClass)
        .attr("display", function (d) {
            if (d.equivalent == 1 && !$(this).hasClass("leaf"))
                return "block";
            else
                return "none";
        })
        // .on('mouseover', connectedNodes)
        .on('click', sparqlQuery);


    set = node.filter(function (d) {
        return d.intersect == 1;
    })

    set_g = set.append("g")
        .attr("class", "embedded")
        .attr("transform", "translate(-5,0)")

    set_g.append("path")
        .attr("class", "nostroke symbol")
        .attr("d", "m 5,-13 c 5,2.5 8.5,7.5 8.5,13 0,5 -3,10 -8.5,13 -5,-2.5 -8.5,-7.5 -8.5,-13 0,-5 3,-10 8.5,-13")

    set_g.append("circle")
        .attr("class", "nofill fineline set_path")
        .attr("r", 14)

    set_g.append("circle")
        .attr("class", "nofill fineline")
        .attr("r", 14)
        .attr("cx", 10)

    set_g.append("path")
        .attr("class", "nofill set_path")
        .attr("d", "m 9,5 c 0,-2 0,-4 0,-6 0,0 0,0 0,0 0,0 0,-1.8 -1,-2.3 -0.7,-0.6 -1.7,-0.8 -2.9,-0.8 -1.2,0 -2,0 -3,0.8 -0.7,0.5 -1,1.4 -1,2.3 0,2 0,4 0,6")

    newnode.append("rect")
    newnode.append("text").attr("class", function (d) {
        var temp = d.class;
        circle_class = '';
        if (temp.indexOf("/rdf-schema") >= 0) {
            circle_class = "rdfclasstext";
        }
        else if (temp.indexOf("/owl#") >= 0) {
            circle_class = "owlclasstext";
        }

        return circle_class + "node_label";
    })
        .text(function (d) {
            return d.name
        }).attr("pointer-events", "none").attr("text-anchor", "middle").call(getBB);

    vis.selectAll("text").each(function (d, i) {
        d.bb = this.getBBox(); // get bounding box of text field and store it in texts array
    });

    vis.selectAll("rect")
        .attr("fill", "rgba(255,255,255,0.7)")
        .attr("x", function (d) { return -d.bb.width / 2 - 2; })
        .attr("y", function (d) { return d.bb.height - 28; })
        .attr("width", function (d) { return d.bb.width + 4 })
        .attr("height", function (d) { return d.bb.height + 2; });



    // var node_drag = force.drag()
    //   .on("dragstart", dragstart)
    // .on("drag", dragmove)
    // .on("dragend", dragend);

    // node.call(force.drag);



    var edgepaths = nodeg.selectAll(".edgepath")
        .data(net.links)
        .enter()
        .append('path')
        .attr({
            'class': 'edgepath',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'id': function (d, i) { return 'edgepath' + i }
        })
        .style("pointer-events", "none");


    force.on("tick", function () {
        if (!hull.empty()) {
            hull.data(convexHulls(net.nodes, getGroup, off))
                .attr("d", drawCluster);
        }

        edgepaths.attr('d', function (d) {
            return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        });

        thicklink.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; })
            .attr("d", function (d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = 0;
                if (d.subclass == 1) dr = Math.sqrt(dx * dx + dy * dy);

                var x1 = d.source.x,
                    y1 = d.source.y,
                    x2 = d.target.x,
                    y2 = d.target.y
                if (x1 === x2 && y1 === y2) {
                    xRotation = -45;
                    sweep = 1;
                    largeArc = 1;
                    drx = 35;
                    dry = 25;
                    x2 = x2 + 1;
                    y2 = y2 + 1;
                    return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + 1 + "," + 1 + " " + x2 + "," + y2;
                }
                return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            })

        link.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; })
            .attr("d", function (d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = 0;
                if (d.subclass == 1) dr = Math.sqrt(dx * dx + dy * dy);
                var x1 = d.source.x,
                    y1 = d.source.y,
                    x2 = d.target.x,
                    y2 = d.target.y
                if (x1 === x2 && y1 === y2) {
                    xRotation = -45;
                    sweep = 1;
                    largeArc = 1;
                    drx = 35;
                    dry = 25;
                    x2 = x2 + 1;
                    y2 = y2 + 1;
                    return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + 1 + "," + 1 + " " + x2 + "," + y2;
                }
                return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            })
            .attr('display', function (d) {
                var x1 = $(this).attr("x1")
                var x2 = $(this).attr("x2")
                var y1 = $(this).attr("y1")
                var y2 = $(this).attr("y2")
                // if (x1 == x2 && y1 == y2)
                //     return 'none';
                // else
                return 'block';
            })

        var r = 32;
        var w = $("#graphContainer>svg").width();
        var h = $("#graphContainer>svg").height();

        node.attr('transform', function nodeTransform(d) {
            return "translate(" + Math.max(r, Math.min(w - r, d.x)) + "," + Math.max(r, Math.min(h - r, d.y)) + ")";
        });


        node.each(collide(0.5))
    });

    linkedByIndex = {};
    for (i = 0; i < net.links.length; i++) {
        var a = net.links[i].source.class;//index
        var b = net.links[i].target.class;//index
        linkedByIndex[a + "," + b] = 1;
    }

    //To included the clicked node for opacity1
    for (i = 0; i < net.nodes.length; i++) {
        var temp = net.nodes[i].class
        linkedByIndex[temp + "," + temp] = 1;
        // linkedByIndex[i + "," + i] = 1;
    }
    var node_drag = force.drag()
        .on("dragstart", dragstart);
    node.call(node_drag);

    // var svg = d3.select("#mainGraph")
    // svg.call(d3.behavior.zoom().on("zoom", function () {
    //     svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
    //   }))
    //   .append("g")
}
function dragstart(d) {
    if (locknode)
        d3.select(this).classed("fixed", d.fixed = true);
    // else
    // d3.select(this).classed("fixed", d.fixed = false);
}
// function dragstart1(d, i) {
//     console.log($("#locknode").is(":checked"));
//     if (locknode)
//         force.stop() // stops the force auto positioning before you start dragging
//     else force.drag
// }
// function dragmove(d, i) {
//     if (locknode) {
//         d.px += d3.event.dx;
//         d.py += d3.event.dy;
//         d.x += d3.event.dx;
//         d.y += d3.event.dy;
//     }
// }
// function dragend(d, i) {
//     if (locknode) {
//         d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
//         force.resume();
//     }
// }

function getBB(selection) {
    selection.each(function (d) { d.bb = this.getBBox(); })
}

function releasenode(d) {
    d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
    //force.resume();
}


//This function looks up whether a pair are neighbours
function neighboring(a, b) {
    // return linkedByIndex[a.index + "," + b.index];
    return linkedByIndex[a.class + "," + b.class];
}
function sparqlQuery() {

    // else {
    //     connectedNodes()
    // }
    // }
    // function connectedNodes() 
    // {
    d = d3.select(this).node().__data__;
    if (d.equivalent == 1 && !$(this).hasClass("leaf") && $(this).hasClass("equivNode"))
        return

    if (d3.select("#expandDivClass").style("left") == "auto")
        d3.select("#expandDivClass").style("left", d3.event.x + 150 + "px").style("top", d3.event.y / 2 + "px");

    var check = $(this).hasClass("selectedNode");
    if (!check) {
        $(".selectedNode").removeClass("selectedNode");
        node.style("opacity", 1);
        link.style("opacity", 1);
        thicklink.style("opacity", 1);
        toggle = 0;
    }
    if (toggle == 0) {
        //Reduce the opacity of all but the neighbouring nodes
        $(this).addClass("selectedNode")
        d = d3.select(this).node().__data__;
        if (!$(this).hasClass("intersectionNode")) classDetail(d.class);

        node.style("opacity", function (o) {
            // console.log(neighboring(d, o),neighboring(o, d))
            var return_ = neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
            // if (return_ == 1) console.log(d.name, o.name)
            return return_;
        });

        node.style("pointer-events", function (o) {
            // console.log(neighboring(d, o),neighboring(o, d))
            var return_ = neighboring(d, o) | neighboring(o, d) ? "auto": "none";
            // if (return_ == 1) console.log(d.name, o.name)
            return return_;
        });

        // console.log(link)
        link.style("opacity", function (o) {
            return d.class == o.source.class | d.class == o.target.class ? 1 : 0.1;
            // return d.index == o.source.index | d.index == o.target.index ? 1 : 0.1;
        });
        thicklink.style("pointer-events", function (o) {
            return d.class == o.source.class | d.class == o.target.class ? "auto" : "none";
        });
        //Reduce the op
        toggle = 1;
    } else {
        //Put them back to opacity=1
        $(".selectedNode").removeClass("selectedNode");
        node.style("opacity", 1);
        node.style("pointer-events", "auto");
        link.style("opacity", 1);
        thicklink.style("pointer-events", "auto");
        thicklink.style("opacity", 1);
        toggle = 0;
    }
}


var padding = 1, // separation between circles
    radius = 50;
function collide(alpha) {
    var quadtree = d3.geom.quadtree(net.nodes);
    return function (d) {
        var rb = 2 * radius + padding,
            nx1 = d.x - rb,
            nx2 = d.x + rb,
            ny1 = d.y - rb,
            ny2 = d.y + rb;
        quadtree.visit(function (quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                    y = d.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y);
                if (l < rb) {
                    l = (l - rb) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
    };
}

var p_data;
function expandLink() {
    d = d3.select(this).node().__data__;
    var source = d.source.class;//nodes[0].class;
    var target = d.target.class;//nodes[0].class;
    var bidirection = source == target ? 0 : d.bidirection;
    if (d3.select("#expandDivProperty").style("left") == "auto") d3.select("#expandDivProperty").style("left", d3.event.x + 150 + "px").style("top", d3.event.y / 2 + "px");
    $.ajax({
        type: "POST",
        url: apiurl + "property",
        data: { 's': source, 't': target, 'b': bidirection, 'limit': 100, 'database_name': database_name }
    }).done(function (json) {
        p_data = json;
        // drawPropertyInfo(source,target);
        cssPropertyInfo(source, target);
    });
}
function getName(uri) {
    var parts = uri.split("/");
    var lastPart = parts[parts.length - 1];
    var checkHash = lastPart.split("#")
    // console.log(checkHash[0])
    if (checkHash.length > 1)
        return checkHash[1]
    else return checkHash[0];
}

function getUri(uri) {
    var checkHash = uri.split("#")
    if (checkHash.length > 1)
        return checkHash[0] + "#"
    return uri.substring(0, uri.lastIndexOf("/"));
}

function cssPropertyInfo(left, right) {
    $("#expandDivProperty").show();
    $("#expandDivProperty_content *").remove();
    // $("#expandDivProperty_content").append("<div class='rotate class_name_left'>" + getName(left) + "</div>" +
    //     "<div class='rotate class_name_right'>" + getName(right) + "</div>"
    // );
    $("#property_left").html(getName(left));
    $("#property_right").html(getName(right));


    jQuery.each(p_data, function (i, d) {
        $("#expandDivProperty_content").append("<div class='row propertylist'>" +
            "<div class='p_name col-lg-12' onclick='queryProperty(\"" + d["c1"] + "\",\"" + d["p"] + "\",\"" + d["c2"] + "\")' title='" + d["p"] + "'>" +
            (d["max_cardinality"] > 1 ? "1..*" : "1..1") + " " +
            getName(d["p"]) + " - " +
            beautifyNumber(d["count"]) +
            "</div>" +
            "<div class='col-lg-12 link'><div class='arrowline'></div><article class='basicDimen " +
            (d["c1"] == left ? "rightArrow" : "leftArrow")
            + "'></article></div>" +
            (d["inverse"] == null ? "" : "<div class='container-fluid'><div id='inverselist" + i + "' class='inverselist row'></div>") +
            "</div>");

        if (typeof d["inverse"] === "undefined") return;
        temp = d["inverse"].sort(function (a, b) {
            return (a.count_ < b.count_);
        });

        temp = temp.sort(function (a, b) {
            return a.p.indexOf(getUri(d["p"])) !== -1;
        });

        if (d["inverse"].length > 0)
            $("#inverselist" + i).append("<div class='col-lg-12'><div class='inverseof_title'>InverseOf" +
                "<div class='arrowline'></div><article class='basicDimen " +
                (d["c1"] == left ? "leftArrow" : "rightArrow")
                + "'></article></div></div></div>"
            );
        $.each(temp, function (j, val) {
            // if (j > 0 || val["count_"] == 0) return;
            if (j > 0) return;
            $("#inverselist" + i).append("<div class='col-lg-12 p_name' onclick='queryProperty(\"" + d["c2"] + "\",\"" + val["p"] + "\",\"" + d["c1"] + "\")' title='" + val["p"] + "'>" +
                getName(val["p"])
                + " - " + beautifyNumber(val["count_"]) + "</div>"
            );
        });
    });
    checkInverseOfToggle();
}

function queryDatatype(s, p) {
    query_node_subject = s;
    query_node_property = p;
    query_node_object = '';
    query();
}

function queryProperty(s, p, o) {
    // console.log(s)
    query_node_subject = s;
    query_node_object = o;
    query_node_property = p;
    query();
}
// function drawPropertyInfo(left, right) {
//     d3.select("#expandDivProperty svg").remove();
//     var svg_ = d3.select("#expandDivProperty").append("svg");
//     console.log(p_data)
//     svg_.attr("width", 300)
//         .attr("height", 300);

//     svg_.append('marker')
//         .attr("class", "marker")
//         .attr({
//             'viewBox': '-0 -5 10 10',
//             'refX': 10,
//             'refY': 0,
//             'orient': 'auto',
//             'markerWidth': 13,
//             'markerHeight': 13,
//             'xoverflow': 'visible',
//             'markerUnits': 'userSpaceOnUse'
//         })
//         .attr("id", "endarrowhead")
//         .append('svg:path')
//         .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
//         .attr('fill', '#999')
//         .style('stroke', 'none');

//     svg_.append("marker")
//         .attr("class", "marker")
//         .attr({
//             'viewBox': '-0 -5 10 10',
//             'refX': 0,
//             'refY': 0,
//             'orient': 'auto',
//             'markerWidth': 13,
//             'markerHeight': 13,
//             'xoverflow': 'visible',
//             'markerUnits': 'userSpaceOnUse'
//         })
//         .attr("id", "arrowhead")
//         .append('svg:path')
//         .attr('d', 'M0,0L10,-5L10,5Z')
//         .attr('fill', '#000')
//         .style('stroke', 'none');

//     // var drag = d3.behavior.drag()
//     //   .on("dragstart", function () {
//     //     d3.event.sourceEvent.stopPropagation()
//     //   })
//     // .on("drag", dragmove);


//     var series = [[{ time: 50, value: 50 }, { time: 250, value: 50 }], [{ time: 50, value: 80 }, { time: 250, value: 80 }]];
//     var pline = d3.svg.line()
//         .interpolate("linear")
//         .x(function (d, i) {
//             alert(i)
//             return d.time;
//         })
//         .y(function (d, i) { return d.value; });

//     group = svg_.append("g");
//     group.selectAll(".pline")
//         .data(p_data)
//         .enter().append("path")
//         .attr("class", "pline")
//         .attr("d", function (d, i) {
//             var x1 = 50;
//             var x2 = 250;
//             var y = 50 + 30 * i;
//             return "M " + x1 + " " + y + " L " + x2 + " " + y;
//         })
//         .attr('marker-end', function (d) {
//             if (d.c1 == left)// || d.inverse!=null) 
//                 return 'url(#endarrowhead)';
//         })
//         .attr('marker-start', function (d) {
//             if (d.c2 == left)// || d.inverse!=null)
//                 return 'url(#arrowhead)';

//         })
//         .attr('id', function (d, i) { return "property_" + i; })


//     group.selectAll(".edgelabel").data(p_data)
//         .enter()
//         .append('text')
//         .style("pointer-events", "none")
//         .attr({
//             'class': 'edgelabel',
//             //  'id':function(d,i){return 'edgelabel'+i},
//             'dx': 50,
//             'font-size': 10,
//             'fill': '#333'
//         })
//         .attr('dy', function (d, i) {
//             return 48 + 30 * i;
//         })
//         .append('textPath')
//         .attr('href', function (d, i) { return "property_" + i; })
//         .style("pointer-events", "none")
//         .text(function (d) {
//             // if(d.p == d.p1)
//             // return getName(d.p) + " " + d.count+" "+getName(d.p2)
//             // if(d.p == d.p2)
//             // return getName(d.p) + " " + d.count+" "+getName(d.p1)
//             var x = getName(d.p)
//             console.log(x)
//             // alert(x)
//             return x + " " + d.count;
//         });

// }

function loadProperty(p) {

    $.ajax({
        type: "POST",
        url: apiurl + "query/propertylist",
        data: {
            's': query_node_subject,
            'database_name': database_name
        }
    }).done(function (json) {
        $("#facet_property *").remove();
        $.each(json, function (key, d) {
            $("#facet_property").append("<div><label for='proeprty_" + key + "' class='radio_container'>" +
                "<input type='radio'  name='propertylist' value='" + d.p.value + "' id='proeprty_" + key + "'/>" + getName(d.p.value) +
                "<span class='radio_checkmark'></span></label> </div>");
        });
    });
}

function querySubject(s) {
    var temp = s.split("~~~")
    if (temp.length > 1) {
        query_node_subject = temp[0];
        query_node_object = temp[1];
    }
    else {
        query_node_subject = s;
        query_node_object = '';
        // loadProperty();
    }
    query_node_property = '';
    query();
}

function htmlDecode(html) {
    return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function query() {
    if (!querymode) return;
    $("#queryResult").show();
    $('#paginator').trigger('page');
    // $('#resultTable thead tr').html("<th>Name</th><th>Position</th><th>Office</th>");
    // $('#resultTable').DataTable({
    //   "ajax": {
    //       type: "POST",
    //       url: apiurl + "query",
    //       data: {
    //         's': query_node_subject,
    //         'p': query_node_property,
    //         't': query_node_object,
    //         'p_filter': JSON.stringify(query_property_filter),
    //         'database_name': database_name

    //       }
    //     },
    //   "columns": [
    //     { "data": "s.value" },
    //     { "data": "p.value" },
    //     { "data": "o.value" }
    //   ],
    //   "destroy": true
    // });



}
function isValidInput(input) {
    if (input.indexOf("http://") == 0 || input.indexOf("https://") == 0) return "<span class='instanceLink glyphicon glyphicon-search' onclick='instanceGraph(\"" + input + "\")'></span>";
    else return "";
}
function isUrl(input) {
    if (input.indexOf("http://") == 0 || input.indexOf("https://") == 0) return "<a href='" + input + "' class='result_link  glyphicon glyphicon-new-window' target='_new'></a>"
    return "";
}
function instanceGraph(i) {
    if ($("#instanceDiv").css('display') == "none") $("#instanceDiv").css('display', 'flex')
    d3.select("#instanceGraph *").remove();
    vis_ = d3.select("#instanceGraph").append("svg");
    vis_.attr("width", $("#instanceGraph").width())
        .attr("height", 700);

    $("#instanceInfo").height(680);//20px padding
    $.ajax({
        type: "POST",
        url: apiurl + "query/instance/propertylist",
        data: {
            'i': i,
            'database_name': database_name
        }
    }).done(function (json) {
        linkg_ = vis_.append("g");
        nodeg_ = vis_.append("g");
        initInstanceGraph(json);
        var body = $("html, body");
        body.stop().animate({ scrollTop: $('#instanceDiv').offset().top }, 500, 'swing', function () { });
    });
}


function initInstanceGraph(gdata) {
    if (force_) force_.stop();
    force_ = d3.layout.force()
        .nodes(gdata.nodes)
        .links(gdata.links)
        .size([width, height])
        .linkDistance(function (l, i) {
            var n1 = l.source, n2 = l.target;
            var d = 250;
            return d;
        })
        .linkStrength(function (l, i) {
            return 1;
        })
        // .gravity(0.05)   // gravity+charge tweaked to ensure good 'grouped' view (e.g. green group not smack between blue&orange, ...
        .charge(-500)    // ... charge is important to turn single-linked groups to the outside
        // .friction(0.5)   // friction adjusted to get dampened display: less bouncy bouncy ball [Swedish Chef, anyone?]
        .start();


    $("#instanceGraph defs").remove();

    d3.select("#instanceGraph svg").append("defs").selectAll(".marker")
        .data(force_.links())
        .enter().append('marker')
        .attr("class", "marker")
        .attr({
            'viewBox': '3 -5 10 10',
            'orient': 'auto',
            'markerWidth': 13,
            'markerHeight': 13,
            'xoverflow': 'visible',
            'markerUnits': 'userSpaceOnUse'
        })
        .attr("id", function (d) {
            return "endarrowhead" + d.target.name.replace(/\s/g, '') + d.linkid;
        })
        .attr("refX", function (d) {
            // return (d.target.size ? d.target.size + dr : dr + 1) * 3 + 4;    // Add the marker's width         
            return (dr + 1) * 3 + 4;
        })
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#000')
        .style('stroke', 'none')


    link_ = linkg_.selectAll("path.link").data(gdata.links);//, getlinkid);
    link_.exit().remove();

    link_.enter().append("path")
        .attr("class",
        function (d) {
            return "link solidline"
        })
        .attr('marker-end', function (d) {
            return 'url(#endarrowhead' + d.target.name.replace(/\s/g, '') + d.linkid + ')';
        }).attr({
            'id': function (d, i) { return 'property_edge' + i }
        });

    node_ = nodeg_.selectAll("g").data(gdata.nodes, nodeid);
    node_.exit().remove();
    var newnode = node_.enter().append("g").attr("class", "circle_wrapper")

    newnode.append("circle")
        .attr("class", function (d) {
            return "node" + (d.size ? "" : " leaf");
        })
        .attr("r", function (d) {
            return (d.size ? d.size + dr : dr + 1) * 3; //size of circles
        })
        .on('click', instanceInfo);


    edgelabels = linkg_.selectAll(".property_edgelabel")
        .data(gdata.links)
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attr({
            'class': 'edgelabel',
            'id': function (d, i) { return 'property_edgelabel' + i },
            'font-size': 12,
            'fill': '#000'
        });

    edgelabels.append('textPath')
        .attr('xlink:href', function (d, i) { return '#property_edge' + i })
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("startOffset", "50%")
        .text(function (d) { return getName(d.name) });

    newnode.append("rect");
    newnode.append("text").attr("class", "node_label")
        .text(function (d) {
            return d.name
        }).attr("pointer-events", "none").attr("text-anchor", "middle").call(getBB);

    vis_.selectAll("text").each(function (d, i) {
        d.bb = this.getBBox(); // get bounding box of text field and store it in texts array
    });

    vis_.selectAll("rect")
        .attr("fill", "rgba(255,255,255,0.7)")
        .attr("x", function (d) { return -d.bb.width / 2 - 2; })
        .attr("y", function (d) { return d.bb.height - 28; })
        .attr("width", function (d) { return d.bb.width + 4 })
        .attr("height", function (d) { return d.bb.height + 2; });


    force_.on("tick", function () {
        link_.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; })
            .attr("d", function (d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = 0;
                return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            })
            .attr('display', function (d) {
                var x1 = $(this).attr("x1")
                var x2 = $(this).attr("x2")
                var y1 = $(this).attr("y1")
                var y2 = $(this).attr("y2")
                if (x1 == x2 && y1 == y2)
                    return 'none';
                else
                    return 'block';
            });


        edgelabels.attr('transform', function (d) {
            if (d.target.x < d.source.x) {
                try {
                    var bbox = this.getBBox();
                    rx = bbox.x + bbox.width / 2;
                    ry = bbox.y + bbox.height / 2;
                    return 'rotate(180 ' + rx + ' ' + ry + ')';
                } catch (e) {
                    console.log(e);
                }

            }
            else {
                return 'rotate(0)';
            }
        });

        var r = 32;
        var w = $("#instanceGraph>svg").width();
        var h = $("#instanceGraph>svg").height();

        node_.attr('transform', function nodeTransform(d) {
            return "translate(" + Math.max(r, Math.min(w - r, d.x)) + "," + Math.max(r, Math.min(h - r, d.y)) + ")";
        });
        node_.each(collide(0.5))
    });

    var node_drag = force_.drag()
        .on("dragstart", dragstart_);

    node_.call(node_drag);

}
function dragstart_(d) {
    // if (querymode)
    d3.select(this).classed("fixed", d.fixed = true);
}

function instanceInfo(d) {
    $(".selectedInstanceNode").removeClass("selectedInstanceNode")
    $(this).addClass("selectedInstanceNode")
    $.ajax({
        type: "POST",
        url: apiurl + "query/instance/property/object",
        data: {
            's': d.subject,
            'p': d.node,
            'database_name': database_name
        }
    }).done(function (json) {
        $("#instanceInfo tbody *").remove();
        $("#instanceInfo thead td").html(d.node);
        $.each(json, function (key, d) {
            $("#instanceInfo tbody").append(
                "<tr><td>" +
                htmlDecode(typeof d.o_label === 'undefined' ? (typeof d.o_name === 'undefined' ? d.o.value : d.o_name.value) : d.o_label.value) +
                isUrl(d.o.value) +
                isValidInput(d.o.value) +
                "</td></tr>"
            )
        });
        // $("#instanceInfo").show();
    });
}

function classDetail(c) {
    $.ajax({
        type: "POST",
        url: apiurl + "query/class/detail",
        data: {
            's': c,
            'database_name': database_name
        }
    }).done(function (data) {
        // if (data == '') {
        //     $("#expandDivClass").hide(); return;
        // }
        $("#expandDivClass").show();
        $("#expandDivClass_content *").remove();
        $("#class_name").html(getName(c) + " - " + classlist_arr[c]);
        $("#expandDivClass_content").append("<div class='resourceUri'><a href='" + c + "' class='result_link' target='_new'>" + c + "</a></div>");
        if (data == '') return;
        $("#expandDivClass_content").append("<table><th>Datatype Property</th><th>Datatype</th></table>");
        $(data).each(function () {
            $("#expandDivClass table").append("<tr><td title='" + this.p + "'><a href='" + this.p + "' class='result_link  glyphicon glyphicon-new-window' target='_new'></a>" +
                "<span class='makePointer' onclick='queryDatatype(\"" + c + "\",\"" + this.p + "\")'>" +
                getName(this.p) + " - " + beautifyNumber(this.count) +
                "</span>" +
                "</td><td>" + (this.datatype).join(",") + "</td></tr>");
        });
    });

}

$.extend(true, $.fn.dataTable.defaults, {
    "searching": false
    // "ordering": false
});

  // $(document).ready(function () {
  //   $('#resultTable').DataTable();
  // });
