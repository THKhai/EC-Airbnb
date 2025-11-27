"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface SalesOverviewChartProps {
  data: { month: string; expected: number; actual: number }[]
}

export function NewSalesOverviewChart({ data }: SalesOverviewChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    if (!data.length) {
      svg.append("text")
        .attr("x", 350)
        .attr("y", 150)
        .attr("text-anchor", "middle")
        .text("No sales data available")
        .style("fill", "#6B7280");
      return;
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 700 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom

    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3.scalePoint()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.5)

    const maxValue = d3.max(data, d => Math.max(d.expected, d.actual)) ?? 1000
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.2])
      .range([height, 0])
      .nice() // Ensure nice, rounded tick values

    // Define area generators
    const areaActual = d3.area<{ month: string; expected: number; actual: number }>()
      .x(d => x(d.month) ?? 0)
      .y0(height)
      .y1(d => y(d.actual))
      .curve(d3.curveMonotoneX)

    const areaExpected = d3.area<{ month: string; expected: number; actual: number }>()
      .x(d => x(d.month) ?? 0)
      .y0(height)
      .y1(d => y(d.expected))
      .curve(d3.curveMonotoneX)

    // Add gradients for areas
    const defs = svg.append("defs")

    const gradientActual = defs.append("linearGradient")
      .attr("id", "gradientActual")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%")
    gradientActual.append("stop").attr("offset", "0%").attr("stop-color", "#6EE7B7").attr("stop-opacity", 0.6)
    gradientActual.append("stop").attr("offset", "100%").attr("stop-color", "#6EE7B7").attr("stop-opacity", 0.1)

    const gradientExpected = defs.append("linearGradient")
      .attr("id", "gradientExpected")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%")
    gradientExpected.append("stop").attr("offset", "0%").attr("stop-color", "#93C5FD").attr("stop-opacity", 0.6)
    gradientExpected.append("stop").attr("offset", "100%").attr("stop-color", "#93C5FD").attr("stop-opacity", 0.1)

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

    // Add areas with animation
    g.append("path")
      .datum(data)
      .attr("fill", "url(#gradientExpected)")
      .attr("d", areaExpected)
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1)

    g.append("path")
      .datum(data)
      .attr("fill", "url(#gradientActual)")
      .attr("d", areaActual)
      .style("opacity", 0)
      .transition()
      .delay(500)
      .duration(1000)
      .style("opacity", 1)

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6B7280")

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${Number(d).toLocaleString('vi-VN')} đ`))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6B7280")

    // Add legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 120}, 10)`);
    legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 10).attr("fill", "#10B981");
    legend.append("text").attr("x", 15).attr("y", 10).text("Actual").style("font-size", "12px").style("fill", "#6B7280");
    legend.append("rect").attr("x", 0).attr("y", 20).attr("width", 10).attr("height", 10).attr("fill", "#3B82F6");
    legend.append("text").attr("x", 15).attr("y", 30).text("Expected").style("font-size", "12px").style("fill", "#6B7280");

    // Add tooltips with rounding
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "sales-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)

    g.selectAll(".dot-actual")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot-actual")
      .attr("cx", d => x(d.month) ?? 0)
      .attr("cy", d => y(d.actual))
      .attr("r", 4)
      .attr("fill", "#10B981")
      .style("cursor", "pointer")
      .on("mouseover", (event: MouseEvent, d) => {
        tooltip.transition().duration(200).style("opacity", 1)
        tooltip
          .html(`Month: ${d.month}<br/>Actual Sales: ${Math.round(d.actual).toLocaleString('vi-VN')} đ`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`)
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0)
      })

    g.selectAll(".dot-expected")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot-expected")
      .attr("cx", d => x(d.month) ?? 0)
      .attr("cy", d => y(d.expected))
      .attr("r", 4)
      .attr("fill", "#3B82F6")
      .style("cursor", "pointer")
      .on("mouseover", (event: MouseEvent, d) => {
        tooltip.transition().duration(200).style("opacity", 1)
        tooltip
          .html(`Month: ${d.month}<br/>Expected Sales: ${Math.round(d.expected).toLocaleString('vi-VN')} đ`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`)
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0)
      })

    return () => {
      d3.selectAll(".sales-tooltip").remove()
    }
  }, [data])

  const totalActual = data.reduce((sum, d) => sum + (typeof d.actual === 'number' ? d.actual : 0), 0)
  const totalExpected = data.reduce((sum, d) => sum + (typeof d.expected === 'number' ? d.expected : 0), 0)
  const totalSalesIncrease = totalActual - totalExpected
  const salesIncreasePercentage = totalExpected > 0 ? (totalSalesIncrease / totalExpected) * 100 : 0
  const increaseColor = salesIncreasePercentage > 0 ? 'green' : salesIncreasePercentage < 0 ? 'red' : 'gray'

  return (
    <Card className="border border-gray-200 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Sales Overview</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          <span className={`text-${increaseColor}-600`}>
            ({salesIncreasePercentage > 0 ? '+' : salesIncreasePercentage < 0 ? '-' : ''}{Math.abs(salesIncreasePercentage).toFixed(0)}%)
          </span> {salesIncreasePercentage > 0 ? 'more' : salesIncreasePercentage < 0 ? 'less' : 'equal'} in 2025
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[250px] w-full">
          <svg ref={svgRef} className="w-full h-full"></svg>
        </div>
      </CardContent>
    </Card>
  )
}