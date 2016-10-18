/**
 * @function drawRegions
 * @param {Leaflet Map Object} map - map object generated by L.map()
 * @param {array} regionData - array of geoJSON feature objects
 * @param {string} [classStr] - optional class value(s) to apply to each region path element. If applying more than one class
 * the classes must be space separated in the string
 * @desc Given a Leaflet map, draws feature objects in regionData as svg path elements
 */

export default function drawRegions(map, regionData, classStr) {

  // Set initial d3 variables
  var svg = d3.select(map.getPanes().overlayPane).append("svg");
  var g   = svg.append("g").attr("class", "leaflet-zoom-hide").attr("id", "mapgroup");

  /**
   * @function transform
   * @desc d3 transform for converting lat,long points to pixel values
   */
  var transform = d3.geoTransform({point: projectPoint})

  /**
   * @function path
   * @desc d3 path function for creating svg path from coordinates
   */
  var path = d3.geoPath().projection(transform);
  
  /**
   * @function projectPoint
   * @desc helper function for converting lat/lng to pixel values
   */
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  // start binding the state path data to path elements
  var feature = g.selectAll("path")
      .data(regionData)
      .enter()
      .append("path")
      .attr("d", path);

  // style the region path if a class was provided
  if(classStr) {
    feature.attr("class", classStr)
  }

  // use the leaflet viewreset event so d3 redraws paths when the view changes
  map.on("viewreset", reset);

  // call reset to finish drawing the region paths
  reset();

  // on leaflet zoom, we need to adjust the paths
  // move the containing svg box so it overlays the correct area of the map
  /*
   * @function reset
   * @desc reposition the svg container so the region bounds are drawn over the map correctly
   */
  function reset() {
    // to compute bounds, need a geoJSON object
    var regionGeoJSON = {type: "FeatureCollection", features: regionData};

    var bounds = path.bounds(regionGeoJSON), // path.bounds returns array of 2 points [[x,y],[x,y]]
        topLeft = bounds[0],
        bottomRight = bounds[1];

    // set the svg width and height
    svg.attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");

    // move the svg container into place
    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

    // draw the svg paths
    feature.attr("d", path);

  } // end of reset

} // end drawRegions
