'use strict';

const plotWidth = 900;
const plotHeight = 500;
const plotPadding = 40;

function fetchGDP() {
    return fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
        .then(response => response.json());
}

function setPlotSize() {
    d3.select('#plot')
        .attr('width', plotWidth)
        .attr('height', plotHeight);
}

function handleMouseOver(event, {Name, Nationality, Year, Seconds, Doping}) {
    const offset = 10;

    d3.select('.tooltip')
        .html(`<span>${Name}: ${Nationality}</span>
                <span>${Year} / Time: ${secondsToMinutes(Seconds)}</span>
                ${Doping ? `<span class="doping-desc">${Doping}</span>` : ''}`)
        .style('top', `${event.clientY + offset}px`)
        .style('left', `${event.clientX + offset}px`)
        .attr('data-year', Year)
        .classed('hidden', false)
}

function handleMouseOut() {
    d3.select('.tooltip')
        .classed('hidden', true)
}

function getXScale(data) {
    return d3
        .scaleLinear()
        .domain([data[0].Year - 2, data[data.length - 1].Year + 3])
        .range([plotPadding, plotWidth - plotPadding]);
}

function getYScale(data) {
    const axisPadding = 5;

    return d3
        .scaleLinear()
        .domain([data[0].Seconds - axisPadding, data[data.length - 1].Seconds + axisPadding])
        .range([plotHeight - (plotPadding * 2), 0]);
}

function renderXAxis(xScale) {
    const xAxis = d3.axisBottom(xScale).tickFormat(year => year);

    d3.select('#plot')
        .append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${plotHeight - plotPadding})`)
        .call(xAxis);
}

function secondsToMinutes(seconds) {
    return `${Math.floor(seconds / 60)}:${seconds % 60 || '00'}`;
}

function renderYAxis(yScale) {
    const yAxisScale = yScale.range([0, plotHeight - (plotPadding * 2),])
    const yAxis = d3.axisLeft(yAxisScale).tickFormat(secondsToMinutes)

    d3.select('#plot')
        .append('g')
        .attr('id', 'y-axis')
        .attr('transform', `translate(${plotPadding}, ${plotPadding})`)
        .call(yAxis)
}

function renderPoints(data) {
    const xScale = getXScale(data)
    const yScale = getYScale(data)

    d3.select('#plot')
        .selectAll('rect')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', ({Doping}) => `dot ${Doping ? 'doping' : ''}`)
        .attr('data-xvalue', ({Year}) => Year)
        .attr('data-yvalue', ({Time}) => {
            const parsedTime = Time.split(':');

            return new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]).toISOString();
        })
        .attr('r', 4)
        .attr('cx', ({Year}) => xScale(Year))
        .attr('cy', ({Seconds}) => plotHeight - plotPadding - yScale(Seconds))
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    renderXAxis(xScale)
    renderYAxis(yScale)
}

function renderLegend() {
    const plot = d3.select('#plot');

    plot.append('rect').attr('x', 700).attr('y', 40).attr('width', 10).attr('height', 10).attr('class', 'legend-doping');
    plot.append('rect').attr('x', 700).attr('y', 60).attr('width', 10).attr('height', 10).attr('class', 'legend-clean');
    plot.append('text').attr('x', 715).attr('y', 48).attr('class', 'legend-desc').attr('id', 'legend').text('Riders with doping allegations');
    plot.append('text').attr('x', 715).attr('y', 68).attr('class', 'legend-desc').attr('id', 'legend').text('No doping allegations');
}

setPlotSize();
renderLegend()

fetchGDP()
    .then(result => {
        renderPoints(result);

    })
    .catch(error => {
        console.warn(error);
    })
