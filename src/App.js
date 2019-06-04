import React, { useState, useRef, useEffect } from 'react'
import { useNumberKnob, Inspector } from 'retoggle'
import Group from './Group'
import { scaleLinear, scaleOrdinal } from 'd3-scale'
import { tap, curry, pluck } from 'ramda'
import useDims from './useDims'
import {
  treemap as d3treemap,
  hierarchy as d3hierarchy,
  treemapResquarify,
  treemapSquarify
} from 'd3-hierarchy'
import Tile from './Tile'
import { colors } from './colors'
import { useTransition, animated } from 'react-spring'
import data from './companyData.json'
const peek = tap(x => console.log(x))
const colorScale = scaleOrdinal()
const height = 900
const width = 1600
const tileFn = treemapResquarify
const getValue = d => d.value
const colorDomain = [
  'Electrical engineering',
  'Instruments',
  'Mechanical engineering',
  'Chemistry',
  'Other fields'
]
const levels = ['root', 'industries', 'fields', 'companies']

function App() {
  const [number, setNumber] = useNumberKnob('Number', 0)
  const { margin, innerHeight, innerWidth } = useDims(width, height)

  const treemapingFn = d3treemap(tileFn)
    .tile(tileFn)
    .size([innerWidth, innerHeight])
    .round(false)
  const [structuredInput, setInput] = useState(
    d3hierarchy(data)
      .sum(getValue)
      .sort(function(a, b) {
        return b.height - a.height || b.value - a.value
      })
  )
  const tiles = treemapingFn(structuredInput).leaves()
  const colorScale = scaleOrdinal()
    .range(colors)
    .domain(colorDomain)
    .unknown('none')

  return (
    <>
      <Inspector usePortal={false} />
      {number}
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          {tiles.map(tile => {
            const {
              x0,
              x1,
              y0,
              y1,
              data: { id }
            } = tile
            return (
              <Tile
                key={id}
                width={x1 - x0}
                height={y1 - y0}
                x={x0}
                y={y0}
                stroke="black"
                fill={colorScale(tile.data.ancestors[1])}
                onClick={() => {
                  setInput(
                    d3hierarchy(tile.parent.parent.data)
                      .sum(getValue)
                      .sort(function(a, b) {
                        return b.height - a.height || b.value - a.value
                      })
                  )
                }}
              />
            )
          })}
        </Group>
      </svg>
    </>
  )
}

export default App
