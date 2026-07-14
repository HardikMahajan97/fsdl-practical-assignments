import React, { useState, useEffect, useRef } from 'react';
import ReactFC from 'react-fusioncharts';
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';
import Widgets from 'fusioncharts/fusioncharts.widgets';
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import * as d3 from 'd3';

// Register FusionCharts
ReactFC.fcRoot(FusionCharts, Charts, Widgets, FusionTheme);

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// D3 Category Chart Component
const D3CategoryChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerWidth = svgRef.current.parentElement.clientWidth;
    const width = Math.min(containerWidth - 40, 500);
    const height = 280;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    const categories = Object.keys(data);
    const values = Object.values(data);
    const maxValue = d3.max(values) || 1;

    const x = d3.scaleBand()
      .domain(categories)
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, maxValue + 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
      .domain(categories)
      .range(['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b']);

    svg.attr('width', width)
       .attr('height', height);

    // Create bars with animation
    svg.selectAll('rect')
      .data(categories)
      .join('rect')
      .attr('x', d => x(d))
      .attr('y', height - margin.bottom)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', d => colorScale(d))
      .attr('rx', 4)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('y', d => y(data[d]))
      .attr('height', d => y(0) - y(data[d]));

    // Add value labels on top of bars
    svg.selectAll('.value-label')
      .data(categories)
      .join('text')
      .attr('class', 'value-label')
      .attr('x', d => x(d) + x.bandwidth() / 2)
      .attr('y', d => y(data[d]) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#4b5563')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('opacity', 0)
      .text(d => data[d])
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 400)
      .attr('opacity', 1);

    // X axis
    const xAxis = d3.axisBottom(x);
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280');

    // Y axis
    const yAxis = d3.axisLeft(y).ticks(5);
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280');

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-(width - margin.left - margin.right)).tickFormat(''))
      .selectAll('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-opacity', 0.5);

  }, [data]);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ display: 'block', margin: '0 auto' }} />
    </div>
  );
};

// Main Task Manager Component
export default function TaskManager() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete project documentation', completed: false, priority: 'high', category: 'Work' },
    { id: 2, title: 'Review code changes', completed: true, priority: 'medium', category: 'Work' },
    { id: 3, title: 'Team meeting at 3 PM', completed: false, priority: 'high', category: 'Meeting' },
    { id: 4, title: 'Grocery shopping', completed: false, priority: 'low', category: 'Personal' },
    { id: 5, title: 'Gym workout', completed: true, priority: 'medium', category: 'Personal' },
    { id: 6, title: 'Update presentation slides', completed: false, priority: 'medium', category: 'Work' },
    { id: 7, title: 'Client call follow-up', completed: true, priority: 'high', category: 'Meeting' },
  ]);
  
  const [newTask, setNewTask] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [selectedCategory, setSelectedCategory] = useState('Work');
  const [showDashboard, setShowDashboard] = useState(true);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        title: newTask,
        completed: false,
        priority: selectedPriority,
        category: selectedCategory
      }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Chart data calculations
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  
  const priorityCounts = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  const categoryCounts = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Chart.js Bar Chart Data
  const barChartData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [{
      label: 'Number of Tasks',
      data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',
        'rgba(251, 191, 36, 0.7)',
        'rgba(34, 197, 94, 0.7)',
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(251, 191, 36)',
        'rgb(34, 197, 94)',
      ],
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false 
      },
      title: { 
        display: false 
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { 
          stepSize: 1,
          font: { size: 12 },
          color: '#6b7280'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: { size: 12 },
          color: '#6b7280'
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Chart.js Doughnut Chart Data
  const doughnutChartData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [completedCount, pendingCount],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(251, 191, 36)',
      ],
      borderWidth: 2,
    }]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 13 },
          color: '#4b5563',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      }
    },
    cutout: '65%',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Task Manager Pro
              </h1>
              <p className="text-gray-600 mt-2">Organize your work and track your productivity</p>
            </div>
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              {showDashboard ? 'Hide Analytics' : 'Show Analytics'}
            </button>
          </div>
        </div>

        {/* Dashboard Section with Charts */}
        {showDashboard && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18"></path>
                  <path d="M18 17V9"></path>
                  <path d="M13 17V5"></path>
                  <path d="M8 17v-3"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="text-blue-600 text-sm font-semibold mb-1">Total Tasks</div>
                <div className="text-3xl font-bold text-blue-700">{tasks.length}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="text-green-600 text-sm font-semibold mb-1">Completed</div>
                <div className="text-3xl font-bold text-green-700">{completedCount}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="text-orange-600 text-sm font-semibold mb-1">Pending</div>
                <div className="text-3xl font-bold text-orange-700">{pendingCount}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="text-purple-600 text-sm font-semibold mb-1">Completion Rate</div>
                <div className="text-3xl font-bold text-purple-700">{completionRate}%</div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Task Completion Status - Chart.js Doughnut */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Task Completion Status
                </h3>
                <div className="h-64">
                  <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                </div>
              </div>

              {/* Chart 2: Priority Distribution - Chart.js Bar Chart */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Priority Distribution
                </h3>
                <div className="h-64">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>

              {/* Chart 3: Category Breakdown - D3.js */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Category Breakdown
                </h3>
                <D3CategoryChart data={categoryCounts} />
              </div>

              {/* Chart 4: Completion Rate - FusionCharts Gauge */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Completion Rate Gauge
                </h3>
                <ReactFC
                  type="angulargauge"
                  width="100%"
                  height="280"
                  dataFormat="json"
                  dataSource={{
                    chart: {
                      caption: "",
                      lowerLimit: "0",
                      upperLimit: "100",
                      theme: "fusion",
                      showValue: "1",
                      valueFontSize: "24",
                      valueFontBold: "1",
                      gaugeFillMix: "{dark-40},{light-40},{dark-20}",
                      pivotRadius: "8",
                      pivotFillColor: "#4f46e5",
                      showTickMarks: "1",
                      showTickValues: "1",
                      majorTMNumber: "9",
                      minorTMNumber: "4",
                      baseFontColor: "#4b5563",
                      chartTopMargin: "20",
                      chartBottomMargin: "30"
                    },
                    colorRange: {
                      color: [
                        { 
                          minValue: "0", 
                          maxValue: "35", 
                          code: "#ef4444",
                          label: "Low"
                        },
                        { 
                          minValue: "35", 
                          maxValue: "70", 
                          code: "#f59e0b",
                          label: "Medium"
                        },
                        { 
                          minValue: "70", 
                          maxValue: "100", 
                          code: "#22c55e",
                          label: "High"
                        }
                      ]
                    },
                    dials: {
                      dial: [{
                        value: completionRate,
                        borderColor: "#4f46e5",
                        borderThickness: "2"
                      }]
                    }
                  }}
                />
              </div>

            </div>
          </div>
        )}

        {/* Add Task Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            Add New Task
          </h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white"
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white"
            >
              <option value="Work">💼 Work</option>
              <option value="Personal">👤 Personal</option>
              <option value="Meeting">📅 Meeting</option>
              <option value="Other">📌 Other</option>
            </select>
            <button
              onClick={addTask}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 font-medium whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Task
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              Your Tasks
            </div>
            <span className="text-sm font-semibold px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </h2>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No tasks yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                    task.completed 
                      ? 'bg-gray-50 border-gray-200 opacity-75' 
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 transition-transform hover:scale-110"
                  >
                    {task.completed ? (
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-indigo-500 transition-colors"></div>
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-gray-800 break-words ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} {task.priority.toUpperCase()}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-semibold">
                        {task.category === 'Work' ? '💼' : task.category === 'Personal' ? '👤' : task.category === 'Meeting' ? '📅' : '📌'} {task.category}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}