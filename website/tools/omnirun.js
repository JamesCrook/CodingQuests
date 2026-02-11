/* ============================================
   OmniChart - Unified Charting Engine
   ============================================
   
   Includes:
   - OmniChart: Core rendering engine with presets
   - Algorithm classes: FFT, SmithWaterman, MultiGrid
*/

// ============================================================
// Algorithm Classes
// ============================================================

const FFT = (function() {
  const rows = 16;
  const cols = 5;

  const size = () => ({ rows, cols });

  // Returns cell state and its input connections
  // time is 0-100 representing progress
  const getCell = (row, col, time) => {
    const n = col * rows + row;
    const cellProgress = (n * 100) / (rows * cols);
    const isReady = cellProgress < time ? 1 : 0;

    const connections = [];

    if (col > 0) {
      const dftSize = 1 << (col - 1);
      const dDftSize = dftSize * 2;

      // Two inputs for FFT butterfly
      for (let input = 0; input < 2; input++) {
        const connectionProgress = ((n * 2 + input) * 100) / (2 * rows * cols);
        const connectionState = connectionProgress < time ? 1 : 0;

        const sourceRow = (input === 0) 
          ? row 
          : (row + dftSize) % dDftSize + Math.floor(row / dDftSize) * dDftSize;

        const bendDirection = input * 0.3 * (((row & dftSize) > 0) ? -1 : 1);

        connections.push({
          row: sourceRow,
          col: col - 1,
          state: connectionState,
          bendHint: bendDirection
        });
      }
    }

    return { isReady, connections };
  };

  return { size, getCell };
})();


const SmithWaterman = (function() {
  const rows = 12;
  const cols = 12;

  const size = () => ({ rows, cols });

  // Smith-Waterman fills in same order as FFT (column-major)
  // Each cell depends on (i-1,j), (i,j-1), (i-1,j-1)
  const getCell = (row, col, time) => {
    const n = (col-1) * (rows-1) + row;
    let cellProgress = (n * 100) / ((rows-1) * (cols-1));
    let isReady = (cellProgress < time ? 1 : 0) ;

    const connections = [];

    if (row > 0 && col > 0) {
      // Three dependencies for Smith-Waterman
      const deps = [
        { row: row - 1, col: col, bendHint: 0 },      // from above
        { row: row, col: col - 1, bendHint: 0 },      // from left
        { row: row - 1, col: col - 1, bendHint: 0 }   // from diagonal
      ];
      for (const dep of deps) {
        const connectionState = cellProgress <= time ? 1 : 0;
        cellProgress -= 0.34; // three connections

        connections.push({
          row: dep.row,
          col: dep.col,
          state: connectionState,
          bendHint: dep.bendHint
        });
      }
    } else {
      isReady = true;
    } 

    return { isReady, connections };
  };

  return { size, getCell };
})();


const MultiGrid = (function() {
  const levels = 4;
  const baseSize = 9;
  const rows = baseSize;
  const cols = baseSize;

  const size = () => ({ rows, cols });

  // Build the multigrid ordering: coarse to fine
  // Returns array of {row, col, level} in execution order
  const buildOrder = () => {
    const order = [];
    
    // For each V-cycle level (coarse to fine, then fine to coarse)
    for (let level = levels - 1; level >= 0; level--) {
      const step = 1 << level;
      for (let r = 0; r <rows; r += step) {
        for (let c = 0; c < cols; c += step) {
          order.push({ row: r, col: c, level });
        }
      }
    }
    
    // Reverse pass (fine to coarse) for full V-cycle
    for (let level = 1; level < levels; level++) {
      const step = 1 << level;
      for (let r = 0; r < rows; r += step) {
        for (let c = 0; c < cols; c += step) {
          order.push({ row: r, col: c, level, isUpward: true });
        }
      }
    }
    
    return order;
  };

  const executionOrder = buildOrder();

  // Find the index of a cell in the execution order
  const findCellIndex = (row, col, time) => {
    const totalCells = executionOrder.length;
    const currentIndex = Math.floor((time / 100) * totalCells);
    
    for (let i = 0; i < executionOrder.length; i++) {
      if (executionOrder[i].row === row && executionOrder[i].col === col) {
        return { index: i, entry: executionOrder[i], currentIndex };
      }
    }
    return { index: -1, entry: null, currentIndex };
  };

  const getCell = (row, col, time) => {
    const { index, entry, currentIndex } = findCellIndex(row, col, time);
    
    // Cell is ready if its first occurrence has been processed
    const isReady = (index !== -1 && index < currentIndex) ? 1 : 0;
    
    const connections = [];

    // Only show connections for the currently active cell
    const isCurrentCell = (index === currentIndex);
    
    if (isCurrentCell && entry) {
      const step = 1 << entry.level;
      
      // Connections from neighboring cells at same level
      const neighbors = [
        { row: row - step, col: col },
        { row: row + step, col: col },
        { row: row, col: col - step },
        { row: row, col: col + step }
      ];

      for (const n of neighbors) {
        if (n.row >= 0 && n.row < rows && n.col >= 0 && n.col < cols) {
          const { index: nIndex } = findCellIndex(n.row, n.col, time);
          const state = (nIndex !== -1 && nIndex < currentIndex) ? 1 : 0;
          
          connections.push({
            row: n.row,
            col: n.col,
            state,
            bendHint: 0
          });
        }
      }

      // Connection from coarser level (if in downward pass)
      if (!entry.isUpward && entry.level < levels - 1) {
        const coarseStep = 1 << (entry.level + 1);
        const coarseRow = Math.floor(row / coarseStep) * coarseStep;
        const coarseCol = Math.floor(col / coarseStep) * coarseStep;
        
        if (coarseRow !== row || coarseCol !== col) {
          connections.push({
            row: coarseRow,
            col: coarseCol,
            state: 1,
            bendHint: 0.2
          });
        }
      }
    }

    return { isReady, connections };
  };

  return { size, getCell };
})();


// ============================================================
// OmniRun Core Engine
// ============================================================

const OmniRun = (function() {
  
  const ALGORITHMS = {
    'FFT': FFT,
    'SmithWaterman': SmithWaterman,
    'MultiGrid': MultiGrid
  };

  let currentAlgorithm = 'FFT';

  const svgNS = 'http://www.w3.org/2000/svg';
  const createElement = (tag) => document.createElementNS(svgNS, tag);
  
  const generateData = (numCategories) => {
    return { algorithm: ALGORITHMS[currentAlgorithm] };
  };

  const setAlgorithm = (name) => {
    if (ALGORITHMS[name]) {
      currentAlgorithm = name;
    }
  };

  const getAlgorithm = () => {
    return ALGORITHMS[currentAlgorithm];
  };

  const getAlgorithmNames = () => Object.keys(ALGORITHMS);

  const calcUnifiedGeometry = (data, params, bounds, panZoom) => {
    const { zoom } = params;
    const scale = Math.pow(2, zoom - 1);

    const geometries = [];
    
    const chartCenter = V.create(bounds.cx + panZoom.panX, bounds.cy + panZoom.panY);
    const chartW = bounds.width * scale;
    const chartH = bounds.height * scale;
    
    const algorithm = getAlgorithm();
    const { rows, cols } = algorithm.size();
    
    const cellW = chartW / cols;
    const cellH = chartH / rows;
    const space = 14;
    const dimension = Math.min(cellW, cellH) *0.7;
    const theta = -Math.PI;

    const gridTopLeft = V.create(
      chartCenter.x - cellW * cols / 2, 
      chartCenter.y - cellH * rows / 2
    );
    const diagonal = V.create(dimension, dimension);
    const diag = V.scale(diagonal, 0.5);

    const location = (row, col) => {
      return V.create(
        gridTopLeft.x + col * cellW,
        gridTopLeft.y + row * cellH
      );
    };

    const shorten = (point, dist) => {
      let d = V.scale(V.normalize(V.sub(point[0], point[1])), -dist);
      return [V.add(point[0], d), V.sub(point[1], d)];
    };

    // Iterate over grid - this is the generic part
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const gridPos = location(row, col);
        
        // Query algorithm for cell state and connections
        const cellInfo = algorithm.getCell(row, col, params.time);
        
        // Draw cell
        let corners = [
          V.add(gridPos, diagonal),
          gridPos,
        ];

        corners = shorten( corners, 6)
        
        const cellColor = cellInfo.isReady > 0 ? '#4a4' : '#333';

        geometries.push({
          type: 'warpedpoly',
          corners,
          bends: [theta, theta],
          color: cellColor
        });
      
        geometries.push({
          type: 'label',
          x: gridPos.x + dimension / 2,
          y: gridPos.y + dimension / 2 + 5,
          text: `${row},${col}`,
          rotation: 0,
          angle: 0
        });

        // Draw connections from algorithm
        for (const conn of cellInfo.connections) {
          const sourcePos = location(conn.row, conn.col);
          const connectionColor = conn.state > 0 ? '#4a4' : '#333';
          const bend = conn.bendHint || 0;

          geometries.push({
            type: 'link',
            corners: shorten(
              [V.add(sourcePos, diag), V.add(gridPos, diag)], 
              dimension / 2
            ),
            bends: [bend, -bend],
            color: connectionColor
          });
        }
      }
    }
    
    return geometries;
  };
  
  const renderGeometries = (group, geoms, params) => {
    const { fillOpacity, strokeWidth, topWidth, linkWidth } = params;
    
    for (const g of geoms) {
      if (g.type === 'warpedpoly') {
        const pathD = WarpedPolygon.path(g.corners, g.bends);
        
        const path = createElement('path');
        path.setAttribute('d', pathD);
        path.setAttribute('fill', g.color);
        path.setAttribute('fill-opacity', g.opacity ?? fillOpacity);
        if (strokeWidth > 0) {
          path.setAttribute('stroke', g.color);
          path.setAttribute('stroke-width', strokeWidth);
        }
        group.appendChild(path);
        
        if (topWidth > 0) {
          const topD = WarpedPolygon.topPath(g.corners, g.bends);
          const topPath = createElement('path');
          topPath.setAttribute('d', topD);
          topPath.setAttribute('stroke', g.color);
          topPath.setAttribute('stroke-width', topWidth);
          topPath.setAttribute('stroke-linecap', 'round');
          topPath.setAttribute('fill', 'none');
          topPath.setAttribute('opacity', g.opacity ?? 1);
          group.appendChild(topPath);
        }
      } else if (g.type === 'label') {
        const text = createElement('text');
        text.setAttribute('x', g.x);
        text.setAttribute('y', g.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#888');
        text.setAttribute('font-size', '11px');
        if (g.opacity !== undefined) text.setAttribute('opacity', g.opacity);
        
        let textRot = 0;
        if (g.angle !== undefined) {
          let deg = (g.angle * 180 / Math.PI) % 360;
          if (deg < 0) deg += 360;
          textRot = (deg > 90 && deg < 270) ? deg + 180 : deg;
        } else if (g.rotation !== undefined && g.rotation !== 0) {
          let deg = (g.rotation * 180 / Math.PI) % 360;
          if (deg < 0) deg += 360;
          textRot = (deg >= 67.5 && deg < 112.5) ? -90 : (deg >= 247.5 && deg < 292.5) ? 90 : 0;
        }
        
        if (textRot !== 0) {
          text.setAttribute('transform', `rotate(${textRot}, ${g.x}, ${g.y})`);
        }
        
        text.textContent = g.text;
        group.appendChild(text);
      } else if (g.type === 'link') {
        const linkD = WarpedPolygon.path(g.corners, g.bends);
        const topPath = createElement('path');
        topPath.setAttribute('d', linkD);
        topPath.setAttribute('stroke', g.color);
        topPath.setAttribute('stroke-width', linkWidth ?? 1);
        topPath.setAttribute('stroke-linecap', 'round');
        topPath.setAttribute('fill', 'none');
        topPath.setAttribute('opacity', g.opacity ?? 1);
        group.appendChild(topPath);
      }
    }
  };
  
  const render = (svg, data, params, panZoom = { panX: 0, panY: 0 }) => {
    const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
    const width = viewBox[2];
    const height = viewBox[3];
    
    svg.innerHTML = '';
    
    const bounds = { cx: width / 2, cy: height / 2, width: width - 100, height: height - 100 };
    const mainGroup = createElement('g');
    
    const geoms = calcUnifiedGeometry(data, params, bounds, panZoom);
    renderGeometries(mainGroup, geoms, params);
    
    svg.appendChild(mainGroup);
  };

  const SLIDER_CONFIG = [
    { group: 'Presets', id: 'presets', abbrev: 'Pre', type: 'presets' },
    { group: 'Algorithm',
      id: 'algorithm',
      abbrev: 'Alg',
      type: 'select',
      selectId: 'algSelect',
      options: [
          { value: 'FFT', label: 'FFT' },
          { value: 'SmithWaterman', label: 'Smith Waterman' },
          { value: 'MultiGrid', label: 'MultiGrid' },
        ],
    },
    { group: 'Arrangement', id: 'arrangement', abbrev: 'Arr', sliders: [
      { id: 'lcars', label: 'LCARS', min: 1, max: 12, step: 1, default: 6, isData: true, dataValue: 6 },
    ]},
    { group: 'Style', id: 'style', abbrev: 'Sty', sliders: [
      { id: 'fillOpacity', label: 'fillOpacity', min: 0, max: 1, step: 0.01, default: 1 },
      { id: 'strokeWidth', label: 'strokeWidth', min: 0, max: 3, step: 0.1, default: 0 },
      { id: 'topWidth', label: 'topWidth', min: 0, max: 5, step: 0.1, default: 0 },
      { id: 'linkWidth', label: 'linkWidth', min: 0, max: 5, step: 0.1, default: 1.7 },
      { id: 'time', label: 'time', min: 0, max: 100, step: 1, default: 20 },
      { id: 'zoom', label: 'zoom', min: 0.25, max: 2, step: 0.01, default: 1 },
    ]},
  ];
  
  const PRESETS = {
    'Wide': {
      fillOpacity: 0.1, strokeWidth: 1.3, topWidth: 0, zoom: 1, linkWidth: 2, time: 30,
    },
    'Tight': {
      fillOpacity: 0.1, strokeWidth: 1.3, topWidth: 2, zoom: 0.28, linkWidth: 1, time: 50,
    },
    'Done': {
      fillOpacity: 0.1, strokeWidth: 1.3, topWidth: 0, zoom: 1, linkWidth: 2, time: 100,
    },
  };

  const DEFAULT = 'Wide';
  
  return { 
    render, 
    generateData, 
    SLIDER_CONFIG, 
    PRESETS, 
    DEFAULT,
    setAlgorithm,
    getAlgorithmNames
  };
})();

// Export for use in modules or global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { V, lerp, WarpedPolygon, OmniRun, FFT, SmithWaterman, MultiGrid };
} else if (typeof window !== 'undefined') {
  window.V = V;
  window.lerp = lerp;
  window.WarpedPolygon = WarpedPolygon;
  window.OmniRun = OmniRun;
  window.FFT = FFT;
  window.SmithWaterman = SmithWaterman;
  window.MultiGrid = MultiGrid;
}