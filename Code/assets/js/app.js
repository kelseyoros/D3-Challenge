var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(povertyData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(povertyData, d => d[chosenYAxis]) * 0.8,
        d3.max(povertyData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => xScale(d, chosenXAxis))
      .attr("cy", d => yScale(d, chosenYAxis));  
    return circlesGroup;
}

function renderLabels(circleLabels, chosenXAxis, chosenYAxis) {

    circleLabels.transition()
      .duration(1000)
      .attr("x", d => xScale(d, chosenXAxis))
      .attr("y", d => yScale(d, chosenYAxis));  
    return circleLabels;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  
    let xlabel = ""
    let ylabel = ""

    if (chosenXAxis === "poverty") {
      xlabel = "In Poverty (%):";
    } else if (chosenXAxis === "age") {
      xlabel = "Age (Median):"
    } else {
      xlabel = "Household Income (Median):";
    };

    if (chosenYAxis === "healthcare") {
      ylabel = "Lacks Healthcare (%):";
    } else if (chosenYAxis === "smokes"){
      ylabel = "Smokers (%):";
    } else {
      ylabel = "Obese (%):";
    };

    var toolTip = d3.tip() 
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return `${d.state} (${d.abbr})<br>${ylabel}${d[chosenYAxis]}<br>${xlabel}${d[chosenXAxis]}`;
      });
  
    svg.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data,this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data, this);
      });
  
    return circlesGroup;
  };

// Retrieve data from the CSV file and execute everything below
var data = d3.csv("assets/data/data.csv").then(function(data, err) {
//    if (err) throw err;
  
    // parse data
    data.forEach(function(d) {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.obesity = +d.obesity;
      d.smokes = +d.smokes;
      d.healthcare = +d.healthcare;
    });

    //xLinearScale & yLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data,chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y-axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    //append circles
    var gGroup = chartGroup.selectAll("g circles")
      .data(data)
      .enter()

    var circlesGroup = gGroup.append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("class", d=>"stateCircle " + d.abbr)
      // .on("mouseover", function(d) {
      //   toolTip.show(d,this); d3.select(this).style("stroke", "#323232");})
      // .on("mouseout", function(d) {
      //   toolTip.hide(d,this); d3.select(this).style("stroke", "#E3E3E3");})

    // fix text labels
    // label within circle
    var circlesText = gGroup
      .append("text")
      .text( d => d.abbr)
      .attr("dx", d => xLinearScale(d[chosenXAxis]))  
      .attr("dy", d => yLinearScale(d[chosenYAxis]))
      .attr("class", "stateText")
      .attr("alignment-base", "middle");

    // Create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)");

    var healthcareLabel = yLabelsGroup.append("text")
      .attr("x", -(height/2))
      .attr("y", -20)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
      .attr("x", -(height/2))
      .attr("y", -40)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
      .attr("x", -(height/2))
      .attr("y", -60)
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese(%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
           // get value of selection
           var value = d3.select(this).attr("value");

           if (value !== chosenXAxis) {
               
              // replaces chosenXAxis with value
              chosenXAxis = value;

              console.log(chosenXAxis)
              
              // updates x scale for new data
              xLinearScale = xScale(data, chosenXAxis);
              
              // updates x axis with transition
              xAxis = renderXAxes(xLinearScale, xAxis);
              
              // updates circles with new new x values
              circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

              // updates tooltips with new values
              circlesGroup = updateToolTip(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
              
              // updates text on circles  with new x values
              circlesText = renderLabels(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
              
              // changes classes to change bold text
              if (chosenXAxis === "poverty") {
                povertyLabel
                  .classed("active", true)
                  .classed("inactive", false);
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
            } else if (chosenXAxis === "age") {
                povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
                ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
            } else {
                povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
                ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
                incomeLabel
                  .classed("active", true)
                  .classed("inactive", false);
        }
      }
    });

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
      .on("click", function() {
          
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
            
            // replaces chosenXAxis with value
            chosenYAxis = value;
            
            console.log(chosenYAxis)
            
            // updates y scale for new data
            yLinearScale = yScale(data, chosenYAxis);

            // updates x axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);
            
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
            
            // updates text on circles  with new x values
            circlesText = renderText(circlesText, yLinearScale, chosenYAxis)
            
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            
            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthcareLabel
                  .classed("active", true)
                  .classed("inactive", false);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
            } else if (chosenYAxis === "smokes") {
                healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", true)
                  .classed("inactive", false);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
            } else {
                healthcareLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
  console.log(error);
});