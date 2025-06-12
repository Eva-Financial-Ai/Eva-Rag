
// Mock all the chart components from recharts
const MockResponsiveContainer: React.FC<any> = ({ children, ...props }) => (
  <div data-testid="responsive-container" {...props}>
    {children}
  </div>
);

const MockLineChart: React.FC<any> = ({ children, ...props }) => (
  <div data-testid="line-chart" {...props}>
    {children}
  </div>
);

const MockLine: React.FC<any> = props => <div data-testid="line" {...props} />;

const MockAreaChart: React.FC<any> = ({ children, ...props }) => (
  <div data-testid="area-chart" {...props}>
    {children}
  </div>
);

const MockArea: React.FC<any> = props => <div data-testid="area" {...props} />;

const MockBarChart: React.FC<any> = ({ children, ...props }) => (
  <div data-testid="bar-chart" {...props}>
    {children}
  </div>
);

const MockBar: React.FC<any> = props => <div data-testid="bar" {...props} />;

const MockPieChart: React.FC<any> = ({ children, ...props }) => (
  <div data-testid="pie-chart" {...props}>
    {children}
  </div>
);

const MockPie: React.FC<any> = props => <div data-testid="pie" {...props} />;

const MockCell: React.FC<any> = props => <div data-testid="cell" {...props} />;

const MockXAxis: React.FC<any> = props => <div data-testid="x-axis" {...props} />;

const MockYAxis: React.FC<any> = props => <div data-testid="y-axis" {...props} />;

const MockCartesianGrid: React.FC<any> = props => <div data-testid="cartesian-grid" {...props} />;

const MockTooltip: React.FC<any> = props => <div data-testid="tooltip" {...props} />;

const MockLegend: React.FC<any> = props => <div data-testid="legend" {...props} />;

const MockComposedChart: React.FC<any> = ({ children, ...props }) => (
  <div data-testid="composed-chart" {...props}>
    {children}
  </div>
);

const MockRadarChart: React.FC<any> = ({ children, ...props }) => (
  <div data-testid="radar-chart" {...props}>
    {children}
  </div>
);

const MockRadar: React.FC<any> = props => <div data-testid="radar" {...props} />;

const MockPolarGrid: React.FC<any> = props => <div data-testid="polar-grid" {...props} />;

const MockPolarAngleAxis: React.FC<any> = props => (
  <div data-testid="polar-angle-axis" {...props} />
);

const MockPolarRadiusAxis: React.FC<any> = props => (
  <div data-testid="polar-radius-axis" {...props} />
);

const MockScatter: React.FC<any> = props => <div data-testid="scatter" {...props} />;

const MockScatterChart: React.FC<any> = ({ children, ...props }) => (
  <div data-testid="scatter-chart" {...props}>
    {children}
  </div>
);

const MockReferenceLine: React.FC<any> = props => <div data-testid="reference-line" {...props} />;

const MockReferenceArea: React.FC<any> = props => <div data-testid="reference-area" {...props} />;

const MockBrush: React.FC<any> = props => <div data-testid="brush" {...props} />;

const MockRadialBarChart: React.FC<any> = ({ children, ...props }) => (
  <div data-testid="radial-bar-chart" {...props}>
    {children}
  </div>
);

const MockRadialBar: React.FC<any> = props => <div data-testid="radial-bar" {...props} />;

// Export all components
export const ResponsiveContainer = MockResponsiveContainer;
export const LineChart = MockLineChart;
export const Line = MockLine;
export const AreaChart = MockAreaChart;
export const Area = MockArea;
export const BarChart = MockBarChart;
export const Bar = MockBar;
export const PieChart = MockPieChart;
export const Pie = MockPie;
export const Cell = MockCell;
export const XAxis = MockXAxis;
export const YAxis = MockYAxis;
export const CartesianGrid = MockCartesianGrid;
export const Tooltip = MockTooltip;
export const Legend = MockLegend;
export const ComposedChart = MockComposedChart;
export const RadarChart = MockRadarChart;
export const Radar = MockRadar;
export const PolarGrid = MockPolarGrid;
export const PolarAngleAxis = MockPolarAngleAxis;
export const PolarRadiusAxis = MockPolarRadiusAxis;
export const Scatter = MockScatter;
export const ScatterChart = MockScatterChart;
export const ReferenceLine = MockReferenceLine;
export const ReferenceArea = MockReferenceArea;
export const Brush = MockBrush;
export const RadialBarChart = MockRadialBarChart;
export const RadialBar = MockRadialBar;

// Export default object for named imports
const recharts = {
  ResponsiveContainer: MockResponsiveContainer,
  LineChart: MockLineChart,
  Line: MockLine,
  AreaChart: MockAreaChart,
  Area: MockArea,
  BarChart: MockBarChart,
  Bar: MockBar,
  PieChart: MockPieChart,
  Pie: MockPie,
  Cell: MockCell,
  XAxis: MockXAxis,
  YAxis: MockYAxis,
  CartesianGrid: MockCartesianGrid,
  Tooltip: MockTooltip,
  Legend: MockLegend,
  ComposedChart: MockComposedChart,
  RadarChart: MockRadarChart,
  Radar: MockRadar,
  PolarGrid: MockPolarGrid,
  PolarAngleAxis: MockPolarAngleAxis,
  PolarRadiusAxis: MockPolarRadiusAxis,
  Scatter: MockScatter,
  ScatterChart: MockScatterChart,
  ReferenceLine: MockReferenceLine,
  ReferenceArea: MockReferenceArea,
  Brush: MockBrush,
  RadialBarChart: MockRadialBarChart,
  RadialBar: MockRadialBar,
};

export default recharts;
