import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import "./index.css";

window.onload = async () => {
  const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
  const data = await fetch(dataUrl);
  const json = await data.json();
  init(json)
}

const init = (exData) => {
  
  const App = () => (
    <div id="parentWrapper">
      <h1 id="title">
      Doping in Professional Bicycle Racing<br/>
      <span>35 Fastest times up Alpe d'Huez</span>
      </h1>
      <div id="plotWrapper">
        <div id="plot">
        </div>
      </div>
    </div>
  );
  
  ReactDOM.render(<App/>, document.getElementById("root"));
  
  // CONSTANTS ↓
  const w=800, h=500, vpad=20, hpad=50; // hpad: horizontal padding, vpad: vertical padding
  const data = [...exData];
      //data: { Doping, Name, Nationality, Place, Seconds, Time, URL, Year}
  // CONSTANTS ↑
  const plot = d3
                .select("#plot")
                .attr("width", w)
                .attr("height", h)
                .style("position", "relative");
  const plotSvg = d3
                    .select("#plot")
                    .append("svg")
                    .classed("plotSvg", true)
                    .attr("width", w)
                    .attr("height", h);
  
  // Dealing with Years ↓↓↓                
  const parseYear = d3.timeParse("%Y");// Parsing function
  
  const stYear = parseYear(d3.min(data, d=>d.Year));// stYear, 1st Year
  stYear.setFullYear(stYear.getFullYear()-1);// Reducing Year
  
  const ltYear = parseYear(d3.max(data, d=>d.Year));// ltYear, last Year
  ltYear.setFullYear(ltYear.getFullYear()+1);// Adding Year
  
  // Why reducing and adding years?(for the xAxis, to keep distance at the start and the end)
  
  // Dealing with Years ↑↑↑
  
  const xScale = d3
                  .scaleTime()
                  .domain([stYear, ltYear])
                  .range([hpad, w-hpad]);
  
  // Dealing with Time(seconds) ↓↓↓
  const parseSeconds = d3.timeParse("%s");
  const stSeconds = parseSeconds(d3.min(data, d=>d.Seconds));// stSeconds, 1st Year
  stSeconds.setSeconds(stSeconds.getSeconds());
  const ltSeconds = parseSeconds(d3.max(data, d=>d.Seconds));// ltSeconds, last Year
  ltSeconds.setSeconds(ltSeconds.getSeconds());
  // Dealing with Time(seconds) ↑↑↑
  
  const yScale = d3
                  .scaleTime()
                  .domain([stSeconds, ltSeconds])
                  .range([vpad, h-vpad]);
  
  // Axis ↓
  
  const xAxis = d3.axisBottom(xScale);
  
  const yAxis = d3.axisLeft(yScale)
                  .tickFormat(d=>d3.timeFormat("%M:%S")(d));// %M:%S for Minutes:Seconds
  
  // Axis ↑
  
  // Drawing Axis ↓↓↓
  plotSvg
        .append("g")
        .attr("transform", `translate(0, ${h-vpad})`)
        .attr("id", "x-axis")
        .call(xAxis);
  plotSvg
        .append("g")
        .attr("transform", `translate(${hpad}, 0)`)
        .attr("id", "y-axis")
        .call(yAxis);
  // Drawing Axis ↑↑↑
  
  const handleMouseOver = (e, d) => {
  
    const minute = d.Time.replace(":", "");// to remove ":" from time(MM:SS)
    let direction = {
                      w: "left"
                      , h: "top"
                      , wSize: xScale(parseYear(d.Year))+15
                      , hSize: yScale(parseSeconds(d.Seconds))+10
                    };
  
    if (d.Year > 2006) {
      direction.w = "right";
      direction.wSize = w-(direction.wSize-15)+15;
    }
    if (minute > 3830) {
      direction.h = "bottom";
      direction.hSize = h-(direction.hSize-10)+10;
    }
  
    plot
      .append("div")
      .attr("id", "tooltip")
      .attr("data-year", parseYear(d.Year))
      .style("position", "absolute")
      .style(direction.w, direction.wSize)
      .style(direction.h, direction.hSize)
      .style("background", d.Doping ? "rgba(32, 76, 199, .7)":"rgba(255, 166, 0, .7)")
      .html(`
      ${d.Name}: ${d.Nationality}<br/>
      Year: ${d.Year},<br/>
      Time: ${d.Time}<br/>
      <br/>
      ${d.Doping}
      `);
  }
  const handleMouseOut = () => {
    plot.select("#tooltip").remove();
  }
  
  plotSvg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d=>xScale(parseYear(d.Year)))
      .attr("cy", d=>yScale(parseSeconds(d.Seconds)))
      .attr("r", 5)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", d=>d.Doping ? "rgba(32, 76, 199, .7)":"rgba(255, 166, 0, .7)")
      .classed("dot", true)
      .attr("data-xvalue", d=>parseYear(d.Year))
      .attr("data-yvalue", d=>parseSeconds(d.Seconds))
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
  
  plotSvg
      .append("g")
      .attr("id", "yAxisLabel")
      .attr("transform", `rotate(-90), translate(${-h/2}, 11)`)
      .append("text")
      .text("Time in Minutes");
  
  plot // plot legend
    .append("div")
    .attr("id", "legend")
    .style("top", h/2-30)
    .style("left", w-w/3.5)
    .style("position", "absolute")
    .html(`
    <div class="instructions">
      <span class="iText">No doping allegations</span>
      <span id="blueSq"></span>
    </div>
    <div class="instructions">
      <span class="iText">Riders with doping allegations</span>
      <span id="orangeSq"></span>
    </div>
    `);
}