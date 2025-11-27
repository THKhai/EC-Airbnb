"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import type { OccupancyDataPoint } from "@/types/host"

interface OccupancyChartProps {
  data: OccupancyDataPoint[]
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("daily")

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const filteredData = data.filter(d => d.period === selectedPeriod)

    if (!filteredData.length) {
      svg.append("text")
        .attr("x", 400)
        .attr("y", 175)
        .attr("text-anchor", "middle")
        .text("No occupancy data for this period")
        .style("fill", "#6B7280");
      return;
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 800 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Parse dates and create scales
    const parseTime = d3.timeParse("%Y-%m-%d")
    const processedData = filteredData.map(d => ({
      ...d,
      date: parseTime(d.date) || new Date(),
    }))

    // Use full data range for all periods
    const timeRange = d3.extent(processedData, d => d.date) as [Date, Date];
    if (!timeRange[0] || !timeRange[1]) return; // Safety check for invalid extent

    const x = d3
      .scaleTime()
      .domain(timeRange)
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height, 0])
      .nice()

    // Create line generator
    const line = d3
      .line<typeof processedData[0]>()
      .x(d => x(d.date))
      .y(d => y(d.occupancyRate))
      .curve(d3.curveMonotoneX)

    // Create area generator
    const area = d3
      .area<typeof processedData[0]>()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.occupancyRate))
      .curve(d3.curveMonotoneX)

    // Add gradient
    const defs = svg.append("defs")
    const gradient = defs
      .append("linearGradient")
      .attr("id", "occupancyGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0)
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3B82F6").attr("stop-opacity", 0.1)
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#3B82F6").attr("stop-opacity", 0.6)

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(() => ""))
      .selectAll("line")
      .style("stroke", "#E5E7EB")
      .style("stroke-width", 1)

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ""))
      .selectAll("line")
      .style("stroke", "#E5E7EB")
      .style("stroke-width", 1)

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(selectedPeriod === "monthly" ? d3.timeMonth.every(1) : selectedPeriod === "weekly" ? 15 : 30) // 30 ticks for daily
        .tickFormat((domainValue: Date | d3.NumberValue) => {
          if (selectedPeriod === "monthly") return d3.timeFormat("%b %Y")(domainValue as Date);
          if (selectedPeriod === "weekly") return d3.timeFormat("%d/%m/%Y")(domainValue as Date);
          return d3.timeFormat("%d/%m")(domainValue as Date);
        }))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6B7280")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end") // Rotate labels to prevent overlap

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${Number(d).toFixed(1)}%`))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6B7280")

    // Add area with animation
    const areaPath = g.append("path")
      .datum(processedData)
      .attr("fill", "url(#occupancyGradient)")
      .attr("d", area)
    const totalLength = (areaPath.node() as SVGPathElement).getTotalLength()
    areaPath
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1)

    // Add line with animation
    const linePath = g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("d", line)
    const lineLength = (linePath.node() as SVGPathElement).getTotalLength()
    linePath
      .attr("stroke-dasharray", `${lineLength} ${lineLength}`)
      .attr("stroke-dashoffset", lineLength)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)

    // Add dots with sampling for performance (if > 100 points)
    const sampledData = processedData.length > 100 
      ? processedData.filter((_, i) => i % Math.ceil(processedData.length / 100) === 0) 
      : processedData;
    g.selectAll(".dot")
      .data(sampledData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.occupancyRate))
      .attr("r", 0)
      .style("fill", "#3B82F6")
      .style("stroke", "white")
      .style("stroke-width", 2)
      .transition()
      .duration(300)
      .delay((d, i) => i * 50 + 1000) // Giảm delay để nhanh hơn với data lớn
      .attr("r", 4)

    // Add tooltips with rounding
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "occupancy-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)

    g.selectAll(".dot")
      .on("mouseover", (event: MouseEvent, d: any) => {
        tooltip.transition().duration(200).style("opacity", 1)
        tooltip
          .html(`Date: ${d3.timeFormat("%B %d, %Y")(d.date)}<br/>Occupancy: ${d.occupancyRate.toFixed(1)}%`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`)
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0)
      })

    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 120}, 10)`);
    legend.append("line").attr("x1", 0).attr("y1", 5).attr("x2", 10).attr("y2", 5).attr("stroke", "#3B82F6").attr("stroke-width", 2);
    legend.append("text").attr("x", 15).attr("y", 10).text("Occupancy Rate").style("font-size", "12px").style("fill", "#6B7280");

    // Cleanup tooltip on unmount
    return () => {
      d3.selectAll(".occupancy-tooltip").remove()
    }
  }, [data, selectedPeriod])

  return (
    <Card className="border border-gray-200 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Occupancy Over Time</h3>
          <div className="flex space-x-2">
            {(["daily", "weekly", "monthly"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="capitalize"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
        <div className="h-[350px]"> {/* Tăng để fit dữ liệu dài */}
          <svg ref={svgRef} className="w-full h-full"></svg>
        </div>
      </CardContent>
    </Card>
  )
}