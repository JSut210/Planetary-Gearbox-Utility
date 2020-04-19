/*
  Gear image generation code adapted from http://jsbin.com/oresos/latest

  Gear Animation code Copyright (c) 2014 Ryan Cahoon and is distributed under the following terms

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
  modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
    Software.
  * The names of the contributors may not be used to endorse or promote products derived from this software without
    specific prior written permission.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */

pi = Math.PI;

// degrees to radians
function degrees_to_radians(theta) {
  return theta / 180 * pi;
}

// polar to cartesian
function polar(r, theta) {
  return [r * Math.sin(theta), r * Math.cos(theta)];
}

// gear parameter setup
mm_per_tooth = 3 * pi; // pixel size of one gear tooth (even though it says millimeters, it's pixels) must be same for two gears to fit each other
pressure_angle = 20; // in degrees, determines gear shape, range is 10 to 40 degrees, most common is 20 degrees
clearance = 2; // freedom between two gear centers
backlash = 2; // freedom between two gear contact points
axle_radius = 10; // center hole radius in pixels
ring_margin = 10;
pressure_angle = degrees_to_radians(pressure_angle); // convet degrees to radians

function make_gear(number_of_teeth, internal, color) {
  // Draw an involute gear in your browswer using JavaScript and SVG
  // Tested on Internet Explorer 10 and Firefox 22

  // Adapted from: Public Domain Parametric Involute Spur Gear by Leemon Baird, 2011, Leemon@Leemon.com http://www.thingiverse.com/thing:5505

  // see also http://grabcad.com/questions/tutorial-how-to-model-involute-gears-in-solidworks-and-show-design-intent

  // point on involute curve
  function q6(b, s, t, d) {
    return polar(d, s * (iang(b, d) + t));
  }

  // unwind this many degrees to go from r1 to r2
  function iang(r1, r2) {
    return Math.sqrt((r2 / r1) * (r2 / r1) - 1) - Math.acos(r1 / r2);
  }

  // radius a fraction f up the curved side of the tooth
  function q7(f, r, b, r2, t, s) {
    return q6(b, s, t, (1 - f) * Math.max(b, r) + f * r2);
  }

  // rotate an array of 2d points
  function rotate(points_array, angle) {
    var answer = [];
    for (var i = 0; i < points_array.length; i++) {
      var x = points_array[i][0];
      var y = points_array[i][1];
      var xr = x * Math.cos(angle) - y * Math.sin(angle);
      var yr = y * Math.cos(angle) + x * Math.sin(angle);
      answer.push([xr, yr]);
    }
    return answer;
  }

  function pitch_radius(number_of_teeth) {
    return mm_per_tooth * number_of_teeth / pi / 2;
  }

  // involute gear maker
  function build_gear(number_of_teeth) {
    var p = pitch_radius(number_of_teeth); // radius of pitch circle
    var c = p + mm_per_tooth / pi - clearance; // radius of outer circle
    var b = p * Math.cos(pressure_angle); // radius of base circle
    var r = p - (c - p) - clearance; // radius of root circle
    var t = mm_per_tooth / 2 - backlash / 2; // tooth thickness at pitch circle
    var k = -iang(b, p) - t / 2 / p; // angle where involute meets base circle on side of tooth

    // here is the magic - a set of [x,y] points to create a single gear tooth

    var points = [polar(r, -pi / number_of_teeth), polar(r, r < b ? k : -pi / number_of_teeth),
      q7(0 / 5, r, b, c, k, 1), q7(1 / 5, r, b, c, k, 1), q7(2 / 5, r, b, c, k, 1), q7(3 / 5, r, b, c, k, 1), q7(4 / 5, r, b, c, k, 1), q7(5 / 5, r, b, c, k, 1),
      q7(5 / 5, r, b, c, k, -1), q7(4 / 5, r, b, c, k, -1), q7(3 / 5, r, b, c, k, -1), q7(2 / 5, r, b, c, k, -1), q7(1 / 5, r, b, c, k, -1), q7(0 / 5, r, b, c, k, -1),
      polar(r, r < b ? -k : pi / number_of_teeth), polar(r, pi / number_of_teeth)
    ];

    var answer = [];

    // create every gear tooth by rotating the first tooth

    for (var i = 0; i < number_of_teeth; i++) answer = answer.concat(rotate(points, -i * 2 * pi / number_of_teeth));

    return answer; // returns an array of [x,y] points
  }

  // create polygon using pointlist

  var gear1 = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  gear1.setAttribute("points", build_gear(number_of_teeth).toString());

  // add the new graphics to the document structure

  var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("stroke", "#000000");
  group.setAttribute("stroke-width", "2px");

  // create the axle circle in the center of the gear
  var axle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");

  var mark_radius;
  if (internal) {
    axle1.setAttribute("r", pitch_radius(number_of_teeth) + ring_margin);
    mark_radius = pitch_radius(number_of_teeth) + ring_margin / 2;

    gear1.setAttribute("fill", "#ffffff");
    axle1.setAttribute("fill", color);

    group.appendChild(axle1);
    group.appendChild(gear1);
  } else {
    axle1.setAttribute("r", Math.max(1, Math.min(axle_radius, pitch_radius(number_of_teeth) - 20)).toString());
    mark_radius = pitch_radius(number_of_teeth) - 10;

    axle1.setAttribute("fill", "#ffffff");
    gear1.setAttribute("fill", color);

    group.appendChild(gear1);
    group.appendChild(axle1);
  }

  var mark = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  mark.setAttribute("r", 2);
  mark.setAttribute("fill", "#000000");
  mark.setAttribute("transform", "rotate(90) translate(" + mark_radius + ")");
  group.appendChild(mark);

  return group;
}

function makeCarrier(points, radius) {
  radius *= points.length / 1.923;
  points.push(points[0]);
  var spec = "M" + points[0][0] + "," + points[0][1];
  for (var i = 1; i < points.length; ++i) {
    spec += " A" + radius + "," + radius;
    spec += " 0 0 1";
    spec += " " + points[i][0] + "," + points[i][1];
  }
  return spec;
}

function drawStage(container) {
  svg_height = container.find(".card").width();
  svg_width = container.find(".card").width();

  var S = parseInt(container.find(".input-sun-teeth").val());
  var P = parseInt(container.find(".input-planet-teeth").val());
  var R = parseInt(container.find(".input-ring-teeth").val());

  ring_margin = svg_width * 0.05;
  mm_per_tooth = pi * (svg_width - 2 * ring_margin) / R;

  var numPlanets = 5;

  var sunAngle = 0;
  var carrierAngle = 0;
  var ringAngle = 0;

  var sunSpeed = 8; //parseFloat(container.find(".input-sun-speed").val());
  var carrierSpeed = 4; //parseFloat(container.find(".input-sun-speed").val());
  var ringSpeed = 2; //parseFloat(container.find(".input-sun-speed").val());

  var sun = make_gear(S, false, "#44dddd");
  var planet = make_gear(P, false, "#ff00ff88");
  var ring = make_gear(R, true, "#88ff88");



  var anim = new Animation();

  var svg_image = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg_image.setAttribute("height", svg_height.toString());
  svg_image.setAttribute("width", svg_width.toString());
  svg_image.setAttribute("viewBox", -svg_width / 2 + " " + -svg_height / 2 + " " + svg_width + " " + svg_height);
  svg_image.setAttribute("preserveAspectRatio", "xMidYMid slice");

  var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.appendChild(planet);
  planet.setAttribute("id", "planet");

  var carrier = document.createElementNS("http://www.w3.org/2000/svg", "path");
  carrier.setAttribute("stroke", "#888888");
  carrier.setAttribute("stroke-width", "2px");
  carrier.setAttribute("fill", "#ff8888");

  svg_image.appendChild(defs);
  svg_image.appendChild(ring);
  svg_image.appendChild(carrier);
  svg_image.appendChild(sun);
  var planets = [];

  container.find("svg").remove();
  container.append(svg_image);

  updated = true;
  anim.setStage(function() {
    numPlanets = 8;
    while (planets.length < numPlanets) {
      var p = document.createElementNS("http://www.w3.org/2000/svg", "use");
      p.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#planet");
      svg_image.appendChild(p);
      planets.push(p);
      updated = true;
    }
    while (planets.length > numPlanets) {
      svg_image.removeChild(planets.pop());
      updated = true;
    }

    if ((sunSpeed == 0) && (carrierSpeed == 0) && (ringSpeed == 0) && !updated) {
      return;
    }

    var inc = 2 * Math.PI / 1000 * this.getTimeInterval();
    sunAngle += inc * sunSpeed;
    carrierAngle += inc * carrierSpeed;
    ringAngle += inc * ringSpeed;

    var carrierPoints = [];
    var planetOrbitRadius = (S + P) * mm_per_tooth / (2 * pi);

    sun.setAttribute("transform", "rotate(" + (sunAngle - 90) + ")");
    ring.setAttribute("transform", "rotate(" + (ringAngle - 90 - (1 - P % 2) * 180.0 / R) + ")");
    for (var i = 0; i < planets.length; ++i) {
      planetPosition = carrierAngle + 360 * i / planets.length;
      planetAngle1 = S * (planetPosition - sunAngle);
      planetAngle = R * (ringAngle - planetPosition);
      carrierOffset = (planetAngle - planetAngle1) % 360;
      while (carrierOffset > 180) carrierOffset -= 360;
      while (carrierOffset < -180) carrierOffset += 360;
      carrierOffset /= (R + S);
      planetPosition += carrierOffset;
      //planetAngle = S/P * (planetPosition - sunAngle) + 90 + 180/P;
      planetAngle = R / P * (ringAngle - planetPosition) + 90 + 180 / P;

      planets[i].setAttribute("transform", "rotate(" + planetPosition + ") translate(" + planetOrbitRadius + ") rotate(" + planetAngle + ")");

      var planetPositionRad = planetPosition * Math.PI / 180;
      carrierPoints.push([planetOrbitRadius * Math.cos(planetPositionRad),
        planetOrbitRadius * Math.sin(planetPositionRad)
      ]);
    }
    carrier.setAttribute("d", makeCarrier(carrierPoints, planetOrbitRadius));

    updated = false;
  });

  anim.start();
};
