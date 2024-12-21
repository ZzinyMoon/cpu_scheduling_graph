import React from "react";
import { Bar } from "react-chartjs-2";

const tasks = [
  { id: 1, arrivalTime: 0, burstTime: 4 },
  { id: 2, arrivalTime: 1, burstTime: 1 },
  { id: 3, arrivalTime: 2, burstTime: 2 },
];

const ganttChart = [
  { task: tasks[1], start: 1, end: 2, burstTime: 1, responseTime: 0 },
  { task: tasks[2], start: 2, end: 4, burstTime: 2, responseTime: 0 },
  { task: tasks[0], start: 4, end: 8, burstTime: 4, responseTime: 4 },
];

const chartData = {
  labels: ganttChart.map((entry, index) => `작업 ${index + 1}`),
  datasets: [
    {
      label: "작업 실행 시간",
      data: ganttChart.map((entry) => entry.end - entry.start),
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
      base: ganttChart.map((entry) => entry.start),
    },
  ],
};

const chartOptions = {
  indexAxis: "y",
  scales: {
    x: {
      title: {
        display: true,
        text: "시간 (초)",
      },
      min: 0,
      max: Math.max(...ganttChart.map((entry) => entry.end)) + 1,
    },
    y: {
      title: {
        display: true,
        text: "작업",
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const task = ganttChart[context.dataIndex];
          return [
            `시작 시간: ${task.start}s`,
            `종료 시간: ${task.end}s`,
            `버스트 시간: ${task.burstTime}s`,
            `응답 시간: ${task.responseTime}s`,
          ];
        },
      },
    },
  },
};

const GanttChart = () => {
  return (
    <div>
      <h2>Gantt 차트</h2>
      <Bar data={chartData} options={chartOptions} />
      <div>
        <h2>작업 세부 사항</h2>
        <ul>
          {ganttChart.map((entry, index) => (
            <li key={index}>
              <strong>
                작업 {index + 1} (작업 리스트에서{" "}
                {tasks.findIndex((task) => task.id === entry.task.id) + 1}번째
                작업):
              </strong>
              <ul>
                <li>시작 시간: {entry.start}s</li>
                <li>종료 시간: {entry.end}s</li>
                <li>버스트 시간: {entry.burstTime}s</li>
                <li>응답 시간: {entry.responseTime}s</li>
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GanttChart;
